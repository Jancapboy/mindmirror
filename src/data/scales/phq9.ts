import type { Scale } from '../../types/assessment';

export const phq9Scale: Scale = {
  id: 'phq-9',
  name: 'PHQ-9',
  fullName: '患者健康问卷抑郁量表',
  description: '评估过去两周的抑郁症状严重程度',
  questions: [
    {
      id: 'phq9-q1',
      text: '做事时提不起劲或没有兴趣',
      options: [
        { value: 0, label: '完全没有' },
        { value: 1, label: '好几天' },
        { value: 2, label: '一半以上的天数' },
        { value: 3, label: '几乎每天' },
      ],
    },
    {
      id: 'phq9-q2',
      text: '感到心情低落、沮丧或绝望',
      options: [
        { value: 0, label: '完全没有' },
        { value: 1, label: '好几天' },
        { value: 2, label: '一半以上的天数' },
        { value: 3, label: '几乎每天' },
      ],
    },
    {
      id: 'phq9-q3',
      text: '入睡困难、睡不安稳或睡眠过多',
      options: [
        { value: 0, label: '完全没有' },
        { value: 1, label: '好几天' },
        { value: 2, label: '一半以上的天数' },
        { value: 3, label: '几乎每天' },
      ],
    },
    {
      id: 'phq9-q4',
      text: '感觉疲倦或没有活力',
      options: [
        { value: 0, label: '完全没有' },
        { value: 1, label: '好几天' },
        { value: 2, label: '一半以上的天数' },
        { value: 3, label: '几乎每天' },
      ],
    },
    {
      id: 'phq9-q5',
      text: '食欲不振或吃太多',
      options: [
        { value: 0, label: '完全没有' },
        { value: 1, label: '好几天' },
        { value: 2, label: '一半以上的天数' },
        { value: 3, label: '几乎每天' },
      ],
    },
    {
      id: 'phq9-q6',
      text: '觉得自己很糟——或觉得自己很失败，或让自己或家人失望',
      options: [
        { value: 0, label: '完全没有' },
        { value: 1, label: '好几天' },
        { value: 2, label: '一半以上的天数' },
        { value: 3, label: '几乎每天' },
      ],
    },
    {
      id: 'phq9-q7',
      text: '对事物专注有困难，例如阅读报纸或看电视时',
      options: [
        { value: 0, label: '完全没有' },
        { value: 1, label: '好几天' },
        { value: 2, label: '一半以上的天数' },
        { value: 3, label: '几乎每天' },
      ],
    },
    {
      id: 'phq9-q8',
      text: '动作或说话速度缓慢到别人已经觉察到？或刚好相反——烦躁或坐立不安、动来动去的情况更胜于平常',
      options: [
        { value: 0, label: '完全没有' },
        { value: 1, label: '好几天' },
        { value: 2, label: '一半以上的天数' },
        { value: 3, label: '几乎每天' },
      ],
    },
    {
      id: 'phq9-q9',
      text: '有不如死掉或用某种方式伤害自己的念头',
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
    maxScore: 27,
    cutoffs: [
      { threshold: 0, label: '无抑郁', severity: 'none', action: '保持良好的心理状态，继续保持积极的生活方式。' },
      { threshold: 5, label: '轻度抑郁', severity: 'mild', action: '建议关注自己的情绪变化，尝试一些放松技巧。如果症状持续，建议咨询专业人士。' },
      { threshold: 10, label: '中度抑郁', severity: 'moderate', action: '建议寻求专业心理咨询或精神科医生的帮助，同时可以尝试认知行为疗法等自助方法。' },
      { threshold: 15, label: '中重度抑郁', severity: 'severe', action: '强烈建议尽快寻求专业帮助，可以考虑心理咨询和/或药物治疗。' },
      { threshold: 20, label: '重度抑郁', severity: 'severe', action: '请务必尽快寻求专业精神科医生的帮助，可能需要综合治疗方案。' },
    ],
  },
  interpretation: [
    { range: [0, 4], label: '无抑郁', description: '你的抑郁症状很少或没有。', recommendation: '继续保持积极的生活方式，定期关注自己的情绪状态。' },
    { range: [5, 9], label: '轻度抑郁', description: '有轻度抑郁症状，可能会影响日常生活。', recommendation: '尝试放松技巧、规律运动和社交活动。如症状持续2周以上，建议咨询专业人士。' },
    { range: [10, 14], label: '中度抑郁', description: '抑郁症状较为明显，对生活质量有一定影响。', recommendation: '建议寻求专业心理咨询，可考虑认知行为疗法(CBT)等循证治疗方法。' },
    { range: [15, 19], label: '中重度抑郁', description: '抑郁症状严重，明显影响日常生活和功能。', recommendation: '强烈建议尽快寻求专业帮助，可能需要心理治疗联合药物治疗。' },
    { range: [20, 27], label: '重度抑郁', description: '抑郁症状非常严重，严重影响日常生活。', recommendation: '请务必尽快就医，寻求精神科医生的专业诊断和治疗。' },
  ],
  source: 'Kroenke K, Spitzer RL, Williams JB. The PHQ-9: validity of a brief depression severity measure. J Gen Intern Med. 2001',
  reliability: 'Cronbach\'s α = 0.89',
  validity: '与临床诊断一致性良好，灵敏度88%，特异度85%',
};
