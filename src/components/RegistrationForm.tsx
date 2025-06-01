import React, { useState } from 'react';
import { Button, Card, CardContent, CheckCircle } from './ui-components'; // הנחה לגבי ייבואים

const RegistrationForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    username: '',
    subscriptionType: '',
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

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="שם"
            />
            {errors.name && <span>{errors.name}</span>}
          </div>
          <div>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="אימייל"
            />
            {errors.email && <span>{errors.email}</span>}
          </div>
          <div>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="טלפון"
            />
            {errors.phone && <span>{errors.phone}</span>}
          </div>
          <div>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              placeholder="שם משתמש"
            />
            {errors.username && <span>{errors.username}</span>}
          </div>
          <div>
            <select
              value={formData.subscriptionType}
              onChange={(e) => handleInputChange('subscriptionType', e.target.value)}
            >
              <option value="">בחר סוג מנוי</option>
              <option value="basic">בסיסי</option>
              <option value="premium">פרימיום</option>
            </select>
            {errors.subscriptionType && <span>{errors.subscriptionType}</span>}
          </div>
          <div>
            <select
              value={formData.paymentMethod}
              onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
            >
              <option value="">בחר שיטת תשלום</option>
              <option value="credit">כרטיס אשראי</option>
              <option value="paypal">PayPal</option>
            </select>
            {errors.paymentMethod && <span>{errors.paymentMethod}</span>}
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                מעבד...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                הרשם עכשיו
              </div>
            )}
          </Button>
          {errors.submit && <span>{errors.submit}</span>}
        </form>
      </CardContent>
    </Card>
  );

  function validateEmail(email: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function validatePhone(phone: string) {
    const phoneRegex = /^(\+972|0)[5-9]\d{8}$|^05[0-9]-\d{3}-\d{4}$/;
    return phoneRegex.test(phone.replace(/[-\s]/g, ''));
  }

  function validateUsername(username: string) {
    const usernameRegex = /^[a-zA-Z0-9_-]{3,}$/;
    return usernameRegex.test(username);
  }

  function validateForm() {
    const newErrors: any = {};

    if (!formData.name.trim()) {
      newErrors.name = 'שם חובה';
    }

    if (!formData.email) {
      newErrors.email = 'אימייל חובה';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'פורמט אימייל לא תקין';
    }

    if (!formData.phone) {
      newErrors.phone = 'טלפון חובה';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'פורמט טלפון לא תקין (052-123-4567 או +972501234567)';
    }

    if (!formData.username) {
      newErrors.username = 'שם משתמש חובה';
    } else if (!validateUsername(formData.username)) {
      newErrors.username = 'שם משתמש חייב להכיל לפחות 3 תווים (אותיות, מספרים, מקפים, קווים תחתונים)';
    }

    if (!formData.subscriptionType) {
      newErrors.subscriptionType = 'סוג מנוי חובה';
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'שיטת תשלום חובה';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleInputChange(field: string, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }
};

export default RegistrationForm;
