import type { OcrTextEntry, VideoRecipeMetadata } from './video-recipe.types';

export type VideoTitleSource =
  | 'ai'
  | 'file_name'
  | 'ocr'
  | 'ingredient'
  | 'generic';

const GENERIC_VIDEO_TITLE = '视频解析食谱';
const TEMP_FILE_PATTERNS = [
  /^wx_camera_/i,
  /^wxfile/i,
  /^tmp/i,
  /^temp/i,
  /^video/i,
  /^clip/i,
  /^screenrecord/i,
  /^vid[_-]?\d+/i,
];

function normalizeSpace(value: string) {
  return value.replace(/[　\s]+/g, ' ').trim();
}

function stripExtension(value: string) {
  return value.replace(/\.[a-z0-9]{2,6}$/i, '');
}

function stripTrailingNoise(value: string) {
  return value
    .replace(/[_-]?\d{6,}$/g, '')
    .replace(/[_-]?(19|20)\d{6,}$/g, '')
    .replace(/[._-]+$/g, '')
    .trim();
}

function hasReplacementChar(value: string) {
  return /�/.test(value);
}

function asciiHeavy(value: string) {
  const cleaned = value.replace(/\s+/g, '');
  if (!cleaned) return false;
  const asciiChars = cleaned.match(/[A-Za-z0-9]/g)?.length || 0;
  return asciiChars / cleaned.length >= 0.75;
}

function digitHeavy(value: string) {
  const cleaned = value.replace(/\s+/g, '');
  if (!cleaned) return false;
  const digitChars = cleaned.match(/\d/g)?.length || 0;
  return digitChars / cleaned.length >= 0.5;
}

function containsChinese(value: string) {
  return /[\u4e00-\u9fff]/.test(value);
}

function looksLikeTempFileName(value: string) {
  return TEMP_FILE_PATTERNS.some((pattern) => pattern.test(value));
}

function tryRepairLatin1Utf8(value: string) {
  try {
    const repaired = Buffer.from(value, 'latin1').toString('utf8');
    return repaired && repaired !== value ? repaired : value;
  } catch {
    return value;
  }
}

function sanitizeBaseTitle(value: string) {
  return normalizeSpace(
    stripTrailingNoise(
      stripExtension(value)
        .replace(/[^\p{L}\p{N}\u4e00-\u9fff\s._-]/gu, ' ')
        .replace(/[._-]+/g, ' '),
    ),
  );
}

export function resolveFileNameTitle(originalName: string) {
  const repairedName = sanitizeBaseTitle(
    tryRepairLatin1Utf8(originalName || ''),
  );

  const invalid =
    !repairedName
    || repairedName.length < 2
    || hasReplacementChar(repairedName)
    || looksLikeTempFileName(repairedName)
    || (asciiHeavy(repairedName) && !containsChinese(repairedName))
    || digitHeavy(repairedName);

  return {
    originalName,
    repairedName,
    title: invalid ? '' : repairedName,
    invalid,
  };
}

function normalizeCandidateTitle(value: string) {
  return normalizeSpace(
    value
      .replace(/[^\p{L}\p{N}\u4e00-\u9fff\s]/gu, ' ')
      .replace(/\s+/g, ' '),
  );
}

export function isSuspiciousRecipeTitle(value: string) {
  const title = normalizeCandidateTitle(value || '');
  if (!title || title.length < 2) {
    return true;
  }

  if (hasReplacementChar(title)) {
    return true;
  }

  if (looksLikeTempFileName(title)) {
    return true;
  }

  if (digitHeavy(title) && !containsChinese(title)) {
    return true;
  }

  if (asciiHeavy(title) && !containsChinese(title)) {
    return true;
  }

  return false;
}

export function resolveOcrTitle(ocrEntries: OcrTextEntry[]) {
  const texts = ocrEntries.flatMap((entry) => entry.texts);
  const candidate = texts.find((text) => {
    const normalized = normalizeCandidateTitle(text);
    return (
      normalized.length >= 2
      && normalized.length <= 24
      && containsChinese(normalized)
      && !/勺|半勺|碗|分钟|下锅|翻炒|加入|调碗料汁/.test(normalized)
    );
  });

  return candidate ? normalizeCandidateTitle(candidate) : '';
}

export function resolveIngredientTitle(
  metadata: Pick<VideoRecipeMetadata, 'ingredients'> | null | undefined,
) {
  const ingredients = metadata?.ingredients || [];
  const names = ingredients
    .map((item) => normalizeCandidateTitle(item.name))
    .filter((item) => item && containsChinese(item))
    .slice(0, 3);

  if (!names.length) {
    return '';
  }

  return `${names.join('')}菜谱`;
}

export function decideVideoRecipeTitle(options: {
  metadataTitle?: string | null;
  fileNameTitle?: string | null;
  ocrEntries?: OcrTextEntry[];
  metadata?: Pick<VideoRecipeMetadata, 'ingredients'> | null;
}) {
  const aiTitle = normalizeCandidateTitle(options.metadataTitle || '');
  if (aiTitle && !isSuspiciousRecipeTitle(aiTitle)) {
    return {
      title: aiTitle,
      source: 'ai' as VideoTitleSource,
    };
  }

  const fileNameTitle = normalizeCandidateTitle(options.fileNameTitle || '');
  if (fileNameTitle && !isSuspiciousRecipeTitle(fileNameTitle)) {
    return {
      title: fileNameTitle,
      source: 'file_name' as VideoTitleSource,
    };
  }

  const ocrTitle = resolveOcrTitle(options.ocrEntries || []);
  if (ocrTitle && !isSuspiciousRecipeTitle(ocrTitle)) {
    return {
      title: ocrTitle,
      source: 'ocr' as VideoTitleSource,
    };
  }

  const ingredientTitle = resolveIngredientTitle(options.metadata);
  if (ingredientTitle && !isSuspiciousRecipeTitle(ingredientTitle)) {
    return {
      title: ingredientTitle,
      source: 'ingredient' as VideoTitleSource,
    };
  }

  return {
    title: GENERIC_VIDEO_TITLE,
    source: 'generic' as VideoTitleSource,
  };
}

export function getGenericVideoTitle() {
  return GENERIC_VIDEO_TITLE;
}
