from . import db
from datetime import datetime
from passlib.hash import bcrypt

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(80), default='user') # 'user' or 'admin'

    def set_password(self, password):
        self.password_hash = bcrypt.hash(password)

    def check_password(self, password):
        return bcrypt.verify(password, self.password_hash)

    def __repr__(self):
        return f'<User {self.username}>'

class Classification(db.Model):
    __tablename__ = 'classifications'
    id = db.Column(db.Integer, primary_key=True)
    image_path = db.Column(db.String(255), nullable=False)
    classification_result = db.Column(db.String(255), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    processed = db.Column(db.Boolean, default=False)

    def __repr__(self):
        return f'<Classification {self.id}>'

class AvocadoFruitDetail(db.Model):
    __tablename__ = 'avocado_fruit_details'
    id = db.Column(db.Integer, primary_key=True)
    fruit_type = db.Column(db.String(255), nullable=False, unique=True)
    description = db.Column(db.Text, nullable=False)
    image_url = db.Column(db.String(255), nullable=True) # Assuming this will be a public URL
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<AvocadoFruitDetail {self.fruit_type}>'
