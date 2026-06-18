import type { Scale } from '../../types/assessment';

export const gad7Scale: Scale = {
  id: 'gad-7',
  name: 'GAD-7',
  fullName: '广泛性焦虑量表',
  description: '评估过去两周的焦虑症状严重程度',
  questions: [
    {
      id: 'gad7-q1',
      text: '感觉紧张、焦虑或急切',
      options: [
        { value: 0, label: '完全没有' },
        { value: 1, label: '好几天' },
        { value: 2, label: '一半以上的天数' },
        { value: 3, label: '几乎每天' },
      ],
    },
    {
      id: 'gad7-q2',
      text: '不能停止或控制担忧',
      options: [
        { value: 0, label: '完全没有' },
        { value: 1, label: '好几天' },
        { value: 2, label: '一半以上的天数' },
        { value: 3, label: '几乎每天' },
      ],
    },
    {
      id: 'gad7-q3',
      text: '对各种事情担忧过多',
      options: [
        { value: 0, label: '完全没有' },
        { value: 1, label: '好几天' },
        { value: 2, label: '一半以上的天数' },
        { value: 3, label: '几乎每天' },
      ],
    },
    {
      id: 'gad7-q4',
      text: '很难放松下来',
      options: [
        { value: 0, label: '完全没有' },
        { value: 1, label: '好几天' },
        { value: 2, label: '一半以上的天数' },
        { value: 3, label: '几乎每天' },
      ],
    },
    {
      id: 'gad7-q5',
      text: '由于不安而无法静坐',
      options: [
        { value: 0, label: '完全没有' },
        { value: 1, label: '好几天' },
        { value: 2, label: '一半以上的天数' },
        { value: 3, label: '几乎每天' },
      ],
    },
    {
      id: 'gad7-q6',
      text: '变得容易烦恼或急躁',
      options: [
        { value: 0, label: '完全没有' },
        { value: 1, label: '好几天' },
        { value: 2, label: '一半以上的天数' },
        { value: 3, label: '几乎每天' },
      ],
    },
    {
      id: 'gad7-q7',
      text: '感到好像有可怕的事要发生',
      options: [
        { value: 0, label: '完全没有' },
        { value: 1, label: '好几天' },
        { value: 2, label: '一半以上的天数' },
        { value: 3, label: '几乎每天' },
      ],
    },
  ],
  scoringRules: {
    minScore: 0,
    maxScore: 21,
    cutoffs: [
      { threshold: 0, label: '无焦虑', severity: 'none', action: '保持良好的心理状态，继续保持积极的生活方式。' },
      { threshold: 5, label: '轻度焦虑', severity: 'mild', action: '建议关注自己的情绪变化，尝试一些放松技巧。如果症状持续，建议咨询专业人士。' },
      { threshold: 10, label: '中度焦虑', severity: 'moderate', action: '建议寻求专业心理咨询或精神科医生的帮助，同时可以尝试认知行为疗法等自助方法。' },
      { threshold: 15, label: '重度焦虑', severity: 'severe', action: '强烈建议尽快寻求专业帮助，可能需要综合治疗方案。' },
    ],
  },
  interpretation: [
    { range: [0, 4], label: '无焦虑', description: '你的焦虑症状很少或没有。', recommendation: '继续保持积极的生活方式，定期关注自己的情绪状态。' },
    { range: [5, 9], label: '轻度焦虑', description: '有轻度焦虑症状，可能会影响日常生活。', recommendation: '尝试放松技巧、正念冥想和规律运动。如症状持续2周以上，建议咨询专业人士。' },
    { range: [10, 14], label: '中度焦虑', description: '焦虑症状较为明显，对生活质量有一定影响。', recommendation: '建议寻求专业心理咨询，可考虑认知行为疗法(CBT)等循证治疗方法。' },
    { range: [15, 21], label: '重度焦虑', description: '焦虑症状严重，明显影响日常生活和功能。', recommendation: '强烈建议尽快寻求专业帮助，可能需要心理治疗联合药物治疗。' },
  ],
  source: 'Spitzer RL, Kroenke K, Williams JB, Löwe B. A brief measure for assessing generalized anxiety disorder: the GAD-7. Arch Intern Med. 2006',
  reliability: 'Cronbach\'s α = 0.92',
  validity: '与临床诊断一致性良好，灵敏度89%，特异度82%',
};
