import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Key, User } from 'lucide-react';

interface Subscription {
  username: string;
  // password: string; // REMOVED for security
  expireDate: string;
  status: string;
  hasPassword?: boolean; // New field to indicate if password exists
}

interface SubscriberTableProps {
  subscriptions: Subscription[];
}

const SubscriberTable: React.FC<SubscriberTableProps> = ({ subscriptions }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'expired':
        return 'bg-red-500';
      case 'expiring':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'פעיל';
      case 'expired':
        return 'פג תוקף';
      case 'expiring':
        return 'יפוג בקרוב';
      default:
        return 'לא ידוע';
    }
  };

  return (
    <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-xl">
      <CardHeader>
        <CardTitle className="text-white text-xl text-center">
          פרטי המנויים שלי
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {subscriptions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/60">אין מנויים פעילים</p>
            </div>
          ) : (
            subscriptions.map((subscription, index) => (
              <div 
                key={index}
                className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all duration-300 transform hover:scale-[1.02]"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className="bg-gradient-to-br from-purple-500 to-amber-500 p-2 rounded-lg">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">{subscription.username}</p>
                      <p className="text-purple-200 text-sm">שם משתמש</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className="bg-gradient-to-br from-amber-500 to-purple-500 p-2 rounded-lg">
                      <Key className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-mono">
                        {subscription.hasPassword ? '••••••••' : 'לא זמין'}
                      </p>
                      <p className="text-purple-200 text-sm">סיסמה</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className="bg-gradient-to-br from-green-500 to-blue-500 p-2 rounded-lg">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white">{formatDate(subscription.expireDate)}</p>
                      <p className="text-purple-200 text-sm">תאריך תפוגה</p>
                    </div>
                  </div>

                  <Badge className={`${getStatusColor(subscription.status)} text-white`}>
                    {getStatusText(subscription.status)}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>

        {subscriptions.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-purple-200 text-sm">
              סה״כ {subscriptions.length} מנויים פעילים
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscriberTable;
