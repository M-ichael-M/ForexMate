import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import LeftSide from './leftSide.tsx';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      navigate("/"); // Przekierowanie na stronę główną, jeśli użytkownik jest zalogowany
    }
  }, [navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");
    axios
      .post("http://127.0.0.1:5001/api/login", formData)
      .then((response) => {
        const { username, email } = response.data;
        localStorage.setItem("username", username);
        localStorage.setItem("email", email);
        setSuccess(true);
        setTimeout(() => {
          navigate("/home"); // Przekierowanie na stronę główną po udanym logowaniu
        }, 2000);
      })
      .catch((error) => {
        setError(error.response?.data?.message || "Coś poszło nie tak.");
      });
  };


  return (
    <div className="flex h-screen bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500">
  <LeftSide />
  <div className="flex-2 flex justify-center items-center w-screen">
    <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-3xl font-semibold text-center text-indigo-700 mb-6">
        Zaloguj się
      </h2>
      {success ? (
        <p className="text-green-600 text-center">
          Logowanie zakończone sukcesem! Przekierowanie do strony głównej...
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
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
            Zaloguj się
          </button>
        </form>
      )}
      {!success && (
        <div className="text-center mt-4">
          <p>Nie masz konta?</p>
          <Link
            to="/register"
            className="text-indigo-600 hover:underline font-medium"
          >
            Zarejestruj się
          </Link>
        </div>
      )}
    </div>
  </div>
</div>

  );
};

export default Login;
