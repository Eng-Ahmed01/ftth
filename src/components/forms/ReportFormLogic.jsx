import { useToast } from '@/components/ui/use-toast';

export const useReportFormLogic = () => {
  const { toast } = useToast();

  const offers = [
    { name: '35 fiber', price: '35000' },
    { name: '50 fiber', price: '45000' },
    { name: '75 fiber', price: '65000' },
    { name: '150 fiber', price: '100000' },
  ];

  const cableTypes = [
    { key: 'cable80', name: 'كيبل 80 متر', length: 80 },
    { key: 'cable100', name: 'كيبل 100 متر', length: 100 },
    { key: 'cable150', name: 'كيبل 150 متر', length: 150 },
    { key: 'cable200', name: 'كيبل 200 متر', length: 200 }
  ];

  const getLocation = (setFormData) => {
    if (!window.isSecureContext) {
      toast({
        title: "خطأ في الأمان",
        description: "لا يمكن طلب الموقع إلا من خلال اتصال آمن (HTTPS).",
        variant: "destructive",
      });
      return;
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData(prev => ({ ...prev, coordinates: `${latitude.toFixed(6)},${longitude.toFixed(6)}` }));
          toast({ title: "نجاح", description: "تم تحديد الموقع بنجاح." });
        },
        () => {
          toast({ title: "خطأ", description: "لا يمكن الوصول إلى الموقع. يرجى التأكد من تفعيل خدمات الموقع.", variant: "destructive" });
        }
      );
    } else {
      toast({ title: "خطأ", description: "المتصفح لا يدعم تحديد الموقع.", variant: "destructive" });
    }
  };

  const calculateTotalCable = (formData) => {
    return cableTypes.reduce((total, type) => {
      const quantity = parseInt(formData[type.key]) || 0;
      return total + (quantity * type.length);
    }, 0);
  };

  const generateReportText = (data, totalCableMeters) => {
    const cableDetails = cableTypes
      .filter(type => parseInt(data[type.key]) > 0)
      .map(type => `${data[type.key]} × ${type.name}`)
      .join(', ');

    return `*📄 تقرير تنصيب متطور*
────────────────────
*المعلومات الأساسية*
• الاسم: ${data.name || ''}
• رقم الهاتف: ${data.phone || ''}
• رقم التذكرة: ${data.ticketId || ''}
• اسم المستخدم: ${data.userId || ''}
• كلمة السر: ${data.userPassword || ''}
• SSID: ${data.ssid || ''}
• الإحداثيات: ${data.coordinates || ''}
• نوع الاشتراك: ${data.subscriptionType || ''}
• قيمة الاشتراك: ${data.subscriptionCost ? `${data.subscriptionCost} د.ع` : ''}
• أجور التنصيب: ${data.installationFee || ''}
────────────────────
*تفاصيل الكيبل المتطورة*
• إجمالي الكيبل: ${totalCableMeters} متر
• تفاصيل الكيبل: ${cableDetails || 'لا يوجد'}
────────────────────
*المواد المستخدمة*
• فراشة (S-Hook): ${data.sHook || '0'}
• شناطة ستيل: ${data.steelBag || '0'}
• شناطة بلاستك: ${data.plasticBag || '0'}
• فيشة خارجية: ${data.externalPlug || '0'}
• فيشة داخلية: ${data.internalPlug || '0'}
• تيب: ${data.tape || '0'}
• بكتيلات: ${data.buckles || '0'}
────────────────────
*نوع الجهاز*: ${data.deviceType || ''}`;
  };

  const handleSubscriptionChange = (value, setFormData) => {
    const selectedOffer = offers.find(o => o.name === value);
    if (selectedOffer) {
      setFormData(prev => ({
        ...prev,
        subscriptionType: selectedOffer.name,
        subscriptionCost: selectedOffer.price
      }));
    }
  };

  return {
    offers,
    cableTypes,
    getLocation,
    calculateTotalCable,
    generateReportText,
    handleSubscriptionChange,
    toast
  };
};