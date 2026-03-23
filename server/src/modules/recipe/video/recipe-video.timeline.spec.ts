import {
  attachIngredientCardDetails,
  applyAssistedInsertions,
  buildOcrSubtitleCandidates,
  buildStrictTimelineSteps,
  dedupeSemanticSteps,
  mergeStrictModeCandidates,
  mergeOcrEntriesToSpans,
} from './recipe-video.timeline';

describe('recipe-video timeline helpers', () => {
  it('sorts candidate steps by evidence time and merges nearby duplicates', () => {
    const steps = buildStrictTimelineSteps([
      {
        instruction: '调碗料汁',
        start_sec: 8,
        end_sec: 11,
        evidence_sources: ['ocr'],
        duration_min: 1,
        timer_required: false,
      },
      {
        instruction: '锅中下油翻炒',
        start_sec: 20,
        end_sec: 26,
        evidence_sources: ['visual'],
        duration_min: 4,
        timer_required: false,
      },
      {
        instruction: '调碗料汁',
        start_sec: 9,
        end_sec: 12,
        evidence_sources: ['visual'],
        duration_min: 1,
        timer_required: false,
      },
    ]);

    expect(steps).toHaveLength(2);
    expect(steps[0].instruction).toBe('调碗料汁');
    expect(steps[0].evidence_sources).toEqual(['ocr', 'visual']);
    expect(steps[1].instruction).toBe('锅中下油翻炒');
  });

  it('keeps strict steps and injects assisted steps as estimated', () => {
    const strictSteps = buildStrictTimelineSteps([
      {
        instruction: '锅中下油翻炒',
        start_sec: 20,
        end_sec: 26,
        evidence_sources: ['visual'],
        duration_min: 4,
        timer_required: false,
      },
      {
        instruction: '倒入料汁收浓',
        start_sec: 35,
        end_sec: 40,
        evidence_sources: ['ocr'],
        duration_min: 2,
        timer_required: false,
      },
    ]);

    const result = applyAssistedInsertions(strictSteps, [
      {
        insert_after_order: 1,
        instruction: '加入土豆和香肠继续翻炒',
        duration_min: 3,
        timer_required: false,
      },
    ]);

    expect(result).toHaveLength(3);
    expect(result[1].estimated).toBe(true);
    expect(result[1].evidence_sources).toEqual(['inferred']);
    expect(result[2].instruction).toBe('倒入料汁收浓');
  });

  it('merges duplicate ingredient-card OCR entries and attaches details to 调碗料汁', () => {
    const ocrSpans = mergeOcrEntriesToSpans([
      { timeSec: 10.07, texts: ['调碗料汁'] },
      {
        timeSec: 12.08,
        texts: [
          '1勺生抽',
          '半勺老抽',
          '1勺耗油',
          '1勺淀粉',
          '半勺白糖',
          '1勺番茄酱',
          '大半碗水',
          '调碗料汁',
        ],
      },
      {
        timeSec: 14.1,
        texts: [
          '1勺生抽',
          '半勺老抽',
          '1勺耗油',
          '1勺淀粉',
          '半勺白糖',
          '1勺番茄酱',
          '大半碗水',
          '调碗料汁',
        ],
      },
      { timeSec: 16.11, texts: ['搅匀'] },
      { timeSec: 18.12, texts: ['油热放入土豆煎至表面焦黄盛出'] },
      { timeSec: 20.14, texts: ['油热放入土豆煎至表面焦黄盛出'] },
    ]);

    expect(ocrSpans).toHaveLength(4);
    expect(ocrSpans[1].kind).toBe('ingredient_card');
    expect(ocrSpans[1].texts).toContain('1勺生抽');
    expect(ocrSpans[1].texts).toContain('大半碗水');

    const strictSteps = buildStrictTimelineSteps([
      {
        instruction: '调碗料汁',
        start_sec: 10.07,
        end_sec: 10.9,
        evidence_sources: ['ocr'],
        duration_min: 1,
        timer_required: false,
      },
      {
        instruction: '油热放入土豆煎至表面焦黄盛出',
        start_sec: 18.12,
        end_sec: 20.14,
        evidence_sources: ['ocr'],
        duration_min: 4,
        timer_required: false,
      },
    ]);

    const stepsWithDetails = attachIngredientCardDetails(strictSteps, ocrSpans);
    expect(stepsWithDetails[0].instruction).toBe('调碗料汁');
    expect(stepsWithDetails[0].details).toEqual([
      '1勺生抽',
      '半勺老抽',
      '1勺耗油',
      '1勺淀粉',
      '半勺白糖',
      '1勺番茄酱',
      '大半碗水',
    ]);
    expect(stepsWithDetails[0].details).not.toContain('调碗料汁');
    expect(stepsWithDetails[1].instruction).toBe('油热放入土豆煎至表面焦黄盛出');
  });

  it('keeps OCR subtitle candidates when AI conflicts with different ingredient words', () => {
    const ocrSpans = mergeOcrEntriesToSpans([
      { timeSec: 8.05, texts: ['去皮的土豆切丁'] },
    ]);

    const ocrCandidates = buildOcrSubtitleCandidates(ocrSpans);
    const merged = mergeStrictModeCandidates({
      ocrCandidates,
      aiCandidates: [
        {
          instruction: '去皮的番茄切丁',
          start_sec: 5.59,
          end_sec: 11.19,
          evidence_sources: ['visual', 'ocr'],
          duration_min: 1,
          timer_required: false,
          origin: 'ai_segment',
        },
      ],
    });

    expect(ocrCandidates).toHaveLength(1);
    expect(ocrCandidates[0].instruction).toBe('去皮的土豆切丁');
    expect(merged.candidates).toHaveLength(1);
    expect(merged.candidates[0].instruction).toBe('去皮的土豆切丁');
    expect(merged.droppedConflictingAi).toHaveLength(1);
    expect(merged.droppedConflictingAi[0].instruction).toBe('去皮的番茄切丁');
  });

  it('filters non-action marketing subtitles from OCR direct candidates', () => {
    const ocrSpans = mergeOcrEntriesToSpans([
      { timeSec: 42.29, texts: ['吃饭啦'] },
      { timeSec: 44.3, texts: ['茄汁浓郁裹满了米饭'] },
      { timeSec: 46.31, texts: ['一个人也要好好吃饭哦'] },
      { timeSec: 48.33, texts: ['电饭煲100道懒人菜谱'] },
    ]);

    const ocrCandidates = buildOcrSubtitleCandidates(ocrSpans);
    expect(ocrCandidates).toHaveLength(0);
  });

  it('keeps OCR span subtitles separate when nearby texts differ', () => {
    const ocrSpans = mergeOcrEntriesToSpans([
      { timeSec: 6.5, texts: ['去皮的番茄切丁'] },
      { timeSec: 8.5, texts: ['去皮的土豆切丁'] },
    ]);

    expect(ocrSpans).toHaveLength(2);
    expect(ocrSpans[0].texts).toEqual(['去皮的番茄切丁']);
    expect(ocrSpans[1].texts).toEqual(['去皮的土豆切丁']);
  });

  it('dedupes semantically equivalent cut steps and keeps the shorter OCR instruction', () => {
    const deduped = dedupeSemanticSteps([
      createTimelineStep({
        instruction: '将去皮的番茄切成丁。',
        evidence_start_sec: 10,
        evidence_end_sec: 12,
        evidence_sources: ['visual'],
      }),
      createTimelineStep({
        instruction: '去皮的番茄切丁',
        evidence_start_sec: 14,
        evidence_end_sec: 15,
        evidence_sources: ['ocr'],
      }),
    ]);

    expect(deduped.steps).toHaveLength(1);
    expect(deduped.steps[0].instruction).toBe('去皮的番茄切丁');
    expect(deduped.steps[0].evidence_sources).toEqual(['ocr', 'visual']);
    expect(deduped.steps[0].evidence_start_sec).toBe(10);
    expect(deduped.steps[0].evidence_end_sec).toBe(15);
    expect(deduped.merges).toHaveLength(1);
  });

  it('dedupes semantically equivalent frying steps', () => {
    const deduped = dedupeSemanticSteps([
      createTimelineStep({
        instruction: '油热后放入土豆进行煎制，直至表面焦黄后盛出',
        evidence_start_sec: 18,
        evidence_end_sec: 21,
        evidence_sources: ['visual'],
      }),
      createTimelineStep({
        instruction: '油热放入土豆煎至表面焦黄盛出',
        evidence_start_sec: 22,
        evidence_end_sec: 25,
        evidence_sources: ['ocr'],
      }),
    ]);

    expect(deduped.steps).toHaveLength(1);
    expect(deduped.steps[0].instruction).toBe('油热放入土豆煎至表面焦黄盛出');
    expect(deduped.steps[0].evidence_start_sec).toBe(18);
    expect(deduped.steps[0].evidence_end_sec).toBe(25);
  });

  it('does not merge steps with different ingredient keywords', () => {
    const deduped = dedupeSemanticSteps([
      createTimelineStep({
        instruction: '放入番茄',
        evidence_start_sec: 8,
        evidence_end_sec: 9,
        evidence_sources: ['ocr'],
      }),
      createTimelineStep({
        instruction: '放入土豆',
        evidence_start_sec: 12,
        evidence_end_sec: 13,
        evidence_sources: ['ocr'],
      }),
    ]);

    expect(deduped.steps).toHaveLength(2);
    expect(deduped.merges).toHaveLength(0);
  });

  it('does not merge steps with different action words', () => {
    const deduped = dedupeSemanticSteps([
      createTimelineStep({
        instruction: '调碗料汁',
        evidence_start_sec: 8,
        evidence_end_sec: 9,
        evidence_sources: ['ocr'],
      }),
      createTimelineStep({
        instruction: '搅匀',
        evidence_start_sec: 12,
        evidence_end_sec: 13,
        evidence_sources: ['ocr'],
      }),
    ]);

    expect(deduped.steps).toHaveLength(2);
    expect(deduped.merges).toHaveLength(0);
  });

  it('keeps details and flips estimated to false when a duplicate is confirmed', () => {
    const deduped = dedupeSemanticSteps([
      createTimelineStep({
        instruction: '将去皮的番茄切成丁。',
        evidence_start_sec: 10,
        evidence_end_sec: 12,
        details: ['去蒂'],
        estimated: true,
        evidence_sources: ['inferred'],
      }),
      createTimelineStep({
        instruction: '去皮的番茄切丁',
        evidence_start_sec: 14,
        evidence_end_sec: 15,
        estimated: false,
        evidence_sources: ['ocr'],
      }),
    ]);

    expect(deduped.steps).toHaveLength(1);
    expect(deduped.steps[0].details).toEqual(['去蒂']);
    expect(deduped.steps[0].estimated).toBe(false);
  });

  it('dedupes assisted insertions against strict OCR steps', () => {
    const strictSteps = [
      createTimelineStep({
        order: 1,
        instruction: '去皮的番茄切丁',
        evidence_start_sec: 10,
        evidence_end_sec: 11,
        estimated: false,
        evidence_sources: ['ocr'],
      }),
    ];

    const assistedSteps = applyAssistedInsertions(strictSteps, [
      {
        insert_after_order: 1,
        instruction: '将去皮的番茄切成丁。',
        duration_min: 2,
        timer_required: false,
      },
    ]);
    const deduped = dedupeSemanticSteps(assistedSteps);

    expect(assistedSteps).toHaveLength(2);
    expect(deduped.steps).toHaveLength(1);
    expect(deduped.steps[0].instruction).toBe('去皮的番茄切丁');
    expect(deduped.steps[0].evidence_sources).toEqual(['ocr', 'inferred']);
    expect(deduped.steps[0].estimated).toBe(false);
  });
});

function createTimelineStep(
  overrides: Partial<import('./video-recipe.types').TimelineRecipeStep>,
): import('./video-recipe.types').TimelineRecipeStep {
  return {
    order: overrides.order ?? 1,
    instruction: overrides.instruction ?? '默认步骤',
    duration_min: overrides.duration_min ?? 1,
    timer_required: overrides.timer_required ?? false,
    details: overrides.details ? [...overrides.details] : undefined,
    estimated: overrides.estimated ?? false,
    evidence_sources: overrides.evidence_sources ?? ['ocr'],
    evidence_start_sec: overrides.evidence_start_sec ?? 0,
    evidence_end_sec: overrides.evidence_end_sec ?? 0,
  };
}
