from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

db = SQLAlchemy()


def create_app():
    app = Flask(__name__)
    CORS(app)

    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.sqlite3'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)

    # Rejestracja blueprintów
    from .routes.users import users_bp
    from .routes.usd import usd_bp
    from .routes.usd_eur import usdEur_bp

    app.register_blueprint(users_bp)
    app.register_blueprint(usd_bp, url_prefix='/api/usd')
    app.register_blueprint(name="usdEur_bp", blueprint=usdEur_bp, url_prefix='/api/usdEur')

    with app.app_context():
        db.create_all()  # Tworzenie bazy danych

    return app
