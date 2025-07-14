import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Settings, Save, Users } from 'lucide-react';

const TaskLimitManager = ({ users }) => {
  const { toast } = useToast();
  const [taskLimits, setTaskLimits] = useState({});

  useEffect(() => {
    const savedLimits = JSON.parse(localStorage.getItem('taskLimits')) || {};
    setTaskLimits(savedLimits);
  }, []);

  const handleLimitChange = (username, limit) => {
    const newLimits = { ...taskLimits, [username]: parseInt(limit) || 2 };
    setTaskLimits(newLimits);
  };

  const saveLimits = () => {
    localStorage.setItem('taskLimits', JSON.stringify(taskLimits));
    toast({ 
      title: "تم الحفظ!", 
      description: "تم حفظ حدود المهام لجميع المستخدمين بنجاح." 
    });
  };

  const technicians = users.filter(u => u.role === 'technician');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="glass-effect border-blue-500/20 enhanced-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl gradient-text font-bold">
            <Settings className="w-8 h-8" />
            إدارة حدود المهام للمستخدمين
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {technicians.map(user => (
              <div key={user.username} className="p-4 bg-slate-800/30 rounded-lg border border-slate-600">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="w-5 h-5 text-blue-400" />
                  <h4 className="text-lg font-semibold text-blue-300">{user.username}</h4>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`limit-${user.username}`}>الحد الأقصى للمهام</Label>
                  <Input
                    id={`limit-${user.username}`}
                    type="number"
                    min="1"
                    max="10"
                    value={taskLimits[user.username] || 2}
                    onChange={(e) => handleLimitChange(user.username, e.target.value)}
                    className="glass-effect"
                    placeholder="2"
                  />
                  <p className="text-xs text-gray-400">
                    عدد المهام التي يمكن للمستخدم قبولها في نفس الوقت
                  </p>
                </div>
              </div>
            ))}
          </div>

          {technicians.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-400 mb-2">لا يوجد فنيون</h3>
              <p className="text-gray-500">
                لم يتم العثور على أي مستخدمين بدور "فني" لإدارة حدود المهام.
              </p>
            </div>
          )}

          <div className="flex justify-center pt-4">
            <Button onClick={saveLimits} className="bg-gradient-to-r from-blue-500 to-cyan-500 px-8">
              <Save className="ml-2 h-4 w-4" />
              حفظ جميع الحدود
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TaskLimitManager;