import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { UserPlus, Trash2, Users, Phone, User } from 'lucide-react';

const ContactManager = ({ contacts, onUpdateContacts }) => {
  const [newContactName, setNewContactName] = useState('');
  const [newContactIdentifier, setNewContactIdentifier] = useState('');
  const [newContactType, setNewContactType] = useState('person');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleAddContact = () => {
    if (!newContactName || !newContactIdentifier) {
      toast({ title: "خطأ", description: "يرجى إدخال الاسم والمعرّف.", variant: "destructive" });
      return;
    }
    const updatedContacts = [...contacts, { id: Date.now(), name: newContactName, phone: newContactIdentifier, type: newContactType }];
    onUpdateContacts(updatedContacts);
    toast({ title: "نجاح", description: `تمت إضافة ${newContactName} إلى جهات الاتصال.` });
    setNewContactName('');
    setNewContactIdentifier('');
    setNewContactType('person');
    setIsDialogOpen(false);
  };

  const handleDeleteContact = (contactId) => {
    const updatedContacts = contacts.filter(c => c.id !== contactId);
    onUpdateContacts(updatedContacts);
    toast({ title: "تم الحذف", description: "تم حذف جهة الاتصال." });
  };

  return (
    <Card className="glass-effect border-purple-500/20 h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl gradient-text font-bold">
          <Users className="w-8 h-8" />
          جهات الاتصال
        </CardTitle>
        <CardDescription className="text-gray-300">
          أدر الأشخاص والمجموعات من هنا.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 mb-6">
              <UserPlus className="ml-2 h-4 w-4" />
              إضافة جهة اتصال / مجموعة
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-effect border-purple-500/30 text-white">
            <DialogHeader>
              <DialogTitle>إضافة جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>النوع</Label>
                <Select value={newContactType} onValueChange={setNewContactType}>
                    <SelectTrigger className="glass-effect">
                        <SelectValue placeholder="اختر النوع" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="person">شخص</SelectItem>
                        <SelectItem value="group">مجموعة</SelectItem>
                    </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-name">الاسم</Label>
                <Input id="contact-name" value={newContactName} onChange={e => setNewContactName(e.target.value)} placeholder="اسم الشخص أو المجموعة" className="glass-effect" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-identifier">
                  {newContactType === 'person' ? 'رقم واتساب' : 'معرّف دعوة المجموعة'}
                </Label>
                <Input 
                  id="contact-identifier" 
                  value={newContactIdentifier} 
                  onChange={e => setNewContactIdentifier(e.target.value)} 
                  placeholder={newContactType === 'person' ? 'بالصيغة الدولية بدون +' : 'كود الدعوة فقط (مثال: KzG8e3iX7Yh...)'} 
                  className="glass-effect" />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">إلغاء</Button>
              </DialogClose>
              <Button onClick={handleAddContact}>إضافة</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
          {contacts.length > 0 ? (
            <AnimatePresence>
              {contacts.map(contact => (
                <motion.div
                  key={contact.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-purple-300">
                        {contact.type === 'group' ? <Users className="w-5 h-5" /> : <User className="w-5 h-5" />}
                    </div>
                    <div>
                        <p className="font-semibold text-purple-300">{contact.name}</p>
                        <p className="text-sm text-gray-400 flex items-center gap-2">
                            {contact.type === 'group' ? 'معرّف المجموعة' : <Phone className="w-3 h-3" />}
                            : {contact.phone}
                        </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteContact(contact.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <p className="text-center text-gray-500 py-8">لا توجد جهات اتصال.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactManager;