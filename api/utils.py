import os
import jwt
from datetime import datetime, timedelta
import tensorflow as tf
from PIL import Image
import numpy as np
from flask import current_app, jsonify, request

# Globals for model and labels
interpreter = None
input_details = None
output_details = None
labels = []
model_input_shape = (0, 0, 0)

# Utility to get current_app within the app context for config access
def get_current_app_config(key):
    with current_app.app_context():
        return current_app.config[key]

# --- Load TensorFlow Lite model and labels ---
def load_model_and_labels():
    global interpreter, input_details, output_details, labels, model_input_shape
    MODEL_PATH = os.path.join(current_app.root_path, 'model.tflite')
    LABELS_PATH = os.path.join(current_app.root_path, 'labels.txt')

    try:
        if not os.path.exists(MODEL_PATH):
            print(f"Warning: Model file not found at {MODEL_PATH}")
            return
        if not os.path.exists(LABELS_PATH):
            print(f"Warning: Labels file not found at {LABELS_PATH}")
            return

        interpreter = tf.lite.Interpreter(model_path=MODEL_PATH)
        interpreter.allocate_tensors()

        input_details = interpreter.get_input_details()
        output_details = interpreter.get_output_details()

        # Get input tensor shape
        model_input_shape = input_details[0]['shape'][1:4] # (height, width, channels)

        with open(LABELS_PATH, 'r') as f:
            labels = [line.strip() for line in f.readlines()]
        print("TensorFlow Lite model and labels loaded successfully.")
    except Exception as e:
        print(f"Error loading model or labels: {e}")
        interpreter = None # Ensure interpreter is None if loading fails

# --- Helper for Image Preprocessing ---
def preprocess_image(image_path):
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image not found at {image_path}")

    img = Image.open(image_path).convert('RGB')
    img = img.resize((model_input_shape[1], model_input_shape[0])) # Resize to (width, height)
    img_array = np.array(img).astype(input_details[0]['dtype'])
    img_array = np.expand_dims(img_array, axis=0) # Add batch dimension

    # Normalize image to [0, 1] if the model expects float32 input
    if input_details[0]['dtype'] == np.float32:
        img_array = img_array / 255.0

    return img_array

def classify_with_tflite(image_array):
    if interpreter is None:
        return "Error: Model not loaded."

    interpreter.set_tensor(input_details[0]['index'], image_array)
    interpreter.invoke()
    output_data = interpreter.get_tensor(output_details[0]['index'])
    
    # Get the top prediction
    predicted_class_id = np.argmax(output_data[0])
    
    if 0 <= predicted_class_id < len(labels):
        return labels[predicted_class_id]
    else:
        return "Unknown"

# --- Decorators for Authentication & Authorization ---
from functools import wraps
from .models import User # Import User model here to avoid circular dependency in routes

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.filter_by(id=data['user_id']).first()
            if not current_user:
                return jsonify({'message': 'User not found!'}), 401
        except Exception as e:
            return jsonify({'message': f'Token is invalid or expired! {e}'}), 401
        return f(current_user, *args, **kwargs)
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.filter_by(id=data['user_id']).first()
            if not current_user or current_user.role != 'admin':
                return jsonify({'message': 'Admin access required!'}), 403
        except Exception as e:
            return jsonify({'message': f'Token is invalid or expired! {e}'}), 401
        return f(current_user, *args, **kwargs)
    return decorated
