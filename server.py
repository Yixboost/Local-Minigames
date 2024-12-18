from flask import Flask, render_template, request, redirect, url_for, make_response, jsonify, send_from_directory
import os

app = Flask(__name__)
app.secret_key = os.urandom(24)  # Vereist voor sessies of cookies

# Een lijst om nicknames en berichten op te slaan
nicknames = []
scores = {}

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
    
    # Toon de nickname-inputpagina als geen nickname is ingesteld
    return render_template('index.html', nickname=None, nicknames=nicknames)



@app.route('/submit', methods=['POST'])
def submit():
    # Haal de nickname en wachtwoord op uit het formulier
    nickname = request.form.get('nickname')
    password = request.form.get('password')  # Wachtwoordveld voor host

    # Lees het wachtwoord uit het bestand psswd.txt
    with open('psswd.txt', 'r') as file:
        correct_password = file.read().strip()  # Verwijder eventuele extra spaties of nieuwe regels

    # Controleer of 'host' is geselecteerd en het wachtwoord correct is
    if nickname == 'host':
        if password != correct_password:
            return redirect(url_for('index'))  # Verwijder sessie bij fout wachtwoord

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
        resp.set_cookie('nickname', nickname, max_age=365 * 24 * 60 * 60)  # 1 jaar

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

@app.route('/kick', methods=['POST'])
def kick_user():
    # Haal de nickname op uit het formulier en uit de cookies
    nickname_to_kick = request.form.get('nickname')
    current_user = request.cookies.get('nickname')

    # Debug: Print de informatie
    print(f"Nickname to kick: {nickname_to_kick}, Current user: {current_user}")

    # Verwijder de nickname uit de lijst
    if nickname_to_kick in nicknames:
        nicknames.remove(nickname_to_kick)

    # Controleer of de gekickte gebruiker de huidige gebruiker is
    if current_user == nickname_to_kick:
        # Verwijder de cookie van de huidige gebruiker en stuur naar de hoofdpagina
        resp = make_response(redirect(url_for('index')))
        resp.delete_cookie('nickname')
        print("Cookie verwijderd voor gekickte gebruiker.")
        return resp

    # Voor andere gebruikers: gewoon terug naar de indexpagina
    return redirect(url_for('index'))

@app.route('/check_kick', methods=['GET'])
def check_kick():
    # Haal de nickname op uit de cookie
    nickname = request.cookies.get('nickname')
    
    # Controleer of de nickname nog steeds in de lijst van actieve gebruikers staat
    if nickname in nicknames:
        return jsonify({"kicked": False})  # Niet gekickt
    else:
        return jsonify({"kicked": True})  # Gekickt

@app.route('/get_online_users', methods=['GET'])
def get_online_users():
    # Haal de lijst van actieve gebruikers (nicknames)
    return jsonify(nicknames)

@app.route('/points', methods=['GET'])
def points_page():
    return render_template('points.html')

@app.route('/get_points_data', methods=['GET'])
def get_points_data():
    return jsonify(scores)

@app.route('/give_points', methods=['POST'])
def give_points():
    try:
        data = request.get_json()
        nickname = data.get('nickname')
        points = data.get('points', 0)

        # Controleer of de gebruiker in het systeem (nicknames) staat
        if nickname not in nicknames:
            return jsonify({"error": f"Nickname '{nickname}' does not exist in the system."}), 400

        # Als de gebruiker nog niet in de scores staat, initialiseer met 0 punten
        if nickname not in scores:
            scores[nickname] = 0

        # Voeg punten toe aan de huidige score
        scores[nickname] += points

        return jsonify({"nickname": nickname, "new_score": scores[nickname]}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Bestandsnaam voor het opslaan van tijden
duration_file = "duration.txt"

if not os.path.exists(duration_file):
    with open(duration_file, "w") as file:
        file.write("Start Time, End Time\n")  # Optioneel: Voeg een kopregel toe als je wilt

@app.route('/log_times', methods=['POST'])
def log_times():
    try:
        data = request.get_json()
        start_time = data.get('start_time')  # Starttijd in bijvoorbeeld ISO 8601-formaat
        end_time = data.get('end_time')      # Eindtijd in hetzelfde formaat

        # Zorg ervoor dat start- en eindtijden zijn meegegeven
        if not start_time or not end_time:
            return jsonify({"error": "Both start_time and end_time must be provided."}), 400

        # Voeg de tijden toe aan het bestand
        with open(duration_file, "a") as file:
            file.write(f"Start Time: {start_time}, End Time: {end_time}\n")

        return jsonify({"message": "Tijden opgeslagen!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Controleer of het bestand bestaat, zo niet, maak het aan
if not os.path.exists(duration_file):
    with open(duration_file, "w") as file:
        file.write("Start Time, End Time\n")  # Optioneel: Voeg een kopregel toe als je wilt

@app.route('/get_times', methods=['GET'])
def get_times():
    try:
        # Lees de opgeslagen tijden uit het bestand
        with open(duration_file, "r") as file:
            lines = file.readlines()

        # Controleer of er tijden zijn opgeslagen
        if not lines:
            return jsonify({"message": "No times found."}), 404

        # Parse de tijden naar een lijst van dictionaries
        times = []
        for line in lines:
            start_time, end_time = line.strip().split(", ")
            start_time = start_time.replace("Start Time: ", "")
            end_time = end_time.replace("End Time: ", "")
            times.append({"start_time": start_time, "end_time": end_time})

        return jsonify({"times": times}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80, debug=True)
