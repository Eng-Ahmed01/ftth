import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Hash, Phone, MapPin, MessageSquare, Check, Edit, User as UserIcon, Router } from 'lucide-react';

const TaskCard = ({ task, onAccept, onUpdate }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const isCoordinates = (location) => location && /^\d{1,2}\.\d+,\s*\d{1,2}\.\d+$/.test(location);
  const latestFeedback = task.feedbackHistory && task.feedbackHistory.length > 0 ? task.feedbackHistory[task.feedbackHistory.length - 1] : null;

  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible" exit="hidden" layout>
      <Card className="glass-effect border-purple-500/20 flex flex-col h-full">
        <CardHeader>
          <CardTitle className="text-purple-300 flex items-center gap-2">
            <UserIcon className="w-5 h-5" /> {task.name || 'مهمة بدون اسم'}
          </CardTitle>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400 pt-1 flex items-center gap-2">
              <Hash className="w-3 h-3" /> {task.ticketId}
            </p>
            {task.dash && (
              <p className="text-xs text-orange-400 pt-1 flex items-center gap-2">
                <Router className="w-3 h-3" /> {task.dash}
              </p>
            )}
          </div>
        </CardHeader>
        <CardContent className="text-sm space-y-3 flex-grow">
          {task.phone && <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /> {task.phone}</p>}
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            {isCoordinates(task.location) ? (
              <a href={`https://www.google.com/maps?q=${task.location}`} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                {task.location}
              </a>
            ) : (
              <span>{task.location || task.zone}</span>
            )}
          </div>
          {task.oldFeedback && (
            <div className="p-2 bg-slate-800/50 rounded-md">
              <p className="font-semibold text-yellow-300 text-xs mb-1">الفيدباك القديم:</p>
              <p className="flex items-start gap-2">
                <MessageSquare className="w-4 h-4 text-yellow-400 mt-0.5" />
                <span>
                  <strong>{task.oldFeedback.status}:</strong> {task.oldFeedback.note}
                </span>
              </p>
            </div>
          )}
           {latestFeedback && (
            <div className="p-2 bg-slate-800/50 rounded-md mt-2">
              <p className="font-semibold text-green-300 text-xs mb-1">آخر تحديث:</p>
              <p className="flex items-start gap-2">
                <MessageSquare className="w-4 h-4 text-green-400 mt-0.5" />
                <span>
                  <strong>{latestFeedback.status}:</strong> {latestFeedback.note}
                </span>
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          {onAccept && (
            <Button onClick={() => onAccept(task.ticketId)} className="w-full bg-gradient-to-r from-green-500 to-teal-500">
              <Check className="ml-2 h-4 w-4" />
              قبول المهمة
            </Button>
          )}
          {onUpdate && (
            <Button onClick={() => onUpdate(task)} className="w-full bg-gradient-to-r from-yellow-500 to-orange-500">
              <Edit className="ml-2 h-4 w-4" />
              تحديث الحالة
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default TaskCard;