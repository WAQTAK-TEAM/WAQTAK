import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Clock, CheckSquare, Calendar, Target, BarChart2,
  Zap, Bot, Shield, HelpCircle, MessageSquare, Sun, Moon,
  Globe, Bell, LogIn, LogOut, User, Menu, X
} from 'lucide-react';

export const Navbar: React.FC<{ onOpenAuth: () => void; onOpenFeedback: () => void }> = ({
  onOpenAuth,
  onOpenFeedback
}) => {
  const { user, lang, setLang, theme, setTheme, t, logout, currentView, setCurrentView, notifications, markNotificationRead } = useApp();
  const [showNotifs, setShowNotifs] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const navLinks = [
    { id: 'dashboard', label: t('dashboard'), icon: BarChart2, reqAuth: true },
    { id: 'tasks', label: t('tasks'), icon: CheckSquare, reqAuth: true },
    { id: 'calendar', label: t('calendar'), icon: Calendar, reqAuth: true },
    { id: 'goals', label: t('goals'), icon: Target, reqAuth: true },
    { id: 'focus', label: t('focus'), icon: Zap, reqAuth: true },
    { id: 'ai', label: t('aiAssistant'), icon: Bot, reqAuth: true },
    { id: 'statistics', label: t('statistics'), icon: BarChart2, reqAuth: true },
    { id: 'team', label: t('aboutTeam'), icon: Clock, reqAuth: false },
  ];

  if (user?.role === 'ADMIN') {
    navLinks.push({ id: 'admin', label: t('adminDashboard'), icon: Shield, reqAuth: true });
  }

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentView('landing')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-400 p-0.5 shadow-md shadow-blue-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-400 bg-clip-text text-transparent">
                  وقتك
                </span>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  WAQTAK
                </span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block -mt-1">
                by Chronox Team
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              if (link.reqAuth && !user) return null;
              const Icon = link.icon;
              const isActive = currentView === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setCurrentView(link.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            
            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs font-bold"
              title="تغيير اللغة / Change Language"
            >
              <Globe className="w-4 h-4" />
              <span>{lang === 'ar' ? 'EN' : 'عربي'}</span>
            </button>

            {/* Dark / Light Mode */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="تغيير المظهر / Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Notifications Dropdown */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifs(!showNotifs)}
                  className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifs && (
                  <div className={`absolute ${lang === 'ar' ? 'left-0' : 'right-0'} mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-3 z-50`}>
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="font-bold text-xs text-slate-900 dark:text-slate-100">الإشعارات</span>
                      <span className="text-[10px] text-slate-500">{unreadCount} غير مقروء</span>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate-500 text-center py-4">أنت تمام! لا توجد إشعارات حالياً.</p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => markNotificationRead(n.id)}
                            className={`p-2.5 rounded-xl text-xs cursor-pointer transition-colors ${
                              n.read ? 'bg-slate-50 dark:bg-slate-800/40 opacity-70' : 'bg-blue-50/80 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50'
                            }`}
                          >
                            <div className="font-semibold text-slate-900 dark:text-slate-100">{n.title}</div>
                            <div className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5">{n.message}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Profile / Login */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                    alt={user.name}
                    className="w-8 h-8 rounded-lg object-cover ring-2 ring-blue-500/50"
                  />
                  <span className="hidden sm:inline text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {user.name.split(' ')[0]}
                  </span>
                </button>

                {showUserMenu && (
                  <div className={`absolute ${lang === 'ar' ? 'left-0' : 'right-0'} mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50`}>
                    <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                      <div className="font-bold text-xs text-slate-900 dark:text-slate-100">{user.name}</div>
                      <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                        {user.role}
                      </span>
                    </div>

                    <div className="py-1 space-y-0.5">
                      <button
                        onClick={() => { setCurrentView('profile'); setShowUserMenu(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>{t('profile')}</span>
                      </button>

                      <button
                        onClick={() => { setCurrentView('support'); setShowUserMenu(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>{t('supportCenter')}</span>
                      </button>

                      <button
                        onClick={() => { onOpenFeedback(); setShowUserMenu(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{t('feedback')}</span>
                      </button>

                      <button
                        onClick={() => { logout(); setShowUserMenu(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 font-semibold"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{t('logout')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t('login')}</span>
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 p-4 space-y-2">
          {navLinks.map((link) => {
            if (link.reqAuth && !user) return null;
            const Icon = link.icon;
            return (
              <button
                key={link.id}
                onClick={() => { setCurrentView(link.id); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium ${
                  currentView === link.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
