import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart2, CheckCircle2, Zap, Target, Star,
  PieChart, Download, FileSpreadsheet, FileText, Check, ChevronDown
} from 'lucide-react';

export const StatisticsView: React.FC = () => {
  const { tasks, goals, focusSessions, showToast, t } = useApp();
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const totalFocusMinutes = focusSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalFocusHours = Math.round((totalFocusMinutes / 60) * 10) / 10;

  const avgGoalProgress = goals.length > 0
    ? Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / goals.length)
    : 0;

  const productivityScore = Math.min(Math.round((taskCompletionRate + avgGoalProgress) / 2), 100);

  // Category breakdown
  const categories = ['WORK', 'STUDY', 'PERSONAL', 'HEALTH', 'FINANCE', 'OTHER'] as const;
  const categoryStats = categories.map(cat => {
    const catTasks = tasks.filter(t => t.category === cat);
    const completed = catTasks.filter(t => t.status === 'COMPLETED').length;
    return {
      category: cat,
      total: catTasks.length,
      completed,
      rate: catTasks.length > 0 ? Math.round((completed / catTasks.length) * 100) : 0
    };
  });

  // Export to CSV Function
  const handleExportCSV = (type: 'FULL' | 'TASKS' | 'FOCUS' | 'GOALS' = 'FULL') => {
    try {
      setIsExporting(true);
      const BOM = '\uFEFF'; // UTF-8 BOM for Microsoft Excel Arabic support
      let csvContent = BOM;
      const dateStr = new Date().toISOString().split('T')[0];

      if (type === 'FULL' || type === 'TASKS') {
        csvContent += "=== ملخص أداء الإنتاجية الإجمالي (Productivity Summary) ===\n";
        csvContent += "المؤشر (Metric),القيمة (Value)\n";
        csvContent += `"إجمالي المهام المسجلة",${totalTasks}\n`;
        csvContent += `"المهام المكتملة بنجاح",${completedTasks}\n`;
        csvContent += `"معدل الإنجاز (%)",${taskCompletionRate}%\n`;
        csvContent += `"ساعات التركيز الكلية",${totalFocusHours} ساعة\n`;
        csvContent += `"عدد جلسات التركيز",${focusSessions.length}\n`;
        csvContent += `"متوسط تقدم الأهداف (%)",${avgGoalProgress}%\n`;
        csvContent += `"درجة الإنتاجية الذكية",${productivityScore}/100\n\n`;

        csvContent += "=== توزيع الإنجاز حسب التصنيف (Category Performance) ===\n";
        csvContent += "التصنيف,المهام المكتملة,إجمالي المهام,نسبة الإنجاز (%)\n";
        categoryStats.forEach(stat => {
          csvContent += `"${stat.category}",${stat.completed},${stat.total},${stat.rate}%\n`;
        });
        csvContent += "\n";

        csvContent += "=== سجل المهام التفصيلي (Tasks Detail) ===\n";
        csvContent += "عنوان المهمة,التصنيف,الأولوية,الحالة,تاريخ الاستحقاق,الوقت (بالدقائق)\n";
        tasks.forEach(t => {
          const titleEscaped = `"${(t.title || '').replace(/"/g, '""')}"`;
          const cat = `"${t.category || ''}"`;
          const prio = `"${t.priority || ''}"`;
          const status = `"${t.status === 'COMPLETED' ? 'مكتملة' : 'قيد التنفيذ'}"`;
          const dueDate = `"${t.dueDate || '-'}"`;
          const est = t.estimatedDurationMinutes || 0;
          csvContent += `${titleEscaped},${cat},${prio},${status},${dueDate},${est}\n`;
        });
        csvContent += "\n";
      }

      if (type === 'FULL' || type === 'GOALS') {
        csvContent += "=== سجل الأهداف الشخصية (Personal Goals) ===\n";
        csvContent += "عنوان الهدف,التصنيف,النوع,نسبة التقدم (%),تاريخ المستهدف\n";
        goals.forEach(g => {
          const titleEscaped = `"${(g.title || '').replace(/"/g, '""')}"`;
          const cat = `"${g.category || ''}"`;
          const goalType = `"${g.type || 'SHORT_TERM'}"`;
          const prog = `${g.progress || 0}%`;
          const targetDate = `"${g.targetDate || '-'}"`;
          csvContent += `${titleEscaped},${cat},${goalType},${prog},${targetDate}\n`;
        });
        csvContent += "\n";
      }

      if (type === 'FULL' || type === 'FOCUS') {
        csvContent += "=== سجل جلسات التركيز والتركيز الفائق (Focus Sessions) ===\n";
        csvContent += "المهمة المرتبطة,المدة (بالدقائق),التاريخ والوقت\n";
        focusSessions.forEach(fs => {
          const taskName = `"${(fs.taskTitle || 'جلسة تركيز عامة').replace(/"/g, '""')}"`;
          const dur = fs.durationMinutes || 0;
          const date = `"${fs.completedAt ? new Date(fs.completedAt).toLocaleString('ar-EG') : '-'}"`;
          csvContent += `${taskName},${dur},${date}\n`;
        });
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      const fileName = `waqtak_productivity_${type.toLowerCase()}_${dateStr}.csv`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast(`تم تصدير بيانات الإنتاجية بنجاح بصيغة CSV (${fileName})`, 'success');
    } catch (err) {
      console.error('Error exporting CSV:', err);
      showToast('حدث خطأ أثناء تصدير ملف CSV', 'error');
    } finally {
      setIsExporting(false);
      setShowExportDropdown(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-12">
      
      {/* HEADER WITH EXPORT BUTTON */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-blue-600" />
            <span>{t('analyticsTitle')}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            تحليلات شاملة لإنتاجيتك ومعدل إنجاز المهام وساعات التركيز الحقيقية من قاعدة البيانات
          </p>
        </div>

        {/* EXPORT ACTION DROPDOWN */}
        <div className="relative">
          <button
            onClick={() => setShowExportDropdown(!showExportDropdown)}
            disabled={isExporting}
            className="w-full md:w-auto px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>تصدير بيانات الإنتاجية (CSV)</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {showExportDropdown && (
            <div className="absolute left-0 md:right-0 md:left-auto mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-30 animate-fade-in space-y-1">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800">
                اختر نوع البيانات لتصديرها (CSV):
              </div>

              <button
                onClick={() => handleExportCSV('FULL')}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-right"
              >
                <Download className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>التقرير الشامل (الكل)</span>
              </button>

              <button
                onClick={() => handleExportCSV('TASKS')}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-right"
              >
                <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                <span>سجل المهام والتصنيفات فقط</span>
              </button>

              <button
                onClick={() => handleExportCSV('FOCUS')}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-right"
              >
                <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                <span>سجل جلسات التركيز فقط</span>
              </button>

              <button
                onClick={() => handleExportCSV('GOALS')}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-right"
              >
                <Target className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>سجل الأهداف الشخصية فقط</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* TOP STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-500 font-semibold">
            <span>معدل إنجاز المهام</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{taskCompletionRate}%</div>
          <div className="text-[10px] text-slate-500">{completedTasks} من أصل {totalTasks} مهام مكتملة</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-500 font-semibold">
            <span>ساعات التركيز الكلية</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-500">{totalFocusHours} ساعة</div>
          <div className="text-[10px] text-slate-500">{focusSessions.length} جلسة بومودورو مسجلة</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-500 font-semibold">
            <span>متوسط تقدم الأهداف</span>
            <Target className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-indigo-500">{avgGoalProgress}%</div>
          <div className="text-[10px] text-slate-500">{goals.length} أهداف نشطة حالياً</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-500 font-semibold">
            <span>درجة الإنتاجية الذكية</span>
            <Star className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-500">
            {productivityScore}/100
          </div>
          <div className="text-[10px] text-emerald-500 font-bold">أداء ممتاز جداً!</div>
        </div>
      </div>

      {/* CATEGORY BREAKDOWN BARS */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-6">
        <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <PieChart className="w-4 h-4 text-blue-600" />
          <span>توزيع الإنجاز حسب تصنيف المهام</span>
        </h2>

        <div className="space-y-4">
          {categoryStats.map(stat => (
            <div key={stat.category} className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                <span>{stat.category} ({stat.completed}/{stat.total})</span>
                <span className="text-blue-600 dark:text-blue-400">{stat.rate}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${stat.rate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* EXPORT SUMMARY BANNER */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-900/10 via-indigo-900/10 to-purple-900/10 border border-blue-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-blue-600/20 text-blue-600 dark:text-blue-400">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">حفظ وتصدير سجلاتك لجميع الفترات</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              يمكنك استخدام ملفات CSV لتتبع أدائك طويل الأجل في البرامج التفتيشية مثل Excel أو Google Sheets.
            </p>
          </div>
        </div>
        <button
          onClick={() => handleExportCSV('FULL')}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shrink-0 cursor-pointer transition-all flex items-center gap-1.5 shadow-md"
        >
          <Download className="w-3.5 h-3.5" />
          <span>تحميل CSV التراكمي</span>
        </button>
      </div>

    </div>
  );
};

