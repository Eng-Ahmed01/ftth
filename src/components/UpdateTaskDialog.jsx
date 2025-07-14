import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Save, Calendar, MessageSquare, CheckCircle } from 'lucide-react';
import AutoReportDialog from '@/components/AutoReportDialog';

const UpdateTaskDialog = ({ isOpen, setIsOpen, task, onUpdate, initialFeedback }) => {
  const { toast } = useToast();
  const [feedbackData, setFeedbackData] = useState({
    status: '',
    note: '',
    rescheduleDate: ''
  });
  const [showReportDialog, setShowReportDialog] = useState(false);

  const statusOptions = [
    'In Progress', 'Done', 'Cancelled', 'Reschedule', 'No Answer', 
    'Already In Service', 'Duplicate', 'Done By Contractor', 
    'Out of coverage', 'FAT Issue'
  ];

  useEffect(() => {
    if (initialFeedback) {
      setFeedbackData({
        status: initialFeedback.status || '',
        note: initialFeedback.note || '',
        rescheduleDate: initialFeedback.rescheduleDate || ''
      });
    } else {
      setFeedbackData({
        status: task?.status || '',
        note: '',
        rescheduleDate: ''
      });
    }
  }, [task, initialFeedback, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!feedbackData.status) {
      toast({ title: "خطأ", description: "يرجى اختيار حالة المهمة.", variant: "destructive" });
      return;
    }

    // إذا كانت الحالة "Done"، اعرض نافذة إنشاء التقرير
    if (feedbackData.status === 'Done') {
      onUpdate(feedbackData);
      setIsOpen(false);
      setShowReportDialog(true);
      return;
    }

    onUpdate(feedbackData);
    setIsOpen(false);
    toast({ title: "تم التحديث!", description: "تم تحديث حالة المهمة بنجاح." });
  };

  const handleReportSave = (reportData) => {
    toast({ 
      title: "تم إنجاز المهمة!", 
      description: "تم حفظ التقرير وإنجاز المهمة بنجاح." 
    });
    setShowReportDialog(false);
    return reportData;
  };

  const handleChange = (field, value) => {
    setFeedbackData(prev => ({ ...prev, [field]: value }));
  };

  const handleClose = () => {
    setIsOpen(false);
    setFeedbackData({
      status: '',
      note: '',
      rescheduleDate: ''
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl glass-effect border-yellow-500/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl gradient-text font-bold">
              <MessageSquare className="w-8 h-8" />
              تحديث حالة المهمة
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* معلومات المهمة */}
            <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-600">
              <h3 className="text-lg font-semibold text-sky-300 mb-3">معلومات المهمة</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">رقم التذكرة:</span>
                  <span className="text-white font-bold ml-2">{task?.ticketId}</span>
                </div>
                <div>
                  <span className="text-gray-400">الاسم:</span>
                  <span className="text-white ml-2">{task?.name || 'غير محدد'}</span>
                </div>
                <div>
                  <span className="text-gray-400">الهاتف:</span>
                  <span className="text-white ml-2">{task?.phone || 'غير محدد'}</span>
                </div>
                <div>
                  <span className="text-gray-400">المنطقة:</span>
                  <span className="text-white ml-2">{task?.zone || 'غير محدد'}</span>
                </div>
              </div>
            </div>

            {/* تحديث الحالة */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status" className="text-yellow-300 font-semibold">حالة المهمة *</Label>
                <Select value={feedbackData.status} onValueChange={(value) => handleChange('status', value)}>
                  <SelectTrigger className="glass-effect">
                    <SelectValue placeholder="اختر حالة المهمة..." />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(status => (
                      <SelectItem key={status} value={status}>
                        <div className="flex items-center gap-2">
                          {status === 'Done' && <CheckCircle className="w-4 h-4 text-green-400" />}
                          {status === 'Reschedule' && <Calendar className="w-4 h-4 text-yellow-400" />}
                          {status}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {feedbackData.status === 'Reschedule' && (
                <div className="space-y-2">
                  <Label htmlFor="rescheduleDate" className="text-yellow-300 font-semibold">تاريخ إعادة الجدولة</Label>
                  <Input
                    id="rescheduleDate"
                    type="date"
                    value={feedbackData.rescheduleDate}
                    onChange={(e) => handleChange('rescheduleDate', e.target.value)}
                    className="glass-effect"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="note" className="text-yellow-300 font-semibold">ملاحظات</Label>
                <Textarea
                  id="note"
                  value={feedbackData.note}
                  onChange={(e) => handleChange('note', e.target.value)}
                  placeholder="أدخل ملاحظاتك حول المهمة..."
                  className="glass-effect min-h-[100px]"
                />
              </div>
            </div>

            {/* تنبيه خاص للمهام المنجزة */}
            {feedbackData.status === 'Done' && (
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center gap-2 text-green-300 mb-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">مهمة منجزة</span>
                </div>
                <p className="text-sm text-gray-300">
                  سيتم فتح نافذة إنشاء التقرير تلقائياً بعد حفظ التحديث لتوثيق تفاصيل التنصيب.
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 pulse-glow">
                <Save className="ml-2 h-4 w-4" />
                {feedbackData.status === 'Done' ? 'إنجاز المهمة وإنشاء التقرير' : 'حفظ التحديث'}
              </Button>
              <Button type="button" variant="outline" onClick={handleClose} className="px-8">
                إلغاء
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* نافذة إنشاء التقرير التلقائية */}
      <AutoReportDialog
        isOpen={showReportDialog}
        setIsOpen={setShowReportDialog}
        task={task}
        onSaveReport={handleReportSave}
        zoneData={JSON.parse(localStorage.getItem('zoneData')) || []}
      />
    </>
  );
};

export default UpdateTaskDialog;