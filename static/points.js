
function getCookie(name) {
    // Zoek naar cookie
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop().split(';').shift(); // Return waarde cookie
    }
    return null; // Cookie niet gevonden
  }
  
  function increaseScore(points) {
    const nickname = getCookie("nickname");
  
    fetch('/increase_point', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nickname: nickname,
        points: points
      })
    })
    .then(response => {
      console.log("Ruwe respons:", response); // Log de respons
      return response.text(); // Eerst als tekst uitlezen
    })
    .then(text => {
      console.log("Respons als tekst:", text); // Bekijk de respons
      return JSON.parse(text); // Probeer het daarna te parsen
    })
    .then(data => {
      alert(`Score van ${data.nickname} is nu: ${data.new_score}`);
    })
    .catch(error => {
      alert(`Fout: ${error.message}`);
      console.error("Details:", error);
    });
  }