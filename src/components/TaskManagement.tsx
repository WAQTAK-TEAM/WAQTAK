import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Task, TaskPriority, TaskCategory, TaskStatus, Subtask } from '../types';
import {
  CheckSquare, Plus, Search, Filter, Trash2, Edit3,
  Calendar, Clock, CheckCircle2, AlertTriangle, X, ChevronDown, Sparkles
} from 'lucide-react';

export const TaskManagement: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask, toggleTaskComplete, t, showToast, isQuickTaskModalOpen, setIsQuickTaskModalOpen } = useApp();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'PRIORITY' | 'DUE_DATE' | 'CREATED'>('PRIORITY');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  // AI Task Assistant State
  const [aiTask, setAiTask] = useState<Task | null>(null);
  const [aiAction, setAiAction] = useState<string>('ساعدني في البدء');
  const [aiCustomNote, setAiCustomNote] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiReply, setAiReply] = useState<string | null>(null);
  const [aiSuggestedSubtasks, setAiSuggestedSubtasks] = useState<{ id: string; title: string; completed: boolean }[]>([]);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('HIGH');
  const [category, setCategory] = useState<TaskCategory>('WORK');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [estimatedDurationMinutes, setEstimatedDurationMinutes] = useState(30);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  useEffect(() => {
    if (isQuickTaskModalOpen) {
      openCreateModal();
      setIsQuickTaskModalOpen(false);
    }
  }, [isQuickTaskModalOpen]);

  const handleRunTaskAi = async (actionText: string) => {
    if (!aiTask) return;
    setAiLoading(true);
    setAiAction(actionText);
    try {
      const res = await fetch('/api/ai/task-breakdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: aiTask.id,
          action: actionText,
          customPrompt: aiCustomNote
        })
      });
      const data = await res.json();
      if (data.reply) {
        setAiReply(data.reply);
        setAiSuggestedSubtasks(data.suggestedSubtasks || []);
      }
    } catch (err) {
      showToast('فشل التواصل مع المساعد الذكي', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const applyAiSubtasksToTask = async () => {
    if (!aiTask || aiSuggestedSubtasks.length === 0) return;
    const existingSubtasks = aiTask.subtasks || [];
    const newSubtasks = [...existingSubtasks, ...aiSuggestedSubtasks];
    await updateTask(aiTask.id, { subtasks: newSubtasks });
    showToast('تمت إضافة الخطوات الذكية للمهمة بنجاح!');
    setAiTask(null);
    setAiReply(null);
    setAiSuggestedSubtasks([]);
  };

  const openCreateModal = () => {
    setEditingTaskId(null);
    setTitle('');
    setDescription('');
    setPriority('HIGH');
    setCategory('WORK');
    setDueDate(new Date().toISOString().split('T')[0]);
    setDueTime('18:00');
    setEstimatedDurationMinutes(30);
    setSubtasks([]);
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTaskId(task.id);
    setTitle(task.title);
    setDescription(task.description || '');
    setPriority(task.priority);
    setCategory(task.category);
    setDueDate(task.dueDate || '');
    setDueTime(task.dueTime || '');
    setEstimatedDurationMinutes(task.estimatedDurationMinutes || 30);
    setSubtasks(task.subtasks || []);
    setIsModalOpen(true);
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingTaskId) {
      await updateTask(editingTaskId, {
        title,
        description,
        priority,
        category,
        dueDate,
        dueTime,
        estimatedDurationMinutes,
        subtasks
      });
    } else {
      await addTask({
        title,
        description,
        priority,
        category,
        dueDate,
        dueTime,
        estimatedDurationMinutes,
        subtasks
      });
    }
    setIsModalOpen(false);
  };

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks(prev => [
      ...prev,
      { id: `sub_${Date.now()}`, title: newSubtaskTitle, completed: false }
    ]);
    setNewSubtaskTitle('');
  };

  const toggleSubtask = (subId: string) => {
    setSubtasks(prev =>
      prev.map(s => s.id === subId ? { ...s, completed: !s.completed } : s)
    );
  };

  const removeSubtask = (subId: string) => {
    setSubtasks(prev => prev.filter(s => s.id !== subId));
  };

  // Filtering & Sorting Logic
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = selectedCategory === 'ALL' || task.category === selectedCategory;
    const matchesPrio = selectedPriority === 'ALL' || task.priority === selectedPriority;
    const matchesStat = selectedStatus === 'ALL' || task.status === selectedStatus;
    return matchesSearch && matchesCat && matchesPrio && matchesStat;
  }).sort((a, b) => {
    if (sortBy === 'PRIORITY') {
      const order = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      return order[b.priority] - order[a.priority];
    }
    if (sortBy === 'DUE_DATE') {
      return (a.dueDate || '').localeCompare(b.dueDate || '');
    }
    return b.createdAt.localeCompare(a.createdAt);
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-blue-600" />
            <span>{t('tasks')}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            إدارة وتنظيم كافة مهامك بالأولويات والمواعيد والمهام الفرعية
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{t('createTask')}</span>
        </button>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search Input */}
        <div className="relative lg:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('searchTasks')}
            className="w-full pr-10 pl-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Priority Filter */}
        <select
          value={selectedPriority}
          onChange={e => setSelectedPriority(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
        >
          <option value="ALL">جميع الأولويات</option>
          <option value="URGENT">{t('urgent')}</option>
          <option value="HIGH">{t('high')}</option>
          <option value="MEDIUM">{t('medium')}</option>
          <option value="LOW">{t('low')}</option>
        </select>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
        >
          <option value="ALL">جميع التصنيفات</option>
          <option value="WORK">{t('work')}</option>
          <option value="STUDY">{t('study')}</option>
          <option value="PERSONAL">{t('personal')}</option>
          <option value="HEALTH">{t('health')}</option>
          <option value="FINANCE">{t('finance')}</option>
          <option value="OTHER">{t('other')}</option>
        </select>

        {/* Sort By */}
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as any)}
          className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
        >
          <option value="PRIORITY">حسب الأولوية</option>
          <option value="DUE_DATE">حسب تاريخ الاستحقاق</option>
          <option value="CREATED">حسب تاريخ الإنشاء</option>
        </select>
      </div>

      {/* TASKS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('noTasksFound')}</h3>
          </div>
        ) : (
          filteredTasks.map(task => {
            const completedSubCount = task.subtasks?.filter(s => s.completed).length || 0;
            const totalSubCount = task.subtasks?.length || 0;
            const subProgress = totalSubCount > 0 ? Math.round((completedSubCount / totalSubCount) * 100) : 0;

            return (
              <div
                key={task.id}
                className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border transition-all hover:shadow-lg flex flex-col justify-between space-y-4 ${
                  task.status === 'COMPLETED'
                    ? 'border-emerald-500/30 opacity-75'
                    : task.priority === 'URGENT'
                    ? 'border-red-500/50 shadow-xs'
                    : 'border-slate-200/80 dark:border-slate-800/80'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      task.priority === 'URGENT' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' :
                      task.priority === 'HIGH' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {task.priority}
                    </span>

                    <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                      {task.category}
                    </span>
                  </div>

                  {/* Checkbox & Title */}
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleTaskComplete(task.id)}
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all mt-0.5 cursor-pointer shrink-0 ${
                        task.status === 'COMPLETED'
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-400 hover:border-blue-500'
                      }`}
                    >
                      {task.status === 'COMPLETED' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>

                    <div>
                      <h3 className={`text-sm font-bold ${task.status === 'COMPLETED' ? 'line-through text-slate-400' : 'text-slate-900 dark:text-slate-100'}`}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Subtasks progress */}
                  {totalSubCount > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                      <div className="flex justify-between text-[11px] text-slate-500 font-semibold">
                        <span>المهام الفرعية</span>
                        <span>{completedSubCount}/{totalSubCount} ({subProgress}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full transition-all"
                          style={{ width: `${subProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    <span>{task.dueDate || 'بدون تاريخ'}</span>
                    {task.dueTime && <span>• {task.dueTime}</span>}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setAiTask(task);
                        setAiReply(null);
                        setAiSuggestedSubtasks([]);
                        setAiCustomNote('');
                      }}
                      className="px-2 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                      title="المساعد الذكي للمهمة"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">وقتك AI</span>
                    </button>

                    <button
                      onClick={() => openEditModal(task)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CREATE / EDIT TASK MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                {editingTaskId ? t('editTask') : t('createTask')}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('taskTitle')} *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="عنوان المهمة..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('taskDescription')}</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="وصف إضافي للمهمة..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('priority')}</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 outline-none"
                  >
                    <option value="LOW">{t('low')}</option>
                    <option value="MEDIUM">{t('medium')}</option>
                    <option value="HIGH">{t('high')}</option>
                    <option value="URGENT">{t('urgent')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('category')}</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 outline-none"
                  >
                    <option value="WORK">{t('work')}</option>
                    <option value="STUDY">{t('study')}</option>
                    <option value="PERSONAL">{t('personal')}</option>
                    <option value="HEALTH">{t('health')}</option>
                    <option value="FINANCE">{t('finance')}</option>
                    <option value="OTHER">{t('other')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('dueDate')}</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('dueTime')}</label>
                  <input
                    type="time"
                    value={dueTime}
                    onChange={e => setDueTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>
              </div>

              {/* Subtasks checklist builder */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">{t('subtasks')}</label>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSubtaskTitle}
                    onChange={e => setNewSubtaskTitle(e.target.value)}
                    placeholder="إضافة مهمة فرعية..."
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubtask}
                    className="px-3 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
                  >
                    إضافة
                  </button>
                </div>

                <div className="space-y-1.5 max-h-32 overflow-y-auto pt-1">
                  {subtasks.map(s => (
                    <div key={s.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={s.completed}
                          onChange={() => toggleSubtask(s.id)}
                          className="rounded text-blue-600"
                        />
                        <span className={s.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}>
                          {s.title}
                        </span>
                      </div>
                      <button type="button" onClick={() => removeSubtask(s.id)} className="text-red-500 hover:text-red-700">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md"
                >
                  {t('save')}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                >
                  {t('cancel')}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* TASK AI ASSISTANT MODAL */}
      {aiTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    مساعد وقتك AI للمهمة
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold line-clamp-1">
                    "{aiTask.title}"
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAiTask(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Action Buttons */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                اختر توجيه الذكاء الاصطناعي السريع:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleRunTaskAi('ساعدني في البدء (Help me start)')}
                  disabled={aiLoading}
                  className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition-colors text-right flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  🚀 ساعدني في البدء
                </button>

                <button
                  type="button"
                  onClick={() => handleRunTaskAi('قسّم المهمة إلى خطوات فرعية (Split task)')}
                  disabled={aiLoading}
                  className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors text-right flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  📋 قسّم المهمة لخطوات
                </button>

                <button
                  type="button"
                  onClick={() => handleRunTaskAi('ما هي الخطوة القادمة المثالية؟ (Whats next?)')}
                  disabled={aiLoading}
                  className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-xs font-bold text-purple-700 dark:text-purple-300 hover:bg-purple-100 transition-colors text-right flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  🎯 ماذا أفعل بعد ذلك؟
                </button>

                <button
                  type="button"
                  onClick={() => handleRunTaskAi('واجهت مشكلة أو عقبة في التنفيذ (Problem encountered)')}
                  disabled={aiLoading}
                  className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-xs font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-100 transition-colors text-right flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  ⚠️ واجهت عقبة أو مشكلة
                </button>
              </div>
            </div>

            {/* Custom note */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                تفاصيل إضافية للذكاء الاصطناعي (اختياري):
              </label>
              <input
                type="text"
                value={aiCustomNote}
                onChange={e => setAiCustomNote(e.target.value)}
                placeholder="مثال: لدي ساعتان فقط وأود التسليم اليوم..."
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* AI Loading indicator */}
            {aiLoading && (
              <div className="text-center py-6 space-y-2">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-bold text-blue-600 dark:text-blue-400">
                  يقوم وقتك AI بتحليل المهمة وإعداد التوجيه الفعال...
                </p>
              </div>
            )}

            {/* AI Response Display */}
            {aiReply && !aiLoading && (
              <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {aiReply}
                </div>

                {aiSuggestedSubtasks.length > 0 && (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      الخطوات العملية المقترحة ({aiSuggestedSubtasks.length}):
                    </label>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {aiSuggestedSubtasks.map((st) => (
                        <div key={st.id} className="p-2.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                          <span className="text-blue-500">•</span>
                          <span>{st.title}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={applyAiSubtasksToTask}
                      className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
                    >
                      <span>تطبيق وإضافة الخطوات المقترحة إلى المهمة فوراً</span>
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
