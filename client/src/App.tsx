import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';
import InvoiceForm from './InvoiceForm';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setIsAuthenticated(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  return (
    <BrowserRouter>
      <div className="app-container">
        {isAuthenticated && (
          <div className="top-bar">
            <h1 style={{ color: 'var(--primary-color)', fontSize: '1.5rem', margin: 0 }}>نظام KTRA المبسط للفواتير</h1>
            <button onClick={handleLogout} className="btn-logout">تسجيل خروج</button>
          </div>
        )}
        <div className="main-content">
          <Routes>
            <Route 
              path="/login" 
              element={!isAuthenticated ? <Login onLogin={() => setIsAuthenticated(true)} /> : <Navigate to="/dashboard" />} 
            />
            <Route 
              path="/dashboard" 
              element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/sales" 
              element={isAuthenticated ? <InvoiceForm type="sale" /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/purchase" 
              element={isAuthenticated ? <InvoiceForm type="purchase" /> : <Navigate to="/login" />} 
            />
            <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;
