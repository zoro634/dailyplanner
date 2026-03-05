import React, { useState } from 'react';
import { X, CalendarOff } from 'lucide-react';
import api from '../../lib/api';

interface LeaveModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const LeaveModal: React.FC<LeaveModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!date || !reason) {
            setError('Date and reason are required');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            await api.post('/leaves', { date, reason });
            onSuccess();
            onClose();
            // Reset
            setDate(new Date().toISOString().split('T')[0]);
            setReason('');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to mark leave');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-[var(--border)]">
                    <h3 className="text-lg font-bold flex items-center">
                        <CalendarOff className="mr-2 h-5 w-5 text-amber-500" />
                        Mark Leave Day
                    </h3>
                    <button onClick={onClose} className="p-1 rounded-md hover:bg-[var(--border)] transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <p className="text-sm opacity-80 mb-5">
                        Marking a leave day ensures your streak won't be broken if you miss your tasks.
                    </p>

                    {error && <div className="mb-4 p-2 bg-red-50 text-red-600 rounded text-sm">{error}</div>}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Date</label>
                            <input
                                type="date"
                                required
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-md p-2 text-sm focus:border-[var(--color-primary-500)] focus:ring-1 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Reason</label>
                            <input
                                type="text"
                                required
                                placeholder="Sick leave, family event..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-md p-2 text-sm focus:border-[var(--color-primary-500)] focus:ring-1 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-[var(--border)] rounded-md hover:bg-[var(--border)] transition-colors text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors text-sm font-medium disabled:opacity-50 flex items-center"
                        >
                            {loading ? 'Saving...' : 'Mark Leave'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
