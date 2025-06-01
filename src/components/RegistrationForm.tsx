import React, { useState } from 'react';

const RegistrationForm: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    email: '',
    paymentMethod: ''
  });
  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/.netlify/functions/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await response.json();
      if (result.success) {
        alert('הרשמה הצליחה!');
      } else {
        setErrors({ submit: result.error || 'שגיאה בהרשמה' });
      }
    } catch (error) {
      setErrors({ submit: 'שגיאה בשרת' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateForm = () => {
    const newErrors: any = {};

    const providedCount = [formData.username, formData.phone, formData.email].filter(Boolean).length;
    if (providedCount < 2) {
      newErrors.submit = 'יש לספק לפחות שני זיהויים (שם משתמש, טלפון, או אימייל)';
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'שיטת תשלום חובה';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: 'auto', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
      <h2>הרשמה</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            placeholder="שם משתמש"
            style={{ width: '100%', padding: '8px' }}
          />
          {errors.username && <span style={{ color: 'red' }}>{errors.username}</span>}
        </div>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="טלפון"
            style={{ width: '100%', padding: '8px' }}
          />
          {errors.phone && <span style={{ color: 'red' }}>{errors.phone}</span>}
        </div>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="אימייל"
            style={{ width: '100%', padding: '8px' }}
          />
          {errors.email && <span style={{ color: 'red' }}>{errors.email}</span>}
        </div>
        <div style={{ marginBottom: '10px' }}>
          <select
            value={formData.paymentMethod}
            onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          >
            <option value="">בחר שיטת תשלום</option>
            <option value="credit">כרטיס אשראי</option>
            <option value="paypal">PayPal</option>
          </select>
          {errors.paymentMethod && <span style={{ color: 'red' }}>{errors.paymentMethod}</span>}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          style={{ width: '100%', padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px' }}
        >
          {isSubmitting ? 'מעבד...' : 'הירשם עכשיו'}
        </button>
        {errors.submit && <p style={{ color: 'red' }}>{errors.submit}</p>}
      </form>
    </div>
  );
};

export default RegistrationForm;
