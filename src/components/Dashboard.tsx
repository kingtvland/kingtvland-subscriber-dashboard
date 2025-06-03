
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, Calendar, User } from 'lucide-react';
import SubscriptionChart from '@/components/SubscriptionChart';
import SubscriberTable from '@/components/SubscriberTable';

interface DashboardProps {
  userInfo: any;
}

const Dashboard: React.FC<DashboardProps> = ({ userInfo }) => {
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [subscriptionData, setSubscriptionData] = useState([]);
  const [userSubscriptions, setUserSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [userInfo]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      console.log('Loading dashboard data for authenticated user');
      
      // Call the Netlify function to get user data with authentication
      const params = new URLSearchParams();
      if (userInfo.email) params.append('email', userInfo.email);
      if (userInfo.phone) params.append('phone', userInfo.phone);
      if (userInfo.username) params.append('username', userInfo.username);
      
      // Create a simple auth token (in production, use proper authentication)
      const authToken = btoa(`user:${userInfo.email}:${Date.now()}`);
      
      console.log('Calling getUserData with authentication');
      
      const response = await fetch(`/.netlify/functions/getUserData?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received secure data from getUserData');
      
      setUserSubscriptions(data.subscriptions || []);
      setSubscriptionData(data.subscriptionData || []);
      setSubscriberCount(data.totalSubscribers || 0);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Fallback to empty data
      setUserSubscriptions([]);
      setSubscriptionData([]);
      setSubscriberCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-amber-400 mx-auto mb-4"></div>
          <p className="text-white text-xl">טוען נתונים...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl">
        <CardContent className="p-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-2">
              שלום, {userInfo.name}!
            </h2>
            <p className="text-purple-200">ברוך הבא לדשבורד האישי שלך</p>
            <Badge variant="secondary" className="mt-2 bg-gradient-to-r from-amber-500 to-purple-600 text-white">
              משתמש: {userInfo.username}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-200">סך המנויים</p>
                <p className="text-3xl font-bold text-white">{subscriberCount}</p>
              </div>
              <div className="h-12 w-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-200">המנויים שלי</p>
                <p className="text-3xl font-bold text-white">{userSubscriptions.length}</p>
              </div>
              <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-200">צמיחה חודשית</p>
                <p className="text-3xl font-bold text-white">+12%</p>
              </div>
              <div className="h-12 w-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart and Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SubscriptionChart data={subscriptionData} />
        <SubscriberTable subscriptions={userSubscriptions} />
      </div>
    </div>
  );
};

export default Dashboard;
