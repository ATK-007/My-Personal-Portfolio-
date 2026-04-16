/* ============================================================
   THREE.JS 3D SCENE — Cybersecurity Portfolio
   Hero: Wireframe icosahedron with orbiting particles
   Skills: 3D floating text nodes
   ============================================================ */

// ==================== HERO 3D SCENE ====================
(function initHero3D() {
  const container = document.getElementById('hero-3d-canvas');
  if (!container) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // ---- Main wireframe shield (Icosahedron) ----
  const shieldGeo = new THREE.IcosahedronGeometry(1.8, 1);
  const shieldMat = new THREE.MeshBasicMaterial({
    color: 0x00ffcc,
    wireframe: true,
    transparent: true,
    opacity: 0.25,
  });
  const shield = new THREE.Mesh(shieldGeo, shieldMat);
  scene.add(shield);

  // Inner glowing sphere
  const innerGeo = new THREE.SphereGeometry(1.1, 32, 32);
  const innerMat = new THREE.MeshBasicMaterial({
    color: 0x00ffcc,
    transparent: true,
    opacity: 0.04,
  });
  const innerSphere = new THREE.Mesh(innerGeo, innerMat);
  scene.add(innerSphere);

  // Second layer — dodecahedron
  const dodecaGeo = new THREE.DodecahedronGeometry(2.5, 0);
  const dodecaMat = new THREE.MeshBasicMaterial({
    color: 0x00ff41,
    wireframe: true,
    transparent: true,
    opacity: 0.08,
  });
  const dodeca = new THREE.Mesh(dodecaGeo, dodecaMat);
  scene.add(dodeca);

  // ---- Orbiting particles ----
  const particleCount = 200;
  const particlesGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    const radius = 2.5 + Math.random() * 3;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;

    positions[i * 3]     = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);

    // Cyan to green gradient
    const t = Math.random();
    colors[i * 3]     = t * 0;
    colors[i * 3 + 1] = 0.8 + t * 0.2;
    colors[i * 3 + 2] = (1 - t) * 0.8;
  }

  particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particlesGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const particlesMat = new THREE.PointsMaterial({
    size: 0.03,
    vertexColors: true,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
  });
  const particles = new THREE.Points(particlesGeo, particlesMat);
  scene.add(particles);

  // ---- Connection lines between particles ----
  const lineCount = 60;
  const lineGeo = new THREE.BufferGeometry();
  const linePositions = new Float32Array(lineCount * 6);

  for (let i = 0; i < lineCount; i++) {
    const idx1 = Math.floor(Math.random() * particleCount);
    const idx2 = Math.floor(Math.random() * particleCount);

    linePositions[i * 6]     = positions[idx1 * 3];
    linePositions[i * 6 + 1] = positions[idx1 * 3 + 1];
    linePositions[i * 6 + 2] = positions[idx1 * 3 + 2];
    linePositions[i * 6 + 3] = positions[idx2 * 3];
    linePositions[i * 6 + 4] = positions[idx2 * 3 + 1];
    linePositions[i * 6 + 5] = positions[idx2 * 3 + 2];
  }

  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
  const lineMat = new THREE.LineBasicMaterial({
    color: 0x00ffcc,
    transparent: true,
    opacity: 0.06,
    blending: THREE.AdditiveBlending,
  });
  const lines = new THREE.LineSegments(lineGeo, lineMat);
  scene.add(lines);

  // ---- Floating ring ----
  const ringGeo = new THREE.TorusGeometry(3.2, 0.015, 16, 100);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x00ffcc,
    transparent: true,
    opacity: 0.15,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 3;
  scene.add(ring);

  // Second ring
  const ring2 = new THREE.Mesh(
    new THREE.TorusGeometry(3.8, 0.01, 16, 100),
    new THREE.MeshBasicMaterial({ color: 0x00ff41, transparent: true, opacity: 0.08 })
  );
  ring2.rotation.x = -Math.PI / 4;
  ring2.rotation.y = Math.PI / 6;
  scene.add(ring2);

  // ---- Mouse interaction ----
  let mouseX = 0, mouseY = 0;
  let targetX = 0, targetY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = (e.clientY / window.innerHeight) * 2 - 1;
  });

  // ---- Animation loop ----
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    // Smooth mouse follow
    targetX += (mouseX * 0.3 - targetX) * 0.05;
    targetY += (mouseY * 0.3 - targetY) * 0.05;

    // Rotate shield
    shield.rotation.x = elapsed * 0.15 + targetY;
    shield.rotation.y = elapsed * 0.2 + targetX;

    // Rotate dodecahedron
    dodeca.rotation.x = -elapsed * 0.08 + targetY * 0.5;
    dodeca.rotation.y = -elapsed * 0.1 + targetX * 0.5;

    // Pulse inner sphere
    const scale = 1 + Math.sin(elapsed * 2) * 0.05;
    innerSphere.scale.set(scale, scale, scale);

    // Rotate particles
    particles.rotation.y = elapsed * 0.05;
    particles.rotation.x = elapsed * 0.02;

    // Rotate lines
    lines.rotation.y = elapsed * 0.05;
    lines.rotation.x = elapsed * 0.02;

    // Rotate rings
    ring.rotation.z = elapsed * 0.1;
    ring2.rotation.z = -elapsed * 0.08;

    renderer.render(scene, camera);
  }
  animate();

  // ---- Resize ----
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();

