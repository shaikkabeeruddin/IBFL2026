import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTeams } from '../services/api';

function Table() {
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

  const sortedTeams = [...teams].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const gdDiff = b.goal_difference - a.goal_difference;
    if (gdDiff !== 0) return gdDiff;
    return b.goals_for - a.goals_for;
  });

  return (
    <section>
      <div className="table-container">
        <div className="table-header">League Standings</div>
        <div style={{ overflowX: 'auto' }}>
          <table>
            
            <thead>
              <tr>
                <th className="center">Pos</th>
                <th>Team</th>
                <th className="center">P</th>
                <th className="center">W</th>
                <th className="center">D</th>
                <th className="center">L</th>
                <th className="center">GF</th>
                <th className="center">GA</th>
                <th className="center">GD</th>
                <th className="center">Pts</th>
              </tr>
            </thead>
            <tbody>
              {sortedTeams.map((team, index) => {
                const rowClass = index === 0 ? 'champion' : index < 3 ? 'qualified' : '';
                return (
                  <tr key={team.id} className={rowClass}>
                    <td className="center position">{index + 1}</td>
                    <td 
                      className="team-name" 
                      onClick={() => navigate(`/teams/${team.id}`)}
                    >
                      {team.name}
                    </td>
                    <td className="center">{team.played}</td>
                    <td className="center">{team.won}</td>
                    <td className="center">{team.drawn}</td>
                    <td className="center">{team.lost}</td>
                    <td className="center">{team.goals_for}</td>
                    <td className="center">{team.goals_against}</td>
                    <td className="center">
                      {team.goal_difference >= 0 ? '+' : ''}{team.goal_difference}
                    </td>
                    <td className="center">
                      <strong>{team.points}</strong>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default Table;