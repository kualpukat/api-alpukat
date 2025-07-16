from flask import Blueprint, request, jsonify, current_app, render_template
from werkzeug.utils import secure_filename
from datetime import datetime, timedelta
import os
import jwt

from . import db
from .models import User, Classification, AvocadoFruitDetail
from .utils import token_required, admin_required, preprocess_image, classify_with_tflite, interpreter

api_bp = Blueprint('api_bp', __name__)

# --- API Routes ---
@api_bp.route('/')
def home():
    return jsonify({"message": "Welcome to the Avocado Classification API!"})

# Admin Panel Frontend Route
@api_bp.route('/admin_panel')
@admin_required
def admin_panel(current_user):
    return render_template('admin_panel.html')

# User authentication
@api_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    role = data.get('role', 'user') # Default role is 'user'

    if not username or not password:
        return jsonify({'message': 'Username and password are required!'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'message': 'Username already exists.'}), 409

    new_user = User(username=username, role=role)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User registered successfully!'}), 201

@api_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()

    if not user or not user.check_password(password):
        return jsonify({'message': 'Invalid credentials!'}), 401

    token = jwt.encode({
        'user_id': user.id,
        'username': user.username,
        'role': user.role,
        'exp': datetime.utcnow() + timedelta(days=current_app.config['JWT_EXPIRATION_DAYS'])
    }, current_app.config['SECRET_KEY'], algorithm='HS256')

    return jsonify({'token': token}), 200

# Admin specific routes (require admin role)
@api_bp.route('/admin/avocado-details', methods=['POST'])
@admin_required
def create_avocado_detail(current_user):
    data = request.get_json()
    fruit_type = data.get('fruit_type')
    description = data.get('description')
    image_url = data.get('image_url')

    if not fruit_type or not description:
        return jsonify({'message': 'Fruit type and description are required!'}), 400

    if AvocadoFruitDetail.query.filter_by(fruit_type=fruit_type).first():
        return jsonify({'message': 'Avocado type already exists.'}), 409

    new_detail = AvocadoFruitDetail(fruit_type=fruit_type, description=description, image_url=image_url)
    db.session.add(new_detail)
    db.session.commit()
    return jsonify({'message': 'Avocado detail created successfully!', 'id': new_detail.id}), 201

@api_bp.route('/admin/avocado-details', methods=['GET'])
@admin_required
def get_all_avocado_details(current_user):
    details = AvocadoFruitDetail.query.all()
    output = []
    for detail in details:
        output.append({
            'id': detail.id,
            'fruit_type': detail.fruit_type,
            'description': detail.description,
            'image_url': detail.image_url,
            'timestamp': detail.timestamp.isoformat()
        })
    return jsonify({'avocado_details': output}), 200

@api_bp.route('/admin/avocado-details/<int:detail_id>', methods=['GET'])
@admin_required
def get_avocado_detail(current_user, detail_id):
    detail = AvocadoFruitDetail.query.get_or_404(detail_id)
    return jsonify({
        'id': detail.id,
        'fruit_type': detail.fruit_type,
        'description': detail.description,
        'image_url': detail.image_url,
        'timestamp': detail.timestamp.isoformat()
    }), 200

@api_bp.route('/admin/avocado-details/<int:detail_id>', methods=['PUT'])
@admin_required
def update_avocado_detail(current_user, detail_id):
    detail = AvocadoFruitDetail.query.get_or_404(detail_id)
    data = request.get_json()
    
    detail.fruit_type = data.get('fruit_type', detail.fruit_type)
    detail.description = data.get('description', detail.description)
    detail.image_url = data.get('image_url', detail.image_url)
    db.session.commit()
    return jsonify({'message': 'Avocado detail updated successfully!'}), 200

@api_bp.route('/admin/avocado-details/<int:detail_id>', methods=['DELETE'])
@admin_required
def delete_avocado_detail(current_user, detail_id):
    detail = AvocadoFruitDetail.query.get_or_404(detail_id)
    db.session.delete(detail)
    db.session.commit()
    return jsonify({'message': 'Avocado detail deleted successfully!'}), 200

@api_bp.route('/admin/classifications', methods=['GET'])
@admin_required
def get_all_classifications(current_user):
    classifications = Classification.query.order_by(Classification.timestamp.desc()).all()
    output = []
    for cls in classifications:
        output.append({
            'id': cls.id,
            'image_path': cls.image_path,
            'classification_result': cls.classification_result,
            'timestamp': cls.timestamp.isoformat(),
            'processed': cls.processed
        })
    return jsonify({'classifications': output}), 200

# Main classification route (requires user or admin role)
@api_bp.route('/classify', methods=['POST'])
@token_required # Require token for classification
def classify_image(current_user):
    if 'image' not in request.files:
        return jsonify({"error": "No image part in the request"}), 400

    image = request.files['image']

    if image.filename == '':
        return jsonify({"error": "No selected image"}), 400

    # Image validation (example: only allow jpg, jpeg, png up to 5MB)
    allowed_extensions = {'png', 'jpg', 'jpeg'}
    max_file_size = 5 * 1024 * 1024 # 5 MB

    if '.' not in image.filename or image.filename.rsplit('.', 1)[1].lower() not in allowed_extensions:
        return jsonify({"error": "Invalid file type. Only PNG, JPG, JPEG are allowed."}), 400

    # To check file size, we need to read it. Use a temporary read, then seek back.
    image.seek(0, os.SEEK_END) # Go to end of file
    file_size = image.tell() # Get current position (which is file size)
    image.seek(0) # Reset stream position to beginning

    if file_size > max_file_size:
        return jsonify({"error": "File size exceeds 5MB limit."}), 400

    if image:
        filename = secure_filename(image.filename)
        upload_folder = os.path.join(current_app.root_path, 'uploads')
        os.makedirs(upload_folder, exist_ok=True)
        image_path = os.path.join(upload_folder, filename)
        image.save(image_path)

        # Perform image classification
        try:
            if interpreter is None:
                return jsonify({"error": "Classification model is not loaded."}), 500
            
            processed_img_array = preprocess_image(image_path)
            classification_result = classify_with_tflite(processed_img_array)
            processed_status = True
        except Exception as e:
            classification_result = "error_during_classification"
            processed_status = False
            print(f"Error during classification: {e}")
            # Optionally, delete the uploaded file if classification failed completely
            # os.remove(image_path)
            # return jsonify({"error": f"Image processing failed: {e}"}), 500


        new_classification = Classification(
            image_path=image_path,
            classification_result=classification_result,
            processed=processed_status
        )
        db.session.add(new_classification)
        db.session.commit()

        return jsonify({
            "message": "Image uploaded and classified",
            "filename": filename,
            "classification_result": classification_result
        }), 200
    
    return jsonify({"error": "Something went wrong"}), 500

# Endpoint to get details of a specific avocado type
@api_bp.route('/avocado-details/<string:fruit_type>', methods=['GET'])
def get_avocado_detail_by_type(fruit_type):
    detail = AvocadoFruitDetail.query.filter_by(fruit_type=fruit_type).first()
    if not detail:
        return jsonify({'message': 'Avocado type not found.'}), 404
    return jsonify({
        'id': detail.id,
        'fruit_type': detail.fruit_type,
        'description': detail.description,
        'image_url': detail.image_url,
        'timestamp': detail.timestamp.isoformat()
    }), 200
