import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styled-components.css';
import axios from 'axios';

const Register = () => {
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
        <div className="container">
            <h1 className="title">Rejestracja</h1>
            <div className="form-container">
                {success ? (
                    <p className="success-message">Rejestracja zakończona sukcesem! Przekierowanie do logowania...</p>
                ) : (
                    <form onSubmit={handleSubmit} className="register-form">
                        <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            placeholder="Imię"
                            className="form-input"
                            required
                        /><br/>
                        <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            placeholder="Nazwisko"
                            className="form-input"
                            required
                        /><br/>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Email"
                            className="form-input"
                            required
                        /><br/>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Nazwa użytkownika"
                            className="form-input"
                            required
                        /><br/>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Hasło"
                            className="form-input"
                            required
                        /><br/>
                        {error && <p className="error-message">{error}</p>}
                        <button type="submit" className="submit-button">Zarejestruj się</button>
                        <br/><br/>
                        <p>Masz już konto?</p>
                        <a href="/login" className="nav-button">Zaloguj się</a>

                    </form>
                )}
            </div>
        </div>
    );
};

export default Register;
