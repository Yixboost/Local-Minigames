$(document).ready(function () {
    const container = $('#scoreboard-container');
    const itemHeight = 80;

    function updateScoreboard() {
        $.ajax({
            url: '/get_points_data',
            type: 'GET',
            success: function (data) {
                const sortedScores = Object.entries(data).sort((a, b) => b[1] - a[1]);
                const positions = {};

                sortedScores.forEach(([nickname, points], index) => {
                    positions[nickname] = index * itemHeight;
                });

                sortedScores.forEach(([nickname, points]) => {
                    let item = $(`.score-item[data-nickname="${nickname}"]`);
                    if (!item.length) {
                        item = $(`
                    <div class="score-item bg-primary text-white" data-nickname="${nickname}">
                        <span class="nickname">✨ ${nickname}</span>
                        <span class="points">${points}</span>
                    </div>
                `);
                        container.append(item);
                    }

                    item.find('.points').text(points);

                    const newPosition = positions[nickname];
                    const oldPosition = parseInt(item.attr('data-position')) || 0;

                    if (newPosition !== oldPosition) {
                        item.attr('data-moving', true); 
                        item.css('transform', `translateY(${newPosition}px)`);
                        item.attr('data-position', newPosition);

                        setTimeout(() => {
                            item.css('z-index', 1);
                            item.attr('data-moving', false); 
                        }, 800);
                    }
                });

                $('.score-item').each(function () {
                    const nickname = $(this).data('nickname');
                    if (!data.hasOwnProperty(nickname)) {
                        $(this).remove();
                    }
                });
            },
            error: function (xhr) {
                console.error('Fout bij het ophalen van punten:', xhr.responseJSON?.error || xhr.statusText);
            }
        });
    }

    updateScoreboard();
    setInterval(updateScoreboard, 5000);

    $('#addPointsForm').on('submit', function (event) {
        event.preventDefault();

        const nickname = $('#nickname').val();
        const points = parseInt($('#points').val());

        $.ajax({
            url: '/give_points',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ nickname, points }),
            success: function () {
                $('#addPointsModal').modal('hide');
                updateScoreboard();
            },
            error: function (xhr) {
                alert(`Fout: ${xhr.responseJSON.error}`);
            }
        });
    });
});


function createSparkle(element) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    const x = Math.random() * element.offsetWidth;
    const y = Math.random() * element.offsetHeight;

    sparkle.style.left = x + 'px';
    sparkle.style.top = y + 'px';

    element.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 1500);
}

if (index < 3) {
    setInterval(() => {
        createSparkle(item[0]);
    }, 300);
}