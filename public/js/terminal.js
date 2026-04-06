/* ============================================================
   TERMINAL TYPING EFFECT — Rotating phrases in hero
   ============================================================ */

(function initTerminalTyping() {
  const el = document.getElementById('typingText');
  if (!el) return;

  const phrases = [
    'Security Analyst — SOC Monitoring & Threat Detection',
    'SOC Analyst — SIEM Alert Triage & Incident Response',
    'Penetration Tester — Web App & Network Security',
    'Vulnerability Analyst — CVSS Scoring & Remediation',
    'Incident Responder — NIST Framework & Forensics',
    'CEH & CCNA Certified Professional',
    'Python & Bash Security Automation Scripts',
    'Wireshark, Splunk, Nmap, Metasploit, Burp Suite',
    'MITRE ATT&CK | OWASP Top 10 | Threat Hunting',
    'Active TryHackMe & HackTheBox Practitioner',
  ];

  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let isPaused = false;

  const typeSpeed = 50;
  const deleteSpeed = 30;
  const pauseTime = 2000;

  function type() {
    const current = phrases[phraseIndex];

    if (isPaused) {
      setTimeout(() => {
        isPaused = false;
        isDeleting = true;
        type();
      }, pauseTime);
      return;
    }

    if (!isDeleting) {
      // Typing
      el.textContent = current.substring(0, charIndex + 1);
      charIndex++;

      if (charIndex === current.length) {
        isPaused = true;
        type();
        return;
      }

      setTimeout(type, typeSpeed + Math.random() * 40);
    } else {
      // Deleting
      el.textContent = current.substring(0, charIndex);
      charIndex--;

      if (charIndex < 0) {
        isDeleting = false;
        charIndex = 0;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        setTimeout(type, 500);
        return;
      }

      setTimeout(type, deleteSpeed);
    }
  }

  // Start after loading screen
  setTimeout(type, 4000);
})();
