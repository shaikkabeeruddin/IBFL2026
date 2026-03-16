import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTeam } from '../services/api';

const API_BASE = 'http://localhost:5000';

function TeamDetail() {
  const { id } = useParams();
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTeam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadTeam = async () => {
    try {
      setLoading(true);
      const response = await getTeam(id);
      setTeamData(response.data);
      setError('');
    } catch (err) {
      console.error('Failed to load team:', err);
      setError('Failed to load team details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section>
        <div className="table-container">
          <div className="table-header">Team Details</div>
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
        </div>
      </section>
    );
  }

  if (error || !teamData) {
    return (
      <section>
        <div className="table-container">
          <div className="table-header">Team Details</div>
          <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>
            {error || 'Team not found'}
          </div>
        </div>
      </section>
    );
  }

  const { team, completed_matches, upcoming_matches, players } = teamData;

  const initials = team.logo ? '' : team.name.substring(0, 2).toUpperCase();

  return (
    <section>
      {/* Team header */}
      <div className="table-container">
        <div className="table-header">
          <Link to="/teams" style={{ marginRight: '1rem', fontSize: '0.9rem' }}>
            ← Back to Teams
          </Link>
          Team Details
        </div>
        <div style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <div
            className="team-logo"
            style={{ width: '80px', height: '80px', fontSize: '2rem' }}
          >
            {team.logo ? (
              <img src={`${API_BASE}/uploads/${team.logo}`} alt={team.name} />
            ) : (
              initials
            )}
          </div>
          <div>
            <h2 style={{ marginBottom: '0.5rem' }}>{team.name}</h2>
            <div style={{ fontSize: '0.95rem', color: 'var(--gray)' }}>
              <span style={{ marginRight: '1rem' }}>Played: {team.played}</span>
              <span style={{ marginRight: '1rem' }}>W: {team.won}</span>
              <span style={{ marginRight: '1rem' }}>D: {team.drawn}</span>
              <span style={{ marginRight: '1rem' }}>L: {team.lost}</span>
              <span style={{ marginRight: '1rem' }}>
                GF: {team.goals_for} / GA: {team.goals_against}
              </span>
              <span style={{ marginRight: '1rem' }}>GD: {team.goal_difference}</span>
              <span>
                Points: <strong>{team.points}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Squad & Goals */}
      <div className="table-container" style={{ marginTop: '1.5rem' }}>
        <div className="table-header">Squad & Goals</div>
        <div style={{ padding: '1rem' }}>
          {players && players.length > 0 ? (
            players.map((player) => (
              <div
                key={player.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem 0',
                  borderBottom: '1px solid #e0e0e0',
                }}
              >
                <span>
                  {player.is_captain && (
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '0.1rem 0.4rem',
                        marginRight: '0.4rem',
                        fontSize: '0.75rem',
                        borderRadius: '3px',
                        backgroundColor: '#1976d2',
                        color: '#fff',
                        fontWeight: 600,
                      }}
                    >
                      C
                    </span>
                  )}
                  {player.is_goalkeeper && (
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '0.1rem 0.4rem',
                        marginRight: '0.4rem',
                        fontSize: '0.75rem',
                        borderRadius: '3px',
                        backgroundColor: '#fbc02d',
                        color: '#000',
                        fontWeight: 600,
                      }}
                    >
                      GK
                    </span>
                  )}
                  {player.name}
                </span>
                <span style={{ fontSize: '0.9rem', color: 'var(--gray)' }}>
                  Goals: <strong>{player.goals || 0}</strong>
                </span>
              </div>
            ))
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--gray)' }}>No players added yet.</p>
          )}
        </div>
      </div>

      {/* Completed matches */}
      <div className="table-container" style={{ marginTop: '1.5rem' }}>
        <div className="table-header">Completed Matches</div>
        <div style={{ padding: '1rem' }}>
          {completed_matches && completed_matches.length > 0 ? (
            completed_matches.map((m) => (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.75rem 0',
                  borderBottom: '1px solid #e0e0e0',
                }}
              >
                <div>
                  <div>
                    <strong>
                      {m.home_team.name} vs {m.away_team.name}
                    </strong>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--gray)' }}>
                    {new Date(m.date).toLocaleDateString()}{' '}
                    {m.time && `• ${m.time}`} {' - '}
                    {m.home_score} - {m.away_score}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--gray)' }}>No completed matches yet.</p>
          )}
        </div>
      </div>

      {/* Upcoming matches */}
      <div className="table-container" style={{ marginTop: '1.5rem' }}>
        <div className="table-header">Upcoming Matches</div>
        <div style={{ padding: '1rem' }}>
          {upcoming_matches && upcoming_matches.length > 0 ? (
            upcoming_matches.map((m) => (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.75rem 0',
                  borderBottom: '1px solid #e0e0e0',
                }}
              >
                <div>
                  <div>
                    <strong>
                      {m.home_team.name} vs {m.away_team.name}
                    </strong>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--gray)' }}>
                    {new Date(m.date).toLocaleDateString()}{' '}
                    {m.time && `• ${m.time}`} {' - '} Upcoming
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--gray)' }}>No upcoming matches.</p>
          )}
        </div>
      </div>
    </section>
  );
}

export default TeamDetail;
