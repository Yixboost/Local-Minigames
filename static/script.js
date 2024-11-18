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