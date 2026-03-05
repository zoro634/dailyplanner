import { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, LineChart, Line, PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'];

export const Analytics = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // In a real scenario, this would call specialized analytics endpoints.
        // We will do a mock aggregation based on currently fetched tasks.
        const fetchAnalytics = async () => {
            try {
                // Placeholder data for the charts since we don't have historical aggregation APIs built specifically yet
                // Just simulating for the UI
                setData({
                    weeklyCompletion: [
                        { day: 'Mon', completed: 4, missed: 1 },
                        { day: 'Tue', completed: 5, missed: 0 },
                        { day: 'Wed', completed: 3, missed: 2 },
                        { day: 'Thu', completed: 6, missed: 0 },
                        { day: 'Fri', completed: 4, missed: 1 },
                        { day: 'Sat', completed: 7, missed: 0 },
                        { day: 'Sun', completed: 2, missed: 0 },
                    ],
                    sectionDistribution: [
                        { name: 'QA', value: 35 },
                        { name: 'VARC', value: 25 },
                        { name: 'DILR', value: 20 },
                        { name: 'Mock', value: 10 },
                        { name: 'Revision', value: 10 },
                    ],
                    studyHours: [
                        { week: 'W1', hours: 14 },
                        { week: 'W2', hours: 18 },
                        { week: 'W3', hours: 16 },
                        { week: 'W4', hours: 22 },
                    ]
                });
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        fetchAnalytics();
    }, []);

    if (loading) return <div className="p-8 text-center text-[var(--foreground)] opacity-50">Loading analytics...</div>;

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">Analytics Overview</h1>
                <p className="text-[var(--foreground)] opacity-70 mt-1">Track your progress and identify areas for improvement.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weekly Completion Bar Chart */}
                <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-sm p-6">
                    <h2 className="text-lg font-bold mb-6">Weekly Task Completion</h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data?.weeklyCompletion}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                <XAxis dataKey="day" stroke="var(--foreground)" opacity={0.5} fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="var(--foreground)" opacity={0.5} fontSize={12} tickLine={false} axisLine={false} />
                                <RechartsTooltip cursor={{ fill: 'var(--border)', opacity: 0.4 }} contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--foreground)' }} />
                                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                                <Bar dataKey="completed" name="Completed" stackId="a" fill="var(--color-primary-500)" radius={[0, 0, 4, 4]} />
                                <Bar dataKey="missed" name="Missed" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Section Distribution Pie Chart */}
                <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-sm p-6">
                    <h2 className="text-lg font-bold mb-6">Study Time by Section (Last 30 Days)</h2>
                    <div className="h-64 flex justify-center items-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data?.sectionDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data?.sectionDistribution.map((_: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--foreground)' }} />
                                <Legend iconType="circle" layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Study Hours Trend Line Chart */}
                <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-sm p-6 lg:col-span-2">
                    <h2 className="text-lg font-bold mb-6">Study Hours Trend</h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data?.studyHours}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                <XAxis dataKey="week" stroke="var(--foreground)" opacity={0.5} fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="var(--foreground)" opacity={0.5} fontSize={12} tickLine={false} axisLine={false} />
                                <RechartsTooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--foreground)' }} />
                                <Line type="monotone" dataKey="hours" name="Total Hours" stroke="var(--color-primary-500)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};
