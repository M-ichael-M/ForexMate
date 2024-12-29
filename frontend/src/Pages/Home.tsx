import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styled-components.css';

const Home = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<string[]>([]); 
    const [newUser, setNewUser] = useState<string>(''); 
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<{ email: string; username: string } | null>(null);

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        const storedEmail = localStorage.getItem('email');
    
        if (storedUsername && storedEmail) {
            setIsLoggedIn(true);
            setUser({
                email: storedEmail, 
                username: storedUsername
            });
        } else {
            setIsLoggedIn(false);
            setUser(null);
        }
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        setIsLoggedIn(false); // Ustawienie stanu, że użytkownik jest wylogowany
        setUser(null); // Wyczyszczenie danych użytkownika
        navigate('/login'); // Przekierowanie użytkownika na stronę logowania
    };

    useEffect(() => {
        axios.get('http://127.0.0.1:5001/api/users')
            .then(response => setUsers(response.data))
            .catch(error => console.log(error));
    }, []);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        axios.post('http://127.0.0.1:5001/api/users', { name: newUser })
            .then(() => {
                setUsers([...users, newUser]);
                setNewUser('');
            })
            .catch(error => console.log(error));
    };

    return (
        <div className="container centered">
            <h1 className="title">ForexMate</h1><br/>
            
            <div className="auth-controls">
                {isLoggedIn && user ? (
                    <div className='LogIn'>
                        <tr className='userPanel'>
                            <th><p className='welcome'>Witaj, {user.username}</p></th>
                            <th><button className="logout-button" onClick={handleLogout}>Wyloguj</button></th>
                        </tr>
                        <ul className="user-list">
                            {users.map((user, index) => (
                                <li key={index} className="user-item">{user.username}</li>
                            ))}
                        </ul>

                        <form onSubmit={handleSubmit} className="user-form">
                            <input 
                                type="text" 
                                value={newUser} 
                                onChange={(e) => setNewUser(e.target.value)} 
                                placeholder="Enter new user" 
                                className="user-input"
                            />
                            <button type="submit" className="submit-button">Add User</button>
                        </form>
                    </div>
                ) : (
                    <div className='NoLogin'>
                        <p className='info'>By korzystać z programu musisz być zalogowany</p>
                        <a href="/login" className="nav-button">Zaloguj się</a>
                        <a href="/register" className="nav-button">Zarejestruj się</a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
