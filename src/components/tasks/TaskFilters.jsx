import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

const TaskFilters = ({ 
  searchTerm, 
  setSearchTerm, 
  statusFilter, 
  setStatusFilter, 
  priorityFilter, 
  setPriorityFilter 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="relative">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="البحث في المهام..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="glass-effect pr-10"
        />
      </div>

      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="glass-effect">
          <SelectValue placeholder="فلترة حسب الحالة" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">جميع الحالات</SelectItem>
          <SelectItem value="New">جديدة</SelectItem>
          <SelectItem value="In Progress">قيد التنفيذ</SelectItem>
          <SelectItem value="Done">منجزة</SelectItem>
          <SelectItem value="Cancelled">ملغية</SelectItem>
          <SelectItem value="Reschedule">إعادة جدولة</SelectItem>
          <SelectItem value="No Answer">عدم رد</SelectItem>
        </SelectContent>
      </Select>

      <Select value={priorityFilter} onValueChange={setPriorityFilter}>
        <SelectTrigger className="glass-effect">
          <SelectValue placeholder="فلترة حسب الأولوية" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">جميع الأولويات</SelectItem>
          <SelectItem value="urgent">عاجل</SelectItem>
          <SelectItem value="medium">متوسط</SelectItem>
          <SelectItem value="low">منخفض</SelectItem>
          <SelectItem value="normal">عادي</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default TaskFilters;