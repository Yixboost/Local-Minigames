function refreshChatBox() {
    var chatBox = document.querySelector('.chat-box');
    console.log("refreshing....")

    // Haal chatberichten op van de server
    fetch('/get_chat_messages')
        .then(response => response.json())
        .then(data => {
            // Maak de chatbox leeg voordat we nieuwe berichten toevoegen
            chatBox.innerHTML = '';

            // Voeg elk bericht toe aan de chatbox
            data.forEach(message => {
                var messageElement = document.createElement('p');
                messageElement.textContent = message.user + ': ' + message.message;
                chatBox.appendChild(messageElement);
            });

            // Scroll automatisch naar beneden wanneer nieuwe berichten zijn toegevoegd
            chatBox.scrollTop = chatBox.scrollHeight;
        })
        .catch(error => console.error('Fout bij het ophalen van berichten:', error));
}

setInterval(refreshChatBox, 500);