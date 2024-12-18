document.getElementById('muteButton').addEventListener('click', function () {
    var audio = document.getElementById('background-music');
    var icon = this.querySelector('.fa');
    if (audio.muted) {
        audio.muted = false;
        this.querySelector('img').src = '/static/images/mute-icon.png';  // Change to unmute icon
        icon.className = 'fa fa-volume-up'; // Change Font Awesome icon to volume up
    } else {
        audio.muted = true;
        this.querySelector('img').src = '/static/images/unmute-icon.png';  // Change to mute icon
        icon.className = 'fa fa-volume-mute'; // Change Font Awesome icon to volume mute
    }
});

// Functie om alle PNG-afbeeldingen uit een map op te halen (op basis van een patroon)
async function fetchImages() {
    const folderPath = '/static/images/backgrounds/';
    const totalImages = 5; // Stel hier het aantal afbeeldingen in dat je hebt (bijvoorbeeld 5 afbeeldingen)
    const pngImages = [];
  
    // Loop door de mogelijke afbeeldingen (background-1.png, background-2.png, ...)
    for (let i = 1; i <= totalImages; i++) {
      pngImages.push(`${folderPath}background-${i}.png`);
    }
  
    return pngImages;
  }
  
  // Functie om een array willekeurig te schudden (Fisher-Yates shuffle)
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // Swap de elementen
    }
  }
  
  // Functie om het achtergrondafbeelding te veranderen
  function changeBackgroundImage(images) {
    shuffleArray(images); // Shuffle de afbeeldingen bij het begin
  
    let currentIndex = 0;
    const overlay = document.createElement('div');
    overlay.className = 'background-overlay';
    document.body.appendChild(overlay);
  
    // Zet de eerste afbeelding meteen zonder overgang
    overlay.style.backgroundImage = `url(${images[currentIndex]})`;
    overlay.style.opacity = 1; // Zorg ervoor dat de eerste afbeelding meteen zichtbaar is
  
    // Begin de afbeeldingverandering na 5 seconden
    setInterval(() => {
      const nextIndex = (currentIndex + 1) % images.length;
  
      // Start de overgang naar de nieuwe afbeelding
      const newImage = images[nextIndex];
  
      // Fade-out van de huidige afbeelding
      overlay.style.opacity = 0;
  
      // Na de fade-out, wijzig de achtergrondafbeelding en start de fade-in
      setTimeout(() => {
        overlay.style.backgroundImage = `url(${newImage})`;  // Verander de afbeelding
        overlay.style.opacity = 1;  // Start fade-in van de nieuwe afbeelding
      }, 1000); // Na 1 seconde de nieuwe afbeelding instellen
  
      // Werk de index bij voor de volgende afbeelding
      currentIndex = nextIndex;
      
      // Shuffle de afbeeldingen opnieuw als we aan het einde van de lijst zijn gekomen
      if (currentIndex === 0) {
        shuffleArray(images); // Schud opnieuw als we terugkomen bij de eerste afbeelding
      }
    }, 5000); // Elke 5 seconden
  }
  
  // Initialiseer het script
  async function init() {
    const images = await fetchImages();
    if (images.length > 0) {
      changeBackgroundImage(images);
    } else {
      console.log('Geen afbeeldingen gevonden.');
    }
  }
  
  init();

  function togglePasswordField() {
    const nicknameInput = document.getElementById('nickname');
    const passwordContainer = document.getElementById('password-container');
    
    // Controleer of de ingevoerde nickname "host" is
    if (nicknameInput.value.trim().toLowerCase() === 'host') {
        passwordContainer.style.display = 'block';
    } else {
        passwordContainer.style.display = 'none';
    }
}

function checkKickStatus() {
    fetch('/check_kick') // Maak een GET-verzoek naar de server
        .then(response => response.json())
        .then(data => {
            if (data.kicked) {
                // Als de gebruiker is gekickt, verwijder de nickname en reload de pagina
                alert("Je bent gekickt!");
                document.cookie = "nickname=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                window.location.reload(); // Herlaad de pagina naar de nickname-input
            }
        })
        .catch(error => console.error("Fout bij het controleren van kick-status:", error));
}

// Controleer de kick-status elke 5 seconden
setInterval(checkKickStatus, 5000);

// Functie om de lijst van online gebruikers op te halen
function updateOnlineUsers() {
    fetch('/get_online_users')
        .then(response => response.json())
        .then(data => {
            const usersList = document.querySelector('.users-list');
            usersList.innerHTML = ''; // Maak de huidige lijst leeg

            // Voeg nieuwe gebruikers toe aan de lijst
            data.forEach(nickname => {
                const userItem = document.createElement('li');
                userItem.classList.add('bg-secondary', 'p-3', 'rounded-3', 'text-center', 'd-flex', 'align-items-center', 'justify-content-between');
                userItem.style.minWidth = '150px';
                
                const userSpan = document.createElement('span');
                userSpan.textContent = nickname.charAt(0).toUpperCase() + nickname.slice(1);
                
                const form = document.createElement('form');
                form.action = '/kick';
                form.method = 'POST';
                form.style.marginLeft = '10px';

                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = 'nickname';
                input.value = nickname;

                const button = document.createElement('button');
                button.type = 'submit';
                button.classList.add('btn', 'btn-danger', 'btn-sm');
                button.title = `Kick ${nickname}`;
                button.style.padding = '0 5px';
                button.textContent = 'X';

                form.appendChild(input);
                form.appendChild(button);
                userItem.appendChild(userSpan);
                userItem.appendChild(form);

                usersList.appendChild(userItem);
            });
        })
        .catch(error => console.error('Fout bij het ophalen van gebruikers:', error));
}

// Roep de functie aan om de lijst van gebruikers bij te werken
setInterval(updateOnlineUsers, 5000); // Update elke 5 seconden

// Initialiseer tooltips in je JavaScript
var tooltipTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
tooltipTriggerList.forEach(function (tooltipTriggerEl) {
  new bootstrap.Tooltip(tooltipTriggerEl)
})

