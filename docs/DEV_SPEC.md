# DEV_SPEC — 心镜 (MindMirror) · AI 心理健康助手

> **版本**: v0.1.0-MVP  
> **对应 PRD**: `PRD.md`  
> **技术栈**: React 18 + Vite + TypeScript + Tailwind + Zustand + IndexedDB + Recharts

---

## 1. 项目结构

```
mindscape-ai/
├── docs/
│   ├── PRD.md              # 产品需求文档
│   └── DEV_SPEC.md         # 本文件
├── public/
│   └── knowledge/          # 心理学知识库静态数据
│       ├── theories.json
│       ├── techniques.json
│       └── assessments.json
├── src/
│   ├── main.tsx            # 入口
│   ├── App.tsx             # 根组件
│   ├── index.css           # 全局样式
│   │
│   ├── types/              # 全局类型定义
│   │   ├── emotion.ts      # 情绪相关类型
│   │   ├── assessment.ts   # 测评相关类型
│   │   ├── knowledge.ts    # 知识库类型
│   │   └── common.ts       # 通用类型
│   │
│   ├── data/               # 静态数据
│   │   ├── emotions.ts     # 情绪标签定义
│   │   ├── scales/         # 量表数据
│   │   │   ├── phq9.ts
│   │   │   └── gad7.ts
│   │   └── techniques/     # 技术引导语
│   │
│   ├── core/               # 核心逻辑（纯函数）
│   │   ├── emotion/        # 情绪分析
│   │   │   ├── analyzer.ts     # 情绪趋势分析
│   │   │   └── patterns.ts     # 模式识别
│   │   ├── assessment/     # 测评计分
│   │   │   ├── phq9.ts
│   │   │   └── gad7.ts
│   │   └── safety/         # 安全检测
│   │       └── riskDetector.ts // 危机信号识别
│   │
│   ├── knowledge/          # 知识库系统（核心）
│   │   ├── index.ts
│   │   ├── loader.ts
│   │   ├── search.ts
│   │   └── recommender.ts  # 个性化推荐引擎
│   │
│   ├── stores/             # Zustand 状态管理
│   │   ├── emotionStore.ts # 情绪日记状态
│   │   ├── assessmentStore.ts # 测评状态
│   │   ├── knowledgeStore.ts  # 知识库状态
│   │   ├── chatStore.ts    # 对话状态
│   │   └── userStore.ts    # 用户画像+设置
│   │
│   ├── services/           # 外部服务
│   │   └── ai.ts           # Kimi API 封装
│   │
│   ├── components/         # 组件
│   │   ├── layout/
│   │   ├── emotion/        # 情绪相关组件
│   │   ├── exercise/       # 练习工具组件
│   │   ├── assessment/     # 测评组件
│   │   └── common/
│   │
│   ├── pages/
│   │   ├── TodayPage.tsx   # 今日首页
│   │   ├── DiaryPage.tsx   # 情绪日记
│   │   ├── AssessmentPage.tsx # 测评中心
│   │   ├── ChatPage.tsx    # AI 对话
│   │   ├── ToolboxPage.tsx # 练习工具箱
│   │   └── KnowledgePage.tsx  # 知识库
│   │
│   ├── hooks/
│   ├── utils/
│   └── db/                 # IndexedDB 封装（加密）
│       └── index.ts
│
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
└── .github/workflows/
    └── deploy.yml
```

---

## 2. 类型系统

### 2.1 情绪核心类型

```typescript
// src/types/emotion.ts

/** 基础情绪 */
type BaseEmotion = 'happy' | 'calm' | 'anxious' | 'sad' | 'angry' | 'tired' | 'excited' | 'grateful';

/** 情绪强度 1-10 */
type Intensity = number & { __brand: '1-10' };

/** 能量水平 1-10 */
type EnergyLevel = number & { __brand: '1-10' };

/** 情绪日记条目 */
interface EmotionEntry {
  id: string;
  timestamp: number;        // 记录时间
  emotions: Array<{
    type: BaseEmotion;
    intensity: Intensity;
  }>;
  overallMood: Intensity;   // 整体心情 1-10
  energyLevel: EnergyLevel;
  // 情境
  context?: {
    location?: string;
    activity?: string;
    people?: string;
    weather?: string;
  };
  // CBT 五栏表
  thoughts?: {
    automaticThought: string;  // 自动化思维
    cognitiveDistortion?: string; // 认知扭曲类型
    evidenceFor?: string;
    evidenceAgainst?: string;
    alternativeThought?: string;
  };
  // 身体感受
  physicalSymptoms?: string[];
  // 备注
  note?: string;
}

/** 情绪趋势（聚合数据） */
interface EmotionTrend {
  period: '7d' | '30d' | '90d';
  dailyAverages: Array<{
    date: string;
    averageMood: number;
    dominantEmotion: BaseEmotion;
  }>;
  patterns: Array<{
    type: 'weekly' | 'monthly' | 'contextual';
    description: string;
    confidence: number;
  }>;
  triggers: Array<{
    factor: string;
    correlation: number; // -1 to 1
    occurrence: number;  // 出现次数
  }>;
}
```

