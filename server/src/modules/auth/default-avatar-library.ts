import { InternalServerErrorException } from '@nestjs/common';

export const DEFAULT_AVATAR_BASE_PATH = '/uploads/default-avatars';

export const DEFAULT_AVATAR_FILE_NAMES = [
  'chef-avatar-01.svg',
  'chef-avatar-02.svg',
  'chef-avatar-03.svg',
  'chef-avatar-04.svg',
  'chef-avatar-05.svg',
  'chef-avatar-06.svg',
  'chef-avatar-07.svg',
  'chef-avatar-08.svg',
  'chef-avatar-09.svg',
  'chef-avatar-10.svg',
  'chef-avatar-11.svg',
  'chef-avatar-12.svg',
] as const;

export function pickRandomDefaultAvatarPath(
  fileNames: readonly string[] = DEFAULT_AVATAR_FILE_NAMES,
  randomFn: () => number = Math.random,
): string {
  if (fileNames.length === 0) {
    throw new InternalServerErrorException('默认头像库未配置，请联系管理员');
  }

  const randomIndex = Math.floor(randomFn() * fileNames.length);
  const safeIndex = Math.min(
    fileNames.length - 1,
    Math.max(0, randomIndex),
  );

  return `${DEFAULT_AVATAR_BASE_PATH}/${fileNames[safeIndex]}`;
}
