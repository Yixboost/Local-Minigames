        // Haal de huidige tijd op (in het formaat HH:MM)
        function getCurrentTime() {
            let now = new Date();

            let hours = now.getHours().toString().padStart(2, '0');
            let minutes = now.getMinutes().toString().padStart(2, '0');

            return hours + ':' + minutes;
        }

        // Zet de huidige tijden in de invoervelden wanneer de modal wordt geopend
        document.getElementById('settingsModal').addEventListener('shown.bs.modal', function () {
            let currentStartTime = getCurrentTime();
            let currentEndTime = currentStartTime;

            // Zet de tijden in de invoervelden
            document.getElementById('start_time').value = currentStartTime;
            document.getElementById('end_time').value = currentEndTime;

            // Als je de tijd dynamisch wilt aanpassen (bijvoorbeeld 1 uur later voor de eindtijd)
            let endTime = new Date();
            endTime.setHours(endTime.getHours() + 1); // Voeg 1 uur toe aan de eindtijd
            let endTimeString = endTime.getHours().toString().padStart(2, '0') + ':' + endTime.getMinutes().toString().padStart(2, '0');
            document.getElementById('end_time').value = endTimeString;
        });

        // Opslaan knop
        document.getElementById('saveTimes').addEventListener('click', function () {
            // Haal de waarden uit de invoervelden
            let startTime = document.getElementById('start_time').value;
            let endTime = document.getElementById('end_time').value;

            // Maak een JSON-object met de tijden
            let data = {
                start_time: startTime,
                end_time: endTime
            };

            // Verzend de gegevens via een fetch-request (geen jQuery)
            fetch('/log_times', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
                .then(response => response.json())
                .then(data => {
                    // Succesvol opgeslagen
                    console.log('Tijden opgeslagen:', data);
                    $('#settingsModal').modal('hide');  // Sluit de modal
                })
                .catch(error => {
                    // Foutafhandeling
                    console.error('Er is een fout opgetreden:', error);
                });
        });