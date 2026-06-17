import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Gift, Wallet, User } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CustomerDashboard = () => {
  const [points, setPoints] = useState(0);
  const [settings, setSettings] = useState<any>({});
  const [invoices, setInvoices] = useState<any[]>([]);
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName');
  const partnerId = localStorage.getItem('partnerId');

  useEffect(() => {
    if (!partnerId) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [partnerId]);

  const fetchData = async () => {
    try {
      const [pointsRes, settingsRes, invoicesRes] = await Promise.all([
        axios.get(`${API_URL}/customers/${partnerId}/points`),
        axios.get(`${API_URL}/settings`),
        axios.get(`${API_URL}/customers/${partnerId}/invoices`)
      ]);
      setPoints(pointsRes.data.points);
      setSettings(settingsRes.data);
      setInvoices(invoicesRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  const pointValue = parseFloat(settings.point_value_ils || '1');
  const discountValue = points * pointValue;

  return (
    <div className="dashboard-container" dir="rtl">
      <h2>أهلاً بك يا {userName}</h2>
      <p>هنا يمكنك متابعة نقاطك وخصوماتك الشخصية.</p>

      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '20px', flexWrap: 'wrap' }}>
        <div className="section-box" style={{ flex: '1', minWidth: '250px', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#fffbeb', borderColor: '#f59e0b' }}>
          <Gift size={40} color="#f59e0b" style={{ marginBottom: '10px' }} />
          <h3 style={{ color: '#b45309' }}>نقاط الخصم المكتسبة</h3>
          <span style={{ fontSize: '3rem', fontWeight: 'bold', color: '#f59e0b' }}>{points}</span>
        </div>

        <div className="section-box" style={{ flex: '1', minWidth: '250px', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#ecfdf5', borderColor: '#10b981' }}>
          <Wallet size={40} color="#10b981" style={{ marginBottom: '10px' }} />
          <h3 style={{ color: '#047857' }}>قيمة الخصم المتاحة</h3>
          <span style={{ fontSize: '3rem', fontWeight: 'bold', color: '#10b981' }}>{discountValue} ₪</span>
        </div>
      </div>
      
      <div className="section-box" style={{ marginTop: '20px', textAlign: 'center' }}>
        <p style={{ color: '#4b5563', fontSize: '1.1rem' }}>يتم احتساب النقاط تلقائياً مع كل عملية شراء جديدة. تواصل مع المبيعات لاستخدام رصيد الخصم في فاتورتك القادمة.</p>
      </div>

      <div className="section-box" style={{ marginTop: '30px' }}>
        <h3 style={{ color: '#2563eb', borderBottom: '2px solid #2563eb', paddingBottom: '10px', marginBottom: '15px' }}>فواتيرك السابقة</h3>
        <div className="table-responsive">
          <table style={{ width: '100%', textAlign: 'right', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #ddd' }}>
                <th style={{ padding: '10px' }}>رقم الفاتورة</th>
                <th style={{ padding: '10px' }}>التاريخ</th>
                <th style={{ padding: '10px' }}>الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? <tr><td colSpan={3} style={{ padding: '15px', textAlign: 'center' }}>لا يوجد فواتير حتى الآن</td></tr> : null}
              {invoices.map(inv => (
                <tr key={inv.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px' }}>{inv.number}</td>
                  <td style={{ padding: '10px' }}>{inv.date}</td>
                  <td style={{ padding: '10px', fontWeight: 'bold', color: '#16a34a' }}>{inv.total} ₪</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
