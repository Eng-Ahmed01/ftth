import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Shield, Settings, Users, Eye, EyeOff, Save } from 'lucide-react';

const PermissionManager = ({ users, onUpdateUsers }) => {
  const { toast } = useToast();
  const [userPermissions, setUserPermissions] = useState({});
  const [taskVisibilitySettings, setTaskVisibilitySettings] = useState({});

  const availablePermissions = {
    canAddTasks: 'إضافة مهام',
    canEditTasks: 'تعديل المهام',
    canDeleteTasks: 'حذف المهام',
    canAddMaterials: 'إضافة مواد',
    canManageMaterials: 'إدارة المواد',
    canViewReports: 'عرض التقارير',
    canCreateReports: 'إنشاء تقارير',
    canExportData: 'تصدير البيانات',
    canManageUsers: 'إدارة المستخدمين',
    canViewFinancials: 'عرض الذمة المالية',
    canManageInventory: 'إدارة المخزون',
    canAccessDashboard: 'الوصول للوحة التحكم'
  };

  const taskStatuses = [
    'New', 'In Progress', 'Done', 'Cancelled', 'Reschedule', 
    'No Answer', 'Already In Service', 'Duplicate', 
    'Done By Contractor', 'Out of coverage', 'FAT Issue'
  ];

  useEffect(() => {
    loadPermissions();
  }, [users]);

  const loadPermissions = () => {
    const savedPermissions = JSON.parse(localStorage.getItem('userPermissions')) || {};
    const savedVisibility = JSON.parse(localStorage.getItem('taskVisibilitySettings')) || {};
    
    const permissions = {};
    const visibility = {};
    
    users.forEach(user => {
      if (user.role === 'admin') {
        // المشرف له جميع الصلاحيات
        permissions[user.username] = Object.keys(availablePermissions).reduce((acc, perm) => {
          acc[perm] = true;
          return acc;
        }, {});
        visibility[user.username] = taskStatuses.reduce((acc, status) => {
          acc[status] = true;
          return acc;
        }, {});
      } else {
        permissions[user.username] = savedPermissions[user.username] || Object.keys(availablePermissions).reduce((acc, perm) => {
          acc[perm] = user.role === 'creator' ? true : false;
          return acc;
        }, {});
        
        visibility[user.username] = savedVisibility[user.username] || taskStatuses.reduce((acc, status) => {
          acc[status] = true;
          return acc;
        }, {});
      }
    });
    
    setUserPermissions(permissions);
    setTaskVisibilitySettings(visibility);
  };

  const updateUserPermission = (username, permission, value) => {
    setUserPermissions(prev => ({
      ...prev,
      [username]: {
        ...prev[username],
        [permission]: value
      }
    }));
  };

  const updateTaskVisibility = (username, status, value) => {
    setTaskVisibilitySettings(prev => ({
      ...prev,
      [username]: {
        ...prev[username],
        [status]: value
      }
    }));
  };

  const savePermissions = () => {
    localStorage.setItem('userPermissions', JSON.stringify(userPermissions));
    localStorage.setItem('taskVisibilitySettings', JSON.stringify(taskVisibilitySettings));
    
    // تحديث المستخدمين مع الصلاحيات الجديدة
    const updatedUsers = users.map(user => ({
      ...user,
      permissions: userPermissions[user.username] || {},
      taskVisibility: taskVisibilitySettings[user.username] || {}
    }));
    
    onUpdateUsers(updatedUsers);
    toast({ title: "تم الحفظ!", description: "تم حفظ إعدادات الصلاحيات بنجاح." });
  };

  const toggleAllPermissions = (username, value) => {
    const newPermissions = Object.keys(availablePermissions).reduce((acc, perm) => {
      acc[perm] = value;
      return acc;
    }, {});
    
    setUserPermissions(prev => ({
      ...prev,
      [username]: newPermissions
    }));
  };

  const toggleAllTaskVisibility = (username, value) => {
    const newVisibility = taskStatuses.reduce((acc, status) => {
      acc[status] = value;
      return acc;
    }, {});
    
    setTaskVisibilitySettings(prev => ({
      ...prev,
      [username]: newVisibility
    }));
  };

  const editableUsers = users.filter(u => u.role !== 'admin');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Card className="glass-effect border-purple-500/20 enhanced-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-3xl gradient-text font-bold">
            <Shield className="w-8 h-8" />
            إدارة الصلاحيات المتقدمة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {editableUsers.map(user => (
            <div key={user.username} className="p-6 bg-slate-800/30 rounded-lg border border-slate-600">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-sky-300 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {user.username}
                  <span className="text-sm text-gray-400">({user.role})</span>
                </h3>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleAllPermissions(user.username, true)}
                    className="text-green-400 border-green-500/30"
                  >
                    تفعيل الكل
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleAllPermissions(user.username, false)}
                    className="text-red-400 border-red-500/30"
                  >
                    إلغاء الكل
                  </Button>
                </div>
              </div>

              {/* الصلاحيات */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-purple-300 mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  الصلاحيات
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(availablePermissions).map(([key, label]) => (
                    <div key={key} className="flex items-center space-x-2 space-x-reverse p-3 bg-slate-900/50 rounded border border-slate-700">
                      <Checkbox
                        id={`${user.username}-${key}`}
                        checked={userPermissions[user.username]?.[key] || false}
                        onCheckedChange={(checked) => updateUserPermission(user.username, key, checked)}
                      />
                      <Label htmlFor={`${user.username}-${key}`} className="text-sm text-gray-300 cursor-pointer">
                        {label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* إعدادات رؤية المهام */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-cyan-300 flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    رؤية المهام حسب الحالة
                  </h4>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleAllTaskVisibility(user.username, true)}
                      className="text-green-400 border-green-500/30"
                    >
                      <Eye className="w-4 h-4 ml-1" />
                      إظهار الكل
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleAllTaskVisibility(user.username, false)}
                      className="text-red-400 border-red-500/30"
                    >
                      <EyeOff className="w-4 h-4 ml-1" />
                      إخفاء الكل
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {taskStatuses.map(status => (
                    <div key={status} className="flex items-center space-x-2 space-x-reverse p-2 bg-slate-900/50 rounded border border-slate-700">
                      <Checkbox
                        id={`${user.username}-${status}`}
                        checked={taskVisibilitySettings[user.username]?.[status] || false}
                        onCheckedChange={(checked) => updateTaskVisibility(user.username, status, checked)}
                      />
                      <Label htmlFor={`${user.username}-${status}`} className="text-xs text-gray-300 cursor-pointer">
                        {status}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-center pt-6">
            <Button onClick={savePermissions} className="bg-gradient-to-r from-green-500 to-emerald-500 px-8 py-3">
              <Save className="ml-2 h-5 w-5" />
              حفظ جميع الإعدادات
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PermissionManager;