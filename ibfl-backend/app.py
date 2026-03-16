from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
import jwt
from functools import wraps
import os
from werkzeug.utils import secure_filename
from PIL import Image
from sqlalchemy import func

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SECRET_KEY'] = 'ibfl-season4-secret-key-change-in-production'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///ibfl.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

db = SQLAlchemy(app)

# Ensure upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Models
class Team(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    logo = db.Column(db.String(200))
    played = db.Column(db.Integer, default=0)
    won = db.Column(db.Integer, default=0)
    drawn = db.Column(db.Integer, default=0)
    lost = db.Column(db.Integer, default=0)
    goals_for = db.Column(db.Integer, default=0)
    goals_against = db.Column(db.Integer, default=0)
    goal_difference = db.Column(db.Integer, default=0)
    points = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'logo': self.logo,
            'played': self.played,
            'won': self.won,
            'drawn': self.drawn,
            'lost': self.lost,
            'goals_for': self.goals_for,
            'goals_against': self.goals_against,
            'goal_difference': self.goal_difference,
            'points': self.points
        }


class Match(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False)
    time = db.Column(db.String(5))  # HH:MM
    home_team_id = db.Column(db.Integer, db.ForeignKey('team.id'), nullable=False)
    away_team_id = db.Column(db.Integer, db.ForeignKey('team.id'), nullable=False)
    home_score = db.Column(db.Integer)
    away_score = db.Column(db.Integer)
    status = db.Column(db.String(20), default='upcoming')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    home_team = db.relationship('Team', foreign_keys=[home_team_id], backref='home_matches')
    away_team = db.relationship('Team', foreign_keys=[away_team_id], backref='away_matches')

    def to_dict(self):
        return {
            'id': self.id,
            'date': self.date.isoformat(),
            'time': self.time,
            'home_team': self.home_team.to_dict(),
            'away_team': self.away_team.to_dict(),
            'home_score': self.home_score,
            'away_score': self.away_score,
            'status': self.status
        }


