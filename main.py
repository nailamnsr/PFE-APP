from fastapi import FastAPI, File, UploadFile ,HTTPException
import shutil
import os
from pydantic import BaseModel
import sqlite3
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from PIL import Image
import io
from utils import predict
from utils import hash_password, create_access_token,verify_password
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   
    allow_credentials=True,
    allow_methods=["*"],   
    allow_headers=["*"],   
)
UPLOAD_DIR = "temp_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)   
from torchvision import transforms

@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    try:
        print(f"Received file: {file.filename}")
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        print(f"Image opened successfully: {image.size}")
        # Preprocess the image into a tensor
        transform = transforms.Compose([
            transforms.Resize((64, 64)),  # Resize to the input size expected by the model
            transforms.ToTensor(),         # Convert image to tensor
            transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5])  # Normalize pixel values
        ])
        image_tensor = transform(image).unsqueeze(0)  # Add batch dimension
        global result
        # Pass the tensor to the predict function
        result = predict(image_tensor)

        return result  # Return the prediction result
    except Exception as e:
        print(f"Error processing file: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})
@app.get("/results")
async def get_results():
    info=  result
    if info is None:
        raise HTTPException(status_code=404, detail="No prediction available")
    return info 
 

def get_db_connection():
    with sqlite3.connect("users.db") as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS predictions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                prediction TEXT NOT NULL,
                accuracy REAL NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)
        conn.commit()
    return sqlite3.connect("users.db")

 
class UserLogin(BaseModel):
    email: str
    password: str
 

@app.post("/login/")
async def login(user: UserLogin):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (user.email,))
    db_user = cursor.fetchone()
    conn.close()

    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    stored_hashed_pw = db_user[3]
    if not verify_password(user.password, stored_hashed_pw):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": user.email})
    return {"name": db_user[1], "email": db_user[2], "token": token}



# Models
class UserSignup(BaseModel):
    name: str
    email: str
    password: str


# Signup route
@app.post("/signup/")
async def signup(user: UserSignup):
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        hashed_pw = hash_password(user.password)
        cursor.execute(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            (user.name, user.email, hashed_pw)
        )
        conn.commit()
        token = create_access_token({"sub": user.email})
        return {"name": user.name, "email": user.email, "token": token}
    except  sqlite3.IntegrityError:
        conn.rollback()
        raise HTTPException(status_code=400, detail="User already exists")
    finally:
        conn.close()

 
class Saved(BaseModel):
    user_id: int
    prediction: str
    accuracy: float

@app.post("/saved")
async def save(user:Saved):
    info =  result
    if info is None:
        raise HTTPException(status_code=404, detail="No prediction available")  

    user = Saved(
        prediction=info["disease"],
        accuracy=info["confidence"]
    )   

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            "INSERT INTO predictions (user_id,prediction, accuracy) VALUES (?,?, ?)",
            (user.user_id,user.prediction, user.accuracy)
        )
        conn.commit()
        conn.close()
        return {
            "message": "Prediction saved successfully",
            "prediction": user.prediction,
            "accuracy": user.accuracy
        }
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail="Prediction save failed")

 
@app.get("/user-predictions/{user_id}")
async def get_user_predictions(user_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()

    # Validate user_id
    cursor.execute("SELECT id FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    if not user:
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")

    cursor.execute("SELECT prediction, accuracy, timestamp FROM predictions WHERE user_id = ?", (user_id,))
    predictions = cursor.fetchall()
    conn.close()

    if not predictions:
        raise HTTPException(status_code=404, detail="No previous predictions found")

    return [
        {"prediction": pred[0], "accuracy": pred[1], "timestamp": pred[2]}
        for pred in predictions
    ]