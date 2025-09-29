import { describe, expect, it } from 'vitest';
import { getDictionary } from '@/lib/get-dictionary';

describe('getDictionary', () => {
  it('returns english dictionary by default', async () => {
    const dictionary = await getDictionary('en');
    expect(dictionary).toHaveProperty('hero');
  });

  it('falls back to english for unknown locale', async () => {
    const dictionary = await getDictionary('fr');
    expect(dictionary).toHaveProperty('hero');
  });
});