class Player(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    team_id = db.Column(db.Integer, db.ForeignKey('team.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    is_goalkeeper = db.Column(db.Boolean, default=False)
    is_captain = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    team = db.relationship('Team', backref='players')

    def to_dict(self):
        return {
            'id': self.id,
            'team_id': self.team_id,
            'name': self.name,
            'is_goalkeeper': self.is_goalkeeper,
            'is_captain': self.is_captain
        }


class Goalscorer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    match_id = db.Column(db.Integer, db.ForeignKey('match.id'), nullable=False)
    player_id = db.Column(db.Integer, db.ForeignKey('player.id'), nullable=False)
    minute = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    match = db.relationship('Match', backref='goalscorers')
    player = db.relationship('Player')

    def to_dict(self):
        # include player, team and player_name for frontend compatibility
        return {
            'id': self.id,
            'match_id': self.match_id,
            'player': self.player.to_dict() if self.player else None,
            'team': self.player.team.to_dict() if self.player and self.player.team else None,
            'player_name': self.player.name if self.player else None,
            'minute': self.minute
        }


# Authentication decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')

        if not token:
            return jsonify({'error': 'Token is missing'}), 401

        try:
            token = token.split(' ')[1]  # Remove 'Bearer ' prefix
            payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            request.user = payload.get('user')
        except Exception:
            return jsonify({'error': 'Token is invalid'}), 401

        return f(*args, **kwargs)

    return decorated


# Helper function to update team statistics
def update_team_stats():
    teams = Team.query.all()

    for team in teams:
        # Reset stats
        team.played = 0
        team.won = 0
        team.drawn = 0
        team.lost = 0
        team.goals_for = 0
        team.goals_against = 0
        team.points = 0

        # Get completed matches
        home_matches = Match.query.filter_by(home_team_id=team.id, status='completed').all()
        away_matches = Match.query.filter_by(away_team_id=team.id, status='completed').all()

        # Home stats
        for match in home_matches:
            team.played += 1
            team.goals_for += match.home_score or 0
            team.goals_against += match.away_score or 0

            if match.home_score > match.away_score:
                team.won += 1
                team.points += 3
            elif match.home_score == match.away_score:
                team.drawn += 1
                team.points += 1
            else:
                team.lost += 1

        # Away stats
        for match in away_matches:
            team.played += 1
            team.goals_for += match.away_score or 0
            team.goals_against += match.home_score or 0

            if match.away_score > match.home_score:
                team.won += 1
                team.points += 3
            elif match.away_score == match.home_score:
                team.drawn += 1
                team.points += 1
            else:
                team.lost += 1

        team.goal_difference = team.goals_for - team.goals_against

    db.session.commit()


# Routes

# Authentication
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if username == 'SRKREC' and password == 'IBFL2026@SRKREC':
        token = jwt.encode(
            {'user': username, 'exp': datetime.utcnow() + timedelta(days=7)},
            app.config['SECRET_KEY'],
            algorithm='HS256'
        )
        return jsonify({'token': token, 'username': username})

    return jsonify({'error': 'Invalid credentials'}), 401


@app.route('/api/auth/verify', methods=['GET'])
@token_required
def verify_token():
    return jsonify({'valid': True, 'username': request.user})


# Teams
@app.route('/api/teams', methods=['GET'])
def get_teams():
    teams = Team.query.order_by(Team.points.desc(), Team.goal_difference.desc()).all()
    return jsonify([team.to_dict() for team in teams])


@app.route('/api/teams/<int:team_id>', methods=['GET'])
def get_team(team_id):
    team = Team.query.get_or_404(team_id)

    # Completed matches
    completed_home = Match.query.filter_by(home_team_id=team_id, status='completed').all()
    completed_away = Match.query.filter_by(away_team_id=team_id, status='completed').all()
    completed_matches = completed_home + completed_away
    completed_matches.sort(key=lambda x: (x.date, x.time or ''), reverse=True)

    # Upcoming matches
    upcoming_home = Match.query.filter_by(home_team_id=team_id, status='upcoming').all()
    upcoming_away = Match.query.filter_by(away_team_id=team_id, status='upcoming').all()
    upcoming_matches = upcoming_home + upcoming_away
    upcoming_matches.sort(key=lambda x: (x.date, x.time or ''))

    players = Player.query.filter_by(team_id=team_id).order_by(
        Player.is_captain.desc(),
        Player.is_goalkeeper.desc(),
        Player.name.asc()
    ).all()

    # goals per player
    goals_counts = dict(
        db.session.query(Goalscorer.player_id, func.count(Goalscorer.id))
        .join(Player, Goalscorer.player_id == Player.id)
        .filter(Player.team_id == team_id)
        .group_by(Goalscorer.player_id)
        .all()
    )

    players_data = []
    for p in players:
        d = p.to_dict()
        d['goals'] = goals_counts.get(p.id, 0)
        players_data.append(d)

    return jsonify({
        'team': team.to_dict(),
        'completed_matches': [m.to_dict() for m in completed_matches],
        'upcoming_matches': [m.to_dict() for m in upcoming_matches],
        'players': players_data
    })


@app.route('/api/teams', methods=['POST'])
@token_required
def create_team():
    data = request.json
    name = data.get('name')

    if not name:
        return jsonify({'error': 'Team name is required'}), 400

    if Team.query.filter_by(name=name).first():
        return jsonify({'error': 'Team already exists'}), 400

    team = Team(name=name)
    db.session.add(team)
    db.session.commit()

    return jsonify(team.to_dict()), 201


@app.route('/api/teams/<int:team_id>', methods=['PUT'])
@token_required
def update_team(team_id):
    team = Team.query.get_or_404(team_id)
    data = request.json

    if 'name' in data:
        team.name = data['name']

    db.session.commit()
    return jsonify(team.to_dict())


@app.route('/api/teams/<int:team_id>', methods=['DELETE'])
@token_required
def delete_team(team_id):
    team = Team.query.get_or_404(team_id)

    matches = Match.query.filter(
        (Match.home_team_id == team_id) | (Match.away_team_id == team_id)
    ).all()
    for m in matches:
        Goalscorer.query.filter_by(match_id=m.id).delete()
        db.session.delete(m)

    Player.query.filter_by(team_id=team_id).delete()

    if team.logo:
        logo_path = os.path.join(app.config['UPLOAD_FOLDER'], team.logo)
        if os.path.exists(logo_path):
            os.remove(logo_path)

    db.session.delete(team)
    db.session.commit()
    update_team_stats()

    return jsonify({'message': 'Team deleted'})


@app.route('/api/teams/<int:team_id>/logo', methods=['POST'])
@token_required
def upload_logo(team_id):
    team = Team.query.get_or_404(team_id)

    if 'logo' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['logo']

    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
    if '.' not in file.filename or file.filename.rsplit('.', 1)[1].lower() not in allowed_extensions:
        return jsonify({'error': 'Invalid file type'}), 400

    if team.logo:
        old_logo_path = os.path.join(app.config['UPLOAD_FOLDER'], team.logo)
        if os.path.exists(old_logo_path):
            os.remove(old_logo_path)

    filename = secure_filename(f"team_{team_id}_{datetime.now().timestamp()}.png")
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)

    image = Image.open(file)
    image = image.convert('RGB')

    width, height = image.size
    min_dim = min(width, height)
    left = (width - min_dim) // 2
    top = (height - min_dim) // 2
    right = left + min_dim
    bottom = top + min_dim
    image = image.crop((left, top, right, bottom))

    image = image.resize((200, 200), Image.LANCZOS)
    image.save(filepath, 'PNG')

    team.logo = filename
    db.session.commit()

    return jsonify(team.to_dict())


# Player management
@app.route('/api/teams/<int:team_id>/players', methods=['POST'])
@token_required
def add_player(team_id):
    Team.query.get_or_404(team_id)
    data = request.json

    name = data.get('name')
    if not name:
        return jsonify({'error': 'Player name is required'}), 400

    is_gk = bool(data.get('is_goalkeeper'))
    is_captain = bool(data.get('is_captain'))

    if is_captain:
        Player.query.filter_by(team_id=team_id, is_captain=True).update({'is_captain': False})

    if is_gk:
        Player.query.filter_by(team_id=team_id, is_goalkeeper=True).update({'is_goalkeeper': False})

    player = Player(
        team_id=team_id,
        name=name,
        is_goalkeeper=is_gk,
        is_captain=is_captain
    )
    db.session.add(player)
    db.session.commit()

    return jsonify(player.to_dict()), 201


@app.route('/api/teams/<int:team_id>/players/<int:player_id>', methods=['DELETE'])
@token_required
def delete_player(team_id, player_id):
    player = Player.query.filter_by(id=player_id, team_id=team_id).first_or_404()
    db.session.delete(player)
    db.session.commit()
    return jsonify({'message': 'Player deleted'})


# Matches
@app.route('/api/matches', methods=['GET'])
def get_matches():
    matches = Match.query.order_by(Match.date.desc(), Match.time.desc().nullslast()).all()
    result = []

    for match in matches:
        match_dict = match.to_dict()
        goalscorers = Goalscorer.query.filter_by(match_id=match.id).order_by(Goalscorer.minute.asc()).all()
        match_dict['goalscorers'] = [gs.to_dict() for gs in goalscorers]
        result.append(match_dict)

    return jsonify(result)


@app.route('/api/matches/<int:match_id>', methods=['GET'])
def get_match(match_id):
    match = Match.query.get_or_404(match_id)
    match_dict = match.to_dict()
    goalscorers = Goalscorer.query.filter_by(match_id=match_id).order_by(Goalscorer.minute.asc()).all()
    match_dict['goalscorers'] = [gs.to_dict() for gs in goalscorers]
    return jsonify(match_dict)


@app.route('/api/matches', methods=['POST'])
@token_required
def create_match():
    data = request.json

    required_fields = ['date', 'home_team_id', 'away_team_id']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400

    home_team = Team.query.get(data['home_team_id'])
    away_team = Team.query.get(data['away_team_id'])

    if not home_team or not away_team:
        return jsonify({'error': 'Invalid team ID'}), 400

    if data['home_team_id'] == data['away_team_id']:
        return jsonify({'error': 'Home and away teams must be different'}), 400

    try:
        match_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400

    match_time = data.get('time')
    if match_time and len(match_time) != 5:
        return jsonify({'error': 'Invalid time format. Use HH:MM'}), 400

    today = datetime.now().date()
    status = data.get('status', 'upcoming')

    if status == 'upcoming' and match_date < today:
        return jsonify({'error': 'Cannot create upcoming match with past date'}), 400

    if status == 'completed' and match_date > today:
        return jsonify({'error': 'Cannot create completed match with future date'}), 400

    match = Match(
        date=match_date,
        time=match_time,
        home_team_id=data['home_team_id'],
        away_team_id=data['away_team_id'],
        status=status
    )

    if match.status == 'completed':
        if 'home_score' not in data or 'away_score' not in data:
            return jsonify({'error': 'Scores required for completed matches'}), 400
        match.home_score = data['home_score']
        match.away_score = data['away_score']

    db.session.add(match)
    db.session.commit()

    if match.status == 'completed':
        update_team_stats()

    return jsonify(match.to_dict()), 201


@app.route('/api/matches/<int:match_id>', methods=['PUT'])
@token_required
def update_match(match_id):
    match = Match.query.get_or_404(match_id)
    data = request.json

    if 'date' in data:
        try:
            match.date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Invalid date format'}), 400

    if 'time' in data:
        match.time = data['time']

    if 'status' in data:
        match.status = data['status']

    today = datetime.now().date()

    if match.status == 'completed':
        if 'home_score' in data and 'away_score' in data:
            match.home_score = data['home_score']
            match.away_score = data['away_score']
        if match.date > today:
            return jsonify({'error': 'Cannot mark a future match as completed'}), 400

    if match.status == 'upcoming' and match.date < today:
        return jsonify({'error': 'Cannot set a past match as upcoming'}), 400

    db.session.commit()
    update_team_stats()

    return jsonify(match.to_dict())


@app.route('/api/matches/<int:match_id>', methods=['DELETE'])
@token_required
def delete_match(match_id):
    match = Match.query.get_or_404(match_id)

    Goalscorer.query.filter_by(match_id=match_id).delete()
    db.session.delete(match)
    db.session.commit()
    update_team_stats()

    return jsonify({'message': 'Match deleted'})


# Goalscorers
@app.route('/api/matches/<int:match_id>/goalscorers', methods=['POST'])
@token_required
def add_goalscorer(match_id):
    Match.query.get_or_404(match_id)
    data = request.json

    required_fields = ['player_id', 'minute']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400

    goalscorer = Goalscorer(
        match_id=match_id,
        player_id=data['player_id'],
        minute=data['minute']
    )

    db.session.add(goalscorer)
    db.session.commit()

    return jsonify(goalscorer.to_dict()), 201


@app.route('/api/goalscorers/<int:goalscorer_id>', methods=['DELETE'])
@token_required
def delete_goalscorer(goalscorer_id):
    goalscorer = Goalscorer.query.get_or_404(goalscorer_id)
    db.session.delete(goalscorer)
    db.session.commit()
    return jsonify({'message': 'Goalscorer deleted'})


# Stats
@app.route('/api/stats', methods=['GET'])
def get_stats():
    total_teams = Team.query.count()
    total_matches = Match.query.filter_by(status='completed').count()
    upcoming_matches = Match.query.filter_by(status='upcoming').count()

    total_goals = db.session.query(
        func.coalesce(
            func.sum(
                func.coalesce(Match.home_score, 0) + func.coalesce(Match.away_score, 0)
            ),
            0
        )
    ).filter(Match.status == 'completed').scalar() or 0

    return jsonify({
        'total_teams': total_teams,
        'total_matches': total_matches,
        'upcoming_matches': upcoming_matches,
        'total_goals': total_goals,
        'current_matchday': 1
    })


@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


with app.app_context():
    db.create_all()
    print("Database initialized!")


if __name__ == '__main__':
    app.run(debug=True, port=5000)
