import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TaskFilters from '@/components/TaskFilters';
import TaskResultsTable from '@/components/TaskResultsTable';
import TaskImporter from '@/components/TaskImporter';
import DashTasksTable from '@/components/DashTasksTable';
import ZoneManager from '@/components/ZoneManager';

const TaskCreatorView = ({ user, onUpdateTasks, currentTasks }) => {
    const [filters, setFilters] = useState({ search: '', status: '', assignee: '' });
    const [zoneData, setZoneData] = useState([]);

    useEffect(() => {
        const savedZoneData = JSON.parse(localStorage.getItem('zoneData')) || [];
        setZoneData(savedZoneData);
    }, []);

    const handleUpdateZoneData = (newZoneData) => {
        setZoneData(newZoneData);
        localStorage.setItem('zoneData', JSON.stringify(newZoneData));
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Tabs defaultValue="results" className="w-full">
                <TabsList className="grid w-full grid-cols-4 glass-effect">
                    <TabsTrigger value="results">عرض النتائج</TabsTrigger>
                    <TabsTrigger value="import">إضافة مهام</TabsTrigger>
                    <TabsTrigger value="dash">مهام الداش</TabsTrigger>
                    <TabsTrigger value="zones">إدارة المناطق</TabsTrigger>
                </TabsList>
                <TabsContent value="results" className="mt-4">
                    <TaskFilters filters={filters} setFilters={setFilters} tasks={currentTasks} />
                    <TaskResultsTable tasks={currentTasks} onUpdateTasks={onUpdateTasks} user={user} filters={filters} />
                </TabsContent>
                <TabsContent value="import" className="mt-4">
                    <TaskImporter onUpdateTasks={onUpdateTasks} currentTasks={currentTasks} zoneData={zoneData} />
                </TabsContent>
                <TabsContent value="dash" className="mt-4">
                    <DashTasksTable tasks={currentTasks} />
                </TabsContent>
                <TabsContent value="zones" className="mt-4">
                    <ZoneManager zoneData={zoneData} onUpdateZoneData={handleUpdateZoneData} />
                </TabsContent>
            </Tabs>
        </motion.div>
    );
};

export default TaskCreatorView;