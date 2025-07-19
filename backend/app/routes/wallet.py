from flask import Blueprint, jsonify, request
from app.models import Wallet, db

from app.models import UsdWalletInOut

wallet_bp = Blueprint('wallet', __name__, url_prefix='/api/wallet')


@wallet_bp.route('/<username>', methods=['GET'])
def get_wallet(username):
    wallet = Wallet.query.filter_by(user_name=username).first()
    if wallet:
        return jsonify({
            "user_name": wallet.user_name,
            "all_wallet_usd_in_usd": wallet.all_wallet_usd_in_usd,
            "all_wallet_usd_no_used": wallet.all_wallet_usd_no_used,
            "all_eur_in_usd_wallet": wallet.all_eur_in_usd_wallet
        }), 200
    return jsonify({"message": "Portfel nie znaleziony"}), 404


@wallet_bp.route('/<username>', methods=['PUT'])
def update_wallet(username):
    data = request.get_json()
    wallet = Wallet.query.filter_by(user_name=username).first()

    if not wallet:
        return jsonify({"message": "Portfel nie znaleziony"}), 404

    try:
        if 'all_wallet_usd_in_usd' in data:
            wallet.all_wallet_usd_in_usd = float(data['all_wallet_usd_in_usd'])
        if 'all_wallet_usd_no_used' in data:
            wallet.all_wallet_usd_no_used = float(data['all_wallet_usd_no_used'])
        if 'all_eur_in_usd_wallet' in data:
            wallet.all_eur_in_usd_wallet = float(data['all_eur_in_usd_wallet'])

        db.session.commit()
        return jsonify({"message": "Portfel zaktualizowany pomyślnie"}), 200
    except Exception as e:
        return jsonify({"message": "Błąd przy aktualizacji", "error": str(e)}), 500

from datetime import datetime

@wallet_bp.route('/deposit', methods=['POST'])
def deposit():
    data = request.get_json()
    username = data.get('username')
    amount = data.get('amount')

    if not username or not amount:
        return jsonify({"message": "Brak wymaganych danych"}), 400

    try:
        amount = float(amount)
        if amount <= 0:
            return jsonify({"message": "Kwota musi być dodatnia"}), 400

        wallet = Wallet.query.filter_by(user_name=username).first()
        if not wallet:
            return jsonify({"message": "Portfel nie znaleziony"}), 404

        wallet.all_wallet_usd_in_usd += amount
        wallet.all_wallet_usd_no_used += amount

        new_transaction = UsdWalletInOut(
            userName=username,
            date=datetime.utcnow(),
            inOut=True,  # True dla wpłaty
            value=amount
        )
        db.session.add(new_transaction)
        db.session.commit()
        return jsonify({"message": "Wpłata pomyślna"}), 200
    except Exception as e:
        return jsonify({"message": "Błąd przy wpłacie", "error": str(e)}), 500


@wallet_bp.route('/withdraw', methods=['POST'])
def withdraw():
    data = request.get_json()
    username = data.get('username')
    amount = data.get('amount')

    if not username or not amount:
        return jsonify({"message": "Brak wymaganych danych"}), 400

    try:
        amount = float(amount)
        if amount <= 0:
            return jsonify({"message": "Kwota musi być dodatnia"}), 400

        wallet = Wallet.query.filter_by(user_name=username).first()
        if not wallet:
            return jsonify({"message": "Portfel nie znaleziony"}), 404

        if wallet.all_wallet_usd_no_used < amount:
            return jsonify({"message": "Niewystarczające środki do wypłaty"}), 400

        wallet.all_wallet_usd_in_usd -= amount
        wallet.all_wallet_usd_no_used -= amount

        new_transaction = UsdWalletInOut(
            userName=username,
            date=datetime.utcnow(),
            inOut=False,  # False dla wypłaty
            value=amount
        )
        db.session.add(new_transaction)
        db.session.commit()
        return jsonify({"message": "Wypłata pomyślna"}), 200
    except Exception as e:
        return jsonify({"message": "Błąd przy wypłacie", "error": str(e)}), 500

@wallet_bp.route('/history/<username>', methods=['GET'])
def get_history(username):
    transactions = UsdWalletInOut.query.filter_by(userName=username).order_by(UsdWalletInOut.date.desc()).all()
    result = [
        {
            "id": t.id,
            "date": t.date.isoformat(),
            "inOut": t.inOut,
            "value": t.value
        } for t in transactions
    ]
    return jsonify(result), 200