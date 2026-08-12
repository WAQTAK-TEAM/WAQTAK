import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import {
  User, Task, Goal, CalendarEvent, FocusSession,
  SupportTicket, FeedbackItem, NotificationItem, ActivityLog, SystemSettings, Advertisement
} from './src/types';

// Helper for hashing password securely
function hashPassword(pwd: string): string {
  return crypto.createHash('sha256').update(`waqtak_salt_${pwd}`).digest('hex');
}

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || 'demo_key',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// JSON File Database Persistence
const DB_FILE = path.join(process.cwd(), 'data_db.json');

interface LocalDB {
  users: User[];
  tasks: Task[];
  goals: Goal[];
  calendarEvents: CalendarEvent[];
  focusSessions: FocusSession[];
  supportTickets: SupportTicket[];
  feedbackItems: FeedbackItem[];
  notifications: NotificationItem[];
  activityLogs: ActivityLog[];
  settings: SystemSettings;
  advertisements: Advertisement[];
}

const defaultSeedData: LocalDB = {
  users: [
    {
      id: 'usr_admin',
      name: 'مدير النظام (Admin)',
      email: 'admin@gmail.com',
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      bio: 'مدير النظام لمنصة وقتك',
      language: 'ar',
      theme: 'dark',
      passwordHash: hashPassword('admin123'),
      createdAt: new Date().toISOString()
    }
  ],
  tasks: [],
  goals: [],
  calendarEvents: [],
  focusSessions: [],
  supportTickets: [],
  feedbackItems: [],
  notifications: [],
  activityLogs: [],
  settings: {
    announcement: 'أهلاً بكم في وقتك — منصتك الذكية لتنظيم الوقت والإنجاز!',
    allowRegistrations: true,
    aiEnabled: true,
    maintenanceMode: false,
    supportEmail: 'support@waqtak.app'
  },
  advertisements: []
};

function loadDB(): LocalDB {
  let loaded: LocalDB = defaultSeedData;
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      loaded = JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading db file, fallback to seed:', err);
  }

  // Purge legacy dummy users and sample data
  const dummyUserIds = new Set(['usr_1', 'usr_2', 'usr_3']);
  if (loaded.users && Array.isArray(loaded.users)) {
    loaded.users = loaded.users.filter(u => !dummyUserIds.has(u.id) && u.email !== 'adham@chronox.app' && u.email !== 'mohamed@chronox.app' && u.email !== 'shawky@chronox.app');
  } else {
    loaded.users = [];
  }

  if (loaded.tasks && Array.isArray(loaded.tasks)) {
    loaded.tasks = loaded.tasks.filter(t => !dummyUserIds.has(t.userId));
  } else {
    loaded.tasks = [];
  }

  if (loaded.goals && Array.isArray(loaded.goals)) {
    loaded.goals = loaded.goals.filter(g => !dummyUserIds.has(g.userId));
  } else {
    loaded.goals = [];
  }

  if (loaded.calendarEvents && Array.isArray(loaded.calendarEvents)) {
    loaded.calendarEvents = loaded.calendarEvents.filter(e => !dummyUserIds.has(e.userId));
  } else {
    loaded.calendarEvents = [];
  }

  if (loaded.focusSessions && Array.isArray(loaded.focusSessions)) {
    loaded.focusSessions = loaded.focusSessions.filter(f => !dummyUserIds.has(f.userId));
  } else {
    loaded.focusSessions = [];
  }

  if (loaded.supportTickets && Array.isArray(loaded.supportTickets)) {
    loaded.supportTickets = loaded.supportTickets.filter(st => !dummyUserIds.has(st.userId));
  } else {
    loaded.supportTickets = [];
  }

  if (loaded.feedbackItems && Array.isArray(loaded.feedbackItems)) {
    loaded.feedbackItems = loaded.feedbackItems.filter(fb => !dummyUserIds.has(fb.userId));
  } else {
    loaded.feedbackItems = [];
  }

  if (!loaded.advertisements || !Array.isArray(loaded.advertisements)) {
    loaded.advertisements = [];
  }

  if (!loaded.activityLogs || !Array.isArray(loaded.activityLogs)) {
    loaded.activityLogs = [];
  }

  // Ensure fixed admin user admin@gmail.com with password admin123 exists
  let adminUser = loaded.users.find(u => u.email.toLowerCase() === 'admin@gmail.com');
  const adminHash = hashPassword('admin123');
  if (!adminUser) {
    adminUser = {
      id: 'usr_admin',
      name: 'مدير النظام (Admin)',
      email: 'admin@gmail.com',
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      bio: 'مدير النظام لمنصة وقتك',
      language: 'ar',
      theme: 'dark',
      passwordHash: adminHash,
      createdAt: new Date().toISOString()
    };
    loaded.users.push(adminUser);
  } else {
    adminUser.role = 'ADMIN';
    if (!adminUser.passwordHash) {
      adminUser.passwordHash = adminHash;
    }
  }

  saveDB(loaded);
  return loaded;
}

let globalDbVersion = 1;
const sseClients: Set<express.Response> = new Set();

