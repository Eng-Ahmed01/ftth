import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { KeyRound, Save } from 'lucide-react';

const ChangePasswordDialog = ({ user, users, onUpdateUsers }) => {
    const { toast } = useToast();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const handlePasswordChange = () => {
        if (user.password !== currentPassword) {
            toast({ title: "خطأ", description: "كلمة المرور الحالية غير صحيحة.", variant: "destructive" });
            return;
        }
        if (!newPassword || newPassword !== confirmPassword) {
            toast({ title: "خطأ", description: "كلمتا المرور الجديدتان غير متطابقتين.", variant: "destructive" });
            return;
        }

        const updatedUsers = users.map(u =>
            u.username === user.username ? { ...u, password: newPassword } : u
        );
        onUpdateUsers(updatedUsers);
        toast({ title: "نجاح!", description: "تم تغيير كلمة المرور بنجاح." });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <KeyRound className="ml-2 h-4 w-4" />
                    تغيير كلمة المرور
                </Button>
            </DialogTrigger>
            <DialogContent className="glass-effect text-white">
                <DialogHeader>
                    <DialogTitle className="text-sky-300">تغيير كلمة المرور</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="current-password">كلمة المرور الحالية</Label>
                        <Input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="glass-effect" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="new-password">كلمة المرور الجديدة</Label>
                        <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="glass-effect" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirm-password">تأكيد كلمة المرور الجديدة</Label>
                        <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="glass-effect" />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="secondary">إلغاء</Button></DialogClose>
                    <Button onClick={handlePasswordChange}><Save className="ml-2 h-4 w-4" />حفظ</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ChangePasswordDialog;