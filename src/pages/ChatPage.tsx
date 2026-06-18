import { useState, useEffect } from 'react';
import { Send, Sparkles, Shield, Heart, Brain, Zap, MessageSquare, Loader2, Settings, KeyRound } from 'lucide-react';
import { chatCompletionStream, initDefaultApiKey, hasApiKey, setApiKey } from '../services/deepseek';

initDefaultApiKey('sk-44a82b8778e84fb694205dd8a1002e4a');

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
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '你好，我是心镜 AI。我受过循证心理学训练，不是来安慰你，而是帮你用心理学工具理解自己。\n\n你可以告诉我：',
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [apiKeyReady, setApiKeyReady] = useState(hasApiKey());
  const [streamingContent, setStreamingContent] = useState('');

  useEffect(() => {
    setApiKeyReady(hasApiKey());
  }, []);

  const handleSubmit = async (e?: React.FormEvent, quickAction?: string) => {
    e?.preventDefault();
    const text = quickAction || input.trim();
    if (!text || loading) return;
    if (!apiKeyReady) {
      setShowSettings(true);
      return;
    }

    if (!quickAction) setInput('');
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setStreamingContent('');

    try {
      const systemPrompt = `你是一位受过循证心理学训练的AI心理健康助手。你的知识来源于认知行为疗法(CBT)、正念(MBSR)、接纳承诺疗法(ACT)、辩证行为疗法(DBT)、积极心理学等循证方法。

回答规则：
1. 基于心理学理论和工具，给出专业、实用的建议
2. 引用具体的心理学概念或技术（如认知重构、暴露层级、 grounding 等）
3. 标注置信度（强证据/中等证据/初步研究）
4. 明确告知你不是医生，不能替代专业诊断
5. 如果用户表达自伤或自杀倾向，立即启动危机干预：安抚 + 提供热线资源 + 建议安全计划
6. 回答风格：温暖、专业、不居高临下，像一位有经验的心理咨询师`;

      const history = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));

      const stream = chatCompletionStream([
        { role: 'system', content: systemPrompt },
        ...history,
        { role: 'user', content: text },
      ]);

      let fullContent = '';
      for await (const chunk of stream) {
        fullContent += chunk;
        setStreamingContent(fullContent);
      }

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: fullContent,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setStreamingContent('');
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `❌ 调用失败：${err.message || '未知错误'}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const saveApiKey = () => {
    if (apiKeyInput.trim()) {
      setApiKey(apiKeyInput.trim());
      setApiKeyReady(true);
      setShowSettings(false);
      setApiKeyInput('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-4 pt-6 pb-4 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-mist/15 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-mist" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-800">心镜 AI</h1>
              <p className="text-xs text-gray-400">基于循证心理学知识库</p>
            </div>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Settings Panel */}
      {showSettings && (
        <div className="px-4 pb-2">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-warm-gray">
            <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
              <KeyRound size={16} />
              <span>API Key 设置</span>
            </div>
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder={apiKeyReady ? '已设置，输入新 key 可覆盖' : '输入 DeepSeek API Key'}
                className="flex-1 px-3 py-2 bg-warm-gray/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-mist/30"
              />
              <button
                onClick={saveApiKey}
                className="px-4 py-2 bg-mist text-white rounded-lg text-sm"
              >
                保存
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Key 仅存储在本地浏览器中，不会上传服务器。
            </p>
          </div>
        </div>
      )}

      {!apiKeyReady && !showSettings && (
        <div className="px-4 pb-2">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
            ⚠️ 尚未配置 API Key，点击右上角 ⚙️ 设置 DeepSeek API Key
          </div>
        </div>
      )}

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

        {loading && streamingContent && (
          <div className="flex justify-start">
            <div className="bg-white border border-warm-gray rounded-2xl rounded-bl-md px-4 py-3 max-w-[80%]">
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-700">
                {streamingContent}
                <span className="animate-pulse">▌</span>
              </p>
            </div>
          </div>
        )}

        {loading && !streamingContent && (
          <div className="flex justify-start">
            <div className="bg-white border border-warm-gray rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2 text-sm text-gray-400">
              <Loader2 size={14} className="animate-spin" />
              思考中...
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {!loading && messages.length === 1 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => handleSubmit(undefined, action.label)}
                className="flex items-center gap-1.5 bg-white border border-warm-gray rounded-full px-3 py-2 text-sm hover:border-mist/30 transition-colors"
              >
                <action.icon className={`w-4 h-4 ${action.color}`} />
                <span className="text-gray-600">{action.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-4 pb-24 pt-2 bg-white border-t border-warm-gray">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={apiKeyReady ? '说说你的感受...' : '请先设置 API Key'}
              disabled={!apiKeyReady}
              className="w-full bg-warm-gray/30 rounded-xl px-4 py-3 pr-10 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mist/30 disabled:bg-gray-100"
            />
            <MessageSquare className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
          <button
            type="submit"
            disabled={loading || !apiKeyReady}
            className="p-3 bg-mist rounded-xl text-white hover:bg-mist/90 transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
