import React from 'react';
import { useApp } from '../context/AppContext';
import { Users, Award, Heart, Shield, Code, Layout, Presentation, Clock } from 'lucide-react';
import adhamImg from '../assets/images/adham_exact_photo_1786478009102.jpg';

export const ChronoxTeam: React.FC = () => {
  const { t } = useApp();

  const members = [
    {
      name: 'Mohamed Ahmed',
      role: t('m2Role'),
      icon: Shield,
      bio: 'قائد الفريق والمشرف التنفيذي على معمارية وقتك وإدارة المشاريع.',
      img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
      isLeader: true
    },
    {
      name: 'Adham Ahmed',
      role: t('m1Role'),
      icon: Code,
      bio: 'مطور الأنظمة الخلفية والمحرك الذكي وقتك AI مع الربط بالذكاء الاصطناعي.',
      img: adhamImg
    },
    {
      name: 'Shawky Ismail',
      role: t('m3Role'),
      icon: Layout,
      bio: 'مصمم واجهات المستخدم وتجربة المستخدم بتصميم عصري راقٍ وداعم للغة العربية.',
      img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80'
    },
    {
      name: 'Yossef',
      role: t('m4Role'),
      icon: Presentation,
      bio: 'مسؤول العرض التقديمي وتوثيق المشروع وعرض الأفكار والرؤية الاستراتيجية.',
      img: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&auto=format&fit=crop&q=80'
    },
    {
      name: 'Yassen',
      role: t('m5Role'),
      icon: Code,
      bio: 'مطور الواجهات والأدوات التفاعلية واختبار الأداء والسرعة.',
      img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80'
    }
  ];

  return (
    <div className="space-y-12 animate-fade-in max-w-5xl mx-auto">
      
      {/* HEADER */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold">
          <Clock className="w-4 h-4" />
          <span>Chronox Team Graduation Project</span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white">
          فريق Chronox — وقتك
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          نحن فريق من المهندسين المبدعين نسعى لإعادة تعريف طريقة إدارة الوقت والإنتاجية في العالم العربي من خلال ابتكار منصة ذكية تلبي كافة الاحتياجات.
        </p>
      </div>

      {/* TEAM MEMBERS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((m, i) => {
          const Icon = m.icon;
          return (
            <div
              key={i}
              className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border ${
                m.isLeader ? 'border-blue-500 shadow-xl shadow-blue-500/10' : 'border-slate-200 dark:border-slate-800'
              } text-center space-y-4 transition-all hover:-translate-y-1`}
            >
              <div className="relative w-24 h-24 mx-auto">
                <img
                  src={m.img}
                  alt={m.name}
                  className="w-24 h-24 rounded-2xl object-cover ring-2 ring-blue-500/40 shadow-md"
                />
                <div className="absolute -bottom-2 -right-2 p-1.5 rounded-xl bg-blue-600 text-white shadow-md">
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>

              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{m.name}</h3>
                <div className="text-xs text-blue-600 dark:text-blue-400 font-bold mt-0.5">{m.role}</div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {m.bio}
              </p>
            </div>
          );
        })}
      </div>

    </div>
  );
};
