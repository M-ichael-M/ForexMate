import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SideBar from './SideBar.tsx';
import axios from 'axios';

const Usd: React.FC = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ email: string; username: string; id: number } | null>(null);
  const [selectedTransactionId, setSelectedTransactionId] = useState<number | null>(null);
  const [executedAt, setExecutedAt] = useState<string>('');


  const [formData, setFormData] = useState({
    name: '',
    input_value: '',
    exchange_rate: '',
    commission: ''
  });

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUser(null);
    navigate('/login');
  };

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]); // Fetch danych tylko po zalogowaniu
  

  const fetchTransactions = () => {
    if (!user) {
      setTransactions([]); // Jeśli użytkownik nie jest zalogowany, lista transakcji powinna być pusta
      return;
    }
  
    axios
      .get(`http://127.0.0.1:5001/api/usd?user_name=${user.username}`)
      .then((response) => setTransactions(response.data))
      .catch((error) => {
        console.error('Błąd pobierania transakcji:', error);
        setError('Nie udało się pobrać transakcji.');
      });
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError("Nie jesteś zalogowany.");
      return;
    }

    const { name, input_value, exchange_rate, commission } = formData;

    if (!name || !input_value || !exchange_rate || !commission) {
      setError("Wszystkie pola są wymagane.");
      return;
    }

    const data = {
      user_name: user.username,
      name,
      input_value: parseFloat(input_value),
      exchange_rate: parseFloat(exchange_rate),
      commission: parseFloat(commission)
    };

    axios
      .post('http://127.0.0.1:5001/api/usd/', data)
      .then(() => {
        setSuccessMessage("Transakcja została pomyślnie dodana!");
        setError(null);
        fetchTransactions();
      })
      .catch(() => {
        setError("Wystąpił błąd podczas dodawania transakcji.");
        setSuccessMessage(null);
      });
  };


  const handleDelete = (id: number) => {
    axios
      .delete(`http://127.0.0.1:5001/api/usd/${id}`)
      .then(() => {
        setSuccessMessage("Transakcja została usunięta.");
        fetchTransactions();
      })
      .catch(() => {
        setError("Wystąpił błąd podczas usuwania transakcji.");
      });
  };

  const handleAddDate = (id: number) => {
    if (!executedAt) {
      setError("Musisz podać datę.");
      return;
    }
  
    // Zamiana daty na format RFC 1123
    const dateObj = new Date(executedAt);
    const formattedDate = dateObj.toUTCString();
  
    const data = {
      executed_at: formattedDate, // Teraz wysyłamy datę w formacie RFC 1123
    };
  
    axios
      .put(`http://127.0.0.1:5001/api/usd/${id}`, data)
      .then(() => {
        setSuccessMessage("Data wykonania została dodana.");
        setError(null);
        setSelectedTransactionId(null); // Zamykamy formularz
        fetchTransactions(); // Ponowne pobranie transakcji
      })
      .catch(() => {
        setError("Wystąpił błąd podczas aktualizacji daty.");
        setSuccessMessage(null);
      });
  };
  
  

  return (
    <div className="flex h-screen bg-gray-100">
      <SideBar isLoggedIn={isLoggedIn} user={user} handleLogout={handleLogout} />
      <div className="flex-grow p-5 bg-white shadow-md">
        <h1 className="text-2xl font-bold mb-4">USD Transactions</h1>

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
            placeholder="Input Value"
            className="border px-4 py-2 w-full mb-4"
          />
          <input
            type="number"
            name="exchange_rate"
            value={formData.exchange_rate}
            onChange={handleInputChange}
            placeholder="Exchange Rate"
            className="border px-4 py-2 w-full mb-4"
          />
          <input
            type="number"
            name="commission"
            value={formData.commission}
            onChange={handleInputChange}
            placeholder="Commission"
            className="border px-4 py-2 w-full mb-4"
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Dodaj transakcję
          </button>
          {error && <p className="text-red-500 mt-2">{error}</p>}
          {successMessage && <p className="text-green-500 mt-2">{successMessage}</p>}
        </form>

        {/* Wyświetlanie transakcji */}
        <h2 className="text-xl font-bold mt-6">Historia transakcji</h2>
        <table className="w-full mt-4 border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">ID</th>
              <th className="border p-2">Data</th>
              <th className="border p-2">Nazwa</th>
              <th className="border p-2">Kwota</th>
              <th className="border p-2">Kurs</th>
              <th className="border p-2">Po wymianie</th>
              <th className="border p-2">Prowizja</th>
              <th className="border p-2">Po prowizji</th>
              <th className="border p-2">Data wykonania</th>
              <th className="border p-2">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="text-center">
                <td className="border p-2">{transaction.submitted_at}</td>
                <td className="border p-2">{new Date(transaction.submitted_at).toLocaleString()}</td>
                <td className="border p-2">{transaction.name}</td>
                <td className="border p-2">{transaction.input_value} USD</td>
                <td className="border p-2">{transaction.exchange_rate}</td>
                <td className="border p-2">{Number(transaction.input_value) * Number(transaction.exchange_rate)}</td>
                <td className="border p-2">{transaction.user_name}</td>
                <td className="border p-2">{Number(transaction.input_value) * Number(transaction.exchange_rate)-Number(transaction.commission)}</td>
                <td className="border p-2">
                  {transaction.executed_at ? transaction.executed_at : (
                    <>
                      <button
                        onClick={() => setSelectedTransactionId(transaction.id)}
                        className="bg-green-500 text-white px-2 py-1 rounded"
                      >
                        Dodaj
                      </button>
                      {selectedTransactionId === transaction.id && (
                        <div className="mt-2">
                          <input
                            type="datetime-local"
                            value={executedAt}
                            onChange={(e) => setExecutedAt(e.target.value)}
                            className="border p-2"
                          />
                          <button
                            onClick={() => handleAddDate(transaction.id)}
                            className="bg-blue-500 text-white px-2 py-1 rounded mt-2"
                          >
                            Zapisz datę
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </td>

                <td className="border p-2">
                  <button onClick={() => handleDelete(transaction.id)} className="bg-red-500 text-white px-2 py-1 rounded">
                    Usuń
                  </button>
                  <span>⠀⠀</span>
                  <button onClick={() => {}} className="bg-blue-500 text-white px-2 py-1 rounded">
                    Szczegóły
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Usd;