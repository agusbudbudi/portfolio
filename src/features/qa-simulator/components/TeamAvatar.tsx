import React from 'react';
import type { SimulatorTeamMember } from '../../../types/qaSimulator';

interface TeamAvatarProps {
  member: SimulatorTeamMember;
  size?: 'sm' | 'md';
}

const TeamAvatar: React.FC<TeamAvatarProps> = ({ member, size = 'md' }) => (
  <span
    title={`${member.name} · ${member.role}`}
    className={`inline-flex items-center justify-center rounded-full text-white font-semibold shrink-0 ring-2 ring-white ${member.color} ${
      size === 'sm' ? 'w-7 h-7 text-[10px]' : 'w-9 h-9 text-xs'
    }`}
  >
    {member.initials}
  </span>
);

export default TeamAvatar;
