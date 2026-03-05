import { useEffect, useState } from 'react';
import { StatCard } from '../components/Dashboard/StatCard';
import { Calendar, Target, Flame, TrendingUp, CheckCircle, Clock, Timer, BookOpen, CalendarOff } from 'lucide-react';
import { differenceInDays } from 'date-fns';
import api from '../lib/api';
import { Link } from 'react-router-dom';
import { LeaveModal } from '../components/Dashboard/LeaveModal';

export const Dashboard = () => {
    const [stats, setStats] = useState({
        todayTasks: 0,
        completedTasks: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalStudyDays: 0,
    });
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

    const CAT_DATE = new Date('2026-11-29');
    const daysRemaining = differenceInDays(CAT_DATE, new Date());

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const todayStr = new Date().toISOString().split('T')[0];
                const [tasksRes, streakRes] = await Promise.all([
                    api.get(`/tasks?date=${todayStr}`),
                    api.get('/streaks')
                ]);

                const todayTasksList = tasksRes.data;
                const completed = todayTasksList.filter((t: any) => t.completed).length;

                setTasks(todayTasksList);
                setStats({
                    todayTasks: todayTasksList.length,
                    completedTasks: completed,
                    currentStreak: streakRes.data?.currentStreak || 0,
                    longestStreak: streakRes.data?.longestStreak || 0,
                    totalStudyDays: streakRes.data?.totalStudyDays || 0,
                });
            } catch (error) {
                console.error('Failed to fetch dashboard data', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) {
        return <div className="flex h-64 items-center justify-center">Loading dashboard...</div>;
    }

    const progress = stats.todayTasks > 0 ? (stats.completedTasks / stats.todayTasks) * 100 : 0;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">Dashboard</h1>
                    <p className="text-[var(--foreground)] opacity-70 mt-1">Overview of your CAT preparation</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsLeaveModalOpen(true)}
                        className="bg-[var(--card)] px-3 py-2 rounded-lg border border-[var(--border)] flex items-center hover:bg-[var(--border)] transition-colors"
                    >
                        <CalendarOff className="h-5 w-5 text-amber-500 mr-2" />
                        <span className="font-semibold text-sm">Mark Leave</span>
                    </button>
                    <div className="bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)] px-4 py-2 rounded-lg border border-[var(--color-primary-100)] dark:border-[var(--color-primary-800)] flex items-center">
                        <Calendar className="h-5 w-5 text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)] mr-2" />
                        <span className="font-semibold text-[var(--color-primary-700)] dark:text-[var(--color-primary-300)]">
                            {daysRemaining} Days to CAT
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Today's Progress"
                    value={`${stats.completedTasks}/${stats.todayTasks}`}
                    subtitle="Tasks completed"
                    icon={<Target className="h-6 w-6 text-[var(--color-primary-600)]" />}
                />
                <StatCard
                    title="Current Streak"
                    value={stats.currentStreak}
                    subtitle="Days"
                    icon={<Flame className="h-6 w-6 text-orange-500" />}
                />
                <StatCard
                    title="Longest Streak"
                    value={stats.longestStreak}
                    subtitle="Days"
                    icon={<TrendingUp className="h-6 w-6 text-emerald-500" />}
                />
                <StatCard
                    title="Total Study Days"
                    value={stats.totalStudyDays}
                    icon={<Clock className="h-6 w-6 text-blue-500" />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">Today's Tasks</h2>
                        <Link to="/tasks" className="text-sm text-[var(--color-primary-600)] hover:underline font-medium">View All</Link>
                    </div>

                    <div className="mb-6">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="font-medium text-[var(--foreground)] opacity-70">Progress</span>
                            <span className="font-bold">{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-[var(--border)] rounded-full h-2.5 overflow-hidden">
                            <div
                                className="bg-[var(--color-primary-500)] h-2.5 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {tasks.length === 0 ? (
                            <p className="text-center py-8 text-[var(--foreground)] opacity-50">No tasks for today. Check your schedule!</p>
                        ) : (
                            tasks.map(task => (
                                <div key={task._id} className="flex items-center justify-between p-3 sm:p-4 rounded-lg border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--border)]/30 transition-colors">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1">
                                            {task.completed ? (
                                                <CheckCircle className="h-5 w-5 text-green-500" />
                                            ) : (
                                                <div className="h-5 w-5 rounded-full border-2 border-gray-300 dark:border-gray-600"></div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[var(--color-primary-100)] text-[var(--color-primary-800)] dark:bg-[var(--color-primary-900)] dark:text-[var(--color-primary-200)]">
                                                    {task.section}
                                                </span>
                                                <span className="text-sm font-medium opacity-80">{task.topic}</span>
                                            </div>
                                            <p className={`text-sm ${task.completed ? 'opacity-50 line-through' : 'opacity-90'}`}>{task.description}</p>
                                        </div>
                                    </div>
                                    <div className="text-xs font-medium opacity-60 text-right shrink-0 ml-2">
                                        {task.estimatedTime} min
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-sm p-6 flex flex-col items-center justify-center text-center min-h-[200px] hover:border-[var(--color-primary-400)] transition-colors group cursor-pointer" onClick={() => window.location.href = '/pomodoro'}>
                        <div className="bg-[var(--color-primary-100)] dark:bg-[var(--color-primary-900)] w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Timer className="h-8 w-8 text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)]" />
                        </div>
                        <h3 className="text-lg font-bold">Start Focus Session</h3>
                        <p className="text-sm opacity-70 mt-1">Jump right into a 25-min Pomodoro</p>
                    </div>

                    <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-sm p-6 flex flex-col items-center justify-center text-center min-h-[200px] hover:border-[var(--color-primary-400)] transition-colors group cursor-pointer" onClick={() => window.location.href = '/notes'}>
                        <div className="bg-[var(--color-primary-100)] dark:bg-[var(--color-primary-900)] w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <BookOpen className="h-8 w-8 text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)]" />
                        </div>
                        <h3 className="text-lg font-bold">Log Daily Notes</h3>
                        <p className="text-sm opacity-70 mt-1">Reflect on today's progress & mistakes</p>
                    </div>
                </div>
            </div>

            <LeaveModal
                isOpen={isLeaveModalOpen}
                onClose={() => setIsLeaveModalOpen(false)}
                onSuccess={() => alert('Leave marked successfully!')}
            />
        </div>
    );
};
