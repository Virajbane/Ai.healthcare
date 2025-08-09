import React, { useState } from 'react';
import { 
  TrendingUp, TrendingDown, Users, Calendar, Clock, 
  Activity, BarChart3, PieChart, LineChart, Download,
  Filter, RefreshCw, Eye, AlertCircle, CheckCircle
} from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell } from 'recharts';

const DoctorAnalytics = ({ user }) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('7days');
  const [selectedMetric, setSelectedMetric] = useState('appointments');

  // Sample data for charts
  const appointmentData = [
    { name: 'Mon', appointments: 12, completed: 10, cancelled: 2 },
    { name: 'Tue', appointments: 15, completed: 13, cancelled: 2 },
    { name: 'Wed', appointments: 8, completed: 7, cancelled: 1 },
    { name: 'Thu', appointments: 18, completed: 16, cancelled: 2 },
    { name: 'Fri', appointments: 14, completed: 12, cancelled: 2 },
    { name: 'Sat', appointments: 10, completed: 9, cancelled: 1 },
    { name: 'Sun', appointments: 6, completed: 6, cancelled: 0 }
  ];

  const monthlyData = [
    { month: 'Jan', patients: 145, revenue: 28500, appointments: 168 },
    { month: 'Feb', patients: 152, revenue: 31200, appointments: 175 },
    { month: 'Mar', patients: 138, revenue: 26800, appointments: 162 },
    { month: 'Apr', patients: 165, revenue: 34500, appointments: 192 },
    { month: 'May', patients: 178, revenue: 37200, appointments: 205 },
    { month: 'Jun', patients: 162, revenue: 33800, appointments: 188 },
    { month: 'Jul', patients: 185, revenue: 39500, appointments: 215 },
    { month: 'Aug', patients: 156, revenue: 32400, appointments: 182 }
  ];

  const diagnosisData = [
    { name: 'Hypertension', value: 25, color: '#3B82F6' },
    { name: 'Diabetes', value: 20, color: '#10B981' },
    { name: 'Upper Respiratory', value: 15, color: '#F59E0B' },
    { name: 'Arthritis', value: 12, color: '#EF4444' },
    { name: 'Heart Disease', value: 10, color: '#8B5CF6' },
    { name: 'Others', value: 18, color: '#6B7280' }
  ];

  const patientAgeData = [
    { ageGroup: '0-18', count: 45 },
    { ageGroup: '19-35', count: 128 },
    { ageGroup: '36-50', count: 156 },
    { ageGroup: '51-65', count: 142 },
    { ageGroup: '65+', count: 89 }
  ];

  const performanceMetrics = [
    {
      title: 'Patient Satisfaction',
      value: '4.8',
      unit: '/5',
      change: '+0.2',
      trend: 'up',
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Average Wait Time',
      value: '12',
      unit: 'mins',
      change: '-3',
      trend: 'down',
      icon: Clock,
      color: 'green'
    },
    {
      title: 'Appointment Completion',
      value: '92',
      unit: '%',
      change: '+5',
      trend: 'up',
      icon: CheckCircle,
      color: 'blue'
    },
    {
      title: 'Follow-up Rate',
      value: '78',
      unit: '%',
      change: '+12',
      trend: 'up',
      icon: Activity,
      color: 'green'
    }
  ];

  const recentInsights = [
    {
      type: 'trend',
      title: 'Appointment Volume Increase',
      description: 'Your appointments have increased by 15% compared to last month',
      icon: TrendingUp,
      color: 'green'
    },
    {
      type: 'alert',
      title: 'High Cancellation Rate',
      description: 'Friday appointments have a higher cancellation rate (18%)',
      icon: AlertCircle,
      color: 'yellow'
    },
    {
      type: 'insight',
      title: 'Peak Hours Identified',
      description: 'Most patients prefer appointments between 10 AM - 2 PM',
      icon: Clock,
      color: 'blue'
    }
  ];

  const MetricCard = ({ metric }) => {
    const IconComponent = metric.icon;
    const isPositive = metric.trend === 'up';
    const trendColor = isPositive ? 'text-green-600' : 'text-red-600';
    const bgColor = `bg-${metric.color}-100`;
    const iconColor = `text-${metric.color}-600`;

    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{metric.title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-gray-900">
                {metric.value}
                <span className="text-sm font-normal text-gray-500">{metric.unit}</span>
              </p>
              <span className={`text-sm font-medium ${trendColor} flex items-center gap-1`}>
                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {metric.change}
              </span>
            </div>
          </div>
          <div className={`p-3 ${bgColor} rounded-full`}>
            <IconComponent className={`w-6 h-6 ${iconColor}`} />
          </div>
        </div>
      </div>
    );
  };

  const InsightCard = ({ insight }) => {
    const IconComponent = insight.icon;
    const colorClasses = {
      green: 'bg-green-100 text-green-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      blue: 'bg-blue-100 text-blue-600'
    };

    return (
      <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-full ${colorClasses[insight.color]}`}>
            <IconComponent className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{insight.title}</h4>
            <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-600">Track your practice performance and patient insights</p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
          </select>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {performanceMetrics.map((metric, index) => (
          <MetricCard key={index} metric={metric} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointment Trends */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Weekly Appointment Trends</h3>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Completed</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Cancelled</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsLineChart data={appointmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="completed" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="cancelled" stroke="#EF4444" strokeWidth={2} />
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Monthly Revenue Trend</h3>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="text-sm px-3 py-1 border rounded-md"
            >
              <option value="revenue">Revenue</option>
              <option value="patients">Patients</option>
              <option value="appointments">Appointments</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => selectedMetric === 'revenue' ? `₹${value}` : value} />
              <Bar dataKey={selectedMetric} fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Diagnosis and Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Diagnoses */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Diagnoses</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={diagnosisData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
              >
                {diagnosisData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>

        {/* Patient Age Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Age Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={patientAgeData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="ageGroup" type="category" width={60} />
              <Tooltip />
              <Bar dataKey="count" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Key Insights */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Key Insights</h3>
            <button className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1">
              <Eye className="w-4 h-4" />
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentInsights.map((insight, index) => (
              <InsightCard key={index} insight={insight} />
            ))}
          </div>
        </div>

        {/* Practice Summary */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Practice Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b">
              <span className="text-gray-600">Total Patients</span>
              <span className="font-semibold text-gray-900">1,247</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b">
              <span className="text-gray-600">This Month's Appointments</span>
              <span className="font-semibold text-gray-900">182</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b">
              <span className="text-gray-600">Average Daily Patients</span>
              <span className="font-semibold text-gray-900">8.5</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b">
              <span className="text-gray-600">Revenue This Month</span>
              <span className="font-semibold text-green-600">₹32,400</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b">
              <span className="text-gray-600">Most Active Day</span>
              <span className="font-semibold text-gray-900">Thursday</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-600">Peak Hours</span>
              <span className="font-semibold text-gray-900">10 AM - 2 PM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Reports Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Detailed Reports</h3>
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download Report
              </button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Appointments</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cancelled</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg. Wait Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {appointmentData.map((day, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    2024-08-{String(index + 1).padStart(2, '0')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {day.appointments}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                    {day.completed}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                    {day.cancelled}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{(day.completed * 400).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {Math.floor(Math.random() * 20) + 5} mins
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DoctorAnalytics;