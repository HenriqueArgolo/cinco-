export interface AppSettings {
  apiKey: string;
  discordWebhook: string;
  genericWebhook: string;
  refreshInterval: number; // in seconds
  goalDiffThreshold: number; // minimum goal difference to trigger notification
}

export interface Score {
  home: number | null;
  away: number | null;
}

export interface Team {
  id: number;
  name: string;
  logo: string;
  winner: boolean | null;
}

export interface Fixture {
  id: number;
  referee: string | null;
  timezone: string;
  date: string;
  timestamp: number;
  periods: {
    first: number | null;
    second: number | null;
  };
  venue: {
    id: number | null;
    name: string | null;
    city: string | null;
  };
  status: {
    long: string;
    short: string;
    elapsed: number | null;
  };
}

export interface League {
  id: number;
  name: string;
  country: string;
  logo: string;
  flag: string | null;
  season: number;
  round: string;
}

export interface MatchResponse {
  fixture: Fixture;
  league: League;
  teams: {
    home: Team;
    away: Team;
  };
  goals: Score;
  score: {
    halftime: Score;
    fulltime: Score;
    extratime: Score;
    penalty: Score;
  };
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export const DEFAULT_SETTINGS: AppSettings = {
  apiKey: '',
  discordWebhook: '',
  genericWebhook: '',
  refreshInterval: 60,
  goalDiffThreshold: 5,
};