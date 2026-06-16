import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Save, ArrowRight, Building2, Trash2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const InvoiceForm = ({ type }: { type: 'sale' | 'purchase' }) => {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<any[]>([]);
  const [tenantId, setTenantId] = useState('6'); // Default to شركة النور
  const [partners, setPartners] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [partnerId, setPartnerId] = useState('');
  const [lines, setLines] = useState([{ productId: '', quantity: 1, price: 0 }]);
  const [total, setTotal] = useState(0);

  const [newPartnerName, setNewPartnerName] = useState('');
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState(0);

  useEffect(() => {
    fetchTenants();
  }, []);

  useEffect(() => {
    if (tenantId) {
      fetchPartners();
      fetchProducts();
    }
  }, [tenantId]);

  useEffect(() => {
    let sum = 0;
    lines.forEach(line => { sum += line.quantity * line.price; });
    setTotal(sum);
  }, [lines]);

  const fetchTenants = async () => {
    const res = await axios.get(`${API_URL}/tenants`);
    setTenants(res.data);
  };

  const fetchPartners = async () => {
    const res = await axios.get(`${API_URL}/partners?type=${type === 'sale' ? 'customer' : 'supplier'}&tenantId=${tenantId}`);
    setPartners(res.data);
    setPartnerId('');
  };

  const fetchProducts = async () => {
    const res = await axios.get(`${API_URL}/products?tenantId=${tenantId}`);
    setProducts(res.data);
    // Reset lines when changing company to avoid mismatch
    setLines([{ productId: '', quantity: 1, price: 0 }]);
  };

  const addPartner = async () => {
    if (!newPartnerName) return;
    const res = await axios.post(`${API_URL}/partners`, { 
      name: newPartnerName, 
      type: type === 'sale' ? 'customer' : 'supplier',
      tenantId
    });
    setPartners([...partners, res.data]);
    setPartnerId(res.data.id);
    setNewPartnerName('');
  };

  const addProduct = async () => {
    if (!newProductName) return;
    const res = await axios.post(`${API_URL}/products`, { 
      name: newProductName, 
      price: newProductPrice,
      tenantId
    });
    setProducts([...products, res.data]);
    setNewProductName('');
    setNewProductPrice(0);
  };

  const addLine = () => setLines([...lines, { productId: '', quantity: 1, price: 0 }]);

  const removeLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  const updateLine = (index: number, field: string, value: any) => {
    const newLines = [...lines];
    (newLines[index] as any)[field] = value;
    if (field === 'productId') {
      const prod = products.find(p => p.id == value);
      if (prod) {
        newLines[index].price = type === 'sale' ? prod.price : (prod.cost || prod.price);
      }
    }
    setLines(newLines);
  };

  const submitInvoice = async () => {
    if (!partnerId) return alert('الرجاء اختيار العميل/المورد');
    if (lines.some(l => !l.productId)) return alert('الرجاء اختيار الأصناف');
    
    try {
      await axios.post(`${API_URL}/invoices/${type}`, {
        partnerId, lines, total, tenantId
      });
      alert('تم حفظ الفاتورة كمسودة بنجاح!');
      navigate('/dashboard');
    } catch (e) {
      alert('حدث خطأ أثناء الحفظ');
    }
  };

  return (
    <div className="invoice-container" dir="rtl">
      <h2 className="invoice-title">
        {type === 'sale' ? 'فاتورة مبيعات جديدة' : 'فاتورة مشتريات جديدة'}
      </h2>

      {/* Tenant Selection */}
      <div className="section-box" style={{ borderColor: 'var(--primary-color)', backgroundColor: '#eff6ff' }}>
        <label className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Building2 size={18} />
          الشركة (الفرع الأساسي)
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

      {/* Partner Section */}
      <div className="section-box">
        <label className="section-label">{type === 'sale' ? 'العميل' : 'المورد'}</label>
        <select 
          className="form-input"
          value={partnerId} 
          onChange={e => setPartnerId(e.target.value)}
        >
          <option value="">-- اختر من القائمة --</option>
          {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        
        <div className="flex-row">
          <input 
            type="text" 
            placeholder={`إضافة ${type === 'sale' ? 'عميل' : 'مورد'} جديد`}
            className="form-input flex-1"
            value={newPartnerName}
            onChange={e => setNewPartnerName(e.target.value)}
          />
          <button onClick={addPartner} className="btn-add">إضافة</button>
        </div>
      </div>

      {/* Product Section */}
      <div className="section-box">
        <label className="section-label">تسجيل منتج جديد (إن لم يكن بالقائمة)</label>
        <div className="flex-row">
          <input 
            type="text" 
            placeholder="اسم المنتج"
            className="form-input flex-1"
            value={newProductName}
            onChange={e => setNewProductName(e.target.value)}
          />
          <input 
            type="number" 
            placeholder="السعر"
            className="form-input w-80"
            value={newProductPrice}
            onChange={e => setNewProductPrice(Number(e.target.value))}
          />
          <button onClick={addProduct} className="btn-add">تسجيل</button>
        </div>
      </div>

      {/* Invoice Lines Section */}
      <div className="section-box">
        <h3 className="section-label">الأصناف:</h3>
        
        <div className="flex-row line-item" style={{ fontWeight: 'bold', marginBottom: '10px', borderBottom: '2px solid #ddd', paddingBottom: '5px' }}>
          <div className="flex-1">الصنف</div>
          <div className="w-80 text-center">الكمية</div>
          <div className="w-100 text-center">السعر</div>
          <div style={{ width: '40px' }}></div>
        </div>

        {lines.map((line, index) => (
          <div key={index} className="flex-row line-item" style={{ alignItems: 'center' }}>
            <div className="flex-1" style={{ display: 'flex', flexDirection: 'column' }}>
              <select 
                className="form-input"
                style={{ width: '100%' }}
                value={line.productId}
                onChange={e => updateLine(index, 'productId', e.target.value)}
              >
                <option value="">-- الصنف --</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} (متوفر: {p.stock || 0})</option>)}
              </select>
              {line.productId && (
                <span style={{ fontSize: '12px', color: '#16a34a', marginTop: '4px', fontWeight: 'bold' }}>
                  الكمية المتوفرة في المخزن: {products.find(p => p.id == line.productId)?.stock || 0}
                </span>
              )}
            </div>
            <input 
              type="number" 
              placeholder="الكمية"
              className="form-input w-80"
              value={line.quantity}
              onChange={e => updateLine(index, 'quantity', Number(e.target.value))}
              min="1"
            />
            <input 
              type="number" 
              placeholder="السعر"
              className="form-input w-100"
              value={line.price}
              onChange={e => updateLine(index, 'price', Number(e.target.value))}
            />
            <button onClick={() => removeLine(index)} className="btn-text" style={{ color: 'red', width: '40px', padding: '0 10px' }} title="حذف السطر">
              <Trash2 size={20} />
            </button>
          </div>
        ))}
        <button onClick={addLine} className="btn-text" style={{ marginTop: '10px' }}>
          <PlusCircle size={18} /> سطر جديد
        </button>
      </div>

      <div className="total-box">
        المجموع: {total} $
      </div>

      <div className="flex-row gap-10">
        <button onClick={submitInvoice} className="btn-save flex-1">
          <Save size={20} /> حفظ كمسودة
        </button>
        <button onClick={() => navigate('/dashboard')} className="btn-back">
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default InvoiceForm;
