# ForexMate 📈

**ForexMate** is a web application for tracking and monitoring your currency exchange earnings. It lets you log buy/sell forex transactions, manage a virtual wallet, and analyze your results — all in one place.

> ⚠️ **Disclaimer**: ForexMate is a tracking tool, not a banking or financial platform. No real money is deposited or processed. It is designed to help traders monitor and record their exchange activity manually.

---

## 🚀 Features

- 🔐 **User authentication** — registration and login system
- 💼 **Virtual USD wallet** — deposit and withdraw virtual funds to simulate your real balance
- 💱 **EUR buy transactions** — log USD→EUR purchases with exchange rate and commission
- 💵 **EUR sell transactions** — log EUR→USD sales and calculate net profit
- 📊 **Dashboard metrics** — real-time view of total, free, and locked USD, plus EUR holdings
- 📋 **Transaction history** — full log of wallet deposits and withdrawals
- 🔍 **Transaction details modal** — inspect, execute (add execution date), or delete any transaction

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Tailwind CSS |
| Backend | Python, Flask, SQLAlchemy |
| Database | SQLite (via Flask-SQLAlchemy) |
| HTTP Client | Axios |
| Routing | React Router |

---

## 📁 Project Structure

```
ForexMate/
├── backend/
│   ├── app/
│   │   ├── __init__.py        # App factory (create_app)
│   │   ├── models.py          # DB models: User, Wallet, Usd, UsdEur, UsdWalletInOut
│   │   └── routes/            # API endpoints
│   └── run.py                 # Entry point (port 5001)
└── frontend/
    ├── src/
    │   ├── components/        # SideBar, shared UI
    │   └── pages/             # Usd.tsx, (EUR, PLN in progress)
    └── package.json
```

---

## ⚙️ Getting Started

### Prerequisites

- Node.js (v18+)
- Python 3.10+
- pip

### Frontend

```bash
cd frontend
npm install
npm start
```

### Backend

```bash
cd backend
pip install -r requirements.txt
python run.py
```

Backend runs on `http://127.0.0.1:5001`

---

## 📡 API Overview

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/wallet/:username` | Get wallet balances |
| POST | `/api/wallet/deposit` | Deposit USD to wallet |
| POST | `/api/wallet/withdraw` | Withdraw USD from wallet |
| GET | `/api/wallet/history/:username` | Get deposit/withdrawal history |
| GET | `/api/usd?user_name=` | Get all buy transactions |
| POST | `/api/usd/` | Create a buy transaction |
| PUT | `/api/usd/:id` | Mark buy transaction as executed |
| DELETE | `/api/usd/:id` | Delete buy transaction |
| GET | `/api/usdEur?user_name=` | Get all sell transactions |
| POST | `/api/usdEur/` | Create a sell transaction |
| PUT | `/api/usdEur/:id` | Mark sell transaction as executed |
| DELETE | `/api/usdEur/:id` | Delete sell transaction |

---

## 🗺️ Roadmap

- [x] User authentication (login / register)
- [x] USD wallet management (deposit / withdraw)
- [x] USD → EUR buy transactions
- [x] EUR → USD sell transactions
- [x] Transaction execution tracking
- [ ] EUR wallet tab
- [ ] PLN wallet tab
- [ ] Profit/loss analytics & charts
- [ ] Multi-currency support
- [ ] Responsive mobile layout

---

## 🤝 Contributing

The project is in active development. Feel free to open issues or submit pull requests.

---

## 📄 License

MIT