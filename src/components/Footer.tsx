import React from 'react';
import { useApp } from '../context/AppContext';
import { Clock, Heart, ShieldCheck, Github, Twitter, Linkedin } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t, setCurrentView, lang } = useApp();
  const isRtl = lang === 'ar';

  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-slate-300 dark:text-slate-400 border-t border-slate-800 dark:border-slate-800/80 pt-10 pb-16 lg:pb-8 mt-12 sm:mt-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-white animate-pulse" />
              </div>
              <span className="font-extrabold text-lg text-white">وقتك — WAQTAK</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t('tagline')}
            </p>
            <div className="inline-flex items-center gap-2 text-[11px] text-blue-400 font-semibold bg-blue-950/60 px-3 py-1.5 rounded-lg border border-blue-900/50">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>{isRtl ? 'مشروع تخرج — Chronox Team' : 'Graduation Project — Chronox Team'}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              {isRtl ? 'الروابط السريعة' : 'Quick Links'}
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button onClick={() => setCurrentView('landing')} className="hover:text-blue-400 transition-colors cursor-pointer">
                  {isRtl ? 'الرئيسية' : 'Home'}
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('team')} className="hover:text-blue-400 transition-colors cursor-pointer">
                  {isRtl ? 'فريق Chronox' : 'Chronox Team'}
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('contact')} className="hover:text-blue-400 transition-colors cursor-pointer">
                  {isRtl ? 'اتصل بنا' : 'Contact Us'}
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('support')} className="hover:text-blue-400 transition-colors cursor-pointer">
                  {isRtl ? 'مركز الدعم' : 'Support Center'}
                </button>
              </li>
            </ul>
          </div>

          {/* Chronox Team Members */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              {isRtl ? 'أعضاء الفريق (Chronox)' : 'Team Members (Chronox)'}
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li className="flex justify-between items-center"><span>Mohamed Ahmed</span><span className="text-blue-400 font-medium">Team Leader</span></li>
              <li className="flex justify-between items-center"><span>Adham Ahmed</span><span className="text-slate-300">Developer</span></li>
              <li className="flex justify-between items-center"><span>Shawky Ismail</span><span className="text-slate-300">UI/UX</span></li>
              <li className="flex justify-between items-center"><span>Yossef</span><span className="text-slate-300">Presentation</span></li>
              <li className="flex justify-between items-center"><span>Yassen</span><span className="text-slate-300">Developer</span></li>
            </ul>
          </div>

          {/* Legal & Social */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              {isRtl ? 'الخصوصية والشروط' : 'Privacy & Terms'}
            </h4>
            <ul className="space-y-2.5 text-xs mb-5">
              <li>
                <button onClick={() => setCurrentView('privacy')} className="hover:text-blue-400 transition-colors cursor-pointer">
                  {isRtl ? 'سياسة الخصوصية' : 'Privacy Policy'}
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('terms')} className="hover:text-blue-400 transition-colors cursor-pointer">
                  {isRtl ? 'شروط الاستخدام' : 'Terms of Service'}
                </button>
              </li>
            </ul>
            <div className="flex gap-2.5 text-slate-400">
              <a href="#" aria-label="Twitter" className="p-2 rounded-xl bg-slate-800 hover:bg-blue-600 hover:text-white transition-all"><Twitter className="w-4 h-4" /></a>
              <a href="#" aria-label="GitHub" className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 hover:text-white transition-all"><Github className="w-4 h-4" /></a>
              <a href="#" aria-label="LinkedIn" className="p-2 rounded-xl bg-slate-800 hover:bg-blue-700 hover:text-white transition-all"><Linkedin className="w-4 h-4" /></a>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3 text-center sm:text-right">
          <div>
            © {new Date().getFullYear()} WAQTAK — وقتك. {isRtl ? 'جميع الحقوق محفوظة لـ Chronox Team.' : 'All rights reserved to Chronox Team.'}
          </div>
          <div className="flex items-center gap-1">
            <span>{isRtl ? 'تم التطوير بواسطة' : 'Developed with'}</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline mx-0.5" />
            <span className="font-bold text-slate-300">Chronox Team</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
