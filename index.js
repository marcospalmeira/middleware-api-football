import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();
const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;

// Endpoint para jogos em direto da Primeira Liga Portuguesa
app.get('/liga-portuguesa/live', async (req, res) => {
  try {
    const apiResponse = await axios.get('https://v3.football.api-sports.io/fixtures?live=all', {
      headers: {
        'x-apisports-key': API_KEY
      }
    });

    const jogos = apiResponse.data.response
      .filter(jogo => jogo.league.country === 'Portugal' && jogo.league.name.includes('Liga'))
      .map(jogo => ({
        home: jogo.teams.home.name,
        away: jogo.teams.away.name,
        score: `${jogo.goals.home}-${jogo.goals.away}`,
        time: jogo.fixture.status.elapsed,
        status: jogo.fixture.status.short
      }));

    res.json(jogos);
  } catch (error) {
    console.error("Erro:", error.message);
    res.status(500).json({ error: 'Erro ao obter dados da API-Football' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor disponível em http://localhost:${PORT}`);
});

app.get('/liga-portuguesa/standings', async (req, res) => {
  try {
    const leagueId = 94; // Liga Portugal
    const season = 2023; // 2023/2024, se ainda não começou a 2025

    const apiResponse = await axios.get(`https://v3.football.api-sports.io/standings?league=${leagueId}&season=${season}`, {
      headers: {
        'x-apisports-key': API_KEY
      }
    });

    const standings = apiResponse.data.response[0].league.standings[0];

    const tabela = standings.map(team => ({
      rank: team.rank,
      team: team.team.name,
      points: team.points
    }));

    res.json(tabela);
  } catch (error) {
    console.error("Erro na classificação:", error.response?.data || error.message);
    res.status(500).json({ error: 'Erro ao obter classificação' });
  }
});

