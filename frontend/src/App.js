import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './Pages/Home.tsx';
import Register from './User/RegisterForm.tsx';
import Login from './User/Login.tsx';
import Contact from './Pages/Contact.tsx';
import About from './Pages/About.tsx';
import Usd from './Pages/Usd.tsx';
import Eur from './Pages/Eur.tsx';
import Pln from './Pages/Pln.tsx';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("username");
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          localStorage.getItem("username") ? <Navigate to="/home" /> : <Login />
        } />
        <Route path="/register" element={
          localStorage.getItem("username") ? <Navigate to="/home" /> : <Register />}/>
        <Route path="/login" element={
          localStorage.getItem("username") ? <Navigate to="/home" /> : <Login />
        } />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/usd" element={<Usd />} />
        <Route path="/eur" element={<Eur />} />
        <Route path="/pln" element={<Pln />} />
      </Routes>
    </Router>
  );
};

export default App;
