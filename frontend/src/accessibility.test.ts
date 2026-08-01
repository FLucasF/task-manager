import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const styles = readFileSync(resolve(process.cwd(), 'src/index.css'), 'utf8');
const tailwindConfig = readFileSync(resolve(process.cwd(), 'tailwind.config.js'), 'utf8');

function readColorToken(name: string) {
  const match = tailwindConfig.match(new RegExp(`${name}: '(#[0-9A-Fa-f]{6})'`));
  if (!match?.[1]) {
    throw new Error(`Missing color token: ${name}`);
  }
  return match[1];
}

function relativeLuminance(hex: string) {
  const channels = [1, 3, 5].map((index) => Number.parseInt(hex.slice(index, index + 2), 16) / 255);
  const linearChannels = channels.map((channel) =>
    channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  return (
    0.2126 * linearChannels[0] +
    0.7152 * linearChannels[1] +
    0.0722 * linearChannels[2]
  );
}

function contrastRatio(firstColor: string, secondColor: string) {
  const firstLuminance = relativeLuminance(firstColor);
  const secondLuminance = relativeLuminance(secondColor);
  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

describe('accessibility styles', () => {
  it('reduces animation and transition duration when requested by the user', () => {
    expect(styles).toContain('@media (prefers-reduced-motion: reduce)');
    expect(styles).toContain('animation-duration: 0.01ms !important');
    expect(styles).toContain('animation-iteration-count: 1 !important');
    expect(styles).toContain('transition-duration: 0.01ms !important');
  });

  it('keeps the input boundary above the WCAG non-text contrast threshold', () => {
    expect(
      contrastRatio(readColorToken('controlBorder'), readColorToken('surfaceElevated')),
    ).toBeGreaterThanOrEqual(3);
  });
});
