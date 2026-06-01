import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SideBar from './SideBar.tsx';
import axios from 'axios';

interface Transaction {
  id: number;
  submitted_at: string;
  name: string;
  input_value: number;
  exchange_rate: number;
  commission: number;
  executed_at: string | null;
  uid: number;
  user_name: string;
}

interface WalletData {
  all_wallet_usd_in_usd: number;
  all_wallet_usd_no_used: number;
  all_eur_in_usd_wallet: number;
}

interface HistoryTransaction {
  id: number;
  date: string;
  inOut: boolean;
  value: number;
}

const Usd: React.FC = () => {
  const navigate = useNavigate();
  const [transactionsBuy, setTransactionsBuy] = useState<Transaction[]>([]);
  const [transactionsSell, setTransactionsSell] = useState<Transaction[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ email: string; username: string; id: number } | null>(null);
  const [selectedTransactionIdBuy, setSelectedTransactionIdBuy] = useState<number | null>(null);
  const [executedAtBuy, setExecutedAtBuy] = useState<string>('');
  const [selectedTransactionIdSell, setSelectedTransactionIdSell] = useState<number | null>(null);
  const [executedAtSell, setExecutedAtSell] = useState<string>('');

  const [walletData, setWalletData] = useState<WalletData | null>(null);

  // Stany dla formularzy
  const [formDataBuy, setFormDataBuy] = useState({
    name: '',
    input_value: '',
    exchange_rate: '',
    commission: ''
  });

  const [formDataSell, setFormDataSell] = useState({
    name: '',
    exchange_rate: '',
    commission: ''
  });

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [history, setHistory] = useState<HistoryTransaction[]>([]);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    const storedEmail = localStorage.getItem('email');
    const storedId = localStorage.getItem('id');

    if (storedUsername && storedEmail && storedId) {
      setIsLoggedIn(true);
      setUser({ email: storedEmail, username: storedUsername, id: Number(storedId) });
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  const fetchAllData = () => {
    fetchTransactionsBuy();
    fetchTransactionsSell();
    fetchWalletData();
    fetchHistory();
  };

  const fetchWalletData = () => {
    if (!user) return;
    axios
      .get(`http://127.0.0.1:5001/api/wallet/${user.username}`)
      .then((response) => {
        setWalletData(response.data);
      })
      .catch((error) => {
        console.error("Błąd pobierania portfela:", error);
        setError("Nie udało się pobrać danych portfela");
        setTimeout(() => setError(null), 5000);
      });
  };

  const fetchHistory = () => {
    if (!user) return;
    axios
      .get(`http://127.0.0.1:5001/api/wallet/history/${user.username}`)
      .then((response) => setHistory(response.data))
      .catch((error) => console.error("Błąd pobierania historii:", error));
  };

  const fetchTransactionsBuy = () => {
    if (!user) return;
    axios
      .get(`http://127.0.0.1:5001/api/usd?user_name=${user.username}`)
      .then((response) => setTransactionsBuy(response.data))
      .catch(() => setTransactionsBuy([]));
  };

  const fetchTransactionsSell = () => {
    if (!user) return;
    axios
      .get(`http://127.0.0.1:5001/api/usdEur?user_name=${user.username}`)
      .then((response) => setTransactionsSell(response.data))
      .catch(() => setTransactionsSell([]));
  };

  // Obliczenia dla dashboard
  const getUsdUsed = () => {
    return transactionsBuy
      .filter(t => !t.executed_at)
      .reduce((sum, t) => sum + t.input_value, 0);
  };

  const getEurValueFromExecutedTransactions = () => {
    return transactionsBuy
      .filter(t => t.executed_at)
      .reduce((sum, t) => sum + (t.input_value * t.exchange_rate - t.commission), 0);
  };

  const getPendingUsdFromSells = () => {
    return transactionsSell
      .filter(t => !t.executed_at)
      .reduce((sum, t) => sum + (t.input_value * t.exchange_rate - t.commission), 0);
  };

  // Handlery dla wpłat i wypłat
  const handleDeposit = () => {
    if (!depositAmount || isNaN(parseFloat(depositAmount)) || parseFloat(depositAmount) <= 0) {
      setError("Podaj poprawną kwotę wpłaty");
      setTimeout(() => setError(null), 5000);
      return;
    }
    axios
      .post('http://127.0.0.1:5001/api/wallet/deposit', {
        username: user?.username,
        amount: parseFloat(depositAmount)
      })
      .then(() => {
        setSuccessMessage("Wpłata pomyślna");
        setTimeout(() => setSuccessMessage(null), 5000);
        fetchAllData();
        setDepositAmount('');
      })
      .catch(() => {
        setError("Błąd przy wpłacie");
        setTimeout(() => setError(null), 5000);
      });
  };

  const handleWithdraw = () => {
    if (!withdrawAmount || isNaN(parseFloat(withdrawAmount)) || parseFloat(withdrawAmount) <= 0) {
      setError("Podaj poprawną kwotę wypłaty");
      setTimeout(() => setError(null), 5000);
      return;
    }
    axios
      .post('http://127.0.0.1:5001/api/wallet/withdraw', {
        username: user?.username,
        amount: parseFloat(withdrawAmount)
      })
      .then(() => {
        setSuccessMessage("Wypłata pomyślna");
        setTimeout(() => setSuccessMessage(null), 5000);
        fetchAllData();
        setWithdrawAmount('');
      })
      .catch((error) => {
        setError(error.response?.data?.message || "Błąd przy wypłacie");
        setTimeout(() => setError(null), 5000);
      });
  };

  // Handlery dla kupna
  const handleInputChangeBuy = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormDataBuy((prev) => ({ ...prev, [name]: value }));
  };

  const validateBuyTransaction = () => {
    const { name, input_value, exchange_rate, commission } = formDataBuy;
    
    if (!name.trim()) {
      setError("Podaj nazwę transakcji");
      setTimeout(() => setError(null), 5000);
      return false;
    }

    if (transactionsBuy.find(t => t.name === name.trim())) {
      setError("Transakcja o tej nazwie już istnieje");
      setTimeout(() => setError(null), 5000);
      return false;
    }

    const amount = parseFloat(input_value);
    const rate = parseFloat(exchange_rate);
    const comm = parseFloat(commission);

    if (isNaN(amount) || amount <= 0) {
      setError("Podaj poprawną wartość USD");
      setTimeout(() => setError(null), 5000);
      return false;
    }

    if (isNaN(rate) || rate <= 0) {
      setError("Podaj poprawny kurs wymiany");
      setTimeout(() => setError(null), 5000);
      return false;
    }

    if (isNaN(comm) || comm < 0) {
      setError("Podaj poprawną prowizję");
      setTimeout(() => setError(null), 5000);
      return false;
    }

    if (!walletData || walletData.all_wallet_usd_no_used < amount) {
      setError("Niewystarczające wolne środki USD");
      setTimeout(() => setError(null), 5000);
      return false;
    }

    return true;
  };

  const handleSubmitBuy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateBuyTransaction()) return;
    
    const data = {
      user_name: user!.username,
      name: formDataBuy.name.trim(),
      input_value: parseFloat(formDataBuy.input_value),
      exchange_rate: parseFloat(formDataBuy.exchange_rate),
      commission: parseFloat(formDataBuy.commission)
    };

    axios
      .post('http://127.0.0.1:5001/api/usd/', data)
      .then(() => {
        setSuccessMessage("Transakcja kupna została dodana!");
        setTimeout(() => setSuccessMessage(null), 5000);
        setError(null);
        fetchAllData();
        setFormDataBuy({ name: '', input_value: '', exchange_rate: '', commission: '' });
      })
      .catch((error) => {
        setError(error.response?.data?.error || "Wystąpił błąd podczas dodawania transakcji");
        setTimeout(() => setError(null), 5000);
        setSuccessMessage(null);
      });
  };

  // Handlery dla sprzedaży
  const handleInputChangeSell = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormDataSell((prev) => ({ ...prev, [name]: value }));
  };

  const validateSellTransaction = () => {
    const { name, exchange_rate, commission } = formDataSell;
    
    if (!name) {
      setError("Wybierz transakcję do sprzedaży");
      setTimeout(() => setError(null), 5000);
      return false;
    }

    const buyTransaction = transactionsBuy.find(t => t.name === name && t.executed_at);
    if (!buyTransaction) {
      setError("Wybrana transakcja nie jest wykonana");
      setTimeout(() => setError(null), 5000);
      return false;
    }

    if (transactionsSell.find(t => t.name === name)) {
      setError("Ta transakcja już została sprzedana");
      setTimeout(() => setError(null), 5000);
      return false;
    }

    const rate = parseFloat(exchange_rate);
    const comm = parseFloat(commission);

    if (isNaN(rate) || rate <= 0) {
      setError("Podaj poprawny kurs sprzedaży");
      setTimeout(() => setError(null), 5000);
      return false;
    }

    if (isNaN(comm) || comm < 0) {
      setError("Podaj poprawną prowizję");
      setTimeout(() => setError(null), 5000);
      return false;
    }

    return true;
  };

  const handleSubmitSell = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSellTransaction()) return;
    
    const data = {
      user_name: user!.username,
      name: formDataSell.name,
      exchange_rate: parseFloat(formDataSell.exchange_rate),
      commission: parseFloat(formDataSell.commission)
    };

    axios
      .post('http://127.0.0.1:5001/api/usdEur/', data)
      .then(() => {
        setSuccessMessage("Transakcja sprzedaży została dodana!");
        setTimeout(() => setSuccessMessage(null), 5000);
        setError(null);
        fetchAllData();
        setFormDataSell({ name: '', exchange_rate: '', commission: '' });
      })
      .catch((error) => {
        setError(error.response?.data?.error || "Wystąpił błąd podczas dodawania transakcji sprzedaży");
        setTimeout(() => setError(null), 5000);
        setSuccessMessage(null);
      });
  };

  // Usuwanie transakcji
  const deleteTransaction = (id: number, isSell: boolean) => {
    const url = `http://127.0.0.1:5001/api/${isSell ? 'usdEur' : 'usd'}/${id}`;
    axios
      .delete(url)
      .then(() => {
        setSuccessMessage("Transakcja została usunięta");
        setTimeout(() => setSuccessMessage(null), 5000);
        fetchAllData();
        isSell ? setSelectedTransactionIdSell(null) : setSelectedTransactionIdBuy(null);
      })
      .catch((error) => {
        setError("Błąd przy usuwaniu transakcji");
        setTimeout(() => setError(null), 5000);
      });
  };

  // Dodawanie daty wykonania
  const handleAddDate = (id: number, isSell: boolean) => {
    const executedAt = isSell ? executedAtSell : executedAtBuy;
    if (!executedAt) {
      setError("Musisz podać datę.");
      setTimeout(() => setError(null), 5000);
      return;
    }

    const formattedDate = new Date(executedAt).toUTCString();
    const url = `http://127.0.0.1:5001/api/${isSell ? 'usdEur' : 'usd'}/${id}`;
  
    axios
      .put(url, { executed_at: formattedDate })
      .then(() => {
        setSuccessMessage("Data wykonania zaktualizowana!");
        setTimeout(() => setSuccessMessage(null), 5000);
        setError(null);
        fetchAllData();
        isSell ? setExecutedAtSell('') : setExecutedAtBuy('');
      })
      .catch(() => {
        setError("Błąd aktualizacji daty");
        setTimeout(() => setError(null), 5000);
      });
  };

  const getAvailableTransactionsForSell = () => {
    return transactionsBuy.filter(t => 
      t.executed_at && !transactionsSell.find(s => s.name === t.name)
    );
  };

  // Funkcja pomocnicza do renderowania modala
  const renderDetailsModal = (isSell: boolean) => {
    const transactionId = isSell ? selectedTransactionIdSell : selectedTransactionIdBuy;
    const transactions = isSell ? transactionsSell : transactionsBuy;
    const transaction = transactions.find(t => t.id === transactionId);
    
    if (!transaction) return null;

    const finalValue = isSell 
      ? (transaction.input_value * transaction.exchange_rate - transaction.commission)
      : (transaction.input_value * transaction.exchange_rate - transaction.commission);

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-5 rounded shadow-lg max-w-md w-full">
          <h2 className="text-xl font-bold mb-4">
            Szczegóły {isSell ? 'sprzedaży' : 'kupna'}: {transaction.name}
          </h2>
          <div className="space-y-2 mb-4">
            <p><strong>ID:</strong> {transaction.uid}</p>
            <p><strong>Data zlecenia:</strong> {new Date(transaction.submitted_at).toLocaleString()}</p>
            <p><strong>Wartość {isSell ? 'EUR' : 'USD'}:</strong> {transaction.input_value.toFixed(2)}</p>
            <p><strong>Kurs:</strong> {transaction.exchange_rate.toFixed(4)}</p>
            <p><strong>Prowizja:</strong> {transaction.commission.toFixed(2)} {isSell ? 'USD' : 'USD'}</p>
            <p><strong>Data wykonania:</strong> {transaction.executed_at ? new Date(transaction.executed_at).toLocaleString() : "Nie wykonano"}</p>
            <p><strong>Wartość końcowa:</strong> {finalValue.toFixed(2)} {isSell ? 'USD' : 'EUR'}</p>
          </div>

          {!transaction.executed_at && (
            <div className="mb-4">
              <input
                type="datetime-local"
                value={isSell ? executedAtSell : executedAtBuy}
                onChange={(e) => isSell 
                  ? setExecutedAtSell(e.target.value) 
                  : setExecutedAtBuy(e.target.value)}
                className="border px-3 py-2 rounded w-full mb-2"
              />
              <button 
                onClick={() => handleAddDate(transactionId!, isSell)}
                className="bg-green-500 text-white px-4 py-2 rounded w-full">
                Wykonaj transakcję
              </button>
            </div>
          )}

          <div className="flex space-x-2">
            <button
              onClick={() => deleteTransaction(transactionId!, isSell)}
              className="bg-red-600 text-white px-4 py-2 rounded flex-1">
              Usuń
            </button>
            <button
              onClick={() => isSell 
                ? setSelectedTransactionIdSell(null) 
                : setSelectedTransactionIdBuy(null)}
              className="bg-gray-500 text-white px-4 py-2 rounded flex-1">
              Zamknij
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (!user) {
    return <div className="flex items-center justify-center h-screen">Logowanie...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <SideBar
        isLoggedIn={isLoggedIn}
        user={user}
        handleLogout={() => {
          localStorage.clear();
          navigate('/login');
        }}
      />

      <div className="flex-grow p-6 bg-white overflow-auto">
        <h1 className="text-4xl font-bold mb-6">USD Exchange Dashboard</h1>

        {/* Dashboard z metrykami */}
        {walletData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-100 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800">Całkowity USD</h3>
              <p className="text-2xl font-bold text-blue-900">
                ${(walletData.all_wallet_usd_no_used+getUsdUsed()).toFixed(2)}
              </p>
            </div>
            <div className="bg-green-100 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800">USD Wolne</h3>
              <p className="text-2xl font-bold text-green-900">
                ${walletData.all_wallet_usd_no_used.toFixed(2)}
              </p>
            </div>
            <div className="bg-yellow-100 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-800">USD Zajęte</h3>
              <p className="text-2xl font-bold text-yellow-900">
                ${getUsdUsed().toFixed(2)}
              </p>
            </div>
            <div className="bg-purple-100 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-800">EUR w portfelu</h3>
              <p className="text-2xl font-bold text-purple-900">
                €{walletData.all_eur_in_usd_wallet.toFixed(2)}
              </p>
            </div>
          </div>
        )}

        {/* Zarządzanie portfelem */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h2 className="text-2xl font-bold mb-4">Zarządzaj portfelem</h2>
          <div className="flex space-x-4 mb-4">
            <div className="flex">
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="Kwota wpłaty USD"
                className="border px-3 py-2 rounded-l"
              />
              <button onClick={handleDeposit} className="bg-green-500 text-white px-4 py-2 rounded-r">
                Wpłać
              </button>
            </div>
            <div className="flex">
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Kwota wypłaty USD"
                className="border px-3 py-2 rounded-l"
              />
              <button onClick={handleWithdraw} className="bg-red-500 text-white px-4 py-2 rounded-r">
                Wypłać
              </button>
            </div>
          </div>
        </div>

        {/* Główna sekcja transakcji */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Kupno EUR */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-blue-600">Kup EUR</h2>
            <form onSubmit={handleSubmitBuy} className="space-y-4">
              <input
                type="text"
                name="name"
                value={formDataBuy.name}
                onChange={handleInputChangeBuy}
                placeholder="Nazwa transakcji"
                className="border px-3 py-2 w-full rounded"
                required
              />
              <input
                type="number"
                step="0.01"
                name="input_value"
                value={formDataBuy.input_value}
                onChange={handleInputChangeBuy}
                placeholder="Wartość USD"
                className="border px-3 py-2 w-full rounded"
                required
              />
              <input
                type="number"
                step="0.0001"
                name="exchange_rate"
                value={formDataBuy.exchange_rate}
                onChange={handleInputChangeBuy}
                placeholder="Kurs USD/EUR"
                className="border px-3 py-2 w-full rounded"
                required
              />
              <input
                type="number"
                step="0.01"
                name="commission"
                value={formDataBuy.commission}
                onChange={handleInputChangeBuy}
                placeholder="Prowizja USD"
                className="border px-3 py-2 w-full rounded"
                required
              />
              <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded w-full">
                Złóż zlecenie kupna
              </button>
            </form>

            <h3 className="text-xl font-bold mt-6 mb-3">Transakcje kupna</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {transactionsBuy.map((transaction) => (
                <div key={transaction.id} 
                     className={`flex justify-between items-center p-3 border rounded ${
                       transaction.executed_at ? 'bg-green-50' : 'bg-yellow-50'
                     }`}>
                  <div>
                    <span className="font-medium">{transaction.name}</span>
                    <span className={`ml-2 px-2 py-1 text-xs rounded ${
                      transaction.executed_at ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'
                    }`}>
                      {transaction.executed_at ? 'Wykonano' : 'Oczekuje'}
                    </span>
                  </div>
                  <button 
                    onClick={() => setSelectedTransactionIdBuy(transaction.id)}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm">
                    Szczegóły
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Sprzedaż EUR */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-red-600">Sprzedaj EUR</h2>
            <form onSubmit={handleSubmitSell} className="space-y-4">
              <select
                name="name"
                value={formDataSell.name}
                onChange={handleInputChangeSell}
                className="border px-3 py-2 w-full rounded"
                required
              >
                <option value="">Wybierz transakcję do sprzedaży</option>
                {getAvailableTransactionsForSell().map((transaction) => (
                  <option key={transaction.id} value={transaction.name}>
                    {transaction.name} (€{(transaction.input_value * transaction.exchange_rate - transaction.commission).toFixed(2)})
                  </option>
                ))}
              </select>
              <input
                type="number"
                step="0.0001"
                name="exchange_rate"
                value={formDataSell.exchange_rate}
                onChange={handleInputChangeSell}
                placeholder="Kurs sprzedaży EUR/USD"
                className="border px-3 py-2 w-full rounded"
                required
              />
              <input
                type="number"
                step="0.01"
                name="commission"
                value={formDataSell.commission}
                onChange={handleInputChangeSell}
                placeholder="Prowizja USD"
                className="border px-3 py-2 w-full rounded"
                required
              />
              <button type="submit" className="bg-red-500 text-white px-6 py-2 rounded w-full">
                Złóż zlecenie sprzedaży
              </button>
            </form>

            <h3 className="text-xl font-bold mt-6 mb-3">Transakcje sprzedaży</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {transactionsSell.map((transaction) => (
                <div key={transaction.id} 
                     className={`flex justify-between items-center p-3 border rounded ${
                       transaction.executed_at ? 'bg-green-50' : 'bg-yellow-50'
                     }`}>
                  <div>
                    <span className="font-medium">{transaction.name}</span>
                    <span className={`ml-2 px-2 py-1 text-xs rounded ${
                      transaction.executed_at ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'
                    }`}>
                      {transaction.executed_at ? 'Wykonano' : 'Oczekuje'}
                    </span>
                  </div>
                  <button 
                    onClick={() => setSelectedTransactionIdSell(transaction.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm">
                    Szczegóły
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Historia wpłat i wypłat */}
        <div className="mt-6 bg-white border rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Historia wpłat i wypłat</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-3 text-left">Data</th>
                  <th className="border p-3 text-left">Typ</th>
                  <th className="border p-3 text-right">Kwota</th>
                </tr>
              </thead>
              <tbody>
                {history.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="border p-3">{new Date(transaction.date).toLocaleString()}</td>
                    <td className="border p-3">
                      <span className={`px-2 py-1 rounded text-sm ${
                        transaction.inOut ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.inOut ? 'Wpłata' : 'Wypłata'}
                      </span>
                    </td>
                    <td className="border p-3 text-right">${transaction.value.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

{/* Komunikaty */}
        {error && (
          <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50">
            {successMessage}
          </div>
        )}

        {/* Modals */}
        {selectedTransactionIdBuy && renderDetailsModal(false)}
        {selectedTransactionIdSell && renderDetailsModal(true)}
      </div>
    </div>
  );
};

export default Usd;