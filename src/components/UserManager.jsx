import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Users, Edit, Save } from 'lucide-react';

const UserManager = ({ users, onUpdateUsers }) => {
  const { toast } = useToast();
  const [editingUser, setEditingUser] = useState(null);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleEditClick = (user) => {
    setEditingUser(user);
    setNewUsername(user.username);
    setNewPassword(user.password);
  };

  const handleSaveChanges = () => {
    if (!newUsername || !newPassword) {
      toast({ title: "خطأ", description: "اسم المستخدم وكلمة المرور لا يمكن أن تكون فارغة.", variant: "destructive" });
      return;
    }

    const otherUsers = users.filter(u => u.username !== editingUser.username);
    if (otherUsers.some(u => u.username === newUsername)) {
      toast({ title: "خطأ", description: "اسم المستخدم هذا مستخدم بالفعل.", variant: "destructive" });
      return;
    }

    const updatedUsers = users.map(u => 
      u.username === editingUser.username 
        ? { ...u, username: newUsername, password: newPassword } 
        : u
    );
    
    onUpdateUsers(updatedUsers);
    toast({ title: "نجاح", description: "تم تحديث معلومات المستخدم." });
    setEditingUser(null);
  };

  const editableUsers = users.filter(u => u.role === 'admin' || u.role === 'technician' || u.role === 'creator');

  return (
    <Card className="glass-effect border-sky-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl gradient-text font-bold">
          <Users className="w-8 h-8" />
          إدارة المستخدمين
        </CardTitle>
        <CardDescription className="text-gray-300">
          تعديل معلومات المستخدمين.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
            <h4 className="text-lg font-semibold text-sky-300 mb-2">المستخدمون</h4>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            {editableUsers.length > 0 ? (
                <AnimatePresence>
                {editableUsers.map(u => (
                    <motion.div
                    key={u.username}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50"
                    >
                    <p className="font-semibold text-sky-300">{u.username} <span className="text-xs text-gray-400">({u.role})</span></p>
                    <Dialog onOpenChange={(isOpen) => !isOpen && setEditingUser(null)}>
                        <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(u)}>
                            <Edit className="h-4 w-4 text-yellow-400" />
                        </Button>
                        </DialogTrigger>
                        {editingUser && editingUser.username === u.username && (
                        <DialogContent className="glass-effect text-white">
                            <DialogHeader>
                            <DialogTitle className="text-sky-300">تعديل المستخدم: {editingUser.username}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-username">اسم المستخدم الجديد</Label>
                                <Input id="edit-username" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} className="glass-effect" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-password">كلمة المرور الجديدة</Label>
                                <Input id="edit-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="glass-effect" />
                            </div>
                            </div>
                            <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="secondary">إلغاء</Button>
                            </DialogClose>
                            <Button onClick={handleSaveChanges}>
                                <Save className="ml-2 h-4 w-4" />
                                حفظ التغييرات
                            </Button>
                            </DialogFooter>
                        </DialogContent>
                        )}
                    </Dialog>
                    </motion.div>
                ))}
                </AnimatePresence>
            ) : (
                <p className="text-center text-gray-500 py-8">لا يوجد مستخدمون لعرضهم.</p>
            )}
            </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserManager;