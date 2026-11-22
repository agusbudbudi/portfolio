import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { SPLITBILL_TEAM } from './splitbillTeam';

describe('SPLITBILL_TEAM', () => {
  it('mirrors the team in public/qa-simulator/config/splitbill.json', () => {
    const config = JSON.parse(readFileSync(resolve(__dirname, '../../../../public/qa-simulator/config/splitbill.json'), 'utf8'));
    expect(Object.values(SPLITBILL_TEAM)).toEqual(config.team);
  });
});
