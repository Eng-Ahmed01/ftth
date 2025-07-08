import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, MapPin } from 'lucide-react';

const isCoordinates = (location) => location && /^\d{1,2}\.\d+,\s*\d{1,2}\.\d+$/.test(location);

const ReportsTableContent = ({ data, onEdit, onDelete, isAdmin }) => {
    if (data.length === 0) {
        return (
            <div className="text-center py-8 text-gray-400">
                لا توجد بيانات متاحة
            </div>
        );
    }
    
    return (
        <div className="overflow-x-auto table-container">
            <table className="w-full border-collapse">
                <thead className="bg-slate-800/50 sticky top-0 z-10">
                    <tr>
                        {['النوع', 'Ticket ID', 'الاسم', 'الهاتف', 'الموقع', 'الحالة', 'المُنفذ', 'ملاحظات', 'الإجراءات'].map(title => (
                            <th key={title} className="border-b border-slate-600 px-3 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                                {title}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                    {data.map((item, index) => (
                        <tr key={`${item.type}-${item.id}-${index}`} className="hover:bg-slate-800/30 transition-colors duration-200">
                            <td className="px-3 py-3 text-xs whitespace-nowrap">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    item.type === 'task' ? 'bg-blue-500/20 text-blue-300' : 'bg-green-500/20 text-green-300'
                                }`}>
                                    {item.type === 'task' ? 'مهمة' : 'تقرير'}
                                </span>
                            </td>
                            <td className="px-3 py-3 text-xs text-gray-200 font-mono whitespace-nowrap">{item.ticketId}</td>
                            <td className="px-3 py-3 text-xs text-gray-200 whitespace-nowrap">{item.name || '-'}</td>
                            <td className="px-3 py-3 text-xs text-gray-200 font-mono whitespace-nowrap">{item.phone || '-'}</td>
                            <td className="px-3 py-3 text-xs text-gray-200 whitespace-nowrap">
                                {isCoordinates(item.location) ? (
                                    <a href={`https://www.google.com/maps?q=${item.location}`} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 transition-colors">
                                        <MapPin className="w-3 h-3" />
                                        إحداثيات
                                    </a>
                                ) : (item.location || '-')}
                            </td>
                            <td className="px-3 py-3 text-xs whitespace-nowrap">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    item.status === 'Done' ? 'bg-green-500/20 text-green-300' :
                                    item.status === 'In Progress' ? 'bg-yellow-500/20 text-yellow-300' :
                                    item.status === 'New' ? 'bg-blue-500/20 text-blue-300' :
                                    'bg-gray-500/20 text-gray-300'
                                }`}>
                                    {item.status}
                                </span>
                            </td>
                            <td className="px-3 py-3 text-xs text-gray-200 font-medium whitespace-nowrap">{item.assignedTo || '-'}</td>
                            <td className="px-3 py-3 text-xs text-gray-300 max-w-xs truncate" title={item.feedback}>{item.feedback || '-'}</td>
                            <td className="px-3 py-3 text-xs whitespace-nowrap">
                                {isAdmin && (
                                    <div className="flex gap-1">
                                        <Button size="sm" variant="ghost" onClick={() => onEdit(item)} className="text-yellow-400 hover:text-yellow-300 p-1 h-6 w-6">
                                            <Edit className="h-3 w-3" />
                                        </Button>
                                        <Button size="sm" variant="ghost" onClick={() => onDelete(item)} className="text-red-400 hover:text-red-300 p-1 h-6 w-6">
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ReportsTableContent;