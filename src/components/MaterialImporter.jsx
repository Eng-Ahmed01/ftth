import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Package, Upload, X, Plus, Sparkles, FileSpreadsheet } from 'lucide-react';
import { materialTypes } from '@/components/inventory/MaterialTypes';
import * as XLSX from 'xlsx';

const MaterialImporter = ({ onAddMaterials, users }) => {
  const { toast } = useToast();
  const fileInputRef = React.useRef(null);
  const [tableData, setTableData] = useState([
    { 
      username: '', 
      ...Object.keys(materialTypes).reduce((acc, key) => ({ ...acc, [key]: '' }), {})
    }
  ]);

  const technicians = users.filter(u => u.role === 'technician');

  const addRow = () => {
    setTableData([...tableData, { 
      username: '', 
      ...Object.keys(materialTypes).reduce((acc, key) => ({ ...acc, [key]: '' }), {})
    }]);
  };

  const removeRow = (index) => {
    if (tableData.length > 1) {
      setTableData(tableData.filter((_, i) => i !== index));
    }
  };

  const updateRow = (index, field, value) => {
    const newData = [...tableData];
    newData[index][field] = value;
    setTableData(newData);
  };

  const handleFileUpload = (e) => {
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

        if (json.length > 0) {
          const newTableData = json.map(row => {
            const mappedRow = {
              username: row.username || row.Username || row['اسم المستخدم'] || '',
            };
            
            // تعيين المواد
            Object.keys(materialTypes).forEach(key => {
              const material = materialTypes[key];
              mappedRow[key] = row[key] || row[material.name] || '';
            });
            
            return mappedRow;
          });
          
          setTableData(newTableData);
          toast({ title: "تم التحميل بنجاح!", description: `تم تحليل ${newTableData.length} صف من البيانات.` });
        }
      } catch (error) {
        toast({ title: "خطأ في التحميل", description: error.message, variant: "destructive" });
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  const handlePasteData = (pastedText) => {
    const lines = pastedText.trim().split('\n');
    const newTableData = [];
    
    lines.forEach(line => {
      const columns = line.split('\t').map(col => col.trim());
      if (columns.length >= 2) {
        const row = {
          username: '',
          ...Object.keys(materialTypes).reduce((acc, key) => ({ ...acc, [key]: '' }), {})
        };
        
        // تحديد اسم المستخدم (أول عمود عادة)
        if (columns[0]) row.username = columns[0];
        
        // توزيع باقي الأعمدة على المواد
        const materialKeys = Object.keys(materialTypes);
        columns.slice(1).forEach((value, index) => {
          if (materialKeys[index] && value) {
            row[materialKeys[index]] = value;
          }
        });
        
        if (row.username) newTableData.push(row);
      }
    });
    
    if (newTableData.length > 0) {
      setTableData(newTableData);
      toast({ title: "تم اللصق بنجاح!", description: `تم تحليل ${newTableData.length} صف من البيانات.` });
    }
  };

  const handleImport = () => {
    const validRows = tableData.filter(row => row.username && technicians.some(t => t.username === row.username));
    
    if (validRows.length === 0) {
      toast({ title: "خطأ", description: "الرجاء إدخال اسم مستخدم صحيح واحد على الأقل.", variant: "destructive" });
      return;
    }

    // تحويل البيانات إلى تنسيق مناسب للنظام
    const materialsToAdd = [];
    
    validRows.forEach(row => {
      Object.entries(materialTypes).forEach(([key, material]) => {
        const quantity = parseInt(row[key]) || 0;
        if (quantity > 0) {
          materialsToAdd.push({
            username: row.username,
            materialType: key,
            quantity: quantity,
            materialName: material.name
          });
        }
      });
    });

    if (materialsToAdd.length > 0) {
      onAddMaterials(materialsToAdd);
      toast({ 
        title: "نجاح!", 
        description: `تمت إضافة ${materialsToAdd.length} عنصر مادي بنجاح.` 
      });
      setTableData([{ 
        username: '', 
        ...Object.keys(materialTypes).reduce((acc, key) => ({ ...acc, [key]: '' }), {})
      }]);
    } else {
      toast({ title: "لا توجد تغييرات", description: "لم يتم العثور على مواد صالحة لإضافتها." });
    }
  };

  return (
    <Card className="w-full max-w-7xl mx-auto glass-effect border-purple-500/20 enhanced-card">
      <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10">
        <CardTitle className="flex items-center gap-3 text-3xl gradient-text font-bold">
          <Sparkles className="w-8 h-8" />
          إضافة مواد متطورة - نظام ذكي
        </CardTitle>
        <CardDescription className="text-gray-300 text-lg">
          أدخل البيانات في الجدول أدناه أو حمّل ملف Excel أو الصق البيانات مباشرة للتحليل الذكي.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        {/* خيارات التحميل */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <Input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept=".xlsx, .xls"
            />
            <Button 
              onClick={() => fileInputRef.current.click()} 
              className="w-full bg-gradient-to-r from-green-500 to-teal-500"
            >
              <FileSpreadsheet className="ml-2 h-4 w-4" />
              تحميل ملف Excel
            </Button>
          </div>
          
          <div className="space-y-4">
            <Textarea
              placeholder="الصق البيانات من Excel هنا وسيتم تحليلها تلقائياً..."
              rows={3}
              className="glass-effect text-white border-purple-500/30 focus:border-purple-400 transition-all duration-300"
              onPaste={(e) => {
                e.preventDefault();
                const pastedText = e.clipboardData.getData('text');
                handlePasteData(pastedText);
              }}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto rounded-lg border border-slate-600 bg-slate-900/50">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-800 to-slate-700">
              <tr>
                <th className="border border-slate-600 px-3 py-3 text-right text-sm font-bold text-purple-300">اسم المستخدم *</th>
                {Object.entries(materialTypes).map(([key, material]) => (
                  <th key={key} className="border border-slate-600 px-3 py-3 text-center text-sm font-bold text-purple-300">
                    <div className="flex flex-col items-center gap-1">
                      <span>{material.icon}</span>
                      <span className="text-xs">{material.name}</span>
                    </div>
                  </th>
                ))}
                <th className="border border-slate-600 px-3 py-3 text-center text-sm font-bold text-purple-300">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, index) => (
                <tr key={index} className="hover:bg-slate-800/30 transition-colors">
                  <td className="border border-slate-600 p-2">
                    <select
                      value={row.username}
                      onChange={(e) => updateRow(index, 'username', e.target.value)}
                      className="w-full p-2 rounded-md bg-slate-800 border border-slate-600 text-white text-sm"
                    >
                      <option value="">اختر المستخدم</option>
                      {technicians.map(user => (
                        <option key={user.username} value={user.username}>{user.username}</option>
                      ))}
                    </select>
                  </td>
                  {Object.keys(materialTypes).map(key => (
                    <td key={key} className="border border-slate-600 p-2">
                      <Input
                        type="number"
                        value={row[key]}
                        onChange={(e) => updateRow(index, key, e.target.value)}
                        placeholder="0"
                        className="glass-effect text-white text-sm h-9 border-purple-500/30 text-center"
                        min="0"
                      />
                    </td>
                  ))}
                  <td className="border border-slate-600 p-2 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRow(index)}
                      disabled={tableData.length === 1}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/20 h-8 w-8 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="flex gap-3 justify-center">
          <Button 
            onClick={addRow} 
            variant="outline" 
            className="glass-effect border-purple-500/30 hover:bg-purple-500/20 btn-gradient"
          >
            <Plus className="ml-2 h-4 w-4" />
            إضافة صف جديد
          </Button>
          <Button 
            onClick={handleImport} 
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 pulse-glow text-white font-bold px-8"
          >
            <Upload className="ml-2 h-5 w-5" />
            إضافة المواد بذكاء فائق
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MaterialImporter;