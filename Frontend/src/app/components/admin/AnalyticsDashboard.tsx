import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Gift, DollarSign, Target, Zap, ArrowLeft } from 'lucide-react';
import axios from 'axios';


const API_BASE = 'http://localhost:5000/api/admin';

const conversionData = [
  { campaign: 'Summer Sale', rate: 42 },
  { campaign: 'Black Friday', rate: 58 },
  { campaign: 'New Year', rate: 35 },
  { campaign: 'Spring Special', rate: 48 },
];



export function AnalyticsDashboard({ campaignId, shopId, onBack }: { campaignId?: string; shopId?: string; onBack?: () => void }) {
    const [campaignData, setCampaignData] = useState<any>(null);
  const [shopData, setShopData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [campaignId, shopId]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      if (campaignId) {
        const res = await axios.get(`${API_BASE}/campaigns/${campaignId}/analytics?days=30`);
        setCampaignData(res.data.data);
      } else if (shopId) {
        const res = await axios.get(`${API_BASE}/shops/${shopId}/analytics`);
        setShopData(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      alert('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

   // Prepare chart data from spinsByDay
  const chartData = campaignData && campaignData.spinsByDay
    ? Object.entries(campaignData.spinsByDay).map(([date, spins]: [string, any]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        spins: spins as number,
        conversions: Math.floor((spins as number) * 0.42), // Rough estimate
      }))
    : [];

  // Prepare pie chart data
  const prizeChartData = campaignData && campaignData.topPrizes
    ? campaignData.topPrizes.map((prize: any, idx: number) => ({
        name: prize.name,
        value: prize.count,
        color: ['#FF6B6B', '#4ECDC4', '#FFD93D', '#95E1D3', '#AA96DA'][idx % 5],
      }))
    : [];

  const metrics = campaignData?.metrics || shopData || {};
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold"
          >
            <ArrowLeft size={20} />
            Back
          </button>
        )}
      <div>
        <h2 className="text-gray-900">Analytics Dashboard</h2>
        <p className="text-gray-600 mt-1">Track performance and insights for your campaigns</p>
      </div>
     </div>
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-linear-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-white/90">Total Spins</CardTitle>
            <Zap className="h-4 w-4 text-white/90" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.totalSpins || 0}</div>
            <p className="text-xs text-white/80 mt-1">
              <span className="text-green-200">↑ 12.5%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-white/90">Discount Codes Redeemed</CardTitle>
            <Gift className="h-4 w-4 text-white/90" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.totalCodes || metrics.discountCodes || 0}</div>
            <p className="text-xs text-white/80 mt-1">
              <span className="text-green-200">↑ 8.3%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-teal-500 to-teal-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-white/90">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-white/90" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.conversionRate || '0'}%</div>
            <p className="text-xs text-white/80 mt-1">
              <span className="text-green-200">↑ 4.2%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-orange-500 to-orange-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-white/90">Revenue Generated</CardTitle>
            <DollarSign className="h-4 w-4 text-white/90" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.uniqueEmails || 0}</div>
            <p className="text-xs text-white/80 mt-1">
              <span className="text-green-200">↑ 15.7%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Spins & Conversions Over Time */}
         {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Spins & Conversions</CardTitle>
            <CardDescription>Daily performance over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart  data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="spins" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', r: 5 }}
                  activeDot={{ r: 7 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="conversions" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
         )}

        {/* Prize Distribution */}
        {prizeChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Prize Distribution</CardTitle>
            <CardDescription>Breakdown of prizes won by users</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                
                 data={prizeChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {prizeChartData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
         )}

        {/* Conversion Rate by Campaign */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Conversion Rate by Campaign</CardTitle>
            <CardDescription>Percentage of spins that led to purchases</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={conversionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="campaign" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value) => `${value}%`}
                />
                <Bar 
                  dataKey="rate" 
                  fill="url(#colorGradient)" 
                  radius={[8, 8, 0, 0]}
                />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={1} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Insights */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Performing Campaign</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-purple-600">Black Friday Sale</p>
              <p className="text-sm text-gray-600">58% conversion rate</p>
              <p className="text-sm text-gray-600">1,847 total spins</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Most Popular Prize</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-blue-600">10% OFF</p>
              <p className="text-sm text-gray-600">320 times won</p>
              <p className="text-sm text-gray-600">23% of all prizes</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Avg. Time to Spin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-teal-600">2.4 seconds</p>
              <p className="text-sm text-gray-600">From page load</p>
              <p className="text-sm text-gray-600">High engagement!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
