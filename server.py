from flask import Flask, render_template, request, redirect, url_for, make_response, jsonify, send_from_directory
import os

app = Flask(__name__)
app.secret_key = os.urandom(24)  # Vereist voor sessies of cookies

# Een lijst om nicknames en berichten op te slaan
nicknames = []
scores = {}

@app.route('/', methods=['GET'])
def index():
    nickname = request.cookies.get('nickname')

    if nickname:
        if nickname not in nicknames:
            nicknames.append(nickname)
            scores[nickname] = 0

    # Haal de lijst van beschikbare games op
    games_path = os.path.join('templates', 'games')
    games = [d for d in os.listdir(games_path) if os.path.isdir(os.path.join(games_path, d))]

    return render_template('index.html', nicknames=nicknames, nickname=nickname, games=games)


@app.route('/submit', methods=['POST'])
def submit():
    # Haal de nickname op uit het formulier
    nickname = request.form.get('nickname')

    nics = {
        "je moeder": "een dikke bolle aap",
        "je vader": "een dikke vette podvis",
        "trump": "een grote sukkel met 0 punten"
    }
    
    if nickname.lower() in nics:
        nickname = nics[nickname.lower()]
        scores[nickname] = 0

    if nickname:
        # Sla de nickname op in een cookie (1 jaar)
        resp = make_response(redirect(url_for('index')))
        resp.set_cookie('nickname', nickname, max_age=365*24*60*60)  # 1 jaar

        # Voeg nickname toe aan lijst gebruikers
        if nickname not in nicknames:
            nicknames.append(nickname)

        return resp

    return redirect(url_for('index'))

@app.route('/leave', methods=['POST'])
def leave():
    # Haal de nickname op uit cookie
    nickname = request.cookies.get('nickname')
    
    if nickname:
        # Verwijder nickname uit lijst
        if nickname in nicknames:
            nicknames.remove(nickname)
            del scores[nickname]

        # Verwijder cookie
        resp = make_response(redirect(url_for('index')))
        resp.delete_cookie('nickname')

        return resp

    return redirect(url_for('index'))

# Route om specifieke game te tonen
@app.route('/games/<game>', methods=['GET'])
def serve_game(game):
    # Controleer of map voor game bestaat
    game_path = os.path.join('templates', 'games', game)
    if os.path.exists(game_path) and os.path.isdir(game_path):
        return render_template(f'games/{game}/index.html')
    else:
        return "Game not found.", 404

@app.route('/games/<game>/<path:filename>', methods=['GET'])
def serve_game_assets(game, filename):
    game_path = os.path.join('templates', 'games', game)
    if os.path.exists(os.path.join(game_path, filename)):
        return send_from_directory(game_path, filename)
    else:
        return "Asset not found.", 404


# Route om lijst van beschikbare games te tonen
@app.route('/games', methods=['GET'])
def list_games():
    # Haal alle submappen binnen map 'games' op
    games_path = os.path.join('templates', 'games')
    games = [d for d in os.listdir(games_path) if os.path.isdir(os.path.join(games_path, d))]
    return render_template('games.html', games=games)

@app.route('/increase_point', methods=['POST'])
def increase_point():
    try:
        data = request.get_json()
        nickname = data.get('nickname')
        points = data.get('points', 0)

        if nickname not in scores:
            return jsonify({"error": "Nickname not found"}), 404

        scores[nickname] += points
        return jsonify({"nickname": nickname, "new_score": scores[nickname]}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80, debug=True)