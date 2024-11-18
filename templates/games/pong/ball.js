function Ball() {
  Entity.call(this)
  
  this.width = 20
  this.height = 20

  this.reset()

  // Load sound
  this.blip = new Audio()
  if (this.blip.canPlayType('audio/mpeg')) {
    this.blip.src = 'blip.mp3'
  } else {
    this.blip.src = 'blip.ogg'
  }
}

Ball.prototype = Object.create(Entity.prototype)
Ball.prototype.constructor = Ball

// Reset the ball's position
Ball.prototype.reset = function() {
  this.x = game.width / 2 - this.width / 2
  this.y = game.height / 2 - this.height / 2

  var minAngle = -30,
      maxAngle = 30,
      angle = Math.floor(Math.random() * (maxAngle - minAngle + 1)) + minAngle

  var radian = Math.PI / 180,
      speed = 7
  this.xVelocity = speed * Math.cos(angle * radian)
  this.yVelocity = speed * Math.sin(angle * radian)

  // Alternate right and left
  if (Math.random() > 0.5) this.xVelocity *= -1
}

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

Ball.prototype.update = function() {
  Entity.prototype.update.apply(this, arguments)

  // Detects if and which paddle we hit
  if (this.intersect(game.player)) {
    var hitter = game.player
  } else if (this.intersect(game.bot)) {
    var hitter = game.bot
  }

  // Hits a paddle.
  if (hitter) {
    this.xVelocity *= -1
    this.yVelocity *= 1

    // Transfer some of the paddle vertical velocity to the ball
    this.yVelocity += hitter.yVelocity / 4

    this.blip.play()
  }

  // Rebound if it hits top or bottom
  if (this.y < 0 || this.y + this.height > game.height) {
    this.yVelocity *= -1 // rebound, switch direction
    this.blip.play()
  }

  // Off screen on left. Bot wins.
  if (this.x < -this.width) {
    game.bot.score += 1
    this.reset()
  }

  // Off screen on right. Player wins.
  if (this.x > game.width) {
    game.player.score += 1
    increaseScore(1)
    this.reset()
  }
}