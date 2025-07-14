import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Download, Search, Filter, X, MapPin, Zap, Edit, Trash2 } from 'lucide-react';
import SuperAdvancedTableFilter from '@/components/SuperAdvancedTableFilter';
import EditTaskDialog from '@/components/EditTaskDialog';
import EditReportDialog from '@/components/EditReportDialog';
import * as XLSX from 'xlsx';

const ReportsTable = ({ tasks, reports, onUpdateTasks, onUpdateReports, isAdmin }) => {
  const { toast } = useToast();
  const [filters, setFilters] = useState({ search: '', status: '', assignee: '' });
  const [filteredData, setFilteredData] = useState([]);
  const [useAdvancedFilter, setUseAdvancedFilter] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editingReport, setEditingReport] = useState(null);

  const combinedData = useMemo(() => {
    const data = [];
    
    // إضافة المهام
    tasks.forEach(task => {
      const latestFeedback = task.feedbackHistory && task.feedbackHistory.length > 0 
        ? task.feedbackHistory[task.feedbackHistory.length - 1] 
        : null;
      
      data.push({
        type: 'task',
        id: task.ticketId,
        updateToSheet: task.updateToSheet || '',
        created: task.created || '',
        ticketId: task.ticketId,
        zone: task.zone || '',
        name: task.name || '',
        phone: task.phone || '',
        location: task.location || '',
        status: task.status,
        inProgressTo: task.inProgressTo || '',
        rescheduleToDate: task.rescheduleToDate || '',
        feedback: latestFeedback?.note || task.oldFeedback?.note || '',
        ifDoneUser: latestFeedback?.details?.installedUsername || '',
        toTicket: task.toTicket || '',
        assignedTo: task.assignedTo || '',
        timestamp: latestFeedback?.timestamp || task.timestamp || '',
        originalData: task
      });
    });

    // إضافة التقارير
    reports.forEach(report => {
      data.push({
        type: 'report',
        id: report.id,
        updateToSheet: '',
        created: report.timestamp ? new Date(report.timestamp).toLocaleDateString('ar-SA') : '',
        ticketId: 'تقرير-' + report.id,
        zone: report.zone || '',
        name: report.name || '',
        phone: report.phone || '',
        location: report.coordinates || '',
        status: 'تقرير تنصيب',
        inProgressTo: '',
        rescheduleToDate: '',
        feedback: `نوع الاشتراك: ${report.subscriptionType || ''} - الجهاز: ${report.deviceType || ''}`,
        ifDoneUser: report.userId || '',
        toTicket: '',
        assignedTo: report.submittedBy || '',
        timestamp: report.timestamp || '',
        originalData: report
      });
    });

    return data.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
  }, [tasks, reports]);

  const basicFilteredData = useMemo(() => {
    return combinedData.filter(item => {
      const matchesSearch = !filters.search || 
        item.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.ticketId?.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.phone?.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.zone?.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesStatus = !filters.status || filters.status === 'all' || item.status === filters.status;
      const matchesAssignee = !filters.assignee || filters.assignee === 'all' || item.assignedTo === filters.assignee;
      
      return matchesSearch && matchesStatus && matchesAssignee;
    });
  }, [combinedData, filters]);

  const displayData = useAdvancedFilter ? filteredData : basicFilteredData;
  const uniqueStatuses = [...new Set(combinedData.map(item => item.status))].filter(Boolean);
  const uniqueAssignees = [...new Set(combinedData.map(item => item.assignedTo).filter(Boolean))];

  const clearFilters = () => {
    setFilters({ search: '', status: '', assignee: '' });
  };

  const exportToExcel = () => {
    const excelData = displayData.map(item => ({
      'Update To Sheet': item.updateToSheet,
      'Created': item.created,
      'Ticket ID': item.ticketId,
      'Zone': item.zone,
      'Name': item.name,
      'Phone': item.phone,
      'Location': item.location,
      'Status': item.status,
      'In Progress To': item.inProgressTo,
      'Reschedule To': item.rescheduleToDate,
      'Feedback': item.feedback,
      'IF Done / User': item.ifDoneUser,
      'TO Ticket': item.toTicket,
      'النوع': item.type === 'task' ? 'مهمة' : 'تقرير تنصيب',
      'المُنفذ': item.assignedTo
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'التقارير والمهام');
    
    XLSX.writeFile(workbook, `تقرير_شامل_${new Date().toLocaleDateString('ar-SA')}.xlsx`);
    toast({ title: "تم التصدير!", description: "تم تصدير التقرير الشامل إلى Excel بنجاح." });
  };

  const handleEditTask = (taskData) => {
    const updatedTasks = tasks.map(task => 
      task.ticketId === editingTask.ticketId 
        ? { ...task, ...taskData, updatedAt: new Date().toISOString() }
        : task
    );
    onUpdateTasks(updatedTasks);
    setEditingTask(null);
    toast({ title: "تم التحديث!", description: "تم تحديث المهمة بنجاح." });
  };

  const handleEditReport = (reportData) => {
    const updatedReports = reports.map(report => 
      report.id === editingReport.id 
        ? { ...report, ...reportData, updatedAt: new Date().toISOString() }
        : report
    );
    onUpdateReports(updatedReports);
    setEditingReport(null);
    toast({ title: "تم التحديث!", description: "تم تحديث التقرير بنجاح." });
  };

  const handleDeleteTask = (taskId) => {
    const updatedTasks = tasks.filter(task => task.ticketId !== taskId);
    onUpdateTasks(updatedTasks);
    toast({ title: "تم الحذف!", description: "تم حذف المهمة بنجاح." });
  };

  const handleDeleteReport = (reportId) => {
    const updatedReports = reports.filter(report => report.id !== reportId);
    onUpdateReports(updatedReports);
    toast({ title: "تم الحذف!", description: "تم حذف التقرير بنجاح." });
  };

  const isCoordinates = (location) => location && /^\d{1,2}\.\d+,\s*\d{1,2}\.\d+$/.test(location);

  const tableColumns = [
    { key: 'type', title: 'النوع' },
    { key: 'updateToSheet', title: 'Update To Sheet' },
    { key: 'created', title: 'Created' },
    { key: 'ticketId', title: 'Ticket ID' },
    { key: 'zone', title: 'Zone' },
    { key: 'name', title: 'Name' },
    { key: 'phone', title: 'Phone' },
    { key: 'location', title: 'Location' },
    { key: 'status', title: 'Status' },
    { key: 'inProgressTo', title: 'In Progress To' },
    { key: 'rescheduleToDate', title: 'Reschedule To' },
    { key: 'feedback', title: 'Feedback' },
    { key: 'ifDoneUser', title: 'IF Done / User' },
    { key: 'toTicket', title: 'TO Ticket' },
    { key: 'assignedTo', title: 'المُنفذ' },
    { key: 'actions', title: 'الإجراءات' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* تبديل نوع الفلترة */}
      <Card className="glass-effect border-purple-500/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="w-5 h-5" />
            نظام الفلترة المتطور
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant={useAdvancedFilter ? "outline" : "default"}
              size="sm"
              onClick={() => setUseAdvancedFilter(false)}
              className="bg-gradient-to-r from-blue-500 to-purple-500"
            >
              <Search className="w-4 h-4 ml-1" />
              فلترة بسيطة
            </Button>
            <Button
              variant={useAdvancedFilter ? "default" : "outline"}
              size="sm"
              onClick={() => setUseAdvancedFilter(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500"
            >
              <Zap className="w-4 h-4 ml-1" />
              فلترة فائقة التطور
            </Button>
            <Button onClick={exportToExcel} className="bg-gradient-to-r from-green-500 to-emerald-500">
              <Download className="ml-2 h-4 w-4" />
              تصدير Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!useAdvancedFilter ? (
            // الفلترة البسيطة
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="بحث عام..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="glass-effect pl-10"
                />
              </div>
              
              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger className="glass-effect">
                  <SelectValue placeholder="فلترة حسب الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  {uniqueStatuses.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={filters.assignee} onValueChange={(value) => setFilters({ ...filters, assignee: value })}>
                <SelectTrigger className="glass-effect">
                  <SelectValue placeholder="فلترة حسب المُنفذ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المُنفذين</SelectItem>
                  {uniqueAssignees.map(assignee => (
                    <SelectItem key={assignee} value={assignee}>{assignee}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button onClick={clearFilters} variant="outline" className="glass-effect">
                <X className="ml-2 h-4 w-4" />
                مسح الفلاتر
              </Button>
            </div>
          ) : (
            // الفلترة المتقدمة
            <SuperAdvancedTableFilter
              data={combinedData}
              onFilterChange={setFilteredData}
              columns={tableColumns}
            />
          )}
        </CardContent>
      </Card>

      {/* جدول البيانات */}
      <Card className="glass-effect border-sky-500/20">
        <CardHeader>
          <CardTitle className="text-2xl gradient-text font-bold">
            التقرير الشامل للمهام والتقارير ({displayData.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto table-container">
            <table className="w-full border border-slate-600 rounded-lg">
              <thead className="bg-slate-800/50 sticky top-0">
                <tr>
                  {tableColumns.map(column => (
                    <th key={column.key} className="border border-slate-600 px-3 py-2 text-right text-xs font-medium text-gray-300">
                      {column.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayData.map((item, index) => (
                  <tr key={`${item.type}-${item.id}-${index}`} className="hover:bg-slate-800/30 transition-colors">
                    <td className="border border-slate-600 px-3 py-2 text-xs">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.type === 'task' ? 'bg-blue-500/20 text-blue-300' : 'bg-green-500/20 text-green-300'
                      }`}>
                        {item.type === 'task' ? 'مهمة' : 'تقرير'}
                      </span>
                    </td>
                    <td className="border border-slate-600 px-3 py-2 text-xs text-gray-200">{item.updateToSheet || '-'}</td>
                    <td className="border border-slate-600 px-3 py-2 text-xs text-gray-200">{item.created || '-'}</td>
                    <td className="border border-slate-600 px-3 py-2 text-xs text-gray-200 font-mono">{item.ticketId}</td>
                    <td className="border border-slate-600 px-3 py-2 text-xs text-gray-200 font-mono">{item.zone || '-'}</td>
                    <td className="border border-slate-600 px-3 py-2 text-xs text-gray-200">{item.name || '-'}</td>
                    <td className="border border-slate-600 px-3 py-2 text-xs text-gray-200 font-mono">{item.phone || '-'}</td>
                    <td className="border border-slate-600 px-3 py-2 text-xs text-gray-200">
                      {isCoordinates(item.location) ? (
                        <a 
                          href={`https://www.google.com/maps?q=${item.location}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 transition-colors"
                        >
                          <MapPin className="w-3 h-3" />
                          إحداثيات
                        </a>
                      ) : (item.location || '-')}
                    </td>
                    <td className="border border-slate-600 px-3 py-2 text-xs">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        item.status === 'Done' ? 'bg-green-500/20 text-green-300' :
                        item.status === 'In Progress' ? 'bg-yellow-500/20 text-yellow-300' :
                        item.status === 'New' ? 'bg-blue-500/20 text-blue-300' :
                        'bg-gray-500/20 text-gray-300'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="border border-slate-600 px-3 py-2 text-xs text-gray-200">{item.inProgressTo || '-'}</td>
                    <td className="border border-slate-600 px-3 py-2 text-xs text-gray-200">{item.rescheduleToDate || '-'}</td>
                    <td className="border border-slate-600 px-3 py-2 text-xs text-gray-200 max-w-xs truncate" title={item.feedback}>{item.feedback || '-'}</td>
                    <td className="border border-slate-600 px-3 py-2 text-xs text-gray-200">{item.ifDoneUser || '-'}</td>
                    <td className="border border-slate-600 px-3 py-2 text-xs text-gray-200 font-mono">{item.toTicket || '-'}</td>
                    <td className="border border-slate-600 px-3 py-2 text-xs text-gray-200 font-medium">{item.assignedTo || '-'}</td>
                    <td className="border border-slate-600 px-3 py-2 text-xs">
                      {isAdmin && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              if (item.type === 'task') {
                                setEditingTask(item.originalData);
                              } else {
                                setEditingReport(item.originalData);
                              }
                            }}
                            className="text-yellow-400 hover:text-yellow-300 p-1 h-6 w-6"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              if (item.type === 'task') {
                                handleDeleteTask(item.originalData.ticketId);
                              } else {
                                handleDeleteReport(item.originalData.id);
                              }
                            }}
                            className="text-red-400 hover:text-red-300 p-1 h-6 w-6"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {displayData.length === 0 && (
                  <tr>
                    <td colSpan="16" className="border border-slate-600 px-3 py-8 text-center text-gray-400">
                      لا توجد بيانات متاحة
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* نوافذ التعديل */}
      {editingTask && (
        <EditTaskDialog
          isOpen={!!editingTask}
          setIsOpen={() => setEditingTask(null)}
          task={editingTask}
          onSave={handleEditTask}
        />
      )}

      {editingReport && (
        <EditReportDialog
          isOpen={!!editingReport}
          setIsOpen={() => setEditingReport(null)}
          report={editingReport}
          onSave={handleEditReport}
          zoneData={JSON.parse(localStorage.getItem('zoneData')) || []}
        />
      )}
    </motion.div>
  );
};

export default ReportsTable;