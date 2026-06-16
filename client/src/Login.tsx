import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLogin }: { onLogin: () => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await axios.post(`${API_URL}/auth/login`, { username, password });
      localStorage.setItem('token', res.data.token);
      onLogin();
      navigate('/dashboard');
    } catch (err) {
      setError('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <h2>تسجيل الدخول للموظفين</h2>
        {error && <div className="error">{error}</div>}
        <input 
          type="text" 
          placeholder="اسم المستخدم" 
          value={username} 
          onChange={e => setUsername(e.target.value)}
          required
        />
        <input 
          type="password" 
          placeholder="كلمة المرور" 
          value={password} 
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit">دخول</button>
      </form>
    </div>
  );
};

export default Login;
