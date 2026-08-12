import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import confetti from 'canvas-confetti';
import {
  Zap, Play, Pause, RotateCcw, Square, Volume2,
  VolumeX, CheckCircle2, Clock, Sparkles
} from 'lucide-react';

export const FocusMode: React.FC = () => {
  const { tasks, addFocusSession, focusSessions, t, showToast } = useApp();

  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [durationMinutes, setDurationMinutes] = useState<number>(25);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setTimeLeftSeconds(durationMinutes * 60);
  }, [durationMinutes]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeftSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            handleCompleteSession();
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

  const handleCompleteSession = async () => {
    // Trigger celebration confetti!
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.log(e);
    }

    const task = tasks.find(t => t.id === selectedTaskId);
    await addFocusSession({
      taskId: selectedTaskId || undefined,
      taskTitle: task?.title || 'جلسة تركيز عامة',
      durationMinutes
    });

    showToast(t('focusSessionCompleted'));
  };

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setTimeLeftSeconds(durationMinutes * 60);
  };

  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;
  const progressPercent = ((durationMinutes * 60 - timeLeftSeconds) / (durationMinutes * 60)) * 100;

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      
      {/* HEADER */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
          <Zap className="w-7 h-7 fill-white" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">
          {t('focusModeTitle')}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          حافظ على تركيزك الكامل بدون تشتت وضاعف إنتاجيتك مع تقنية بومودورو
        </p>
      </div>

      {/* TIMER DISPLAY CARD */}
      <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-2xl relative overflow-hidden text-center space-y-8">
        
        {/* Glow circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Preset Selector */}
        <div className="flex justify-center gap-2">
          {[25, 50, 15].map(mins => (
            <button
              key={mins}
              onClick={() => {
                setDurationMinutes(mins);
                setIsRunning(false);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                durationMinutes === mins
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/30'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {mins} دقيقة {mins === 25 ? '(القياسي)' : mins === 50 ? '(عميق)' : '(استراحة)'}
            </button>
          ))}
        </div>

        {/* Task Selection Dropdown */}
        <div className="max-w-md mx-auto">
          <label className="block text-xs font-bold text-slate-400 mb-1">{t('selectTaskToFocus')}</label>
          <select
            value={selectedTaskId}
            onChange={e => setSelectedTaskId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 outline-none"
          >
            <option value="">-- جلسة تركيز حرة بدون مهمة مخصصة --</option>
            {tasks.filter(t => t.status !== 'COMPLETED').map(task => (
              <option key={task.id} value={task.id}>
                {task.title} ({task.priority})
              </option>
            ))}
          </select>
        </div>

        {/* BIG TIMER COUNTER */}
        <div className="relative py-4">
          <div className="text-7xl sm:text-8xl font-black font-mono tracking-wider bg-gradient-to-r from-amber-400 via-orange-300 to-amber-500 bg-clip-text text-transparent">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>

          {/* Progress bar */}
          <div className="w-full max-w-md mx-auto bg-slate-800 h-2.5 rounded-full overflow-hidden mt-6">
            <div
              className="bg-gradient-to-r from-amber-500 to-orange-500 h-full transition-all duration-1000"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* TIMER CONTROLS */}
        <div className="flex items-center justify-center gap-4">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="px-8 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
            >
              <Play className="w-5 h-5 fill-slate-950" />
              <span>{t('startFocus')}</span>
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="px-8 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/40 font-black text-sm flex items-center gap-2 cursor-pointer transition-all"
            >
              <Pause className="w-5 h-5 fill-amber-400" />
              <span>{t('pauseFocus')}</span>
            </button>
          )}

          <button
            onClick={handleReset}
            className="p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title={t('resetFocus')}
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5 text-amber-400" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* FOCUS STATS SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1">
          <div className="text-xs text-slate-500 font-semibold">إجمالي جلسات اليوم</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{focusSessions.length} جلسة</div>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1">
          <div className="text-xs text-slate-500 font-semibold">مجموع ساعات التركيز</div>
          <div className="text-2xl font-black text-amber-500">
            {Math.round(focusSessions.reduce((acc, s) => acc + s.durationMinutes, 0) / 60 * 10) / 10} ساعة
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1">
          <div className="text-xs text-slate-500 font-semibold">أطول فترة تركيز</div>
          <div className="text-2xl font-black text-blue-600">50 دقيقة</div>
        </div>
      </div>

    </div>
  );
};
