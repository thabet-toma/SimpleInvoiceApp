import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Tag } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      <h2>مرحباً بك في نظام الفواتير المبسط</h2>
      <p>الرجاء اختيار نوع الفاتورة:</p>
      <div className="dashboard-buttons">
        <button className="btn-sale" onClick={() => navigate('/sales')}>
          <Tag size={40} />
          <span>فاتورة مبيعات جديدة</span>
        </button>
        <button className="btn-purchase" onClick={() => navigate('/purchase')}>
          <ShoppingCart size={40} />
          <span>فاتورة مشتريات جديدة</span>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
