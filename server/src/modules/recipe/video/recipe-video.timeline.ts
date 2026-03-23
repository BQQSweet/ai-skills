import type {
  OcrTextEntry,
  OcrTextSpan,
  OcrTextSpanKind,
  TimedVideoFrame,
  TimelineCandidateStep,
  TimelineRecipeStep,
  VideoEvidenceSource,
} from './video-recipe.types';

export interface TimelineSegment {
  index: number;
  startSec: number;
  endSec: number;
  frames: TimedVideoFrame[];
  ocrEntries: OcrTextEntry[];
  ocrSpans: OcrTextSpan[];
  ocrSubtitleSpans: OcrTextSpan[];
  ocrIngredientCardSpans: OcrTextSpan[];
}

export interface SemanticStepMerge {
  kept_instruction: string;
  kept_start_sec: number;
  kept_end_sec: number;
  removed_instruction: string;
  removed_start_sec: number;
  removed_end_sec: number;
  final_instruction: string;
  final_start_sec: number;
  final_end_sec: number;
}

const SEMANTIC_DEDUPE_WINDOW_SECONDS = 8;
const SEMANTIC_FILLER_WORDS = ['将', '把', '再', '随后', '然后'];
const SEMANTIC_ACTION_TOKENS = [
  '调碗料汁',
  '调料汁',
  '调酱汁',
  '调汁',
  '切丁',
  '切片',
  '搅匀',
  '拌匀',
  '加入',
  '下锅',
  '翻炒',
  '炒香',
  '炒出汁水',
  '淋入',
  '煎',
  '煮',
  '焖',
  '扣',
  '盛出',
  '炒',
] as const;
const SEMANTIC_INGREDIENT_STOP_WORDS = [
  '去皮的',
  '油热',
  '表面焦黄',
  '直至',
  '后',
  '并',
  '进行',
  '继续',
];
const SEMANTIC_NORMALIZATION_REPLACEMENTS: Array<[RegExp, string]> = [
  [/切成丁/g, '切丁'],
  [/切成片/g, '切片'],
  [/放入/g, '加入'],
  [/煎至表面焦黄并盛出/g, '煎至表面焦黄盛出'],
  [/煎至表面焦黄后盛出/g, '煎至表面焦黄盛出'],
  [/进行煎制直至/g, '煎至'],
  [/煎制直至/g, '煎至'],
  [/煎制/g, '煎'],
  [/油热后/g, '油热'],
];

