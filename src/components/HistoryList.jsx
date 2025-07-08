import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Trash2, Search, Edit, FileText, Calendar, User, Phone, MapPin } from 'lucide-react';
import EditReportDialog from '@/components/EditReportDialog';

const HistoryList = ({ entries, onClearEntries, onUpdateReports, isAdmin }) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingReport, setEditingReport] = useState(null);

  const filteredEntries = entries.filter(entry => 
    !searchTerm || 
    entry.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.phone?.includes(searchTerm) ||
    entry.zone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.subscriptionType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClearAll = () => {
    onClearEntries();
    toast({ title: "تم المسح!", description: "تم مسح جميع التقارير." });
  };

  const handleEditReport = (reportData) => {
    const updatedReports = entries.map(report => 
      report.id === editingReport.id 
        ? { ...report, ...reportData, updatedAt: new Date().toISOString() }
        : report
    );
    onUpdateReports(updatedReports);
    setEditingReport(null);
    toast({ title: "تم التحديث!", description: "تم تحديث التقرير بنجاح." });
  };

  const handleDeleteReport = (reportId) => {
    const updatedReports = entries.filter(report => report.id !== reportId);
    onUpdateReports(updatedReports);
    toast({ title: "تم الحذف!", description: "تم حذف التقرير بنجاح." });
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Card className="glass-effect border-green-500/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-green-400" />
              <span className="text-green-300">سجل التقارير ({filteredEntries.length})</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="البحث في التقارير..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="glass-effect pr-10 w-64"
                />
              </div>
              {isAdmin && entries.length > 0 && (
                <Button onClick={handleClearAll} variant="destructive" size="sm">
                  <Trash2 className="ml-2 h-4 w-4" />
                  مسح الكل
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredEntries.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-400 mb-2">لا توجد تقارير</h3>
              <p className="text-gray-500">
                {searchTerm ? 'لم يتم العثور على تقارير تطابق البحث.' : 'لم يتم إنشاء أي تقارير بعد.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              <AnimatePresence>
                {filteredEntries.map((entry) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="glass-effect border-blue-500/20 enhanced-card h-full">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-between text-lg">
                          <span className="text-blue-300 truncate">{entry.name || 'تقرير بدون اسم'}</span>
                          {isAdmin && (
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingReport(entry)}
                                className="text-yellow-400 hover:text-yellow-300 p-1 h-7 w-7"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteReport(entry.id)}
                                className="text-red-400 hover:text-red-300 p-1 h-7 w-7"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm">
                        <div className="grid grid-cols-1 gap-2">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-300">{entry.phone || 'غير محدد'}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-300">{entry.zone || 'غير محدد'}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-300">{entry.submittedBy}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-300 text-xs">{formatDate(entry.timestamp)}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-600">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-gray-400">نوع الاشتراك:</span>
                              <p className="text-white font-medium">{entry.subscriptionType || '-'}</p>
                            </div>
                            <div>
                              <span className="text-gray-400">إجمالي الكيبل:</span>
                              <p className="text-white font-medium">{entry.totalCableMeters || 0} متر</p>
                            </div>
                          </div>
                        </div>

                        {entry.userId && (
                          <div className="p-2 bg-green-500/10 border border-green-500/30 rounded">
                            <span className="text-xs text-gray-400">اسم المستخدم:</span>
                            <p className="text-green-300 font-mono text-sm">{entry.userId}</p>
                          </div>
                        )}

                        {entry.updatedAt && (
                          <div className="text-xs text-yellow-400">
                            آخر تحديث: {formatDate(entry.updatedAt)}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {/* نافذة تعديل التقرير */}
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

export default HistoryList;