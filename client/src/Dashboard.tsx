import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Tag, Building2, X, Settings as SettingsIcon, List } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<any[]>([]);
  const [tenantId, setTenantId] = useState('6');
  const [sales, setSales] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  
  // Modal state
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [invoiceLines, setInvoiceLines] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const openInvoiceDetails = async (invoice: any, type: 'sale' | 'purchase') => {
    setSelectedInvoice({ ...invoice, type });
    setInvoiceLines([]);
    setIsModalOpen(true);
    try {
      const res = await axios.get(`${API_URL}/invoices/${type}/${invoice.id}`);
      setInvoiceLines(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedInvoice(null);
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

      <div className="dashboard-buttons" style={{ marginTop: '20px' }}>
        <button className="btn-sale" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', width: '250px' }} onClick={() => navigate('/prices')}>
          <List size={40} />
          <span>أسعار الزبائن</span>
        </button>
        <button className="btn-purchase" style={{ background: 'linear-gradient(135deg, #64748b, #475569)', width: '250px' }} onClick={() => navigate('/settings')}>
          <SettingsIcon size={40} />
          <span>إعدادات النظام</span>
        </button>
      </div>

      <div style={{ marginTop: '40px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <div className="section-box flex-1" style={{ minWidth: '300px' }}>
          <h3 style={{ color: '#2563eb', borderBottom: '2px solid #2563eb', paddingBottom: '10px' }}>آخر فواتير المبيعات</h3>
          <div className="table-responsive">
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
                  <tr 
                    key={inv.id} 
                    style={{ borderBottom: '1px solid #eee', cursor: 'pointer' }} 
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    onClick={() => openInvoiceDetails(inv, 'sale')}
                  >
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

        <div className="section-box flex-1" style={{ minWidth: '300px' }}>
          <h3 style={{ color: '#16a34a', borderBottom: '2px solid #16a34a', paddingBottom: '10px' }}>آخر فواتير المشتريات</h3>
          <div className="table-responsive">
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
                  <tr 
                    key={inv.id} 
                    style={{ borderBottom: '1px solid #eee', cursor: 'pointer' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0fdf4'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    onClick={() => openInvoiceDetails(inv, 'purchase')}
                  >
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

      {/* Invoice Details Modal */}
      {isModalOpen && selectedInvoice && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white', borderRadius: '12px', padding: '20px', width: '100%', maxWidth: '600px',
            maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, color: 'var(--primary-color)' }}>
                تفاصيل الفاتورة - {selectedInvoice.number}
              </h3>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>
                <X size={24} />
              </button>
            </div>
            
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
              <div><strong>{selectedInvoice.type === 'sale' ? 'العميل:' : 'المورد:'}</strong> {selectedInvoice.partnerName || '-'}</div>
              <div><strong>التاريخ:</strong> {selectedInvoice.date}</div>
            </div>

            <div style={{ overflowY: 'auto', flex: 1 }}>
              <table style={{ width: '100%', textAlign: 'right', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #ddd' }}>
                    <th style={{ padding: '10px' }}>الصنف</th>
                    <th style={{ padding: '10px' }}>الكمية</th>
                    <th style={{ padding: '10px' }}>السعر</th>
                    <th style={{ padding: '10px' }}>المجموع</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceLines.length === 0 ? (
                    <tr><td colSpan={4} style={{ padding: '20px', textAlign: 'center' }}>جاري تحميل البنود...</td></tr>
                  ) : (
                    invoiceLines.map((line, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '10px' }}>{line.productName || '-'}</td>
                        <td style={{ padding: '10px' }}>{line.quantity}</td>
                        <td style={{ padding: '10px' }}>{line.price}</td>
                        <td style={{ padding: '10px', fontWeight: 'bold' }}>{line.total}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '2px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.2rem' }}>
              <strong>الإجمالي:</strong>
              <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>{selectedInvoice.total} $</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
