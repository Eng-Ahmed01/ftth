import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

const ReportsTableFilters = ({ filters, setFilters, data }) => {
    const uniqueStatuses = [...new Set(data.map(item => item.status))].filter(Boolean);
    const uniqueAssignees = [...new Set(data.map(item => item.assignedTo).filter(Boolean))];

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({ search: '', status: '', assignee: '' });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                    placeholder="بحث عام..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="glass-effect pr-10"
                />
            </div>
            
            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger className="glass-effect">
                    <SelectValue placeholder="فلترة حسب الحالة" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    {uniqueStatuses.map(status => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            
            <Select value={filters.assignee} onValueChange={(value) => handleFilterChange('assignee', value)}>
                <SelectTrigger className="glass-effect">
                    <SelectValue placeholder="فلترة حسب المُنفذ" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">جميع المُنفذين</SelectItem>
                    {uniqueAssignees.map(assignee => (
                        <SelectItem key={assignee} value={assignee}>{assignee}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            
            <Button onClick={clearFilters} variant="outline" className="glass-effect">
                <X className="ml-2 h-4 w-4" />
                مسح الفلاتر
            </Button>
        </div>
    );
};

export default ReportsTableFilters;