// ==================== SKILLS 3D CANVAS ====================
(function initSkills3D() {
  const container = document.getElementById('skills-3d-canvas');
  if (!container) return;

  const scene = new THREE.Scene();
  const w = container.clientWidth;
  const h = 300;
  const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
  camera.position.z = 8;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Skill nodes as small spheres orbiting
  const skills = [
    'Python', 'Bash', 'Nmap', 'Burp Suite', 'Metasploit',
    'AWS', 'Docker', 'Linux', 'Splunk', 'ELK',
    'OWASP', 'Grafana', 'SQLite', 'K8s', 'CEH',
  ];
  const nodes = [];
  const nodeMat = new THREE.MeshBasicMaterial({
    color: 0x00ffcc,
    transparent: true,
    opacity: 0.6,
  });

  skills.forEach((_, i) => {
    const geo = new THREE.SphereGeometry(0.12, 16, 16);
    const mesh = new THREE.Mesh(geo, nodeMat.clone());
    const angle = (i / skills.length) * Math.PI * 2;
    const radius = 3 + Math.random() * 2;
    const yOffset = (Math.random() - 0.5) * 3;

    mesh.userData = { angle, radius, yOffset, speed: 0.2 + Math.random() * 0.3 };
    scene.add(mesh);
    nodes.push(mesh);
  });

  // Connection lines between nearby nodes
  const linesMat = new THREE.LineBasicMaterial({
    color: 0x00ffcc,
    transparent: true,
    opacity: 0.08,
  });

  // Center glow
  const centerGeo = new THREE.SphereGeometry(0.5, 32, 32);
  const centerMat = new THREE.MeshBasicMaterial({
    color: 0x00ffcc,
    transparent: true,
    opacity: 0.1,
  });
  const center = new THREE.Mesh(centerGeo, centerMat);
  scene.add(center);

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    nodes.forEach((node) => {
      const { angle, radius, yOffset, speed } = node.userData;
      node.position.x = Math.cos(angle + t * speed) * radius;
      node.position.z = Math.sin(angle + t * speed) * radius;
      node.position.y = yOffset + Math.sin(t * speed * 2) * 0.5;

      // Pulse
      const s = 1 + Math.sin(t * 3 + angle) * 0.3;
      node.scale.set(s, s, s);
    });

    center.rotation.y = t * 0.2;
    const cs = 1 + Math.sin(t * 1.5) * 0.1;
    center.scale.set(cs, cs, cs);

    renderer.render(scene, camera);
  }
  animate();

  // Intersection observer to only animate when visible
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        // Could pause animation here for performance
      }
    });
  });
  observer.observe(container);

  window.addEventListener('resize', () => {
    const newW = container.clientWidth;
    camera.aspect = newW / h;
    camera.updateProjectionMatrix();
    renderer.setSize(newW, h);
  });
})();

