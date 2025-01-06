import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Pages/Home.tsx';
import Register from './User/RegisterForm.tsx';
import Login from './User/Login.tsx';
import Contact from './Pages/Contact.tsx';
import About from './Pages/About.tsx';
import Usd from './Pages/Usd.tsx';
import Eur from './Pages/Eur.tsx';
import Pln from './Pages/Pln.tsx';


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path='/home' element={<Home />} />
        <Route path='/usd' element={<Usd />}/>
        <Route path='/eur' element={<Eur />}/>
        <Route path='/pln' element={<Pln />}/>

      </Routes>
    </Router>
  );
};

export default App;
