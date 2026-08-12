import React from 'react';
import { useApp } from '../context/AppContext';
import { AdBanner } from './AdBanner';
import {
  CheckCircle2, Clock, Sparkles, Bot, Target, Calendar,
  Zap, BarChart2, Shield, ArrowLeft, ArrowRight, Play, Users, Star
} from 'lucide-react';
import adhamImg from '../assets/images/adham_exact_photo_1786478009102.jpg';

export const LandingPage: React.FC<{ onOpenAuth: () => void }> = ({ onOpenAuth }) => {
  const { user, lang, t, setCurrentView } = useApp();

  return (
    <div className="space-y-24 py-8 overflow-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-8 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Glow backdrop */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-blue-500/10 dark:bg-blue-600/15 blur-3xl rounded-full pointer-events-none -z-10" />

        <div className="text-center space-y-6 max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-300 text-xs font-semibold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-spin" />
            <span>منصة الإنتاجية وإدارة الوقت برؤية الذكاء الاصطناعي — Chronox Team</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400 bg-clip-text text-transparent">
              {t('heroHeadline')}
            </span>
          </h1>

          {/* Subhead */}
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {t('heroSubhead')}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => user ? setCurrentView('dashboard') : onOpenAuth()}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>{t('getStarted')}</span>
              {lang === 'ar' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setCurrentView('team')}
              className="px-6 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-sm border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
            >
              {t('discoverWaqtak')}
            </button>
          </div>
        </div>

        {/* Hero Interactive Dashboard Mockup Preview */}
        <div className="mt-12 relative max-w-5xl mx-auto rounded-3xl p-3 bg-gradient-to-b from-blue-500/20 via-slate-200/50 to-slate-900/40 dark:from-blue-600/30 dark:to-slate-900/80 shadow-2xl">
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 text-slate-100 shadow-inner overflow-hidden">
            {/* Window bar */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <span className="text-slate-500 font-mono text-[11px]">app.waqtak.chronox.app/dashboard</span>
              <span className="px-2 py-0.5 rounded bg-blue-900/60 text-blue-400 font-bold text-[10px]">LIVE DEMO</span>
            </div>

            {/* Simulated UI layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
              
              {/* Task list preview */}
              <div className="md:col-span-2 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-200">مهام اليوم العاجلة</h3>
                  <span className="text-xs text-blue-400 font-semibold">3 مهام متبقية</span>
                </div>
                
                <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-400" />
                    <div>
                      <div className="font-bold text-xs text-white">إعداد العرض التقديمي لمشروع التخرج</div>
                      <div className="text-[10px] text-slate-400">مطلوب تسليمها الساعة 6:00 مساءً</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-300 border border-red-800">URGENT</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-slate-500" />
                    <div>
                      <div className="font-bold text-xs text-white">اختبار محرك المساعد الذكي وقتك AI</div>
                      <div className="text-[10px] text-slate-400">تجهيز النماذج الصوتية والمحتوى</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">HIGH</span>
                </div>
              </div>

              {/* AI Widget preview */}
              <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-800/60 space-y-3 ai-glow">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
                  <Bot className="w-4 h-4 animate-bounce" />
                  <span>توصية وقتك AI</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  "لديك مهمتان عالتا الأولوية اليوم. يُفضل بدء جلسة تركيز لمدة 25 دقيقة لإنجاز المهمة الأولى قبل الاجتماع."
                </p>
                <div className="p-2 rounded-lg bg-blue-600/30 text-blue-200 text-[11px] font-semibold text-center border border-blue-500/40">
                  بدء جلسة التركيز الآن ⏱️
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* PUBLIC ADVERTISEMENT BANNER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdBanner placement="PUBLIC" />
      </div>

      {/* 2. FEATURES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-16">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {t('featuresTitle')}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            {t('featuresSubhead')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: t('featSmartTasks'), desc: t('featSmartTasksDesc'), icon: CheckCircle2, color: 'from-blue-500 to-indigo-500' },
            { title: t('featTimeMgmt'), desc: t('featTimeMgmtDesc'), icon: Calendar, color: 'from-indigo-500 to-purple-500' },
            { title: t('featFocusMode'), desc: t('featFocusModeDesc'), icon: Zap, color: 'from-amber-500 to-orange-500' },
            { title: t('featGoals'), desc: t('featGoalsDesc'), icon: Target, color: 'from-emerald-500 to-teal-500' },
            { title: t('featAnalytics'), desc: t('featAnalyticsDesc'), icon: BarChart2, color: 'from-cyan-500 to-blue-500' },
            { title: t('featAI'), desc: t('featAIDesc'), icon: Bot, color: 'from-blue-600 to-violet-600' },
            { title: 'أولويات ديناميكية', desc: 'محرك ترتيب الأولويات تلقائياً بناءً على موعد الاستحقاق والأهمية.', icon: Clock, color: 'from-rose-500 to-pink-500' },
            { title: 'أمان وسرية البيانات', desc: 'حماية كاملة وحفظ سحابي دائم لبياناتك الخاصة بنسبة 100%.', icon: Shield, color: 'from-blue-700 to-slate-800' },
          ].map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${feat.color} text-white flex items-center justify-center mb-4 shadow-md`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">{feat.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. AI SHOWCASE SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-blue-900/50 p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30">
                <Bot className="w-4 h-4 text-blue-400 animate-bounce" />
                <span>المساعد الذكي للإنتاجية</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {t('aiSectionTitle')}
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed">
                {t('aiSectionSubhead')}
              </p>

              <div className="space-y-3">
                {[t('aiFeature1'), t('aiFeature2'), t('aiFeature3'), t('aiFeature4')].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs text-slate-200">
                    <div className="w-5 h-5 rounded-full bg-blue-600/40 text-blue-400 flex items-center justify-center shrink-0">
                      ✓
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => user ? setCurrentView('ai') : onOpenAuth()}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/30 transition-all cursor-pointer"
              >
                تحدث مع وقتك AI الآن
              </button>
            </div>

            {/* AI Mockup chat */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-xs font-bold text-blue-400">
                <Bot className="w-4 h-4" />
                <span>محادثة وقتك AI التفاعلية</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 text-xs text-slate-200 space-y-1">
                <div className="text-[10px] text-blue-400 font-bold">أنت:</div>
                <div>"رتب لي مهام اليوم وحول هدفي إلى خطة عمل!"</div>
              </div>

              <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-800/60 text-xs text-slate-200 space-y-2">
                <div className="text-[10px] text-blue-400 font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> وقتك AI:
                </div>
                <div>"تم تحليل مهامك وأهدافك! قمت بجدولة المهمة العاجلة أولاً وإضافة 3 محطات لمشروع التخرج."</div>
                <div className="p-2 rounded bg-blue-600/30 text-[10px] font-bold text-blue-200 border border-blue-500/40 cursor-pointer text-center">
                  [تأكيد إضافة المهام الموصى بها]
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-16">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {t('howItWorksTitle')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { num: '01', title: t('step1Title'), desc: t('step1Desc') },
            { num: '02', title: t('step2Title'), desc: t('step2Desc') },
            { num: '03', title: t('step3Title'), desc: t('step3Desc') },
            { num: '04', title: t('step4Title'), desc: t('step4Desc') },
          ].map((step, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 relative">
              <span className="text-3xl font-black text-blue-600 dark:text-blue-500 opacity-30">{step.num}</span>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">{step.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. CHRONOX TEAM SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold">
            <Users className="w-3.5 h-3.5" />
            <span>Chronox Team</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {t('teamTitle')}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
            {t('teamSubhead')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { name: 'Mohamed Ahmed', role: t('m2Role'), isLead: true, img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80' },
            { name: 'Adham Ahmed', role: t('m1Role'), img: adhamImg },
            { name: 'Shawky Ismail', role: t('m3Role'), img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80' },
            { name: 'Yossef', role: t('m4Role'), img: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80' },
            { name: 'Yassen', role: t('m5Role'), img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80' },
          ].map((m, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border ${
                m.isLead ? 'border-blue-500 shadow-lg shadow-blue-500/10' : 'border-slate-200 dark:border-slate-800'
              } text-center space-y-3`}
            >
              <img
                src={m.img}
                alt={m.name}
                className="w-20 h-20 rounded-full mx-auto object-cover ring-2 ring-blue-500/30"
              />
              <div>
                <div className="font-bold text-sm text-slate-900 dark:text-white">{m.name}</div>
                <div className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">{m.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
