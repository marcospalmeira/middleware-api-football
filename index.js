const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
app.use(cors());

const API_KEY = process.env.API_KEY || '76c5b4c1fb0c65a606c5901423ec7a42';

// 🔁 LIVE RESULTS de liga selecionada
app.get('/liga/:id/live', async (req, res) => {
  try {
    const leagueId = parseInt(req.params.id);

    const apiResponse = await axios.get('https://v3.football.api-sports.io/fixtures?live=all', {
      headers: { 'x-apisports-key': API_KEY }
    });

    const jogos = apiResponse.data.response.filter(jogo =>
      jogo.league.id === leagueId
    );

    const resultado = jogos.map(j => ({
      home: j.teams.home.name,
      away: j.teams.away.name,
      score: `${j.goals.home}-${j.goals.away}`,
      time: j.fixture.status.elapsed || 0,
      status: j.fixture.status.short
    }));

    res.json(resultado);
  } catch (error) {
    console.error('Erro ao obter jogos ao vivo:', error.response?.data || error.message);
    res.status(500).json({ error: 'Erro ao obter jogos ao vivo' });
  }
});

// 📊 CLASSIFICAÇÃO da liga selecionada
app.get('/liga/:id/standings', async (req, res) => {
  try {
    const leagueId = parseInt(req.params.id);
    const season = 2023; // usa 2023 se 2024 ainda não tiver começado

    const apiResponse = await axios.get(`https://v3.football.api-sports.io/standings?league=${leagueId}&season=${season}`, {
      headers: { 'x-apisports-key': API_KEY }
    });

    const standings = apiResponse.data.response[0].league.standings[0];

    const tabela = standings.map(team => ({
      rank: team.rank,
      team: team.team.name,
      points: team.points
    }));

    res.json(tabela);
  } catch (error) {
    console.error('Erro ao obter classificação:', error.response?.data || error.message);
    res.status(500).json({ error: 'Erro ao obter classificação' });
  }
});

// Rota raiz (opcional)
app.get('/', (req, res) => {
  res.send('🟢 API Garmin Futebol – Resultados & Classificação por Liga');
});

app.listen(port, () => {
  console.log(`✅ Servidor a correr em http://localhost:${port}`);
});
