from flask import Blueprint, jsonify, request
from app.models import Usd, User
from .. import db
from datetime import datetime
import email.utils
from flask import Blueprint, request, jsonify
from datetime import datetime
import email.utils
from ..models import Usd, Wallet, db

usd_bp = Blueprint('usd', __name__)


@usd_bp.route('/', methods=['GET'])
def get_usd():
    user_name = request.args.get('user_name')
    if not user_name:
        return jsonify({"error": "User name is required"}), 400

    transactions = Usd.query.filter_by(user_name=user_name).all()
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

    # Sprawdź czy nazwa już istnieje
    existing_name = Usd.query.filter_by(user_name=user_name, name=name).first()
    if existing_name:
        return jsonify({"error": "Nazwa transakcji już istnieje dla tego użytkownika"}), 400

    # Sprawdź czy użytkownik ma wystarczające środki
    wallet = Wallet.query.filter_by(user_name=user_name).first()
    if not wallet:
        return jsonify({"error": "Portfel nie znaleziony"}), 404

    if wallet.all_wallet_usd_no_used < input_value:
        return jsonify({"error": "Niewystarczające wolne środki"}), 400

    try:
        # Zmniejsz wolne środki
        wallet.all_wallet_usd_no_used -= input_value

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
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@usd_bp.route('/<int:id>', methods=['PUT'])
def update_executed_at(id):
    transaction = Usd.query.get(id)
    if not transaction:
        return jsonify({"error": "Transakcja nie istnieje"}), 404

    data = request.get_json()
    executed_at = data.get('executed_at')

    if executed_at:
        try:
            parsed_date = email.utils.parsedate(executed_at)
            if parsed_date is None:
                raise ValueError("Nieprawidłowy format daty")

            executed_at_date = datetime(*parsed_date[:6])
            transaction.executed_at = executed_at_date

            # Po wykonaniu transakcji przelicz EUR na USD i dodaj do portfela
            wallet = Wallet.query.filter_by(user_name=transaction.user_name).first()
            if wallet:
                eur_value = transaction.input_value * transaction.exchange_rate - transaction.commission
                eur_in_usd = eur_value  # EUR przeliczone na USD (1:1 dla uproszczenia)
                wallet.all_eur_in_usd_wallet += eur_in_usd

            db.session.commit()
            return jsonify({"message": "Data wykonania zaktualizowana"}), 200
        except Exception as e:
            return jsonify({"error": f"Nieprawidłowy format daty: {str(e)}"}), 400

    return jsonify({"error": "Brak wymaganych danych"}), 400


@usd_bp.route('/<int:id>', methods=['DELETE'])
def delete_usd(id):
    transaction = Usd.query.get(id)
    if not transaction:
        return jsonify({"error": "Transakcja nie istnieje"}), 404

    try:
        # Jeśli transakcja nie była wykonana, zwróć środki do portfela
        if not transaction.executed_at:
            wallet = Wallet.query.filter_by(user_name=transaction.user_name).first()
            if wallet:
                wallet.all_wallet_usd_no_used += transaction.input_value

        db.session.delete(transaction)
        db.session.commit()
        return jsonify({"message": "Transakcja została usunięta"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@usd_bp.route('/', methods=['OPTIONS'])
def usd_options():
    return jsonify({"message": "OK"}), 200