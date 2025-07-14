import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { DollarSign, Package, Calculator, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

const materialPrices = {
  cable: 500, // سعر المتر الواحد من الكيبل
  sHook: 1000, // سعر الفراشة الواحدة
  steelBag: 2000, // سعر الشناطة الستيل
  plasticBag: 1500, // سعر الشناطة البلاستك
  externalPlug: 3000, // سعر الفيشة الخارجية
  internalPlug: 2500, // سعر الفيشة الداخلية
};

const FinancialManager = ({ users, reports, tasks }) => {
  const { toast } = useToast();
  const [userDebts, setUserDebts] = useState({});
  const [customPrices, setCustomPrices] = useState(materialPrices);

  useEffect(() => {
    calculateUserDebts();
  }, [reports, tasks, customPrices]);

  const calculateUserDebts = () => {
    const debts = {};
    
    // حساب الذمة من التقارير
    reports.forEach(report => {
      const username = report.submittedBy;
      if (!debts[username]) {
        debts[username] = {
          materials: { cable: 0, sHook: 0, steelBag: 0, plasticBag: 0, externalPlug: 0, internalPlug: 0 },
          totalCost: 0,
          completedTasks: 0,
          installationReports: 0
        };
      }
      
      // إضافة المواد المستخدمة
      debts[username].materials.cable += parseInt(report.cable || 0);
      debts[username].materials.sHook += parseInt(report.sHook || 0);
      debts[username].materials.steelBag += parseInt(report.steelBag || 0);
      debts[username].materials.plasticBag += parseInt(report.plasticBag || 0);
      debts[username].materials.externalPlug += parseInt(report.externalPlug || 0);
      debts[username].materials.internalPlug += parseInt(report.internalPlug || 0);
      
      debts[username].installationReports++;
    });

    // حساب المهام المكتملة
    tasks.forEach(task => {
      if (task.status === 'Done' && task.assignedTo) {
        const username = task.assignedTo;
        if (!debts[username]) {
          debts[username] = {
            materials: { cable: 0, sHook: 0, steelBag: 0, plasticBag: 0, externalPlug: 0, internalPlug: 0 },
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
      debts[username].totalCost = 
        (materials.cable * customPrices.cable) +
        (materials.sHook * customPrices.sHook) +
        (materials.steelBag * customPrices.steelBag) +
        (materials.plasticBag * customPrices.plasticBag) +
        (materials.externalPlug * customPrices.externalPlug) +
        (materials.internalPlug * customPrices.internalPlug);
    });

    setUserDebts(debts);
  };

  const handlePriceChange = (material, newPrice) => {
    setCustomPrices(prev => ({
      ...prev,
      [material]: parseInt(newPrice) || 0
    }));
  };

  const exportToExcel = () => {
    const data = Object.entries(userDebts).map(([username, debt]) => ({
      'اسم المستخدم': username,
      'كيبل (م)': debt.materials.cable,
      'فراشة': debt.materials.sHook,
      'شناطة ستيل': debt.materials.steelBag,
      'شناطة بلاستك': debt.materials.plasticBag,
      'فيشة خارجية': debt.materials.externalPlug,
      'فيشة داخلية': debt.materials.internalPlug,
      'التكلفة الإجمالية (د.ع)': debt.totalCost.toLocaleString(),
      'مهام مكتملة': debt.completedTasks,
      'تقارير تنصيب': debt.installationReports
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'الذمة المالية');
    
    XLSX.writeFile(workbook, `الذمة_المالية_${new Date().toLocaleDateString('ar-SA')}.xlsx`);
    toast({ title: "تم التصدير!", description: "تم تصدير بيانات الذمة المالية إلى Excel بنجاح." });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* إعدادات الأسعار */}
      <Card className="glass-effect border-green-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl gradient-text font-bold">
            <Calculator className="w-8 h-8" />
            إعدادات أسعار المواد
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>كيبل (د.ع/متر)</Label>
              <Input
                type="number"
                value={customPrices.cable}
                onChange={(e) => handlePriceChange('cable', e.target.value)}
                className="glass-effect"
              />
            </div>
            <div className="space-y-2">
              <Label>فراشة (د.ع/قطعة)</Label>
              <Input
                type="number"
                value={customPrices.sHook}
                onChange={(e) => handlePriceChange('sHook', e.target.value)}
                className="glass-effect"
              />
            </div>
            <div className="space-y-2">
              <Label>شناطة ستيل (د.ع/قطعة)</Label>
              <Input
                type="number"
                value={customPrices.steelBag}
                onChange={(e) => handlePriceChange('steelBag', e.target.value)}
                className="glass-effect"
              />
            </div>
            <div className="space-y-2">
              <Label>شناطة بلاستك (د.ع/قطعة)</Label>
              <Input
                type="number"
                value={customPrices.plasticBag}
                onChange={(e) => handlePriceChange('plasticBag', e.target.value)}
                className="glass-effect"
              />
            </div>
            <div className="space-y-2">
              <Label>فيشة خارجية (د.ع/قطعة)</Label>
              <Input
                type="number"
                value={customPrices.externalPlug}
                onChange={(e) => handlePriceChange('externalPlug', e.target.value)}
                className="glass-effect"
              />
            </div>
            <div className="space-y-2">
              <Label>فيشة داخلية (د.ع/قطعة)</Label>
              <Input
                type="number"
                value={customPrices.internalPlug}
                onChange={(e) => handlePriceChange('internalPlug', e.target.value)}
                className="glass-effect"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* جدول الذمة المالية */}
      <Card className="glass-effect border-purple-500/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-2xl gradient-text font-bold">
            <DollarSign className="w-8 h-8" />
            الذمة المالية للمستخدمين
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
                  <th className="border border-slate-600 px-4 py-3 text-right text-sm font-medium text-gray-300">المستخدم</th>
                  <th className="border border-slate-600 px-4 py-3 text-center text-sm font-medium text-gray-300">كيبل (م)</th>
                  <th className="border border-slate-600 px-4 py-3 text-center text-sm font-medium text-gray-300">فراشة</th>
                  <th className="border border-slate-600 px-4 py-3 text-center text-sm font-medium text-gray-300">شناطة ستيل</th>
                  <th className="border border-slate-600 px-4 py-3 text-center text-sm font-medium text-gray-300">شناطة بلاستك</th>
                  <th className="border border-slate-600 px-4 py-3 text-center text-sm font-medium text-gray-300">فيشة خارجية</th>
                  <th className="border border-slate-600 px-4 py-3 text-center text-sm font-medium text-gray-300">فيشة داخلية</th>
                  <th className="border border-slate-600 px-4 py-3 text-center text-sm font-medium text-gray-300">التكلفة الإجمالية</th>
                  <th className="border border-slate-600 px-4 py-3 text-center text-sm font-medium text-gray-300">مهام مكتملة</th>
                  <th className="border border-slate-600 px-4 py-3 text-center text-sm font-medium text-gray-300">تقارير تنصيب</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(userDebts).map(([username, debt]) => (
                  <tr key={username} className="hover:bg-slate-800/30">
                    <td className="border border-slate-600 px-4 py-3 text-sm text-gray-200 font-medium">{username}</td>
                    <td className="border border-slate-600 px-4 py-3 text-center text-sm text-gray-200">{debt.materials.cable}</td>
                    <td className="border border-slate-600 px-4 py-3 text-center text-sm text-gray-200">{debt.materials.sHook}</td>
                    <td className="border border-slate-600 px-4 py-3 text-center text-sm text-gray-200">{debt.materials.steelBag}</td>
                    <td className="border border-slate-600 px-4 py-3 text-center text-sm text-gray-200">{debt.materials.plasticBag}</td>
                    <td className="border border-slate-600 px-4 py-3 text-center text-sm text-gray-200">{debt.materials.externalPlug}</td>
                    <td className="border border-slate-600 px-4 py-3 text-center text-sm text-gray-200">{debt.materials.internalPlug}</td>
                    <td className="border border-slate-600 px-4 py-3 text-center text-sm text-green-400 font-bold">
                      {debt.totalCost.toLocaleString()} د.ع
                    </td>
                    <td className="border border-slate-600 px-4 py-3 text-center text-sm text-blue-400">{debt.completedTasks}</td>
                    <td className="border border-slate-600 px-4 py-3 text-center text-sm text-purple-400">{debt.installationReports}</td>
                  </tr>
                ))}
                {Object.keys(userDebts).length === 0 && (
                  <tr>
                    <td colSpan="10" className="border border-slate-600 px-4 py-8 text-center text-gray-400">
                      لا توجد بيانات مالية متاحة
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ملخص إجمالي */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        
        <Card className="glass-effect border-purple-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">إجمالي تقارير التنصيب</CardTitle>
            <Package className="h-5 w-5 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">
              {Object.values(userDebts).reduce((sum, debt) => sum + debt.installationReports, 0)}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default FinancialManager;