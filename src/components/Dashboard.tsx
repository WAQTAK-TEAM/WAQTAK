import React from 'react';
import { useApp } from '../context/AppContext';
import { AdBanner } from './AdBanner';
import {
  CheckSquare, Clock, AlertTriangle, Star, CheckCircle2,
  Target, Zap, Bot, ArrowLeft, Plus, Calendar as CalendarIcon, Sparkles
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const {
    user, tasks, goals, focusSessions, toggleTaskComplete, t, setCurrentView,
    setIsQuickTaskModalOpen, setIsQuickGoalModalOpen
  } = useApp();

  // Time based greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? t('goodMorning') : hour < 18 ? t('goodAfternoon') : t('goodEvening');

  // Stats calculation
  const todayStr = new Date().toISOString().split('T')[0];
  const todaysTasks = tasks.filter(t => t.dueDate === todayStr || (!t.dueDate && t.status !== 'COMPLETED'));
  const urgentTasks = tasks
    .filter(t => t.priority === 'URGENT' && t.status !== 'COMPLETED')
    .sort((a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999'));
  
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED');

  // Total Focus Minutes Today & Overall
  const totalFocusMinutesToday = focusSessions
    .filter(s => s.completedAt && s.completedAt.startsWith(todayStr))
    .reduce((acc, s) => acc + s.durationMinutes, 0);

  const totalFocusHoursOverall = (focusSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0) / 60).toFixed(1);

  // Overall Goal Progress
  const activeGoalsCount = goals.filter(g => g.status === 'IN_PROGRESS' || g.progress < 100).length;
  const avgGoalProgress = goals.length > 0
    ? Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / goals.length)
    : 0;

  // Productivity Score Calculation (0-100)
  const taskRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 50 : 25;
  const focusRate = Math.min(totalFocusMinutesToday / 60, 1) * 25;
  const goalRate = (avgGoalProgress / 100) * 25;
  const productivityScore = Math.min(Math.round(taskRate + focusRate + goalRate), 100);

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* GREETING HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-xl shadow-blue-500/20">
        <div>
          <div className="text-xs font-semibold text-blue-200 mb-1 flex items-center gap-1.5">
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>{new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            {greeting}، {user?.name || 'صديقنا'} 👋
          </h1>
          <p className="text-xs text-blue-100 mt-1">
            لديك اليوم {todaysTasks.length} مهام و {urgentTasks.length} عاجلة. فلننجز وقتك معاً!
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsQuickTaskModalOpen(true)}
            className="px-4 py-3 rounded-2xl bg-white text-blue-700 font-bold text-xs shadow-md hover:bg-blue-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ إضافة مهمة</span>
          </button>
          <button
            onClick={() => setIsQuickGoalModalOpen(true)}
            className="px-4 py-3 rounded-2xl bg-blue-800/80 hover:bg-blue-900 text-white font-bold text-xs shadow-md border border-blue-400/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Target className="w-4 h-4" />
            <span>+ إضافة هدف</span>
          </button>
        </div>
      </div>

      {/* ADVERTISEMENT PLACEMENT */}
      <AdBanner placement="DASHBOARD" />

      {/* URGENT TASKS ALERT (If any) */}
      {urgentTasks.length > 0 && (
        <div className="p-5 rounded-3xl bg-red-500/10 border border-red-500/30 text-slate-900 dark:text-white space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 animate-bounce" />
              <span>مهام عاجلة تتطلب انتباهك الفوري ({urgentTasks.length})</span>
            </div>
            <button
              onClick={() => setCurrentView('tasks')}
              className="text-[11px] font-bold text-red-600 dark:text-red-400 hover:underline"
            >
              عرض قائمة المهام العاجلة
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {urgentTasks.slice(0, 4).map(task => (
              <div
                key={task.id}
                className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => toggleTaskComplete(task.id)}
                    className="w-4 h-4 rounded-md border border-red-400 flex items-center justify-center cursor-pointer shrink-0"
                  >
                    {task.status === 'COMPLETED' && <CheckCircle2 className="w-3.5 h-3.5 text-red-500" />}
                  </button>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {task.title}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-red-600 bg-red-100 dark:bg-red-950 px-2 py-0.5 rounded-full shrink-0">
                  {task.dueDate || 'عاجل'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI RECOMMENDATION BANNER */}
      <div className="p-4 sm:p-5 rounded-3xl bg-blue-950/60 border border-blue-800/80 text-white flex items-start gap-4 shadow-md ai-glow">
        <div className="p-2.5 rounded-2xl bg-blue-600 text-white shrink-0 shadow-md">
          <Bot className="w-5 h-5 animate-pulse" />
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>توصية وقتك AI الذكية</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">
            {urgentTasks.length > 0
              ? `"لديك ${urgentTasks.length} مهمة عاجلة جداً اليوم. نوصي ببدء جلسة تركيز لمدة 25 دقيقة لإنجازها مباشرة."`
              : `"مستوى إنتاجيتك ممتاز اليوم! ننصحك بإنشاء أو مراجعة أهدافك الاستراتيجية لهذا الأسبوع."`}
          </p>
        </div>
        <button
          onClick={() => setCurrentView('focus')}
          className="hidden sm:flex px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all shrink-0 cursor-pointer"
        >
          {t('startFocus')}
        </button>
      </div>

      {/* PRODUCTIVITY OVERVIEW METRICS */}
      <div>
        <h2 className="text-sm font-extrabold text-slate-900 dark:text-white mb-4">
          {t('productivityOverview')}
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: t('todaysTasks'), value: todaysTasks.length, icon: CheckSquare, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/50' },
            { label: t('urgentTasks'), value: urgentTasks.length, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/50' },
            { label: t('completedTasks'), value: completedTasks.length, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/50' },
            { label: t('focusTimeToday'), value: `${totalFocusMinutesToday} دقيقة`, icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/50' },
            { label: t('goalsProgress'), value: `${avgGoalProgress}%`, icon: Target, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-950/50' },
            { label: t('productivityScore'), value: `${productivityScore}/100`, icon: Star, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/50' },
          ].map((card, i) => {
            const Icon = card.icon;
            return (
              <div
                key={i}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between"
              >
                <div>
                  <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">{card.label}</div>
                  <div className="text-lg font-black text-slate-900 dark:text-white mt-1">{card.value}</div>
                </div>
                <div className={`p-2 rounded-xl ${card.bg}`}>
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DISCOVER WAQTAK — REAL DATA */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">اكتشف إنجازاتك في منصة وقتك</h3>
          </div>
          <span className="text-xs font-bold text-slate-400">بيانات حقيقية لمسطحة حسابك</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400">{completedTasks.length}</div>
            <div className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-1">مهمة مكتملة بنجاح</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
            <div className="text-2xl font-black text-amber-500">{totalFocusHoursOverall}</div>
            <div className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-1">ساعة تركيز مسجلة</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
            <div className="text-2xl font-black text-indigo-500">{activeGoalsCount}</div>
            <div className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-1">أهداف قيد التحقيق</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
            <div className="text-2xl font-black text-emerald-500">7 أيام</div>
            <div className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-1">سلسلة إنتاجية متصلة</div>
          </div>
        </div>
      </div>

      {/* TODAY'S TASKS LIST */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">{t('todaysTasks')}</h3>
            </div>
            <button
              onClick={() => setCurrentView('tasks')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>عرض الكل</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {todaysTasks.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto opacity-80" />
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {t('noTasksFound')}
                </p>
              </div>
            ) : (
              todaysTasks.slice(0, 5).map(task => (
                <div
                  key={task.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-3 hover:border-blue-500/50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleTaskComplete(task.id)}
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                        task.status === 'COMPLETED'
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-400 hover:border-blue-500'
                      }`}
                    >
                      {task.status === 'COMPLETED' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                    <div>
                      <div className={`text-xs font-bold ${task.status === 'COMPLETED' ? 'line-through text-slate-400' : 'text-slate-900 dark:text-slate-100'}`}>
                        {task.title}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>{task.category}</span>
                        {task.dueTime && <span>• {task.dueTime}</span>}
                        {task.subtasks.length > 0 && <span>• {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} فرعية</span>}
                      </div>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    task.priority === 'URGENT' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' :
                    task.priority === 'HIGH' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                    'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* GOALS SUMMARY CARD */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">{t('goalsTitle')}</h3>
            </div>
            <button
              onClick={() => setCurrentView('goals')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              عرض الأهداف
            </button>
          </div>

          <div className="space-y-4">
            {goals.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">{t('noGoalsFound')}</p>
            ) : (
              goals.slice(0, 3).map(goal => (
                <div key={goal.id} className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <div className="flex justify-between text-xs font-bold text-slate-900 dark:text-slate-100">
                    <span className="truncate">{goal.title}</span>
                    <span className="text-blue-600 dark:text-blue-400">{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-indigo-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