// ==================== LOADING SCREEN ====================
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader) loader.classList.add('hidden');
  }, 3500);
});

// ==================== NAVIGATION ====================
(function initNav() {
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');

  // Scroll effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });

  // Mobile toggle
  if (toggle) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
    });
  }

  // Close mobile nav on link click
  document.querySelectorAll('.nav-links a').forEach((link) => {
    link.addEventListener('click', () => {
      links.classList.remove('open');
    });
  });

  // Active link highlighting
  const sections = document.querySelectorAll('.section, .hero');
  const navAnchors = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach((section) => {
      const top = section.offsetTop - 150;
      if (window.scrollY >= top) {
        current = section.getAttribute('id');
      }
    });
    navAnchors.forEach((a) => {
      a.classList.remove('active');
      if (a.getAttribute('href') === '#' + current) {
        a.classList.add('active');
      }
    });
  });
})();

// ==================== CUSTOM CURSOR ====================
(function initCursor() {
  const glow = document.getElementById('cursorGlow');
  if (!glow || window.innerWidth < 768) return;

  document.addEventListener('mousemove', (e) => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  });
})();

// ==================== SCROLL REVEAL ====================
(function initReveal() {
  const revealElements = document.querySelectorAll(
    '.skill-category, .project-card, .lab-card, .cert-card, .edu-card, .timeline-item, .about-terminal, .about-info-card, .contact-card-item, .certs-pursuing'
  );

  revealElements.forEach((el) => el.classList.add('reveal'));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );

  revealElements.forEach((el) => observer.observe(el));
})();

// ==================== STAT COUNTER ANIMATION ====================
(function initCounters() {
  const counters = document.querySelectorAll('.hero-stat-number');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseFloat(el.dataset.count);
          const isDecimal = target % 1 !== 0;
          const duration = 2000;
          const start = performance.now();

          function update(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
            const current = eased * target;
            el.textContent = isDecimal ? current.toFixed(2) : Math.floor(current);
            if (progress < 1) requestAnimationFrame(update);
            else el.textContent = isDecimal ? target.toFixed(2) : target;
          }

          requestAnimationFrame(update);
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((c) => observer.observe(c));
})();

// ==================== PROJECT CARD TILT ====================
(function initTilt() {
  if (window.innerWidth < 768) return;

  document.querySelectorAll('.project-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / centerY * -5;
      const rotateY = (x - centerX) / centerX * 5;

      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;

      // Move glow
      const glow = card.querySelector('.project-card-glow');
      if (glow) {
        glow.style.left = x - rect.width + 'px';
        glow.style.top = y - rect.height + 'px';
      }
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });

  });
})();



// ==================== CONTACT FORM ====================
(function initContactForm() {
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('contactSubmit');
    btn.disabled = true;
    btn.innerHTML = '<span class="btn-icon">⏳</span> Sending...';
    status.textContent = '';

    const formData = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      subject: form.subject.value.trim(),
      message: form.message.value.trim(),
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        status.className = 'form-status success';
        status.textContent = '✅ ' + data.message;
        form.reset();
      } else {
        throw new Error(data.error || 'Something went wrong');
      }
    } catch (err) {
      status.className = 'form-status error';
      status.textContent = '❌ ' + err.message;
    }

    btn.disabled = false;
    btn.innerHTML = '<span class="btn-icon">🚀</span> Send Message';
  });
})();

// ==================== VISITOR COUNTER ====================
(function initVisitors() {
  fetch('/api/visitors')
    .then((r) => r.json())
    .then((data) => {
      const el = document.getElementById('visitorCount');
      if (el) el.textContent = data.visitors;
    })
    .catch(() => {});
})();