### 2.2 测评类型

```typescript
// src/types/assessment.ts

/** 量表定义 */
interface Scale {
  id: string;
  name: string;
  fullName: string;
  description: string;
  questions: ScaleQuestion[];
  scoringRules: ScoringRules;
  interpretation: ScoreInterpretation[];
  source: string; // 来源文献
  reliability?: string; // 信度数据
  validity?: string;    // 效度数据
}

interface ScaleQuestion {
  id: string;
  text: string;
  options: Array<{
    value: number;
    label: string;
  }>;
  reverseScored?: boolean;
}

interface ScoringRules {
  minScore: number;
  maxScore: number;
  cutoffs: Array<{
    threshold: number;
    label: string;
    severity: 'none' | 'mild' | 'moderate' | 'severe';
    action: string;
  }>;
}

interface ScoreInterpretation {
  range: [number, number];
  label: string;
  description: string;
  recommendation: string;
}

/** 用户测评记录 */
interface AssessmentRecord {
  id: string;
  scaleId: string;
  takenAt: number;
  answers: Record<string, number>; // questionId -> score
  totalScore: number;
  interpretation: string;
  severity: string;
  // 与上次对比
  comparison?: {
    previousScore: number;
    change: number;
    trend: 'improved' | 'worsened' | 'stable';
  };
}
```

### 2.3 心理学知识库类型

```typescript
// src/types/knowledge.ts

/** 循证等级 */
type EvidenceLevel = 'strong' | 'moderate' | 'emerging' | 'anecdotal';

/** 知识分类 */
type KnowledgeCategory = 'theory' | 'technique' | 'assessment' | 'crisis';

/** 适用问题类型 */
type Indication = 'depression' | 'anxiety' | 'stress' | 'insomnia' | 'trauma' | 'self-esteem' | 'relationship';

interface PsychologyEntry {
  id: string;
  category: KnowledgeCategory;
  title: string;
  content: string;
  evidenceLevel: EvidenceLevel;
  indications: Indication[];      // 适用症状
  contraindications: string[];    // 不适用情况
  steps?: string[];               // 操作步骤
  duration?: string;              // 建议练习时长
  frequency?: string;             // 建议练习频率
  resources?: Array<{
    type: 'book' | 'app' | 'website' | 'video';
    title: string;
    url?: string;
  }>;
  tags: string[];
  // 统计
  stats?: {
    recommendedCount: number;
    practicedCount: number;
  };
}

/** 用户心理画像（用于个性化） */
interface UserPsychProfile {
  primaryConcerns: Indication[];
  assessmentHistory: AssessmentRecord[];
  practicedTechniques: string[]; // technique IDs
  techniqueMastery: Map<string, number>; // 掌握程度 0-100
  preferredApproach?: string;
  riskFlags: string[];
  createdAt: number;
  updatedAt: number;
}
```

### 2.4 对话类型

```typescript
// src/types/chat.ts

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  // 结构化内容（如内嵌练习）
  structuredContent?: {
    type: 'breathing_guide' | 'thought_record' | 'technique_steps';
    data: unknown;
  };
  // AI 回应的心理学依据
  psychologicalBasis?: Array<{
    entryId: string;
    title: string;
  }>;
  // 风险评估结果
  riskAssessment?: {
    level: 'none' | 'low' | 'medium' | 'high';
    flags: string[];
  };
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  intent: 'emergency' | 'cognitive_restructuring' | 'daily_review' | 'technique_coaching' | 'general';
  createdAt: number;
  updatedAt: number;
}
```

---

## 3. 核心逻辑规范

### 3.1 情绪分析

```typescript
// src/core/emotion/analyzer.ts

/**
 * 计算情绪趋势
 * @param entries 情绪日记条目数组
 * @param period 分析周期
 */
export function analyzeTrend(
  entries: EmotionEntry[],
  period: '7d' | '30d' | '90d'
): EmotionTrend;

/**
 * 识别情绪模式
 * 例如：每周一焦虑、睡前情绪低落等
 */
export function detectPatterns(entries: EmotionEntry[]): EmotionTrend['patterns'];

/**
 * 识别触发因子
 * 统计与负面情绪高度相关的情境因素
 */
export function identifyTriggers(entries: EmotionEntry[]): EmotionTrend['triggers'];
```

### 3.2 危机检测（安全关键）

