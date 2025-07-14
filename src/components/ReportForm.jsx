import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText, Save, Copy } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { UserIdSection, BasicInfoSection, CableSection, MaterialsSection, DeviceSection } from '@/components/forms/ReportFormSections';
import { useReportFormLogic } from '@/components/forms/ReportFormLogic';

const ReportForm = ({ onSaveReport, zoneData }) => {
  const { toast } = useToast();
  const { offers, cableTypes, getLocation, calculateTotalCable, generateReportText, handleSubscriptionChange } = useReportFormLogic();
  
  const [formData, setFormData] = useState({
    name: '', phone: '', userId: '', userPassword: '', ssid: '',
    coordinates: '', subscriptionType: '', subscriptionCost: '',
    installationFee: 'مجانا', 
    cable80: '', cable100: '', cable150: '', cable200: '',
    sHook: '', steelBag: '', plasticBag: '', externalPlug: '', internalPlug: '',
    tape: '', buckles: '', deviceType: '', zone: ''
  });
  const [userIdParts, setUserIdParts] = useState({ zone: '', f: '', p: '' });
  const [reportPreview, setReportPreview] = useState('');

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
    toast({
      title: "تم الحفظ بنجاح!",
      description: "التقرير جاهز للنسخ في الأسفل.",
    });
  };

  const handleCopy = () => {
    if (reportPreview) {
      navigator.clipboard.writeText(reportPreview);
      toast({ title: "تم النسخ!", description: "تم نسخ التقرير إلى الحافظة." });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <form onSubmit={handleSubmit}>
        <Card className="w-full max-w-4xl mx-auto glass-effect border-sky-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl gradient-text font-bold">
              <FileText className="w-8 h-8" />
              إدخال تقرير متطور
            </CardTitle>
            <CardDescription className="text-gray-300">
              يرجى ملء جميع الحقول المطلوبة أدناه مع نظام الكيبل المتطور.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
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

            <div className="pt-4">
              <Button type="submit" className="w-full bg-gradient-to-r from-sky-500 to-indigo-500 pulse-glow">
                <Save className="ml-2 h-4 w-4" />
                حفظ وإنشاء معاينة
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {reportPreview && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="w-full max-w-4xl mx-auto glass-effect border-green-500/20 mt-8">
            <CardHeader className="flex-row justify-between items-center">
              <CardTitle className="flex items-center gap-3 text-2xl text-green-300 font-bold">
                معاينة التقرير المتطور
              </CardTitle>
              <Button onClick={handleCopy} variant="secondary">
                <Copy className="ml-2 h-4 w-4" />
                نسخ إلى الحافظة
              </Button>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-left bg-slate-900/50 p-4 rounded-md font-mono text-sm leading-relaxed" style={{ direction: 'ltr' }}>
                {reportPreview}
              </pre>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ReportForm;