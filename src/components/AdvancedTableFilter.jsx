import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Filter, X, ChevronDown, Search } from 'lucide-react';

const AdvancedTableFilter = ({ data, onFilterChange, columns }) => {
  const [columnFilters, setColumnFilters] = useState({});
  const [openDropdown, setOpenDropdown] = useState(null);
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

  // الحصول على القيم الفريدة لكل عمود
  const getUniqueValues = (columnKey) => {
    const values = data.map(item => {
      const value = item[columnKey];
      return value || '-';
    }).filter(Boolean);
    
    return [...new Set(values)].sort();
  };

  // تطبيق الفلاتر على البيانات
  const filteredData = useMemo(() => {
    let filtered = [...data];

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
    });

    return filtered;
  }, [data, columnFilters]);

  // إرسال البيانات المفلترة للمكون الأب
  useEffect(() => {
    onFilterChange(filteredData);
  }, [filteredData, onFilterChange]);

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
    setOpenDropdown(null);
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

  const FilterDropdown = ({ columnKey, title }) => {
    const uniqueValues = getUniqueValues(columnKey);
    const currentFilter = columnFilters[columnKey] || {};
    const selectedValues = currentFilter.selectedValues || [];
    const searchText = currentFilter.searchText || '';
    const isOpen = openDropdown === columnKey;
    const hasActiveFilter = searchText || selectedValues.length > 0;

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
          <Card className="absolute top-full left-0 z-50 w-64 mt-1 glass-effect border-slate-600">
            <CardContent className="p-3 space-y-3">
              {/* مربع البحث */}
              <div className="relative">
                <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                <Input
                  placeholder={`بحث في ${title}...`}
                  value={searchText}
                  onChange={(e) => updateColumnFilter(columnKey, { searchText: e.target.value })}
                  className="glass-effect text-xs h-8 pr-8"
                />
              </div>

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
              <div className="max-h-48 overflow-y-auto space-y-1">
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

  const activeFiltersCount = Object.keys(columnFilters).length;

  return (
    <div className="space-y-2">
      {/* شريط الفلاتر العلوي */}
      <div className="flex items-center justify-between p-2 bg-slate-800/30 rounded-lg">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-sky-400" />
          <span className="text-sm text-gray-300">
            فلاتر متقدمة ({activeFiltersCount} نشط)
          </span>
        </div>
        {activeFiltersCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            className="h-7 text-xs"
          >
            <X className="w-3 h-3 ml-1" />
            مسح جميع الفلاتر
          </Button>
        )}
      </div>

      {/* صف الفلاتر */}
      <div className="overflow-x-auto">
        <div className="min-w-full">
          <div className="grid grid-cols-15 gap-1 p-2 bg-slate-800/50 rounded-lg border border-slate-600">
            {columns.map(({ key, title }) => (
              <div key={key} className="flex items-center justify-between min-w-0">
                <span className="text-xs text-gray-300 truncate flex-1" title={title}>
                  {title}
                </span>
                <FilterDropdown columnKey={key} title={title} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* عداد النتائج */}
      <div className="text-xs text-gray-400 px-2">
        عرض {filteredData.length} من أصل {data.length} عنصر
      </div>
    </div>
  );
};

export default AdvancedTableFilter;