```typescript
// src/core/safety/riskDetector.ts

/**
 * 检测用户输入中的危机信号
 * 返回风险等级和识别的关键词
 * 
 * 检测维度：
 * - 自杀意念（直接/间接表达）
 * - 自伤行为
 * - 严重抑郁/绝望
 * - 精神病性症状
 */
export function detectRisk(input: string): {
  level: 'none' | 'low' | 'medium' | 'high' | 'critical';
  flags: string[];
  matchedKeywords: string[];
};

/**
 * 生成危机干预回应
 */
export function generateCrisisResponse(riskLevel: string): {
  immediateMessage: string;
  resources: CrisisResource[];
  safetyPlan?: string;
};

interface CrisisResource {
  name: string;
  type: 'hotline' | 'hospital' | 'online';
  contact: string;
  available: string;
}
```

### 3.3 个性化推荐

```typescript
// src/knowledge/recommender.ts

/**
 * 基于用户画像推荐心理技术
 * @param profile 用户心理画像
 * @param currentEmotion 当前情绪状态（可选）
 */
export function recommendTechniques(
  profile: UserPsychProfile,
  currentEmotion?: EmotionEntry
): Array<{
  technique: PsychologyEntry;
  relevance: number;
  reason: string;
}>;

/**
 * 基于测评结果生成建议方案
 */
export function generateActionPlan(
  assessment: AssessmentRecord,
  knowledgeGraph: KnowledgeGraph
): {
  immediate: string[];
  shortTerm: string[];
  longTerm: string[];
  recommendedTechniques: string[];
};
```

---

## 4. 状态管理（Zustand）

### 4.1 emotionStore

```typescript
interface EmotionStore {
  entries: EmotionEntry[];
  currentEntry: Partial<EmotionEntry> | null; // 正在编辑的条目
  
  // Actions
  addEntry: (entry: EmotionEntry) => void;
  updateEntry: (id: string, updates: Partial<EmotionEntry>) => void;
  deleteEntry: (id: string) => void;
  getTrend: (period: '7d' | '30d' | '90d') => EmotionTrend;
  getTodayEntry: () => EmotionEntry | undefined;
}
```

### 4.2 assessmentStore

```typescript
interface AssessmentStore {
  records: AssessmentRecord[];
  availableScales: Scale[];
  
  // Actions
  takeAssessment: (scaleId: string, answers: Record<string, number>) => AssessmentRecord;
  getRecordsByScale: (scaleId: string) => AssessmentRecord[];
  getLatestRecord: (scaleId: string) => AssessmentRecord | undefined;
}
```

### 4.3 userStore

```typescript
interface UserStore {
  profile: UserPsychProfile;
  settings: {
    encryptionKey: string;     // 数据加密密钥
    dailyReminder: boolean;
    reminderTime: string;      // HH:mm
    crisisHotlines: CrisisResource[];
  };
  
  // Actions
  updateProfile: (updates: Partial<UserPsychProfile>) => void;
  addRiskFlag: (flag: string) => void;
  removeRiskFlag: (flag: string) => void;
  recordTechniquePractice: (techniqueId: string) => void;
}
```

---

## 5. 存储层（IndexedDB + 加密）

```typescript
// src/db/index.ts

/**
 * 数据库：MindMirrorDB
 * 
 * Object Stores:
 * - emotion_entries: 情绪日记（AES 加密）
 * - assessment_records: 测评记录（AES 加密）
 * - chat_sessions: 对话会话
 * - chat_messages: 对话消息
 * - user_profile: 用户画像
 * - settings: 应用设置
 * - technique_progress: 练习进度
 */

const DB_NAME = 'MindMirrorDB';
const DB_VERSION = 1;

/**
 * 加密策略：
 * - 用户首次使用时生成随机密钥
 * - 密钥存储在 userStore.settings.encryptionKey
 * - 敏感数据（日记、测评）写入前 AES 加密
 * - 密钥丢失则数据不可恢复（强调给用户）
 */
```

---

## 6. AI 服务封装

```typescript
// src/services/ai.ts

/**
 * AI 对话生成
 * 
 * 安全流程：
 * 1. 输入 → riskDetector 检测
 * 2. 高风险 → 返回危机干预模板，不调用 AI
 * 3. 正常 → 检索知识库 → 组装 Prompt → 调用 Kimi API
 * 4. 输出 → 再次风险检测 → 添加免责声明
 */
export async function generateChatResponse(
  session: ChatSession,
  userMessage: string,
  userProfile: UserPsychProfile,
  knowledgeContext: PsychologyEntry[]
): Promise<{
  message: ChatMessage;
  riskDetected: boolean;
}>;

/**
 * 情绪日记 AI 分析
 * 基于近期日记生成洞察和建议
 */
export async function analyzeDiary(
  entries: EmotionEntry[],
  knowledgeContext: PsychologyEntry[]
): Promise<{
  insights: string[];
  recommendations: string[];
  patterns: string[];
}>;
```

