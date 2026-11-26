import { describe, expect, it } from 'vitest';
import { buildWhatsappUrl, normalizeWhatsapp } from './leadCapture';

describe('normalizeWhatsapp', () => {
  it.each([
    ['0812 3456 7890', '6281234567890'],
    ['812-3456-7890', '6281234567890'],
    ['+62 812 3456 7890', '6281234567890'],
    ['+62 0812 3456 7890', '6281234567890'],
    ['+81 90 1234 5678', '819012345678'],
  ])('%s -> %s', (raw, expected) => expect(normalizeWhatsapp(raw)).toBe(expected));
});

describe('buildWhatsappUrl', () => {
  it('includes the number the visitor typed', () => {
    const url = buildWhatsappUrl(
      { name: 'Test', email: 'test@example.com', whatsapp: '0812 3456 7890', experience: '' },
      { recommended: [], answers: [] },
    );
    expect(decodeURIComponent(url)).toContain('WhatsApp: +6281234567890');
  });
});
