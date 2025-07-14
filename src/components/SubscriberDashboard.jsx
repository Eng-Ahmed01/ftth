import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, TrendingUp, AlertCircle, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const SubscriberDashboard = ({ tasks, reports }) => {
  const subscriberAnalysis = useMemo(() => {
    const analysis = {
      totalSubscribers: 0,
      needsDashTransfer: 0,
      alreadyInService: 0,
      newInstallations: 0,
      byZone: {},
      statusBreakdown: {}
    };

    // تحليل المهام
    tasks.forEach(task => {
      analysis.totalSubscribers++;
      
      const status = task.oldFeedback?.status?.toLowerCase() || task.status?.toLowerCase() || '';
      
      if (status.includes('already in service')) {
        analysis.alreadyInService++;
        analysis.needsDashTransfer++;
      } else if (status.includes('done')) {
        analysis.newInstallations++;
      }

      // تحليل حسب المنطقة
      const zone = task.zone || 'غير محدد';
      if (!analysis.byZone[zone]) {
        analysis.byZone[zone] = { total: 0, needsTransfer: 0 };
      }
      analysis.byZone[zone].total++;
      
      if (status.includes('already in service')) {
        analysis.byZone[zone].needsTransfer++;
      }

      // تحليل حسب الحالة
      const statusKey = status || 'غير محدد';
      analysis.statusBreakdown[statusKey] = (analysis.statusBreakdown[statusKey] || 0) + 1;
    });

    // تحليل التقارير
    reports.forEach(report => {
      analysis.newInstallations++;
    });

    return analysis;
  }, [tasks, reports]);

  const pieData = [
    { name: 'يحتاج تحويل للداش', value: subscriberAnalysis.needsDashTransfer, color: '#f59e0b' },
    { name: 'تنصيبات جديدة', value: subscriberAnalysis.newInstallations, color: '#10b981' },
    { name: 'أخرى', value: subscriberAnalysis.totalSubscribers - subscriberAnalysis.needsDashTransfer - subscriberAnalysis.newInstallations, color: '#6b7280' }
  ];

  const zoneData = Object.entries(subscriberAnalysis.byZone).map(([zone, data]) => ({
    zone,
    total: data.total,
    needsTransfer: data.needsTransfer,
    percentage: ((data.needsTransfer / data.total) * 100).toFixed(1)
  })).sort((a, b) => b.needsTransfer - a.needsTransfer);

  const statusData = Object.entries(subscriberAnalysis.statusBreakdown).map(([status, count]) => ({
    status: status.charAt(0).toUpperCase() + status.slice(1),
    count
  })).sort((a, b) => b.count - a.count);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-effect border-blue-500/30 enhanced-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">إجمالي المشتركين</CardTitle>
            <Users className="h-5 w-5 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-400">{subscriberAnalysis.totalSubscribers}</div>
          </CardContent>
        </Card>
        
        <Card className="glass-effect border-yellow-500/30 enhanced-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">يحتاج تحويل للداش</CardTitle>
            <AlertCircle className="h-5 w-5 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-400">{subscriberAnalysis.needsDashTransfer}</div>
            <p className="text-xs text-gray-400 mt-1">
              {((subscriberAnalysis.needsDashTransfer / subscriberAnalysis.totalSubscribers) * 100).toFixed(1)}% من الإجمالي
            </p>
          </CardContent>
        </Card>
        
        <Card className="glass-effect border-green-500/30 enhanced-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">تنصيبات جديدة</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-400">{subscriberAnalysis.newInstallations}</div>
          </CardContent>
        </Card>
        
        <Card className="glass-effect border-orange-500/30 enhanced-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">مشتركين سابقين</CardTitle>
            <Clock className="h-5 w-5 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-400">{subscriberAnalysis.alreadyInService}</div>
          </CardContent>
        </Card>
      </div>

      {/* تحذير المشتركين الذين يحتاجون تحويل */}
      {subscriberAnalysis.needsDashTransfer > 0 && (
        <Card className="glass-effect border-yellow-500/20 bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl text-yellow-300">
              <AlertCircle className="w-6 h-6" />
              تنبيه: مشتركون يحتاجون تحويل للداش
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-yellow-500/20 rounded-lg">
              <div>
                <p className="text-lg font-bold text-yellow-300">
                  {subscriberAnalysis.needsDashTransfer} مشترك يحتاج تحويل للداش الخاص بهم
                </p>
                <p className="text-sm text-gray-300">
                  هؤلاء المشتركون لديهم خدمة سابقة ويحتاجون إلى تحويل اشتراكهم
                </p>
              </div>
              <ArrowRight className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* الرسوم البيانية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-effect border-purple-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5" />
              توزيع المشتركين
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-effect border-cyan-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart className="w-5 h-5" />
              التحويلات المطلوبة حسب المنطقة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={zoneData.slice(0, 10)}>
                <XAxis dataKey="zone" stroke="#9ca3af" fontSize={10} />
                <YAxis stroke="#9ca3af" fontSize={10} />
                <Tooltip 
                  formatter={(value, name) => [value, name === 'needsTransfer' ? 'يحتاج تحويل' : 'الإجمالي']}
                  labelFormatter={(label) => `المنطقة: ${label}`}
                />
                <Legend />
                <Bar dataKey="total" fill="#6b7280" name="الإجمالي" />
                <Bar dataKey="needsTransfer" fill="#f59e0b" name="يحتاج تحويل" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* جدول المناطق */}
      <Card className="glass-effect border-sky-500/20">
        <CardHeader>
          <CardTitle className="text-xl gradient-text font-bold">
            تفاصيل المناطق والتحويلات المطلوبة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border border-slate-600 rounded-lg">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="border border-slate-600 px-4 py-3 text-right text-sm font-medium text-gray-300">المنطقة</th>
                  <th className="border border-slate-600 px-4 py-3 text-center text-sm font-medium text-gray-300">إجمالي المشتركين</th>
                  <th className="border border-slate-600 px-4 py-3 text-center text-sm font-medium text-gray-300">يحتاج تحويل</th>
                  <th className="border border-slate-600 px-4 py-3 text-center text-sm font-medium text-gray-300">النسبة المئوية</th>
                  <th className="border border-slate-600 px-4 py-3 text-center text-sm font-medium text-gray-300">الأولوية</th>
                </tr>
              </thead>
              <tbody>
                {zoneData.map((zone, index) => (
                  <tr key={zone.zone} className="hover:bg-slate-800/30">
                    <td className="border border-slate-600 px-4 py-3 text-sm text-gray-200 font-medium">{zone.zone}</td>
                    <td className="border border-slate-600 px-4 py-3 text-center text-sm text-blue-400">{zone.total}</td>
                    <td className="border border-slate-600 px-4 py-3 text-center text-sm text-yellow-400 font-bold">{zone.needsTransfer}</td>
                    <td className="border border-slate-600 px-4 py-3 text-center text-sm text-gray-200">{zone.percentage}%</td>
                    <td className="border border-slate-600 px-4 py-3 text-center text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        index < 3 ? 'bg-red-500/20 text-red-300' :
                        index < 6 ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-green-500/20 text-green-300'
                      }`}>
                        {index < 3 ? 'عالية' : index < 6 ? 'متوسطة' : 'منخفضة'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* تحليل الحالات */}
      <Card className="glass-effect border-indigo-500/20">
        <CardHeader>
          <CardTitle className="text-xl gradient-text font-bold">
            تحليل حالات المشتركين
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {statusData.map(status => (
              <div key={status.status} className="p-4 bg-slate-800/30 rounded-lg border border-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">{status.status}</span>
                  <span className="text-lg font-bold text-indigo-400">{status.count}</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                  <div 
                    className="bg-indigo-500 h-2 rounded-full" 
                    style={{ width: `${(status.count / subscriberAnalysis.totalSubscribers) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SubscriberDashboard;