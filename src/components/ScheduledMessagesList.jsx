import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Trash2, Send, User, Users } from 'lucide-react';

const ScheduledMessagesList = ({ scheduledMessages, onCancelSchedule }) => {
  const formatDateTime = (isoString) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <Card className="mt-8 glass-effect border-amber-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl gradient-text font-bold">
          <Clock className="w-7 h-7 text-amber-400" />
          الرسائل المجدولة
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2">
          {scheduledMessages.length > 0 ? (
            <AnimatePresence>
              {scheduledMessages.map(msg => (
                <motion.div
                  key={msg.id}
                  layout
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20, transition: { duration: 0.2 } }}
                  className="p-4 rounded-lg bg-slate-800/50 flex justify-between items-start"
                >
                  <div className="flex-1">
                    <p className="font-bold text-amber-300">{msg.title}</p>
                    <p className="text-sm text-gray-300 mt-1 whitespace-pre-wrap">{msg.details}</p>
                    <div className="text-xs text-gray-400 mt-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <span className="flex items-center gap-2">
                        <Send className="w-3 h-3" />
                        إلى: {msg.contact.name} {msg.contact.type === 'group' ? <Users className="w-3 h-3 inline"/> : <User className="w-3 h-3 inline"/>}
                      </span>
                      <span className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        الوقت: {formatDateTime(msg.scheduleTime)}
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => onCancelSchedule(msg.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <p className="text-center text-gray-500 py-8">لا توجد رسائل مجدولة حالياً.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ScheduledMessagesList;