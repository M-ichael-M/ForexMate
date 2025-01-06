from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app)  # Pozwól na zapytania z innych portów (np. z Reacta)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.sqlite3'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)


# Model użytkownika
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)  # Imię
    last_name = db.Column(db.String(100), nullable=False)   # Nazwisko
    email = db.Column(db.String(120), unique=True, nullable=False)  # Email
    username = db.Column(db.String(120), unique=False, nullable=False)
    password = db.Column(db.String(200), nullable=False)    # Hasło (zaszyfrowane)


@app.route('/api/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([
        {
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "username": user.username,
            "email": user.email
        }
        for user in users
    ])



from werkzeug.security import generate_password_hash, check_password_hash

@app.route('/api/register', methods=['POST'])
def register_user():
    data = request.get_json()

    # Sprawdzenie, czy wszystkie wymagane dane są w żądaniu
    if not all(key in data for key in ['firstName', 'lastName', 'email', 'username', 'password']):
        return jsonify({"message": "Brak wymaganych danych"}), 400

    try:
        # Sprawdzamy, czy użytkownik o tym e-mailu już istnieje
        if User.query.filter_by(email=data['email']).first():
            return jsonify({"message": "Użytkownik z takim e-mailem już istnieje"}), 400

        # Haszowanie hasła z użyciem domyślnej metody pbkdf2:sha256
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
        # Logowanie wyjątku
        print(f"Error occurred: {e}")
        return jsonify({"message": "Coś poszło nie tak", "error": str(e)}), 500


@app.route('/api/login', methods=['POST'])
def login_user():
    data = request.get_json()

    if not data.get('username') or not data.get('password'):
        return jsonify({"error": "Username and password are required"}), 400

    user = User.query.filter_by(username=data['username']).first()  # Szukaj po username
    if user and check_password_hash(user.password, data['password']):
        # Zwrócenie danych użytkownika po udanym logowaniu
        return jsonify({
            "message": "Login successful",
            "username": user.username,
            "email": user.email
        }), 200
    else:
        return jsonify({"error": "Invalid username or password"}), 401


# Utwórz bazę danych, ale tylko w kontekście aplikacji
if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Tworzymy bazę danych
    app.run(debug=True, port=5001)

