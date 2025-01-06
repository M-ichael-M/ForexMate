import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LeftSide from './leftSide.tsx';
import axios from 'axios';


const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        username: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            navigate('/'); // Przekierowanie na stronę główną, jeśli użytkownik jest zalogowany
        }
    }, [navigate]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        setError('');
        axios.post('http://127.0.0.1:5001/api/register', formData)
            .then(() => {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/login'); // Przekierowanie na stronę logowania po udanej rejestracji
                }, 1000);
            })
            .catch((error) => {
                setError(error.response?.data?.message || 'Coś poszło nie tak.');
            });
    };

  return (
    <div className="flex h-screen bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500">
        <LeftSide />
        <div className="flex-2 flex justify-center items-center w-screen">
            <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-semibold text-center text-indigo-700 mb-6">
                Zarejestruj się
            </h2>
            {success ? (
                <p className="text-green-600 text-center">
                Rejestracja zakończona sukcesem! Przekierowanie do logowania...
                </p>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Imię"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                    required
                />
                <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Nazwisko"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                    required
                />
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                    required
                />
                <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Nazwa użytkownika"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                    required
                />
                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Hasło"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                    required
                />
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-all duration-200"
                >
                    Zarejestruj się
                </button>
                <div className="text-center mt-4">
                    <p>Masz już konto?</p>
                    <Link
                    to="/login"
                    className="text-indigo-600 hover:underline font-medium"
                    >
                    Zaloguj się
                    </Link>
                </div>
                </form>
            )}
            </div>
        </div>
    </div>

  );
};

export default RegisterForm;
