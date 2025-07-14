import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { ClipboardList, Search, Filter, Download, User, Phone, MapPin, Hash, Router, Calendar, MessageSquare, CheckCircle, Clock, XCircle, AlertTriangle } from 'lucide-react';
import * as XLSX from 'xlsx';

const TasksOnlyView = ({ tasks, onUpdateTasks, users }) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // فلترة المهام
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = !searchTerm || 
        task.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.phone?.includes(searchTerm) ||
        task.ticketId?.toString().includes(searchTerm) ||
        task.zone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.location?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesAssignee = assigneeFilter === 'all' || task.assignedTo === assigneeFilter;
      
      // فلترة حسب الأولوية
      let matchesPriority = true;
      if (priorityFilter !== 'all') {
        const oldStatus = task.oldFeedback?.status?.toLowerCase() || '';
        if (priorityFilter === 'urgent' && !oldStatus.includes('no answer')) matchesPriority = false;
        if (priorityFilter === 'medium' && !oldStatus.includes('reschedule')) matchesPriority = false;
        if (priorityFilter === 'low' && !oldStatus.includes('fat issue')) matchesPriority = false;
        if (priorityFilter === 'normal' && (oldStatus.includes('no answer') || oldStatus.includes('reschedule') || oldStatus.includes('fat issue'))) matchesPriority = false;
      }

      return matchesSearch && matchesStatus && matchesAssignee && matchesPriority;
    });
  }, [tasks, searchTerm, statusFilter, assigneeFilter, priorityFilter]);

  // إحصائيات المهام
  const taskStats = useMemo(() => {
    return {
      total: filteredTasks.length,
      new: filteredTasks.filter(t => t.status === 'New').length,
      inProgress: filteredTasks.filter(t => t.status === 'In Progress').length,
      done: filteredTasks.filter(t => t.status === 'Done').length,
      withDash: filteredTasks.filter(t => t.hasDash && t.dash).length,
      urgent: filteredTasks.filter(t => t.oldFeedback?.status?.toLowerCase().includes('no answer')).length,
      reschedule: filteredTasks.filter(t => t.oldFeedback?.status?.toLowerCase().includes('reschedule')).length,
    };
  }, [filteredTasks]);

  // تصدير إلى Excel
  const exportToExcel = () => {
    const excelData = filteredTasks.map(task => ({
      'رقم التذكرة': task.ticketId,
      'الاسم': task.name || '',
      'رقم الهاتف': task.phone || '',
      'المنطقة': task.zone || '',
      'الموقع': task.location || '',
      'الحالة': task.status,
      'المُعيّن إليه': task.assignedTo || 'غير مُعيّن',
      'رقم الداش': task.dash || '',
      'تاريخ الإنشاء': task.createdAt ? new Date(task.createdAt).toLocaleDateString('ar-SA') : '',
      'آخر تحديث': task.feedbackHistory && task.feedbackHistory.length > 0 
        ? new Date(task.feedbackHistory[task.feedbackHistory.length - 1].timestamp).toLocaleDateString('ar-SA')
        : '',
      'الفيدباك القديم': task.oldFeedback ? `${task.oldFeedback.status}: ${task.oldFeedback.note}` : '',
      'آخر ملاحظة': task.feedbackHistory && task.feedbackHistory.length > 0 
        ? `${task.feedbackHistory[task.feedbackHistory.length - 1].status}: ${task.feedbackHistory[task.feedbackHistory.length - 1].note}`
        : ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'المهام');
    
    XLSX.writeFile(workbook, `المهام_${new Date().toLocaleDateString('ar-SA')}.xlsx`);
    toast({ title: "تم التصدير!", description: "تم تصدير بيانات المهام إلى Excel بنجاح." });
  };

  // الحصول على أولوية المهمة
  const getTaskPriority = (task) => {
    const oldStatus = task.oldFeedback?.status?.toLowerCase() || '';
    if (oldStatus.includes('no answer')) return { level: 1, label: 'عاجل', color: 'red' };
    if (oldStatus.includes('reschedule')) return { level: 2, label: 'متوسط', color: 'yellow' };
    if (oldStatus.includes('fat issue')) return { level: 3, label: 'منخفض', color: 'blue' };
    return { level: 4, label: 'عادي', color: 'gray' };
  };

  // الحصول على أيقونة الحالة
  const getStatusIcon = (status) => {
    switch (status) {
      case 'New': return <XCircle className="w-4 h-4 text-blue-400" />;
      case 'In Progress': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'Done': return <CheckCircle className="w-4 h-4 text-green-400" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  // فحص ما إذا كان النص إحداثيات
  const isCoordinates = (location) => location && /^\d{1,2}\.\d+,\s*\d{1,2}\.\d+$/.test(location);

  const technicians = users.filter(u => u.role === 'technician');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* العنوان والإحصائيات */}
      <Card className="glass-effect border-cyan-500/20 enhanced-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-3xl gradient-text font-bold">
            <ClipboardList className="w-8 h-8" />
            عرض المهام المتطور
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* إحصائيات سريعة */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
            <div className="text-center p-3 bg-slate-800/50 rounded-lg border border-slate-600">
              <div className="text-2xl font-bold text-cyan-400">{taskStats.total}</div>
              <div className="text-xs text-gray-400">إجمالي المهام</div>
            </div>
            <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
              <div className="text-2xl font-bold text-blue-400">{taskStats.new}</div>
              <div className="text-xs text-gray-400">جديدة</div>
            </div>
            <div className="text-center p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
              <div className="text-2xl font-bold text-yellow-400">{taskStats.inProgress}</div>
              <div className="text-xs text-gray-400">قيد التنفيذ</div>
            </div>
            <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/30">
              <div className="text-2xl font-bold text-green-400">{taskStats.done}</div>
              <div className="text-xs text-gray-400">منجزة</div>
            </div>
            <div className="text-center p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
              <div className="text-2xl font-bold text-purple-400">{taskStats.withDash}</div>
              <div className="text-xs text-gray-400">بداش</div>
            </div>
            <div className="text-center p-3 bg-red-500/10 rounded-lg border border-red-500/30">
              <div className="text-2xl font-bold text-red-400">{taskStats.urgent}</div>
              <div className="text-xs text-gray-400">عاجلة</div>
            </div>
            <div className="text-center p-3 bg-orange-500/10 rounded-lg border border-orange-500/30">
              <div className="text-2xl font-bold text-orange-400">{taskStats.reschedule}</div>
              <div className="text-xs text-gray-400">إعادة جدولة</div>
            </div>
          </div>

          {/* أدوات الفلترة والبحث */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="البحث في المهام..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="glass-effect pr-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="glass-effect">
                <SelectValue placeholder="فلترة حسب الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="New">جديدة</SelectItem>
                <SelectItem value="In Progress">قيد التنفيذ</SelectItem>
                <SelectItem value="Done">منجزة</SelectItem>
                <SelectItem value="Cancelled">ملغية</SelectItem>
                <SelectItem value="Reschedule">إعادة جدولة</SelectItem>
                <SelectItem value="No Answer">عدم رد</SelectItem>
              </SelectContent>
            </Select>

            <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
              <SelectTrigger className="glass-effect">
                <SelectValue placeholder="فلترة حسب المُعيّن" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المستخدمين</SelectItem>
                <SelectItem value="">غير مُعيّن</SelectItem>
                {technicians.map(tech => (
                  <SelectItem key={tech.username} value={tech.username}>{tech.username}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="glass-effect">
                <SelectValue placeholder="فلترة حسب الأولوية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأولويات</SelectItem>
                <SelectItem value="urgent">عاجل</SelectItem>
                <SelectItem value="medium">متوسط</SelectItem>
                <SelectItem value="low">منخفض</SelectItem>
                <SelectItem value="normal">عادي</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={exportToExcel} className="bg-gradient-to-r from-green-500 to-emerald-500">
              <Download className="ml-2 h-4 w-4" />
              تصدير Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* جدول المهام */}
      <Card className="glass-effect border-slate-600 enhanced-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-800 to-slate-700 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-right text-sm font-bold text-cyan-300 border-r border-slate-600">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4" />
                      رقم التذكرة
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-cyan-300 border-r border-slate-600">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      الاسم
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-cyan-300 border-r border-slate-600">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      الهاتف
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-cyan-300 border-r border-slate-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      المنطقة/الموقع
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-bold text-cyan-300 border-r border-slate-600">
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      الحالة
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-bold text-cyan-300 border-r border-slate-600">
                    <div className="flex items-center justify-center gap-2">
                      <User className="w-4 h-4" />
                      المُعيّن إليه
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-bold text-cyan-300 border-r border-slate-600">
                    <div className="flex items-center justify-center gap-2">
                      <Router className="w-4 h-4" />
                      الداش
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-bold text-cyan-300 border-r border-slate-600">
                    <div className="flex items-center justify-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      الأولوية
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-cyan-300">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      آخر ملاحظة
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredTasks.map((task, index) => {
                  const priority = getTaskPriority(task);
                  const latestFeedback = task.feedbackHistory && task.feedbackHistory.length > 0 
                    ? task.feedbackHistory[task.feedbackHistory.length - 1] 
                    : null;

                  return (
                    <tr key={`${task.ticketId}-${index}`} className="hover:bg-slate-800/40 transition-all duration-200">
                      <td className="px-4 py-3 text-sm font-mono text-gray-200 border-r border-slate-700">
                        {task.ticketId}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-200 font-medium border-r border-slate-700">
                        {task.name || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-200 border-r border-slate-700">
                        {task.phone || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-200 border-r border-slate-700">
                        <div className="space-y-1">
                          {task.zone && (
                            <div className="text-blue-300 font-medium">{task.zone}</div>
                          )}
                          {task.location && (
                            <div className="text-xs text-gray-400">
                              {isCoordinates(task.location) ? (
                                <a 
                                  href={`https://www.google.com/maps?q=${task.location}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1"
                                >
                                  <MapPin className="w-3 h-3" />
                                  إحداثيات
                                </a>
                              ) : task.location}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center border-r border-slate-700">
                        <div className="flex items-center justify-center gap-2">
                          {getStatusIcon(task.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            task.status === 'Done' ? 'bg-green-500/20 text-green-300' :
                            task.status === 'In Progress' ? 'bg-yellow-500/20 text-yellow-300' :
                            task.status === 'New' ? 'bg-blue-500/20 text-blue-300' :
                            'bg-gray-500/20 text-gray-300'
                          }`}>
                            {task.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-sm border-r border-slate-700">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          task.assignedTo 
                            ? 'bg-green-500/20 text-green-300' 
                            : 'bg-red-500/20 text-red-300'
                        }`}>
                          {task.assignedTo || 'غير مُعيّن'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-sm border-r border-slate-700">
                        {task.dash ? (
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded font-mono text-xs">
                            {task.dash}
                          </span>
                        ) : (
                          <span className="text-gray-500 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center border-r border-slate-700">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${priority.color}-500/20 text-${priority.color}-300`}>
                          {priority.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-200">
                        {latestFeedback ? (
                          <div className="space-y-1">
                            <div className="font-medium text-xs text-green-300">
                              {latestFeedback.status}
                            </div>
                            <div className="text-xs text-gray-400 truncate max-w-xs">
                              {latestFeedback.note}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(latestFeedback.timestamp).toLocaleDateString('ar-SA')}
                            </div>
                          </div>
                        ) : task.oldFeedback ? (
                          <div className="space-y-1">
                            <div className="font-medium text-xs text-yellow-300">
                              {task.oldFeedback.status}
                            </div>
                            <div className="text-xs text-gray-400 truncate max-w-xs">
                              {task.oldFeedback.note}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-xs">لا توجد ملاحظات</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredTasks.length === 0 && (
            <div className="text-center py-12">
              <ClipboardList className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-400 mb-2">لا توجد مهام</h3>
              <p className="text-gray-500">
                لم يتم العثور على أي مهام تطابق معايير البحث المحددة.
              </p>
            </div>
          )}

          {filteredTasks.length > 0 && (
            <div className="p-4 text-center text-sm text-gray-400 border-t border-slate-700">
              عرض {filteredTasks.length} من أصل {tasks.length} مهمة
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TasksOnlyView;