// Function to fetch the times from the get_times endpoint
async function fetchTimes() {
    try {
        const response = await fetch('/get_times');
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        const data = await response.json();

        if (data && data.times && data.times.length > 0) {
            // Get the last stored start and end times
            const lastTime = data.times[data.times.length - 1];
            const startTimeParts = lastTime.start_time.split(':');   // Split the start time based on ':'
            const endTimeParts = lastTime.end_time.split(':');      // Split the end time based on ':'

            // Get the current date
            const currentDate = new Date();

            // Convert the start time to a full ISO format (using UTC to avoid timezone issues)
            const startTimeString = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}T${startTimeParts[0]}:${startTimeParts[1]}:00`;

            // Convert the end time to a full ISO format
            const endTimeString = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}T${endTimeParts[0]}:${endTimeParts[1]}:00`;

            // Create Date objects from the start and end times
            const startTime = new Date(startTimeString);
            const endTime = new Date(endTimeString);

            console.log("Start time from server:", lastTime.start_time);
            console.log("End time from server:", lastTime.end_time);

            // Check if the current time is before the start time
            if (currentDate < startTime) {
                console.log("Game has not started yet.");
                document.getElementById('game-status').innerText = "Waiting for the game to start.";
                document.getElementById('game-status').className = 'watching'; // Add 'watching' class
                document.getElementById('countdown').className = 'upcoming'; // Add 'upcoming' class
                startCountdownToStart(startTime); // Start countdown to the start time
            } else if (currentDate >= startTime && currentDate < endTime) {
                console.log("Game is ongoing.");
                document.getElementById('game-status').innerText = "Game is ongoing.";
                document.getElementById('game-status').className = 'playing'; // Add 'playing' class
                document.getElementById('countdown').className = 'ongoing'; // Add 'ongoing' class
                startCountdownToEnd(endTime); // Start countdown to the end time
            } else {
                console.log("Game is over.");
                document.getElementById('game-status').innerText = "The game is over.";
                document.getElementById('game-status').className = 'finished'; // Add 'finished' class
                document.getElementById('countdown').className = 'finished'; // Add 'finished' class
                document.getElementById('countdown').innerHTML = '<img src="/static/images/logo.png" alt="Logo"> Time\'s up!';
            }

        } else {
            document.getElementById('game-status').innerText = "No times found.";
        }
    } catch (error) {
        console.error('Error fetching times:', error);
        document.getElementById('game-status').innerText = "No Game Host";
    }
}

// Function to start the countdown to the start time
function startCountdownToStart(startTime) {
    const countdownElement = document.getElementById('countdown');
    const interval = setInterval(function() {
        try {
            const now = new Date().getTime();
            const distance = startTime - now;

            if (distance < 0) {
                clearInterval(interval);
                countdownElement.innerText = "Game starts now!";
            } else {
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);

                countdownElement.innerHTML = `<img src="/static/images/logo.png" alt="Logo"> ${hours} hours ${minutes} minutes ${seconds} seconds`;
            }
        } catch (error) {
            console.error('Error in countdown to start time:', error);
            clearInterval(interval); // Stop the timer if there is an error
            countdownElement.innerText = "There was an error in the timer.";
        }
    }, 1000);
}

// Function to start the countdown to the end time
function startCountdownToEnd(endTime) {
    const countdownElement = document.getElementById('countdown');
    const interval = setInterval(function() {
        try {
            const now = new Date().getTime();
            const distance = endTime - now;

            if (distance < 0) {
                clearInterval(interval);
                countdownElement.innerText = "Time's up!";
            } else {
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);

                countdownElement.innerHTML = `<img src="/static/images/logo.png" alt="Logo"> ${hours} hours ${minutes} minutes ${seconds} seconds`;
            }
        } catch (error) {
            console.error('Error in countdown to end time:', error);
            clearInterval(interval); // Stop the timer if there is an error
            countdownElement.innerText = "There was an error in the timer.";
        }
    }, 1000);
}

// Load the times when the page loads
window.onload = fetchTimes;
