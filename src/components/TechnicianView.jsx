import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, Package, FileText } from 'lucide-react';
import TechnicianTasksView from '@/components/TechnicianTasksView';
import TechnicianInventoryView from '@/components/TechnicianInventoryView';
import TechnicianReportsView from '@/components/TechnicianReportsView';

const TechnicianView = ({ user, tasks, onUpdateTasks, reports, onUpdateReports }) => {
  // تحميل صلاحيات المستخدم
  const userPermissions = JSON.parse(localStorage.getItem('userPermissions')) || {};
  const permissions = userPermissions[user.username] || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="grid w-full grid-cols-3 glass-effect enhanced-card">
          <TabsTrigger value="tasks">
            <ClipboardList className="w-4 h-4 ml-2" />
            المهام
          </TabsTrigger>
          {(permissions.canViewInventory !== false) && (
            <TabsTrigger value="inventory">
              <Package className="w-4 h-4 ml-2" />
              المواد المخزونة
            </TabsTrigger>
          )}
          {(permissions.canCreateReports !== false) && (
            <TabsTrigger value="reports">
              <FileText className="w-4 h-4 ml-2" />
              التقارير
            </TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="tasks" className="mt-6">
          <TechnicianTasksView 
            user={user} 
            tasks={tasks} 
            onUpdateTasks={onUpdateTasks} 
          />
        </TabsContent>
        
        {(permissions.canViewInventory !== false) && (
          <TabsContent value="inventory" className="mt-6">
            <TechnicianInventoryView user={user} />
          </TabsContent>
        )}
        
        {(permissions.canCreateReports !== false) && (
          <TabsContent value="reports" className="mt-6">
            <TechnicianReportsView 
              user={user}
              reports={reports}
              onUpdateReports={onUpdateReports}
            />
          </TabsContent>
        )}
      </Tabs>
    </motion.div>
  );
};

export default TechnicianView;