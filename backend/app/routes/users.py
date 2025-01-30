from flask import Blueprint, jsonify, request
from werkzeug.security import generate_password_hash, check_password_hash
from app.models import User, db

users_bp = Blueprint('users', __name__, url_prefix='/api')


@users_bp.route('/register', methods=['POST'])
def register_user():
    data = request.get_json()

    if not all(key in data for key in ['firstName', 'lastName', 'email', 'username', 'password']):
        return jsonify({"message": "Brak wymaganych danych"}), 400

    try:
        if User.query.filter_by(email=data['email']).first():
            return jsonify({"message": "Użytkownik z takim e-mailem już istnieje"}), 400

        hashed_password = generate_password_hash(data['password'], method='pbkdf2:sha256')

        new_user = User(
            first_name=data['firstName'],
            last_name=data['lastName'],
            email=data['email'],
            username=data['username'],
            password=hashed_password
        )
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "Rejestracja zakończona sukcesem"}), 201

    except Exception as e:
        print(f"Error occurred: {e}")
        return jsonify({"message": "Coś poszło nie tak", "error": str(e)}), 500


@users_bp.route('/login', methods=['POST'])
def login_user():
    data = request.get_json()

    if not data.get('username') or not data.get('password'):
        return jsonify({"error": "Username and password are required"}), 400

    user = User.query.filter_by(username=data['username']).first()
    if user and check_password_hash(user.password, data['password']):
        return jsonify({
            "message": "Login successful",
            "username": user.username,
            "email": user.email
        }), 200
    else:
        return jsonify({"error": "Invalid username or password"}), 401


@users_bp.route('/', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([{
        "id": user.id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "username": user.username,
        "email": user.email
    } for user in users])


@users_bp.route('/user_id', methods=['GET'])
def get_user_id():
    username = request.args.get('username')

    if not username:
        return jsonify({"error": "Brak nazwy użytkownika w żądaniu"}), 400

    user = User.query.filter_by(username=username).first()

    if user:
        return jsonify({"user_id": user.id}), 200
    else:
        return jsonify({"error": "Użytkownik nie znaleziony"}), 404