import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, XCircle, Users, BarChart2, Package, TrendingUp, Shield, Settings } from 'lucide-react';
import UserManager from '@/components/UserManager';
import PermissionManager from '@/components/PermissionManager';
import EnhancedFinancialManager from '@/components/EnhancedFinancialManager';
import MaterialInventoryManager from '@/components/MaterialInventoryManager';
import SubscriberDashboard from '@/components/SubscriberDashboard';
import ReportsTable from '@/components/reports/ReportsTable';
import DashTasksTable from '@/components/DashTasksTable';
import TaskLimitManager from '@/components/tasks/TaskLimitManager';
import GoogleSheetsManager from '@/components/GoogleSheetsManager';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TaskStatusCard = ({ title, count, icon, color }) => (
  <Card className={`glass-effect border-${color}-500/30 enhanced-card`}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-300">{title}</CardTitle>
      {React.cloneElement(icon, { className: `h-5 w-5 text-${color}-400` })}
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold gradient-text">{count}</div>
    </CardContent>
  </Card>
);

const AdminView = ({ tasks, users, onUpdateUsers, reports, onUpdateTasks, onUpdateReports }) => {
  const technicians = users.filter(u => u.role === 'technician');

  const taskStats = {
    new: tasks.filter(t => t.status === 'New').length,
    inProgress: tasks.filter(t => t.status === 'In Progress').length,
    completed: tasks.filter(t => t.status === 'Done').length,
    withDash: tasks.filter(t => t.hasDash && t.dash).length,
  };

  const userPerformanceData = technicians.map(tech => {
    const completedTasks = tasks.filter(
      t => t.assignedTo === tech.username && t.status === 'Done'
    ).length;
    const installationReports = reports.filter(r => r.submittedBy === tech.username).length;
    return {
      name: tech.username,
      'مهام منجزة': completedTasks,
      'تقارير تنصيب': installationReports,
    };
  });

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 glass-effect text-xs overflow-x-auto mobile-scroll-tabs">
        <TabsTrigger value="overview" className="text-xs shrink-0"><BarChart2 className="w-3 h-3 ml-1" />نظرة عامة</TabsTrigger>
        <TabsTrigger value="task-limits" className="text-xs shrink-0"><Settings className="w-3 h-3 ml-1" />حدود المهام</TabsTrigger>
        <TabsTrigger value="permissions" className="text-xs shrink-0"><Shield className="w-3 h-3 ml-1" />الصلاحيات</TabsTrigger>
        <TabsTrigger value="dash" className="text-xs shrink-0">📊 مهام الداش</TabsTrigger>
        <TabsTrigger value="subscribers" className="text-xs shrink-0"><TrendingUp className="w-3 h-3 ml-1" />المشتركون</TabsTrigger>
        <TabsTrigger value="users" className="text-xs shrink-0"><Users className="w-3 h-3 ml-1" />المستخدمون</TabsTrigger>
        <TabsTrigger value="inventory" className="text-xs shrink-0"><Package className="w-3 h-3 ml-1" />المخزون</TabsTrigger>
        <TabsTrigger value="financial" className="text-xs shrink-0">💰 الذمة المالية</TabsTrigger>
        <TabsTrigger value="sheets" className="text-xs shrink-0">📊 Google Sheets</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="mt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold gradient-text mb-6 flex items-center gap-3">
              <BarChart2 className="w-8 h-8 lg:w-10 lg:h-10" /> 
              لوحة التحكم الرئيسية المتطورة
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
              <TaskStatusCard title="مهام جديدة" count={taskStats.new} icon={<XCircle />} color="sky" />
              <TaskStatusCard title="قيد التنفيذ" count={taskStats.inProgress} icon={<Clock />} color="yellow" />
              <TaskStatusCard title="مهام منجزة" count={taskStats.completed} icon={<CheckCircle />} color="green" />
              <TaskStatusCard title="مهام بداش" count={taskStats.withDash} icon={<BarChart2 />} color="purple" />
            </div>
            <Card className="glass-effect border-fuchsia-500/20 enhanced-card">
              <CardHeader>
                <CardTitle className="text-xl md:text-2xl text-fuchsia-300 font-bold">أداء الفنيين المتقدم</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={userPerformanceData}>
                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(30, 41, 59, 0.9)",
                        borderColor: "#38bdf8",
                        color: "#e5e7eb",
                        borderRadius: "8px",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '14px' }} />
                    <Bar dataKey="مهام منجزة" fill="#34d399" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="تقارير تنصيب" fill="#a78bfa" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <div className="mt-8">
              <ReportsTable 
                tasks={tasks} 
                reports={reports} 
                onUpdateTasks={onUpdateTasks}
                onUpdateReports={onUpdateReports}
                isAdmin={true}
              />
            </div>
          </div>
        </motion.div>
      </TabsContent>
      
      <TabsContent value="task-limits" className="mt-6">
        <TaskLimitManager users={users} />
      </TabsContent>
      
      <TabsContent value="permissions" className="mt-6">
        <PermissionManager users={users} onUpdateUsers={onUpdateUsers} />
      </TabsContent>
      
      <TabsContent value="dash" className="mt-6">
        <DashTasksTable tasks={tasks} />
      </TabsContent>
      
      <TabsContent value="subscribers" className="mt-6">
        <SubscriberDashboard tasks={tasks} reports={reports} />
      </TabsContent>
      
      <TabsContent value="users" className="mt-6">
        <UserManager users={users} onUpdateUsers={onUpdateUsers} />
      </TabsContent>
      
      <TabsContent value="inventory" className="mt-6">
        <MaterialInventoryManager users={users} reports={reports} onUpdateUsers={onUpdateUsers} />
      </TabsContent>
      
      <TabsContent value="financial" className="mt-6">
        <EnhancedFinancialManager users={users} reports={reports} tasks={tasks} />
      </TabsContent>
      
      <TabsContent value="sheets" className="mt-6">
        <GoogleSheetsManager 
          tasks={tasks} 
          reports={reports} 
          onUpdateTasks={onUpdateTasks}
          onUpdateReports={onUpdateReports}
        />
      </TabsContent>
    </Tabs>
  );
};

export default AdminView;