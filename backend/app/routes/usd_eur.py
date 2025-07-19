from flask import Blueprint, jsonify, request
from app.models import UsdEur, User
from .. import db
from datetime import datetime
import email.utils
from flask import Blueprint, request, jsonify
from datetime import datetime
import email.utils
from ..models import UsdEur, Usd, Wallet, db

usdEur_bp = Blueprint('usdEur', __name__)


@usdEur_bp.route('/', methods=['GET'])
def get_usdEur():
    user_name = request.args.get('user_name')
    if not user_name:
        return jsonify({"error": "User name is required"}), 400

    transactions = UsdEur.query.filter_by(user_name=user_name).all()
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


@usdEur_bp.route('/', methods=['POST'])
def create_usdEur():
    data = request.get_json()
    user_name = data.get('user_name')
    name = data.get('name')
    input_value = data.get('input_value')
    exchange_rate = data.get('exchange_rate')
    commission = data.get('commission')

    if not all([user_name, name, input_value, exchange_rate, commission]):
        return jsonify({"error": "Brak wymaganych danych"}), 400

    # Sprawdź czy nazwa już istnieje w UsdEur
    existing_name = UsdEur.query.filter_by(user_name=user_name, name=name).first()
    if existing_name:
        return jsonify({"error": "Nazwa transakcji już istnieje dla tego użytkownika"}), 400

    # Sprawdź czy istnieje wykonana transakcja USD o tej samej nazwie
    usd_transaction = Usd.query.filter_by(user_name=user_name, name=name).first()
    if not usd_transaction or not usd_transaction.executed_at:
        return jsonify({"error": "Nie można sprzedać - transakcja kupna nie istnieje lub nie została wykonana"}), 400

    # Sprawdź czy wartość EUR jest dostępna (obliczona z transakcji USD)
    eur_available = usd_transaction.input_value * usd_transaction.exchange_rate - usd_transaction.commission

    try:
        wallet = Wallet.query.filter_by(user_name=user_name).first()
        if not wallet:
            return jsonify({"error": "Portfel nie znaleziony"}), 404

        user_transactions = UsdEur.query.filter_by(user_name=user_name).count()
        new_transaction = UsdEur(
            submitted_at=datetime.utcnow(),
            name=name,
            input_value=eur_available,  # Wartość EUR z transakcji kupna
            exchange_rate=exchange_rate,
            commission=commission,
            uid=user_transactions + 1,
            user_name=user_name
        )
        db.session.add(new_transaction)
        db.session.commit()
        return jsonify({"message": "Transakcja sprzedaży dodana"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@usdEur_bp.route('/<int:id>', methods=['PUT'])
def update_executed_at(id):
    transaction = UsdEur.query.get(id)
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

            # Po wykonaniu sprzedaży dodaj USD do wolnych środków
            wallet = Wallet.query.filter_by(user_name=transaction.user_name).first()
            if wallet:
                usd_received = transaction.input_value * transaction.exchange_rate - transaction.commission
                wallet.all_wallet_usd_no_used += usd_received
                wallet.all_wallet_usd_in_usd += usd_received
                # Zmniejsz EUR w portfelu
                wallet.all_eur_in_usd_wallet -= transaction.input_value

            db.session.commit()
            return jsonify({"message": "Data wykonania zaktualizowana"}), 200
        except Exception as e:
            return jsonify({"error": f"Nieprawidłowy format daty: {str(e)}"}), 400

    return jsonify({"error": "Brak wymaganych danych"}), 400


@usdEur_bp.route('/<int:id>', methods=['DELETE'])
def delete_usd(id):
    transaction = UsdEur.query.get(id)
    if not transaction:
        return jsonify({"error": "Transakcja nie istnieje"}), 404

    db.session.delete(transaction)
    db.session.commit()
    return jsonify({"message": "Transakcja została usunięta"}), 200


@usdEur_bp.route('/', methods=['OPTIONS'])
def usdEur_options():
    return jsonify({"message": "OK"}), 200