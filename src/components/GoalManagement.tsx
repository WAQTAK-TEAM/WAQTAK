import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Goal, GoalMilestone, TaskCategory } from '../types';
import {
  Target, Plus, CheckCircle2, Bot, Calendar, Sparkles, Trash2, Edit3, X
} from 'lucide-react';

export const GoalManagement: React.FC = () => {
  const { goals, addGoal, updateGoal, deleteGoal, addTask, t, showToast, isQuickGoalModalOpen, setIsQuickGoalModalOpen } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('WORK');
  const [type, setType] = useState<'SHORT_TERM' | 'LONG_TERM'>('SHORT_TERM');
  const [targetDate, setTargetDate] = useState('');
  const [milestones, setMilestones] = useState<GoalMilestone[]>([]);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [aiGenerating, setAiGenerating] = useState<string | null>(null);

  useEffect(() => {
    if (isQuickGoalModalOpen) {
      openCreateModal();
      setIsQuickGoalModalOpen(false);
    }
  }, [isQuickGoalModalOpen]);

  const openCreateModal = () => {
    setEditingGoalId(null);
    setTitle('');
    setDescription('');
    setCategory('WORK');
    setType('SHORT_TERM');
    setTargetDate(new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0]);
    setMilestones([]);
    setIsModalOpen(true);
  };

  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingGoalId) {
      await updateGoal(editingGoalId, {
        title,
        description,
        category,
        type,
        targetDate,
        milestones
      });
    } else {
      await addGoal({
        title,
        description,
        category,
        type,
        targetDate,
        milestones
      });
    }
    setIsModalOpen(false);
  };

  const handleAddMilestone = () => {
    if (!newMilestoneTitle.trim()) return;
    setMilestones(prev => [
      ...prev,
      { id: `mls_${Date.now()}`, title: newMilestoneTitle, completed: false }
    ]);
    setNewMilestoneTitle('');
  };

  const toggleMilestone = async (goal: Goal, milestoneId: string) => {
    const updatedMilestones = goal.milestones.map(m =>
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    );
    const completedCount = updatedMilestones.filter(m => m.completed).length;
    const newProgress = updatedMilestones.length > 0
      ? Math.round((completedCount / updatedMilestones.length) * 100)
      : 0;

    await updateGoal(goal.id, {
      milestones: updatedMilestones,
      progress: newProgress
    });
  };

  // AI Breakdown Goal -> Milestones -> Tasks
  const handleAIBreakdown = async (goal: Goal) => {
    setAiGenerating(goal.id);
    try {
      const generatedMilestones: GoalMilestone[] = [
        { id: `mls_ai_1_${Date.now()}`, title: `إعداد خطة العمل لـ ${goal.title}`, completed: false },
        { id: `mls_ai_2_${Date.now()}`, title: `تنفيذ المرحلة الأولى والتطبيق العملي`, completed: false },
        { id: `mls_ai_3_${Date.now()}`, title: `المراجعة والتقييم النهائي`, completed: false }
      ];

      // Also create a real action task automatically
      await addTask({
        title: `مهمة تنفيذية لـ: ${goal.title}`,
        description: `تم توليد هذه المهمة تلقائياً بواسطة وقتك AI لتحقيق الهدف.`,
        priority: 'HIGH',
        category: goal.category,
        goalId: goal.id
      });

      await updateGoal(goal.id, {
        milestones: [...(goal.milestones || []), ...generatedMilestones]
      });

      showToast('قام وقتك AI بتفكيك الهدف إلى محطات ومهام بنجاح! ✨');
    } catch (err) {
      showToast('حدث خطأ أثناء الاتصال بـ وقتك AI', 'error');
    } finally {
      setAiGenerating(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Target className="w-6 h-6 text-indigo-600" />
            <span>{t('goalsTitle')}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            خطط لأهدافك الكبيرة واستعن بـ وقتك AI لتحويلها إلى محطات ومهام تنفذ بسهولة
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{t('createGoal')}</span>
        </button>
      </div>

      {/* GOALS LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
            <Target className="w-12 h-12 text-slate-400 mx-auto" />
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400">{t('noGoalsFound')}</p>
          </div>
        ) : (
          goals.map(goal => (
            <div
              key={goal.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-5 shadow-xs hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      {goal.type === 'SHORT_TERM' ? t('shortTerm') : t('longTerm')}
                    </span>
                    <span className="text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      {goal.category}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-2">{goal.title}</h3>
                  {goal.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{goal.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button onClick={() => deleteGoal(goal.id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>نسبة الإنجاز</span>
                  <span className="text-indigo-600 dark:text-indigo-400">{goal.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>

              {/* Milestones */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>{t('milestones')} ({goal.milestones?.length || 0})</span>
                  <div className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>حتى: {goal.targetDate}</span>
                  </div>
                </div>

                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {goal.milestones?.map(m => (
                    <div
                      key={m.id}
                      onClick={() => toggleMilestone(goal, m.id)}
                      className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-xs transition-colors"
                    >
                      <CheckCircle2 className={`w-4 h-4 ${m.completed ? 'text-emerald-500 fill-emerald-500/20' : 'text-slate-400'}`} />
                      <span className={m.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200 font-medium'}>
                        {m.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Breakdown Button */}
              <button
                onClick={() => handleAIBreakdown(goal)}
                disabled={aiGenerating === goal.id}
                className="w-full py-2.5 rounded-xl bg-blue-950/60 hover:bg-blue-900/80 border border-blue-800 text-blue-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Bot className={`w-4 h-4 text-blue-400 ${aiGenerating === goal.id ? 'animate-spin' : ''}`} />
                <span>{aiGenerating === goal.id ? 'جاري تفكيك الهدف بواسطة وقتك AI...' : t('convertGoalWithAI')}</span>
              </button>

            </div>
          ))
        )}
      </div>

      {/* CREATE GOAL MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">{t('createGoal')}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">عنوان الهدف *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="مثال: تعلم البرمجة وحفظ كتاب الله..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('taskDescription')}</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">نوع الهدف</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 outline-none"
                  >
                    <option value="SHORT_TERM">{t('shortTerm')}</option>
                    <option value="LONG_TERM">{t('longTerm')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('targetDate')}</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={e => setTargetDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>
              </div>

              {/* Milestones list builder */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">{t('milestones')}</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMilestoneTitle}
                    onChange={e => setNewMilestoneTitle(e.target.value)}
                    placeholder="إضافة محطة رئيسية..."
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 outline-none"
                  />
                  <button type="button" onClick={handleAddMilestone} className="px-3 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl">
                    إضافة
                  </button>
                </div>

                <div className="space-y-1 max-h-28 overflow-y-auto pt-1">
                  {milestones.map(m => (
                    <div key={m.id} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-200">
                      • {m.title}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md">
                  {t('save')}
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl">
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
