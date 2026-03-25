import React, { useState, useEffect } from 'react';
import { getStats } from '../services/api';

function Home() {
  const [stats, setStats] = useState({
    total_teams: 0,
    total_matches: 0,
    total_goals: 0,
    upcoming_matches: 0,
    current_matchday: 1
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  return (
    <section>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.total_teams}</div>
          <div className="stat-label">Teams</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.total_matches}</div>
          <div className="stat-label">Matches Played</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.total_goals}</div>
          <div className="stat-label">Goals Scored</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.current_matchday}</div>
          <div className="stat-label">Current Matchday</div>
        </div>
      </div>

      <div className="table-container">
        <div className="table-header">League Summary</div>
        <div style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Welcome to IBFL Season 5!</h3>
          <p style={{ marginBottom: '1rem' }}>
            The Inter Bhimavaram Football League returns for its 5th season.
            This season is organized by SAGI RAMA KRISHNAM RAJU ENGINEERING COLLEGE
            through the SRKREC Football Club.
          </p>
          <p style={{ marginBottom: '1rem' }}>
            <strong>Competition Format:</strong> Round-robin league system where
            each team plays every other team twice (home and away).
          </p>
          <p>
            <strong>Points System:</strong> Win = 3 points, Draw = 1 point, Loss = 0 points
          </p>
        </div>
      </div>

      <div className="table-container" style={{ marginTop: '2rem' }}>
        <div className="table-header">Tournament Rules & Regulations</div>
        <div style={{ padding: '2rem' }}>
          <p
            style={{
              fontSize: '1.1rem',
              marginBottom: '1.5rem',
              color: 'var(--accent)',
              fontWeight: 500
            }}
          >
            As the college conducts this tournament, there will be a set of rules that should be followed.
            There is no space for these objections:
          </p>

          <ol
            style={{
              fontSize: '1rem',
              lineHeight: 2,
              paddingLeft: '1.5rem',
              color: 'var(--text)'
            }}
          >
            <li>Respect Everyone</li>
            <li>
              Don’t quarrel; any issue please say to the match officials or college coordinators, we will
              take care of it
            </li>
            <li>
              Please don’t boycott any of the matches or tournament, this will affect the reputation of our
              college and our football club
            </li>
            <li>Don’t misbehave with any girls or boys within the college</li>
            <li>Foul language is highly prohibited</li>
            <li>Play safe</li>
            <li>
              Should be in time for the match; because of the conduction of college, whether it started or not
              the teams should gather on time
            </li>
            <li>
              If any audience is being rude or any student is provoking you, immediately share the details of them
            </li>
            <li>No smoking and drinking</li>
            <li>Referee decision is Final</li>
            <li>No jewellery is allowed while playing matches</li>
            <li>You are responsible to carry your valuables with you</li>
          </ol>

          <div
            style={{
              marginTop: '2rem',
              padding: '1rem',
              backgroundColor: 'var(--light-accent)',
              borderLeft: '4px solid var(--accent)',
              borderRadius: 4
            }}
          >
            <strong>Note:</strong> The organizing committee reserves the right to amend rules for the smooth
            conduct of the tournament.
          </div>
        </div>
      </div>
    </section>
  );
}

export default Home;
