from flask import Blueprint, jsonify, request
from app.models import UsdEur, User
from .. import db
from datetime import datetime

usdEur_bp = Blueprint('usd', __name__)


# Pobieranie wszystkich transakcji (USD)
@usdEur_bp.route('/', methods=['GET'])
def get_usdEur():
    usdEur = UsdEur.query.all()
    return jsonify([{
        "id": transaction.id,
        "submitted_at": transaction.submitted_at,
        "name": transaction.name,
        "input_value": transaction.input_value,
        "exchange_rate": transaction.exchange_rate,
        "output_value": transaction.output_value,
        "commission": transaction.commission,
        "executed_at": transaction.executed_at,
        "uid": transaction.uid,
        "user_id": transaction.user_id
    } for transaction in usdEur])


# Dodawanie nowej transakcji (USD)
@usdEur_bp.route('/', methods=['POST'])
def create_usdEur():
    data = request.get_json()

    # Walidacja danych wejściowych
    if not all(key in data for key in
               ['submitted_at', 'name', 'input_value', 'exchange_rate', 'output_value', 'commission', 'uid',
                'user_id']):
        return jsonify({"message": "Brak wymaganych danych"}), 400

    # Sprawdzenie, czy użytkownik istnieje
    user = User.query.get(data['user_id'])
    if not user:
        return jsonify({"message": "Użytkownik nie istnieje"}), 404

    # Tworzenie nowej transakcji
    new_usdEur = UsdEur(
        submitted_at=data['submitted_at'],
        name=data['name'],
        input_value=data['input_value'],
        exchange_rate=data['exchange_rate'],
        output_value=data['output_value'],
        commission=data['commission'],
        uid=data['uid'],
        user_id=data['user_id']
    )
    db.session.add(new_usdEur)
    db.session.commit()

    return jsonify({"message": "Transakcja została utworzona"}), 201


# Aktualizowanie wartości executed_at (USD)
@usdEur_bp.route('/<int:id>', methods=['PUT'])
def update_executed_at(id):
    data = request.get_json()

    # Sprawdzenie, czy podano datę wykonania
    if 'executed_at' not in data:
        return jsonify({"message": "Brak daty wykonania"}), 400

    # Pobranie transakcji
    usdEur = UsdEur.query.get(id)
    if not usdEur:
        return jsonify({"message": "Transakcja nie istnieje"}), 404

    # Aktualizacja daty wykonania
    usdEur.executed_at = datetime.strptime(data['executed_at'], '%Y-%m-%d %H:%M:%S')
    db.session.commit()

    return jsonify({"message": "Data wykonania została zaktualizowana"}), 200
