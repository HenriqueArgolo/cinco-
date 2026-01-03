import { MatchResponse } from '../types';

const BASE_URL = 'https://v3.football.api-sports.io';

export const fetchLiveMatches = async (apiKey: string): Promise<MatchResponse[]> => {
  if (!apiKey) {
    throw new Error('API Key não configurada.');
  }

  const response = await fetch(`${BASE_URL}/fixtures?live=all`, {
    method: 'GET',
    headers: {
      'x-rapidapi-host': 'v3.football.api-sports.io',
      'x-rapidapi-key': apiKey,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || `Erro na API: ${response.status}`);
  }

  const data = await response.json();

  if (data.errors && Object.keys(data.errors).length > 0) {
     // API-Football returns 200 OK even with business logic errors sometimes
     const firstError = Object.values(data.errors)[0];
     throw new Error(String(firstError));
  }

  return data.response as MatchResponse[];
};