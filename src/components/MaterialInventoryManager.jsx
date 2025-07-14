import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Package, Plus, Minus, AlertTriangle, TrendingUp, TrendingDown, Boxes } from 'lucide-react';
import MaterialImporter from '@/components/MaterialImporter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { materialTypes, calculateTotalCableMeters } from '@/components/inventory/MaterialTypes';
import { useInventoryCalculations } from '@/components/inventory/InventoryCalculations';

const MaterialInventoryManager = ({ users, reports, onUpdateUsers }) => {
  const { toast } = useToast();
  const [userInventories, setUserInventories] = useState({});
  const [selectedUser, setSelectedUser] = useState('');
  const [materialToAdd, setMaterialToAdd] = useState({ type: '', quantity: 0 });
  
  const { initializeInventories, getTotalMaterials, getTotalCableMeters, getLowStockUsers } = useInventoryCalculations(users, reports);

  useEffect(() => {
    const inventories = initializeInventories();
    setUserInventories(inventories);
  }, [users, reports]);

  const saveInventories = (newInventories) => {
    setUserInventories(newInventories);
    localStorage.setItem('userInventories', JSON.stringify(newInventories));
  };

  const addMaterialToUser = () => {
    if (!selectedUser || !materialToAdd.type || materialToAdd.quantity <= 0) {
      toast({ title: "خطأ", description: "يرجى اختيار المستخدم والمادة والكمية.", variant: "destructive" });
      return;
    }

    const newInventories = { ...userInventories };
    if (!newInventories[selectedUser]) {
      newInventories[selectedUser] = {
        available: Object.keys(materialTypes).reduce((acc, key) => ({ ...acc, [key]: 0 }), {}),
        used: Object.keys(materialTypes).reduce((acc, key) => ({ ...acc, [key]: 0 }), {})
      };
    }

    newInventories[selectedUser].available[materialToAdd.type] += parseInt(materialToAdd.quantity);
    saveInventories(newInventories);

    toast({ 
      title: "تم إضافة المواد!", 
      description: `تم إضافة ${materialToAdd.quantity} ${materialTypes[materialToAdd.type].unit} من ${materialTypes[materialToAdd.type].name} إلى ${selectedUser}` 
    });

    setMaterialToAdd({ type: '', quantity: 0 });
  };

  const handleBulkAddMaterials = (materialsToAdd) => {
    const newInventories = { ...userInventories };
    
    materialsToAdd.forEach(({ username, materialType, quantity }) => {
      if (!newInventories[username]) {
        newInventories[username] = {
          available: Object.keys(materialTypes).reduce((acc, key) => ({ ...acc, [key]: 0 }), {}),
          used: Object.keys(materialTypes).reduce((acc, key) => ({ ...acc, [key]: 0 }), {})
        };
      }
      newInventories[username].available[materialType] += quantity;
    });
    
    saveInventories(newInventories);
  };

  const removeMaterialFromUser = (username, materialType, quantity) => {
    const newInventories = { ...userInventories };
    if (newInventories[username] && newInventories[username].available[materialType] >= quantity) {
      newInventories[username].available[materialType] -= quantity;
      saveInventories(newInventories);
      
      toast({ 
        title: "تم خصم المواد!", 
        description: `تم خصم ${quantity} ${materialTypes[materialType].unit} من ${materialTypes[materialType].name} من ${username}` 
      });
    } else {
      toast({ title: "خطأ", description: "الكمية المطلوبة غير متوفرة.", variant: "destructive" });
    }
  };

  const technicians = users.filter(u => u.role === 'technician');
  const totalMaterials = getTotalMaterials(userInventories);
  const totalCableMeters = getTotalCableMeters(userInventories);
  const lowStockUsers = getLowStockUsers(userInventories);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="grid w-full grid-cols-2 glass-effect">
          <TabsTrigger value="manual">إضافة يدوية</TabsTrigger>
          <TabsTrigger value="bulk">إضافة مجمعة</TabsTrigger>
        </TabsList>
        
        <TabsContent value="manual" className="mt-6">
          <Card className="glass-effect border-green-500/20 enhanced-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl gradient-text font-bold">
                <Plus className="w-8 h-8" />
                إضافة مواد للمستخدمين
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>المستخدم</Label>
                  <select 
                    value={selectedUser} 
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="w-full p-2 rounded-md bg-slate-800 border border-slate-600 text-white"
                  >
                    <option value="">اختر المستخدم</option>
                    {technicians.map(user => (
                      <option key={user.username} value={user.username}>{user.username}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label>نوع المادة</Label>
                  <select 
                    value={materialToAdd.type} 
                    onChange={(e) => setMaterialToAdd({...materialToAdd, type: e.target.value})}
                    className="w-full p-2 rounded-md bg-slate-800 border border-slate-600 text-white"
                  >
                    <option value="">اختر المادة</option>
                    {Object.entries(materialTypes).map(([key, material]) => (
                      <option key={key} value={key}>{material.icon} {material.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label>الكمية</Label>
                  <Input
                    type="number"
                    min="1"
                    value={materialToAdd.quantity}
                    onChange={(e) => setMaterialToAdd({...materialToAdd, quantity: parseInt(e.target.value) || 0})}
                    className="glass-effect"
                  />
                </div>
                
                <div className="flex items-end">
                  <Button onClick={addMaterialToUser} className="w-full bg-gradient-to-r from-green-500 to-emerald-500">
                    <Plus className="ml-2 h-4 w-4" />
                    إضافة
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="bulk" className="mt-6">
          <MaterialImporter onAddMaterials={handleBulkAddMaterials} users={users} />
        </TabsContent>
      </Tabs>

      {lowStockUsers.length > 0 && (
        <Card className="glass-effect border-red-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl text-red-300">
              <AlertTriangle className="w-6 h-6" />
              تحذير: مخزون منخفض
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockUsers.map(([username]) => (
                <div key={username} className="p-2 bg-red-500/10 border border-red-500/30 rounded text-red-300">
                  المستخدم {username} لديه مواد منخفضة في المخزون
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="glass-effect border-blue-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl text-blue-300">
            <Boxes className="w-6 h-6" />
            إجمالي المواد المتوفرة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            {Object.entries(materialTypes).map(([key, material]) => (
              <div key={key} className="text-center p-3 bg-slate-800/50 rounded-lg">
                <div className="text-2xl mb-1">{material.icon}</div>
                <div className="text-lg font-bold text-blue-400">{totalMaterials[key]}</div>
                <div className="text-xs text-gray-400">{material.name}</div>
                {material.length && (
                  <div className="text-xs text-green-400">
                    {totalMaterials[key] * material.length} متر
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/30">
            <h4 className="text-lg font-semibold text-blue-300 mb-2">إحصائيات الكيبل</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-400">{totalCableMeters}</div>
                <div className="text-sm text-gray-400">إجمالي الأمتار</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-400">{totalMaterials.cable80}</div>
                <div className="text-sm text-gray-400">قطع 80 متر</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400">{totalMaterials.cable100}</div>
                <div className="text-sm text-gray-400">قطع 100 متر</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-pink-400">{totalMaterials.cable150 + totalMaterials.cable200}</div>
                <div className="text-sm text-gray-400">قطع طويلة</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-effect border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl gradient-text font-bold">
            <Package className="w-8 h-8" />
            مخزون المستخدمين المتطور
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(userInventories).map(([username, inventory]) => {
              const userCableMeters = calculateTotalCableMeters(inventory.available);
              
              return (
                <div key={username} className="p-4 bg-slate-800/30 rounded-lg border border-slate-600">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-purple-300">{username}</h4>
                    <div className="text-sm text-green-400 font-bold">
                      إجمالي الكيبل: {userCableMeters} متر
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h5 className="text-sm font-medium text-green-300 mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        المواد المتوفرة
                      </h5>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(materialTypes).map(([key, material]) => (
                          <div key={key} className="flex items-center justify-between p-2 bg-green-500/10 rounded border border-green-500/30">
                            <span className="text-xs">{material.icon} {material.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-green-400">
                                {inventory.available[key]} {material.unit}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeMaterialFromUser(username, key, 1)}
                                className="h-6 w-6 p-0 text-red-400 hover:bg-red-500/20"
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h5 className="text-sm font-medium text-red-300 mb-3 flex items-center gap-2">
                        <TrendingDown className="w-4 h-4" />
                        المواد المستخدمة
                      </h5>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(materialTypes).map(([key, material]) => (
                          <div key={key} className="flex items-center justify-between p-2 bg-red-500/10 rounded border border-red-500/30">
                            <span className="text-xs">{material.icon} {material.name}</span>
                            <span className="text-sm font-bold text-red-400">
                              {inventory.used[key]} {material.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MaterialInventoryManager;