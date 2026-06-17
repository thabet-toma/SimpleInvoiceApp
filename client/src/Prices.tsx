import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Prices = () => {
  const [partners, setPartners] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<string>('');
  const [partnerPrices, setPartnerPrices] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [partnersRes, productsRes] = await Promise.all([
        axios.get(`${API_URL}/partners?type=customer`),
        axios.get(`${API_URL}/products`)
      ]);
      setPartners(partnersRes.data);
      setProducts(productsRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePartnerSelect = async (partnerId: string) => {
    setSelectedPartner(partnerId);
    if (!partnerId) {
      setPartnerPrices({});
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/customers/${partnerId}/prices`);
      setPartnerPrices(res.data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="dashboard-container" dir="rtl" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>الأسعار الخاصة بالزبائن</h2>
        <button className="btn-back" onClick={() => navigate('/dashboard')}>عودة للوحة التحكم</button>
      </div>
      
      <div className="section-box" style={{ marginTop: '20px' }}>
        <label className="section-label">اختر الزبون لعرض أسعاره الخاصة</label>
        <select 
          className="form-input" 
          value={selectedPartner} 
          onChange={e => handlePartnerSelect(e.target.value)}
        >
          <option value="">-- اختر الزبون --</option>
          {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {selectedPartner && (
        <div className="section-box" style={{ marginTop: '20px' }}>
          {loading ? (
            <p>جاري تحميل الأسعار...</p>
          ) : (
            <div className="table-responsive">
              <table style={{ width: '100%', textAlign: 'right', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #ddd' }}>
                    <th style={{ padding: '10px' }}>المنتج</th>
                    <th style={{ padding: '10px' }}>السعر الأساسي</th>
                    <th style={{ padding: '10px' }}>سعر الزبون (بناءً على آخر فاتورة)</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(prod => {
                    const customPrice = partnerPrices[prod.id];
                    return (
                      <tr key={prod.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '10px' }}>{prod.name}</td>
                        <td style={{ padding: '10px', color: '#64748b' }}>{prod.price}</td>
                        <td style={{ padding: '10px', fontWeight: 'bold', color: customPrice ? '#16a34a' : '#94a3b8' }}>
                          {customPrice ? customPrice : 'لم يشتري هذا المنتج مسبقاً'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Prices;
