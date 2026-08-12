import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, FileText } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 text-slate-800 dark:text-slate-200">
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <ShieldCheck className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-black">سياسة الخصوصية — وقتك (WAQTAK)</h1>
          <p className="text-xs text-slate-500">آخر تحديث: 2026 — Chronox Team</p>
        </div>
      </div>

      <div className="space-y-4 text-xs leading-relaxed">
        <h3 className="font-bold text-sm text-blue-600">1. مقدمة</h3>
        <p>
          نحن في فريق Chronox نحترم خصوصية مستخدمي منصة وقتك (WAQTAK) ونلتزم بحماية بياناتهم الشخصية وأنشطتهم اليومية.
        </p>

        <h3 className="font-bold text-sm text-blue-600">2. البيانات التي نجمعها</h3>
        <p>
          نجمع فقط البيانات الضرورية لتشغيل المنصة، وتتضمن: الاسم، البريد الإلكتروني، المهام المسجلة، الأهداف، وجلسات التركيز.
        </p>

        <h3 className="font-bold text-sm text-blue-600">3. حماية وتخزين البيانات</h3>
        <p>
          يتم تخزين كافة البيانات بأمان ومشفرة على خوادمنا ولا يتم مشاركتها مطلقاً مع أي طرف ثالث لأغراض تجارية.
        </p>
      </div>
    </div>
  );
};

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 text-slate-800 dark:text-slate-200">
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <FileText className="w-8 h-8 text-indigo-600" />
        <div>
          <h1 className="text-2xl font-black">شروط الاستخدام — وقتك (WAQTAK)</h1>
          <p className="text-xs text-slate-500">آخر تحديث: 2026 — Chronox Team</p>
        </div>
      </div>

      <div className="space-y-4 text-xs leading-relaxed">
        <h3 className="font-bold text-sm text-indigo-600">1. القبول بالشروط</h3>
        <p>
          باستخدامك لمنصة وقتك فإنك توافق التزامك الكامل بشروط وأحكام الخدمة المبينة هنا.
        </p>

        <h3 className="font-bold text-sm text-indigo-600">2. حقوق الملكية الفكرية</h3>
        <p>
          جميع العلامات والتصاميم والشعارات الخاصة بـ وقتك و Chronox Team هي ملك حائل للفريق المطور للمشروع.
        </p>
      </div>
    </div>
  );
};