### 6.1 Prompt 设计原则

- **角色设定**: "你是一位基于循证心理学训练的 AI 助手..."
- **知识引用**: 要求 AI 引用知识库条目 ID
- **安全边界**: 明确禁止医疗诊断、必须建议专业帮助
- **结构化输出**: 要求 JSON 格式，便于解析引用和结构化内容

---

## 7. 组件规范

### 7.1 情绪记录组件

```typescript
// src/components/emotion/EmotionRecorder.tsx

interface Props {
  onSave: (entry: EmotionEntry) => void;
  initialData?: Partial<EmotionEntry>;
}

// 步骤式表单：
// 1. 情绪选择（表情图标 + 强度滑动条）
// 2. 情境记录（可选）
// 3. 身体感受（可选）
// 4. 想法记录（CBT 五栏表，可选）
// 5. 备注（可选）
```

### 7.2 呼吸练习组件

```typescript
// src/components/exercise/BreathingGuide.tsx

interface Props {
  techniqueId: string;
  duration: number; // 分钟
  onComplete: () => void;
  onCancel: () => void;
}

// 视觉化引导：
// - 中心圆环随呼吸节奏缩放
// - 文字提示："吸气...保持...呼气..."
// - 进度条
// - 背景音（可选）
```

### 7.3 思维记录表组件

```typescript
// src/components/exercise/ThoughtRecord.tsx

interface Props {
  initialThought?: string;
  onSave: (record: EmotionEntry['thoughts']) => void;
}

// CBT 经典五栏表交互表单
// 提供认知扭曲类型选择器
```

---

## 8. 样式规范

### 8.1 Tailwind 配置

```javascript
// tailwind.config.js

module.exports = {
  theme: {
    extend: {
      colors: {
        'mist': '#7ba7bc',
        'mint': '#98d8c8',
        'warm-white': '#faf9f6',
        'warm-gray': '#e8e6e1',
        // 情绪色
        'mood-happy': '#f4d03f',
        'mood-calm': '#98d8c8',
        'mood-anxious': '#f0b27a',
        'mood-sad': '#85c1e9',
        'mood-angry': '#ec7063',
      },
      animation: {
        'breathe': 'breathe 4s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.5)' },
        },
      },
    },
  },
};
```

---

## 9. 测试策略

### 9.1 关键测试

```typescript
// src/core/safety/__tests__/riskDetector.test.ts

describe('危机检测', () => {
  it('应识别直接自杀表达', () => {
    const result = detectRisk('我想结束这一切，不想活了');
    expect(result.level).toBe('critical');
    expect(result.flags).toContain('suicidal_ideation');
  });
  
  it('应识别间接自伤信号', () => {
    const result = detectRisk('最近总用刀划自己，感觉好一些');
    expect(result.level).toBe('high');
    expect(result.flags).toContain('self_harm');
  });
  
  it('正常情绪表达不应触发', () => {
    const result = detectRisk('今天工作压力大，有点焦虑');
    expect(result.level).toBe('none');
  });
});
```

### 9.2 测试重点
- [ ] 危机检测准确性（高敏感度，宁可误报不可漏报）
- [ ] 测评计分正确性（与标准计分对比）
- [ ] 情绪趋势算法合理性
- [ ] 知识库检索相关性
- [ ] 数据加密/解密一致性

---

## 10. 开发流程

### 10.1 里程碑

| 阶段 | 目标 | 预计时间 |
|------|------|---------|
| Sprint 1 | 项目骨架 + 情绪日记 + 基础 UI | 1 周 |
| Sprint 2 | 测评系统（PHQ-9/GAD-7）+ 趋势可视化 | 1 周 |
| Sprint 3 | 知识库 + AI 对话（含危机检测）| 1 周 |
| Sprint 4 | 练习工具箱 + 测试 + 部署 | 3-5 天 |

### 10.2 安全审查清单
- [ ] 所有 AI 输出都经过风险检测
- [ ] 危机干预流程端到端测试
- [ ] 免责声明在每个相关页面可见
- [ ] 用户数据加密验证
- [ ] 量表结果解释包含"仅供参考"提示

---

## 11. 部署

### 11.1 GitHub Pages
- 静态部署
- 敏感数据本地加密存储

### 11.2 环境变量
```bash
# .env
VITE_KIMI_API_KEY=sk-xxx
VITE_KIMI_BASE_URL=https://agent-gw.kimi.com/coding
```

---

> **签名**: Kimi Claw  
> **日期**: 2026-06-16  
> **状态**: Ready for Development
