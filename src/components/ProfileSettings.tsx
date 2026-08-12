import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, Shield, Moon, Sun, Globe, Bell, Sparkles } from 'lucide-react';

export const ProfileSettings: React.FC = () => {
  const { user, lang, setLang, theme, setTheme, t, showToast } = useApp();

  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('تم حفظ التغييرات في ملفك الشخصي بنجاح!');
  };

  const presetAvatars = [
    `https://api.dicebear.com/7.x/avataaars/svg?seed=Adham`,
    `https://api.dicebear.com/7.x/avataaars/svg?seed=Mohamed`,
    `https://api.dicebear.com/7.x/avataaars/svg?seed=Shawky`,
    `https://api.dicebear.com/7.x/avataaars/svg?seed=Yossef`,
    `https://api.dicebear.com/7.x/avataaars/svg?seed=Yassen`,
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      
      {/* HEADER */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="w-6 h-6 text-blue-600" />
          <span>{t('profile')}</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          إدارة بيانات حسابك الشخصي والصور الرمزية والتفضيلات العامة
        </p>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-6">
        
        {/* User Card info */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <img
            src={avatar || user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
            alt={user?.name}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-500 shadow-md"
          />
          <div>
            <h2 className="font-extrabold text-lg text-slate-900 dark:text-white">{user?.name}</h2>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              الدور: {user?.role}
            </span>
          </div>
        </div>

        {/* Avatar Preset Picker */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">اختر صورة رمزية جديدة:</label>
          <div className="flex gap-3">
            {presetAvatars.map((url, i) => (
              <img
                key={i}
                src={url}
                alt="Avatar"
                onClick={() => setAvatar(url)}
                className={`w-12 h-12 rounded-xl cursor-pointer hover:scale-110 transition-transform p-0.5 border-2 ${
                  avatar === url ? 'border-blue-600' : 'border-transparent'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الاسم الكامل</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">اللغة المفضلة</label>
              <button
                type="button"
                onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold flex items-center justify-between"
              >
                <span>{lang === 'ar' ? 'العربية (RTL)' : 'English (LTR)'}</span>
                <Globe className="w-4 h-4 text-blue-600" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">مظهر التطبيق</label>
              <button
                type="button"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold flex items-center justify-between"
              >
                <span>{theme === 'dark' ? 'الوضع الداكن (Dark)' : 'الوضع الفاتح (Light)'}</span>
                {theme === 'dark' ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-slate-700" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            حفظ التغييرات
          </button>
        </form>

      </div>

    </div>
  );
};
