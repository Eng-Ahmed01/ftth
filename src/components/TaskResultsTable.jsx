import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Edit, MapPin, Download, Sparkles } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import UpdateTaskDialog from '@/components/UpdateTaskDialog';
import ExcelLikeFilter from '@/components/ExcelLikeFilter';
import * as XLSX from 'xlsx';

const TaskResultsTable = ({ tasks, onUpdateTasks, user, filters }) => {
    const { toast } = useToast();
    const [editingTask, setEditingTask] = useState(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [filteredData, setFilteredData] = useState([]);
    const [useAdvancedFilter, setUseAdvancedFilter] = useState(false);

    const basicFilteredTasks = useMemo(() => {
        return tasks.filter(task => {
            const matchesSearch = !filters.search || 
                task.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
                task.ticketId?.toLowerCase().includes(filters.search.toLowerCase()) ||
                task.phone?.toLowerCase().includes(filters.search.toLowerCase()) ||
                task.zone?.toLowerCase().includes(filters.search.toLowerCase());
            
            const matchesStatus = !filters.status || filters.status === 'all' || task.status === filters.status;
            const matchesAssignee = !filters.assignee || filters.assignee === 'all' || task.assignedTo === filters.assignee;
            
            return matchesSearch && matchesStatus && matchesAssignee;
        });
    }, [tasks, filters]);

    const displayTasks = useAdvancedFilter ? filteredData : basicFilteredTasks;

    const handleEditClick = (task) => {
        setEditingTask(task);
        setIsEditDialogOpen(true);
    };

    const handleUpdateTask = (feedbackData) => {
        const updatedTasks = tasks.map(t => {
            if (t.ticketId === editingTask.ticketId) {
                const newHistoryEntry = { ...feedbackData, timestamp: new Date().toISOString(), updatedBy: user.username };
                const newHistory = t.feedbackHistory ? [...t.feedbackHistory, newHistoryEntry] : [newHistoryEntry];
                return { ...t, status: feedbackData.status, feedbackHistory: newHistory, rescheduleDate: feedbackData.rescheduleDate || t.rescheduleDate };
            }
            return t;
        });
        onUpdateTasks(updatedTasks);
        setIsEditDialogOpen(false);
        setEditingTask(null);
    };

    const exportToExcel = () => {
        const excelData = displayTasks.map(task => {
            const latestFeedback = task.feedbackHistory && task.feedbackHistory.length > 0 
                ? task.feedbackHistory[task.feedbackHistory.length - 1] 
                : null;
            
            return {
                'Ticket ID': task.ticketId,
                'Zone': task.zone || '',
                'Name': task.name || '',
                'Phone': task.phone || '',
                'Location': task.location || '',
                'Status': task.status,
                'Reschedule To': task.rescheduleToDate || '',
                'Feedback': latestFeedback?.note || task.oldFeedback?.note || '',
                'المُنفذ': task.assignedTo || '',
                'تاريخ التحديث': latestFeedback ? new Date(latestFeedback.timestamp).toLocaleString('ar-SA') : ''
            };
        });

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'المهام');
        
        XLSX.writeFile(workbook, `المهام_${new Date().toLocaleDateString('ar-SA')}.xlsx`);
        toast({ title: "تم التصدير!", description: "تم تصدير بيانات المهام إلى Excel بنجاح." });
    };
    
    const isCoordinates = (location) => location && /^\d{1,2}\.\d+,\s*\d{1,2}\.\d+$/.test(location);

    const tableColumns = [
        { key: 'edit', title: 'تعديل' },
        { key: 'feedback', title: 'ملاحظات' },
        { key: 'rescheduleDate', title: 'تأجيل إلى' },
        { key: 'assignedTo', title: 'مُنفذ المهمة' },
        { key: 'updateDate', title: 'تاريخ التحديث' },
        { key: 'status', title: 'الحالة' },
        { key: 'location', title: 'الموقع' },
        { key: 'phone', title: 'الهاتف' },
        { key: 'name', title: 'الاسم' },
        { key: 'zone', title: 'الزون' },
        { key: 'ticketId', title: 'رقم التذكرة' }
    ];

    // تحويل المهام إلى تنسيق مناسب للفلترة المتقدمة
    const tasksForAdvancedFilter = useMemo(() => {
        return tasks.map(task => {
            const latestFeedback = task.feedbackHistory && task.feedbackHistory.length > 0 
                ? task.feedbackHistory[task.feedbackHistory.length - 1] 
                : null;
            
            return {
                ...task,
                edit: 'تعديل',
                feedback: latestFeedback?.note || task.oldFeedback?.note || '',
                rescheduleDate: task.rescheduleDate ? new Date(task.rescheduleDate).toLocaleDateString('ar-SA') : (task.rescheduleToDate || ''),
                updateDate: latestFeedback ? new Date(latestFeedback.timestamp).toLocaleString('ar-SA') : ''
            };
        });
    }, [tasks]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold gradient-text">جدول المهام المتطور ({displayTasks.length})</h3>
                <div className="flex items-center gap-3">
                    <Button
                        variant={useAdvancedFilter ? "outline" : "default"}
                        size="sm"
                        onClick={() => setUseAdvancedFilter(false)}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    >
                        فلترة بسيطة
                    </Button>
                    <Button
                        variant={useAdvancedFilter ? "default" : "outline"}
                        size="sm"
                        onClick={() => setUseAdvancedFilter(true)}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                        <Sparkles className="w-4 h-4 ml-1" />
                        فلترة Excel احترافية
                    </Button>
                    <Button onClick={exportToExcel} className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
                        <Download className="ml-2 h-4 w-4" />
                        تصدير Excel
                    </Button>
                </div>
            </div>

            {/* الفلترة المتقدمة */}
            {useAdvancedFilter && (
                <ExcelLikeFilter
                    data={tasksForAdvancedFilter}
                    onFilterChange={setFilteredData}
                    columns={tableColumns}
                />
            )}
            
            <div className="overflow-x-auto rounded-lg border border-slate-700 enhanced-card">
                <div className="min-w-full inline-block align-middle">
                    <div className="overflow-hidden">
                        <table className="min-w-full divide-y divide-slate-700">
                            <thead className="bg-gradient-to-r from-slate-800 to-slate-700 sticky top-0">
                                <tr>
                                    {tableColumns.map(column => (
                                        <th key={column.key} scope="col" className="px-4 py-4 text-right text-sm font-bold text-sky-300 uppercase tracking-wider border-r border-slate-600 last:border-r-0">
                                            {column.title}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800 bg-slate-900/50">
                                {displayTasks.slice().reverse().map((task, index) => {
                                    const latestFeedback = task.feedbackHistory && task.feedbackHistory.length > 0 ? task.feedbackHistory[task.feedbackHistory.length - 1] : null;
                                    return (
                                        <tr key={task.ticketId} className="hover:bg-slate-800/40 transition-all duration-200">
                                            <td className="px-4 py-4 whitespace-nowrap text-sm border-r border-slate-700">
                                                <Button variant="ghost" size="icon" onClick={() => handleEditClick(task)} className="hover:bg-yellow-500/20 transition-colors">
                                                    <Edit className="h-4 w-4 text-yellow-400" />
                                                </Button>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-200 max-w-xs truncate border-r border-slate-700" title={latestFeedback?.note || task.oldFeedback?.note}>
                                                {latestFeedback?.note || task.oldFeedback?.note || '-'}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-200 border-r border-slate-700">
                                                {task.rescheduleDate ? new Date(task.rescheduleDate).toLocaleDateString('ar-SA') : (task.rescheduleToDate || '-')}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-200 font-medium border-r border-slate-700">{task.assignedTo || '-'}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-200 border-r border-slate-700">
                                                {latestFeedback ? new Date(latestFeedback.timestamp).toLocaleString('ar-SA') : '-'}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm border-r border-slate-700">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 status-badge ${
                                                    task.status === 'Done' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                                                    task.status === 'In Progress' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                                                    task.status === 'New' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                                                    'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                                                }`}>
                                                    {task.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-200 border-r border-slate-700">
                                                {isCoordinates(task.location) ? (
                                                    <a href={`https://www.google.com/maps?q=${task.location}`} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 transition-colors">
                                                        <MapPin className="w-4 h-4" />
                                                        إحداثيات
                                                    </a>
                                                ) : (task.location || '-')}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-200 font-mono border-r border-slate-700">{task.phone || '-'}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-200 border-r border-slate-700">{task.name || '-'}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-200 font-mono border-r border-slate-700">{task.zone || '-'}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-200 font-mono font-bold">{task.ticketId}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {editingTask && <UpdateTaskDialog isOpen={isEditDialogOpen} setIsOpen={setIsEditDialogOpen} task={editingTask} onUpdate={handleUpdateTask} initialFeedback={editingTask.feedbackHistory && editingTask.feedbackHistory.length > 0 ? editingTask.feedbackHistory[editingTask.feedbackHistory.length - 1] : null} />}
        </div>
    );
};

export default TaskResultsTable;