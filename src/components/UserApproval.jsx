import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Check, X } from 'lucide-react';

const UserApproval = ({ users, onUpdateUsers }) => {
  const { toast } = useToast();
  const pendingUsers = users.filter(u => u.approved === false);

  const approveUser = (username) => {
    const updatedUsers = users.map(u =>
      u.username === username ? { ...u, approved: true } : u
    );
    onUpdateUsers(updatedUsers);
    toast({ title: 'تمت الموافقة', description: `تم تفعيل حساب ${username}` });
  };

  const rejectUser = (username) => {
    const updatedUsers = users.filter(u => u.username !== username);
    onUpdateUsers(updatedUsers);
    toast({ title: 'تم الرفض', description: `تم حذف حساب ${username}` });
  };

  return (
    <Card className="glass-effect border-sky-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl gradient-text font-bold">
          الموافقة على الحسابات
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {pendingUsers.length === 0 ? (
          <p className="text-center text-gray-400 py-8">لا توجد حسابات قيد الانتظار.</p>
        ) : (
          pendingUsers.map(user => (
            <div key={user.username} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
              <p className="font-semibold text-sky-300">{user.username}</p>
              <div className="space-x-2 space-x-reverse">
                <Button size="sm" onClick={() => approveUser(user.username)} className="bg-green-600 hover:bg-green-700">
                  <Check className="w-4 h-4 ml-1" /> موافقة
                </Button>
                <Button size="sm" variant="destructive" onClick={() => rejectUser(user.username)}>
                  <X className="w-4 h-4 ml-1" /> رفض
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default UserApproval;
