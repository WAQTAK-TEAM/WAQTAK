import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { TaskManagement } from './components/TaskManagement';
import { GoalManagement } from './components/GoalManagement';
import { CalendarView } from './components/CalendarView';
import { FocusMode } from './components/FocusMode';
import { WaqtakAI } from './components/WaqtakAI';
import { StatisticsView } from './components/StatisticsView';
import { SupportCenter } from './components/SupportCenter';
import { AdminDashboard } from './components/AdminDashboard';
import { ChronoxTeam } from './components/ChronoxTeam';
import { ContactPage } from './components/ContactPage';
import { ProfileSettings } from './components/ProfileSettings';
import { PrivacyPolicyPage, TermsPage } from './components/LegalPages';
import { AuthModal } from './components/AuthModal';
import { FeedbackModal } from './components/FeedbackModal';
import {
  BarChart2, CheckSquare, Zap, Target, Bot, Plus
} from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, currentView, setCurrentView, toast, setIsQuickTaskModalOpen } = useApp();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);

  const renderView = () => {
    switch (currentView) {
      case 'landing':
        return <LandingPage onOpenAuth={() => setAuthModalOpen(true)} />;
      case 'dashboard':
        return <Dashboard />;
      case 'tasks':
        return <TaskManagement />;
      case 'goals':
        return <GoalManagement />;
      case 'calendar':
        return <CalendarView />;
      case 'focus':
        return <FocusMode />;
      case 'ai':
        return <WaqtakAI />;
      case 'statistics':
        return <StatisticsView />;
      case 'support':
        return <SupportCenter />;
      case 'admin':
        return <AdminDashboard />;
      case 'team':
        return <ChronoxTeam />;
      case 'contact':
        return <ContactPage />;
      case 'profile':
        return <ProfileSettings />;
      case 'privacy':
        return <PrivacyPolicyPage />;
      case 'terms':
        return <TermsPage />;
      default:
        return <LandingPage onOpenAuth={() => setAuthModalOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors font-sans pb-16 lg:pb-0">
      
      {/* Toast notification banner */}
      {toast && (
        <div className={`fixed top-16 lg:top-auto lg:bottom-6 left-1/2 -translate-x-1/2 lg:translate-x-0 lg:left-6 z-50 px-5 py-3 rounded-2xl shadow-2xl font-bold text-xs flex items-center gap-2 animate-bounce ${
          toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
        }`}>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Sidebar Component */}
      <Sidebar
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenFeedback={() => setFeedbackModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20 lg:pb-16">
          {renderView()}
        </main>

        {/* Footer */}
        <Footer />
      </div>

      {/* Mobile First Bottom Sticky Navigation Bar */}
      {user && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-2 py-2 flex items-center justify-around shadow-2xl">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`flex flex-col items-center gap-1 p-1.5 text-[10px] font-bold ${
              currentView === 'dashboard' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'
            }`}
          >
            <BarChart2 className="w-5 h-5" />
            <span>الرئيسية</span>
          </button>

          <button
            onClick={() => setCurrentView('tasks')}
            className={`flex flex-col items-center gap-1 p-1.5 text-[10px] font-bold ${
              currentView === 'tasks' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'
            }`}
          >
            <CheckSquare className="w-5 h-5" />
            <span>المهام</span>
          </button>

          {/* Quick Add Action Button in Middle */}
          <button
            onClick={() => {
              if (currentView !== 'tasks') setCurrentView('tasks');
              setIsQuickTaskModalOpen(true);
            }}
            className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 -mt-5 border-2 border-white dark:border-slate-900"
            title="إضافة مهمة سريعة"
          >
            <Plus className="w-6 h-6" />
          </button>

          <button
            onClick={() => setCurrentView('focus')}
            className={`flex flex-col items-center gap-1 p-1.5 text-[10px] font-bold ${
              currentView === 'focus' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'
            }`}
          >
            <Zap className="w-5 h-5" />
            <span>التركيز</span>
          </button>

          <button
            onClick={() => setCurrentView('ai')}
            className={`flex flex-col items-center gap-1 p-1.5 text-[10px] font-bold ${
              currentView === 'ai' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'
            }`}
          >
            <Bot className="w-5 h-5" />
            <span>وقتك AI</span>
          </button>
        </div>
      )}

      {/* Modals */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <FeedbackModal isOpen={feedbackModalOpen} onClose={() => setFeedbackModalOpen(false)} />

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
