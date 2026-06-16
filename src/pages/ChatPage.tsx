import { useState } from 'react';
import { Send, Sparkles, Shield, Heart, Brain, Zap, MessageSquare } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const quickActions = [
  { icon: Heart, label: '我很难受', color: 'text-red-400' },
  { icon: Brain, label: '教我一个放松技巧', color: 'text-mist' },
  { icon: Zap, label: '分析今天的情绪', color: 'text-mood-happy' },
];

export default function ChatPage() {
  const [messages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '你好，我是心镜 AI。我受过循证心理学训练，不是来安慰你，而是帮你用心理学工具理解自己。\n\n你可以告诉我：',
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-4 pt-6 pb-4 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-mist/15 rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-mist" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-800">心镜 AI</h1>
            <p className="text-xs text-gray-400">基于循证心理学知识库</p>
          </div>
        </div>
      </header>

      {/* Disclaimer */}
      <div className="px-4 pb-2">
        <div className="flex items-center gap-2 bg-warm-gray/50 rounded-lg px-3 py-2">
          <Shield className="w-3.5 h-3.5 text-gray-400" />
          <p className="text-xs text-gray-400">
            AI 回应基于心理学知识，不替代专业心理咨询。紧急危机请拨打热线。
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-mist text-white rounded-br-md'
                  : 'bg-white border border-warm-gray text-gray-700 rounded-bl-md'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 mt-2">
          {quickActions.map((action) => (
            <button
              key={action.label}
              className="flex items-center gap-1.5 bg-white border border-warm-gray rounded-full px-3 py-2 text-sm hover:border-mist/30 transition-colors"
            >
              <action.icon className={`w-4 h-4 ${action.color}`} />
              <span className="text-gray-600">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="px-4 pb-24 pt-2 bg-white border-t border-warm-gray">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="说说你的感受..."
              className="w-full bg-warm-gray/30 rounded-xl px-4 py-3 pr-10 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mist/30"
            />
            <MessageSquare className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
          <button className="p-3 bg-mist rounded-xl text-white hover:bg-mist/90 transition-colors">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
