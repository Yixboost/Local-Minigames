from flask import Flask, render_template, request, redirect, url_for, make_response, jsonify, send_from_directory
import os

app = Flask(__name__)
app.secret_key = os.urandom(24)  # Vereist voor sessies of cookies

# Een lijst om nicknames en berichten op te slaan
nicknames = []

@app.route('/', methods=['GET'])
def index():
    # Haal de nickname op uit de cookie, indien aanwezig
    nickname = request.cookies.get('nickname')

    if nickname:
        # Voeg nickname toe aan de lijst als die er nog niet in staat
        if nickname not in nicknames:
            nicknames.append(nickname)

    # Haal de lijst van beschikbare games op
    games_path = os.path.join('templates', 'games')
    games = [d for d in os.listdir(games_path) if os.path.isdir(os.path.join(games_path, d))]

    return render_template('index.html', nicknames=nicknames, nickname=nickname, games=games)


@app.route('/submit', methods=['POST'])
def submit():
    # Haal de nickname op uit het formulier
    nickname = request.form.get('nickname')

    # Optionele grappige vervangingen
    nics = {
        "je moeder": "een dikke bolle aap",
        "je vader": "een dikke vette podvis",
        "trump": "een grote sukkel"
    }
    
    if nickname.lower() in nics:
        nickname = nics[nickname.lower()]

    if nickname:
        # Sla de nickname op in een cookie (1 jaar geldig)
        resp = make_response(redirect(url_for('index')))
        resp.set_cookie('nickname', nickname, max_age=365*24*60*60)  # 1 jaar

        # Voeg nickname toe aan de lijst van gebruikers
        if nickname not in nicknames:
            nicknames.append(nickname)

        return resp

    return redirect(url_for('index'))

@app.route('/leave', methods=['POST'])
def leave():
    # Haal de nickname op uit de cookie
    nickname = request.cookies.get('nickname')
    
    if nickname:
        # Verwijder de nickname uit de lijst
        if nickname in nicknames:
            nicknames.remove(nickname)

        # Verwijder de cookie
        resp = make_response(redirect(url_for('index')))
        resp.delete_cookie('nickname')

        return resp

    return redirect(url_for('index'))

# Route om een specifieke game te tonen
@app.route('/games/<game>', methods=['GET'])
def serve_game(game):
    # Controleer of de map voor de game bestaat
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


# Route om een lijst van beschikbare games te tonen
@app.route('/games', methods=['GET'])
def list_games():
    # Haal alle submappen binnen de map 'games' op
    games_path = os.path.join('templates', 'games')
    games = [d for d in os.listdir(games_path) if os.path.isdir(os.path.join(games_path, d))]
    return render_template('games.html', games=games)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80, debug=True)
