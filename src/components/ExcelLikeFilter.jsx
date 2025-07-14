import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Filter, X, ChevronDown, Search, ArrowUpDown, ArrowUp, ArrowDown, SortAsc, SortDesc } from 'lucide-react';

const ExcelLikeFilter = ({ data, onFilterChange, columns }) => {
  const [columnFilters, setColumnFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRefs = useRef({});

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

  const getUniqueValues = (columnKey) => {
    const values = data.map(item => {
      const value = item[columnKey];
      return value || '(فارغ)';
    });
    
    return [...new Set(values)].sort((a, b) => {
      if (a === '(فارغ)') return 1;
      if (b === '(فارغ)') return -1;
      return a.toString().localeCompare(b.toString(), 'ar');
    });
  };

  const sortData = (data, key, direction) => {
    if (!key) return data;
    
    return [...data].sort((a, b) => {
      let aVal = a[key] || '';
      let bVal = b[key] || '';
      
      // تحديد نوع البيانات للترتيب المناسب
      if (/^\d+$/.test(aVal) && /^\d+$/.test(bVal)) {
        aVal = parseInt(aVal);
        bVal = parseInt(bVal);
      } else if (/^\d{1,2}[./-]\d{1,2}[./-]\d{2,4}/.test(aVal)) {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      } else {
        aVal = aVal.toString().toLowerCase();
        bVal = bVal.toString().toLowerCase();
      }
      
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const processedData = useMemo(() => {
    let filtered = [...data];

    // تطبيق فلاتر الأعمدة
    Object.entries(columnFilters).forEach(([columnKey, filter]) => {
      if (filter.searchText) {
        filtered = filtered.filter(item => {
          const value = item[columnKey] || '';
          return value.toString().toLowerCase().includes(filter.searchText.toLowerCase());
        });
      }

      if (filter.selectedValues && filter.selectedValues.length > 0) {
        filtered = filtered.filter(item => {
          const value = item[columnKey] || '(فارغ)';
          return filter.selectedValues.includes(value);
        });
      }
    });

    // تطبيق الترتيب
    return sortData(filtered, sortConfig.key, sortConfig.direction);
  }, [data, columnFilters, sortConfig]);

  useEffect(() => {
    onFilterChange(processedData);
  }, [processedData, onFilterChange]);

  const updateColumnFilter = (columnKey, filterUpdate) => {
    setColumnFilters(prev => ({
      ...prev,
      [columnKey]: {
        ...prev[columnKey],
        ...filterUpdate
      }
    }));
  };

  const clearColumnFilter = (columnKey) => {
    setColumnFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[columnKey];
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setColumnFilters({});
    setSortConfig({ key: null, direction: 'asc' });
    setOpenDropdown(null);
  };

  const handleSort = (columnKey) => {
    setSortConfig(prev => ({
      key: columnKey,
      direction: prev.key === columnKey && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const toggleValueSelection = (columnKey, value) => {
    const currentFilter = columnFilters[columnKey] || {};
    const selectedValues = currentFilter.selectedValues || [];
    
    const newSelectedValues = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value];

    updateColumnFilter(columnKey, { selectedValues: newSelectedValues });
  };

  const toggleSelectAll = (columnKey) => {
    const uniqueValues = getUniqueValues(columnKey);
    const currentFilter = columnFilters[columnKey] || {};
    const selectedValues = currentFilter.selectedValues || [];
    
    const newSelectedValues = selectedValues.length === uniqueValues.length ? [] : uniqueValues;
    updateColumnFilter(columnKey, { selectedValues: newSelectedValues });
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown className="w-4 h-4 text-gray-500" />;
    return sortConfig.direction === 'asc' 
      ? <SortAsc className="w-4 h-4 text-sky-400" />
      : <SortDesc className="w-4 h-4 text-sky-400" />;
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
          className={`h-8 px-2 text-xs transition-all duration-200 ${
            hasActiveFilter 
              ? 'text-sky-400 bg-sky-500/20 border border-sky-500/30' 
              : 'text-gray-400 hover:text-sky-300 hover:bg-sky-500/10'
          }`}
        >
          <Filter className="w-3 h-3 ml-1" />
          <ChevronDown className="w-3 h-3" />
        </Button>

        {isOpen && (
          <Card className="absolute top-full left-0 z-50 w-72 mt-1 glass-effect border-slate-600 shadow-2xl">
            <CardContent className="p-4 space-y-4">
              {/* البحث النصي */}
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={`بحث في ${title}...`}
                  value={searchText}
                  onChange={(e) => updateColumnFilter(columnKey, { searchText: e.target.value })}
                  className="glass-effect text-sm h-9 pr-10 border-sky-500/30 focus:border-sky-400"
                />
              </div>

              {/* تحديد الكل */}
              <div className="flex items-center space-x-2 space-x-reverse border-b border-slate-700 pb-3">
                <Checkbox
                  id={`select-all-${columnKey}`}
                  checked={selectedValues.length === uniqueValues.length && uniqueValues.length > 0}
                  onCheckedChange={() => toggleSelectAll(columnKey)}
                />
                <label htmlFor={`select-all-${columnKey}`} className="text-sm text-gray-300 cursor-pointer font-medium">
                  تحديد الكل ({uniqueValues.length})
                </label>
              </div>

              {/* قائمة القيم */}
              <div className="max-h-64 overflow-y-auto space-y-1 advanced-filter-dropdown">
                {uniqueValues.map(value => (
                  <div key={value} className="flex items-center space-x-2 space-x-reverse hover:bg-slate-800/50 p-2 rounded transition-colors">
                    <Checkbox
                      id={`${columnKey}-${value}`}
                      checked={selectedValues.includes(value)}
                      onCheckedChange={() => toggleValueSelection(columnKey, value)}
                    />
                    <label 
                      htmlFor={`${columnKey}-${value}`} 
                      className="text-sm text-gray-300 cursor-pointer flex-1 truncate"
                      title={value}
                    >
                      {value}
                    </label>
                  </div>
                ))}
              </div>

              {/* أزرار التحكم */}
              <div className="flex gap-2 pt-3 border-t border-slate-700">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => clearColumnFilter(columnKey)}
                  className="flex-1 h-8 text-xs border-red-500/30 text-red-300 hover:bg-red-500/20"
                >
                  <X className="w-3 h-3 ml-1" />
                  مسح
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setOpenDropdown(null)}
                  className="flex-1 h-8 text-xs"
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

  const activeFiltersCount = Object.keys(columnFilters).length + (sortConfig.key ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* شريط التحكم العلوي */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-lg border border-slate-600 enhanced-card">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-sky-400" />
          <span className="text-sm font-medium text-gray-300">
            فلاتر Excel الاحترافية ({activeFiltersCount} نشط)
          </span>
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
          <div className="flex gap-1 p-3 bg-slate-800/30 rounded-lg border border-slate-600">
            {columns.map(({ key, title }) => (
              <div key={key} className="flex flex-col items-center gap-2 min-w-32 p-2 bg-slate-900/50 rounded border border-slate-700">
                <span className="text-xs text-gray-300 font-medium text-center" title={title}>
                  {title}
                </span>
                
                <div className="flex items-center gap-1">
                  {/* زر الترتيب */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort(key)}
                    className="h-7 px-2 text-xs hover:bg-sky-500/20"
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
      <div className="flex items-center justify-between text-sm text-gray-400 px-3 py-2 bg-slate-800/20 rounded border border-slate-700">
        <span>عرض {processedData.length} من أصل {data.length} عنصر</span>
        {sortConfig.key && (
          <span className="text-sky-400 font-medium">
            مرتب حسب: {columns.find(c => c.key === sortConfig.key)?.title} 
            ({sortConfig.direction === 'asc' ? 'تصاعدي' : 'تنازلي'})
          </span>
        )}
      </div>
    </div>
  );
};

export default ExcelLikeFilter;