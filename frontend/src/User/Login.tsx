import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styled-components.css';
import axios from 'axios';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
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
        axios.post('http://127.0.0.1:5001/api/login', formData)
            .then((response) => {
                const { username, email } = response.data;
                localStorage.setItem('username', username);
                localStorage.setItem('email', email);
                setSuccess(true);
                setTimeout(() => {
                    navigate('/'); // Przekierowanie na stronę główną po udanym logowaniu
                }, 2000);
            })
            .catch((error) => {
                setError(error.response?.data?.message || 'Coś poszło nie tak.');
            });
    };

    return (
        <div className="container">
            <h1 className="title">Logowanie</h1>
            <div className="form-container">
                {success ? (
                    <p className="success-message">Logowanie zakończone sukcesem! Przekierowanie do strony głównej...</p>
                ) : (
                    <form onSubmit={handleSubmit} className="register-form">
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
                        <button type="submit" className="submit-button">Zaloguj się</button>
                        <br/><br/>
                        <p>Nie masz konta?</p>
                        <a href="/register" className="nav-button">Zarejestruj się</a>

                    </form>
                )}
            </div>
        </div>
    );
};

export default Login;
