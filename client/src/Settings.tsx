import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Settings = () => {
  const [pointsPer1000, setPointsPer1000] = useState('50');
  const [pointValue, setPointValue] = useState('1');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${API_URL}/settings`);
      if (res.data.points_per_1000) setPointsPer1000(res.data.points_per_1000);
      if (res.data.point_value_ils) setPointValue(res.data.point_value_ils);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_URL}/settings`, {
        points_per_1000: pointsPer1000,
        point_value_ils: pointValue
      });
      alert('تم حفظ الإعدادات بنجاح!');
      navigate('/dashboard');
    } catch (e) {
      console.error(e);
      alert('حدث خطأ أثناء الحفظ');
    }
    setLoading(false);
  };

  return (
    <div className="dashboard-container" dir="rtl">
      <h2>إعدادات النظام</h2>
      <form onSubmit={handleSave} className="section-box" style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'right' }}>
        <div style={{ marginBottom: '15px' }}>
          <label className="section-label">عدد النقاط المكتسبة لكل 1000 شيكل/دولار مبيعات</label>
          <input 
            type="number" 
            className="form-input" 
            value={pointsPer1000} 
            onChange={e => setPointsPer1000(e.target.value)} 
            required 
          />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label className="section-label">قيمة النقطة الواحدة (بالشيكل/الدولار) عند الخصم</label>
          <input 
            type="number" 
            step="0.01"
            className="form-input" 
            value={pointValue} 
            onChange={e => setPointValue(e.target.value)} 
            required 
          />
        </div>
        <button type="submit" className="btn-save" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </button>
        <button type="button" className="btn-back" style={{ width: '100%', marginTop: '10px' }} onClick={() => navigate('/dashboard')}>
          عودة للوحة التحكم
        </button>
      </form>
    </div>
  );
};

export default Settings;
