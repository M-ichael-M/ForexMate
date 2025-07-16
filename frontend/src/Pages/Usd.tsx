import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SideBar from './SideBar.tsx';
import axios from 'axios';

const Usd: React.FC = () => {
  const navigate = useNavigate();
  const [transactionsBuy, setTransactionsBuy] = useState<any[]>([]);
  const [transactionsSell, setTransactionsSell] = useState<any[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ email: string; username: string; id: number } | null>(null);
  const [selectedTransactionIdBuy, setSelectedTransactionIdBuy] = useState<number | null>(null);
  const [executedAtBuy, setExecutedAtBuy] = useState<string>('');
  const [selectedTransactionIdSell, setSelectedTransactionIdSell] = useState<number | null>(null);
  const [executedAtSell, setExecutedAtSell] = useState<string>('');

  const [walletData, setWalletData] = useState<{
  all_wallet_usd_in_usd: number;
  all_wallet_usd_no_used: number;
  all_eur_in_usd_wallet: number;
  } | null>(null);

  // Stany dla formularzy
  const [formDataBuy, setFormDataBuy] = useState({
    name: '',
    input_value: '',
    exchange_rate: '',
    commission: ''
  });

  const [formDataSell, setFormDataSell] = useState({
    name: '',
    input_value: '',
    exchange_rate: '',
    commission: ''
  });

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [history, setHistory] = useState<any[]>([]);

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

  // Fetch transakcji dla obu typów
  useEffect(() => {
    if (user) {
      fetchTransactionsBuy();
      fetchTransactionsSell();
    }
  }, [user]);

  useEffect(() => {
  if (user) {
    fetchWalletData();
  }
  }, [user]);

  const fetchWalletData = () => {
    axios
      .get(`http://127.0.0.1:5001/api/wallet/${user?.username}`)
      .then((response) => {
        setWalletData(response.data);
      })
      .catch((error) => {
        console.error("Błąd pobierania portfela:", error);
      });
  };

  const fetchHistory = () => {
    axios
      .get(`http://127.0.0.1:5001/api/wallet/history/${user?.username}`)
      .then((response) => setHistory(response.data))
      .catch((error) => console.error("Błąd pobierania historii:", error));
  };

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
        fetchWalletData(); // Aktualizacja stanu portfela
        fetchHistory();    // Aktualizacja historii
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
        fetchWalletData(); // Aktualizacja stanu portfela
        fetchHistory();    // Aktualizacja historii
        setWithdrawAmount('');
      })
      .catch((error) => {
        setError(error.response?.data?.message || "Błąd przy wypłacie");
        setTimeout(() => setError(null), 5000);
      });
  };

  useEffect(() => {
    if (user) {
      fetchWalletData();
      fetchHistory();
    }
  }, [user]);

  const fetchTransactionsBuy = () => {
    axios
      .get(`http://127.0.0.1:5001/api/usd?user_name=${user?.username}`)
      .then((response) => setTransactionsBuy(response.data))
      .catch(() => setTransactionsBuy([]));
  };

  const fetchTransactionsSell = () => {
    axios
      .get(`http://127.0.0.1:5001/api/usdEur?user_name=${user?.username}`)
      .then((response) => setTransactionsSell(response.data))
      .catch(() => setTransactionsSell([]));
  };

  // Handlery dla kupna
  const handleInputChangeBuy = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormDataBuy((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitBuy = (e: React.FormEvent) => {
    e.preventDefault();
    submitForm(formDataBuy, 'http://127.0.0.1:5001/api/usd/', fetchTransactionsBuy);
  };

  // Handlery dla sprzedaży
  const handleInputChangeSell = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormDataSell((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitSell = (e: React.FormEvent) => {
    e.preventDefault();
    submitForm(formDataSell, 'http://127.0.0.1:5001/api/usdEur/', fetchTransactionsSell);
  };

  const submitForm = (formData: any, url: string, fetchFunction: () => void) => {
    if (!user) {
      setError("Nie jesteś zalogowany.");
      setTimeout(() => setError(null), 5000); // Dodane
      return;
    }

    const data = {
    user_name: user.username,
    ...formData,
    input_value: parseFloat(formData.input_value),
    exchange_rate: parseFloat(formData.exchange_rate),
    commission: parseFloat(formData.commission)
  };

  axios
    .post(url, data)
    .then(() => {
      setSuccessMessage("Transakcja została pomyślnie dodana!");
      setTimeout(() => setSuccessMessage(null), 5000); // Dodane
      setError(null);
      fetchFunction();
      resetForm(url.includes('usdEur') ? setFormDataSell : setFormDataBuy);
    })
    .catch(() => {
      setError("Wystąpił błąd podczas dodawania transakcji.");
      setTimeout(() => setError(null), 5000); // Dodane
      setSuccessMessage(null);
    });
  };

  const resetForm = (setter: React.Dispatch<React.SetStateAction<any>>) => {
    setter({
      name: '',
      input_value: '',
      exchange_rate: '',
      commission: ''
    });
  };

  // Usuwanie transakcji
  const deleteTransaction = (id: number, isSell: boolean) => {
    const url = `http://127.0.0.1:5001/api/${isSell ? 'usdEur' : 'usd'}/${id}`;
    axios
      .delete(url)
      .then(() => {
        isSell 
          ? setTransactionsSell(prev => prev.filter(t => t.id !== id))
          : setTransactionsBuy(prev => prev.filter(t => t.id !== id));
        isSell 
          ? setSelectedTransactionIdSell(null) 
          : setSelectedTransactionIdBuy(null);
      })
      .catch((error) => console.error("Błąd przy usuwaniu:", error));
  };

  // Dodawanie daty wykonania
  const handleAddDate = (id: number, isSell: boolean) => {
    const executedAt = isSell ? executedAtSell : executedAtBuy;
    if (!executedAt) {
      setError("Musisz podać datę.");
      setTimeout(() => setError(null), 5000); // Dodane
      return;
    }

    const formattedDate = new Date(executedAt).toUTCString();
    const url = `http://127.0.0.1:5001/api/${isSell ? 'usdEur' : 'usd'}/${id}`;
  
    axios
      .put(url, { executed_at: formattedDate })
      .then(() => {
        setSuccessMessage("Data wykonania zaktualizowana!");
        setTimeout(() => setSuccessMessage(null), 5000); // Dodane
        setError(null);
        isSell ? fetchTransactionsSell() : fetchTransactionsBuy();
      })
      .catch(() => {
        setError("Błąd aktualizacji daty");
        setTimeout(() => setError(null), 5000); // Dodane
      });
  };

  // Funkcja pomocnicza do renderowania modala
  const renderDetailsModal = (isSell: boolean) => {
    const transactionId = isSell ? selectedTransactionIdSell : selectedTransactionIdBuy;
    const transactions = isSell ? transactionsSell : transactionsBuy;
    const transaction = transactions.find(t => t.id === transactionId);
    
    if (!transaction) return null;

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-5 rounded shadow-lg">
          <h2 className="text-xl font-bold mb-4">Szczegóły transakcji {transaction.name}</h2>
          <div>
            <p><strong>ID:</strong> {transaction.uid}</p>
            <p><strong>Data zlecenia:</strong> {transaction.submitted_at}</p>
            <p><strong>Wartość początkowa:</strong> {transaction.input_value} USD</p>
            <p><strong>Kurs wymiany:</strong> {transaction.exchange_rate} USD/EUR</p>
            <p><strong>Prowizja:</strong> {transaction.commission} USD</p>
            <p><strong>Data wykonania:</strong> {transaction.executed_at || "Nie ustawiono"}</p>
            <p><strong>Wartość końcowa:</strong> 
              {(transaction.input_value * transaction.exchange_rate - transaction.commission).toFixed(2)} EUR
            </p>
          </div>

          {!transaction.executed_at && (
            <div className="mt-4">
              <input
                type="datetime-local"
                value={isSell ? executedAtSell : executedAtBuy}
                onChange={(e) => isSell 
                  ? setExecutedAtSell(e.target.value) 
                  : setExecutedAtBuy(e.target.value)}
                className="border px-4 py-2"
              />
              <button 
                onClick={() => handleAddDate(transactionId!, isSell)}
                className="ml-2 bg-green-500 text-white px-4 py-2 rounded">
                Dodaj datę
              </button>
            </div>
          )}

          <div className="mt-4">
            <button
              onClick={() => deleteTransaction(transactionId!, isSell)}
              className="bg-red-700 text-white px-4 py-2 rounded mr-2">
              Usuń
            </button>
            <button
              onClick={() => isSell 
                ? setSelectedTransactionIdSell(null) 
                : setSelectedTransactionIdBuy(null)}
              className="bg-gray-500 text-white px-4 py-2 rounded">
              Zamknij
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
     <div className="flex h-screen bg-gray-100">
      {/* 2) Sidebar */}
      <SideBar
        isLoggedIn={isLoggedIn}
        user={user}
        handleLogout={() => {
          localStorage.clear();
          navigate('/login');
        }}
      />

      {/* 3) Content po prawej, flex-grow */}
      <div className="flex-grow p-5 bg-white overflow-auto">
        <h1 className="text-5xl font-bold mb-4">USD</h1>

        {/* Sekcja wpłat i wypłat oraz historia */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Zarządzaj portfelem</h2>
          <div className="flex space-x-4 mb-4">
            <div>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="Kwota wpłaty"
                className="border px-4 py-2"
              />
              <button onClick={handleDeposit} className="ml-2 bg-green-500 text-white px-4 py-2 rounded">
                Wpłać
              </button>
            </div>
            <div>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Kwota wypłaty"
                className="border px-4 py-2"
              />
              <button onClick={handleWithdraw} className="ml-2 bg-red-500 text-white px-4 py-2 rounded">
                Wypłać
              </button>
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Historia wpłat i wypłat</h2>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Data</th>
                <th className="border p-2">Typ</th>
                <th className="border p-2">Kwota</th>
              </tr>
            </thead>
            <tbody>
              {history.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="border p-2">{new Date(transaction.date).toLocaleString()}</td>
                  <td className="border p-2">{transaction.inOut ? 'Wpłata' : 'Wypłata'}</td>
                  <td className="border p-2">{transaction.value.toFixed(2)} USD</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Istniejąca sekcja portfela */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Stan portfela</h2>
          {walletData ? (
            <ul className="list-disc ml-6">
              <li><strong>Wartość portfela USD w USD:</strong> {walletData.all_wallet_usd_in_usd.toFixed(2)}</li>
              <li><strong>USD nieużywane:</strong> {walletData.all_wallet_usd_no_used.toFixed(2)}</li>
              <li><strong>EUR przeliczone na USD:</strong> {walletData.all_eur_in_usd_wallet.toFixed(2)}</li>
            </ul>
          ) : (
            <p>Ładowanie danych portfela...</p>
          )}
        </div>

        {/* Reszta istniejącego kodu */}
        <div className="flex space-x-8">
          {/* Kupno */}
          <div className="w-1/2">
            <h2 className="text-3xl font-bold mb-4">Kup euro</h2>
            <TransactionForm
              formData={formDataBuy}
              handleInputChange={handleInputChangeBuy}
              handleSubmit={handleSubmitBuy}
            />
            <TransactionHistory
              transactions={transactionsBuy}
              onDetailsClick={(id) => setSelectedTransactionIdBuy(id)}
            />
            {selectedTransactionIdBuy && renderDetailsModal(false)}
          </div>

          {/* Sprzedaż */}
          <div className="w-1/2">
            <h2 className="text-3xl font-bold mb-4">Sprzedaj euro</h2>
            <TransactionForm
              formData={formDataSell}
              handleInputChange={handleInputChangeSell}
              handleSubmit={handleSubmitSell}
            />
            <TransactionHistory
              transactions={transactionsSell}
              onDetailsClick={(id) => setSelectedTransactionIdSell(id)}
            />
            {selectedTransactionIdSell && renderDetailsModal(true)}
          </div>
        </div>

        {error && <p className="text-red-500 mt-2">{error}</p>}
        {successMessage && <p className="text-green-500 mt-2">{successMessage}</p>}
      </div>
    </div>
  );
};

// Komponent pomocniczy dla formularza
const TransactionForm: React.FC<{
  formData: any,
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
  handleSubmit: (e: React.FormEvent) => void
}> = ({ formData, handleInputChange, handleSubmit }) => (
  <form onSubmit={handleSubmit} className="mb-6">
    <input
      type="text"
      name="name"
      value={formData.name}
      onChange={handleInputChange}
      placeholder="Nazwa transakcji"
      className="border px-4 py-2 w-full mb-4"
    />
    <input
      type="number"
      name="input_value"
      value={formData.input_value}
      onChange={handleInputChange}
      placeholder="Wartość początkowa"
      className="border px-4 py-2 w-full mb-4"
    />
    <input
      type="number"
      name="exchange_rate"
      value={formData.exchange_rate}
      onChange={handleInputChange}
      placeholder="Kurs"
      className="border px-4 py-2 w-full mb-4"
    />
    <input
      type="number"
      name="commission"
      value={formData.commission}
      onChange={handleInputChange}
      placeholder="Prowizja"
      className="border px-4 py-2 w-full mb-4"
    />
    <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
      Dodaj transakcję
    </button>
  </form>
);

// Komponent pomocniczy dla historii transakcji
const TransactionHistory: React.FC<{
  transactions: any[],
  onDetailsClick: (id: number) => void
}> = ({ transactions, onDetailsClick }) => (
  <>
    <h2 className="text-xl font-bold mt-6">Historia transakcji</h2>
    <table className="w-full mt-4 border-collapse border border-gray-300">
      <thead>
        <tr className="bg-gray-200">
          <th className="border p-2">Nazwa</th>
          <th className="border p-2">Akcje</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((transaction) => (
          <tr key={transaction.id} className="text-center">
            <td className="border p-2">{transaction.name}</td>
            <td className="border p-2">
              <button 
                onClick={() => onDetailsClick(transaction.id)}
                className="bg-blue-500 text-white px-2 py-1 rounded">
                Szczegóły
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </>
);

export default Usd;