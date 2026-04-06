require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// --------------- Middleware ---------------
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Helmet with relaxed CSP so CDN scripts (Three.js, GSAP, fonts) work
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          "https://cdnjs.cloudflare.com",
          "https://cdn.jsdelivr.net",
          "https://unpkg.com",
        ],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "blob:"],
        connectSrc: ["'self'"],
      },
    },
  })
);

// Rate limiter for API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20,
  message: { error: 'Too many requests. Please try again later.' },
});

// --------------- Data files ---------------
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');
const VISITORS_FILE = path.join(DATA_DIR, 'visitors.json');

function readJSON(file, fallback) {
  try {
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (_) {}
  return fallback;
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

// --------------- Static files ---------------
app.use(express.static(path.join(__dirname, 'public')));

// --------------- API Routes ---------------

// Visitor counter
app.get('/api/visitors', (req, res) => {
  const data = readJSON(VISITORS_FILE, { count: 0 });
  data.count += 1;
  writeJSON(VISITORS_FILE, data);
  res.json({ visitors: data.count });
});

// Contact form
app.post('/api/contact', apiLimiter, async (req, res) => {
  const { name, email, subject, message } = req.body;

  // Validation
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }

  // Store message locally
  const messages = readJSON(MESSAGES_FILE, []);
  const entry = {
    id: Date.now(),
    name,
    email,
    subject: subject || '(no subject)',
    message,
    date: new Date().toISOString(),
    read: false,
  };
  messages.push(entry);
  writeJSON(MESSAGES_FILE, messages);

  // Optionally send email notification
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS && process.env.EMAIL_PASS !== 'your_gmail_app_password_here') {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        subject: `Portfolio Contact: ${subject || 'New Message'} from ${name}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject || 'N/A'}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
          <hr>
          <small>Sent from your portfolio at ${new Date().toLocaleString()}</small>
        `,
      });
    } catch (emailErr) {
      console.error('Email send failed:', emailErr.message);
      // message is still saved, so don't fail the request
    }
  }

  res.json({ success: true, message: 'Message received! I\'ll get back to you soon.' });
});

// Get all messages (simple admin — protect in production)
app.get('/api/messages', (req, res) => {
  const messages = readJSON(MESSAGES_FILE, []);
  res.json(messages);
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --------------- Start ---------------
app.listen(PORT, () => {
  console.log(`\n⚡ Portfolio server running at http://localhost:${PORT}`);
  console.log(`🔒 Cybersecurity Portfolio — Atmakuri Ashish\n`);
});
