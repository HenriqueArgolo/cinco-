import { MatchResponse } from '../types';

export const sendDiscordNotification = async (webhookUrl: string, match: MatchResponse) => {
  if (!webhookUrl) return;

  const homeScore = match.goals.home ?? 0;
  const awayScore = match.goals.away ?? 0;
  const diff = Math.abs(homeScore - awayScore);
  const leadingTeam = homeScore > awayScore ? match.teams.home.name : match.teams.away.name;

  const payload = {
    username: "5 OU + BOT",
    embeds: [
      {
        title: "🚨 ALERTA DE GOLEADA! 🚨",
        description: `Diferença de **${diff}** gols detectada!`,
        color: 15158332, // Red
        fields: [
          {
            name: "Placar",
            value: `${match.teams.home.name} **${homeScore} - ${awayScore}** ${match.teams.away.name}`,
            inline: false
          },
          {
            name: "Liga",
            value: `${match.league.name} (${match.league.country})`,
            inline: true
          },
          {
            name: "Tempo",
            value: `${match.fixture.status.elapsed}'`,
            inline: true
          }
        ],
        footer: {
          text: `Match ID: ${match.fixture.id}`
        },
        timestamp: new Date().toISOString()
      }
    ]
  };

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    console.error("Falha ao enviar Discord webhook", error);
    throw error;
  }
};

export const sendGenericNotification = async (webhookUrl: string, match: MatchResponse) => {
  if (!webhookUrl) return;

  const homeScore = match.goals.home ?? 0;
  const awayScore = match.goals.away ?? 0;

  const payload = {
    event: 'BLOWOUT_DETECTED',
    bot_name: "5 OU + BOT",
    match_id: match.fixture.id,
    league: match.league.name,
    home_team: match.teams.home.name,
    away_team: match.teams.away.name,
    score_home: homeScore,
    score_away: awayScore,
    elapsed: match.fixture.status.elapsed,
    message: `Goleada detectada! ${match.teams.home.name} ${homeScore} x ${awayScore} ${match.teams.away.name}`
  };

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    console.error("Falha ao enviar Generic webhook", error);
    throw error;
  }
};

export const sendTestNotification = async (webhookUrl: string, type: 'discord' | 'generic') => {
  // Create a mock match with test data that matches the real notification structure
  const mockMatch: MatchResponse = {
    fixture: {
      id: 999999,
      referee: "Test Referee",
      timezone: "UTC",
      date: new Date().toISOString(),
      timestamp: Math.floor(Date.now() / 1000),
      periods: {
        first: 45,
        second: 90
      },
      venue: {
        id: 1,
        name: "Estádio de Teste",
        city: "Cidade de Teste"
      },
      status: {
        long: "Second Half",
        short: "2H",
        elapsed: 75
      }
    },
    league: {
      id: 1,
      name: "Liga de Teste",
      country: "Brasil",
      logo: "https://example.com/logo.png",
      flag: "https://example.com/flag.png",
      season: 2024,
      round: "Round 1"
    },
    teams: {
      home: {
        id: 1,
        name: "Time Casa",
        logo: "https://example.com/home.png",
        winner: true
      },
      away: {
        id: 2,
        name: "Time Visitante",
        logo: "https://example.com/away.png",
        winner: false
      }
    },
    goals: {
      home: 6,
      away: 0
    },
    score: {
      halftime: {
        home: 3,
        away: 0
      },
      fulltime: {
        home: null,
        away: null
      },
      extratime: {
        home: null,
        away: null
      },
      penalty: {
        home: null,
        away: null
      }
    }
  };

  // Use the same notification functions as in real scenarios
  if (type === 'discord') {
    await sendDiscordNotification(webhookUrl, mockMatch);
  } else {
    await sendGenericNotification(webhookUrl, mockMatch);
  }
};