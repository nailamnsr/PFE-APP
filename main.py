from fastapi import FastAPI, File, UploadFile ,HTTPException
import shutil
import os
from pydantic import BaseModel
import sqlite3
from fastapi.middleware.cors import CORSMiddleware
from utils import get_plant_disease_info,hash_password, create_access_token,verify_password
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

@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {"filename": file.filename, "filepath": file_path}

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




@app.get("/disease-info")
def disease_info():
    info = get_plant_disease_info()
    return info  

class Saved(BaseModel):
    user_id: int
    prediction: str
    accuracy: float

@app.post("/saved")
async def save(user:Saved):
    info = get_plant_disease_info()   

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