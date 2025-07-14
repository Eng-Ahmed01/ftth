import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { UploadCloud, FileText, X, Plus, Sparkles } from 'lucide-react';

const geniusParser = (tableData, existingTicketIds, zoneData) => {
    const newTasks = [];
    
    tableData.forEach(row => {
        if (!row.ticketId || existingTicketIds.has(row.ticketId)) return;
        
        // البحث عن الداش المطابق للزون
        let dashNumber = '';
        if (row.zone && zoneData.length > 0) {
            const matchingZone = zoneData.find(z => z.Zone === row.zone);
            if (matchingZone) {
                dashNumber = matchingZone.Dash;
            }
        }
        
        const task = {
            ticketId: row.ticketId,
            name: row.name || 'اسم غير محدد',
            phone: row.phone || '',
            zone: row.zone ? row.zone.toUpperCase() : '',
            dash: dashNumber,
            location: row.location || '',
            status: 'New',
            rescheduleToDate: row.rescheduleToDate || '',
            oldFeedback: {
                status: row.status || 'N/A',
                note: row.feedback || 'لا توجد ملاحظات'
            },
            assignedTo: null,
            feedbackHistory: [],
            rescheduleDate: null,
            hasDash: !!dashNumber
        };
        
        newTasks.push(task);
        existingTicketIds.add(task.ticketId);
    });
    
    return newTasks;
};

