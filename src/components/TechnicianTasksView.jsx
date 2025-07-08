import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ClipboardList, CheckCircle, Clock, List } from 'lucide-react';
import TaskCard from '@/components/TaskCard';
import UpdateTaskDialog from '@/components/UpdateTaskDialog';
import TaskFilters from '@/components/tasks/TaskFilters';
import TaskStats from '@/components/tasks/TaskStats';
import TaskPriorityBadge from '@/components/tasks/TaskPriorityBadge';

const TechnicianTasksView = ({ user, tasks, onUpdateTasks }) => {
  const { toast } = useToast();
  const [selectedTask, setSelectedTask] = useState(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // تحميل إعدادات رؤية المهام والحدود
  const taskVisibilitySettings = JSON.parse(localStorage.getItem('taskVisibilitySettings')) || {};
  const userVisibility = taskVisibilitySettings[user.username] || {};
  const taskLimits = JSON.parse(localStorage.getItem('taskLimits')) || {};
  const userTaskLimit = taskLimits[user.username] || 2;

  // تصنيف المهام
  const myTasks = tasks.filter(t => t.assignedTo === user.username && t.status === 'In Progress');
  const completedTasks = tasks.filter(t => t.assignedTo === user.username && t.status === 'Done');

  // نظام أولويات المهام
  const getTaskPriority = (task) => {
    const status = task.oldFeedback?.status?.toLowerCase() || '';
    if (status.includes('no answer')) return 1;
    if (status.includes('reschedule')) return 2;
    if (status.includes('fat issue')) return 3;
    return 4;
  };

  // فلترة المهام حسب إعدادات الرؤية
  const filterTasksByVisibility = (taskList) => {
    return taskList.filter(task => {
      if (Object.keys(userVisibility).length === 0) return true;
      const taskStatus = task.status;
      const oldStatus = task.oldFeedback?.status;
      return userVisibility[taskStatus] || userVisibility[oldStatus];
    });
  };

  // فلترة وترتيب المهام المتاحة
  const availableTasks = useMemo(() => {
    let filtered = filterTasksByVisibility(tasks.filter(t => t.status === 'New'));
    
    // تطبيق فلاتر البحث
    if (searchTerm) {
      filtered = filtered.filter(task => 
        task.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.phone?.includes(searchTerm) ||
        task.ticketId?.toString().includes(searchTerm) ||
        task.zone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => {
        const oldStatus = task.oldFeedback?.status?.toLowerCase() || '';
        if (priorityFilter === 'urgent' && !oldStatus.includes('no answer')) return false;
        if (priorityFilter === 'medium' && !oldStatus.includes('reschedule')) return false;
        if (priorityFilter === 'low' && !oldStatus.includes('fat issue')) return false;
        if (priorityFilter === 'normal' && (oldStatus.includes('no answer') || oldStatus.includes('reschedule') || oldStatus.includes('fat issue'))) return false;
        return true;
      });
    }

    return filtered.sort((a, b) => getTaskPriority(a) - getTaskPriority(b));
  }, [tasks, searchTerm, statusFilter, priorityFilter, userVisibility]);

  // فلترة المهام المنجزة
  const filteredCompletedTasks = useMemo(() => {
    let filtered = completedTasks;
    
    if (searchTerm) {
      filtered = filtered.filter(task => 
        task.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.phone?.includes(searchTerm) ||
        task.ticketId?.toString().includes(searchTerm)
      );
    }

    return filtered;
  }, [completedTasks, searchTerm]);

  // إحصائيات المهام
  const taskStats = useMemo(() => {
    return {
      total: availableTasks.length + myTasks.length + completedTasks.length,
      new: availableTasks.length,
      inProgress: myTasks.length,
      done: completedTasks.length,
      urgent: availableTasks.filter(t => t.oldFeedback?.status?.toLowerCase().includes('no answer')).length,
      reschedule: availableTasks.filter(t => t.oldFeedback?.status?.toLowerCase().includes('reschedule')).length,
    };
  }, [availableTasks, myTasks, completedTasks]);

  const shouldShowNewTasks = myTasks.length < userTaskLimit;

  const handleAcceptTask = (ticketId) => {
    if (myTasks.length >= userTaskLimit) {
      toast({
        title: "لا يمكن قبول المزيد",
        description: `لقد وصلت إلى الحد الأقصى للمهام (${userTaskLimit}). أكمل مهمة حالية لقبول المزيد.`,
        variant: "destructive",
      });
      return;
    }

    const updatedTasks = tasks.map(t =>
      t.ticketId === ticketId
        ? { ...t, status: 'In Progress', assignedTo: user.username }
        : t
    );
    onUpdateTasks(updatedTasks);
    toast({ title: "تم قبول المهمة!", description: "يمكنك الآن العثور عليها في 'مهامي'." });
  };

  const handleOpenUpdateDialog = (task) => {
    setSelectedTask(task);
    setIsUpdateDialogOpen(true);
  };

  const handleUpdateTask = (feedbackData) => {
    const updatedTasks = tasks.map(t => {
        if (t.ticketId === selectedTask.ticketId) {
            const newHistoryEntry = {
                ...feedbackData,
                timestamp: new Date().toISOString(),
                updatedBy: user.username,
            };
            const newHistory = t.feedbackHistory ? [...t.feedbackHistory, newHistoryEntry] : [newHistoryEntry];
            return {
                ...t,
                status: feedbackData.status,
                feedbackHistory: newHistory,
                rescheduleDate: feedbackData.rescheduleDate || t.rescheduleDate,
            };
        }
        return t;
    });
    onUpdateTasks(updatedTasks);
    toast({ title: "تم تحديث المهمة بنجاح!" });
    setIsUpdateDialogOpen(false);
    setSelectedTask(null);
  };

  const renderTasksByPriority = (taskList, showPriorityBadge = true) => {
    const priorityGroups = [
      { priority: 1, title: '🚨 مهام عاجلة - عدم رد', color: 'text-red-300' },
      { priority: 2, title: '⏰ مهام إعادة جدولة', color: 'text-yellow-300' },
      { priority: 3, title: '🔧 مهام مشاكل فنية', color: 'text-blue-300' },
      { priority: 4, title: '📋 مهام أخرى', color: 'text-gray-300' }
    ];

    return priorityGroups.map(group => {
      const groupTasks = taskList.filter(t => getTaskPriority(t) === group.priority);
      if (groupTasks.length === 0) return null;

      return (
        <div key={group.priority}>
          <h3 className={`text-lg font-bold ${group.color} mb-4 flex items-center gap-2`}>
            {group.title} ({groupTasks.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <AnimatePresence>
              {groupTasks.map(task => (
                <div key={task.ticketId}>
                  {showPriorityBadge && <TaskPriorityBadge task={task} />}
                  <TaskCard task={task} onAccept={handleAcceptTask} />
                </div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      );
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* إحصائيات المهام */}
      <Card className="glass-effect border-cyan-500/20 enhanced-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl gradient-text font-bold">
            <ClipboardList className="w-8 h-8" />
            إدارة المهام المتطورة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TaskStats stats={taskStats} />
          <TaskFilters 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
          />
        </CardContent>
      </Card>

      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full grid-cols-3 glass-effect enhanced-card">
          <TabsTrigger value="available">
            <List className="w-4 h-4 ml-2" />
            مهام متاحة ({shouldShowNewTasks ? availableTasks.length : 0})
          </TabsTrigger>
          <TabsTrigger value="mine">
            <Clock className="w-4 h-4 ml-2" />
            مهامي ({myTasks.length}/{userTaskLimit})
          </TabsTrigger>
          <TabsTrigger value="completed">
            <CheckCircle className="w-4 h-4 ml-2" />
            المهام المنجزة ({completedTasks.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="available" className="mt-6">
          {!shouldShowNewTasks ? (
            <div className="text-center py-12">
              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-6 max-w-md mx-auto enhanced-card">
                <h3 className="text-xl font-bold text-yellow-300 mb-2">أكمل مهامك الحالية أولاً</h3>
                <p className="text-gray-300">
                  لديك {myTasks.length} مهمة قيد التنفيذ من أصل {userTaskLimit} مسموح. أكمل مهمة لقبول المزيد.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {renderTasksByPriority(availableTasks)}
              {availableTasks.length === 0 && (
                <p className="text-center text-gray-400 py-8">لا توجد مهام متاحة حاليًا أو لا تملك صلاحية لرؤيتها.</p>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="mine" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {myTasks.map(task => (
                <TaskCard key={task.ticketId} task={task} onUpdate={handleOpenUpdateDialog} />
              ))}
            </AnimatePresence>
            {myTasks.length === 0 && (
              <p className="col-span-full text-center text-gray-400 py-8">ليس لديك أي مهام قيد التنفيذ.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredCompletedTasks.map(task => (
                <TaskCard key={task.ticketId} task={task} />
              ))}
            </AnimatePresence>
            {filteredCompletedTasks.length === 0 && (
              <p className="col-span-full text-center text-gray-400 py-8">لم تكمل أي مهام بعد.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {selectedTask && (
        <UpdateTaskDialog
          isOpen={isUpdateDialogOpen}
          setIsOpen={setIsUpdateDialogOpen}
          task={selectedTask}
          onUpdate={handleUpdateTask}
        />
      )}
    </motion.div>
  );
};

export default TechnicianTasksView;