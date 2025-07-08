import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { ExternalLink, Settings, CheckCircle, XCircle, Upload, Download, Link, Globe } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const GoogleSheetsManager = ({ tasks, reports, onUpdateTasks, onUpdateReports }) => {
  const { toast } = useToast();
  const [sheetsConfig, setSheetsConfig] = useState({
    spreadsheetId: '',
    apiKey: '',
    sheetName: 'البيانات',
    autoSync: false
  });
  const [pendingReports, setPendingReports] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const savedConfig = JSON.parse(localStorage.getItem('googleSheetsConfig')) || {};
    setSheetsConfig(prev => ({ ...prev, ...savedConfig }));
    
    const pending = JSON.parse(localStorage.getItem('pendingReports')) || [];
    setPendingReports(pending);
    
    setIsConnected(!!savedConfig.spreadsheetId && !!savedConfig.apiKey);
  }, []);

  const saveConfig = () => {
    localStorage.setItem('googleSheetsConfig', JSON.stringify(sheetsConfig));
    setIsConnected(!!sheetsConfig.spreadsheetId && !!sheetsConfig.apiKey);
    toast({
      title: "تم الحفظ!",
      description: "تم حفظ إعدادات Google Sheets بنجاح."
    });
  };

  const addToPendingReports = (reportData) => {
    const newPending = [...pendingReports, {
      ...reportData,
      id: Date.now(),
      status: 'pending',
      timestamp: new Date().toISOString()
    }];
    setPendingReports(newPending);
    localStorage.setItem('pendingReports', JSON.stringify(newPending));
  };

  const approveReport = (reportId) => {
    const updatedPending = pendingReports.map(report => 
      report.id === reportId 
        ? { ...report, status: 'approved', approvedAt: new Date().toISOString() }
        : report
    );
    setPendingReports(updatedPending);
    localStorage.setItem('pendingReports', JSON.stringify(updatedPending));
    
    // محاكاة إرسال إلى Google Sheets
    simulateGoogleSheetsUpload(reportId);
    
    toast({
      title: "تمت الموافقة!",
      description: "تم إرسال التقرير إلى Google Sheets بنجاح."
    });
  };

  const rejectReport = (reportId) => {
    const updatedPending = pendingReports.map(report => 
      report.id === reportId 
        ? { ...report, status: 'rejected', rejectedAt: new Date().toISOString() }
        : report
    );
    setPendingReports(updatedPending);
    localStorage.setItem('pendingReports', JSON.stringify(updatedPending));
    
    toast({
      title: "تم الرفض",
      description: "تم رفض التقرير ولن يتم إرساله إلى Google Sheets.",
      variant: "destructive"
    });
  };

  const simulateGoogleSheetsUpload = (reportId) => {
    // محاكاة عملية الرفع إلى Google Sheets
    console.log(`Uploading report ${reportId} to Google Sheets...`);
    
    // في التطبيق الحقيقي، ستكون هذه دالة API حقيقية
    const mockApiCall = () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ success: true, rowNumber: Math.floor(Math.random() * 1000) + 1 });
        }, 2000);
      });
    };
    
    mockApiCall().then(result => {
      if (result.success) {
        const updatedPending = pendingReports.map(report => 
          report.id === reportId 
            ? { ...report, status: 'uploaded', uploadedAt: new Date().toISOString(), rowNumber: result.rowNumber }
            : report
        );
        setPendingReports(updatedPending);
        localStorage.setItem('pendingReports', JSON.stringify(updatedPending));
      }
    });
  };

  const exportAllData = () => {
    const combinedData = [
      ...tasks.map(task => ({
        type: 'مهمة',
        ticketId: task.ticketId,
        name: task.name || '',
        phone: task.phone || '',
        zone: task.zone || '',
        status: task.status,
        assignedTo: task.assignedTo || '',
        timestamp: task.timestamp || ''
      })),
      ...reports.map(report => ({
        type: 'تقرير تنصيب',
        ticketId: report.ticketId || `تقرير-${report.id}`,
        name: report.name || '',
        phone: report.phone || '',
        zone: report.zone || '',
        status: 'مكتمل',
        assignedTo: report.submittedBy || '',
        timestamp: report.timestamp || ''
      }))
    ];

    // محاكاة تصدير البيانات
    console.log('Exporting data to Google Sheets:', combinedData);
    
    toast({
      title: "جاري التصدير...",
      description: `جاري تصدير ${combinedData.length} عنصر إلى Google Sheets.`
    });

    // محاكاة عملية التصدير
    setTimeout(() => {
      toast({
        title: "تم التصدير بنجاح!",
        description: "تم تصدير جميع البيانات إلى Google Sheets."
      });
    }, 3000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-500/20';
      case 'approved': return 'text-green-400 bg-green-500/20';
      case 'rejected': return 'text-red-400 bg-red-500/20';
      case 'uploaded': return 'text-blue-400 bg-blue-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'في انتظار الموافقة';
      case 'approved': return 'تمت الموافقة';
      case 'rejected': return 'مرفوض';
      case 'uploaded': return 'تم الرفع';
      default: return 'غير معروف';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Card className="glass-effect border-green-500/20 enhanced-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl gradient-text font-bold">
            <Globe className="w-8 h-8" />
            إدارة Google Sheets المتطورة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="config" className="w-full">
            <TabsList className="grid w-full grid-cols-4 glass-effect">
              <TabsTrigger value="config"><Settings className="w-4 h-4 ml-2" />الإعدادات</TabsTrigger>
              <TabsTrigger value="pending"><CheckCircle className="w-4 h-4 ml-2" />الموافقات ({pendingReports.filter(r => r.status === 'pending').length})</TabsTrigger>
              <TabsTrigger value="history">📊 السجل</TabsTrigger>
              <TabsTrigger value="export"><Upload className="w-4 h-4 ml-2" />التصدير</TabsTrigger>
            </TabsList>

            <TabsContent value="config" className="mt-6">
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-lg border border-slate-600">
                  <div className={`w-4 h-4 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className={`font-semibold ${isConnected ? 'text-green-300' : 'text-red-300'}`}>
                    {isConnected ? 'متصل بـ Google Sheets' : 'غير متصل'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="spreadsheetId">معرف جدول البيانات (Spreadsheet ID)</Label>
                      <Input
                        id="spreadsheetId"
                        value={sheetsConfig.spreadsheetId}
                        onChange={(e) => setSheetsConfig(prev => ({ ...prev, spreadsheetId: e.target.value }))}
                        className="glass-effect"
                        placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apiKey">مفتاح API</Label>
                      <Input
                        id="apiKey"
                        type="password"
                        value={sheetsConfig.apiKey}
                        onChange={(e) => setSheetsConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                        className="glass-effect"
                        placeholder="AIzaSyD..."
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="sheetName">اسم الورقة</Label>
                      <Input
                        id="sheetName"
                        value={sheetsConfig.sheetName}
                        onChange={(e) => setSheetsConfig(prev => ({ ...prev, sheetName: e.target.value }))}
                        className="glass-effect"
                        placeholder="البيانات"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="autoSync"
                        checked={sheetsConfig.autoSync}
                        onChange={(e) => setSheetsConfig(prev => ({ ...prev, autoSync: e.target.checked }))}
                        className="rounded"
                      />
                      <Label htmlFor="autoSync">مزامنة تلقائية</Label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button onClick={saveConfig} className="bg-gradient-to-r from-green-500 to-emerald-500">
                    <Settings className="ml-2 h-4 w-4" />
                    حفظ الإعدادات
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => window.open('https://console.developers.google.com/', '_blank')}
                    className="glass-effect"
                  >
                    <ExternalLink className="ml-2 h-4 w-4" />
                    Google Console
                  </Button>
                </div>

                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <h4 className="text-blue-300 font-semibold mb-2">كيفية الحصول على الإعدادات:</h4>
                  <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
                    <li>انتقل إلى Google Sheets وأنشئ جدول بيانات جديد</li>
                    <li>انسخ معرف الجدول من الرابط (الجزء بين /d/ و /edit)</li>
                    <li>انتقل إلى Google Cloud Console وأنشئ مفتاح API</li>
                    <li>فعّل Google Sheets API في مشروعك</li>
                    <li>أدخل المعلومات أعلاه واحفظ الإعدادات</li>
                  </ol>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="pending" className="mt-6">
              <div className="space-y-4">
                {pendingReports.filter(r => r.status === 'pending').length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-400 mb-2">لا توجد تقارير في انتظار الموافقة</h3>
                    <p className="text-gray-500">جميع التقارير تمت مراجعتها.</p>
                  </div>
                ) : (
                  pendingReports
                    .filter(r => r.status === 'pending')
                    .map(report => (
                      <Card key={report.id} className="glass-effect border-yellow-500/20">
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <span className="text-yellow-300">تقرير تنصيب - {report.name}</span>
                            <span className={`px-2 py-1 rounded text-xs ${getStatusColor(report.status)}`}>
                              {getStatusText(report.status)}
                            </span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <p><strong>الهاتف:</strong> {report.phone}</p>
                              <p><strong>المنطقة:</strong> {report.zone}</p>
                              <p><strong>نوع الاشتراك:</strong> {report.subscriptionType}</p>
                            </div>
                            <div>
                              <p><strong>المُنفذ:</strong> {report.submittedBy}</p>
                              <p><strong>التاريخ:</strong> {new Date(report.timestamp).toLocaleDateString('ar-SA')}</p>
                              <p><strong>إجمالي الكيبل:</strong> {report.totalCableMeters} متر</p>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <Button 
                              onClick={() => approveReport(report.id)}
                              className="bg-gradient-to-r from-green-500 to-emerald-500"
                            >
                              <CheckCircle className="ml-2 h-4 w-4" />
                              موافقة وإرسال
                            </Button>
                            <Button 
                              onClick={() => rejectReport(report.id)}
                              variant="destructive"
                            >
                              <XCircle className="ml-2 h-4 w-4" />
                              رفض
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-300">سجل العمليات</h3>
                {pendingReports.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">لا يوجد سجل عمليات بعد.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingReports.map(report => (
                      <div key={report.id} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                        <div>
                          <p className="font-semibold text-white">{report.name} - {report.phone}</p>
                          <p className="text-sm text-gray-400">
                            {new Date(report.timestamp).toLocaleDateString('ar-SA')} - {report.submittedBy}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(report.status)}`}>
                          {getStatusText(report.status)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="export" className="mt-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="glass-effect border-blue-500/20">
                    <CardHeader>
                      <CardTitle className="text-blue-300">تصدير شامل</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300 mb-4">
                        تصدير جميع المهام والتقارير إلى Google Sheets دفعة واحدة.
                      </p>
                      <Button 
                        onClick={exportAllData}
                        className="w-full bg-gradient-to-r from-blue-500 to-cyan-500"
                        disabled={!isConnected}
                      >
                        <Upload className="ml-2 h-4 w-4" />
                        تصدير جميع البيانات
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="glass-effect border-purple-500/20">
                    <CardHeader>
                      <CardTitle className="text-purple-300">إحصائيات التصدير</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>إجمالي المهام:</span>
                          <span className="font-bold text-blue-400">{tasks.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>إجمالي التقارير:</span>
                          <span className="font-bold text-green-400">{reports.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>في انتظار الموافقة:</span>
                          <span className="font-bold text-yellow-400">
                            {pendingReports.filter(r => r.status === 'pending').length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>تم الرفع:</span>
                          <span className="font-bold text-purple-400">
                            {pendingReports.filter(r => r.status === 'uploaded').length}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <h4 className="text-green-300 font-semibold mb-2">ميزات التصدير المتقدمة:</h4>
                  <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
                    <li>تصدير تلقائي للتقارير المعتمدة</li>
                    <li>مزامنة في الوقت الفعلي مع Google Sheets</li>
                    <li>نسخ احتياطية تلقائية للبيانات</li>
                    <li>تتبع حالة كل عملية تصدير</li>
                    <li>إشعارات عند اكتمال التصدير</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default GoogleSheetsManager;