const TaskImporter = ({ onUpdateTasks, currentTasks, zoneData = [] }) => {
    const [tableData, setTableData] = useState([
        { 
            ticketId: '', zone: '', name: '', phone: '', location: '', 
            status: '', rescheduleToDate: '', feedback: ''
        }
    ]);
    const { toast } = useToast();

    const addRow = () => {
        setTableData([...tableData, { 
            ticketId: '', zone: '', name: '', phone: '', location: '', 
            status: '', rescheduleToDate: '', feedback: ''
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

    const handlePasteData = (pastedText) => {
        const lines = pastedText.trim().split('\n');
        const newTableData = [];
        
        lines.forEach(line => {
            const columns = line.split('\t').map(col => col.trim());
            if (columns.length >= 3) {
                const row = {
                    ticketId: '',
                    zone: '',
                    name: '',
                    phone: '',
                    location: '',
                    status: '',
                    rescheduleToDate: '',
                    feedback: ''
                };
                
                columns.forEach(col => {
                    if (/^\d{6,8}$/.test(col)) row.ticketId = col;
                    else if (/^0?7[7-9]\d{8}$/.test(col)) row.phone = col;
                    else if (/^FNJ\d{3,}$/i.test(col)) row.zone = col.toUpperCase();
                    else if (/^\d{1,2}\.\d+,\s*\d{1,2}\.\d+$/.test(col)) row.location = col;
                    else if (/\d{1,2}[./-]\d{1,2}[./-]\d{2,4}/.test(col) && !row.rescheduleToDate) row.rescheduleToDate = col;
                    else if (/already in service|cancelled|reschedule|done|in progress|no answer|duplicate|done by contractor|out of coverage|fat issue/i.test(col)) row.status = col;
                    else if (/[\u0600-\u06FF]/.test(col) && !row.name) row.name = col;
                    else if (col && !row.feedback && !/^\d+$/.test(col)) row.feedback = col;
                });
                
                if (row.ticketId) newTableData.push(row);
            }
        });
        
        if (newTableData.length > 0) {
            setTableData(newTableData);
            toast({ title: "تم اللصق بنجاح!", description: `تم تحليل ${newTableData.length} صف من البيانات.` });
        }
    };

    const handleImport = () => {
        const validRows = tableData.filter(row => row.ticketId);
        if (validRows.length === 0) {
            toast({ title: "خطأ", description: "الرجاء إدخال رقم تذكرة واحد على الأقل.", variant: "destructive" });
            return;
        }
        
        const existingTicketIds = new Set(currentTasks.map(t => t.ticketId));
        const newTasks = geniusParser(validRows, existingTicketIds, zoneData);

        if (newTasks.length > 0) {
            const tasksWithDash = newTasks.filter(t => t.hasDash).length;
            onUpdateTasks([...currentTasks, ...newTasks]);
            toast({ 
                title: "نجاح!", 
                description: `تمت إضافة ${newTasks.length} مهمة جديدة بنجاح. ${tasksWithDash} منها تحتوي على داش.` 
            });
            setTableData([{ 
                ticketId: '', zone: '', name: '', phone: '', location: '', 
                status: '', rescheduleToDate: '', feedback: ''
            }]);
        } else {
            toast({ title: "لا توجد تغييرات", description: "لم يتم العثور على مهام جديدة أو فريدة لإضافتها." });
        }
    };

    return (
        <Card className="w-full max-w-7xl mx-auto glass-effect border-sky-500/20 enhanced-card">
            <CardHeader className="bg-gradient-to-r from-sky-500/10 to-purple-500/10">
                <CardTitle className="flex items-center gap-3 text-3xl gradient-text font-bold">
                    <Sparkles className="w-8 h-8" />
                    إضافة مهام جديدة - نظام متطور مع الداش
                </CardTitle>
                <CardDescription className="text-gray-300 text-lg">
                    أدخل البيانات في الجدول أدناه أو الصق البيانات من Excel مباشرة للتحليل الذكي. سيتم ربط الزون بالداش تلقائياً.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
                <div className="mb-6">
                    <Textarea
                        placeholder="الصق البيانات من Excel هنا وسيتم تحليلها تلقائياً بذكاء فائق مع ربط الداش..."
                        rows={4}
                        className="glass-effect text-white border-sky-500/30 focus:border-sky-400 transition-all duration-300"
                        onPaste={(e) => {
                            e.preventDefault();
                            const pastedText = e.clipboardData.getData('text');
                            handlePasteData(pastedText);
                        }}
                    />
                </div>
                
                <div className="overflow-x-auto rounded-lg border border-slate-600 bg-slate-900/50">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-slate-800 to-slate-700">
                            <tr>
                                <th className="border border-slate-600 px-3 py-3 text-right text-sm font-bold text-sky-300">Ticket ID *</th>
                                <th className="border border-slate-600 px-3 py-3 text-right text-sm font-bold text-sky-300">Zone</th>
                                <th className="border border-slate-600 px-3 py-3 text-right text-sm font-bold text-sky-300">Name</th>
                                <th className="border border-slate-600 px-3 py-3 text-right text-sm font-bold text-sky-300">Phone</th>
                                <th className="border border-slate-600 px-3 py-3 text-right text-sm font-bold text-sky-300">Location</th>
                                <th className="border border-slate-600 px-3 py-3 text-right text-sm font-bold text-sky-300">Status</th>
                                <th className="border border-slate-600 px-3 py-3 text-right text-sm font-bold text-sky-300">Reschedule To</th>
                                <th className="border border-slate-600 px-3 py-3 text-right text-sm font-bold text-sky-300">Feedback</th>
                                <th className="border border-slate-600 px-3 py-3 text-center text-sm font-bold text-sky-300">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tableData.map((row, index) => {
                                // البحث عن الداش المطابق للزون
                                const matchingZone = zoneData.find(z => z.Zone === row.zone);
                                const dashNumber = matchingZone ? matchingZone.Dash : '';
                                
                                return (
                                    <tr key={index} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="border border-slate-600 p-2">
                                            <Input
                                                value={row.ticketId}
                                                onChange={(e) => updateRow(index, 'ticketId', e.target.value)}
                                                placeholder="1255280"
                                                className="glass-effect text-white text-sm h-9 border-sky-500/30"
                                            />
                                        </td>
                                        <td className="border border-slate-600 p-2">
                                            <div className="space-y-1">
                                                <Input
                                                    value={row.zone}
                                                    onChange={(e) => updateRow(index, 'zone', e.target.value)}
                                                    placeholder="FNJ0253"
                                                    className="glass-effect text-white text-sm h-9 border-sky-500/30"
                                                />
                                                {dashNumber && (
                                                    <div className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded">
                                                        داش: {dashNumber}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="border border-slate-600 p-2">
                                            <Input
                                                value={row.name}
                                                onChange={(e) => updateRow(index, 'name', e.target.value)}
                                                placeholder="حسنين منصور فري"
                                                className="glass-effect text-white text-sm h-9 border-sky-500/30"
                                            />
                                        </td>
                                        <td className="border border-slate-600 p-2">
                                            <Input
                                                value={row.phone}
                                                onChange={(e) => updateRow(index, 'phone', e.target.value)}
                                                placeholder="7718731440"
                                                className="glass-effect text-white text-sm h-9 border-sky-500/30"
                                            />
                                        </td>
                                        <td className="border border-slate-600 p-2">
                                            <Input
                                                value={row.location}
                                                onChange={(e) => updateRow(index, 'location', e.target.value)}
                                                placeholder="32.123, 44.456"
                                                className="glass-effect text-white text-sm h-9 border-sky-500/30"
                                            />
                                        </td>
                                        <td className="border border-slate-600 p-2">
                                            <Input
                                                value={row.status}
                                                onChange={(e) => updateRow(index, 'status', e.target.value)}
                                                placeholder="Already In Service"
                                                className="glass-effect text-white text-sm h-9 border-sky-500/30"
                                            />
                                        </td>
                                        <td className="border border-slate-600 p-2">
                                            <Input
                                                value={row.rescheduleToDate}
                                                onChange={(e) => updateRow(index, 'rescheduleToDate', e.target.value)}
                                                placeholder="6/30/2025"
                                                className="glass-effect text-white text-sm h-9 border-sky-500/30"
                                            />
                                        </td>
                                        <td className="border border-slate-600 p-2">
                                            <Input
                                                value={row.feedback}
                                                onChange={(e) => updateRow(index, 'feedback', e.target.value)}
                                                placeholder="منصب بغير اسم"
                                                className="glass-effect text-white text-sm h-9 border-sky-500/30"
                                            />
                                        </td>
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
                                );
                            })}
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
                        className="bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 pulse-glow text-white font-bold px-8"
                    >
                        <UploadCloud className="ml-2 h-5 w-5" />
                        إضافة المهام بذكاء فائق
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default TaskImporter;