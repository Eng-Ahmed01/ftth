import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { FileText, Search, Edit, Trash2, Plus, Save, X } from 'lucide-react';
import ReportForm from '@/components/ReportForm';
import EditReportDialog from '@/components/EditReportDialog';

const TechnicianReportsView = ({ user, reports, onUpdateReports }) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingReport, setEditingReport] = useState(null);

  // فلترة التقارير الخاصة بالمستخدم
  const userReports = useMemo(() => {
    return reports
      .filter(report => report.submittedBy === user.username)
      .filter(report => {
        if (!searchTerm) return true;
        return (
          report.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.phone?.includes(searchTerm) ||
          report.zone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.subscriptionType?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      })
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [reports, user.username, searchTerm]);

  const handleSaveReport = (reportData) => {
    const newReport = { 
      ...reportData, 
      id: Date.now(), 
      submittedBy: user.username, 
      timestamp: new Date().toISOString() 
    };
    
    const updatedReports = [...reports, newReport];
    onUpdateReports(updatedReports);
    
    toast({
      title: "تم الحفظ!",
      description: "تم إنشاء التقرير بنجاح."
    });
    
    setShowCreateForm(false);
    return newReport;
  };

  const handleEditReport = (reportData) => {
    const updatedReports = reports.map(report => 
      report.id === editingReport.id 
        ? { ...report, ...reportData, updatedAt: new Date().toISOString() }
        : report
    );
    
    onUpdateReports(updatedReports);
    
    toast({
      title: "تم التحديث!",
      description: "تم تحديث التقرير بنجاح."
    });
    
    setEditingReport(null);
  };

  const handleDeleteReport = (reportId) => {
    const updatedReports = reports.filter(report => report.id !== reportId);
    onUpdateReports(updatedReports);
    
    toast({
      title: "تم الحذف!",
      description: "تم حذف التقرير بنجاح."
    });
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

  if (showCreateForm) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold gradient-text">إنشاء تقرير جديد</h2>
          <Button 
            onClick={() => setShowCreateForm(false)}
            variant="outline"
            className="glass-effect"
          >
            <X className="ml-2 h-4 w-4" />
            إلغاء
          </Button>
        </div>
        <ReportForm 
          onSaveReport={handleSaveReport} 
          zoneData={JSON.parse(localStorage.getItem('zoneData')) || []}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* رأس الصفحة */}
      <Card className="glass-effect border-blue-500/20 enhanced-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl gradient-text font-bold">
            <FileText className="w-8 h-8" />
            تقاريري ({userReports.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="البحث في التقارير..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="glass-effect pr-10"
              />
            </div>
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-blue-500 to-cyan-500"
            >
              <Plus className="ml-2 h-4 w-4" />
              إنشاء تقرير جديد
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* قائمة التقارير */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatePresence>
          {userReports.map(report => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="glass-effect border-green-500/20 enhanced-card h-full">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-green-300">{report.name || 'تقرير بدون اسم'}</span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingReport(report)}
                        className="text-yellow-400 hover:text-yellow-300"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteReport(report.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-400">الهاتف:</span>
                      <p className="text-white font-mono">{report.phone || '-'}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">المنطقة:</span>
                      <p className="text-white">{report.zone || '-'}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">نوع الاشتراك:</span>
                      <p className="text-white">{report.subscriptionType || '-'}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">إجمالي الكيبل:</span>
                      <p className="text-white">{report.totalCableMeters || 0} متر</p>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-slate-600">
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>تم الإنشاء: {formatDate(report.timestamp)}</span>
                      {report.updatedAt && (
                        <span>آخر تحديث: {formatDate(report.updatedAt)}</span>
                      )}
                    </div>
                  </div>

                  {report.userId && (
                    <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded">
                      <span className="text-xs text-gray-400">اسم المستخدم:</span>
                      <p className="text-blue-300 font-mono">{report.userId}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {userReports.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-400 mb-2">لا توجد تقارير</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'لم يتم العثور على تقارير تطابق البحث.' : 'لم تقم بإنشاء أي تقارير بعد.'}
          </p>
          {!searchTerm && (
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-blue-500 to-cyan-500"
            >
              <Plus className="ml-2 h-4 w-4" />
              إنشاء أول تقرير
            </Button>
          )}
        </div>
      )}

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

export default TechnicianReportsView;