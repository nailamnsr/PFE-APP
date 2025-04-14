#def get_plant_disease_info():
    # Replace  with real logic later 
    #return {
       # "disease": "Powdery Mildew",
        #"confidence": 0.92,
        
   # }
#hashing the password and verifying the password using bcrypt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import JWTError, jwt
from dotenv import load_dotenv
import os
load_dotenv()

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRATION_MINUTES = int(os.getenv("JWT_EXPIRATION_MINUTES", 30))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=JWT_EXPIRATION_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def decode_access_token(token: str):
    try:
        return jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
    except JWTError:
        return None
    

import torch
from models.PrototypicalNet import ProtoNet, euclidean_dist
from torchvision import transforms
from PIL import Image

# Classes possibles
CLASSES = ['Potato healthy', 'Tomato YellowLeaf Curl Virus', 'Potat Late blight', 'Potato early blight',
           'Tomato healthy', 'Tomato Spider mites ', 'Tomato Target Spot',
           'Tomato Bacterial spot', 'Pepper bell healthy', 'Tomato Late blight', '  Tomato mosaic virus',
           'Tomato Septoria leaf spot', 'Tomato Early blight', 'Pepper bell Bacterial spot', 'Tomato Leaf Mold']

 

# Charger le modèle et les prototypes
model = ProtoNet()
model.load_state_dict(torch.load("models/best_model.pth", map_location=torch.device("cpu")))
model.eval()
prototypes = torch.load("models/prototypess.pt", map_location=torch.device("cpu"))

# Fonction de prédiction
def predict(image_tensor):
    try:
        
        print(f"Image tensor shape: {image_tensor.shape}")

        
        with torch.no_grad():
            embedding = model(image_tensor)   
            print(f"Embedding shape: {embedding.shape}")   
            
            
            if not prototypes:
                raise ValueError("Prototypes are not loaded correctly!")
            print(f"Prototypes available: {len(prototypes)}")

             
            for class_name, proto in list(prototypes.items())[:3]:
                print(f"Prototype for {class_name}: {proto.shape}")

            
            distances = {class_name: euclidean_dist(embedding, proto) for class_name, proto in prototypes.items()}
            print(f"Calculated distances: {distances}")   
 
            predicted_class_name = min(distances, key=distances.get)   
            confidence = 1 / (1 + distances[predicted_class_name].item())
            confidence = round(confidence, 2)
            print(f"Predicted class: {predicted_class_name}, Confidence: {confidence}")

        return {
            "disease": predicted_class_name,
            "confidence": confidence
        }

    except Exception as e:
        print(f"Error in prediction: {e}")
        return {"error": str(e)}
 