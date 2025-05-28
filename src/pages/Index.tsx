
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Users, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import RegistrationForm from '@/components/RegistrationForm';
import Dashboard from '@/components/Dashboard';

const Index = () => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleRegistrationSuccess = (userData) => {
    setUserInfo(userData);
    setIsRegistered(true);
    toast({
      title: "הרשמה הושלמה בהצלחה!",
      description: "הפרטים נקלטו בהצלחה",
      duration: 3000,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-amber-600 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-amber-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-600/20 to-amber-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-purple-300 mb-4 animate-fade-in">
            KingTVLand
          </h1>
          <p className="text-xl text-purple-100 opacity-90">
            מערכת ניהול מנויים מתקדמת
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          {!isRegistered ? (
            <RegistrationForm onSuccess={handleRegistrationSuccess} />
          ) : (
            <Dashboard userInfo={userInfo} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
