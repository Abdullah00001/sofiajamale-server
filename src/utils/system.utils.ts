// utils/system.utils.ts

import crypto from 'crypto';
import { unlink } from 'fs/promises';

import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { injectable } from 'tsyringe';

dayjs.extend(utc);
dayjs.extend(timezone);

@injectable()
export class SystemUtils {
  /* ------------------------------------------------------------------
   * TIME & CALCULATION
   * ------------------------------------------------------------------ */

  calculateMilliseconds(value: number, unit: string): number {
    switch (unit.toLowerCase()) {
      case 'millisecond':
      case 'milliseconds':
        return value;
      case 'second':
      case 'seconds':
        return value * 1000;
      case 'minute':
      case 'minutes':
        return value * 60 * 1000;
      case 'hour':
      case 'hours':
        return value * 60 * 60 * 1000;
      case 'day':
      case 'days':
        return value * 24 * 60 * 60 * 1000;
      default:
        return NaN;
    }
  }

  stringToNumber(value: string): number {
    return Number(value.slice(0, -1));
  }

  expiresInTimeUnitToMs(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)(ms|s|m|h|d)$/);
    if (!match) throw new Error('Invalid expiresIn format');

    const value = Number(match[1]);
    const unit = match[2];

    const map: Record<string, number> = {
      ms: 1,
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return value * map[unit];
  }

  /* ------------------------------------------------------------------
   * ETAG
   * ------------------------------------------------------------------ */

  generateEtag(data: unknown): string {
    try {
      const dataString = JSON.stringify(data);
      return crypto.createHash('md5').update(dataString).digest('hex');
    } catch (error) {
      throw new Error(
        `Failed to generate ETag: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /* ------------------------------------------------------------------
   * DATE
   * ------------------------------------------------------------------ */

  formatDate(isoDateString: string): string {
    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) throw new Error('Invalid date string');

    return dayjs(date).format('D MMMM YYYY');
  }

  formatDateTime(isoString: string, timeZone = 'Asia/Dhaka'): string {
    return dayjs(isoString)
      .tz(timeZone)
      .format('MMMM D, YYYY [at] hh:mm A (z)');
  }

  calculateFutureDate(duration: string): string {
    const ms = this.expiresInTimeUnitToMs(duration);
    return new Date(Date.now() + ms).toISOString();
  }

  compareDate(oldDate: Date, duration: string): boolean {
    const ms = this.expiresInTimeUnitToMs(duration);
    return Date.now() - new Date(oldDate).getTime() >= ms;
  }

  async unlinkFile({ filePath }: { filePath: string }): Promise<void> {
    try {
      await unlink(filePath);
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error('Unknown Error Occurred In File Unlink Utility');
    }
  }

  extractS3KeyFromUrl(url: string): string {
    // Extract key from URL: https://bucket.s3.region.amazonaws.com/avatars/userId/timestamp.png
    const urlParts = url.split('.amazonaws.com/');
    return urlParts[1];
  }
}