function normalizeInstruction(instruction: string) {
  return instruction
    .trim()
    .toLowerCase()
    .replace(/[　\s]+/g, '')
    .replace(/[，。、“”"'`~!@#$%^&*()_+\-=[\]{};:|,.<>/?！？；：]/g, '');
}

function normalizeOcrText(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[　\s]+/g, '')
    .replace(/[：:]/g, ':')
    .replace(/[，。、“”"'`~!@#$%^&*()_+\-=[\]{};|,.<>/?！？；]/g, '');
}

function jaccardSimilarity(left: string[], right: string[]) {
  const leftSet = new Set(left);
  const rightSet = new Set(right);
  const intersection = Array.from(leftSet).filter((item) => rightSet.has(item));
  const union = new Set([...leftSet, ...rightSet]);
  return union.size === 0 ? 0 : intersection.length / union.size;
}

function isNoiseText(text: string) {
  return /抖音号|抖音|搜索|扫一扫|截图保存到相册|大家都在|搜索页|喵小鱼/.test(
    text,
  );
}

function isIngredientCardTexts(texts: string[]) {
  const joined = texts.join(' ');
  const measureCount = texts.filter((text) =>
    /(勺|碗|克|ml|毫升|适量|半勺|大半碗|小半碗)/.test(text),
  ).length;

  return measureCount >= 2 || /(勺|碗|克|ml|毫升)/.test(joined);
}

function inferSpanKind(texts: string[]): OcrTextSpanKind {
  if (texts.every((text) => isNoiseText(text))) {
    return 'noise';
  }

  if (isIngredientCardTexts(texts)) {
    return 'ingredient_card';
  }

  return 'subtitle';
}

function buildFingerprint(normalizedTexts: string[]) {
  return normalizedTexts.slice().sort().join('|');
}

function isActionSubtitle(text: string) {
  return /(切|调|搅|拌|放入|下锅|炒|煎|煮|焖|扣|翻炒|盛出|淋入|炒香|炒出汁水)/.test(
    text,
  );
}

function isMarketingSubtitle(text: string) {
  return /(吃饭啦|好好吃饭|裹满了米饭|菜谱|懒人菜谱|成品|开饭|好吃哭了)/.test(
    text,
  );
}

function normalizeSemanticInstruction(instruction: string) {
  let normalized = normalizeInstruction(instruction);

  for (const filler of SEMANTIC_FILLER_WORDS) {
    normalized = normalized.replace(new RegExp(filler, 'g'), '');
  }

  for (let iteration = 0; iteration < 3; iteration += 1) {
    let changed = false;

    for (const [pattern, replacement] of SEMANTIC_NORMALIZATION_REPLACEMENTS) {
      const nextNormalized = normalized.replace(pattern, replacement);
      if (nextNormalized !== normalized) {
        changed = true;
        normalized = nextNormalized;
      }
    }

    if (!changed) {
      break;
    }
  }

  return normalized;
}

function sortTimelineSteps(
  left: Pick<TimelineRecipeStep, 'evidence_start_sec' | 'evidence_end_sec' | 'order'>,
  right: Pick<TimelineRecipeStep, 'evidence_start_sec' | 'evidence_end_sec' | 'order'>,
) {
  if (left.evidence_start_sec !== right.evidence_start_sec) {
    return left.evidence_start_sec - right.evidence_start_sec;
  }

  if (left.evidence_end_sec !== right.evidence_end_sec) {
    return left.evidence_end_sec - right.evidence_end_sec;
  }

  return (left.order || 0) - (right.order || 0);
}

function cloneTimelineRecipeStep(step: TimelineRecipeStep): TimelineRecipeStep {
  return {
    ...step,
    details: step.details ? [...step.details] : undefined,
    evidence_sources: [...step.evidence_sources],
  };
}

function mergeOrderedUniqueValues(values: Array<string[] | undefined>) {
  const merged: string[] = [];

  for (const group of values) {
    for (const value of group || []) {
      if (!merged.includes(value)) {
        merged.push(value);
      }
    }
  }

  return merged;
}

function extractActionToken(normalizedInstruction: string) {
  for (const token of SEMANTIC_ACTION_TOKENS) {
    if (normalizedInstruction.includes(token)) {
      return token;
    }
  }

  return null;
}

function extractIngredientKeywords(
  normalizedInstruction: string,
  actionToken: string | null,
) {
  let stripped = normalizedInstruction;

  if (actionToken) {
    stripped = stripped.replace(actionToken, '');
  }

  for (const token of SEMANTIC_ACTION_TOKENS) {
    stripped = stripped.replace(new RegExp(token, 'g'), '');
  }

  for (const stopWord of SEMANTIC_INGREDIENT_STOP_WORDS) {
    stripped = stripped.replace(new RegExp(stopWord, 'g'), '');
  }

  return stripped
    .replace(/(和|及|与|跟)/g, '|')
    .split(/[^一-龥]+/)
    .map((part) => part.trim())
    .filter((part) => part.length >= 2);
}

function hasConflictingIngredientKeywords(
  leftKeywords: string[],
  rightKeywords: string[],
) {
  if (leftKeywords.length === 0 || rightKeywords.length === 0) {
    return false;
  }

  return leftKeywords.every((keyword) => !rightKeywords.includes(keyword))
    && rightKeywords.every((keyword) => !leftKeywords.includes(keyword));
}

function prefersSemanticKeepCandidate(
  currentKept: TimelineRecipeStep,
  incoming: TimelineRecipeStep,
) {
  const keptHasOcr = currentKept.evidence_sources.includes('ocr');
  const incomingHasOcr = incoming.evidence_sources.includes('ocr');

  if (keptHasOcr !== incomingHasOcr) {
    return incomingHasOcr;
  }

  const keptInstructionLength = currentKept.instruction.trim().length;
  const incomingInstructionLength = incoming.instruction.trim().length;

  if (keptInstructionLength !== incomingInstructionLength) {
    return incomingInstructionLength < keptInstructionLength;
  }

  return incoming.evidence_start_sec < currentKept.evidence_start_sec;
}

function mergeSemanticSteps(
  kept: TimelineRecipeStep,
  removed: TimelineRecipeStep,
) {
  return {
    ...cloneTimelineRecipeStep(kept),
    duration_min: Math.max(kept.duration_min || 0, removed.duration_min || 0) || 1,
    timer_required: Boolean(kept.timer_required) || Boolean(removed.timer_required),
    details: (() => {
      const details = mergeOrderedUniqueValues([kept.details, removed.details]);
      return details.length > 0 ? details : undefined;
    })(),
    estimated: kept.estimated === true && removed.estimated === true,
    evidence_sources: mergeOrderedUniqueValues([
      kept.evidence_sources,
      removed.evidence_sources,
    ]) as VideoEvidenceSource[],
    evidence_start_sec: Number(
      Math.min(kept.evidence_start_sec, removed.evidence_start_sec).toFixed(2),
    ),
    evidence_end_sec: Number(
      Math.max(kept.evidence_end_sec, removed.evidence_end_sec).toFixed(2),
    ),
  } satisfies TimelineRecipeStep;
}

function canMergeSemantically(
  existing: TimelineRecipeStep,
  candidate: TimelineRecipeStep,
) {
  if (
    Math.abs(existing.evidence_start_sec - candidate.evidence_start_sec)
    > SEMANTIC_DEDUPE_WINDOW_SECONDS
  ) {
    return false;
  }

  const existingDedupeKey = normalizeSemanticInstruction(existing.instruction);
  const candidateDedupeKey = normalizeSemanticInstruction(candidate.instruction);

  if (!existingDedupeKey || existingDedupeKey !== candidateDedupeKey) {
    return false;
  }

  const existingAction = extractActionToken(existingDedupeKey);
  const candidateAction = extractActionToken(candidateDedupeKey);
  if (existingAction && candidateAction && existingAction !== candidateAction) {
    return false;
  }

  const existingIngredients = extractIngredientKeywords(
    existingDedupeKey,
    existingAction,
  );
  const candidateIngredients = extractIngredientKeywords(
    candidateDedupeKey,
    candidateAction,
  );

  return !hasConflictingIngredientKeywords(
    existingIngredients,
    candidateIngredients,
  );
}

export function buildTimelineSegments(options: {
  durationSeconds: number;
  frames: TimedVideoFrame[];
  ocrEntries: OcrTextEntry[];
  ocrSpans: OcrTextSpan[];
}) {
  const { durationSeconds, frames, ocrEntries, ocrSpans } = options;
  const segmentCount = Math.min(12, Math.max(2, Math.ceil(durationSeconds / 6)));
  const segmentDuration = durationSeconds / segmentCount;
  const segments: TimelineSegment[] = [];

  for (let index = 0; index < segmentCount; index += 1) {
    const startSec = Number((segmentDuration * index).toFixed(2));
    const endSec =
      index === segmentCount - 1
        ? Number(durationSeconds.toFixed(2))
        : Number((segmentDuration * (index + 1)).toFixed(2));

    const segmentSpans = ocrSpans.filter((span) =>
      span.startSec >= startSec
      && (index === segmentCount - 1 ? span.startSec <= endSec : span.startSec < endSec),
    );

    segments.push({
      index,
      startSec,
      endSec,
      frames: frames.filter((frame) =>
        frame.timeSec >= startSec
        && (index === segmentCount - 1
          ? frame.timeSec <= endSec
          : frame.timeSec < endSec),
      ),
      ocrEntries: ocrEntries.filter((entry) =>
        entry.timeSec >= startSec
        && (index === segmentCount - 1
          ? entry.timeSec <= endSec
          : entry.timeSec < endSec),
      ),
      ocrSpans: segmentSpans,
      ocrSubtitleSpans: segmentSpans.filter((span) => span.kind === 'subtitle'),
      ocrIngredientCardSpans: segmentSpans.filter(
        (span) => span.kind === 'ingredient_card',
      ),
    });
  }

  return segments.filter(
    (segment) =>
      segment.frames.length > 0
      || segment.ocrEntries.length > 0
      || segment.ocrSpans.length > 0,
  );
}

export function mergeOcrEntriesToSpans(entries: OcrTextEntry[]): OcrTextSpan[] {
  const normalizedEntries = entries
    .map((entry) => {
      const texts = entry.texts
        .map((text) => text.trim())
        .filter((text) => text && !isNoiseText(text));
      const normalizedTexts = texts.map(normalizeOcrText).filter(Boolean);

      if (!texts.length || !normalizedTexts.length) {
        return null;
      }

      return {
        timeSec: entry.timeSec,
        texts: Array.from(new Set(texts)),
        normalizedTexts: Array.from(new Set(normalizedTexts)),
      };
    })
    .filter(Boolean) as Array<{
    timeSec: number;
    texts: string[];
    normalizedTexts: string[];
  }>;

  const spans: OcrTextSpan[] = [];

  for (const entry of normalizedEntries) {
    const kind = inferSpanKind(entry.texts);
    const fingerprint = buildFingerprint(entry.normalizedTexts);
    const previous = spans[spans.length - 1];

    const canMerge =
      previous
      && previous.kind === kind
      && entry.timeSec - previous.endSec <= 4
      && (previous.fingerprint === fingerprint
        || jaccardSimilarity(previous.normalizedTexts, entry.normalizedTexts) >= 0.8);

    if (canMerge) {
      previous.endSec = entry.timeSec;
      if (entry.texts.length > previous.texts.length) {
        previous.texts = entry.texts;
        previous.normalizedTexts = entry.normalizedTexts;
        previous.fingerprint = fingerprint;
      }
      continue;
    }

    spans.push({
      startSec: entry.timeSec,
      endSec: entry.timeSec,
      texts: entry.texts,
      normalizedTexts: entry.normalizedTexts,
      fingerprint,
      kind,
    });
  }

  return spans.filter((span) => span.kind !== 'noise');
}

export function buildOcrSubtitleCandidates(
  spans: OcrTextSpan[],
): TimelineCandidateStep[] {
  return spans
    .filter((span) => span.kind === 'subtitle')
    .flatMap((span) =>
      span.texts
        .map((text) => text.trim())
        .filter((text) => text && isActionSubtitle(text) && !isMarketingSubtitle(text))
        .map((text) => ({
          instruction: text,
          start_sec: Number(span.startSec.toFixed(2)),
          end_sec: Number(span.endSec.toFixed(2)),
          duration_min: 1,
          timer_required: false,
          evidence_sources: ['ocr'] as VideoEvidenceSource[],
          origin: 'ocr_direct' as const,
        })),
    );
}

export function mergeStrictModeCandidates(options: {
  ocrCandidates: TimelineCandidateStep[];
  aiCandidates: TimelineCandidateStep[];
}) {
  const result: TimelineCandidateStep[] = [];
  const droppedConflictingAi: TimelineCandidateStep[] = [];
  const supplementalAi: TimelineCandidateStep[] = [];

  for (const ocrCandidate of options.ocrCandidates) {
    result.push(ocrCandidate);
  }

  for (const aiCandidate of options.aiCandidates) {
    const conflictingOcr = options.ocrCandidates.find((ocrCandidate) => {
      const timeOverlap =
        Math.abs(ocrCandidate.start_sec - aiCandidate.start_sec) <= 4;
      if (!timeOverlap) {
        return false;
      }

      const sameInstruction =
        normalizeInstruction(ocrCandidate.instruction)
        === normalizeInstruction(aiCandidate.instruction);
      if (sameInstruction) {
        return true;
      }

      return ocrCandidate.origin === 'ocr_direct';
    });

    if (conflictingOcr) {
      const sameInstruction =
        normalizeInstruction(conflictingOcr.instruction)
        === normalizeInstruction(aiCandidate.instruction);

      if (sameInstruction) {
        conflictingOcr.evidence_sources = Array.from(
          new Set([...conflictingOcr.evidence_sources, ...aiCandidate.evidence_sources]),
        );
        conflictingOcr.end_sec = Math.max(conflictingOcr.end_sec, aiCandidate.end_sec);
        conflictingOcr.duration_min = Math.max(
          conflictingOcr.duration_min || 1,
          aiCandidate.duration_min || 1,
        );
        continue;
      }

      droppedConflictingAi.push(aiCandidate);
      continue;
    }

    supplementalAi.push(aiCandidate);
    result.push(aiCandidate);
  }

  return {
    candidates: result.sort((left, right) => left.start_sec - right.start_sec),
    droppedConflictingAi,
    supplementalAi,
  };
}

export function buildStrictTimelineSteps(
  candidates: TimelineCandidateStep[],
): TimelineRecipeStep[] {
  const sortedCandidates = candidates
    .filter((step) => step.instruction.trim().length > 0)
    .slice()
    .sort((left, right) => {
      if (left.start_sec !== right.start_sec) {
        return left.start_sec - right.start_sec;
      }
      return left.end_sec - right.end_sec;
    });

  const merged: TimelineRecipeStep[] = [];

  for (const candidate of sortedCandidates) {
    const normalizedInstruction = normalizeInstruction(candidate.instruction);
    if (!normalizedInstruction) {
      continue;
    }

    const duplicated = merged.find((existing) => {
      const sameInstruction =
        normalizeInstruction(existing.instruction) === normalizedInstruction;
      const closeInTimeline =
        Math.abs(existing.evidence_start_sec - candidate.start_sec) <= 4;
      return sameInstruction && closeInTimeline;
    });

    if (duplicated) {
      duplicated.evidence_start_sec = Math.min(
        duplicated.evidence_start_sec,
        candidate.start_sec,
      );
      duplicated.evidence_end_sec = Math.max(
        duplicated.evidence_end_sec,
        candidate.end_sec,
      );
      duplicated.duration_min = Math.max(
        duplicated.duration_min || 1,
        candidate.duration_min || 1,
      );
      duplicated.timer_required =
        duplicated.timer_required || Boolean(candidate.timer_required);
      duplicated.evidence_sources = Array.from(
        new Set([...duplicated.evidence_sources, ...candidate.evidence_sources]),
      );
      continue;
    }

    merged.push({
      order: merged.length + 1,
      instruction: candidate.instruction.trim(),
      duration_min: candidate.duration_min || 1,
      timer_required: Boolean(candidate.timer_required),
      estimated: false,
      evidence_sources: Array.from(new Set(candidate.evidence_sources)),
      evidence_start_sec: Number(candidate.start_sec.toFixed(2)),
      evidence_end_sec: Number(candidate.end_sec.toFixed(2)),
    });
  }

  return merged.map((step, index) => ({
    ...step,
    order: index + 1,
  }));
}

function canAttachDetailsToStep(step: TimelineRecipeStep) {
  return /(调碗料汁|调料汁|搅匀|拌匀|调酱汁|调汁)/.test(step.instruction);
}

function stripActionLikeText(texts: string[]) {
  return texts.filter((text) => !/(调碗料汁|调料汁|搅匀|拌匀)/.test(text));
}

export function attachIngredientCardDetails(
  strictSteps: TimelineRecipeStep[],
  ocrSpans: OcrTextSpan[],
) {
  const nextSteps = strictSteps.map((step) => ({
    ...step,
    details: step.details ? [...step.details] : undefined,
  }));

  for (const span of ocrSpans) {
    if (span.kind !== 'ingredient_card') {
      continue;
    }

    const detailTexts = stripActionLikeText(span.texts);
    if (!detailTexts.length) {
      continue;
    }

    let targetStep = nextSteps.find((step) => {
      const timeDistance = Math.abs(step.evidence_start_sec - span.startSec);
      return canAttachDetailsToStep(step) && timeDistance <= 6;
    });

    if (!targetStep) {
      targetStep = nextSteps.find((step) => {
        const timeDistance = Math.abs(step.evidence_start_sec - span.startSec);
        return timeDistance <= 4;
      });
    }

    if (!targetStep) {
      nextSteps.push({
        order: nextSteps.length + 1,
        instruction: '调碗料汁',
        duration_min: 1,
        timer_required: false,
        details: detailTexts,
        estimated: false,
        evidence_sources: ['ocr'],
        evidence_start_sec: Number(span.startSec.toFixed(2)),
        evidence_end_sec: Number(span.endSec.toFixed(2)),
      });
      continue;
    }

    targetStep.details = Array.from(
      new Set([...(targetStep.details || []), ...detailTexts]),
    );
    targetStep.evidence_sources = Array.from(
      new Set([...targetStep.evidence_sources, 'ocr']),
    );
    targetStep.evidence_start_sec = Math.min(
      targetStep.evidence_start_sec,
      span.startSec,
    );
    targetStep.evidence_end_sec = Math.max(targetStep.evidence_end_sec, span.endSec);
  }

  return nextSteps
    .sort((left, right) => left.evidence_start_sec - right.evidence_start_sec)
    .map((step, index) => ({
      ...step,
      order: index + 1,
    }));
}

export function dedupeSemanticSteps(steps: TimelineRecipeStep[]) {
  const merges: SemanticStepMerge[] = [];
  const retainedSteps: TimelineRecipeStep[] = [];
  const sortedSteps = steps
    .map((step) => cloneTimelineRecipeStep(step))
    .sort(sortTimelineSteps);

  for (const step of sortedSteps) {
    let mergeIndex = -1;

    for (let index = retainedSteps.length - 1; index >= 0; index -= 1) {
      const existing = retainedSteps[index];
      if (
        step.evidence_start_sec - existing.evidence_start_sec
        > SEMANTIC_DEDUPE_WINDOW_SECONDS
      ) {
        break;
      }

      if (canMergeSemantically(existing, step)) {
        mergeIndex = index;
        break;
      }
    }

    if (mergeIndex === -1) {
      retainedSteps.push(step);
      continue;
    }

    const existing = retainedSteps[mergeIndex];
    const keepIncoming = prefersSemanticKeepCandidate(existing, step);
    const keptSnapshot = cloneTimelineRecipeStep(keepIncoming ? step : existing);
    const removedSnapshot = cloneTimelineRecipeStep(keepIncoming ? existing : step);
    const mergedStep = mergeSemanticSteps(keptSnapshot, removedSnapshot);

    retainedSteps[mergeIndex] = mergedStep;
    merges.push({
      kept_instruction: keptSnapshot.instruction,
      kept_start_sec: keptSnapshot.evidence_start_sec,
      kept_end_sec: keptSnapshot.evidence_end_sec,
      removed_instruction: removedSnapshot.instruction,
      removed_start_sec: removedSnapshot.evidence_start_sec,
      removed_end_sec: removedSnapshot.evidence_end_sec,
      final_instruction: mergedStep.instruction,
      final_start_sec: mergedStep.evidence_start_sec,
      final_end_sec: mergedStep.evidence_end_sec,
    });
  }

  return {
    steps: retainedSteps
      .sort(sortTimelineSteps)
      .map((step, index) => ({
        ...step,
        order: index + 1,
      })),
    merges,
  };
}

export function applyAssistedInsertions(
  strictSteps: TimelineRecipeStep[],
  insertions: Array<{
    insert_after_order: number;
    instruction: string;
    duration_min?: number;
    timer_required?: boolean;
  }>,
): TimelineRecipeStep[] {
  const nextSteps: TimelineRecipeStep[] = [];
  const groupedInsertions = new Map<number, typeof insertions>();

  for (const insertion of insertions) {
    const key = Math.max(0, Math.round(insertion.insert_after_order || 0));
    const group = groupedInsertions.get(key) || [];
    group.push(insertion);
    groupedInsertions.set(key, group);
  }

  const appendInsertions = (order: number) => {
    const group = groupedInsertions.get(order) || [];
    for (const insertion of group) {
      if (!insertion.instruction?.trim()) {
        continue;
      }

      const previousStep = nextSteps[nextSteps.length - 1];
      const baseTime = previousStep?.evidence_end_sec || 0;
      nextSteps.push({
        order: nextSteps.length + 1,
        instruction: insertion.instruction.trim(),
        duration_min: insertion.duration_min || 2,
        timer_required: Boolean(insertion.timer_required),
        estimated: true,
        evidence_sources: ['inferred'],
        evidence_start_sec: baseTime,
        evidence_end_sec: baseTime,
      });
    }
  };

  appendInsertions(0);

  for (const strictStep of strictSteps) {
    nextSteps.push({
      ...strictStep,
      order: nextSteps.length + 1,
    });
    appendInsertions(strictStep.order || nextSteps.length);
  }

  return nextSteps.map((step, index) => ({
    ...step,
    order: index + 1,
  }));
}

export function mergeEvidenceSources(
  ...sources: Array<VideoEvidenceSource[] | undefined>
) {
  return Array.from(new Set(sources.flatMap((source) => source || [])));
}
