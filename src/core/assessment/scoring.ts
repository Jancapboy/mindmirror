import type { Scale, ScoreInterpretation } from '../../types/assessment';

export function calculateScore(scale: Scale, answers: Record<string, number>): number {
  let total = 0;
  for (const question of scale.questions) {
    const answer = answers[question.id];
    if (answer !== undefined) {
      total += question.reverseScored ? (scale.scoringRules.maxScore / scale.questions.length - answer) : answer;
    }
  }
  return total;
}

export function getInterpretation(scale: Scale, score: number): ScoreInterpretation {
  for (const interp of scale.interpretation) {
    if (score >= interp.range[0] && score <= interp.range[1]) {
      return interp;
    }
  }
  return scale.interpretation[scale.interpretation.length - 1];
}

export function getSeverity(scale: Scale, score: number): { severity: string; label: string; action: string } {
  // Sort cutoffs in descending order to find the highest matching threshold
  const sortedCutoffs = [...scale.scoringRules.cutoffs].sort((a, b) => b.threshold - a.threshold);
  for (const cutoff of sortedCutoffs) {
    if (score >= cutoff.threshold) {
      return { severity: cutoff.severity, label: cutoff.label, action: cutoff.action };
    }
  }
  return { severity: 'none', label: '无', action: '' };
}

export function getProgressPercent(scale: Scale, currentQuestionIndex: number): number {
  return Math.round(((currentQuestionIndex + 1) / scale.questions.length) * 100);
}

export function isComplete(scale: Scale, answers: Record<string, number>): boolean {
  return scale.questions.every(q => answers[q.id] !== undefined);
}
