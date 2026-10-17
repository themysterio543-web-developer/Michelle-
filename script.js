// Birthday card interactive script (confetti + hearts + improved controls)
(function () {
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    let particles = [];
    const gravity = 0.25;

    function random(min, max) { return Math.random() * (max - min) + min; }

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resize);

    class Particle {
        constructor(x, y, color, size, vx, vy, life, shape = 'rect') {
            this.x = x; this.y = y; this.color = color; this.size = size;
            this.vx = vx; this.vy = vy; this.life = life; this.age = 0; this.shape = shape;
        }

        update() {
            this.vy += gravity * (this.shape === 'heart' ? 0.6 : 1);
            this.x += this.vx; this.y += this.vy; this.age++;
        }

        draw(ctx) {
            ctx.save();
            ctx.translate(this.x, this.y);
            const t = this.age / this.life;
            ctx.globalAlpha = 1 - t;
            if (this.shape === 'rect') {
                ctx.fillStyle = this.color;
                ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
            } else if (this.shape === 'circle') {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
                ctx.fill();
            } else if (this.shape === 'heart') {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                const s = this.size / 12;
                ctx.moveTo(0, -4 * s);
                ctx.bezierCurveTo(6 * s, -12 * s, 18 * s, -2 * s, 0, 10 * s);
                ctx.bezierCurveTo(-18 * s, -2 * s, -6 * s, -12 * s, 0, -4 * s);
                ctx.fill();
            }
            ctx.restore();
        }

        isDead() { return this.age >= this.life; }
    }

    function addBurst(x, y, count = 30) {
        for (let i = 0; i < count; i++) {
            const angle = random(0, Math.PI * 2);
            const speed = random(2, 8);
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed * -1.0;
            const size = Math.floor(random(6, 14));
            const color = `hsl(${Math.floor(random(0, 360))}deg ${Math.floor(random(60, 100))}% ${Math.floor(random(50, 70))}%`;
            const shape = Math.random() < 0.18 ? 'heart' : (Math.random() < 0.5 ? 'circle' : 'rect');
            particles.push(new Particle(x, y, color, size, vx, vy, Math.floor(random(60, 140)), shape));
        }
    }

    function update() {
        ctx.clearRect(0, 0, width, height);
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.update();
            p.draw(ctx);
            if (p.isDead() || p.y > height + 50) particles.splice(i, 1);
        }
        requestAnimationFrame(update);
    }

    update();

    // Click to burst
    window.addEventListener('click', (e) => {
        addBurst(e.clientX, e.clientY, 28);
    });

    // Secret keyboard: press 'M' to play/pause audio
    const audio = document.getElementById('birthday-audio');
    window.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 'm') {
            if (audio.paused) audio.play(); else audio.pause();
        }
    });

    // Music toggle button: play / pause with friendly text and toast feedback
    const musicToggle = document.querySelector('.music-toggle');
    function showToast(msg) {
        const t = document.createElement('div');
        t.className = 'small-toast';
        t.textContent = msg;
        Object.assign(t.style, {
            position: 'fixed',
            left: '50%',
            bottom: '110px',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '8px',
            zIndex: 60,
            fontSize: '14px'
        });
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 2000);
    }

    if (musicToggle && audio) {
        const updateMusicUI = () => {
            if (audio.paused) {
                musicToggle.textContent = '🎉🎉 Celebrate Michelle';
                musicToggle.classList.remove('playing');
                musicToggle.setAttribute('aria-pressed', 'false');
            } else {
                musicToggle.textContent = '❚❚ Pause Birthday Vibes';
                musicToggle.classList.add('playing');
                musicToggle.setAttribute('aria-pressed', 'true');
            }
        };

        // initialize UI
        updateMusicUI();

        musicToggle.addEventListener('click', async () => {
            try {
                if (audio.paused) {
                    await audio.play();
                    updateMusicUI();
                } else {
                    audio.pause();
                    updateMusicUI();
                }
            } catch (err) {
                // Most browsers block autoplay without a user gesture — show guidance
                showToast('Click the button again to allow audio playback');
            }
        });

        audio.addEventListener('play', updateMusicUI);
        audio.addEventListener('pause', updateMusicUI);
    }

    // Confetti toggle button
    const confettiToggle = document.querySelector('.confetti-toggle');
    let confettiOn = false;
    let confettiInterval = null;

    confettiToggle.addEventListener('click', () => {
        confettiOn = !confettiOn;
        confettiToggle.textContent = confettiOn ? '🛑 Stop Confetti' : '🎊 Confetti';
        if (confettiOn) {
            confettiInterval = setInterval(() => addBurst(random(50, width - 50), random(50, height / 2), Math.floor(random(18, 36))), 700);
        } else {
            clearInterval(confettiInterval);
        }
    });

    // Small helper to create a gentle heart rain
    function heartRain() {
        for (let i = 0; i < 8; i++) {
            const x = random(30, width - 30);
            const y = -20;
            const vx = random(-0.7, 0.7);
            const vy = random(1, 2.5);
            const size = random(10, 22);
            const color = `hsl(${Math.floor(random(300, 360))}deg ${Math.floor(random(60, 100))}% ${Math.floor(random(50, 70))}%`;
            particles.push(new Particle(x, y, color, size, vx, vy, Math.floor(random(120, 220)), 'heart'));
        }
    }

    // Add a small heart rain every few seconds
    setInterval(heartRain, 3500);

    // Initial gentle burst
    addBurst(width / 2, height / 2 - 80, 32);

    // Secret button: show name burst and multiple confetti bursts
    const secretButton = document.querySelector('.secret-button');
    if (secretButton) {
        secretButton.addEventListener('click', () => {
            const burst = document.createElement('div');
            burst.className = 'name-burst';
            burst.textContent = 'Happy Birthday, Michelle!';
            document.body.appendChild(burst);

            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            for (let i = 0; i < 5; i++) {
                setTimeout(() => addBurst(random(centerX - 60, centerX + 60), random(centerY - 60, centerY + 60), Math.floor(random(18, 36))), i * 120);
            }

            setTimeout(() => {
                burst.remove();
            }, 1800);
        });
    }

})();
