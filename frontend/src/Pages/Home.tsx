import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SideBar from './SideBar.tsx';
import axios from 'axios';

const Home: React.FC = () => {
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
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 gap-6">
      <Link to="/usd" className="relative h-32 rounded-lg shadow-lg overflow-hidden">
        <img
          src="/money.png" 
          alt="USD Background"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 transform hover:scale-105"
        />
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center rounded-lg transition-all duration-300 hover:bg-opacity-40">
          <span className="text-white font-bold text-xl">USD</span>
        </div>
      </Link>
      <Link to="/eur" className="relative h-32 rounded-lg shadow-lg overflow-hidden">
        <img
          src="/Euro.jpg" 
          alt="EUR Background"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 transform hover:scale-105"
        />
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center rounded-lg transition-all duration-300 hover:bg-opacity-40">
          <span className="text-white font-bold text-xl">EUR</span>
        </div>
      </Link>
      <Link to="/pln" className="relative h-32 rounded-lg shadow-lg overflow-hidden">
        <img
          src="/zloty.jpg" 
          alt="EUR Background"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 transform hover:scale-105"
        />
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center rounded-lg transition-all duration-300 hover:bg-opacity-40">
          <span className="text-white font-bold text-xl">PLN</span>
        </div>
      </Link>
    </div>
  </div>
</div>


  );
};

export default Home;