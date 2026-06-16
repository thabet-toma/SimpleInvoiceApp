import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Tag, Building2 } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<any[]>([]);
  const [tenantId, setTenantId] = useState('6');
  const [sales, setSales] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);

  useEffect(() => {
    fetchTenants();
  }, []);

  useEffect(() => {
    if (tenantId) {
      fetchInvoices();
    }
  }, [tenantId]);

  const fetchTenants = async () => {
    try {
      const res = await axios.get(`${API_URL}/tenants`);
      setTenants(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchInvoices = async () => {
    try {
      const [salesRes, purchasesRes] = await Promise.all([
        axios.get(`${API_URL}/invoices/sale?tenantId=${tenantId}`),
        axios.get(`${API_URL}/invoices/purchase?tenantId=${tenantId}`)
      ]);
      setSales(salesRes.data);
      setPurchases(purchasesRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="dashboard-container" dir="rtl">
      <h2>مرحباً بك في نظام الفواتير المبسط</h2>
      
      <div className="section-box" style={{ borderColor: 'var(--primary-color)', backgroundColor: '#eff6ff', marginBottom: '20px' }}>
        <label className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Building2 size={18} />
          الشركة المحددة لعرض فواتيرها
        </label>
        <select 
          className="form-input"
          value={tenantId} 
          onChange={e => setTenantId(e.target.value)}
          style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}
        >
          {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

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

      <div style={{ marginTop: '40px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <div className="section-box flex-1" style={{ minWidth: '300px' }}>
          <h3 style={{ color: '#2563eb', borderBottom: '2px solid #2563eb', paddingBottom: '10px' }}>آخر فواتير المبيعات</h3>
          <table style={{ width: '100%', textAlign: 'right', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #ddd' }}>
                <th style={{ padding: '8px' }}>الرقم</th>
                <th style={{ padding: '8px' }}>التاريخ</th>
                <th style={{ padding: '8px' }}>العميل</th>
                <th style={{ padding: '8px' }}>المبلغ</th>
              </tr>
            </thead>
            <tbody>
              {sales.length === 0 ? <tr><td colSpan={4} style={{ padding: '10px', textAlign: 'center' }}>لا توجد فواتير</td></tr> : null}
              {sales.map(inv => (
                <tr key={inv.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '8px' }}>{inv.number}</td>
                  <td style={{ padding: '8px' }}>{inv.date}</td>
                  <td style={{ padding: '8px' }}>{inv.partnerName || '-'}</td>
                  <td style={{ padding: '8px', fontWeight: 'bold' }}>{inv.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="section-box flex-1" style={{ minWidth: '300px' }}>
          <h3 style={{ color: '#16a34a', borderBottom: '2px solid #16a34a', paddingBottom: '10px' }}>آخر فواتير المشتريات</h3>
          <table style={{ width: '100%', textAlign: 'right', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #ddd' }}>
                <th style={{ padding: '8px' }}>الرقم</th>
                <th style={{ padding: '8px' }}>التاريخ</th>
                <th style={{ padding: '8px' }}>المورد</th>
                <th style={{ padding: '8px' }}>المبلغ</th>
              </tr>
            </thead>
            <tbody>
              {purchases.length === 0 ? <tr><td colSpan={4} style={{ padding: '10px', textAlign: 'center' }}>لا توجد فواتير</td></tr> : null}
              {purchases.map(inv => (
                <tr key={inv.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '8px' }}>{inv.number}</td>
                  <td style={{ padding: '8px' }}>{inv.date}</td>
                  <td style={{ padding: '8px' }}>{inv.partnerName || '-'}</td>
                  <td style={{ padding: '8px', fontWeight: 'bold' }}>{inv.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
