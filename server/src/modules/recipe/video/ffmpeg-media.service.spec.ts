import { FfmpegMediaService } from './ffmpeg-media.service';

describe('FfmpegMediaService OCR timestamp planning', () => {
  it('densifies OCR frames in the first 20 seconds and sparsifies later', () => {
    const service = new FfmpegMediaService();

    const timestamps = service.buildDenseOcrTimestamps(50, 40);

    expect(timestamps[0]).toBe(0.5);
    expect(timestamps).toContain(1.5);
    expect(timestamps).toContain(8.5);
    expect(timestamps).toContain(19.5);
    expect(timestamps).toContain(21);
    expect(timestamps).toContain(23);
    expect(timestamps.length).toBeLessThanOrEqual(40);
    expect(timestamps).toEqual(timestamps.slice().sort((a, b) => a - b));
  });
});
