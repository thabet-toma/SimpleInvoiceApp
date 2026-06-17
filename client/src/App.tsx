import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';
import InvoiceForm from './InvoiceForm';
import Settings from './Settings';
import Prices from './Prices';
import CustomerDashboard from './CustomerDashboard';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setIsAuthenticated(true);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
  };

  const isCustomer = () => localStorage.getItem('role') === 'customer';

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
              element={!isAuthenticated ? <Login onLogin={() => setIsAuthenticated(true)} /> : <Navigate to={isCustomer() ? "/customer-dashboard" : "/dashboard"} />} 
            />
            <Route 
              path="/dashboard" 
              element={isAuthenticated && !isCustomer() ? <Dashboard /> : <Navigate to={isCustomer() ? "/customer-dashboard" : "/login"} />} 
            />
            <Route 
              path="/sales" 
              element={isAuthenticated && !isCustomer() ? <InvoiceForm type="sale" /> : <Navigate to={isCustomer() ? "/customer-dashboard" : "/login"} />} 
            />
            <Route 
              path="/purchase" 
              element={isAuthenticated && !isCustomer() ? <InvoiceForm type="purchase" /> : <Navigate to={isCustomer() ? "/customer-dashboard" : "/login"} />} 
            />
            <Route 
              path="/prices" 
              element={isAuthenticated && !isCustomer() ? <Prices /> : <Navigate to={isCustomer() ? "/customer-dashboard" : "/login"} />} 
            />
            <Route 
              path="/settings" 
              element={isAuthenticated && !isCustomer() ? <Settings /> : <Navigate to={isCustomer() ? "/customer-dashboard" : "/login"} />} 
            />
            <Route 
              path="/customer-dashboard" 
              element={isAuthenticated && isCustomer() ? <CustomerDashboard /> : <Navigate to={!isCustomer() && isAuthenticated ? "/dashboard" : "/login"} />} 
            />
            <Route path="*" element={<Navigate to={isAuthenticated ? (isCustomer() ? "/customer-dashboard" : "/dashboard") : "/login"} />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;
