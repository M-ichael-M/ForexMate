from flask import Blueprint, jsonify, request
from app.models import Usd, User
from .. import db
from datetime import datetime
import email.utils

usd_bp = Blueprint('usd', __name__)


@usd_bp.route('/', methods=['GET'])
def get_usd():
    user_name = request.args.get('user_name')  # Pobranie nazwy użytkownika z parametru zapytania

    if not user_name:
        return jsonify({"error": "User name is required"}), 400  # Zwrócenie błędu, jeśli nie podano użytkownika

    transactions = Usd.query.filter_by(user_name=user_name).all()  # Filtrowanie transakcji po nazwie użytkownika

    result = [
        {
            "id": t.id,
            "submitted_at": t.submitted_at,
            "name": t.name,
            "input_value": t.input_value,
            "exchange_rate": t.exchange_rate,
            "commission": t.commission,
            "executed_at": t.executed_at,
            "uid": t.uid,
            "user_name": t.user_name
        } for t in transactions
    ]

    return jsonify(result), 200


# Dodawanie nowej transakcji (USD)
@usd_bp.route('/', methods=['POST'])
def create_usd():
    data = request.get_json()
    user_name = data.get('user_name')
    name = data.get('name')
    input_value = data.get('input_value')
    exchange_rate = data.get('exchange_rate')
    commission = data.get('commission')

    if not all([user_name, name, input_value, exchange_rate, commission]):
        return jsonify({"error": "Brak wymaganych danych"}), 400

    existing_name = Usd.query.filter_by(user_name=user_name, name=name).first()
    if existing_name:
        return jsonify({"error": "Nazwa transakcji już istnieje dla tego użytkownika"}), 400

    user_transactions = Usd.query.filter_by(user_name=user_name).count()
    new_transaction = Usd(
        submitted_at=datetime.utcnow(),
        name=name,
        input_value=input_value,
        exchange_rate=exchange_rate,
        commission=commission,
        uid=user_transactions + 1,
        user_name=user_name
    )
    db.session.add(new_transaction)
    db.session.commit()
    return jsonify({"message": "Transakcja dodana"}), 201


# Aktualizowanie wartości executed_at (USD)
@usd_bp.route('/<int:id>', methods=['PUT'])
def update_executed_at(id):
    transaction = Usd.query.get(id)
    if not transaction:
        return jsonify({"error": "Transakcja nie istnieje"}), 404

    data = request.get_json()
    executed_at = data.get('executed_at')

    if executed_at:
        try:
            # Parsowanie daty w formacie RFC 1123
            parsed_date = email.utils.parsedate(executed_at)
            if parsed_date is None:
                raise ValueError("Nieprawidłowy format daty")

            # Konwersja do datetime
            executed_at_date = datetime(*parsed_date[:6])
            transaction.executed_at = executed_at_date
        except Exception as e:
            return jsonify({"error": f"Nieprawidłowy format daty: {str(e)}"}), 400

        db.session.commit()
        return jsonify({"message": "Data wykonania zaktualizowana"}), 200

    return jsonify({"error": "Brak wymaganych danych"}), 400

# Usuwanie transakcji po ID (USD)
@usd_bp.route('/<int:id>', methods=['DELETE'])
def delete_usd(id):
    transaction = Usd.query.get(id)
    if not transaction:
        return jsonify({"error": "Transakcja nie istnieje"}), 404

    db.session.delete(transaction)
    db.session.commit()

    return jsonify({"message": "Transakcja została usunięta"}), 200


@usd_bp.route('/', methods=['OPTIONS'])
def usd_options():
    return jsonify({"message": "OK"}), 200
