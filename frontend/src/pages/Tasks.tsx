import { useState, useEffect } from 'react';
import { format, addDays, subDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Upload, Trash2, Edit2, CheckCircle, Circle, CheckSquare } from 'lucide-react';
import api from '../lib/api';
import { ExcelUploadModal } from '../components/Tasks/ExcelUploadModal';

export const Tasks = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    const fetchTasks = async (date: Date) => {
        try {
            setLoading(true);
            const dateStr = date.toISOString().split('T')[0];
            const res = await api.get(`/tasks?date=${dateStr}`);
            setTasks(res.data);
        } catch (error) {
            console.error('Failed to fetch tasks', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks(currentDate);
    }, [currentDate]);

    const toggleTaskCompletion = async (task: any) => {
        try {
            const updated = { ...task, completed: !task.completed };
            setTasks(tasks.map(t => t._id === task._id ? updated : t));
            await api.put(`/tasks/${task._id}`, { completed: !task.completed });
        } catch (error) {
            console.error('Failed to update task', error);
            // Revert optimism on error
            setTasks(tasks);
        }
    };

    const deleteTask = async (id: string) => {
        if (!confirm('Are you sure you want to delete this task?')) return;
        try {
            await api.delete(`/tasks/${id}`);
            setTasks(tasks.filter(t => t._id !== id));
        } catch (error) {
            console.error('Failed to delete task', error);
        }
    };

    const nextDay = () => setCurrentDate(addDays(currentDate, 1));
    const prevDay = () => setCurrentDate(subDays(currentDate, 1));
    const today = () => setCurrentDate(new Date());

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">Daily Plan</h1>
                    <p className="text-[var(--foreground)] opacity-70 mt-1">Manage your CAT study schedule</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 border border-[var(--border)] bg-[var(--card)] rounded-lg text-sm font-medium hover:bg-[var(--border)] transition-colors"
                    >
                        <Upload className="h-4 w-4" />
                        <span className="hidden sm:inline">Import Excel</span>
                    </button>
                    <button
                        // We'll add a modal for this later, simple alert for now
                        onClick={() => alert('Add Task form placeholder')}
                        className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary-600)] text-white rounded-lg text-sm font-medium hover:bg-[var(--color-primary-700)] transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Add Task</span>
                    </button>
                </div>
            </div>

            <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-[var(--border)] bg-[#f8fafc] dark:bg-[#1e293b]/50 flex justify-between items-center">
                    <button onClick={prevDay} className="p-2 hover:bg-[var(--border)] rounded-full transition-colors"><ChevronLeft className="h-5 w-5" /></button>
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-bold">{format(currentDate, 'EEEE, MMMM d, yyyy')}</h2>
                        {format(currentDate, 'yyyy-MM-dd') !== format(new Date(), 'yyyy-MM-dd') && (
                            <button onClick={today} className="text-xs font-medium text-[var(--color-primary-600)] hover:underline">Go to Today</button>
                        )}
                    </div>
                    <button onClick={nextDay} className="p-2 hover:bg-[var(--border)] rounded-full transition-colors"><ChevronRight className="h-5 w-5" /></button>
                </div>

                <div className="p-0">
                    {loading ? (
                        <div className="p-8 text-center text-[var(--foreground)] opacity-50">Loading tasks...</div>
                    ) : tasks.length === 0 ? (
                        <div className="p-12 text-center flex flex-col items-center justify-center">
                            <div className="h-16 w-16 bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)] rounded-full flex items-center justify-center mb-4">
                                <CheckSquare className="h-8 w-8 text-[var(--color-primary-500)] opacity-50" />
                            </div>
                            <h3 className="text-lg font-medium mb-1">No tasks planned</h3>
                            <p className="opacity-60 text-sm max-w-sm">You haven't planned any study tasks for this date. Add a task or import your full schedule from Excel.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-[var(--border)]">
                            {tasks.map(task => (
                                <div key={task._id} className={`p-4 flex items-start gap-4 transition-colors hover:bg-[var(--background)] ${task.completed ? 'bg-[var(--background)]/50' : ''}`}>
                                    <button
                                        onClick={() => toggleTaskCompletion(task)}
                                        className="mt-1 shrink-0 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)] rounded-full"
                                    >
                                        {task.completed ? (
                                            <CheckCircle className="h-6 w-6 text-green-500" />
                                        ) : (
                                            <Circle className="h-6 w-6 text-gray-300 dark:text-gray-600 hover:text-[var(--color-primary-400)] transition-colors" />
                                        )}
                                    </button>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${task.section === 'QA' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' :
                                                task.section === 'VARC' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300' :
                                                    task.section === 'DILR' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300' :
                                                        task.section === 'Mock' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' :
                                                            'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                                                }`}>
                                                {task.section}
                                            </span>
                                            <span className={`text-sm font-semibold truncate ${task.completed ? 'opacity-50 line-through' : ''}`}>
                                                {task.topic}
                                            </span>
                                        </div>
                                        <p className={`text-sm mt-1 mb-2 ${task.completed ? 'opacity-50' : 'opacity-80'}`}>
                                            {task.description}
                                        </p>
                                        <div className="flex items-center text-xs font-medium opacity-60">
                                            <span className="bg-[var(--border)] px-2 py-1 rounded">~ {task.estimatedTime} mins</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity md:opacity-100">
                                        <button onClick={() => alert('Edit task placeholder')} className="p-2 text-gray-500 hover:text-[var(--color-primary-600)] hover:bg-[var(--color-primary-50)] dark:hover:bg-[var(--color-primary-900)] rounded-md transition-colors">
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => deleteTask(task._id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <ExcelUploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onUploadSuccess={() => {
                    setIsUploadModalOpen(false);
                    fetchTasks(currentDate);
                }}
            />
        </div>
    );
};
