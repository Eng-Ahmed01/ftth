import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle, Save, Copy, Upload } from 'lucide-react';
import { UserIdSection, BasicInfoSection, CableSection, MaterialsSection, DeviceSection } from '@/components/forms/ReportFormSections';
import { useReportFormLogic } from '@/components/forms/ReportFormLogic';

const AutoReportDialog = ({ isOpen, setIsOpen, task, onSaveReport, zoneData }) => {
  const { toast } = useToast();
  const { offers, cableTypes, getLocation, calculateTotalCable, generateReportText, handleSubscriptionChange } = useReportFormLogic();
  
  const [formData, setFormData] = useState({
    name: '', phone: '', userId: '', userPassword: '', ssid: '',
    coordinates: '', subscriptionType: '', subscriptionCost: '',
    installationFee: 'مجانا', 
    cable80: '', cable100: '', cable150: '', cable200: '',
    sHook: '', steelBag: '', plasticBag: '', externalPlug: '', internalPlug: '',
    tape: '', buckles: '', deviceType: '', zone: '', ticketId: ''
  });
  const [userIdParts, setUserIdParts] = useState({ zone: '', f: '', p: '' });
  const [reportPreview, setReportPreview] = useState('');
  const [isSubmittingToSheets, setIsSubmittingToSheets] = useState(false);

  useEffect(() => {
    if (task && isOpen) {
      setFormData(prev => ({
        ...prev,
        name: task.name || '',
        phone: task.phone || '',
        zone: task.zone || '',
        ticketId: task.ticketId || ''
      }));

      if (task.zone) {
        const zoneMatch = task.zone.match(/FNJ(\d+)/);
        if (zoneMatch) {
          setUserIdParts(prev => ({ ...prev, zone: zoneMatch[1] }));
        }
      }
    }
  }, [task, isOpen]);

  useEffect(() => {
    const { zone, f, p } = userIdParts;
    if (!zone) {
      setFormData(prev => ({ ...prev, userId: '', zone: '' }));
      return;
    }
    const formattedZone = `FNJ${String(zone).padStart(4, '0')}`;
    const zoneInfo = zoneData.find(z => z.Zone === formattedZone);
    const dashPrefix = zoneInfo && zoneInfo.Dash ? `${zoneInfo.Dash}-` : '';
    const formattedF = f ? `F${String(f).padStart(2, '0')}` : '';
    const formattedP = p ? `P${String(p).padStart(2, '0')}` : '';
    const finalUserId = `${dashPrefix}${formattedZone}${formattedF}${formattedP}`;
    setFormData(prev => ({ ...prev, userId: finalUserId, zone: formattedZone }));
  }, [userIdParts, zoneData]);

  const handleUserIdPartChange = (e) => {
    const { id, value } = e.target;
    setUserIdParts(prev => ({ ...prev, [id]: value }));
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const totalCable = calculateTotalCable(formData);
    const reportDataWithTotal = {
      ...formData,
      cable: totalCable,
      totalCableMeters: totalCable
    };
    
    const savedReport = onSaveReport(reportDataWithTotal);
    const reportText = generateReportText(savedReport, totalCable);
    setReportPreview(reportText);
    
    // إضافة التقرير إلى قائمة انتظار Google Sheets
    addToPendingGoogleSheets(savedReport);
    
    toast({
      title: "تم الحفظ بنجاح!",
      description: "التقرير جاهز للنسخ وتم إرساله للمراجعة.",
    });
  };

  const addToPendingGoogleSheets = (reportData) => {
    const pendingReports = JSON.parse(localStorage.getItem('pendingReports')) || [];
    const newPending = [...pendingReports, {
      ...reportData,
      id: Date.now(),
      status: 'pending',
      timestamp: new Date().toISOString()
    }];
    localStorage.setItem('pendingReports', JSON.stringify(newPending));
  };

  const handleCopy = () => {
    if (reportPreview) {
      navigator.clipboard.writeText(reportPreview);
      toast({ title: "تم النسخ!", description: "تم نسخ التقرير إلى الحافظة." });
    }
  };

  const handleSubmitToSheets = () => {
    setIsSubmittingToSheets(true);
    
    // محاكاة إرسال إلى Google Sheets
    setTimeout(() => {
      setIsSubmittingToSheets(false);
      toast({
        title: "تم الإرسال!",
        description: "تم إرسال التقرير إلى Google Sheets للمراجعة.",
      });
    }, 2000);
  };

  const handleClose = () => {
    setIsOpen(false);
    setFormData({
      name: '', phone: '', userId: '', userPassword: '', ssid: '',
      coordinates: '', subscriptionType: '', subscriptionCost: '',
      installationFee: 'مجانا', 
      cable80: '', cable100: '', cable150: '', cable200: '',
      sHook: '', steelBag: '', plasticBag: '', externalPlug: '', internalPlug: '',
      tape: '', buckles: '', deviceType: '', zone: '', ticketId: ''
    });
    setUserIdParts({ zone: '', f: '', p: '' });
    setReportPreview('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto glass-effect border-green-500/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl gradient-text font-bold">
            <CheckCircle className="w-8 h-8 text-green-400" />
            إنشاء تقرير التنصيب - مهمة منجزة
          </DialogTitle>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <UserIdSection 
              userIdParts={userIdParts}
              onUserIdPartChange={handleUserIdPartChange}
              finalUserId={formData.userId}
            />

            <BasicInfoSection 
              formData={formData}
              onChange={handleChange}
              onSubscriptionChange={(value) => handleSubscriptionChange(value, setFormData)}
              onGetLocation={() => getLocation(setFormData)}
              offers={offers}
            />

            <CableSection 
              formData={formData}
              onChange={handleChange}
              cableTypes={cableTypes}
              calculateTotalCable={() => calculateTotalCable(formData)}
            />

            <MaterialsSection 
              formData={formData}
              onChange={handleChange}
            />

            <DeviceSection 
              formData={formData}
              onChange={handleChange}
            />

            <div className="flex gap-3">
              <Button type="submit" className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 pulse-glow">
                <Save className="ml-2 h-4 w-4" />
                حفظ وإنشاء التقرير
              </Button>
              <Button type="button" variant="outline" onClick={handleClose} className="px-8">
                إلغاء
              </Button>
            </div>
          </form>

          {reportPreview && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-slate-800/50 rounded-lg border border-green-500/30"
            >
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-green-300">معاينة التقرير</h4>
                <div className="flex gap-2">
                  <Button onClick={handleCopy} variant="secondary">
                    <Copy className="ml-2 h-4 w-4" />
                    نسخ إلى الحافظة
                  </Button>
                  <Button 
                    onClick={handleSubmitToSheets}
                    disabled={isSubmittingToSheets}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500"
                  >
                    <Upload className="ml-2 h-4 w-4" />
                    {isSubmittingToSheets ? 'جاري الإرسال...' : 'إرسال للمراجعة'}
                  </Button>
                </div>
              </div>
              <pre className="whitespace-pre-wrap text-left bg-slate-900/50 p-4 rounded-md font-mono text-sm leading-relaxed" style={{ direction: 'ltr' }}>
                {reportPreview}
              </pre>
              
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-blue-300 text-sm">
                  💡 <strong>ملاحظة:</strong> تم إرسال هذا التقرير إلى قائمة انتظار Google Sheets. سيقوم المشرف بمراجعته وإرساله تلقائياً.
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default AutoReportDialog;