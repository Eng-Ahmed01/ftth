import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { LogOut, User, FileText, ClipboardList, BarChart2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from 'framer-motion';

const TaskCreatorView = lazy(() => import('@/components/TaskCreatorView'));
const TechnicianView = lazy(() => import('@/components/TechnicianView'));
const AdminView = lazy(() => import('@/components/AdminView'));
const ChangePasswordDialog = lazy(() => import('@/components/ChangePasswordDialog'));
const ReportForm = lazy(() => import('@/components/ReportForm'));
const HistoryList = lazy(() => import('@/components/HistoryList'));

const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-full min-h-[50vh]">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-sky-400"></div>
    </div>
);

const Dashboard = ({ user, onLogout, users, onUpdateUsers, view, setView }) => {
  const [tasks, setTasks] = useState([]);
  const [reports, setReports] = useState([]);
  const [zoneData, setZoneData] = useState([]);

  useEffect(() => {
    try {
      let savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
      const migratedTasks = savedTasks.map(task => {
        if (task.feedback && !task.feedbackHistory) {
          const { feedback, ...restOfTask } = task;
          const historyEntry = {
            ...feedback,
            timestamp: task.timestamp || new Date().toISOString(),
            updatedBy: task.assignedTo || 'unknown',
          };
          return { ...restOfTask, feedbackHistory: [historyEntry] };
        }
        if (!task.feedbackHistory) {
            return { ...task, feedbackHistory: [] };
        }
        if (!task.hasOwnProperty('hasDash')) {
          return { ...task, hasDash: false, dash: '' };
        }
        return task;
      });
      setTasks(migratedTasks);
      setReports(JSON.parse(localStorage.getItem('reports')) || []);
      setZoneData(JSON.parse(localStorage.getItem('zoneData')) || []);
    } catch (error) {
      console.error("Failed to parse data from localStorage", error);
      localStorage.clear();
    }
  }, []);

  const updateTasks = (newTasks) => {
    setTasks(newTasks);
    localStorage.setItem('tasks', JSON.stringify(newTasks));
  };

  const updateReports = (newReports) => {
    setReports(newReports);
    localStorage.setItem('reports', JSON.stringify(newReports));
  };

  const handleSaveReport = (reportData) => {
    const newReport = { ...reportData, id: Date.now(), submittedBy: user.username, timestamp: new Date().toISOString() };
    const updatedReports = [...reports, newReport];
    setReports(updatedReports);
    localStorage.setItem('reports', JSON.stringify(updatedReports));
    return newReport;
  };

  const handleAdminClearAllReports = () => {
    setReports([]);
    localStorage.removeItem('reports');
  };

  const renderContent = () => {
    if (user.role === 'admin') {
      return (
         <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 glass-effect">
            <TabsTrigger value="overview"><BarChart2 className="w-4 h-4 ml-2" />نظرة عامة وإدارة</TabsTrigger>
            <TabsTrigger value="tasks"><ClipboardList className="w-4 h-4 ml-2" />إدارة المهام</TabsTrigger>
            <TabsTrigger value="reports"><FileText className="w-4 h-4 ml-2" />إدارة التقارير</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-4">
            <Suspense fallback={<LoadingSpinner />}>
              <AdminView
                tasks={tasks}
                users={users}
                onUpdateUsers={onUpdateUsers}
                reports={reports}
                onUpdateTasks={updateTasks}
                onUpdateReports={updateReports}
                currentUser={user}
              />
            </Suspense>
          </TabsContent>
          <TabsContent value="tasks" className="mt-4">
            <Suspense fallback={<LoadingSpinner />}>
              <TaskCreatorView user={user} onUpdateTasks={updateTasks} currentTasks={tasks} />
            </Suspense>
          </TabsContent>
          <TabsContent value="reports" className="mt-4">
              <Suspense fallback={<LoadingSpinner />}>
                <ReportForm onSaveReport={handleSaveReport} zoneData={zoneData} />
                <HistoryList 
                  entries={reports} 
                  onClearEntries={handleAdminClearAllReports} 
                  onUpdateReports={updateReports}
                  isAdmin={true} 
                />
              </Suspense>
          </TabsContent>
        </Tabs>
      );
    }
    if (user.role === 'creator') {
      return (
        <Suspense fallback={<LoadingSpinner />}>
          <TaskCreatorView user={user} onUpdateTasks={updateTasks} currentTasks={tasks} />
        </Suspense>
      );
    }
    if (user.role === 'technician') {
      return (
        <Suspense fallback={<LoadingSpinner />}>
          <TechnicianView 
            user={user} 
            tasks={tasks} 
            onUpdateTasks={updateTasks}
            reports={reports}
            onUpdateReports={updateReports}
          />
        </Suspense>
      );
    }
    return <p>دور المستخدم غير معروف.</p>;
  };
  
  const getRoleName = (role) => {
    switch (role) {
        case 'admin': return 'لوحة تحكم المشرف العام';
        case 'creator': return 'بوابة إدارة المهام';
        case 'technician': return 'لوحة الفني';
        default: return 'لوحة التحكم';
    }
  }

  return (
    <>
      <Helmet>
        <title>لوحة التحكم - {user.username}</title>
        <meta name="description" content="نظام إدارة مهام متطور وسريع الاستجابة." />
        <html lang="ar" />
      </Helmet>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="p-4 sm:p-6 md:p-8"
      >
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8 max-w-7xl mx-auto gap-4">
          <div className="flex items-center gap-3">
             <div className="p-3 rounded-full bg-sky-500/20">
                <User className="w-6 h-6 text-sky-300" />
             </div>
             <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">مرحباً، {user.username}</h1>
                <p className="text-sm text-gray-400">{getRoleName(user.role)}</p>
             </div>
          </div>
          <div className="flex items-center gap-2">
            <Suspense fallback={<Button variant="ghost" disabled>...</Button>}>
              <ChangePasswordDialog user={user} users={users} onUpdateUsers={onUpdateUsers} />
            </Suspense>
            <Button variant="ghost" onClick={onLogout}>
              <LogOut className="ml-2 h-5 w-5" />
              تسجيل الخروج
            </Button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto">
          {renderContent()}
        </main>
      </motion.div>
    </>
  );
};

export default Dashboard;