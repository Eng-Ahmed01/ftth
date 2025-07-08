import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { LogIn, FileText, UserPlus } from 'lucide-react';
import { Helmet } from 'react-helmet';

const AuthPage = ({ onLogin, onUpdateUsers }) => {
  const { toast } = useToast();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  const handleAuthAction = (e) => {
    e.preventDefault();
    if (isRegister) {
      handleRegister();
    } else {
      handleLogin();
    }
  };

  const handleLogin = () => {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const foundUser = users.find(u => u.username === username && u.password === password);

    if (foundUser) {
      toast({ title: `مرحباً بعودتك، ${foundUser.username}!` });
      onLogin(foundUser);
    } else {
      toast({ title: "خطأ", description: "اسم المستخدم أو كلمة المرور غير صحيحة.", variant: "destructive" });
    }
  };

  const handleRegister = () => {
    if (!username || !password) {
      toast({ title: "خطأ", description: "يرجى ملء جميع الحقول.", variant: "destructive" });
      return;
    }
    let users = JSON.parse(localStorage.getItem('users')) || [];
    const userExists = users.some(u => u.username === username);

    if (userExists) {
      toast({ title: "خطأ", description: "اسم المستخدم هذا موجود بالفعل.", variant: "destructive" });
    } else {
      const newUser = { username, password, role: 'technician' }; // New users are technicians
      const updatedUsers = [...users, newUser];
      onUpdateUsers(updatedUsers);
      toast({ title: "نجاح!", description: "تم إنشاء حسابك بنجاح. يمكنك الآن تسجيل الدخول." });
      setIsRegister(false);
      setUsername('');
      setPassword('');
    }
  };

  return (
    <>
      <Helmet>
        <title>{isRegister ? 'إنشاء حساب' : 'تسجيل الدخول'} - نظام المهام</title>
        <meta name="description" content="الوصول إلى نظام إدارة المهام." />
      </Helmet>
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <Card className="w-full mx-auto glass-effect border-sky-500/30">
            <CardHeader className="text-center">
              <div className="inline-block p-4 bg-sky-500/10 rounded-full mb-4 mx-auto">
                <FileText className="w-12 h-12 gradient-text" />
              </div>
              <CardTitle className="text-3xl font-bold gradient-text">{isRegister ? 'إنشاء حساب جديد' : 'نظام المهام'}</CardTitle>
              <CardDescription className="text-gray-300 pt-2">
                {isRegister ? 'املأ البيانات لإنشاء حسابك' : 'يرجى تسجيل الدخول للمتابعة'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAuthAction} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="username">اسم المستخدم</Label>
                  <Input id="username" value={username} onChange={e => setUsername(e.target.value)} placeholder="اسم المستخدم" required className="glass-effect" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">كلمة المرور</Label>
                  <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="كلمة المرور" required className="glass-effect" />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-sky-500 to-indigo-500 pulse-glow mt-4">
                  {isRegister ? <UserPlus className="ml-2 h-4 w-4" /> : <LogIn className="ml-2 h-4 w-4" />}
                  {isRegister ? 'إنشاء حساب' : 'دخول'}
                </Button>
              </form>
              <div className="mt-6 text-center">
                <Button variant="link" onClick={() => setIsRegister(!isRegister)}>
                  {isRegister ? 'هل لديك حساب بالفعل؟ تسجيل الدخول' : 'ليس لديك حساب؟ إنشاء حساب جديد'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default AuthPage;