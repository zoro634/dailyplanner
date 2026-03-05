import React, { useState, useEffect } from 'react';
import { format, addDays, subDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Save, Plus, Trash2 } from 'lucide-react';
import api from '../lib/api';

export const Notes = () => {
    const [currentDate, setCurrentDate] = useState(new Date());

    // Note State
    const [note, setNote] = useState({
        plan: '',
        studied: '',
        mistakesSummary: '',
        tomorrowFocus: '',
    });
    const [savingNote, setSavingNote] = useState(false);
    const [loadingNote, setLoadingNote] = useState(true);

    // Mistakes Log State
    const [mistakes, setMistakes] = useState<any[]>([]);
    const [loadingMistakes, setLoadingMistakes] = useState(true);
    const [newMistake, setNewMistake] = useState({ topic: '', description: '' });
    const [addingMistake, setAddingMistake] = useState(false);

    // Fetch Data
    useEffect(() => {
        const fetchNote = async () => {
            setLoadingNote(true);
            try {
                const dateStr = currentDate.toISOString().split('T')[0];
                const res = await api.get(`/notes/${dateStr}`);
                setNote({
                    plan: res.data.plan || '',
                    studied: res.data.studied || '',
                    mistakesSummary: res.data.mistakesSummary || '',
                    tomorrowFocus: res.data.tomorrowFocus || '',
                });
            } catch (error: any) {
                if (error.response?.status === 404) {
                    setNote({ plan: '', studied: '', mistakesSummary: '', tomorrowFocus: '' });
                } else {
                    console.error('Failed to fetch note', error);
                }
            } finally {
                setLoadingNote(false);
            }
        };

        fetchNote();
    }, [currentDate]);

    useEffect(() => {
        const fetchMistakes = async () => {
            try {
                const res = await api.get('/mistakes');
                setMistakes(res.data);
            } catch (error) {
                console.error('Failed to fetch mistakes', error);
            } finally {
                setLoadingMistakes(false);
            }
        }
        fetchMistakes();
    }, []);

    const handleSaveNote = async () => {
        setSavingNote(true);
        try {
            const dateStr = currentDate.toISOString().split('T')[0];
            await api.post(`/notes/${dateStr}`, {
                date: dateStr,
                ...note
            });
            // Show toast here
        } catch (error) {
            console.error("Failed to save note", error);
        } finally {
            setSavingNote(false);
        }
    };

    const handleAddMistake = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMistake.topic || !newMistake.description) return;

        setAddingMistake(true);
        try {
            const res = await api.post('/mistakes', {
                date: currentDate.toISOString().split('T')[0],
                topic: newMistake.topic,
                description: newMistake.description
            });
            setMistakes([res.data, ...mistakes]);
            setNewMistake({ topic: '', description: '' });
        } catch (error) {
            console.error("Failed to add mistake", error);
        } finally {
            setAddingMistake(false);
        }
    };

    const deleteMistake = async (id: string) => {
        if (!confirm('Delete this mistake log?')) return;
        try {
            await api.delete(`/mistakes/${id}`);
            setMistakes(mistakes.filter(m => m._id !== id));
        } catch (error) {
            console.error("Failed to delete mistake log", error);
        }
    }

    const nextDay = () => setCurrentDate(addDays(currentDate, 1));
    const prevDay = () => setCurrentDate(subDays(currentDate, 1));

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">Daily Journal</h1>
                    <p className="text-[var(--foreground)] opacity-70 mt-1">Reflect on your study sessions</p>
                </div>

                <div className="flex items-center bg-[var(--card)] rounded-lg border border-[var(--border)] p-1 shadow-sm">
                    <button onClick={prevDay} className="p-2 hover:bg-[var(--border)] rounded-md transition-colors"><ChevronLeft className="h-5 w-5" /></button>
                    <div className="px-4 font-semibold text-center min-w-[150px]">
                        {format(currentDate, 'MMM d, yyyy')}
                    </div>
                    <button onClick={nextDay} className="p-2 hover:bg-[var(--border)] rounded-md transition-colors"><ChevronRight className="h-5 w-5" /></button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Daily Notes Card */}
                <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-sm flex flex-col">
                    <div className="p-4 border-b border-[var(--border)] flex justify-between items-center">
                        <h2 className="text-lg font-bold">Daily Notes</h2>
                        <button
                            onClick={handleSaveNote}
                            disabled={savingNote || loadingNote}
                            className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-primary-600)] text-white text-sm font-medium rounded-md hover:bg-[var(--color-primary-700)] transition-colors disabled:opacity-50"
                        >
                            <Save className="h-4 w-4" />
                            {savingNote ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                    <div className="p-4 space-y-4 flex-1">
                        {loadingNote ? (
                            <div className="animate-pulse space-y-4">
                                <div className="h-24 bg-[var(--border)] rounded-md"></div>
                                <div className="h-24 bg-[var(--border)] rounded-md"></div>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium opacity-80 pl-1">Today's Plan Overview</label>
                                    <textarea
                                        value={note.plan}
                                        onChange={(e) => setNote({ ...note, plan: e.target.value })}
                                        placeholder="What is the main goal today?"
                                        className="w-full bg-transparent border border-[var(--border)] rounded-md p-3 text-sm focus:border-[var(--color-primary-500)] focus:ring-1 focus:ring-[var(--color-primary-500)] focus:outline-none min-h-[80px] resize-y"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium opacity-80 pl-1">What I actually studied</label>
                                    <textarea
                                        value={note.studied}
                                        onChange={(e) => setNote({ ...note, studied: e.target.value })}
                                        placeholder="List what you accomplished..."
                                        className="w-full bg-transparent border border-[var(--border)] rounded-md p-3 text-sm focus:border-[var(--color-primary-500)] focus:ring-1 focus:ring-[var(--color-primary-500)] focus:outline-none min-h-[100px] resize-y"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium opacity-80 pl-1">General feeling & struggles</label>
                                    <textarea
                                        value={note.mistakesSummary}
                                        onChange={(e) => setNote({ ...note, mistakesSummary: e.target.value })}
                                        placeholder="Felt tired? Hard RC passages?"
                                        className="w-full bg-transparent border border-[var(--border)] rounded-md p-3 text-sm focus:border-[var(--color-primary-500)] focus:ring-1 focus:ring-[var(--color-primary-500)] focus:outline-none min-h-[80px] resize-y"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium opacity-80 pl-1">Tomorrow's Focus</label>
                                    <textarea
                                        value={note.tomorrowFocus}
                                        onChange={(e) => setNote({ ...note, tomorrowFocus: e.target.value })}
                                        placeholder="What to improve tomorrow?"
                                        className="w-full bg-transparent border border-[var(--border)] rounded-md p-3 text-sm focus:border-[var(--color-primary-500)] focus:ring-1 focus:ring-[var(--color-primary-500)] focus:outline-none min-h-[80px] resize-y"
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Mistake Log Card */}
                <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-sm flex flex-col">
                    <div className="p-4 border-b border-[var(--border)]">
                        <h2 className="text-lg font-bold">Mistake Log Tracker</h2>
                        <p className="text-xs opacity-70 mt-1">Log specific errors to review later</p>
                    </div>

                    <div className="p-4 border-b border-[var(--border)] bg-[#f8fafc] dark:bg-[#1e293b]/30">
                        <form onSubmit={handleAddMistake} className="space-y-3">
                            <div>
                                <input
                                    type="text"
                                    required
                                    value={newMistake.topic}
                                    onChange={(e) => setNewMistake({ ...newMistake, topic: e.target.value })}
                                    placeholder="Topic (e.g., TSD, Geometry)"
                                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-md p-2.5 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <textarea
                                    required
                                    value={newMistake.description}
                                    onChange={(e) => setNewMistake({ ...newMistake, description: e.target.value })}
                                    placeholder="Describe the mistake and the correct approach..."
                                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-md p-2.5 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none min-h-[80px] resize-none"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={addingMistake}
                                className="w-full flex justify-center items-center gap-2 py-2 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-md font-medium text-sm transition-colors disabled:opacity-50"
                            >
                                <Plus className="h-4 w-4" /> Add to Log
                            </button>
                        </form>
                    </div>

                    <div className="p-0 overflow-y-auto max-h-[400px]">
                        {loadingMistakes ? (
                            <div className="p-6 text-center opacity-50 text-sm">Loading mistake logs...</div>
                        ) : mistakes.length === 0 ? (
                            <div className="p-8 text-center opacity-50 text-sm">No mistakes logged yet. Good job, but keep tracking errors!</div>
                        ) : (
                            <div className="divide-y divide-[var(--border)]">
                                {mistakes.map((m) => (
                                    <div key={m._id} className="p-4 flex gap-3 hover:bg-[var(--background)] transition-colors group">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-semibold text-red-600 dark:text-red-400 text-sm">{m.topic}</span>
                                                <span className="text-xs opacity-50">{format(new Date(m.date), 'MMM d, yy')}</span>
                                            </div>
                                            <p className="text-sm opacity-80 whitespace-pre-wrap">{m.description}</p>
                                        </div>
                                        <button
                                            onClick={() => deleteMistake(m._id)}
                                            className="shrink-0 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors opacity-0 group-hover:opacity-100 self-start"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
