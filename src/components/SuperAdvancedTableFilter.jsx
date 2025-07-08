import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, X, ChevronDown, Search, ArrowUpDown, ArrowUp, ArrowDown, Calendar, Hash, Type, MapPin } from 'lucide-react';

const SuperAdvancedTableFilter = ({ data, onFilterChange, columns }) => {
  const [columnFilters, setColumnFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [openDropdown, setOpenDropdown] = useState(null);
  const [globalSearch, setGlobalSearch] = useState('');
  const dropdownRefs = useRef({});

  // إغلاق القوائم المنسدلة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && dropdownRefs.current[openDropdown] && 
          !dropdownRefs.current[openDropdown].contains(event.target)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  // تحديد نوع البيانات في العمود
  const getColumnDataType = (columnKey) => {
    const sampleValues = data.slice(0, 10).map(item => item[columnKey]).filter(Boolean);
    
    if (sampleValues.every(val => /^\d+$/.test(val))) return 'number';
    if (sampleValues.every(val => /^\d{1,2}[./-]\d{1,2}[./-]\d{2,4}/.test(val))) return 'date';
    if (sampleValues.every(val => /^\d{1,2}\.\d+,\s*\d{1,2}\.\d+$/.test(val))) return 'coordinates';
    if (sampleValues.every(val => /^0?7[7-9]\d{8}$/.test(val))) return 'phone';
    return 'text';
  };

  // الحصول على القيم الفريدة لكل عمود مع الترتيب الذكي
  const getUniqueValues = (columnKey) => {
    const values = data.map(item => {
      const value = item[columnKey];
      return value || '-';
    }).filter(Boolean);
    
    const uniqueValues = [...new Set(values)];
    const dataType = getColumnDataType(columnKey);
    
    switch (dataType) {
      case 'number':
        return uniqueValues.sort((a, b) => parseInt(a) - parseInt(b));
      case 'date':
        return uniqueValues.sort((a, b) => new Date(a) - new Date(b));
      default:
        return uniqueValues.sort();
    }
  };

  // ترتيب البيانات
  const sortData = (data, key, direction) => {
    if (!key) return data;
    
    const dataType = getColumnDataType(key);
    
    return [...data].sort((a, b) => {
      let aVal = a[key] || '';
      let bVal = b[key] || '';
      
      switch (dataType) {
        case 'number':
          aVal = parseInt(aVal) || 0;
          bVal = parseInt(bVal) || 0;
          break;
        case 'date':
          aVal = new Date(aVal);
          bVal = new Date(bVal);
          break;
        default:
          aVal = aVal.toString().toLowerCase();
          bVal = bVal.toString().toLowerCase();
      }
      
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // تطبيق الفلاتر والترتيب على البيانات
  const processedData = useMemo(() => {
    let filtered = [...data];

    // البحث العام
    if (globalSearch) {
      filtered = filtered.filter(item => 
        Object.values(item).some(value => 
          value && value.toString().toLowerCase().includes(globalSearch.toLowerCase())
        )
      );
    }

    // فلاتر الأعمدة
    Object.entries(columnFilters).forEach(([columnKey, filter]) => {
      if (filter.searchText) {
        filtered = filtered.filter(item => {
          const value = item[columnKey] || '';
          return value.toString().toLowerCase().includes(filter.searchText.toLowerCase());
        });
      }

      if (filter.selectedValues && filter.selectedValues.length > 0) {
        filtered = filtered.filter(item => {
          const value = item[columnKey] || '-';
          return filter.selectedValues.includes(value);
        });
      }

      if (filter.rangeFilter) {
        const { min, max } = filter.rangeFilter;
        filtered = filtered.filter(item => {
          const value = parseInt(item[columnKey]) || 0;
          return (!min || value >= min) && (!max || value <= max);
        });
      }

      if (filter.dateRange) {
        const { start, end } = filter.dateRange;
        filtered = filtered.filter(item => {
          const value = new Date(item[columnKey]);
          return (!start || value >= new Date(start)) && (!end || value <= new Date(end));
        });
      }
    });

    // الترتيب
    return sortData(filtered, sortConfig.key, sortConfig.direction);
  }, [data, columnFilters, sortConfig, globalSearch]);

  // إرسال البيانات المعالجة للمكون الأب
  useEffect(() => {
    onFilterChange(processedData);
  }, [processedData, onFilterChange]);

  // تحديث فلتر العمود
  const updateColumnFilter = (columnKey, filterUpdate) => {
    setColumnFilters(prev => ({
      ...prev,
      [columnKey]: {
        ...prev[columnKey],
        ...filterUpdate
      }
    }));
  };

  // مسح فلتر عمود محدد
  const clearColumnFilter = (columnKey) => {
    setColumnFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[columnKey];
      return newFilters;
    });
  };

  // مسح جميع الفلاتر
  const clearAllFilters = () => {
    setColumnFilters({});
    setSortConfig({ key: null, direction: 'asc' });
    setGlobalSearch('');
    setOpenDropdown(null);
  };

  // تبديل الترتيب
  const handleSort = (columnKey) => {
    setSortConfig(prev => ({
      key: columnKey,
      direction: prev.key === columnKey && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // تبديل تحديد قيمة في الفلتر
  const toggleValueSelection = (columnKey, value) => {
    const currentFilter = columnFilters[columnKey] || {};
    const selectedValues = currentFilter.selectedValues || [];
    
    const newSelectedValues = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value];

    updateColumnFilter(columnKey, { selectedValues: newSelectedValues });
  };

  // تحديد/إلغاء تحديد جميع القيم
  const toggleSelectAll = (columnKey) => {
    const uniqueValues = getUniqueValues(columnKey);
    const currentFilter = columnFilters[columnKey] || {};
    const selectedValues = currentFilter.selectedValues || [];
    
    const newSelectedValues = selectedValues.length === uniqueValues.length ? [] : uniqueValues;
    updateColumnFilter(columnKey, { selectedValues: newSelectedValues });
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown className="w-3 h-3 text-gray-500" />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="w-3 h-3 text-sky-400" />
      : <ArrowDown className="w-3 h-3 text-sky-400" />;
  };

  const getColumnIcon = (columnKey) => {
    const dataType = getColumnDataType(columnKey);
    switch (dataType) {
      case 'number': return <Hash className="w-3 h-3" />;
      case 'date': return <Calendar className="w-3 h-3" />;
      case 'coordinates': return <MapPin className="w-3 h-3" />;
      case 'phone': return <Hash className="w-3 h-3" />;
      default: return <Type className="w-3 h-3" />;
    }
  };

  const FilterDropdown = ({ columnKey, title }) => {
    const uniqueValues = getUniqueValues(columnKey);
    const currentFilter = columnFilters[columnKey] || {};
    const selectedValues = currentFilter.selectedValues || [];
    const searchText = currentFilter.searchText || '';
    const isOpen = openDropdown === columnKey;
    const hasActiveFilter = searchText || selectedValues.length > 0 || currentFilter.rangeFilter || currentFilter.dateRange;
    const dataType = getColumnDataType(columnKey);

    return (
      <div className="relative" ref={el => dropdownRefs.current[columnKey] = el}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setOpenDropdown(isOpen ? null : columnKey)}
          className={`h-8 px-2 text-xs ${hasActiveFilter ? 'text-sky-400 bg-sky-500/20' : 'text-gray-400'}`}
        >
          <Filter className="w-3 h-3 ml-1" />
          <ChevronDown className="w-3 h-3" />
        </Button>

        {isOpen && (
          <Card className="absolute top-full left-0 z-50 w-80 mt-1 glass-effect border-slate-600">
            <CardContent className="p-4 space-y-4">
              {/* البحث النصي */}
              <div className="relative">
                <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                <Input
                  placeholder={`بحث في ${title}...`}
                  value={searchText}
                  onChange={(e) => updateColumnFilter(columnKey, { searchText: e.target.value })}
                  className="glass-effect text-xs h-8 pr-8"
                />
              </div>

              {/* فلاتر خاصة حسب نوع البيانات */}
              {dataType === 'number' && (
                <div className="space-y-2">
                  <label className="text-xs text-gray-300">نطاق رقمي:</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="من"
                      value={currentFilter.rangeFilter?.min || ''}
                      onChange={(e) => updateColumnFilter(columnKey, { 
                        rangeFilter: { ...currentFilter.rangeFilter, min: parseInt(e.target.value) || null }
                      })}
                      className="glass-effect text-xs h-8"
                    />
                    <Input
                      type="number"
                      placeholder="إلى"
                      value={currentFilter.rangeFilter?.max || ''}
                      onChange={(e) => updateColumnFilter(columnKey, { 
                        rangeFilter: { ...currentFilter.rangeFilter, max: parseInt(e.target.value) || null }
                      })}
                      className="glass-effect text-xs h-8"
                    />
                  </div>
                </div>
              )}

              {dataType === 'date' && (
                <div className="space-y-2">
                  <label className="text-xs text-gray-300">نطاق تاريخي:</label>
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      value={currentFilter.dateRange?.start || ''}
                      onChange={(e) => updateColumnFilter(columnKey, { 
                        dateRange: { ...currentFilter.dateRange, start: e.target.value }
                      })}
                      className="glass-effect text-xs h-8"
                    />
                    <Input
                      type="date"
                      value={currentFilter.dateRange?.end || ''}
                      onChange={(e) => updateColumnFilter(columnKey, { 
                        dateRange: { ...currentFilter.dateRange, end: e.target.value }
                      })}
                      className="glass-effect text-xs h-8"
                    />
                  </div>
                </div>
              )}

              {/* تحديد الكل */}
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id={`select-all-${columnKey}`}
                  checked={selectedValues.length === uniqueValues.length && uniqueValues.length > 0}
                  onCheckedChange={() => toggleSelectAll(columnKey)}
                />
                <label htmlFor={`select-all-${columnKey}`} className="text-xs text-gray-300 cursor-pointer">
                  تحديد الكل ({uniqueValues.length})
                </label>
              </div>

              {/* قائمة القيم */}
              <div className="max-h-48 overflow-y-auto space-y-1 advanced-filter-dropdown">
                {uniqueValues.map(value => (
                  <div key={value} className="flex items-center space-x-2 space-x-reverse hover:bg-slate-800/50 p-1 rounded">
                    <Checkbox
                      id={`${columnKey}-${value}`}
                      checked={selectedValues.includes(value)}
                      onCheckedChange={() => toggleValueSelection(columnKey, value)}
                    />
                    <label 
                      htmlFor={`${columnKey}-${value}`} 
                      className="text-xs text-gray-300 cursor-pointer flex-1 truncate"
                      title={value}
                    >
                      {value}
                    </label>
                  </div>
                ))}
              </div>

              {/* أزرار التحكم */}
              <div className="flex gap-2 pt-2 border-t border-slate-700">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => clearColumnFilter(columnKey)}
                  className="flex-1 h-7 text-xs"
                >
                  <X className="w-3 h-3 ml-1" />
                  مسح
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setOpenDropdown(null)}
                  className="flex-1 h-7 text-xs"
                >
                  إغلاق
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const activeFiltersCount = Object.keys(columnFilters).length + (globalSearch ? 1 : 0) + (sortConfig.key ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* شريط التحكم العلوي */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-lg border border-slate-600">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-sky-400" />
            <span className="text-sm font-medium text-gray-300">
              فلاتر فائقة التطور ({activeFiltersCount} نشط)
            </span>
          </div>
          
          {/* البحث العام */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="بحث عام في جميع الأعمدة..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="glass-effect w-64 pr-10"
            />
          </div>
        </div>
        
        {activeFiltersCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            className="h-8 text-xs bg-red-500/10 border-red-500/30 text-red-300 hover:bg-red-500/20"
          >
            <X className="w-3 h-3 ml-1" />
            مسح جميع الفلاتر والترتيب
          </Button>
        )}
      </div>

      {/* صف الفلاتر والترتيب */}
      <div className="overflow-x-auto">
        <div className="min-w-full">
          <div className="grid grid-cols-15 gap-1 p-3 bg-slate-800/30 rounded-lg border border-slate-600">
            {columns.map(({ key, title }) => (
              <div key={key} className="flex flex-col items-center gap-1 min-w-0">
                <div className="flex items-center gap-1 w-full">
                  {getColumnIcon(key)}
                  <span className="text-xs text-gray-300 truncate flex-1" title={title}>
                    {title}
                  </span>
                </div>
                
                <div className="flex items-center gap-1">
                  {/* زر الترتيب */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort(key)}
                    className="h-6 px-1 text-xs"
                    title={`ترتيب ${title}`}
                  >
                    {getSortIcon(key)}
                  </Button>
                  
                  {/* زر الفلترة */}
                  <FilterDropdown columnKey={key} title={title} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* إحصائيات النتائج */}
      <div className="flex items-center justify-between text-xs text-gray-400 px-2 py-1 bg-slate-800/20 rounded">
        <span>عرض {processedData.length} من أصل {data.length} عنصر</span>
        {sortConfig.key && (
          <span className="text-sky-400">
            مرتب حسب: {columns.find(c => c.key === sortConfig.key)?.title} 
            ({sortConfig.direction === 'asc' ? 'تصاعدي' : 'تنازلي'})
          </span>
        )}
      </div>
    </div>
  );
};

export default SuperAdvancedTableFilter;