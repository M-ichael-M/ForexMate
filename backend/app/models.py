from . import db


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    username = db.Column(db.String(120), nullable=False)
    password = db.Column(db.String(200), nullable=False)


class Wallet(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_name = db.Column(db.String, nullable=False)
    all_wallet_usd_in_usd = db.Column(db.Float, nullable=False)
    all_wallet_usd_no_used = db.Column(db.Float, nullable=False)
    all_eur_in_usd_wallet = db.Column(db.Float, nullable=False)


class Usd(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    submitted_at = db.Column(db.DateTime, nullable=False)
    name = db.Column(db.String, nullable=False)
    input_value = db.Column(db.Float, nullable=False)
    exchange_rate = db.Column(db.Float, nullable=False)
    commission = db.Column(db.Float, nullable=False)
    executed_at = db.Column(db.DateTime, nullable=True)
    uid = db.Column(db.Integer, nullable=False)
    user_name = db.Column(db.String, nullable=False)


class UsdEur(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    submitted_at = db.Column(db.DateTime, nullable=True)
    name = db.Column(db.String, nullable=True)
    input_value = db.Column(db.Float, nullable=True)
    exchange_rate = db.Column(db.Float, nullable=True)
    commission = db.Column(db.Float, nullable=True)
    executed_at = db.Column(db.DateTime, nullable=True)
    uid = db.Column(db.Integer, nullable=False)
    user_name = db.Column(db.String, nullable=False)


class UsdWalletInOut(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    userName = db.Column(db.String, nullable=False)
    date = db.Column(db.DateTime, nullable=False)
    inOut = db.Column(db.Boolean, nullable=False)  #True jeśli wpłata false jeśli wypłata z portfela
    value = db.Column(db.Float, nullable=False)
