import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { DollarSign, Package, Calculator, Download, TrendingUp, PieChart, BarChart3 } from 'lucide-react';
import { PieChart as RechartsPieChart, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Pie } from 'recharts';
import * as XLSX from 'xlsx';

// أسعار المواد المحدثة (بالقطع مع تفاصيل الأمتار)
const materialPrices = {
  cable: { pricePerPiece: 25000, metersPerPiece: 50 }, // 25000 د.ع للقطعة الواحدة (50 متر)
  sHook: { pricePerPiece: 1000, quantity: 1 }, // 1000 د.ع للفراشة الواحدة
  steelBag: { pricePerPiece: 2000, quantity: 1 }, // 2000 د.ع للشناطة الستيل
  plasticBag: { pricePerPiece: 1500, quantity: 1 }, // 1500 د.ع للشناطة البلاستك
  externalPlug: { pricePerPiece: 3000, quantity: 1 }, // 3000 د.ع للفيشة الخارجية
  internalPlug: { pricePerPiece: 2500, quantity: 1 }, // 2500 د.ع للفيشة الداخلية
};

// قيم الاشتراكات
const subscriptionValues = {
  '25 fiber': 25000,
  '35 fiber': 35000,
  '50 fiber': 50000,
  '75 fiber': 75000,
  '100 fiber': 100000,
  'default': 35000
};

