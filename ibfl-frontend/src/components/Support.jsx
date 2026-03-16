import React from 'react';

function Support() {
  return (
    <section>
      <h1>Support & Contact</h1>

      <div className="table-container">
        <div className="table-header">Get Help & Support</div>
        <div style={{ padding: '2rem' }}>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '1.5rem' }}>
            Need assistance with the IBFL Season 4 tournament? We're here to help!
          </p>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '1.5rem',
            marginTop: '2rem'
          }}>
            {/* Tournament Coordinators */}
            <div style={{ 
              padding: '1.5rem', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '8px',
              borderLeft: '4px solid var(--primary)'
            }}>
              <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>
                🏆 Tournament Coordinators
              </h3>
              <p style={{ lineHeight: '1.8' }}>
                For match scheduling, team registration, and general tournament queries.
              </p>
            </div>

            {/* Match Officials */}
            <div style={{ 
              padding: '1.5rem', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '8px',
              borderLeft: '4px solid var(--warning)'
            }}>
              <h3 style={{ marginBottom: '1rem', color: 'var(--warning)' }}>
                ⚽ Match Officials
              </h3>
              <p style={{ lineHeight: '1.8' }}>
                For refereeing decisions, match disputes, and on-field issues.
              </p>
            </div>

            {/* Technical Support */}
            <div style={{ 
              padding: '1.5rem', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '8px',
              borderLeft: '4px solid var(--accent)'
            }}>
              <h3 style={{ marginBottom: '1rem', color: 'var(--accent)' }}>
                💻 Technical Support
              </h3>
              <p style={{ lineHeight: '1.8' }}>
                For website issues, login problems, or score updates.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="table-container" style={{ marginTop: '2rem' }}>
        <div className="table-header">Contact Information</div>
        <div style={{ padding: '2rem' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>📧 Email</h3>
            <p style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>
              ibfl.support@college.edu
            </p>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>📱 Phone</h3>
            <p style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>
              +91 XXXXX XXXXX
            </p>
          </div>

          <div>
            <h3 style={{ marginBottom: '0.5rem' }}>🏫 Office Location</h3>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
              Sports Department<br />
              College Campus<br />
              Ground Floor, Main Building
            </p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="table-container" style={{ marginTop: '2rem' }}>
        <div className="table-header">Frequently Asked Questions</div>
        <div style={{ padding: '2rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>
              Q: How do I register my team?
            </h3>
            <p style={{ lineHeight: '1.8' }}>
              Contact the tournament coordinators with your team name and player list. 
              Registration is handled by the organizing committee.
            </p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>
              Q: What if I miss a match?
            </h3>
            <p style={{ lineHeight: '1.8' }}>
              As per tournament rules, teams must be punctual. Missing matches may result 
              in forfeiture. Contact coordinators immediately if there's an emergency.
            </p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>
              Q: How are disputes resolved?
            </h3>
            <p style={{ lineHeight: '1.8' }}>
              All disputes should be raised with match officials or coordinators immediately. 
              The referee's decision is final for on-field matters. Off-field issues will be 
              reviewed by the organizing committee.
            </p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>
              Q: Can I report misconduct?
            </h3>
            <p style={{ lineHeight: '1.8' }}>
              Yes! If you witness any rule violations, misconduct, or harassment, please report 
              it immediately to coordinators. We take all complaints seriously and will take 
              appropriate action.
            </p>
          </div>

          <div>
            <h3 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>
              Q: Where can I view match schedules?
            </h3>
            <p style={{ lineHeight: '1.8' }}>
              Visit the "Matches" page to see all scheduled and completed matches. You can also 
              check individual team pages for their specific fixtures.
            </p>
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div style={{ 
        marginTop: '2rem', 
        padding: '1.5rem', 
        backgroundColor: '#fff3cd', 
        border: '2px solid #ffc107',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <h3 style={{ color: '#856404', marginBottom: '0.5rem' }}>
          🚨 Emergency Contact
        </h3>
        <p style={{ fontSize: '1.1rem', color: '#856404' }}>
          For urgent matters during matches, contact Match Officials on-site or call:<br />
          <strong style={{ fontSize: '1.3rem' }}>+91 XXXXX XXXXX</strong>
        </p>
      </div>
    </section>
  );
}

export default Support;