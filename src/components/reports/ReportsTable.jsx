import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Download, Filter, Edit, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import ReportsTableFilters from '@/components/reports/ReportsTableFilters';
import ReportsTableContent from '@/components/reports/ReportsTableContent';
import EditTaskDialog from '@/components/EditTaskDialog';
import EditReportDialog from '@/components/EditReportDialog';

const ReportsTable = ({ tasks, reports, onUpdateTasks, onUpdateReports, isAdmin }) => {
  const { toast } = useToast();
  const [filters, setFilters] = useState({ search: '', status: '', assignee: '' });
  const [editingTask, setEditingTask] = useState(null);
  const [editingReport, setEditingReport] = useState(null);

  const combinedData = useMemo(() => {
    const data = [];
    tasks.forEach(task => {
      const latestFeedback = task.feedbackHistory && task.feedbackHistory.length > 0 
        ? task.feedbackHistory[task.feedbackHistory.length - 1] 
        : null;
      data.push({
        type: 'task', id: task.ticketId, updateToSheet: task.updateToSheet || '',
        created: task.created || '', ticketId: task.ticketId, zone: task.zone || '',
        name: task.name || '', phone: task.phone || '', location: task.location || '',
        status: task.status, inProgressTo: task.inProgressTo || '',
        rescheduleToDate: task.rescheduleToDate || '', feedback: latestFeedback?.note || task.oldFeedback?.note || '',
        ifDoneUser: latestFeedback?.details?.installedUsername || '', toTicket: task.toTicket || '',
        assignedTo: task.assignedTo || '', timestamp: latestFeedback?.timestamp || task.timestamp || '',
        originalData: task
      });
    });
    reports.forEach(report => {
      data.push({
        type: 'report', id: report.id, updateToSheet: '',
        created: report.timestamp ? new Date(report.timestamp).toLocaleDateString('ar-SA') : '',
        ticketId: 'تقرير-' + report.id, zone: report.zone || '', name: report.name || '',
        phone: report.phone || '', location: report.coordinates || '', status: 'تقرير تنصيب',
        inProgressTo: '', rescheduleToDate: '',
        feedback: `نوع الاشتراك: ${report.subscriptionType || ''} - الجهاز: ${report.deviceType || ''}`,
        ifDoneUser: report.userId || '', toTicket: '', assignedTo: report.submittedBy || '',
        timestamp: report.timestamp || '', originalData: report
      });
    });
    return data.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
  }, [tasks, reports]);

  const displayData = useMemo(() => {
    return combinedData.filter(item => {
      const search = filters.search.toLowerCase();
      const matchesSearch = !search || 
        item.name?.toLowerCase().includes(search) ||
        item.ticketId?.toLowerCase().includes(search) ||
        item.phone?.toLowerCase().includes(search) ||
        item.zone?.toLowerCase().includes(search);
      const matchesStatus = !filters.status || filters.status === 'all' || item.status === filters.status;
      const matchesAssignee = !filters.assignee || filters.assignee === 'all' || item.assignedTo === filters.assignee;
      return matchesSearch && matchesStatus && matchesAssignee;
    });
  }, [combinedData, filters]);

  const exportToExcel = () => {
    const excelData = displayData.map(item => ({
      'Update To Sheet': item.updateToSheet, 'Created': item.created, 'Ticket ID': item.ticketId,
      'Zone': item.zone, 'Name': item.name, 'Phone': item.phone, 'Location': item.location,
      'Status': item.status, 'In Progress To': item.inProgressTo, 'Reschedule To': item.rescheduleToDate,
      'Feedback': item.feedback, 'IF Done / User': item.ifDoneUser, 'TO Ticket': item.toTicket,
      'النوع': item.type === 'task' ? 'مهمة' : 'تقرير تنصيب', 'المُنفذ': item.assignedTo
    }));
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'التقارير والمهام');
    XLSX.writeFile(workbook, `تقرير_شامل_${new Date().toLocaleDateString('ar-SA')}.xlsx`);
    toast({ title: "تم التصدير!", description: "تم تصدير التقرير الشامل إلى Excel بنجاح." });
  };

  const handleEdit = (item) => {
    if (item.type === 'task') setEditingTask(item.originalData);
    else setEditingReport(item.originalData);
  };
  
  const handleDelete = (item) => {
    if (item.type === 'task') {
      onUpdateTasks(tasks.filter(t => t.ticketId !== item.id));
      toast({ title: "تم الحذف!", description: "تم حذف المهمة بنجاح." });
    } else {
      onUpdateReports(reports.filter(r => r.id !== item.id));
      toast({ title: "تم الحذف!", description: "تم حذف التقرير بنجاح." });
    }
  };

  const handleUpdateTask = (taskData) => {
    onUpdateTasks(tasks.map(t => t.ticketId === editingTask.ticketId ? { ...t, ...taskData, updatedAt: new Date().toISOString() } : t));
    setEditingTask(null);
    toast({ title: "تم التحديث!", description: "تم تحديث المهمة بنجاح." });
  };

  const handleUpdateReport = (reportData) => {
    onUpdateReports(reports.map(r => r.id === editingReport.id ? { ...r, ...reportData, updatedAt: new Date().toISOString() } : r));
    setEditingReport(null);
    toast({ title: "تم التحديث!", description: "تم تحديث التقرير بنجاح." });
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Card className="glass-effect border-purple-500/20">
        <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="w-5 h-5" />
            نظام الفلترة المتطور
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button onClick={exportToExcel} className="bg-gradient-to-r from-green-500 to-emerald-500">
              <Download className="ml-2 h-4 w-4" />
              تصدير Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ReportsTableFilters 
            filters={filters} 
            setFilters={setFilters} 
            data={combinedData}
          />
        </CardContent>
      </Card>

      <Card className="glass-effect border-sky-500/20">
        <CardHeader>
          <CardTitle className="text-2xl gradient-text font-bold">
            التقرير الشامل للمهام والتقارير ({displayData.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ReportsTableContent 
            data={displayData}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isAdmin={isAdmin}
          />
        </CardContent>
      </Card>

      {editingTask && (
        <EditTaskDialog
          isOpen={!!editingTask}
          setIsOpen={() => setEditingTask(null)}
          task={editingTask}
          onSave={handleUpdateTask}
        />
      )}

      {editingReport && (
        <EditReportDialog
          isOpen={!!editingReport}
          setIsOpen={() => setEditingReport(null)}
          report={editingReport}
          onSave={handleUpdateReport}
          zoneData={JSON.parse(localStorage.getItem('zoneData')) || []}
        />
      )}
    </motion.div>
  );
};

export default ReportsTable;