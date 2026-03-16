import React, { useState, useEffect } from 'react';
import {
  getTeams,
  getTeam,
  createTeam,
  deleteTeam,
  uploadLogo,
  getMatches,
  createMatch,
  updateMatch,
  deleteMatch,
  addGoalscorer,
  addPlayer,
  deletePlayer,
} from '../services/api';

const API_BASE = 'http://localhost:5000';

function Admin() {
  const [activeTab, setActiveTab] = useState('teams');
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [message, setMessage] = useState('');

  // Team form
  const [teamName, setTeamName] = useState('');

  // Match form
  const [matchDate, setMatchDate] = useState('');
  const [matchTime, setMatchTime] = useState('');
  const [homeTeamId, setHomeTeamId] = useState('');
  const [awayTeamId, setAwayTeamId] = useState('');
  const [matchStatus, setMatchStatus] = useState('upcoming');
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);

  // Player management
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [selectedTeamPlayers, setSelectedTeamPlayers] = useState([]);
  const [playerName, setPlayerName] = useState('');
  const [isGoalkeeper, setIsGoalkeeper] = useState(false);
  const [isCaptain, setIsCaptain] = useState(false);

  // Match completion UI
  const [completingMatch, setCompletingMatch] = useState(null);
  const [completeHomeScore, setCompleteHomeScore] = useState('');
  const [completeAwayScore, setCompleteAwayScore] = useState('');
  const [completionHomePlayers, setCompletionHomePlayers] = useState([]);
  const [completionAwayPlayers, setCompletionAwayPlayers] = useState([]);
  const [goalPlayerIdHome, setGoalPlayerIdHome] = useState('');
  const [goalMinuteHome, setGoalMinuteHome] = useState('');
  const [goalPlayerIdAway, setGoalPlayerIdAway] = useState('');
  const [goalMinuteAway, setGoalMinuteAway] = useState('');
  const [currentMatchGoals, setCurrentMatchGoals] = useState([]);

  useEffect(() => {
    loadTeams();
    loadMatches();
  }, []);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(''), 3000);
  };

  const loadTeams = async () => {
    try {
      const response = await getTeams();
      setTeams(response.data);
    } catch (error) {
      console.error('Failed to load teams:', error);
    }
  };

  const loadMatches = async () => {
    try {
      const response = await getMatches();
      setMatches(response.data);
    } catch (error) {
      console.error('Failed to load matches:', error);
    }
  };

  const loadTeamPlayers = async (teamId) => {
    if (!teamId) {
      setSelectedTeamPlayers([]);
      return;
    }
    try {
      const response = await getTeam(teamId);
      setSelectedTeamPlayers(response.data.players || []);
    } catch (error) {
      console.error('Failed to load team players:', error);
      setSelectedTeamPlayers([]);
    }
  };

  // ================== TEAM FUNCTIONS ==================

  const handleAddTeam = async (e) => {
    e.preventDefault();
    try {
      await createTeam(teamName);
      setTeamName('');
      await loadTeams();
      showMessage('Team added successfully!');
    } catch (error) {
      showMessage(error.response?.data?.error || 'Failed to add team', 'error');
    }
  };

  const handleDeleteTeam = async (teamId, name) => {
    if (!window.confirm(`Delete ${name}? This will also delete all associated matches.`)) return;

    try {
      await deleteTeam(teamId);
      await loadTeams();
      await loadMatches();
      showMessage('Team deleted successfully!');
    } catch (error) {
      showMessage('Failed to delete team', 'error');
    }
  };

  const handleUploadLogo = async (teamId, file) => {
    const formData = new FormData();
    formData.append('logo', file);

    try {
      await uploadLogo(teamId, formData);
      await loadTeams();
      showMessage('Logo uploaded successfully!');
    } catch (error) {
      showMessage('Failed to upload logo', 'error');
    }
  };

  // ================== MATCH FUNCTIONS ==================

  const handleAddMatch = async (e) => {
    e.preventDefault();

    if (homeTeamId === awayTeamId) {
      showMessage('Home and Away teams must be different!', 'error');
      return;
    }

    const data = {
      date: matchDate,
      time: matchTime,
      home_team_id: parseInt(homeTeamId, 10),
      away_team_id: parseInt(awayTeamId, 10),
      status: matchStatus,
    };

    if (matchStatus === 'completed') {
      data.home_score = parseInt(homeScore, 10);
      data.away_score = parseInt(awayScore, 10);
    }

    try {
      const response = await createMatch(data);
      const match = response.data;

      setMatchDate('');
      setMatchTime('');
      setHomeTeamId('');
      setAwayTeamId('');
      setMatchStatus('upcoming');
      setHomeScore(0);
      setAwayScore(0);

      await loadTeams();
      await loadMatches();

      if (data.status === 'completed') {
        showMessage('Match created as completed. Add goals below.', 'success');
        await handleCompleteMatch(match);
      } else {
        showMessage('Match added successfully!');
      }
    } catch (error) {
      showMessage(error.response?.data?.error || 'Failed to add match', 'error');
    }
  };

  const handleCompleteMatch = async (match) => {
    const matchDate = new Date(match.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (matchDate > today) {
      showMessage('Cannot complete a match scheduled in the future', 'error');
      return;
    }

    try {
      const homeRes = await getTeam(match.home_team.id);
      const awayRes = await getTeam(match.away_team.id);
      const homePlayers = homeRes.data.players || [];
      const awayPlayers = awayRes.data.players || [];

      setCompletionHomePlayers(
        homePlayers.map((p) => ({ ...p, teamName: match.home_team.name }))
      );
      setCompletionAwayPlayers(
        awayPlayers.map((p) => ({ ...p, teamName: match.away_team.name }))
      );
    } catch (err) {
      console.error('Failed to load players for this match', err);
      showMessage('Failed to load players for this match', 'error');
      return;
    }

    setCompletingMatch(match);
    setCompleteHomeScore(match.home_score ?? '');
    setCompleteAwayScore(match.away_score ?? '');
    setGoalPlayerIdHome('');
    setGoalMinuteHome('');
    setGoalPlayerIdAway('');
    setGoalMinuteAway('');
    setCurrentMatchGoals([]);
  };

  const handleAddHomeGoal = () => {
    if (!goalPlayerIdHome || !goalMinuteHome) {
      showMessage('Select home player and minute', 'error');
      return;
    }
    const player = completionHomePlayers.find(
      (p) => String(p.id) === String(goalPlayerIdHome)
    );
    if (!player) {
      showMessage('Invalid home player selected', 'error');
      return;
    }
    const minuteNum = parseInt(goalMinuteHome, 10);
    if (Number.isNaN(minuteNum) || minuteNum < 1 || minuteNum > 120) {
      showMessage('Minute must be between 1 and 120', 'error');
      return;
    }

    const newGoal = {
      tempId: Date.now() + Math.random(),
      player,
      minute: minuteNum,
    };
    setCurrentMatchGoals([...currentMatchGoals, newGoal]);
    setGoalPlayerIdHome('');
    setGoalMinuteHome('');
  };

  const handleAddAwayGoal = () => {
    if (!goalPlayerIdAway || !goalMinuteAway) {
      showMessage('Select away player and minute', 'error');
      return;
    }
    const player = completionAwayPlayers.find(
      (p) => String(p.id) === String(goalPlayerIdAway)
    );
    if (!player) {
      showMessage('Invalid away player selected', 'error');
      return;
    }
    const minuteNum = parseInt(goalMinuteAway, 10);
    if (Number.isNaN(minuteNum) || minuteNum < 1 || minuteNum > 120) {
      showMessage('Minute must be between 1 and 120', 'error');
      return;
    }

    const newGoal = {
      tempId: Date.now() + Math.random(),
      player,
      minute: minuteNum,
    };
    setCurrentMatchGoals([...currentMatchGoals, newGoal]);
    setGoalPlayerIdAway('');
    setGoalMinuteAway('');
  };

  const handleSaveCompletedMatch = async () => {
    if (!completingMatch) return;

    const home = parseInt(completeHomeScore, 10);
    const away = parseInt(completeAwayScore, 10);
    if (Number.isNaN(home) || Number.isNaN(away)) {
      showMessage('Enter valid scores', 'error');
      return;
    }

    try {
      await updateMatch(completingMatch.id, {
        status: 'completed',
        home_score: home,
        away_score: away,
      });

      for (const g of currentMatchGoals) {
        await addGoalscorer(completingMatch.id, {
          player_id: g.player.id,
          minute: g.minute,
        });
      }

      setCompletingMatch(null);
      setCurrentMatchGoals([]);
      await loadTeams();
      await loadMatches();
      showMessage('Match completed with goals!', 'success');
    } catch (err) {
      console.error(err);
      showMessage('Failed to complete match', 'error');
    }
  };

  const handleCancelCompletion = () => {
    setCompletingMatch(null);
    setCurrentMatchGoals([]);
  };

  const handleDeleteMatch = async (matchId) => {
    if (!window.confirm('Delete this match? Team statistics will be recalculated.')) return;

    try {
      await deleteMatch(matchId);
      await loadTeams();
      await loadMatches();
      showMessage('Match deleted successfully!');
    } catch (error) {
      showMessage('Failed to delete match', 'error');
    }
  };

  // ================== PLAYER FUNCTIONS ==================

  const handleSelectTeamForPlayers = async (e) => {
    const id = e.target.value;
    setSelectedTeamId(id);
    setPlayerName('');
    setIsGoalkeeper(false);
    setIsCaptain(false);
    if (id) {
      await loadTeamPlayers(id);
    } else {
      setSelectedTeamPlayers([]);
    }
  };

  const handleAddPlayer = async (e) => {
    e.preventDefault();
    if (!selectedTeamId) {
      showMessage('Select a team first', 'error');
      return;
    }
    try {
      await addPlayer(parseInt(selectedTeamId, 10), {
        name: playerName,
        is_goalkeeper: isGoalkeeper,
        is_captain: isCaptain,
      });
      setPlayerName('');
      setIsGoalkeeper(false);
      setIsCaptain(false);
      await loadTeamPlayers(selectedTeamId);
      showMessage('Player added successfully!');
    } catch (error) {
      showMessage(error.response?.data?.error || 'Failed to add player', 'error');
    }
  };

  const handleDeletePlayer = async (playerId) => {
    if (!selectedTeamId) return;
    if (!window.confirm('Delete this player?')) return;

    try {
      await deletePlayer(parseInt(selectedTeamId, 10), playerId);
      await loadTeamPlayers(selectedTeamId);
      showMessage('Player deleted successfully!');
    } catch (error) {
      showMessage('Failed to delete player', 'error');
    }
  };

  // ================== RENDER ==================

  return (
    <section>
      <div className="admin-panel">
        <h2 style={{ marginBottom: '2rem' }}>Admin Panel</h2>

        {message && (
          <div className={message.type === 'error' ? 'error-message' : 'success-message'}>
            {message.text}
          </div>
        )}

        <div className="admin-tabs">
          <button
            className={activeTab === 'teams' ? 'active' : ''}
            onClick={() => setActiveTab('teams')}
          >
            Teams
          </button>
          <button
            className={activeTab === 'matches' ? 'active' : ''}
            onClick={() => setActiveTab('matches')}
          >
            Matches
          </button>
          <button
            className={activeTab === 'players' ? 'active' : ''}
            onClick={() => setActiveTab('players')}
          >
            Players
          </button>
        </div>

        {/* Teams Tab */}
        {activeTab === 'teams' && (
          <div>
            <h3>Add Team</h3>
            <form onSubmit={handleAddTeam} style={{ marginBottom: '2rem' }}>
              <div className="form-group">
                <label>Team Name</label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Add Team
              </button>
            </form>

            <h3>Existing Teams</h3>
            {teams.map((team) => {
              const initials = team.logo ? '' : team.name.substring(0, 2).toUpperCase();
              return (
                <div key={team.id} className="team-list-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div
                      className="team-logo"
                      style={{ width: '40px', height: '40px', fontSize: '1rem' }}
                    >
                      {team.logo ? (
                        <img src={`${API_BASE}/uploads/${team.logo}`} alt={team.name} />
                      ) : (
                        initials
                      )}
                    </div>
                    <strong>{team.name}</strong>
                  </div>
                  <div>
                    <input
                      type="file"
                      id={`logo-${team.id}`}
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          handleUploadLogo(team.id, e.target.files[0]);
                        }
                      }}
                    />
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => document.getElementById(`logo-${team.id}`).click()}
                    >
                      {team.logo ? 'Change' : 'Upload'} Logo
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteTeam(team.id, team.name)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Matches Tab */}
        {activeTab === 'matches' && (
          <div>
            <h3>Add Match</h3>
            <form onSubmit={handleAddMatch} style={{ marginBottom: '2rem' }}>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={matchDate}
                  onChange={(e) => setMatchDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Time</label>
                <input
                  type="time"
                  value={matchTime}
                  onChange={(e) => setMatchTime(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Home Team</label>
                <select
                  value={homeTeamId}
                  onChange={(e) => setHomeTeamId(e.target.value)}
                  required
                >
                  <option value="">Select Home Team</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Away Team</label>
                <select
                  value={awayTeamId}
                  onChange={(e) => setAwayTeamId(e.target.value)}
                  required
                >
                  <option value="">Select Away Team</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={matchStatus}
                  onChange={(e) => setMatchStatus(e.target.value)}
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {matchStatus === 'completed' && (
                <>
                  <div className="form-group">
                    <label>Home Score</label>
                    <input
                      type="number"
                      min="0"
                      value={homeScore}
                      onChange={(e) => setHomeScore(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Away Score</label>
                    <input
                      type="number"
                      min="0"
                      value={awayScore}
                      onChange={(e) => setAwayScore(e.target.value)}
                    />
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--gray)' }}>
                    After saving, use the Complete button to assign goals and minutes.
                  </p>
                </>
              )}

              <button type="submit" className="btn btn-success">
                Add Match
              </button>
            </form>

            <h3>Existing Matches</h3>
            {matches.map((match) => (
              <div key={match.id} className="match-list-item">
                <div>
                  <div>
                    <strong>
                      {match.home_team.name} vs {match.away_team.name}
                    </strong>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--gray)' }}>
                    {new Date(match.date).toLocaleDateString()}{' '}
                    {match.time && `• ${match.time}`}{' '}
                    {' - '}
                    {match.status === 'completed'
                      ? `${match.home_score} - ${match.away_score}`
                      : 'Upcoming'}
                  </div>
                  {match.goalscorers && match.goalscorers.length > 0 && (
                    <div style={{ marginTop: '0.25rem', fontSize: '0.85rem', color: 'var(--gray)' }}>
                      Goals:{' '}
                      {match.goalscorers
                        .map(
                          (g) =>
                            `${g.player_name} (${g.team?.name || ''}) ${g.minute}'`
                        )
                        .join(', ')}
                    </div>
                  )}
                </div>
                <div>
                  {match.status === 'upcoming' && (
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => handleCompleteMatch(match)}
                    >
                      Complete
                    </button>
                  )}
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDeleteMatch(match.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {/* Match completion panel */}
            {completingMatch && (
              <div className="table-container" style={{ marginTop: '1.5rem' }}>
                <div className="table-header">
                  Complete Match: {completingMatch.home_team.name} vs{' '}
                  {completingMatch.away_team.name}
                </div>
                <div style={{ padding: '1rem' }}>
                  <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
                    <div>
                      <label>Home Score</label>
                      <input
                        type="number"
                        min="0"
                        value={completeHomeScore}
                        onChange={(e) => setCompleteHomeScore(e.target.value)}
                      />
                    </div>
                    <div>
                      <label>Away Score</label>
                      <input
                        type="number"
                        min="0"
                        value={completeAwayScore}
                        onChange={(e) => setCompleteAwayScore(e.target.value)}
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '1.5rem',
                      marginTop: '1rem',
                    }}
                  >
                    <div>
                      <h4 style={{ marginBottom: '0.5rem' }}>
                        {completingMatch.home_team.name} Goals
                      </h4>
                      <div
                        className="form-group"
                        style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.5rem' }}
                      >
                        <select
                          value={goalPlayerIdHome}
                          onChange={(e) => setGoalPlayerIdHome(e.target.value)}
                        >
                          <option value="">Select Player</option>
                          {completionHomePlayers.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} {p.is_captain ? '(C)' : ''}{' '}
                              {p.is_goalkeeper ? '(GK)' : ''}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          min="1"
                          max="120"
                          placeholder="Minute"
                          value={goalMinuteHome}
                          onChange={(e) => setGoalMinuteHome(e.target.value)}
                        />
                      </div>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleAddHomeGoal}
                      >
                        Add Home Goal
                      </button>
                    </div>

                    <div>
                      <h4 style={{ marginBottom: '0.5rem' }}>
                        {completingMatch.away_team.name} Goals
                      </h4>
                      <div
                        className="form-group"
                        style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.5rem' }}
                      >
                        <select
                          value={goalPlayerIdAway}
                          onChange={(e) => setGoalPlayerIdAway(e.target.value)}
                        >
                          <option value="">Select Player</option>
                          {completionAwayPlayers.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} {p.is_captain ? '(C)' : ''}{' '}
                              {p.is_goalkeeper ? '(GK)' : ''}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          min="1"
                          max="120"
                          placeholder="Minute"
                          value={goalMinuteAway}
                          onChange={(e) => setGoalMinuteAway(e.target.value)}
                        />
                      </div>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleAddAwayGoal}
                      >
                        Add Away Goal
                      </button>
                    </div>
                  </div>

                  <div style={{ marginTop: '1rem', maxHeight: '160px', overflowY: 'auto' }}>
                    {currentMatchGoals.length === 0 ? (
                      <p style={{ color: 'var(--gray)' }}>No goals added yet.</p>
                    ) : (
                      currentMatchGoals.map((g) => (
                        <div
                          key={g.tempId}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '0.4rem 0',
                            borderBottom: '1px solid #eee',
                          }}
                        >
                          <span>
                            {g.player.name} ({g.player.teamName}) – {g.minute}'
                          </span>
                          <button
                            style={{ border: 'none', background: 'none', color: 'red' }}
                            onClick={() =>
                              setCurrentMatchGoals(
                                currentMatchGoals.filter((x) => x.tempId !== g.tempId)
                              )
                            }
                          >
                            ×
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-success" onClick={handleSaveCompletedMatch}>
                      Save & Close
                    </button>
                    <button className="btn btn-secondary" onClick={handleCancelCompletion}>
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Players Tab */}
        {activeTab === 'players' && (
          <div>
            <h3>Manage Players</h3>
            <div className="form-group">
              <label>Select Team</label>
              <select value={selectedTeamId} onChange={handleSelectTeamForPlayers}>
                <option value="">Select Team</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedTeamId && (
              <>
                <h4>Current Squad</h4>
                {selectedTeamPlayers.length === 0 ? (
                  <p style={{ color: 'var(--gray)', marginBottom: '1rem' }}>
                    No players added yet.
                  </p>
                ) : (
                  selectedTeamPlayers.map((player) => (
                    <div key={player.id} className="team-list-item">
                      <div>
                        <strong>{player.name}</strong>
                        {player.is_captain && (
                          <span
                            className="badge badge-primary"
                            style={{ marginLeft: '0.5rem', backgroundColor: '#1976d2' }}
                          >
                            C
                          </span>
                        )}
                        {player.is_goalkeeper && (
                          <span
                            className="badge badge-warning"
                            style={{ marginLeft: '0.5rem', backgroundColor: '#fbc02d' }}
                          >
                            GK
                          </span>
                        )}
                      </div>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeletePlayer(player.id)}
                      >
                        Delete
                      </button>
                    </div>
                  ))
                )}

                <h4 style={{ marginTop: '1.5rem' }}>Add Player</h4>
                <form onSubmit={handleAddPlayer}>
                  <div className="form-group">
                    <label>Player Name</label>
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <input
                        type="checkbox"
                        checked={isGoalkeeper}
                        onChange={(e) => setIsGoalkeeper(e.target.checked)}
                      />
                      Goalkeeper
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <input
                        type="checkbox"
                        checked={isCaptain}
                        onChange={(e) => setIsCaptain(e.target.checked)}
                      />
                      Captain
                    </label>
                  </div>
                  <button type="submit" className="btn btn-primary">
                    Add Player
                  </button>
                </form>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default Admin;
