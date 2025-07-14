import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, AlertTriangle, Cable } from 'lucide-react';
import { materialTypes, calculateTotalCableMeters } from '@/components/inventory/MaterialTypes';

const TechnicianInventoryView = ({ user }) => {
  // حساب المواد المتوفرة للفني
  const userInventory = JSON.parse(localStorage.getItem('userInventories')) || {};
  const myInventory = userInventory[user.username] || {
    available: Object.keys(materialTypes).reduce((acc, key) => ({ ...acc, [key]: 0 }), {}),
    used: Object.keys(materialTypes).reduce((acc, key) => ({ ...acc, [key]: 0 }), {})
  };

  // حساب إجمالي أمتار الكيبل
  const totalCableMeters = calculateTotalCableMeters(myInventory.available);
  const totalUsedCableMeters = calculateTotalCableMeters(myInventory.used);
  const lowStockMaterials = Object.entries(myInventory.available).filter(([_, quantity]) => quantity < 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* إحصائيات الكيبل */}
      <Card className="glass-effect border-purple-500/20 enhanced-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl gradient-text font-bold">
            <Cable className="w-8 h-8" />
            إحصائيات الكيبل المتطورة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* الكيبل المتوفر */}
            <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/30">
              <div className="flex items-center gap-3 mb-4">
                <Package className="w-6 h-6 text-green-400" />
                <h4 className="text-lg font-semibold text-green-300">الكيبل المتوفر</h4>
              </div>
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-green-400">{totalCableMeters}</div>
                <div className="text-sm text-gray-400">إجمالي الأمتار المتوفرة</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(materialTypes).filter(([key]) => key.startsWith('cable')).map(([key, material]) => (
                  <div key={key} className="text-center p-3 bg-green-500/20 rounded-lg">
                    <div className="text-lg font-bold text-green-400">{myInventory.available[key]}</div>
                    <div className="text-xs text-gray-400">{material.name}</div>
                    <div className="text-xs text-blue-400">{myInventory.available[key] * material.length} متر</div>
                  </div>
                ))}
              </div>
            </div>

            {/* الكيبل المستخدم */}
            <div className="p-4 bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-lg border border-red-500/30">
              <div className="flex items-center gap-3 mb-4">
                <Cable className="w-6 h-6 text-red-400" />
                <h4 className="text-lg font-semibold text-red-300">الكيبل المستخدم</h4>
              </div>
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-red-400">{totalUsedCableMeters}</div>
                <div className="text-sm text-gray-400">إجمالي الأمتار المستخدمة</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(materialTypes).filter(([key]) => key.startsWith('cable')).map(([key, material]) => (
                  <div key={key} className="text-center p-3 bg-red-500/20 rounded-lg">
                    <div className="text-lg font-bold text-red-400">{myInventory.used[key]}</div>
                    <div className="text-xs text-gray-400">{material.name}</div>
                    <div className="text-xs text-orange-400">{myInventory.used[key] * material.length} متر</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* باقي المواد */}
      <Card className="glass-effect border-blue-500/20 enhanced-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl gradient-text font-bold">
            <Package className="w-6 h-6" />
            مخزونك الشخصي المتطور
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* المواد المتوفرة */}
            <div>
              <h4 className="text-lg font-semibold text-green-300 mb-4">المواد المتوفرة</h4>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(materialTypes).filter(([key]) => !key.startsWith('cable')).map(([key, material]) => {
                  const quantity = myInventory.available[key] || 0;
                  const isLow = quantity < 5;
                  return (
                    <div key={key} className={`text-center p-3 rounded-lg border ${
                      isLow ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'
                    }`}>
                      <div className="text-2xl mb-1">{material.icon}</div>
                      <div className={`text-lg font-bold ${isLow ? 'text-red-400' : 'text-green-400'}`}>
                        {quantity}
                      </div>
                      <div className="text-xs text-gray-400">{material.name}</div>
                      <div className="text-xs text-gray-500">{material.unit}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* المواد المستخدمة */}
            <div>
              <h4 className="text-lg font-semibold text-red-300 mb-4">المواد المستخدمة</h4>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(materialTypes).filter(([key]) => !key.startsWith('cable')).map(([key, material]) => (
                  <div key={key} className="text-center p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <div className="text-2xl mb-1">{material.icon}</div>
                    <div className="text-lg font-bold text-red-400">
                      {myInventory.used[key] || 0}
                    </div>
                    <div className="text-xs text-gray-400">{material.name}</div>
                    <div className="text-xs text-gray-500">{material.unit}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {lowStockMaterials.length > 0 && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-red-300 mb-2">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-semibold">تحذير: مخزون منخفض</span>
              </div>
              <p className="text-sm text-gray-300 mb-3">
                لديك مواد منخفضة في المخزون. يرجى التواصل مع المشرف لإعادة التزويد.
              </p>
              <div className="flex flex-wrap gap-2">
                {lowStockMaterials.map(([key]) => (
                  <span key={key} className="px-2 py-1 bg-red-500/20 text-red-300 rounded text-xs">
                    {materialTypes[key].name}: {myInventory.available[key]}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TechnicianInventoryView;