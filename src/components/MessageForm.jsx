import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { FilePlus, Edit, Send, Clock } from 'lucide-react';

const MessageForm = ({ contacts, onAddHistory, onScheduleMessage, sendWhatsAppMessage }) => {
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [selectedContactId, setSelectedContactId] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleTime, setScheduleTime] = useState('');
  const { toast } = useToast();

  const resetForm = () => {
    setTitle('');
    setDetails('');
    setSelectedContactId('');
    setIsScheduling(false);
    setScheduleTime('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !details) {
      toast({ title: "خطأ", description: "يرجى تعبئة العنوان والتفاصيل.", variant: "destructive" });
      return;
    }
    if (!selectedContactId) {
      toast({ title: "خطأ", description: "يرجى اختيار جهة اتصال للإرسال إليها.", variant: "destructive" });
      return;
    }

    const contact = contacts.find(c => c.id.toString() === selectedContactId);
    if (!contact) {
      toast({ title: "خطأ", description: "لم يتم العثور على جهة الاتصال.", variant: "destructive" });
      return;
    }

    if (isScheduling) {
      if (!scheduleTime) {
        toast({ title: "خطأ", description: "يرجى تحديد وقت الإرسال.", variant: "destructive" });
        return;
      }
      if (new Date(scheduleTime) <= new Date()) {
        toast({ title: "خطأ", description: "لا يمكن جدولة رسالة في الماضي.", variant: "destructive" });
        return;
      }
      onScheduleMessage({
        id: Date.now(),
        title,
        details,
        contact,
        scheduleTime,
      });
      toast({ title: "تمت الجدولة", description: `تمت جدولة رسالتك إلى ${contact.name} بنجاح.` });
      resetForm();
    } else {
      const rawMessageText = `*${title}*\n\n${details}`;
      sendWhatsAppMessage(contact, rawMessageText);
      onAddHistory({
        id: Date.now(),
        title,
        details,
        sentTo: contact.name,
        timestamp: new Date().toISOString(),
      });
      resetForm();
    }
  };

  return (
    <motion.div>
      <Card className="w-full mx-auto glass-effect border-sky-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl gradient-text font-bold">
            <FilePlus className="w-8 h-8" />
            إنشاء رسالة جديدة
          </CardTitle>
          <CardDescription className="text-gray-300">
            املأ النموذج لإرسال رسالة فورية أو جدولتها.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="contact-select">إرسال إلى</Label>
              <Select onValueChange={setSelectedContactId} value={selectedContactId}>
                <SelectTrigger id="contact-select" className="glass-effect border-sky-400/50 text-white">
                  <SelectValue placeholder="اختر شخص أو مجموعة..." />
                </SelectTrigger>
                <SelectContent>
                  {contacts.length > 0 ? (
                    contacts.map(contact => (
                      <SelectItem key={contact.id} value={contact.id.toString()}>{contact.name} ({contact.type === 'group' ? 'مجموعة' : 'شخص'})</SelectItem>
                    ))
                  ) : (
                    <div className="p-4 text-center text-sm text-gray-400">أضف جهات اتصال أولاً</div>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center gap-2 text-gray-200">
                <Edit className="w-4 h-4" />
                العنوان
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: تحديث المشروع"
                className="glass-effect border-sky-400/50 text-white placeholder-gray-400 focus:border-sky-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="details" className="flex items-center gap-2 text-gray-200">
                <Edit className="w-4 h-4" />
                نص الرسالة
              </Label>
              <Textarea
                id="details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="اكتب رسالتك هنا..."
                className="glass-effect border-sky-400/50 text-white placeholder-gray-400 focus:border-sky-400 min-h-[120px]"
              />
            </div>
            
            <div className="space-y-4 rounded-lg p-4 bg-slate-800/50 border border-slate-700/50">
                <div className="flex items-center space-x-2">
                    <Checkbox id="schedule-check" checked={isScheduling} onCheckedChange={setIsScheduling} />
                    <Label htmlFor="schedule-check" className="text-base cursor-pointer text-amber-300">
                        جدولة الرسالة
                    </Label>
                </div>
                <AnimatePresence>
                {isScheduling && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="space-y-2 pt-2">
                            <Label htmlFor="schedule-time">وقت الإرسال</Label>
                            <Input
                                id="schedule-time"
                                type="datetime-local"
                                value={scheduleTime}
                                onChange={e => setScheduleTime(e.target.value)}
                                className="glass-effect border-amber-400/50 text-white"
                            />
                        </div>
                    </motion.div>
                )}
                </AnimatePresence>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105"
            >
              {isScheduling ? <Clock className="ml-2 h-4 w-4" /> : <Send className="ml-2 h-4 w-4" />}
              {isScheduling ? 'جدولة الرسالة' : 'إرسال الآن'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MessageForm;