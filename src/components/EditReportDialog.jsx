import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Save, Edit } from 'lucide-react';
import { UserIdSection, BasicInfoSection, CableSection, MaterialsSection, DeviceSection } from '@/components/forms/ReportFormSections';
import { useReportFormLogic } from '@/components/forms/ReportFormLogic';

const EditReportDialog = ({ isOpen, setIsOpen, report, onSave, zoneData }) => {
  const { toast } = useToast();
  const { offers, cableTypes, getLocation, calculateTotalCable, handleSubscriptionChange } = useReportFormLogic();
  
  const [formData, setFormData] = useState({
    name: '', phone: '', userId: '', userPassword: '', ssid: '',
    coordinates: '', subscriptionType: '', subscriptionCost: '',
    installationFee: 'مجانا', 
    cable80: '', cable100: '', cable150: '', cable200: '',
    sHook: '', steelBag: '', plasticBag: '', externalPlug: '', internalPlug: '',
    tape: '', buckles: '', deviceType: '', zone: '', ticketId: ''
  });
  const [userIdParts, setUserIdParts] = useState({ zone: '', f: '', p: '' });

  useEffect(() => {
    if (report && isOpen) {
      setFormData({
        name: report.name || '',
        phone: report.phone || '',
        userId: report.userId || '',
        userPassword: report.userPassword || '',
        ssid: report.ssid || '',
        coordinates: report.coordinates || '',
        subscriptionType: report.subscriptionType || '',
        subscriptionCost: report.subscriptionCost || '',
        installationFee: report.installationFee || 'مجانا',
        cable80: report.cable80 || '',
        cable100: report.cable100 || '',
        cable150: report.cable150 || '',
        cable200: report.cable200 || '',
        sHook: report.sHook || '',
        steelBag: report.steelBag || '',
        plasticBag: report.plasticBag || '',
        externalPlug: report.externalPlug || '',
        internalPlug: report.internalPlug || '',
        tape: report.tape || '',
        buckles: report.buckles || '',
        deviceType: report.deviceType || '',
        zone: report.zone || '',
        ticketId: report.ticketId || ''
      });

      // استخراج أجزاء معرف المستخدم
      if (report.userId) {
        const userIdMatch = report.userId.match(/(?:.*-)?FNJ(\d+)(?:F(\d+))?(?:P(\d+))?/);
        if (userIdMatch) {
          setUserIdParts({
            zone: userIdMatch[1] || '',
            f: userIdMatch[2] || '',
            p: userIdMatch[3] || ''
          });
        }
      }
    }
  }, [report, isOpen]);

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
    
    onSave(reportDataWithTotal);
    toast({
      title: "تم التحديث!",
      description: "تم تحديث التقرير بنجاح."
    });
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto glass-effect border-yellow-500/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl gradient-text font-bold">
            <Edit className="w-8 h-8 text-yellow-400" />
            تعديل التقرير
          </DialogTitle>
        </DialogHeader>

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
            <Button type="submit" className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 pulse-glow">
              <Save className="ml-2 h-4 w-4" />
              حفظ التعديلات
            </Button>
            <Button type="button" variant="outline" onClick={handleClose} className="px-8">
              إلغاء
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditReportDialog;