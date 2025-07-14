import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Map, Upload, Trash2, ClipboardPaste } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as XLSX from 'xlsx';

const ZoneManager = ({ zoneData, onUpdateZoneData }) => {
  const { toast } = useToast();
  const fileInputRef = React.useRef(null);
  const [pastedData, setPastedData] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);

        if (json.length > 0 && ('Zone' in json[0] && 'Dash' in json[0])) {
          const newZoneData = json.map((row, index) => ({
            id: Date.now() + index,
            Zone: String(row.Zone),
            Dash: String(row.Dash)
          }));
          onUpdateZoneData(newZoneData);
          toast({ title: "نجاح", description: `تم تحميل وربط ${newZoneData.length} سجلاً بنجاح.` });
        } else {
          throw new Error("الملف يجب أن يحتوي على أعمدة 'Zone' و 'Dash'.");
        }
      } catch (error) {
        toast({ title: "خطأ في التحميل", description: error.message, variant: "destructive" });
      }
    };
    reader.onerror = () => {
        toast({ title: "خطأ", description: "فشل في قراءة الملف.", variant: "destructive" });
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  const handlePasteProcess = () => {
    const rows = pastedData.trim().split('\n');
    const newZoneData = rows.map((row, index) => {
        const columns = row.split(/\s+/);
        if (columns.length >= 2) {
            return {
                id: Date.now() + index,
                Zone: columns[0],
                Dash: columns[1]
            };
        }
        return null;
    }).filter(Boolean);

    if (newZoneData.length > 0) {
        onUpdateZoneData(newZoneData);
        toast({ title: "نجاح", description: `تمت معالجة ولصق ${newZoneData.length} سجلاً بنجاح.` });
        setPastedData('');
    } else {
        toast({ title: "خطأ", description: "لم يتم العثور على بيانات صالحة. تأكد من أن كل سطر يحتوي على Zone و Dash مفصولين بمسافة.", variant: "destructive" });
    }
  };

  const handleDelete = (id) => {
    const updatedData = zoneData.filter(item => item.id !== id);
    onUpdateZoneData(updatedData);
    toast({ title: "تم الحذف", description: "تم حذف الربط." });
  };

  return (
    <Card className="glass-effect border-green-500/20 h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl gradient-text font-bold">
          <Map className="w-8 h-8" />
          إدارة المناطق
        </CardTitle>
        <CardDescription className="text-gray-300">
          أدرِ ربط المناطق (Zones) بالمعرفات (Dash).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">تحميل ملف</TabsTrigger>
            <TabsTrigger value="paste">لصق بيانات</TabsTrigger>
          </TabsList>
          <TabsContent value="upload" className="mt-4">
            <div className="space-y-4">
              <Input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".xlsx, .xls"
              />
              <Button onClick={() => fileInputRef.current.click()} className="w-full bg-gradient-to-r from-green-500 to-teal-500">
                <Upload className="ml-2 h-4 w-4" />
                تحميل ملف Excel
              </Button>
              <p className="text-xs text-center text-gray-400">يجب أن يحتوي الملف على أعمدة باسم "Zone" و "Dash".</p>
            </div>
          </TabsContent>
          <TabsContent value="paste" className="mt-4">
            <div className="space-y-4">
                <Textarea 
                    value={pastedData}
                    onChange={(e) => setPastedData(e.target.value)}
                    placeholder="الصق بياناتك هنا. كل سطر يجب أن يحتوي على Zone ثم Dash، مثال:&#10;FNJ0061 2&#10;FNJ0062 3"
                    className="glass-effect min-h-[120px]"
                />
                <Button onClick={handlePasteProcess} className="w-full bg-gradient-to-r from-sky-500 to-indigo-500">
                    <ClipboardPaste className="ml-2 h-4 w-4" />
                    معالجة البيانات الملصقة
                </Button>
            </div>
          </TabsContent>
        </Tabs>

        <h4 className="text-lg font-semibold mt-6 mb-2 text-green-300">البيانات الحالية</h4>
        <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-2">
          {zoneData.length > 0 ? (
            <AnimatePresence>
              {zoneData.map(item => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50"
                >
                  <div>
                    <p className="font-semibold text-green-300">Zone: {item.Zone}</p>
                    <p className="text-sm text-gray-400">Dash: {item.Dash}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <p className="text-center text-gray-500 py-8">لا توجد بيانات محفوظة.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ZoneManager;