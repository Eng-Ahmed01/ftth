import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { fetchPendingUsers, approveUser, rejectUser } from '@/services/userService';

const AccountApprovals = () => {
  const { toast } = useToast();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await fetchPendingUsers();
      if (error) {
        toast({
          variant: 'destructive',
          title: 'خطأ',
          description: 'فشل جلب المستخدمين.'
        });
      } else {
        setPendingUsers(data || []);
      }
      setLoading(false);
    };
    load();
  }, [toast]);

  const handleApprove = async (id) => {
    const { error } = await approveUser(id);
    if (error) {
      toast({ variant: 'destructive', title: 'خطأ', description: 'فشل الموافقة.' });
    } else {
      setPendingUsers(prev => prev.filter(u => u.id !== id));
      toast({ title: 'تمت الموافقة', description: 'تمت الموافقة على المستخدم.' });
    }
  };

  const handleReject = async (id) => {
    const { error } = await rejectUser(id);
    if (error) {
      toast({ variant: 'destructive', title: 'خطأ', description: 'فشل الرفض.' });
    } else {
      setPendingUsers(prev => prev.filter(u => u.id !== id));
      toast({ title: 'تم الرفض', description: 'تم حذف المستخدم.' });
    }
  };

  return (
    <Card className="glass-effect border-sky-500/20">
      <CardHeader>
        <CardTitle className="text-2xl gradient-text font-bold">الحسابات المعلقة</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center">جاري التحميل...</p>
        ) : pendingUsers.length === 0 ? (
          <p className="text-center text-gray-400">لا توجد حسابات معلقة.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-sky-300">
                <th className="p-2 text-right">المستخدم</th>
                <th className="p-2 text-right">البريد</th>
                <th className="p-2 text-right">تاريخ الإنشاء</th>
                <th className="p-2 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {pendingUsers.map((u) => (
                <tr key={u.id} className="border-b border-slate-700/50">
                  <td className="p-2">{u.username}</td>
                  <td className="p-2">{u.email}</td>
                  <td className="p-2">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : ''}
                  </td>
                  <td className="p-2 flex gap-2 justify-center">
                    <Button size="sm" onClick={() => handleApprove(u.id)}>
                      موافقة
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleReject(u.id)}
                    >
                      رفض
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
};

export default AccountApprovals;
