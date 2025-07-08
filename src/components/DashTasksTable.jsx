import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Download, Database, MapPin, Phone, User, Hash } from 'lucide-react';
import ExcelLikeFilter from '@/components/ExcelLikeFilter';
import * as XLSX from 'xlsx';

const DashTasksTable = ({ tasks }) => {
  const { toast } = useToast();
  const [filteredData, setFilteredData] = React.useState([]);

  // فلترة المهام التي تحتوي على داش
  const dashTasks = useMemo(() => {
    return tasks.filter(task => task.hasDash && task.dash).map(task => ({
      name: task.name || '-',
      phone: task.phone || '-',
      username: task.assignedTo || 'غير مُعيّن',
      zone: task.zone || '-',
      dash: task.dash || '-',
      ticketId: task.ticketId,
      status: task.status,
      location: task.location || '-'
    }));
  }, [tasks]);

  const exportToExcel = () => {
    const dataToExport = filteredData.length > 0 ? filteredData : dashTasks;
    const excelData = dataToExport.map(task => ({
      'الاسم': task.name,
      'رقم الهاتف': task.phone,
      'اسم المستخدم': task.username,
      'رقم الزون': task.zone,
      'رقم الداش': task.dash,
      'رقم التذكرة': task.ticketId,
      'الحالة': task.status,
      'الموقع': task.location
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'مهام الداش');
    
    XLSX.writeFile(workbook, `مهام_الداش_${new Date().toLocaleDateString('ar-SA')}.xlsx`);
    toast({ title: "تم التصدير!", description: "تم تصدير بيانات مهام الداش إلى Excel بنجاح." });
  };

  const tableColumns = [
    { key: 'name', title: 'الاسم' },
    { key: 'phone', title: 'رقم الهاتف' },
    { key: 'username', title: 'اسم المستخدم' },
    { key: 'zone', title: 'رقم الزون' },
    { key: 'dash', title: 'رقم الداش' },
    { key: 'ticketId', title: 'رقم التذكرة' },
    { key: 'status', title: 'الحالة' },
    { key: 'location', title: 'الموقع' }
  ];

  const isCoordinates = (location) => location && /^\d{1,2}\.\d+,\s*\d{1,2}\.\d+$/.test(location);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Card className="glass-effect border-cyan-500/20 enhanced-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-2xl gradient-text font-bold">
            <Database className="w-8 h-8" />
            جدول مهام الداش المتخصص
          </CardTitle>
          <Button onClick={exportToExcel} className="bg-gradient-to-r from-green-500 to-emerald-500">
            <Download className="ml-2 h-4 w-4" />
            تصدير Excel
          </Button>
        </CardHeader>
        <CardContent>
          {dashTasks.length > 0 ? (
            <>
              <div className="mb-6">
                <ExcelLikeFilter
                  data={dashTasks}
                  onFilterChange={setFilteredData}
                  columns={tableColumns}
                />
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-700 enhanced-card">
                <table className="min-w-full divide-y divide-slate-700">
                  <thead className="bg-gradient-to-r from-slate-800 to-slate-700 sticky top-0">
                    <tr>
                      {tableColumns.map(column => (
                        <th key={column.key} scope="col" className="px-4 py-4 text-right text-sm font-bold text-cyan-300 uppercase tracking-wider border-r border-slate-600 last:border-r-0">
                          <div className="flex items-center gap-2">
                            {column.key === 'name' && <User className="w-4 h-4" />}
                            {column.key === 'phone' && <Phone className="w-4 h-4" />}
                            {column.key === 'username' && <User className="w-4 h-4" />}
                            {column.key === 'zone' && <Hash className="w-4 h-4" />}
                            {column.key === 'dash' && <Database className="w-4 h-4" />}
                            {column.key === 'location' && <MapPin className="w-4 h-4" />}
                            {column.title}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-900/50">
                    {(filteredData.length > 0 ? filteredData : dashTasks).map((task, index) => (
                      <tr key={`${task.ticketId}-${index}`} className="hover:bg-slate-800/40 transition-all duration-200">
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-200 font-medium border-r border-slate-700">
                          {task.name}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-200 font-mono border-r border-slate-700">
                          {task.phone}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-200 border-r border-slate-700">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            task.username === 'غير مُعيّن' 
                              ? 'bg-red-500/20 text-red-300' 
                              : 'bg-green-500/20 text-green-300'
                          }`}>
                            {task.username}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-200 font-mono border-r border-slate-700">
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded font-bold">
                            {task.zone}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-200 font-mono border-r border-slate-700">
                          <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded font-bold">
                            {task.dash}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-200 font-mono border-r border-slate-700">
                          {task.ticketId}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm border-r border-slate-700">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            task.status === 'Done' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                            task.status === 'In Progress' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                            task.status === 'New' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                            'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                          }`}>
                            {task.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-200">
                          {isCoordinates(task.location) ? (
                            <a href={`https://www.google.com/maps?q=${task.location}`} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 transition-colors">
                              <MapPin className="w-4 h-4" />
                              إحداثيات
                            </a>
                          ) : (task.location)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 text-center text-sm text-gray-400">
                عرض {(filteredData.length > 0 ? filteredData : dashTasks).length} من أصل {dashTasks.length} مهمة تحتوي على داش
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <Database className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-400 mb-2">لا توجد مهام تحتوي على داش</h3>
              <p className="text-gray-500">
                لم يتم العثور على أي مهام تحتوي على معرف داش. تأكد من ربط المناطق بالداش في إعدادات المناطق.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DashTasksTable;