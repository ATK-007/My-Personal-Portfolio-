/* ============================================================
   MATRIX RAIN — Canvas-based digital rain effect
   ============================================================ */

(function initMatrixRain() {
  const canvas = document.getElementById('matrix-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  let width, height, columns, drops;

  const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF{}[]<>/\\|';
  const charArray = chars.split('');
  const fontSize = 14;

  function init() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    columns = Math.floor(width / fontSize);
    drops = new Array(columns).fill(1);

    // Randomize initial positions
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.floor(Math.random() * -50);
    }
  }

  init();

  function draw() {
    // Fade effect
    ctx.fillStyle = 'rgba(10, 10, 15, 0.05)';
    ctx.fillRect(0, 0, width, height);

    ctx.font = fontSize + 'px JetBrains Mono, monospace';

    for (let i = 0; i < drops.length; i++) {
      // Random character
      const char = charArray[Math.floor(Math.random() * charArray.length)];

      // Alternate between cyan and green
      const isCyan = Math.random() > 0.5;
      ctx.fillStyle = isCyan ? 'rgba(0, 255, 204, 0.8)' : 'rgba(0, 255, 65, 0.7)';

      // Bright head character
      if (Math.random() > 0.98) {
        ctx.fillStyle = '#ffffff';
      }

      ctx.fillText(char, i * fontSize, drops[i] * fontSize);

      // Reset drop after it goes below canvas
      if (drops[i] * fontSize > height && Math.random() > 0.975) {
        drops[i] = 0;
      }

      drops[i]++;
    }
  }

  setInterval(draw, 50);

  window.addEventListener('resize', () => {
    init();
  });
})();

/* ============================================================
   FLOATING PARTICLES — Background particle network
   ============================================================ */

(function initFloatingParticles() {
  // This runs as part of the Three.js hero scene
  // Additional standalone particle effects can be added here

  // Small CSS-based floating particles
  const particleContainer = document.createElement('div');
  particleContainer.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    overflow: hidden;
  `;
  document.body.appendChild(particleContainer);

  const particleCount = 30;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    const size = Math.random() * 3 + 1;
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const duration = 15 + Math.random() * 25;
    const delay = Math.random() * -20;
    const opacity = 0.1 + Math.random() * 0.2;

    particle.style.cssText = `
      position: absolute;
      left: ${x}%;
      top: ${y}%;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: ${Math.random() > 0.5 ? '#00ffcc' : '#00ff41'};
      opacity: ${opacity};
      animation: floatParticle ${duration}s ${delay}s infinite linear;
    `;

    particleContainer.appendChild(particle);
  }

  // Inject the animation keyframes
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes floatParticle {
      0% {
        transform: translate(0, 0) scale(1);
        opacity: 0;
      }
      10% {
        opacity: 0.15;
      }
      50% {
        transform: translate(${Math.random() > 0.5 ? '' : '-'}30px, -80px) scale(1.2);
        opacity: 0.25;
      }
      90% {
        opacity: 0.1;
      }
      100% {
        transform: translate(${Math.random() > 0.5 ? '' : '-'}60px, -160px) scale(0.8);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(styleSheet);
})();
