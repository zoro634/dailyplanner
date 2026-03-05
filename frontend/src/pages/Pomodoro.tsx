import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';

export const Pomodoro = () => {
    const WORK_TIME = 25 * 60;
    const BREAK_TIME = 5 * 60;

    const [timeLeft, setTimeLeft] = useState(WORK_TIME);
    const [isRunning, setIsRunning] = useState(false);
    const [isBreak, setIsBreak] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);

    const timerRef = useRef<any>(null);

    useEffect(() => {
        if (isRunning) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        handleTimerComplete();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isRunning]);

    const handleTimerComplete = () => {
        setIsRunning(false);
        if (soundEnabled) {
            try {
                const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                const osc = ctx.createOscillator();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, ctx.currentTime);
                osc.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.5);
            } catch (e) {
                console.warn("Audio not supported");
            }
        }

        if (isBreak) {
            setIsBreak(false);
            setTimeLeft(WORK_TIME);
        } else {
            setIsBreak(true);
            setTimeLeft(BREAK_TIME);
        }
    };

    const toggleTimer = () => setIsRunning(!isRunning);

    const resetTimer = () => {
        setIsRunning(false);
        setIsBreak(false);
        setTimeLeft(WORK_TIME);
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const progressPercent = isBreak
        ? ((BREAK_TIME - timeLeft) / BREAK_TIME) * 100
        : ((WORK_TIME - timeLeft) / WORK_TIME) * 100;

    return (
        <div className="space-y-6 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[70vh]">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-extrabold tracking-tight text-[var(--foreground)]">Pomodoro Timer</h1>
                <p className="text-[var(--foreground)] opacity-70 mt-2 text-lg">Focus and take regular breaks</p>
            </div>

            <div className={`bg-[var(--card)] w-full max-w-md rounded-3xl border border-[var(--border)] shadow-xl p-10 flex flex-col items-center justify-center transition-colors duration-500 ${isBreak ? 'shadow-green-500/10 border-green-500/30' : 'shadow-[var(--color-primary-500)]/10 border-[var(--color-primary-500)]/30'}`}>

                <div className="flex bg-[var(--background)] rounded-full p-1 mb-8 shadow-inner border border-[var(--border)] w-48">
                    <button
                        onClick={() => { if (!isRunning) { setIsBreak(false); setTimeLeft(WORK_TIME); } }}
                        className={`flex-1 py-1 px-4 text-sm font-bold rounded-full transition-all ${!isBreak ? 'bg-[var(--color-primary-500)] text-white shadow-md' : 'text-[var(--foreground)] opacity-70 hover:opacity-100'}`}
                    >
                        Focus
                    </button>
                    <button
                        onClick={() => { if (!isRunning) { setIsBreak(true); setTimeLeft(BREAK_TIME); } }}
                        className={`flex-1 py-1 px-4 text-sm font-bold rounded-full transition-all ${isBreak ? 'bg-green-500 text-white shadow-md' : 'text-[var(--foreground)] opacity-70 hover:opacity-100'}`}
                    >
                        Break
                    </button>
                </div>

                <div className="relative w-64 h-64 flex items-center justify-center mb-10">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle
                            cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="4" fill="none"
                            className="text-[var(--border)] opacity-30"
                        />
                        <circle
                            cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="6" fill="none"
                            strokeLinecap="round"
                            strokeDasharray="283"
                            strokeDashoffset={283 - (283 * progressPercent) / 100}
                            className={`transition-all duration-1000 ease-linear ${isBreak ? 'text-green-500' : 'text-[var(--color-primary-500)]'}`}
                        />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                        <span className="text-6xl font-black font-mono tracking-tighter text-[var(--foreground)]">
                            {formatTime(timeLeft)}
                        </span>
                        <span className="text-sm font-semibold opacity-60 uppercase tracking-widest mt-2 block">
                            {isBreak ? 'Break Time' : 'Focus Time'}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <button
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className="p-3 text-[var(--foreground)] opacity-50 hover:opacity-100 hover:bg-[var(--border)] rounded-full transition-all"
                    >
                        {soundEnabled ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
                    </button>

                    <button
                        onClick={toggleTimer}
                        className={`p-6 rounded-full text-white shadow-lg transition-transform active:scale-95 flex items-center justify-center hover:scale-105 ${isBreak ? 'bg-green-500 shadow-green-500/40 hover:bg-green-600' : 'bg-[var(--color-primary-600)] shadow-[var(--color-primary-600)]/40 hover:bg-[var(--color-primary-700)]'
                            }`}
                    >
                        {isRunning ? <Pause className="h-10 w-10 ml-0.5" /> : <Play className="h-10 w-10 ml-2" />}
                    </button>

                    <button
                        onClick={resetTimer}
                        className="p-3 text-[var(--foreground)] opacity-50 hover:opacity-100 hover:bg-[var(--border)] rounded-full transition-all"
                    >
                        <RotateCcw className="h-6 w-6" />
                    </button>
                </div>
            </div>
        </div>
    );
};
