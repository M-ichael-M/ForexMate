import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SideBar from './SideBar.tsx';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Eur: React.FC = () => {
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
      setUser({ email: storedEmail, username: storedUsername });
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
    axios
      .get('http://127.0.0.1:5001/api/users')
      .then((response) => setUsers(response.data))
      .catch((error) => console.log(error));
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    axios
      .post('http://127.0.0.1:5001/api/users', { name: newUser })
      .then(() => {
        setUsers([...users, newUser]);
        setNewUser('');
      })
      .catch((error) => console.log(error));
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <SideBar isLoggedIn={isLoggedIn} user={user} handleLogout={handleLogout} />
      <div className="flex-grow p-5 bg-white shadow-md">
        </div>
    </div>
  );
};

export default Eur;
