import type { SimulatorTeamMember } from '../../../types/qaSimulator';

// The Split Bill squad, for landing/home art that can't fetch the project
// config at render time. Must mirror `team` in
// public/qa-simulator/config/splitbill.json; splitbillTeam.test.ts fails the
// build's test run if the two drift (renamed avatar, new colour, etc.).
export const SPLITBILL_TEAM = {
  pm: {
    id: 'pm',
    name: 'Rani Prameswari',
    avatar: '/qa-simulator/team/rani-prameswari.webp',
    role: 'Product Manager',
    initials: 'RP',
    color: 'bg-rose-400',
  },
  lead: {
    id: 'lead',
    name: 'Dimas Arya',
    avatar: '/qa-simulator/team/dimas-arya.webp',
    role: 'Engineering Lead',
    initials: 'DA',
    color: 'bg-amber-400',
  },
  qaLead: {
    id: 'qa-lead',
    name: 'Sari Wulandari',
    avatar: '/qa-simulator/team/sari-wulandari.webp',
    role: 'QA Lead (mentor kamu)',
    initials: 'SW',
    color: 'bg-emerald-500',
  },
} satisfies Record<string, SimulatorTeamMember>;

/** First name only, for compact landing copy ("Rani", "Dimas"). */
export const firstName = (member: SimulatorTeamMember) => member.name.split(' ')[0];
