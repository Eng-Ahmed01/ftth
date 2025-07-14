import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Save, Edit } from 'lucide-react';

const EditTaskDialog = ({ isOpen, setIsOpen, task, onSave }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    zone: '',
    location: '',
    status: '',
    assignedTo: '',
    dash: '',
    hasDash: false
  });

  const statusOptions = [
    'New', 'In Progress', 'Done', 'Cancelled', 'Reschedule', 'No Answer', 
    'Already In Service', 'Duplicate', 'Done By Contractor', 
    'Out of coverage', 'FAT Issue'
  ];

  useEffect(() => {
    if (task && isOpen) {
      setFormData({
        name: task.name || '',
        phone: task.phone || '',
        zone: task.zone || '',
        location: task.location || '',
        status: task.status || '',
        assignedTo: task.assignedTo || '',
        dash: task.dash || '',
        hasDash: task.hasDash || false
      });
    }
  }, [task, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone) {
      toast({ 
        title: "خطأ", 
        description: "يرجى ملء الحقول المطلوبة (الاسم والهاتف).", 
        variant: "destructive" 
      });
      return;
    }

    onSave(formData);
    setIsOpen(false);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl glass-effect border-yellow-500/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl gradient-text font-bold">
            <Edit className="w-8 h-8 text-yellow-400" />
            تعديل المهمة
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-yellow-300 font-semibold">الاسم *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="glass-effect"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-yellow-300 font-semibold">رقم الهاتف *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="glass-effect"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="zone" className="text-yellow-300 font-semibold">المنطقة</Label>
              <Input
                id="zone"
                value={formData.zone}
                onChange={(e) => handleChange('zone', e.target.value)}
                className="glass-effect"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-yellow-300 font-semibold">الحالة</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                <SelectTrigger className="glass-effect">
                  <SelectValue placeholder="اختر الحالة..." />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignedTo" className="text-yellow-300 font-semibold">المُعيّن إليه</Label>
              <Input
                id="assignedTo"
                value={formData.assignedTo}
                onChange={(e) => handleChange('assignedTo', e.target.value)}
                className="glass-effect"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dash" className="text-yellow-300 font-semibold">رقم الداش</Label>
              <Input
                id="dash"
                value={formData.dash}
                onChange={(e) => {
                  handleChange('dash', e.target.value);
                  handleChange('hasDash', !!e.target.value);
                }}
                className="glass-effect"
                placeholder="DASH123"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-yellow-300 font-semibold">الموقع</Label>
            <Textarea
              id="location"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              className="glass-effect"
              placeholder="أدخل الموقع أو الإحداثيات..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 pulse-glow">
              <Save className="ml-2 h-4 w-4" />
              حفظ التعديلات
            </Button>
            <Button type="button" variant="outline" onClick={handleClose} className="px-8">
              إلغاء
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTaskDialog;