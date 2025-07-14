import React from 'react';

const TaskPriorityBadge = ({ task }) => {
  const getTaskPriority = (task) => {
    const status = task.oldFeedback?.status?.toLowerCase() || '';
    if (status.includes('no answer')) return 1;
    if (status.includes('reschedule')) return 2;
    if (status.includes('fat issue')) return 3;
    return 4;
  };

  const priority = getTaskPriority(task);
  const badges = {
    1: { text: 'عاجل - عدم رد', color: 'bg-red-500' },
    2: { text: 'متوسط - إعادة جدولة', color: 'bg-yellow-500' },
    3: { text: 'منخفض - مشكلة فات', color: 'bg-blue-500' },
    4: { text: 'عادي', color: 'bg-gray-500' }
  };
  
  const badge = badges[priority];
  return (
    <span className={`inline-block px-2 py-1 text-xs rounded-full text-white ${badge.color} mb-2`}>
      {badge.text}
    </span>
  );
};

export default TaskPriorityBadge;