import React, { useState, useEffect } from 'react';
import { getMatches } from '../services/api';

const API_BASE = 'http://localhost:5000';

function Matches() {
  const [matches, setMatches] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const response = await getMatches();
      setMatches(response.data);
    } catch (error) {
      console.error('Failed to load matches:', error);
    }
  };

  const filteredMatches = matches.filter(match => {
    if (filter === 'all') return true;
    return match.status === filter;
  });

  const sortedMatches = [...filteredMatches].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getTeamInitials = (name) => name.substring(0, 2).toUpperCase();

  return (
    <section>
      <div className="table-container">
        <div className="table-header">Fixtures & Results</div>
        <div style={{ padding: '1.5rem' }}>
          <div className="matches-filter">
            <button 
              className={filter === 'all' ? 'active' : ''}
              onClick={() => setFilter('all')}
            >
              All Matches
            </button>
            <button 
              className={filter === 'upcoming' ? 'active' : ''}
              onClick={() => setFilter('upcoming')}
            >
              Upcoming
            </button>
            <button 
              className={filter === 'completed' ? 'active' : ''}
              onClick={() => setFilter('completed')}
            >
              Results
            </button>
          </div>

          {sortedMatches.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
              No matches found.
            </p>
          ) : (
            sortedMatches.map(match => (
              <div key={match.id} className="match-card">
                <div className="match-header">
                  <span>{formatDate(match.date)}</span>
                  <span style={{ 
                    textTransform: 'uppercase', 
                    fontWeight: 600,
                    color: match.status === 'completed' ? 'var(--success)' : 'var(--warning)'
                  }}>
                    {match.status}
                  </span>
                </div>
                <div className="match-content">
                  <div className="team home">
                    <span className="team-name">{match.home_team.name}</span>
                    <div className="team-logo">
                      {match.home_team.logo ? (
                        <img 
                          src={`${API_BASE}/uploads/${match.home_team.logo}`} 
                          alt={match.home_team.name}
                        />
                      ) : (
                        getTeamInitials(match.home_team.name)
                      )}
                    </div>
                  </div>
                  <div className="score-box">
                    {match.status === 'completed' ? (
                      <>
                        <span>{match.home_score}</span>
                        <span className="vs">-</span>
                        <span>{match.away_score}</span>
                      </>
                    ) : (
                      <span className="vs">VS</span>
                    )}
                  </div>
                  <div className="team">
                    <div className="team-logo">
                      {match.away_team.logo ? (
                        <img 
                          src={`${API_BASE}/uploads/${match.away_team.logo}`} 
                          alt={match.away_team.name}
                        />
                      ) : (
                        getTeamInitials(match.away_team.name)
                      )}
                    </div>
                    <span className="team-name">{match.away_team.name}</span>
                  </div>
                </div>
                {match.status === 'completed' && match.goalscorers.length > 0 && (
                  <div className="goalscorers">
                    {(() => {
                      const homeGoals = match.goalscorers.filter(
                        g => g.team_id === match.home_team.id
                      );
                      const awayGoals = match.goalscorers.filter(
                        g => g.team_id === match.away_team.id
                      );
                      
                      return (
                        <>
                          {homeGoals.length > 0 && (
                            <div>
                              <strong>{match.home_team.name}:</strong>{' '}
                              {homeGoals.map(g => `${g.player_name} ${g.minute}'`).join(', ')}
                            </div>
                          )}
                          {awayGoals.length > 0 && (
                            <div>
                              <strong>{match.away_team.name}:</strong>{' '}
                              {awayGoals.map(g => `${g.player_name} ${g.minute}'`).join(', ')}
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export default Matches;