const EnhancedFinancialManager = ({ users, reports, tasks }) => {
  const { toast } = useToast();
  const [userDebts, setUserDebts] = useState({});
  const [customPrices, setCustomPrices] = useState(materialPrices);
  const [customSubscriptionValues, setCustomSubscriptionValues] = useState(subscriptionValues);

  useEffect(() => {
    calculateUserDebts();
  }, [reports, tasks, customPrices, customSubscriptionValues]);

  const calculateUserDebts = () => {
    const debts = {};
    
    // حساب الذمة من التقارير
    reports.forEach(report => {
      const username = report.submittedBy;
      if (!debts[username]) {
        debts[username] = {
          materials: { 
            cable: { pieces: 0, totalMeters: 0 }, 
            sHook: 0, 
            steelBag: 0, 
            plasticBag: 0, 
            externalPlug: 0, 
            internalPlug: 0 
          },
          subscriptionValue: 0,
          materialsCost: 0,
          totalCost: 0,
          completedTasks: 0,
          installationReports: 0
        };
      }
      
      // حساب المواد المستخدمة
      const cableMeters = parseInt(report.cable || 0);
      const cablePieces = Math.ceil(cableMeters / customPrices.cable.metersPerPiece);
      
      debts[username].materials.cable.pieces += cablePieces;
      debts[username].materials.cable.totalMeters += cableMeters;
      debts[username].materials.sHook += parseInt(report.sHook || 0);
      debts[username].materials.steelBag += parseInt(report.steelBag || 0);
      debts[username].materials.plasticBag += parseInt(report.plasticBag || 0);
      debts[username].materials.externalPlug += parseInt(report.externalPlug || 0);
      debts[username].materials.internalPlug += parseInt(report.internalPlug || 0);
      
      // حساب قيمة الاشتراك
      const subscriptionType = report.subscriptionType || 'default';
      const subscriptionValue = customSubscriptionValues[subscriptionType] || customSubscriptionValues.default;
      debts[username].subscriptionValue += subscriptionValue;
      
      debts[username].installationReports++;
    });

    // حساب المهام المكتملة
    tasks.forEach(task => {
      if (task.status === 'Done' && task.assignedTo) {
        const username = task.assignedTo;
        if (!debts[username]) {
          debts[username] = {
            materials: { 
              cable: { pieces: 0, totalMeters: 0 }, 
              sHook: 0, 
              steelBag: 0, 
              plasticBag: 0, 
              externalPlug: 0, 
              internalPlug: 0 
            },
            subscriptionValue: 0,
            materialsCost: 0,
            totalCost: 0,
            completedTasks: 0,
            installationReports: 0
          };
        }
        debts[username].completedTasks++;
      }
    });

    // حساب التكلفة الإجمالية
    Object.keys(debts).forEach(username => {
      const materials = debts[username].materials;
      const materialsCost = 
        (materials.cable.pieces * customPrices.cable.pricePerPiece) +
        (materials.sHook * customPrices.sHook.pricePerPiece) +
        (materials.steelBag * customPrices.steelBag.pricePerPiece) +
        (materials.plasticBag * customPrices.plasticBag.pricePerPiece) +
        (materials.externalPlug * customPrices.externalPlug.pricePerPiece) +
        (materials.internalPlug * customPrices.internalPlug.pricePerPiece);
      
      debts[username].materialsCost = materialsCost;
      debts[username].totalCost = materialsCost + debts[username].subscriptionValue;
    });

    setUserDebts(debts);
  };

  const handlePriceChange = (material, field, newValue) => {
    setCustomPrices(prev => ({
      ...prev,
      [material]: {
        ...prev[material],
        [field]: parseInt(newValue) || 0
      }
    }));
  };

  const handleSubscriptionValueChange = (type, newValue) => {
    setCustomSubscriptionValues(prev => ({
      ...prev,
      [type]: parseInt(newValue) || 0
    }));
  };

  const exportToExcel = () => {
    const data = Object.entries(userDebts).map(([username, debt]) => ({
      'اسم المستخدم': username,
      'كيبل (قطع)': debt.materials.cable.pieces,
      'كيبل (أمتار مستخدمة)': debt.materials.cable.totalMeters,
      'فراشة': debt.materials.sHook,
      'شناطة ستيل': debt.materials.steelBag,
      'شناطة بلاستك': debt.materials.plasticBag,
      'فيشة خارجية': debt.materials.externalPlug,
      'فيشة داخلية': debt.materials.internalPlug,
      'تكلفة المواد (د.ع)': debt.materialsCost.toLocaleString(),
      'قيمة الاشتراكات (د.ع)': debt.subscriptionValue.toLocaleString(),
      'التكلفة الإجمالية (د.ع)': debt.totalCost.toLocaleString(),
      'مهام مكتملة': debt.completedTasks,
      'تقارير تنصيب': debt.installationReports
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'الذمة المالية المحدثة');
    
    XLSX.writeFile(workbook, `الذمة_المالية_المحدثة_${new Date().toLocaleDateString('ar-SA')}.xlsx`);
    toast({ title: "تم التصدير!", description: "تم تصدير بيانات الذمة المالية المحدثة إلى Excel بنجاح." });
  };

  // بيانات الرسوم البيانية
  const chartData = Object.entries(userDebts).map(([username, debt]) => ({
    name: username,
    'تكلفة المواد': debt.materialsCost,
    'قيمة الاشتراكات': debt.subscriptionValue,
    'الإجمالي': debt.totalCost
  }));

  const pieData = [
    { name: 'تكلفة المواد', value: Object.values(userDebts).reduce((sum, debt) => sum + debt.materialsCost, 0), color: '#8b5cf6' },
    { name: 'قيمة الاشتراكات', value: Object.values(userDebts).reduce((sum, debt) => sum + debt.subscriptionValue, 0), color: '#06b6d4' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* إعدادات الأسعار المحدثة */}
      <Card className="glass-effect border-green-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl gradient-text font-bold">
            <Calculator className="w-8 h-8" />
            إعدادات الأسعار والقيم المحدثة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* أسعار المواد */}
          <div>
            <h4 className="text-lg font-semibold text-purple-300 mb-4">أسعار المواد (بالقطع)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>كيبل - سعر القطعة (د.ع)</Label>
                <Input
                  type="number"
                  value={customPrices.cable.pricePerPiece}
                  onChange={(e) => handlePriceChange('cable', 'pricePerPiece', e.target.value)}
                  className="glass-effect"
                />
                <Label className="text-xs text-gray-400">أمتار في القطعة الواحدة</Label>
                <Input
                  type="number"
                  value={customPrices.cable.metersPerPiece}
                  onChange={(e) => handlePriceChange('cable', 'metersPerPiece', e.target.value)}
                  className="glass-effect"
                />
              </div>
              
              {Object.entries(customPrices).filter(([key]) => key !== 'cable').map(([key, price]) => (
                <div key={key} className="space-y-2">
                  <Label>{key === 'sHook' ? 'فراشة' : key === 'steelBag' ? 'شناطة ستيل' : key === 'plasticBag' ? 'شناطة بلاستك' : key === 'externalPlug' ? 'فيشة خارجية' : 'فيشة داخلية'} (د.ع/قطعة)</Label>
                  <Input
                    type="number"
                    value={price.pricePerPiece}
                    onChange={(e) => handlePriceChange(key, 'pricePerPiece', e.target.value)}
                    className="glass-effect"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* قيم الاشتراكات */}
          <div>
            <h4 className="text-lg font-semibold text-cyan-300 mb-4">قيم الاشتراكات (د.ع)</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(customSubscriptionValues).map(([type, value]) => (
                <div key={type} className="space-y-2">
                  <Label>{type}</Label>
                  <Input
                    type="number"
                    value={value}
                    onChange={(e) => handleSubscriptionValueChange(type, e.target.value)}
                    className="glass-effect"
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* الرسوم البيانية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-effect border-purple-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <PieChart className="w-5 h-5" />
              توزيع التكاليف
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
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
                <Tooltip formatter={(value) => `${value.toLocaleString()} د.ع`} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-effect border-cyan-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="w-5 h-5" />
              مقارنة التكاليف حسب المستخدم
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} />
                <YAxis stroke="#9ca3af" fontSize={10} />
                <Tooltip formatter={(value) => `${value.toLocaleString()} د.ع`} />
                <Legend />
                <Bar dataKey="تكلفة المواد" fill="#8b5cf6" />
                <Bar dataKey="قيمة الاشتراكات" fill="#06b6d4" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* جدول الذمة المالية المحدث */}
      <Card className="glass-effect border-purple-500/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-2xl gradient-text font-bold">
            <DollarSign className="w-8 h-8" />
            الذمة المالية المحدثة للمستخدمين
          </CardTitle>
          <Button onClick={exportToExcel} className="bg-gradient-to-r from-green-500 to-emerald-500">
            <Download className="ml-2 h-4 w-4" />
            تصدير Excel
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border border-slate-600 rounded-lg">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="border border-slate-600 px-3 py-3 text-right text-xs font-medium text-gray-300">المستخدم</th>
                  <th className="border border-slate-600 px-3 py-3 text-center text-xs font-medium text-gray-300">كيبل (قطع)</th>
                  <th className="border border-slate-600 px-3 py-3 text-center text-xs font-medium text-gray-300">كيبل (أمتار)</th>
                  <th className="border border-slate-600 px-3 py-3 text-center text-xs font-medium text-gray-300">فراشة</th>
                  <th className="border border-slate-600 px-3 py-3 text-center text-xs font-medium text-gray-300">شناطة ستيل</th>
                  <th className="border border-slate-600 px-3 py-3 text-center text-xs font-medium text-gray-300">شناطة بلاستك</th>
                  <th className="border border-slate-600 px-3 py-3 text-center text-xs font-medium text-gray-300">فيشة خارجية</th>
                  <th className="border border-slate-600 px-3 py-3 text-center text-xs font-medium text-gray-300">فيشة داخلية</th>
                  <th className="border border-slate-600 px-3 py-3 text-center text-xs font-medium text-gray-300">تكلفة المواد</th>
                  <th className="border border-slate-600 px-3 py-3 text-center text-xs font-medium text-gray-300">قيمة الاشتراكات</th>
                  <th className="border border-slate-600 px-3 py-3 text-center text-xs font-medium text-gray-300">التكلفة الإجمالية</th>
                  <th className="border border-slate-600 px-3 py-3 text-center text-xs font-medium text-gray-300">مهام مكتملة</th>
                  <th className="border border-slate-600 px-3 py-3 text-center text-xs font-medium text-gray-300">تقارير تنصيب</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(userDebts).map(([username, debt]) => (
                  <tr key={username} className="hover:bg-slate-800/30">
                    <td className="border border-slate-600 px-3 py-3 text-sm text-gray-200 font-medium">{username}</td>
                    <td className="border border-slate-600 px-3 py-3 text-center text-sm text-gray-200">{debt.materials.cable.pieces}</td>
                    <td className="border border-slate-600 px-3 py-3 text-center text-sm text-gray-200">{debt.materials.cable.totalMeters}</td>
                    <td className="border border-slate-600 px-3 py-3 text-center text-sm text-gray-200">{debt.materials.sHook}</td>
                    <td className="border border-slate-600 px-3 py-3 text-center text-sm text-gray-200">{debt.materials.steelBag}</td>
                    <td className="border border-slate-600 px-3 py-3 text-center text-sm text-gray-200">{debt.materials.plasticBag}</td>
                    <td className="border border-slate-600 px-3 py-3 text-center text-sm text-gray-200">{debt.materials.externalPlug}</td>
                    <td className="border border-slate-600 px-3 py-3 text-center text-sm text-gray-200">{debt.materials.internalPlug}</td>
                    <td className="border border-slate-600 px-3 py-3 text-center text-sm text-purple-400 font-bold">
                      {debt.materialsCost.toLocaleString()} د.ع
                    </td>
                    <td className="border border-slate-600 px-3 py-3 text-center text-sm text-cyan-400 font-bold">
                      {debt.subscriptionValue.toLocaleString()} د.ع
                    </td>
                    <td className="border border-slate-600 px-3 py-3 text-center text-sm text-green-400 font-bold">
                      {debt.totalCost.toLocaleString()} د.ع
                    </td>
                    <td className="border border-slate-600 px-3 py-3 text-center text-sm text-blue-400">{debt.completedTasks}</td>
                    <td className="border border-slate-600 px-3 py-3 text-center text-sm text-purple-400">{debt.installationReports}</td>
                  </tr>
                ))}
                {Object.keys(userDebts).length === 0 && (
                  <tr>
                    <td colSpan="13" className="border border-slate-600 px-3 py-8 text-center text-gray-400">
                      لا توجد بيانات مالية متاحة
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ملخص إجمالي محدث */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-effect border-purple-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">إجمالي تكلفة المواد</CardTitle>
            <Package className="h-5 w-5 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">
              {Object.values(userDebts).reduce((sum, debt) => sum + debt.materialsCost, 0).toLocaleString()} د.ع
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-effect border-cyan-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">إجمالي قيمة الاشتراكات</CardTitle>
            <TrendingUp className="h-5 w-5 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-400">
              {Object.values(userDebts).reduce((sum, debt) => sum + debt.subscriptionValue, 0).toLocaleString()} د.ع
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-effect border-green-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">إجمالي الذمة المالية</CardTitle>
            <DollarSign className="h-5 w-5 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {Object.values(userDebts).reduce((sum, debt) => sum + debt.totalCost, 0).toLocaleString()} د.ع
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-effect border-blue-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">إجمالي المهام المكتملة</CardTitle>
            <Package className="h-5 w-5 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">
              {Object.values(userDebts).reduce((sum, debt) => sum + debt.completedTasks, 0)}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default EnhancedFinancialManager;