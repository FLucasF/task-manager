import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const styles = readFileSync(resolve(process.cwd(), 'src/index.css'), 'utf8');

describe('accessibility styles', () => {
  it('reduces animation and transition duration when requested by the user', () => {
    expect(styles).toContain('@media (prefers-reduced-motion: reduce)');
    expect(styles).toContain('animation-duration: 0.01ms !important');
    expect(styles).toContain('animation-iteration-count: 1 !important');
    expect(styles).toContain('transition-duration: 0.01ms !important');
  });
});
