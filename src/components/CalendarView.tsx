import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CalendarEvent } from '../types';
import {
  Calendar as CalendarIcon, Plus, ChevronRight, ChevronLeft,
  Clock, CheckSquare, Zap, X
} from 'lucide-react';

export const CalendarView: React.FC = () => {
  const { tasks, calendarEvents, addCalendarEvent, t } = useApp();
  const [viewMode, setViewMode] = useState<'MONTH' | 'WEEK' | 'DAY'>('MONTH');
  const [currentDate, setCurrentDate] = useState(new Date());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [eventTime, setEventTime] = useState('14:00');

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;

    await addCalendarEvent({
      title: eventTitle,
      startDate: `${eventDate} ${eventTime}`,
      endDate: `${eventDate} ${eventTime}`,
      type: 'EVENT',
      color: '#2563eb'
    });

    setIsModalOpen(false);
    setEventTitle('');
  };

  // Render Month grid
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-blue-600" />
            <span>{t('calendarTitle')}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            عرض المواعيد النهائية والفعاليات وجلسات التركيز في تقويم مدمج موحد
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
            {(['MONTH', 'WEEK', 'DAY'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === mode ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {mode === 'MONTH' ? t('monthView') : mode === 'WEEK' ? t('weekView') : t('dayView')}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addEvent')}</span>
          </button>
        </div>
      </div>

      {/* MONTH CONTROL */}
      <div className="flex items-center justify-between px-2">
        <h2 className="text-lg font-black text-slate-900 dark:text-white">
          {currentDate.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
          >
            اليوم
          </button>
          <button
            onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* CALENDAR MONTH GRID */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-6 shadow-xs">
        {/* Day Names */}
        <div className="grid grid-cols-7 gap-2 mb-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400">
          <div>الأحد</div><div>الإثنين</div><div>الثلاثاء</div><div>الأربعاء</div><div>الخميس</div><div>الجمعة</div><div>السبت</div>
        </div>

        {/* Days Matrix */}
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty_${i}`} className="h-24 sm:h-28 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20" />
          ))}

          {daysArray.map(day => {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = new Date().toISOString().split('T')[0] === dateStr;

            // Events on this day
            const dayTasks = tasks.filter(t => t.dueDate === dateStr);
            const dayEvents = calendarEvents.filter(e => e.startDate.startsWith(dateStr));

            return (
              <div
                key={day}
                className={`h-24 sm:h-28 p-2 rounded-2xl border flex flex-col justify-between overflow-hidden transition-all ${
                  isToday
                    ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 shadow-xs'
                    : 'bg-slate-50/80 dark:bg-slate-800/30 border-slate-200/60 dark:border-slate-800/60'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                    isToday ? 'bg-blue-600 text-white' : 'text-slate-700 dark:text-slate-300'
                  }`}>
                    {day}
                  </span>
                </div>

                <div className="space-y-1 overflow-y-auto max-h-16">
                  {dayTasks.map(tsk => (
                    <div key={tsk.id} className="p-1 rounded bg-blue-600 text-white text-[9px] font-bold truncate">
                      ✓ {tsk.title}
                    </div>
                  ))}
                  {dayEvents.map(evt => (
                    <div key={evt.id} className="p-1 rounded bg-indigo-600 text-white text-[9px] font-bold truncate">
                      📅 {evt.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CREATE EVENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 space-y-4 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">{t('addEvent')}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3">
              <div>
                <label className="block text-xs font-bold mb-1">{t('eventTitle')}</label>
                <input
                  type="text"
                  required
                  value={eventTitle}
                  onChange={e => setEventTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold mb-1">التاريخ</label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={e => setEventDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">الوقت</label>
                  <input
                    type="time"
                    value={eventTime}
                    onChange={e => setEventTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl">
                  {t('save')}
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 bg-slate-200 dark:bg-slate-800 font-bold text-xs rounded-xl">
                  {t('cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
