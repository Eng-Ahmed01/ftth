import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, Search, X } from 'lucide-react';

const TaskFilters = ({ filters, setFilters, tasks }) => {
    const uniqueStatuses = [...new Set(tasks.map(t => t.status))].filter(Boolean);
    const uniqueAssignees = [...new Set(tasks.map(t => t.assignedTo).filter(Boolean))];

    const clearFilters = () => {
        setFilters({ search: '', status: '', assignee: '' });
    };

    return (
        <Card className="glass-effect border-purple-500/20 mb-4">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Filter className="w-5 h-5" />
                    فلاتر البحث المتقدمة
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="بحث عام..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            className="glass-effect pl-10"
                        />
                    </div>
                    
                    <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
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
                    
                    <Select value={filters.assignee} onValueChange={(value) => setFilters({ ...filters, assignee: value })}>
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
            </CardContent>
        </Card>
    );
};

export default TaskFilters;