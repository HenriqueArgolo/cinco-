import React from 'react';
import { MatchResponse } from '../types';
import { Clock } from 'lucide-react';

interface MatchCardProps {
  match: MatchResponse;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match }) => {
  const homeScore = match.goals.home ?? 0;
  const awayScore = match.goals.away ?? 0;
  const goalDiff = Math.abs(homeScore - awayScore);
  const isBlowout = goalDiff >= 5;

  return (
    <div className={`
      relative rounded-lg p-4 border transition-all duration-300
      ${isBlowout 
        ? 'bg-red-900/20 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse-fast' 
        : 'bg-surface border-slate-700 hover:border-slate-500'}
    `}>
      {isBlowout && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10">
          GOLEADA 🔥
        </div>
      )}

      {/* Header: League & Time */}
      <div className="flex justify-between items-center mb-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          {match.league.flag && (
            <img src={match.league.flag} alt={match.league.country} className="w-4 h-4 object-contain" />
          )}
          <span className="truncate max-w-[120px]">{match.league.name}</span>
        </div>
        <div className="flex items-center gap-1 text-green-400 font-mono">
          <Clock size={12} />
          <span>{match.fixture.status.elapsed}'</span>
        </div>
      </div>

      {/* Teams & Score */}
      <div className="flex items-center justify-between gap-2">
        {/* Home */}
        <div className="flex flex-col items-center flex-1 text-center">
          <div className="w-12 h-12 bg-white/5 rounded-full p-2 mb-2 flex items-center justify-center">
            <img src={match.teams.home.logo} alt={match.teams.home.name} className="w-full h-full object-contain" />
          </div>
          <span className="text-sm font-semibold leading-tight">{match.teams.home.name}</span>
        </div>

        {/* Score Board */}
        <div className="flex flex-col items-center justify-center px-2">
          <div className="text-3xl font-bold font-mono tracking-wider flex items-center gap-2">
            <span>{homeScore}</span>
            <span className="text-slate-500 text-xl">-</span>
            <span>{awayScore}</span>
          </div>
          <span className="text-xs text-slate-500 mt-1">{match.fixture.status.short}</span>
        </div>

        {/* Away */}
        <div className="flex flex-col items-center flex-1 text-center">
          <div className="w-12 h-12 bg-white/5 rounded-full p-2 mb-2 flex items-center justify-center">
            <img src={match.teams.away.logo} alt={match.teams.away.name} className="w-full h-full object-contain" />
          </div>
          <span className="text-sm font-semibold leading-tight">{match.teams.away.name}</span>
        </div>
      </div>
    </div>
  );
};