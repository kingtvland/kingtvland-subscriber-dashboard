
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SubscriptionChartProps {
  data: Array<{
    type: string;
    count: number;
    color: string;
  }>;
}

const SubscriptionChart: React.FC<SubscriptionChartProps> = ({ data }) => {
  const formatData = data.map(item => ({
    name: item.type,
    value: item.count,
    fill: item.color
  }));

  return (
    <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-xl">
      <CardHeader>
        <CardTitle className="text-white text-xl text-center">
          התפלגות סוגי מנויים
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formatData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
              <XAxis 
                dataKey="name" 
                stroke="rgba(255,255,255,0.8)"
                fontSize={12}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.8)"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: 'white'
                }}
              />
              <Bar 
                dataKey="value" 
                radius={[4, 4, 0, 0]}
                className="drop-shadow-lg"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex justify-center space-x-4 rtl:space-x-reverse">
          {data.map((item, index) => (
            <div key={index} className="flex items-center">
              <div 
                className="w-4 h-4 rounded mr-2" 
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-white text-sm">{item.type}: {item.count}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionChart;
