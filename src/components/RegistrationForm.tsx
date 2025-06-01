import React, { useState } from 'react';
import { Button, Card, CardContent, CheckCircle } from './ui-components';

const RegistrationForm: React.FC = () => {
  const [formData, setFormData] = useState({
    param1: '',
    param2: '',
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

    if (!formData.param1.trim()) {
      newErrors.param1 = 'פרמטר 1 חובה';
    }

    if (!formData.param2.trim()) {
      newErrors.param2 = 'פרמטר 2 חובה';
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
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div>
            <input
              type="text"
              value={formData.param1}
              onChange={(e) => handleInputChange('param1', e.target.value)}
              placeholder="אימייל/טלפון/שם משתמש"
            />
            {errors.param1 && <span>{errors.param1}</span>}
          </div>
          <div>
            <input
              type="text"
              value={formData.param2}
              onChange={(e) => handleInputChange('param2', e.target.value)}
              placeholder="אימייל/טלפון/שם משתמש"
            />
            {errors.param2 && <span>{errors.param2}</span>}
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
};

export default RegistrationForm;
