import { InternalServerErrorException } from '@nestjs/common';
import {
  DEFAULT_AVATAR_BASE_PATH,
  DEFAULT_AVATAR_FILE_NAMES,
  pickRandomDefaultAvatarPath,
} from './default-avatar-library';

describe('default-avatar-library', () => {
  it('returns a path from the configured avatar library', () => {
    const result = pickRandomDefaultAvatarPath(
      DEFAULT_AVATAR_FILE_NAMES,
      () => 0.5,
    );

    expect(
      DEFAULT_AVATAR_FILE_NAMES.some(
        (fileName) => result === `${DEFAULT_AVATAR_BASE_PATH}/${fileName}`,
      ),
    ).toBe(true);
  });

  it('throws a clear error when the avatar library is empty', () => {
    expect(() => pickRandomDefaultAvatarPath([], () => 0)).toThrow(
      InternalServerErrorException,
    );
    expect(() => pickRandomDefaultAvatarPath([], () => 0)).toThrow(
      '默认头像库未配置，请联系管理员',
    );
  });
});
