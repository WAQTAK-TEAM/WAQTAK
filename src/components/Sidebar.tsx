import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AdBanner } from './AdBanner';
import {
  Clock, CheckSquare, Calendar, Target, BarChart2,
  Zap, Bot, Shield, HelpCircle, MessageSquare, Sun, Moon,
  Globe, Bell, LogIn, LogOut, User, Menu, X, ChevronLeft, ChevronRight, Plus, Users
} from 'lucide-react';

export const Sidebar: React.FC<{ onOpenAuth: () => void; onOpenFeedback: () => void }> = ({
  onOpenAuth,
  onOpenFeedback
}) => {
  const {
    user,
    lang,
    setLang,
    theme,
    setTheme,
    t,
    logout,
    currentView,
    setCurrentView,
    notifications,
    markNotificationRead,
    setIsQuickTaskModalOpen,
    tasks
  } = useApp();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;
  const pendingTasksCount = tasks.filter(t => t.status !== 'COMPLETED').length;

  const navLinks = [
    { id: 'dashboard', label: t('dashboard'), icon: BarChart2, reqAuth: true },
    { id: 'tasks', label: t('tasks'), icon: CheckSquare, reqAuth: true, badge: pendingTasksCount > 0 ? pendingTasksCount : null },
    { id: 'calendar', label: t('calendar'), icon: Calendar, reqAuth: true },
    { id: 'goals', label: t('goals'), icon: Target, reqAuth: true },
    { id: 'focus', label: t('focus'), icon: Zap, reqAuth: true },
    { id: 'ai', label: t('aiAssistant'), icon: Bot, reqAuth: true },
    { id: 'statistics', label: t('statistics'), icon: BarChart2, reqAuth: true },
    { id: 'team', label: t('aboutTeam'), icon: Users, reqAuth: false },
  ];

  if (user?.role === 'ADMIN') {
    navLinks.push({ id: 'admin', label: t('adminDashboard'), icon: Shield, reqAuth: true });
  }

  const isRtl = lang === 'ar';

  return (
    <>
      {/* Mobile Top Navigation Header */}
      <div className="lg:hidden sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setCurrentView('landing')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-400 p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
              <Clock className="w-4 h-4 text-blue-400 animate-pulse" />
            </div>
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-blue-600 to-indigo-400 bg-clip-text text-transparent">
              وقتك
            </span>
            <span className="text-[10px] text-slate-400 font-semibold block -mt-1">WAQTAK</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {user && (
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 relative text-slate-700 dark:text-slate-300"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          )}

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Main Container */}
      <aside
        className={`
          fixed lg:sticky top-0 z-50 h-screen
          bg-white dark:bg-slate-900 border-x border-slate-200/80 dark:border-slate-800/80
          flex flex-col justify-between transition-all duration-300 ease-in-out shadow-2xl lg:shadow-none
          ${mobileOpen ? 'translate-x-0' : isRtl ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${collapsed ? 'lg:w-20' : 'lg:w-64'}
          w-72 inset-y-0 ${isRtl ? 'right-0' : 'left-0'}
        `}
      >
        {/* Top Header & Brand */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer overflow-hidden"
            onClick={() => { setCurrentView('landing'); setMobileOpen(false); }}
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-500 p-0.5 shadow-lg shadow-blue-500/20 shrink-0 flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-400 animate-pulse" />
              </div>
            </div>

            {!collapsed && (
              <div className="animate-fade-in truncate">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-400 bg-clip-text text-transparent">
                    وقتك
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                    WAQTAK
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium block">
                  by Chronox Team
                </span>
              </div>
            )}
          </div>

          {/* Collapse Toggle for Desktop */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
            title={collapsed ? 'توسيع القائمة' : 'طي القائمة'}
          >
            {isRtl ? (
              collapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
            ) : (
              collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Quick Add Task Button */}
        {user && (
          <div className="px-3 pt-4">
            <button
              onClick={() => {
                if (currentView !== 'tasks') setCurrentView('tasks');
                setIsQuickTaskModalOpen(true);
                setMobileOpen(false);
              }}
              className={`w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer ${
                collapsed ? 'px-0' : ''
              }`}
              title="إضافة مهمة سريعة"
            >
              <Plus className="w-4 h-4 shrink-0" />
              {!collapsed && <span>إضافة مهمة جديد</span>}
            </button>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {navLinks.map((link) => {
            if (link.reqAuth && !user) return null;
            const Icon = link.icon;
            const isActive = currentView === link.id;

            return (
              <button
                key={link.id}
                onClick={() => {
                  setCurrentView(link.id);
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer relative group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                }`}
                title={collapsed ? link.label : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-blue-500'}`} />
                
                {!collapsed && (
                  <span className="truncate text-right flex-1">{link.label}</span>
                )}

                {/* Badge Counter */}
                {link.badge && !collapsed && (
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                    isActive ? 'bg-white text-blue-700' : 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300'
                  }`}>
                    {link.badge}
                  </span>
                )}

                {/* Active Indicator bar */}
                {isActive && (
                  <span className={`absolute ${isRtl ? '-right-1' : '-left-1'} top-2 bottom-2 w-1 bg-amber-400 rounded-full`} />
                )}
              </button>
            );
          })}

          {!collapsed && (
            <div className="pt-2 px-1">
              <AdBanner placement="SIDEBAR" />
            </div>
          )}
        </nav>

        {/* Footer Actions & Settings in Sidebar */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
          
          {/* Controls row: Theme & Language */}
          <div className={`flex items-center ${collapsed ? 'flex-col gap-2' : 'justify-between px-2'}`}>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 text-xs font-bold cursor-pointer"
              title="تغيير المظهر"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
              {!collapsed && <span className="text-[11px]">{theme === 'dark' ? 'الوضع الفاتح' : 'الوضع الداكن'}</span>}
            </button>

            <button
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              title="تغيير اللغة"
            >
              <Globe className="w-4 h-4 text-blue-500" />
              {!collapsed && <span className="text-[11px]">{lang === 'ar' ? 'English' : 'العربية'}</span>}
            </button>
          </div>

          {/* User Profile Section */}
          {user ? (
            <div className="relative pt-2 border-t border-slate-100 dark:border-slate-800/60">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-full flex items-center gap-2.5 p-2 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                  alt={user.name}
                  className="w-8 h-8 rounded-xl object-cover ring-2 ring-blue-500/50 shrink-0"
                />
                {!collapsed && (
                  <div className="flex-1 text-right truncate">
                    <div className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">{user.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
                  </div>
                )}
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className={`absolute bottom-full mb-2 ${isRtl ? 'right-0' : 'left-0'} w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-fade-in`}>
                  <button
                    onClick={() => { setCurrentView('profile'); setShowUserMenu(false); setMobileOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <User className="w-3.5 h-3.5 text-blue-500" />
                    <span>{t('profile')}</span>
                  </button>

                  <button
                    onClick={() => { setCurrentView('support'); setShowUserMenu(false); setMobileOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-purple-500" />
                    <span>{t('supportCenter')}</span>
                  </button>

                  <button
                    onClick={() => { onOpenFeedback(); setShowUserMenu(false); setMobileOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
                    <span>{t('feedback')}</span>
                  </button>

                  <button
                    onClick={() => { logout(); setShowUserMenu(false); setMobileOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 font-bold"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{t('logout')}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => { onOpenAuth(); setMobileOpen(false); }}
              className={`w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                collapsed ? 'px-0' : ''
              }`}
            >
              <LogIn className="w-4 h-4 shrink-0" />
              {!collapsed && <span>{t('login')}</span>}
            </button>
          )}

        </div>
      </aside>
    </>
  );
};
