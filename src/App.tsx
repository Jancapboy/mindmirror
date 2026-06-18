import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Home, Calendar, ClipboardList, MessageCircle, Dumbbell } from 'lucide-react';
import TodayPage from './pages/TodayPage';
import DiaryPage from './pages/DiaryPage';
import AssessmentPage from './pages/AssessmentPage';
import ChatPage from './pages/ChatPage';
import ToolboxPage from './pages/ToolboxPage';

function BottomNav() {
  const navItems = [
    { path: '/', label: '今日', icon: Home },
    { path: '/diary', label: '日记', icon: Calendar },
    { path: '/assessment', label: '测评', icon: ClipboardList },
    { path: '/chat', label: 'AI', icon: MessageCircle },
    { path: '/toolbox', label: '工具', icon: Dumbbell },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-warm-gray z-50">
      <div className="flex items-center justify-around py-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors ${
                  isActive ? 'text-mist' : 'text-gray-400 hover:text-gray-600'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-warm-white max-w-lg mx-auto relative">
        <Routes>
          <Route path="/" element={<TodayPage />} />
          <Route path="/diary" element={<DiaryPage />} />
          <Route path="/assessment" element={<AssessmentPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/toolbox" element={<ToolboxPage />} />
        </Routes>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}

export default App;
