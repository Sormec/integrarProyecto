import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock } from 'react-icons/fa'; 
import { FiEye, FiEyeOff } from 'react-icons/fi';
import logo from '../../assets/Logo.png';
import backgroundImage from '../../assets/fondo.jpg';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:3306/api/login',
        { email, password },
        { withCredentials: true }
      );
      console.log(response.data);
      navigate('/historias');
    } catch (error) {
      console.error('Error de login: ', error.response ? error.response.data : error);
    }
  };

  return (
    <div className="login-container flex flex-col items-center justify-center h-screen" style={{backgroundImage: `url(${backgroundImage})`, backgroundSize: 'auto',
      backgroundRepeat: 'repeat', backgroundPosition: 'top left', backgroundColor: '#464543', fontFamily: "'Bitter', serif" }}>
      <img src={logo} alt="Logo" className="mb-5" style={{ width: '230px', height: '230px', objectFit: 'contain' }} />
      <h1 style={{ marginTop: '20px', fontSize: '25px', fontWeight: 'bold' }}>Iniciar sesión</h1>
      <form className="login p-5 rounded shadow-lg w-80" onSubmit={handleLogin}>
        <div className="mb-4 flex items-center">
          <div className="flex items-center justify-center w-6 h-6 rounded-full mr-2" style={{ backgroundColor: '#464543' }}>
            <FaUser className="text-white" />
          </div>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email"
            className="w-full p-3 border rounded text-lg focus:outline-none" 
            style={{ borderColor: '#464543', color: '#464543', backgroundColor: 'transparent' }} required 
          />
        </div>
          <div className="mb-4 flex items-center relative">
            <div className="flex items-center justify-center w-6 h-6 rounded-full mr-2" style={{ backgroundColor: '#464543' }}>
              <FaLock className="text-white" /> 
            </div>
            <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña"
              className="w-full p-3 border rounded text-lg focus:outline-none" 
              style={{ borderColor: '#464543', color: '#464543', backgroundColor: 'transparent', fontFamily: 'Bitter, serif' }} required 
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-lg text-gray-600"
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          <button type="submit" className="w-full p-3 rounded text-lg cursor-pointer hover:opacity-90 active:opacity-80"
            style={{border: '2px solid #464543', backgroundColor: '#ffffff', color: '#464543', fontFamily: 'Bitter, serif' }}
          >
            Iniciar Sesión
          </button>
      </form>
    </div>
  );
};

export default Login;
