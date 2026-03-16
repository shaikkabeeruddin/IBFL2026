import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTeams } from '../services/api';

const API_BASE = 'http://localhost:5000';

function Teams() {
  const [teams, setTeams] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      const response = await getTeams();
      setTeams(response.data);
    } catch (error) {
      console.error('Failed to load teams:', error);
    }
  };

  const getTeamInitials = (name) => name.substring(0, 2).toUpperCase();

  const getPosition = (teamId) => {
    const sorted = [...teams].sort((a, b) => b.points - a.points);
    return sorted.findIndex(t => t.id === teamId) + 1;
  };

  return (
    <section>
      <div className="teams-grid">
        {teams.map(team => (
          <div 
            key={team.id} 
            className="team-card"
            onClick={() => navigate(`/teams/${team.id}`)}
          >
            <div className="team-header">
              <div className="team-logo-large">
                {team.logo ? (
                  <img 
                    src={`${API_BASE}/uploads/${team.logo}`} 
                    alt={team.name}
                  />
                ) : (
                  getTeamInitials(team.name)
                )}
              </div>
              <h2>{team.name}</h2>
            </div>
            <div className="team-info">
              <div className="team-stat">
                <span>Position</span>
                <strong>{getPosition(team.id)}</strong>
              </div>
              <div className="team-stat">
                <span>Matches Played</span>
                <strong>{team.played}</strong>
              </div>
              <div className="team-stat">
                <span>Points</span>
                <strong>{team.points}</strong>
              </div>
              <div className="team-stat">
                <span>Won / Draw / Lost</span>
                <strong>{team.won} / {team.drawn} / {team.lost}</strong>
              </div>
              <div className="team-stat">
                <span>Goals For / Against</span>
                <strong>{team.goals_for} / {team.goals_against}</strong>
              </div>
              <div className="team-stat">
                <span>Goal Difference</span>
                <strong style={{ 
                  color: team.goal_difference >= 0 ? 'var(--success)' : 'var(--accent)' 
                }}>
                  {team.goal_difference >= 0 ? '+' : ''}{team.goal_difference}
                </strong>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Teams;