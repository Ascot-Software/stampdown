/**
 * Date helpers plugin for Stampdown
 * Provides helpers for date formatting and manipulation
 */

import { createPlugin } from '../plugin';
import type { Context } from '../types';
import type { HelperOptions } from '../helpers/registry';

/**
 * Date formatting plugin
 * Adds helpers for formatDate, now, and timeAgo operations
 *
 * @example
 * ```typescript
 * import { Stampdown } from 'stampdown';
 * import { dateHelpersPlugin } from 'stampdown/plugins/date-helpers';
 *
 * const stampdown = new Stampdown({
 *   plugins: [dateHelpersPlugin]
 * });
 *
 * const date = new Date();
 * stampdown.render('{{#formatDate date "YYYY-MM-DD"}}{{/formatDate}}', { date });
 * stampdown.render('{{#now}}{{/now}}', {});
 * stampdown.render('{{#timeAgo date}}{{/timeAgo}}', { date });
 * ```
 */
export const dateHelpersPlugin = createPlugin({
  name: 'date-helpers',
  version: '1.0.0',
  description: 'Adds date formatting helpers',
  plugin: (stampdown) => {
    // Format date helper
    stampdown.registerHelper(
      'formatDate',
      (_context: Context, _options: HelperOptions, dateInput: unknown, format?: unknown) => {
        const date = new Date(String(dateInput));
        if (isNaN(date.getTime())) return 'Invalid Date';

        const formatStr = String(format || 'YYYY-MM-DD');
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return formatStr
          .replace('YYYY', String(year))
          .replace('MM', month)
          .replace('DD', day)
          .replace('HH', hours)
          .replace('mm', minutes)
          .replace('ss', seconds);
      }
    );

    // Current timestamp helper
    stampdown.registerHelper('now', (_context: Context, _options: HelperOptions) => {
      return new Date().toISOString();
    });

    // Relative time helper
    stampdown.registerHelper(
      'timeAgo',
      (_context: Context, _options: HelperOptions, dateInput: unknown) => {
        const date = new Date(String(dateInput));
        if (isNaN(date.getTime())) return 'Invalid Date';

        const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
        const intervals: Record<string, number> = {
          year: 31536000,
          month: 2592000,
          week: 604800,
          day: 86400,
          hour: 3600,
          minute: 60,
          second: 1,
        };

        for (const [name, secondsInInterval] of Object.entries(intervals)) {
          const interval = Math.floor(seconds / secondsInInterval);
          if (interval >= 1) {
            return interval === 1 ? `1 ${name} ago` : `${interval} ${name}s ago`;
          }
        }

        return 'just now';
      }
    );
  },
});