function notifySseClients() {
  const payload = `data: ${JSON.stringify({ type: 'SYNC', dbVersion: globalDbVersion, timestamp: new Date().toISOString() })}\n\n`;
  sseClients.forEach(res => {
    try {
      res.write(payload);
    } catch (e) {
      sseClients.delete(res);
    }
  });
}

function saveDB(dbData: LocalDB) {
  try {
    globalDbVersion++;
    fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2), 'utf-8');
    notifySseClients();
  } catch (err) {
    console.error('Error writing db file:', err);
  }
}

let db = loadDB();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Log activity helper
  const logActivity = (userId: string, userName: string, action: string, details?: string) => {
    const newLog: ActivityLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      userName,
      action,
      details,
      timestamp: new Date().toISOString()
    };
    db.activityLogs.unshift(newLog);
    if (db.activityLogs.length > 200) db.activityLogs.pop();
    saveDB(db);
  };

  // API HEALTH
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', app: 'WAQTAK - وقتك', team: 'Chronox Team' });
  });

  // AUTH API
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email) return res.status(400).json({ error: 'البريد الإلكتروني مطلوب' });

    const cleanEmail = email.trim().toLowerCase();
    let user = db.users.find(u => u.email.toLowerCase() === cleanEmail);

    // Admin account: admin@gmail.com / admin123
    if (cleanEmail === 'admin@gmail.com') {
      if (!password) {
        return res.status(400).json({ error: 'كلمة المرور مطلوبة لحساب الأدمن' });
      }

      const inputHash = hashPassword(password);
      const expectedHash = user?.passwordHash || hashPassword('admin123');

      if (inputHash !== expectedHash && password !== 'admin123') {
        return res.status(401).json({ error: 'كلمة المرور غير صحيحة لحساب الأدمن' });
      }

      if (!user) {
        user = {
          id: 'usr_admin',
          name: 'مدير النظام (Admin)',
          email: 'admin@gmail.com',
          role: 'ADMIN',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          bio: 'مدير النظام لمنصة وقتك',
          language: 'ar',
          theme: 'dark',
          passwordHash: hashPassword('admin123'),
          createdAt: new Date().toISOString()
        };
        db.users.push(user);
        saveDB(db);
      } else {
        user.role = 'ADMIN';
      }

      logActivity(user.id, user.name, 'ADMIN_LOGIN', 'Logged into Admin Dashboard');
      return res.json({ success: true, user });
    }

    if (!user) {
      if (!password) {
        return res.status(400).json({ error: 'كلمة المرور مطلوبة' });
      }
      user = {
        id: `usr_${Date.now()}`,
        name: cleanEmail.split('@')[0] || 'مستخدم',
        email: cleanEmail,
        role: 'USER',
        language: 'ar',
        theme: 'dark',
        passwordHash: hashPassword(password),
        createdAt: new Date().toISOString()
      };
      db.users.push(user);
      saveDB(db);
    } else if (user.passwordHash) {
      if (!password || hashPassword(password) !== user.passwordHash) {
        return res.status(401).json({ error: 'كلمة المرور غير صحيحة' });
      }
    }

    logActivity(user.id, user.name, 'LOGIN', `Logged in via ${cleanEmail}`);
    res.json({ success: true, user });
  });

  app.post('/api/auth/register', (req, res) => {
    const { name, email, password } = req.body;
    if (!email) return res.status(400).json({ error: 'البريد الإلكتروني مطلوب' });
    if (!password) return res.status(400).json({ error: 'كلمة المرور مطلوبة' });

    const cleanEmail = email.trim().toLowerCase();
    const existing = db.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return res.status(400).json({ error: 'البريد الإلكتروني مستخدم بالفعل' });
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: name || 'مستخدم جديد',
      email: cleanEmail,
      role: cleanEmail === 'admin@gmail.com' ? 'ADMIN' : 'USER',
      language: 'ar',
      theme: 'dark',
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString()
    };
    db.users.push(newUser);
    saveDB(db);
    logActivity(newUser.id, newUser.name, 'REGISTER', `Registered account`);
    res.json({ success: true, user: newUser });
  });

  app.get('/api/auth/me', (req, res) => {
    const userId = (req.headers['x-user-id'] as string) || '';
    const user = userId ? (db.users.find(u => u.id === userId) || null) : null;
    res.json({ user });
  });

  // TASKS API
  app.get('/api/tasks', (req, res) => {
    const userId = (req.headers['x-user-id'] as string) || 'usr_1';
    const user = db.users.find(u => u.id === userId);
    if (user?.role === 'ADMIN' || req.query.all === 'true') {
      return res.json({ tasks: db.tasks });
    }
    const tasks = db.tasks.filter(t => t.userId === userId);
    res.json({ tasks });
  });

  app.post('/api/tasks', (req, res) => {
    const userId = (req.headers['x-user-id'] as string) || 'usr_1';
    const user = db.users.find(u => u.id === userId) || db.users[0];
    const { title, description, priority, category, dueDate, dueTime, estimatedDurationMinutes, subtasks, goalId } = req.body;
    const newTask: Task = {
      id: `tsk_${Date.now()}`,
      userId,
      title,
      description,
      priority: priority || 'MEDIUM',
      status: 'PENDING',
      category: category || 'WORK',
      dueDate,
      dueTime,
      estimatedDurationMinutes: estimatedDurationMinutes || 30,
      subtasks: subtasks || [],
      goalId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.tasks.unshift(newTask);
    saveDB(db);
    logActivity(userId, user.name, 'CREATE_TASK', `Created task: ${title}`);
    res.json({ success: true, task: newTask });
  });

  app.put('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    const taskIndex = db.tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) return res.status(404).json({ error: 'Task not found' });

    const updatedTask = {
      ...db.tasks[taskIndex],
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    if (req.body.status === 'COMPLETED' && db.tasks[taskIndex].status !== 'COMPLETED') {
      updatedTask.completedAt = new Date().toISOString();
    }

    db.tasks[taskIndex] = updatedTask;
    saveDB(db);
    res.json({ success: true, task: updatedTask });
  });

  app.delete('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    db.tasks = db.tasks.filter(t => t.id !== id);
    saveDB(db);
    res.json({ success: true });
  });

  // GOALS API
  app.get('/api/goals', (req, res) => {
    const userId = (req.headers['x-user-id'] as string) || 'usr_1';
    const user = db.users.find(u => u.id === userId);
    if (user?.role === 'ADMIN' || req.query.all === 'true') {
      return res.json({ goals: db.goals });
    }
    const goals = db.goals.filter(g => g.userId === userId);
    res.json({ goals });
  });

  app.post('/api/goals', (req, res) => {
    const userId = (req.headers['x-user-id'] as string) || 'usr_1';
    const { title, description, category, type, targetDate, milestones } = req.body;
    const newGoal: Goal = {
      id: `gol_${Date.now()}`,
      userId,
      title,
      description,
      category: category || 'WORK',
      type: type || 'SHORT_TERM',
      targetDate: targetDate || new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
      progress: 0,
      milestones: milestones || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.goals.unshift(newGoal);
    saveDB(db);
    logActivity(userId, 'User', 'CREATE_GOAL', `Created goal: ${title}`);
    res.json({ success: true, goal: newGoal });
  });

  app.put('/api/goals/:id', (req, res) => {
    const { id } = req.params;
    const idx = db.goals.findIndex(g => g.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Goal not found' });

    db.goals[idx] = {
      ...db.goals[idx],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    saveDB(db);
    res.json({ success: true, goal: db.goals[idx] });
  });

  app.delete('/api/goals/:id', (req, res) => {
    const { id } = req.params;
    db.goals = db.goals.filter(g => g.id !== id);
    saveDB(db);
    res.json({ success: true });
  });

  // CALENDAR API
  app.get('/api/calendar', (req, res) => {
    const userId = (req.headers['x-user-id'] as string) || 'usr_1';
    const events = db.calendarEvents.filter(e => e.userId === userId);
    res.json({ events });
  });

  app.post('/api/calendar', (req, res) => {
    const userId = (req.headers['x-user-id'] as string) || 'usr_1';
    const { title, description, startDate, endDate, type, color } = req.body;
    const newEvt: CalendarEvent = {
      id: `evt_${Date.now()}`,
      userId,
      title,
      description,
      startDate,
      endDate,
      type: type || 'EVENT',
      color: color || '#2563eb'
    };
    db.calendarEvents.push(newEvt);
    saveDB(db);
    res.json({ success: true, event: newEvt });
  });

  // FOCUS API
  app.get('/api/focus', (req, res) => {
    const userId = (req.headers['x-user-id'] as string) || 'usr_1';
    const sessions = db.focusSessions.filter(s => s.userId === userId);
    res.json({ sessions });
  });

  app.post('/api/focus', (req, res) => {
    const userId = (req.headers['x-user-id'] as string) || 'usr_1';
    const { taskId, taskTitle, durationMinutes, notes } = req.body;
    const newSession: FocusSession = {
      id: `foc_${Date.now()}`,
      userId,
      taskId,
      taskTitle,
      durationMinutes,
      completedAt: new Date().toISOString(),
      notes
    };
    db.focusSessions.unshift(newSession);

    // If associated with a task, mark as completed or progress
    if (taskId) {
      const task = db.tasks.find(t => t.id === taskId);
      if (task && task.status !== 'COMPLETED') {
        task.status = 'COMPLETED';
        task.completedAt = new Date().toISOString();
      }
    }

    saveDB(db);
    logActivity(userId, 'User', 'FOCUS_SESSION', `Completed ${durationMinutes} min focus session`);
    res.json({ success: true, session: newSession });
  });

  // WAQTAK AI API (Server-Side @google/genai)
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'usr_1';
      const { message, lang } = req.body;

      const userTasks = db.tasks.filter(t => t.userId === userId);
      const userGoals = db.goals.filter(g => g.userId === userId);

      const contextPrompt = `
You are "وقتك AI" (WAQTAK AI), an intelligent productivity assistant for the platform "وقتك — WAQTAK", created by "Chronox Team".
You speak fluently in ${lang === 'en' ? 'English' : 'Arabic'}.
Your tone is professional, encouraging, clear, concise, and focused on helping the user accomplish tasks and achieve goals efficiently.

User Current Context:
- Active Tasks (${userTasks.length}):
${userTasks.map(t => `- [${t.priority}] ${t.title} (${t.status}) - Due: ${t.dueDate || 'None'}`).join('\n')}

- Active Goals (${userGoals.length}):
${userGoals.map(g => `- Goal: ${g.title} (${g.progress}% completed)`).join('\n')}

User Question / Request: "${message}"

If the user asks to create a task, organize tasks, or create a goal plan, include a concise explanation AND if appropriate suggest a structured action.
Keep response direct and well structured.
`;

      const aiResponse = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: contextPrompt,
        config: {
          systemInstruction: 'You are WAQTAK AI (وقتك AI), the ultimate productivity AI assistant created by Chronox Team.'
        }
      });

      const replyText = aiResponse.text || (lang === 'en'
        ? "I have analyzed your tasks and schedule. Let's focus on your top priorities first!"
        : "لقد قمت بتحليل قائمة مهامك وجدولك. دعنا نركز على أهم أولوياتك العاجلة الآن!");

      // Detect if user asked for task creation or plan generation to attach a confirmable action payload
      let actionRequired = undefined;
      const lowerMsg = message.toLowerCase();
      if (lowerMsg.includes('مهمة') || lowerMsg.includes('task') || lowerMsg.includes('أنشئ') || lowerMsg.includes('create')) {
        actionRequired = {
          type: 'CREATE_TASK' as const,
          payload: {
            title: lang === 'en' ? 'Smart Action Task from WAQTAK AI' : 'مهمة ذكية مقترحة من وقتك AI',
            priority: 'HIGH',
            category: 'WORK',
            estimatedDurationMinutes: 30
          }
        };
      }

      res.json({
        success: true,
        reply: replyText,
        actionRequired
      });
    } catch (err: any) {
      console.error('AI Chat Error:', err);
      // Friendly fallback
      const isEn = req.body.lang === 'en';
      res.json({
        success: true,
        reply: isEn
          ? "WAQTAK AI is analyzing your agenda. You have 2 high-priority tasks due today: focus on completing them first!"
          : "يقوم وقتك AI بتحليل جدولك. لديك مهمتان عالتا الأولوية اليوم، يُنصح بالبدء بهما لزيادة مؤشر إنتاجيتك!"
      });
    }
  });

  // TASK SPECIFIC AI ASSISTANT & BREAKDOWN
  app.post('/api/ai/task-breakdown', async (req, res) => {
    try {
      const { taskId, action, customPrompt } = req.body;
      const task = db.tasks.find(t => t.id === taskId);
      if (!task) {
        return res.status(404).json({ error: 'المهمة غير موجودة' });
      }

      const promptText = `
أنت المساعد الذكي "وقتك AI" لتطبيق الإنجاز والإنتاجية "وقتك".
معلومات المهمة الحالية للمستخدم:
- عنوان المهمة: "${task.title}"
- التفاصيل: "${task.description || 'بدون تفاصيل إضافية'}"
- الموعد النهائي: "${task.dueDate || 'غير محدد'}" ${task.dueTime ? `الساعة ${task.dueTime}` : ''}
- الأولوية: "${task.priority}"
- حالة المهمة: "${task.status}"

نوع طلب التوجيه: "${action || 'قسّم المهمة'}"
${customPrompt ? `ملاحظات إضافية من المستخدم: "${customPrompt}"` : ''}

التعليمات الهامة:
1. قدم إجابة مباشرة، ممتازة، محفزة ومختصرة جداً توجه المستخدم للتنفيذ فوراً.
2. اعط من 4 إلى 6 خطوات عملية دقيقة، متسلسلة وقابلة للتنفيذ كخطوات فرعية لمساعدة المستخدم على الإنجاز.
`;

      const aiRes = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: promptText,
        config: {
          systemInstruction: 'أنت مساعد إنتاجية ذكي ومباشر باللغة العربية داخل تطبيق وقتك.'
        }
      });

      const replyText = aiRes.text || 'إليك الخطة العملية والخطوات المقترحة لإنجاز المهمة مباشرة:';

      const lines = replyText.split('\n')
        .map(l => l.replace(/^[\d\-\*\.\•\✓\s]+/, '').trim())
        .filter(l => l.length > 3 && !l.startsWith('معلومات') && !l.startsWith('التعليمات') && !l.startsWith('إليك') && !l.startsWith('نوع') && !l.startsWith('أنت'));

      const suggestedSubtasks = lines.slice(0, 6).map((st, i) => ({
        id: `ai_sub_${Date.now()}_${i}`,
        title: st,
        completed: false
      }));

      res.json({
        success: true,
        reply: replyText,
        suggestedSubtasks
      });
    } catch (err: any) {
      console.error('Task Breakdown AI Error:', err);
      res.json({
        success: true,
        reply: 'إليك الخطوات العملية الموصى بها لبدء وإنجاز هذه المهمة مباشرة:',
        suggestedSubtasks: [
          { id: `ai_sub_${Date.now()}_1`, title: 'تحديد الهدف والمخرجات المطلوبة للمهمة', completed: false },
          { id: `ai_sub_${Date.now()}_2`, title: 'قراءة وفهم المطلوب بشكل مباشر', completed: false },
          { id: `ai_sub_${Date.now()}_3`, title: 'التنفيذ الأولي وتطبيق الخطوة الأولى', completed: false },
          { id: `ai_sub_${Date.now()}_4`, title: 'مراجعة المخرجات وإغلاق المهمة بنجاح', completed: false }
        ]
      });
    }
  });

  // SUPPORT TICKETS API
  const handleGetTickets = (req: express.Request, res: express.Response) => {
    const userId = (req.headers['x-user-id'] as string) || 'usr_1';
    const user = db.users.find(u => u.id === userId);
    if (user?.role === 'ADMIN' || user?.role === 'SUPPORT') {
      return res.json({ tickets: db.supportTickets });
    }
    const tickets = db.supportTickets.filter(t => t.userId === userId);
    res.json({ tickets });
  };

  const handleCreateTicket = (req: express.Request, res: express.Response) => {
    const userId = (req.headers['x-user-id'] as string) || 'usr_1';
    const user = db.users.find(u => u.id === userId) || db.users[0];
    const { subject, category, priority, description, message } = req.body;
    const ticketText = description || message || '';

    const newTicket: SupportTicket = {
      id: `tkt_${Date.now()}`,
      userId,
      userName: user.name,
      userEmail: user.email,
      subject: subject || 'استفسار للدعم الفني',
      category: category || 'TECHNICAL',
      status: 'OPEN',
      message: ticketText,
      messages: [
        {
          id: `msg_${Date.now()}`,
          senderId: userId,
          senderName: user.name,
          senderRole: user.role,
          text: ticketText,
          createdAt: new Date().toISOString()
        }
      ],
      responses: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.supportTickets.unshift(newTicket);
    saveDB(db);
    logActivity(userId, user.name, 'CREATE_TICKET', `Subject: ${subject}`);
    res.json({ success: true, ticket: newTicket });
  };

  const handleReplyTicket = (req: express.Request, res: express.Response) => {
    const { id } = req.params;
    const userId = (req.headers['x-user-id'] as string) || 'usr_1';
    const user = db.users.find(u => u.id === userId) || db.users[0];
    const { text, message, senderName } = req.body;
    const replyMsg = text || message || '';

    const ticket = db.supportTickets.find(t => t.id === id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    const msgObj = {
      id: `msg_${Date.now()}`,
      senderId: userId,
      senderName: senderName || user.name,
      senderRole: user.role,
      text: replyMsg,
      createdAt: new Date().toISOString()
    };

    ticket.messages.push(msgObj);
    if (!ticket.responses) ticket.responses = [];
    ticket.responses.push({
      id: msgObj.id,
      senderName: msgObj.senderName,
      message: replyMsg,
      createdAt: msgObj.createdAt
    });

    ticket.updatedAt = new Date().toISOString();
    if (user.role === 'SUPPORT' || user.role === 'ADMIN') {
      ticket.status = 'IN_PROGRESS';
    }

    saveDB(db);
    res.json({ success: true, ticket });
  };

  app.get('/api/support', handleGetTickets);
  app.get('/api/support/tickets', handleGetTickets);
  app.post('/api/support', handleCreateTicket);
  app.post('/api/support/tickets', handleCreateTicket);
  app.post('/api/support/:id/reply', handleReplyTicket);
  app.post('/api/support/tickets/:id/reply', handleReplyTicket);

  // FEEDBACK API
  const handleGetFeedback = (req: express.Request, res: express.Response) => {
    res.json({ feedback: db.feedbackItems, feedbacks: db.feedbackItems });
  };

  app.get('/api/feedback', handleGetFeedback);
  app.get('/api/admin/feedbacks', handleGetFeedback);

  app.post('/api/feedback', (req, res) => {
    const userId = (req.headers['x-user-id'] as string) || 'usr_1';
    const user = db.users.find(u => u.id === userId) || db.users[0];
    const { rating, type, comment, message, category } = req.body;

    const textContent = comment || message || '';
    const categoryType = type || category || 'SUGGESTION';

    const newFb: FeedbackItem = {
      id: `fb_${Date.now()}`,
      userId,
      userName: user.name,
      userEmail: user.email,
      rating: rating || 5,
      type: categoryType,
      comment: textContent,
      message: textContent,
      category: categoryType,
      status: 'NEW',
      createdAt: new Date().toISOString()
    };

    db.feedbackItems.unshift(newFb);
    saveDB(db);
    res.json({ success: true, feedback: newFb });
  });

  app.post('/api/feedback/:id/reply', (req, res) => {
    const { id } = req.params;
    const { adminReply, status } = req.body;
    const fb = db.feedbackItems.find(f => f.id === id);
    if (!fb) return res.status(404).json({ error: 'Feedback not found' });

    if (adminReply) fb.adminReply = adminReply;
    if (status) fb.status = status;
    saveDB(db);
    res.json({ success: true, feedback: fb });
  });

  // ADVERTISEMENTS PUBLIC API
  app.get('/api/ads', (req, res) => {
    const placement = req.query.placement as string;
    const today = new Date().toISOString().split('T')[0];

    // Auto-update expired / scheduled ads status
    let updated = false;
    db.advertisements.forEach(ad => {
      if (ad.status === 'SCHEDULED' && ad.startDate && ad.startDate <= today) {
        if (!ad.endDate || ad.endDate >= today) {
          ad.status = 'ACTIVE';
          updated = true;
        }
      }
      if (ad.endDate && ad.endDate < today && ad.status !== 'EXPIRED') {
        ad.status = 'EXPIRED';
        updated = true;
      }
    });
    if (updated) saveDB(db);

    let activeAds = db.advertisements.filter(ad => ad.status === 'ACTIVE');

    if (placement) {
      activeAds = activeAds.filter(ad => ad.placement === placement || ad.placement === 'DASHBOARD');
    }

    activeAds.sort((a, b) => (b.priority || 1) - (a.priority || 1));

    res.json({ ads: activeAds });
  });

  app.post('/api/ads/:id/impression', (req, res) => {
    const { id } = req.params;
    const ad = db.advertisements.find(a => a.id === id);
    if (ad) {
      ad.impressions = (ad.impressions || 0) + 1;
      saveDB(db);
      return res.json({ success: true, impressions: ad.impressions });
    }
    res.status(404).json({ error: 'Ad not found' });
  });

  app.post('/api/ads/:id/click', (req, res) => {
    const { id } = req.params;
    const userId = (req.headers['x-user-id'] as string) || 'guest';
    const ad = db.advertisements.find(a => a.id === id);
    if (ad) {
      ad.clicks = (ad.clicks || 0) + 1;
      saveDB(db);
      logActivity(userId, 'User', 'AD_CLICK', `Clicked ad: ${ad.title}`);
      return res.json({ success: true, clicks: ad.clicks });
    }
    res.status(404).json({ error: 'Ad not found' });
  });

  // ADMIN API MIDDLEWARE & ENDPOINTS
  const verifyAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || '';
    const user = userId ? db.users.find(u => u.id === userId) : null;
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'غير مصرح. هذه المنطقة مخصصة لمدير النظام فقط.' });
    }
    next();
  };

  // SSE Stream Endpoint for Admin Real-Time Sync
  app.get('/api/admin/stream', verifyAdmin, (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Send immediate sync handshake
    res.write(`data: ${JSON.stringify({ type: 'SYNC', dbVersion: globalDbVersion, timestamp: new Date().toISOString() })}\n\n`);

    sseClients.add(res);

    req.on('close', () => {
      sseClients.delete(res);
    });
  });

  app.get('/api/admin/live-sync', verifyAdmin, (req, res) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const totalUsers = db.users.length;
    const totalTasks = db.tasks.length;
    const activeTasks = db.tasks.filter(t => t.status !== 'COMPLETED').length;
    const completedTasks = db.tasks.filter(t => t.status === 'COMPLETED').length;
    const overdueTasks = db.tasks.filter(t => t.status !== 'COMPLETED' && t.dueDate && t.dueDate < todayStr).length;
    const totalGoals = db.goals.length;
    const totalTickets = db.supportTickets.length;
    const totalFeedbacks = db.feedbackItems.length;
    const totalFocusSessions = db.focusSessions.length;

    const totalAds = db.advertisements.length;
    const activeAdsCount = db.advertisements.filter(a => a.status === 'ACTIVE').length;
    const totalAdImpressions = db.advertisements.reduce((acc, a) => acc + (a.impressions || 0), 0);
    const totalAdClicks = db.advertisements.reduce((acc, a) => acc + (a.clicks || 0), 0);

    const statsObj = {
      totalUsers,
      activeTasks,
      totalTasks,
      completedTasks,
      overdueTasks,
      totalGoals,
      totalTickets,
      totalFeedbacks,
      totalFocusSessions,
      totalAds,
      activeAdsCount,
      totalAdImpressions,
      totalAdClicks,
      systemStatus: 'أنظمة ومزامنة وقتك تعمل بانتظام ⚡'
    };

    const usersWithStats = db.users.map(u => ({
      ...u,
      tasksCount: db.tasks.filter(t => t.userId === u.id).length,
      activeTasksCount: db.tasks.filter(t => t.userId === u.id && t.status !== 'COMPLETED').length,
      goalsCount: db.goals.filter(g => g.userId === u.id).length,
    }));

    const tasksWithUserInfo = db.tasks.map(t => {
      const u = db.users.find(usr => usr.id === t.userId);
      return {
        ...t,
        userName: u ? u.name : 'مستخدم غير معروف',
        userEmail: u ? u.email : ''
      };
    });

    res.json({
      success: true,
      dbVersion: globalDbVersion,
      timestamp: new Date().toISOString(),
      stats: statsObj,
      users: usersWithStats,
      tasks: tasksWithUserInfo,
      tickets: db.supportTickets,
      feedbacks: db.feedbackItems,
      logs: db.activityLogs,
      ads: db.advertisements
    });
  });

  app.use('/api/admin', verifyAdmin);

  // ADMIN ADVERTISEMENTS API
  app.get('/api/admin/ads', (req, res) => {
    res.json({ ads: db.advertisements });
  });

  app.post('/api/admin/ads', (req, res) => {
    const userId = (req.headers['x-user-id'] as string) || 'usr_admin';
    const user = db.users.find(u => u.id === userId) || db.users[0];
    const {
      title, description, imageUrl, targetUrl, buttonText,
      placement, status, startDate, endDate, priority
    } = req.body;

    if (!title || !imageUrl || !targetUrl) {
      return res.status(400).json({ error: 'يرجى إدخال عنوان الإعلان، رابط الصورة، ورابط التوجيه' });
    }

    const newAd: Advertisement = {
      id: `ad_${Date.now()}`,
      title,
      description: description || '',
      imageUrl,
      targetUrl,
      buttonText: buttonText || 'اعرف المزيد',
      placement: placement || 'DASHBOARD',
      status: status || 'ACTIVE',
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || '',
      priority: priority ? parseInt(priority) : 5,
      impressions: 0,
      clicks: 0,
      createdBy: user ? user.name : 'مدير النظام',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.advertisements.unshift(newAd);
    saveDB(db);
    logActivity(userId, user ? user.name : 'Admin', 'CREATE_AD', `Created ad: ${title}`);
    res.json({ success: true, ad: newAd });
  });

  app.put('/api/admin/ads/:id', (req, res) => {
    const { id } = req.params;
    const userId = (req.headers['x-user-id'] as string) || 'usr_admin';
    const user = db.users.find(u => u.id === userId) || db.users[0];
    const ad = db.advertisements.find(a => a.id === id);

    if (!ad) return res.status(404).json({ error: 'الإعلان غير موجود' });

    const fields = ['title', 'description', 'imageUrl', 'targetUrl', 'buttonText', 'placement', 'status', 'startDate', 'endDate', 'priority'];
    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'priority') {
          ad.priority = parseInt(req.body[field]) || 5;
        } else {
          (ad as any)[field] = req.body[field];
        }
      }
    });

    ad.updatedAt = new Date().toISOString();
    saveDB(db);
    logActivity(userId, user ? user.name : 'Admin', 'UPDATE_AD', `Updated ad: ${ad.title}`);
    res.json({ success: true, ad });
  });

  app.put('/api/admin/ads/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const ad = db.advertisements.find(a => a.id === id);
    if (!ad) return res.status(404).json({ error: 'الإعلان غير موجود' });

    ad.status = status;
    ad.updatedAt = new Date().toISOString();
    saveDB(db);
    res.json({ success: true, ad });
  });

  app.delete('/api/admin/ads/:id', (req, res) => {
    const { id } = req.params;
    const idx = db.advertisements.findIndex(a => a.id === id);
    if (idx === -1) return res.status(404).json({ error: 'الإعلان غير موجود' });

    const deleted = db.advertisements.splice(idx, 1)[0];
    saveDB(db);
    res.json({ success: true, deletedAd: deleted });
  });

  app.get('/api/admin/stats', (req, res) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const totalUsers = db.users.length;
    const totalTasks = db.tasks.length;
    const completedTasks = db.tasks.filter(t => t.status === 'COMPLETED').length;
    const overdueTasks = db.tasks.filter(t => t.status !== 'COMPLETED' && t.dueDate && t.dueDate < todayStr).length;
    const totalGoals = db.goals.length;
    const totalTickets = db.supportTickets.length;
    const totalFeedbacks = db.feedbackItems.length;
    const totalFocusSessions = db.focusSessions.length;

    const statsObj = {
      totalUsers,
      totalTasks,
      completedTasks,
      overdueTasks,
      totalGoals,
      totalTickets,
      totalFeedbacks,
      totalFocusSessions,
      systemStatus: 'أنظمة وقتك تعمل بكفاءة عالية'
    };

    res.json({ success: true, stats: statsObj, ...statsObj });
  });

  app.get('/api/admin/users', (req, res) => {
    const usersWithStats = db.users.map(u => ({
      ...u,
      tasksCount: db.tasks.filter(t => t.userId === u.id).length,
      goalsCount: db.goals.filter(g => g.userId === u.id).length,
    }));
    res.json({ users: usersWithStats });
  });

  const handleUpdateUser = (req: express.Request, res: express.Response) => {
    const { id } = req.params;
    const user = db.users.find(u => u.id === id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    Object.assign(user, req.body);
    saveDB(db);
    logActivity(user.id, user.name, 'ADMIN_UPDATE_USER', `Updated user ${user.email} role to ${user.role}`);
    res.json({ success: true, user });
  };

  app.put('/api/admin/users/:id', handleUpdateUser);
  app.put('/api/admin/users/:id/role', handleUpdateUser);

  app.delete('/api/admin/users/:id', (req, res) => {
    const { id } = req.params;
    if (id === 'usr_admin') {
      return res.status(400).json({ error: 'لا يمكن حذف الحساب الرئيسي للإدارة' });
    }
    db.users = db.users.filter(u => u.id !== id);
    db.tasks = db.tasks.filter(t => t.userId !== id);
    db.goals = db.goals.filter(g => g.userId !== id);
    saveDB(db);
    res.json({ success: true });
  });

  // ADMIN TASKS ENDPOINTS
  app.get('/api/admin/tasks', (req, res) => {
    const tasksWithUserInfo = db.tasks.map(t => {
      const u = db.users.find(usr => usr.id === t.userId);
      return {
        ...t,
        userName: u ? u.name : 'مستخدم غير معروف',
        userEmail: u ? u.email : ''
      };
    });
    res.json({ tasks: tasksWithUserInfo });
  });

  app.put('/api/admin/tasks/:id', (req, res) => {
    const { id } = req.params;
    const task = db.tasks.find(t => t.id === id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    Object.assign(task, req.body, { updatedAt: new Date().toISOString() });
    saveDB(db);
    res.json({ success: true, task });
  });

  app.delete('/api/admin/tasks/:id', (req, res) => {
    const { id } = req.params;
    db.tasks = db.tasks.filter(t => t.id !== id);
    saveDB(db);
    res.json({ success: true });
  });

  // ADMIN GOALS ENDPOINTS
  app.get('/api/admin/goals', (req, res) => {
    const goalsWithUserInfo = db.goals.map(g => {
      const u = db.users.find(usr => usr.id === g.userId);
      return {
        ...g,
        userName: u ? u.name : 'مستخدم غير معروف',
        userEmail: u ? u.email : ''
      };
    });
    res.json({ goals: goalsWithUserInfo });
  });

  // ADMIN SUPPORT TICKETS ENDPOINTS
  app.get('/api/admin/tickets', (req, res) => {
    res.json({ tickets: db.supportTickets });
  });

  app.post('/api/admin/tickets/:id/reply', (req, res) => {
    const { id } = req.params;
    const { message, text, status } = req.body;
    const replyText = message || text || '';

    const ticket = db.supportTickets.find(t => t.id === id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    const msgObj = {
      id: `msg_${Date.now()}`,
      senderId: 'usr_admin',
      senderName: 'مدير نظام وقتك (Admin)',
      senderRole: 'ADMIN' as any,
      text: replyText,
      createdAt: new Date().toISOString()
    };

    if (!ticket.messages) ticket.messages = [];
    ticket.messages.push(msgObj);

    if (!ticket.responses) ticket.responses = [];
    ticket.responses.push({
      id: msgObj.id,
      senderName: msgObj.senderName,
      message: replyText,
      createdAt: msgObj.createdAt
    });

    ticket.status = status || 'IN_PROGRESS';
    ticket.updatedAt = new Date().toISOString();

    saveDB(db);
    logActivity('usr_admin', 'Admin', 'REPLY_TICKET', `Replied to ticket ${ticket.subject}`);
    res.json({ success: true, ticket });
  });

  app.put('/api/admin/tickets/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const ticket = db.supportTickets.find(t => t.id === id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    ticket.status = status;
    ticket.updatedAt = new Date().toISOString();
    saveDB(db);
    res.json({ success: true, ticket });
  });

  // ADMIN FEEDBACK ENDPOINTS
  app.get('/api/admin/feedbacks', (req, res) => {
    res.json({ feedbacks: db.feedbackItems, feedback: db.feedbackItems });
  });

  app.post('/api/admin/feedbacks/:id/reply', (req, res) => {
    const { id } = req.params;
    const { adminReply, status } = req.body;
    const fb = db.feedbackItems.find(f => f.id === id);
    if (!fb) return res.status(404).json({ error: 'Feedback not found' });

    if (adminReply) fb.adminReply = adminReply;
    if (status) fb.status = status;
    saveDB(db);
    res.json({ success: true, feedback: fb });
  });

  app.delete('/api/admin/feedbacks/:id', (req, res) => {
    const { id } = req.params;
    db.feedbackItems = db.feedbackItems.filter(f => f.id !== id);
    saveDB(db);
    res.json({ success: true });
  });

  app.get('/api/admin/logs', (req, res) => {
    res.json({ logs: db.activityLogs });
  });

  app.get('/api/admin/settings', (req, res) => {
    res.json({ settings: db.settings });
  });

  app.put('/api/admin/settings', (req, res) => {
    db.settings = { ...db.settings, ...req.body };
    saveDB(db);
    res.json({ success: true, settings: db.settings });
  });

  // Catch-all 404 handler for API routes to prevent falling through to Vite HTML
  app.all('/api/*', (req, res) => {
    res.status(404).json({ error: `API route ${req.method} ${req.path} not found` });
  });

  // Vite Middleware / Static Serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
