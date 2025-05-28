
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RegistrationFormProps {
  onSuccess: (userData: any) => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSuccess }) => {
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
  const { toast } = useToast();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^(\+972|0)[5-9]\d{8}$|^05[0-9]-\d{3}-\d{4}$/;
    return phoneRegex.test(phone.replace(/[-\s]/g, ''));
  };

  const validateUsername = (username: string) => {
    const usernameRegex = /^[a-zA-Z0-9_-]{3,}$/;
    return usernameRegex.test(username);
  };

  const validateForm = () => {
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "שגיאה בטופס",
        description: "אנא תקן את השגיאות ונסה שנית",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call - replace with actual Netlify function call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful registration
      onSuccess(formData);
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעת ההרשמה. נסה שנית מאוחר יותר",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl transform hover:scale-[1.02] transition-all duration-300 perspective-1000">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold text-white mb-2">
          הרשמה למערכת
        </CardTitle>
        <p className="text-purple-200">מלא את הפרטים להרשמה</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="text-white mb-2 block">שם מלא</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:border-amber-400"
                placeholder="הכנס שם מלא"
              />
              {errors.name && <p className="text-red-300 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="email" className="text-white mb-2 block">אימייל</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:border-amber-400"
                placeholder="user@example.com"
              />
              {errors.email && <p className="text-red-300 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <Label htmlFor="phone" className="text-white mb-2 block">טלפון</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:border-amber-400"
                placeholder="052-123-4567"
              />
              {errors.phone && <p className="text-red-300 text-sm mt-1">{errors.phone}</p>}
            </div>

            <div>
              <Label htmlFor="username" className="text-white mb-2 block">שם משתמש</Label>
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:border-amber-400"
                placeholder="username123"
              />
              {errors.username && <p className="text-red-300 text-sm mt-1">{errors.username}</p>}
            </div>

            <div>
              <Label htmlFor="subscriptionType" className="text-white mb-2 block">סוג מנוי</Label>
              <Select value={formData.subscriptionType} onValueChange={(value) => handleInputChange('subscriptionType', value)}>
                <SelectTrigger className="bg-white/20 border-white/30 text-white focus:border-amber-400">
                  <SelectValue placeholder="בחר סוג מנוי" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">מנוי חדש</SelectItem>
                  <SelectItem value="renewal">הארכת מנוי</SelectItem>
                </SelectContent>
              </Select>
              {errors.subscriptionType && <p className="text-red-300 text-sm mt-1">{errors.subscriptionType}</p>}
            </div>

            <div>
              <Label htmlFor="paymentMethod" className="text-white mb-2 block">שיטת תשלום</Label>
              <Select value={formData.paymentMethod} onValueChange={(value) => handleInputChange('paymentMethod', value)}>
                <SelectTrigger className="bg-white/20 border-white/30 text-white focus:border-amber-400">
                  <SelectValue placeholder="בחר שיטת תשלום" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paybox">PayBox</SelectItem>
                  <SelectItem value="crypto">קריפטו</SelectItem>
                </SelectContent>
              </Select>
              {errors.paymentMethod && <p className="text-red-300 text-sm mt-1">{errors.paymentMethod}</p>}
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                מעבד...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                הרשם עכשיו
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default RegistrationForm;
