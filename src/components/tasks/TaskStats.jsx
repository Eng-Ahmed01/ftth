import React from 'react';

const TaskStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
      <div className="text-center p-3 bg-slate-800/50 rounded-lg border border-slate-600">
        <div className="text-2xl font-bold text-cyan-400">{stats.total}</div>
        <div className="text-xs text-gray-400">إجمالي المهام</div>
      </div>
      <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
        <div className="text-2xl font-bold text-blue-400">{stats.new}</div>
        <div className="text-xs text-gray-400">جديدة</div>
      </div>
      <div className="text-center p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
        <div className="text-2xl font-bold text-yellow-400">{stats.inProgress}</div>
        <div className="text-xs text-gray-400">قيد التنفيذ</div>
      </div>
      <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/30">
        <div className="text-2xl font-bold text-green-400">{stats.done}</div>
        <div className="text-xs text-gray-400">منجزة</div>
      </div>
      <div className="text-center p-3 bg-red-500/10 rounded-lg border border-red-500/30">
        <div className="text-2xl font-bold text-red-400">{stats.urgent}</div>
        <div className="text-xs text-gray-400">عاجلة</div>
      </div>
      <div className="text-center p-3 bg-orange-500/10 rounded-lg border border-orange-500/30">
        <div className="text-2xl font-bold text-orange-400">{stats.reschedule}</div>
        <div className="text-xs text-gray-400">إعادة جدولة</div>
      </div>
    </div>
  );
};

export default TaskStats;