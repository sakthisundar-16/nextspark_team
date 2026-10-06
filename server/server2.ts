import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import db2, { initNextSparkDB } from './db2.js';
import { seedNextSpark } from './seed2.js';

dotenv.config();

const app2 = express();
const PORT2 = process.env.PORT2 || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'nextspark-secret-key-2026';

app2.use(cors());
app2.use(express.json());

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app2.use('/uploads', express.static(uploadsDir));

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${uuidv4().substring(0, 8)}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

initNextSparkDB();
seedNextSpark();

// ─── Auth Middleware ────────────────────────────────────────────────────
interface AuthReq extends Request { user?: any; }

const auth = (req: AuthReq, res: Response, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const requireRole = (...roles: string[]) => (req: AuthReq, res: Response, next: any) => {
  if (!roles.includes(req.user?.role)) return res.status(403).json({ error: 'Access denied' });
  next();
};

// ─── AUTH ───────────────────────────────────────────────────────────────
app2.post('/api2/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user: any = db2.prepare(`
    SELECT u.*, c.name as college_name, c.code as college_code
    FROM ns_users u LEFT JOIN ns_colleges c ON u.college_id = c.id
    WHERE u.email = ?
  `).get(email);

  if (!user) return res.status(401).json({ error: 'No account found with this email' });
  if (!bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Incorrect password' });

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name, college_id: user.college_id },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  const { password: _, ...userOut } = user;
  res.json({ token, user: userOut });
});

app2.get('/api2/auth/demo-users', (_req, res) => {
  const users = db2.prepare(`
    SELECT u.id, u.name, u.email, u.role, u.department, u.reg_number, u.avatar_color,
           c.name as college_name, c.code as college_code
    FROM ns_users u LEFT JOIN ns_colleges c ON u.college_id = c.id
    ORDER BY u.role, u.name
  `).all();
  res.json(users);
});

app2.get('/api2/auth/me', auth, (req: AuthReq, res) => {
  const user = db2.prepare(`
    SELECT u.*, c.name as college_name, c.code as college_code
    FROM ns_users u LEFT JOIN ns_colleges c ON u.college_id = c.id WHERE u.id = ?
  `).get(req.user.id);
  res.json(user);
});

// ─── COLLEGES ───────────────────────────────────────────────────────────
app2.get('/api2/colleges', (_req, res) => {
  res.json(db2.prepare('SELECT * FROM ns_colleges ORDER BY name').all());
});

app2.post('/api2/colleges', auth, requireRole('admin'), (req: AuthReq, res) => {
  const { name, code, location, website } = req.body;
  if (!name || !code) return res.status(400).json({ error: 'Name and code required' });
  const id = `clg-${uuidv4().substring(0, 8)}`;
  db2.prepare('INSERT INTO ns_colleges (id, name, code, location, website) VALUES (?,?,?,?,?)').run(id, name, code.toUpperCase(), location, website);
  res.status(201).json({ id, message: 'College added' });
});

// ─── USERS (Admin manage) ───────────────────────────────────────────────
app2.get('/api2/users', auth, requireRole('admin'), (_req, res) => {
  const users = db2.prepare(`
    SELECT u.id, u.name, u.email, u.role, u.department, u.reg_number, u.phone, u.avatar_color, u.created_at,
           c.name as college_name, c.code as college_code
    FROM ns_users u LEFT JOIN ns_colleges c ON u.college_id = c.id ORDER BY u.role, u.name
  `).all();
  res.json(users);
});

app2.post('/api2/users', auth, requireRole('admin'), (req: AuthReq, res) => {
  const { name, email, password, role, college_id, department, reg_number, phone } = req.body;
  if (!name || !email || !password || !role) return res.status(400).json({ error: 'Required fields missing' });
  const hashed = bcrypt.hashSync(password, 10);
  const id = `u-${uuidv4().substring(0, 8)}`;
  const colors: Record<string, string> = {
    admin: '#ef4444', committee_head: '#8b5cf6', jury: '#f59e0b', student: '#6366f1'
  };
  db2.prepare('INSERT INTO ns_users (id, name, email, password, role, college_id, department, reg_number, phone, avatar_color) VALUES (?,?,?,?,?,?,?,?,?,?)').run(
    id, name, email, hashed, role, college_id, department, reg_number, phone, colors[role] || '#6366f1'
  );
  res.status(201).json({ id, message: 'User created' });
});

// ─── EVENTS ─────────────────────────────────────────────────────────────
app2.get('/api2/events', (req, res) => {
  const { status, category, college_id } = req.query;
  let query = `
    SELECT e.*, c.name as college_name, c.code as college_code,
           u.name as created_by_name,
           (SELECT count(*) FROM ns_registrations r WHERE r.event_id = e.id) as registration_count,
           (SELECT count(*) FROM ns_jury_assignments j WHERE j.event_id = e.id) as jury_count
    FROM ns_events e
    LEFT JOIN ns_colleges c ON e.college_id = c.id
    LEFT JOIN ns_users u ON e.created_by = u.id
    WHERE 1=1
  `;
  const params: any[] = [];
  if (status) { query += ' AND e.status = ?'; params.push(status); }
  if (category) { query += ' AND e.category = ?'; params.push(category); }
  if (college_id) { query += ' AND e.college_id = ?'; params.push(college_id); }
  query += ' ORDER BY e.created_at DESC';
  res.json(db2.prepare(query).all(...params));
});

app2.get('/api2/events/:id', (req, res) => {
  const event: any = db2.prepare(`
    SELECT e.*, c.name as college_name, c.code as college_code,
           u.name as created_by_name, u.email as created_by_email,
           (SELECT count(*) FROM ns_registrations r WHERE r.event_id = e.id) as registration_count
    FROM ns_events e
    LEFT JOIN ns_colleges c ON e.college_id = c.id
    LEFT JOIN ns_users u ON e.created_by = u.id
    WHERE e.id = ?
  `).get(req.params.id);

  if (!event) return res.status(404).json({ error: 'Event not found' });

  const updates = db2.prepare(`
    SELECT upd.*, u.name as posted_by_name, u.role as posted_by_role
    FROM ns_event_updates upd JOIN ns_users u ON upd.posted_by = u.id
    WHERE upd.event_id = ? ORDER BY upd.is_pinned DESC, upd.created_at DESC
  `).all(req.params.id);

  const jury = db2.prepare(`
    SELECT ja.*, u.name as jury_name, u.email as jury_email, u.department,
           c.name as college_name
    FROM ns_jury_assignments ja JOIN ns_users u ON ja.jury_id = u.id
    LEFT JOIN ns_colleges c ON u.college_id = c.id
    WHERE ja.event_id = ?
  `).all(req.params.id);

  const results = db2.prepare(`
    SELECT res.*, r.team_name, r.project_title,
           u.name as student_name, u.reg_number, col.name as college_name
    FROM ns_results res
    JOIN ns_registrations r ON res.registration_id = r.id
    JOIN ns_users u ON r.student_id = u.id
    LEFT JOIN ns_colleges col ON u.college_id = col.id
    WHERE res.event_id = ? AND res.published = 1
    ORDER BY res.rank ASC NULLS LAST, res.avg_score DESC
  `).all(req.params.id);

  res.json({ ...event, updates, jury, results });
});

app2.post('/api2/events', auth, requireRole('admin', 'committee_head'), (req: AuthReq, res) => {
  const {
    title, description, category, event_type, college_id,
    start_date, end_date, registration_deadline, venue, mode,
    max_participants, team_size_min, team_size_max,
    prize_pool, first_prize, second_prize, third_prize,
    banner_gradient, scoring_criteria, rules, contact_email, contact_phone, website,
    image_url, gallery_images
  } = req.body;

  if (!title || !start_date || !venue) return res.status(400).json({ error: 'Title, start date, and venue required' });

  const id = `evt-${uuidv4().substring(0, 8)}`;
  const clgId = college_id || req.user.college_id;

  db2.prepare(`
    INSERT INTO ns_events (
      id, title, description, category, event_type, college_id, created_by,
      start_date, end_date, registration_deadline, venue, mode, max_participants,
      team_size_min, team_size_max, prize_pool, first_prize, second_prize, third_prize,
      banner_gradient, status, scoring_criteria, rules, contact_email, contact_phone, website,
      image_url, gallery_images
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'Open',?,?,?,?,?,?,?)
  `).run(
    id, title, description, category || 'Technical', event_type || 'Competition',
    clgId, req.user.id, start_date, end_date || start_date,
    registration_deadline || start_date, venue, mode || 'Offline',
    max_participants || 100, team_size_min || 1, team_size_max || 4,
    prize_pool, first_prize, second_prize, third_prize,
    banner_gradient || 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    scoring_criteria ? JSON.stringify(scoring_criteria) : null,
    rules, contact_email, contact_phone, website,
    image_url || null,
    gallery_images ? JSON.stringify(gallery_images) : null
  );

  // Notify all students
  const students = db2.prepare("SELECT id FROM ns_users WHERE role = 'student'").all() as any[];
  const nStmt = db2.prepare('INSERT INTO ns_notifications (id, user_id, title, message, type, link) VALUES (?,?,?,?,?,?)');
  students.forEach(s => {
    nStmt.run(uuidv4(), s.id, `🆕 New Event: ${title}`, `A new event has been posted. Check it out and register!`, 'info', `/events/${id}`);
  });

  res.status(201).json({ id, message: 'Event created successfully' });
});

app2.patch('/api2/events/:id', auth, requireRole('admin', 'committee_head'), (req: AuthReq, res) => {
  const event: any = db2.prepare('SELECT * FROM ns_events WHERE id = ?').get(req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  // STRICT ACCESS CONTROL: Only the creator (or super admin) can manage this event!
  if (req.user.role === 'committee_head' && event.created_by !== req.user.id) {
    return res.status(403).json({ error: 'Access denied: You can only manage events created by you.' });
  }

  const { status, title, description, registration_deadline, venue, mode, scoring_criteria, rules, certificate_template, image_url, gallery_images } = req.body;
  const fields: string[] = [];
  const vals: any[] = [];

  if (status) { fields.push('status = ?'); vals.push(status); }
  if (title) { fields.push('title = ?'); vals.push(title); }
  if (description !== undefined) { fields.push('description = ?'); vals.push(description); }
  if (venue) { fields.push('venue = ?'); vals.push(venue); }
  if (mode) { fields.push('mode = ?'); vals.push(mode); }
  if (registration_deadline) { fields.push('registration_deadline = ?'); vals.push(registration_deadline); }
  if (scoring_criteria) { fields.push('scoring_criteria = ?'); vals.push(typeof scoring_criteria === 'string' ? scoring_criteria : JSON.stringify(scoring_criteria)); }
  if (rules) { fields.push('rules = ?'); vals.push(rules); }
  if (certificate_template !== undefined) { fields.push('certificate_template = ?'); vals.push(typeof certificate_template === 'string' ? certificate_template : JSON.stringify(certificate_template)); }
  if (image_url !== undefined) { fields.push('image_url = ?'); vals.push(image_url); }
  if (gallery_images !== undefined) { fields.push('gallery_images = ?'); vals.push(typeof gallery_images === 'string' ? gallery_images : JSON.stringify(gallery_images)); }

  if (!fields.length) return res.status(400).json({ error: 'Nothing to update' });
  fields.push('updated_at = CURRENT_TIMESTAMP');
  vals.push(req.params.id);

  db2.prepare(`UPDATE ns_events SET ${fields.join(', ')} WHERE id = ?`).run(...vals);

  // If status is updated to 'Ongoing' or 'Completed', broadcast to registered students
  if (status && status !== event.status) {
    const registeredStudents = db2.prepare('SELECT DISTINCT student_id FROM ns_registrations WHERE event_id = ?').all(req.params.id) as any[];
    const nStmt = db2.prepare('INSERT INTO ns_notifications (id, user_id, title, message, type, link) VALUES (?,?,?,?,?,?)');
    const msg = status === 'Ongoing'
      ? `Event "${event.title}" is now LIVE! Competition has commenced.`
      : status === 'Completed'
      ? `Event "${event.title}" has concluded.`
      : `Event "${event.title}" status changed to ${status}.`;
    registeredStudents.forEach(s => {
      nStmt.run(uuidv4(), s.student_id, `⚡ Event Status: ${status}`, msg, 'info', `/events/${req.params.id}`);
    });
  }

  res.json({ success: true, message: 'Event updated successfully' });
});

// Update single participant score & merit rank by Event Coordinator (no jury needed)
app2.post('/api2/events/:id/update-score', auth, requireRole('admin', 'committee_head'), (req: AuthReq, res) => {
  const eventId = req.params.id;
  const event: any = db2.prepare('SELECT * FROM ns_events WHERE id = ?').get(eventId);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  // Ownership check
  if (req.user.role === 'committee_head' && event.created_by !== req.user.id) {
    return res.status(403).json({ error: 'Access denied: You can only score your own event.' });
  }

  const { registration_id, score, max_score, remarks, position } = req.body;
  if (!registration_id) return res.status(400).json({ error: 'Registration ID required' });

  const total = Number(score) || 0;
  const max = Number(max_score) || 100;

  // Insert or update score by coordinator
  const existingScore = db2.prepare('SELECT id FROM ns_scores WHERE registration_id = ? AND jury_id = ?').get(registration_id, req.user.id);
  if (existingScore) {
    db2.prepare(`
      UPDATE ns_scores SET total_score = ?, max_possible = ?, remarks = ?, submitted_at = CURRENT_TIMESTAMP
      WHERE registration_id = ? AND jury_id = ?
    `).run(total, max, remarks || '', registration_id, req.user.id);
  } else {
    db2.prepare(`
      INSERT INTO ns_scores (id, event_id, registration_id, jury_id, criteria_scores, total_score, max_possible, remarks)
      VALUES (?,?,?,?,?,?,?,?)
    `).run(`sc-${uuidv4().substring(0, 8)}`, eventId, registration_id, req.user.id, JSON.stringify([{ criterion: 'Evaluation', score: total, max_points: max }]), total, max, remarks || '');
  }

  // Update registration record status if position provided
  if (position) {
    db2.prepare('UPDATE ns_registrations SET status = ? WHERE id = ?').run(position === 'Winner' ? 'Selected' : 'Shortlisted', registration_id);
  }

  res.json({ success: true, message: 'Score updated successfully', total_score: total });
});

// ─── EVENT UPDATES / ANNOUNCEMENTS ─────────────────────────────────────
app2.get('/api2/events/:id/updates', (_req, res) => {
  const updates = db2.prepare(`
    SELECT upd.*, u.name as posted_by_name, u.role as posted_by_role, u.avatar_color
    FROM ns_event_updates upd JOIN ns_users u ON upd.posted_by = u.id
    WHERE upd.event_id = ? ORDER BY upd.is_pinned DESC, upd.created_at DESC
  `).all(_req.params.id);
  res.json(updates);
});

app2.post('/api2/events/:id/updates', auth, requireRole('admin', 'committee_head'), (req: AuthReq, res) => {
  const { title, content, update_type, is_pinned } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'Title and content required' });

  const id = `upd-${uuidv4().substring(0, 8)}`;
  db2.prepare('INSERT INTO ns_event_updates (id, event_id, posted_by, title, content, update_type, is_pinned) VALUES (?,?,?,?,?,?,?)').run(
    id, req.params.id, req.user.id, title, content, update_type || 'Info', is_pinned ? 1 : 0
  );

  // Notify registered students
  const registeredStudents = db2.prepare(`
    SELECT DISTINCT r.student_id FROM ns_registrations r WHERE r.event_id = ?
  `).all(req.params.id) as any[];
  const event: any = db2.prepare('SELECT title FROM ns_events WHERE id = ?').get(req.params.id);
  const nStmt = db2.prepare('INSERT INTO ns_notifications (id, user_id, title, message, type, link) VALUES (?,?,?,?,?,?)');
  registeredStudents.forEach(s => {
    nStmt.run(uuidv4(), s.student_id, `📢 Update: ${event?.title}`, title, 'info', `/events/${req.params.id}`);
  });

  res.status(201).json({ id, message: 'Update posted' });
});

app2.delete('/api2/events/:eventId/updates/:updateId', auth, requireRole('admin', 'committee_head'), (_req, res) => {
  db2.prepare('DELETE FROM ns_event_updates WHERE id = ? AND event_id = ?').run(_req.params.updateId, _req.params.eventId);
  res.json({ success: true });
});

// ─── JURY ASSIGNMENT ────────────────────────────────────────────────────
app2.get('/api2/events/:id/jury', auth, (req: AuthReq, res) => {
  const jury = db2.prepare(`
    SELECT ja.*, u.name, u.email, u.department, u.avatar_color, c.name as college_name
    FROM ns_jury_assignments ja JOIN ns_users u ON ja.jury_id = u.id
    LEFT JOIN ns_colleges c ON u.college_id = c.id
    WHERE ja.event_id = ?
  `).all(req.params.id);
  res.json(jury);
});

app2.post('/api2/events/:id/jury', auth, requireRole('admin', 'committee_head'), (req: AuthReq, res) => {
  const { jury_id, domain } = req.body;
  if (!jury_id) return res.status(400).json({ error: 'jury_id required' });

  const id = `ja-${uuidv4().substring(0, 8)}`;
  try {
    db2.prepare('INSERT INTO ns_jury_assignments (id, event_id, jury_id, assigned_by, domain) VALUES (?,?,?,?,?)').run(
      id, req.params.id, jury_id, req.user.id, domain
    );
    // Notify jury member
    const event: any = db2.prepare('SELECT title FROM ns_events WHERE id = ?').get(req.params.id);
    db2.prepare('INSERT INTO ns_notifications (id, user_id, title, message, type, link) VALUES (?,?,?,?,?,?)').run(
      uuidv4(), jury_id, '🧑‍⚖️ Jury Assignment', `You have been assigned as a jury member for "${event?.title}"`, 'info', `/jury/${req.params.id}`
    );
    res.status(201).json({ id });
  } catch {
    res.status(400).json({ error: 'Jury member already assigned to this event' });
  }
});

app2.delete('/api2/events/:eventId/jury/:juryId', auth, requireRole('admin', 'committee_head'), (req, res) => {
  db2.prepare('DELETE FROM ns_jury_assignments WHERE event_id = ? AND jury_id = ?').run(req.params.eventId, req.params.juryId);
  res.json({ success: true });
});

// ─── REGISTRATIONS ──────────────────────────────────────────────────────
app2.get('/api2/events/:id/registrations', auth, (req: AuthReq, res) => {
  const regs = db2.prepare(`
    SELECT r.*, u.name as student_name, u.email as student_email, u.reg_number, u.department, u.avatar_color,
           c.name as college_name, c.code as college_code,
           s.total_score, s.avg_score,
           res.rank, res.position, res.prize_awarded,
           cert.id as certificate_id
    FROM ns_registrations r
    JOIN ns_users u ON r.student_id = u.id
    LEFT JOIN ns_colleges c ON u.college_id = c.id
    LEFT JOIN (
      SELECT registration_id, AVG(total_score) as avg_score, MAX(total_score) as total_score
      FROM ns_scores GROUP BY registration_id
    ) s ON s.registration_id = r.id
    LEFT JOIN ns_results res ON res.registration_id = r.id
    LEFT JOIN ns_certificates cert ON cert.registration_id = r.id
    WHERE r.event_id = ?
    ORDER BY r.registered_at ASC
  `).all(req.params.id);
  res.json(regs);
});

app2.post('/api2/events/:id/register', auth, requireRole('student'), (req: AuthReq, res) => {
  const { team_name, project_title, project_description } = req.body;
  const event: any = db2.prepare('SELECT * FROM ns_events WHERE id = ?').get(req.params.id);

  if (!event) return res.status(404).json({ error: 'Event not found' });
  if (event.status !== 'Open') return res.status(400).json({ error: 'Registrations are not open for this event' });

  const existing = db2.prepare('SELECT id FROM ns_registrations WHERE event_id = ? AND student_id = ?').get(req.params.id, req.user.id);
  if (existing) return res.status(400).json({ error: 'You are already registered for this event' });

  const regCount = (db2.prepare('SELECT count(*) as c FROM ns_registrations WHERE event_id = ?').get(req.params.id) as any).c;
  if (regCount >= event.max_participants) return res.status(400).json({ error: 'Event is full. No more registrations.' });

  const id = `reg-${uuidv4().substring(0, 8)}`;
  db2.prepare('INSERT INTO ns_registrations (id, event_id, student_id, team_name, project_title, project_description) VALUES (?,?,?,?,?,?)').run(
    id, req.params.id, req.user.id, team_name, project_title, project_description
  );

  // Notify committee head
  const head: any = db2.prepare('SELECT id FROM ns_users WHERE id = ?').get(event.created_by);
  if (head) {
    db2.prepare('INSERT INTO ns_notifications (id, user_id, title, message, type, link) VALUES (?,?,?,?,?,?)').run(
      uuidv4(), head.id, '📋 New Registration', `${req.user.name} registered for "${event.title}"`, 'info', `/events/${req.params.id}`
    );
  }

  res.status(201).json({ id, message: 'Successfully registered!' });
});

app2.delete('/api2/events/:id/register', auth, requireRole('student'), (req: AuthReq, res) => {
  db2.prepare('DELETE FROM ns_registrations WHERE event_id = ? AND student_id = ?').run(req.params.id, req.user.id);
  res.json({ success: true, message: 'Registration withdrawn' });
});

// Get my registrations
app2.get('/api2/my/registrations', auth, requireRole('student'), (req: AuthReq, res) => {
  const regs = db2.prepare(`
    SELECT r.*, e.title as event_title, e.start_date, e.end_date, e.venue, e.mode,
           e.status as event_status, e.banner_gradient, e.category, e.event_type,
           c.name as college_name, c.code as college_code,
           res.rank, res.position, res.prize_awarded, res.avg_score,
           cert.id as certificate_id
    FROM ns_registrations r
    JOIN ns_events e ON r.event_id = e.id
    LEFT JOIN ns_colleges c ON e.college_id = c.id
    LEFT JOIN ns_results res ON res.registration_id = r.id
    LEFT JOIN ns_certificates cert ON cert.registration_id = r.id
    WHERE r.student_id = ?
    ORDER BY r.registered_at DESC
  `).all(req.user.id);
  res.json(regs);
});

// ─── JURY SCORING ───────────────────────────────────────────────────────
app2.get('/api2/jury/events', auth, requireRole('jury'), (req: AuthReq, res) => {
  const events = db2.prepare(`
    SELECT e.*, c.name as college_name, ja.domain,
           (SELECT count(*) FROM ns_registrations r WHERE r.event_id = e.id) as total_registrations,
           (SELECT count(*) FROM ns_scores s WHERE s.event_id = e.id AND s.jury_id = ?) as scored_count
    FROM ns_jury_assignments ja
    JOIN ns_events e ON ja.event_id = e.id
    LEFT JOIN ns_colleges c ON e.college_id = c.id
    WHERE ja.jury_id = ?
    ORDER BY e.start_date DESC
  `).all(req.user.id, req.user.id);
  res.json(events);
});

app2.get('/api2/jury/events/:id/participants', auth, requireRole('jury'), (req: AuthReq, res) => {
  const participants = db2.prepare(`
    SELECT r.*, u.name as student_name, u.reg_number, u.department, u.avatar_color,
           c.name as college_name,
           s.criteria_scores, s.total_score, s.max_possible, s.remarks,
           (s.id IS NOT NULL) as is_scored_by_me
    FROM ns_registrations r
    JOIN ns_users u ON r.student_id = u.id
    LEFT JOIN ns_colleges c ON u.college_id = c.id
    LEFT JOIN ns_scores s ON s.registration_id = r.id AND s.jury_id = ?
    WHERE r.event_id = ?
    ORDER BY r.registered_at ASC
  `).all(req.user.id, req.params.id);
  res.json(participants);
});

app2.post('/api2/jury/scores', auth, requireRole('jury'), (req: AuthReq, res) => {
  const { event_id, registration_id, criteria_scores, remarks } = req.body;
  if (!event_id || !registration_id || !criteria_scores) return res.status(400).json({ error: 'Required fields missing' });

  // Verify jury is assigned to this event
  const assigned = db2.prepare('SELECT id FROM ns_jury_assignments WHERE event_id = ? AND jury_id = ?').get(event_id, req.user.id);
  if (!assigned) return res.status(403).json({ error: 'You are not assigned to this event' });

  const parsedCriteria = typeof criteria_scores === 'string' ? JSON.parse(criteria_scores) : criteria_scores;
  const totalScore = parsedCriteria.reduce((sum: number, c: any) => sum + (c.score || 0), 0);
  const maxPossible = parsedCriteria.reduce((sum: number, c: any) => sum + (c.max_points || 0), 0);

  const existing = db2.prepare('SELECT id FROM ns_scores WHERE registration_id = ? AND jury_id = ?').get(registration_id, req.user.id);
  if (existing) {
    db2.prepare('UPDATE ns_scores SET criteria_scores = ?, total_score = ?, max_possible = ?, remarks = ?, submitted_at = CURRENT_TIMESTAMP WHERE registration_id = ? AND jury_id = ?').run(
      JSON.stringify(parsedCriteria), totalScore, maxPossible, remarks, registration_id, req.user.id
    );
  } else {
    db2.prepare('INSERT INTO ns_scores (id, event_id, registration_id, jury_id, criteria_scores, total_score, max_possible, remarks) VALUES (?,?,?,?,?,?,?,?)').run(
      `sc-${uuidv4().substring(0, 8)}`, event_id, registration_id, req.user.id,
      JSON.stringify(parsedCriteria), totalScore, maxPossible, remarks
    );
  }

  res.json({ success: true, total_score: totalScore, max_possible: maxPossible });
});

// ─── RESULTS & CERTIFICATES ─────────────────────────────────────────────
// Compute and publish results (committee head / admin)
app2.post('/api2/events/:id/publish-results', auth, requireRole('admin', 'committee_head'), async (req: AuthReq, res) => {
  const eventId = req.params.id;
  const event: any = db2.prepare(`
    SELECT e.*, u.name as head_name
    FROM ns_events e LEFT JOIN ns_users u ON e.created_by = u.id WHERE e.id = ?
  `).get(eventId);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  // Compute average scores per registration
  const avgScores = db2.prepare(`
    SELECT registration_id, AVG(total_score) as avg_score, AVG(max_possible) as max_possible_avg
    FROM ns_scores WHERE event_id = ? GROUP BY registration_id ORDER BY avg_score DESC
  `).all(eventId) as any[];

  if (!avgScores.length) return res.status(400).json({ error: 'No scores submitted yet' });

  // Clear existing results
  db2.prepare('DELETE FROM ns_results WHERE event_id = ?').run(eventId);
  db2.prepare('DELETE FROM ns_certificates WHERE event_id = ?').run(eventId);

  const now = new Date().toISOString();
  const issueDate = new Date().toISOString().split('T')[0];

  const resStmt = db2.prepare('INSERT INTO ns_results (id, event_id, registration_id, rank, position, avg_score, prize_awarded, published, published_at) VALUES (?,?,?,?,?,?,?,1,?)');
  const certStmt = db2.prepare(`
    INSERT INTO ns_certificates (id, event_id, registration_id, student_id, student_name, college_name, event_title, position, score, issued_by, issued_at, qr_data, status, certificate_design)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `);

  const prizes: Record<number, string> = { 1: event.first_prize || '1st Prize', 2: event.second_prize || '2nd Prize', 3: event.third_prize || '3rd Prize' };
  const positions: Record<number, string> = { 1: 'Winner', 2: 'Runner-Up', 3: '2nd Runner-Up' };

  const notifications: any[] = [];

  avgScores.forEach((entry, idx) => {
    const rank = idx < 3 ? idx + 1 : null;
    const position = rank ? positions[rank] : 'Participant';
    const prize = rank ? prizes[rank] : null;
    const certSeq = String(idx + 1).padStart(3, '0');
    const certId = `NSP-2026-${eventId.toUpperCase().replace('EVT-', 'E').substring(0, 6)}-${certSeq}`;

    resStmt.run(`res-${uuidv4().substring(0, 8)}`, eventId, entry.registration_id, rank, position, entry.avg_score, prize, now);

    // Get student info
    const reg: any = db2.prepare(`
      SELECT r.*, u.name as student_name, u.id as student_id, c.name as college_name
      FROM ns_registrations r JOIN ns_users u ON r.student_id = u.id
      LEFT JOIN ns_colleges c ON u.college_id = c.id WHERE r.id = ?
    `).get(entry.registration_id);

    if (reg) {
      certStmt.run(
        certId, eventId, entry.registration_id, reg.student_id, reg.student_name,
        reg.college_name, event.title, position,
        `${Math.round(entry.avg_score)}/${Math.round(entry.max_possible_avg)}`,
        event.head_name || 'Event Committee', issueDate,
        `https://nextspark.in/verify/${certId}`, 'VALID',
        event.certificate_template || null
      );

      notifications.push({ userId: reg.student_id, position, certId, eventTitle: event.title });
    }
  });

  // Update event status
  db2.prepare("UPDATE ns_events SET status = 'Completed', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(eventId);

  // Send notifications
  const nStmt = db2.prepare('INSERT INTO ns_notifications (id, user_id, title, message, type, link) VALUES (?,?,?,?,?,?)');
  notifications.forEach(n => {
    const isWinner = ['Winner', 'Runner-Up', '2nd Runner-Up'].includes(n.position);
    nStmt.run(
      uuidv4(), n.userId,
      isWinner ? `🏆 You placed as ${n.position}!` : '🎓 Certificate Ready!',
      `Results published for "${n.eventTitle}". Your e-certificate ${n.certId} is ready!`,
      isWinner ? 'success' : 'info',
      '/certificates'
    );
  });

  // Post update about results
  db2.prepare('INSERT INTO ns_event_updates (id, event_id, posted_by, title, content, update_type, is_pinned) VALUES (?,?,?,?,?,?,?)').run(
    `upd-${uuidv4().substring(0, 8)}`, eventId, req.user.id,
    '🏆 Results Published!',
    `Results for "${event.title}" have been published! All participant e-certificates have been generated. Congratulations to all participants!`,
    'Result', 1
  );

  res.json({ success: true, total_ranked: avgScores.length, message: `Results published. ${avgScores.length} certificates generated.` });
});

// ─── CERTIFICATES ────────────────────────────────────────────────────────
app2.get('/api2/certificates', auth, (req: AuthReq, res) => {
  const { role, id } = req.user;
  let query = `
    SELECT cert.*, e.banner_gradient, e.category, e.event_type, e.college_id,
           c.name as college_name
    FROM ns_certificates cert
    JOIN ns_events e ON cert.event_id = e.id
    LEFT JOIN ns_colleges c ON e.college_id = c.id
    WHERE 1=1
  `;
  const params: any[] = [];
  if (role === 'student') { query += ' AND cert.student_id = ?'; params.push(id); }
  query += ' ORDER BY cert.created_at DESC';
  res.json(db2.prepare(query).all(...params));
});

app2.get('/api2/public/certificates/:id', (req, res) => {
  const cert: any = db2.prepare(`
    SELECT cert.*, e.description as event_description, e.category, e.event_type,
           e.start_date, e.end_date, e.venue, e.banner_gradient,
           c.name as host_college
    FROM ns_certificates cert
    JOIN ns_events e ON cert.event_id = e.id
    LEFT JOIN ns_colleges c ON e.college_id = c.id
    WHERE LOWER(cert.id) = LOWER(?)
  `).get(req.params.id);

  if (!cert) return res.status(404).json({ valid: false, message: 'Certificate not found' });
  db2.prepare('UPDATE ns_certificates SET download_count = download_count + 1 WHERE id = ?').run(cert.id);
  res.json({ valid: cert.status === 'VALID', certificate: cert, verified_at: new Date().toISOString() });
});

// Printable HTML Certificate Route
app2.get('/api2/certificates/download/:id', (req, res) => {
  const cert: any = db2.prepare(`
    SELECT cert.*, e.description as event_description, e.category, e.event_type,
           e.start_date, e.end_date, e.venue,
           c.name as host_college, c.code as college_code
    FROM ns_certificates cert
    JOIN ns_events e ON cert.event_id = e.id
    LEFT JOIN ns_colleges c ON e.college_id = c.id
    WHERE LOWER(cert.id) = LOWER(?)
  `).get(req.params.id);

  if (!cert) return res.status(404).send('Certificate not found');

  let design: any = {};
  try {
    design = cert.certificate_design ? JSON.parse(cert.certificate_design) : {};
  } catch {}

  const theme = design.theme || 'gold';
  const borderCol = design.borderColor || (theme === 'cyber' ? '#06b6d4' : theme === 'royal' ? '#6366f1' : '#d97706');
  const orgSub = design.orgSubtitle || 'Centralized Inter-College Engineering Consortium';
  const issuedBy = design.issuedBy || cert.issued_by || 'Organizing Committee Head';
  const certTitle = design.certificateTitle || 'Certificate of Merit & Achievement';

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Certificate - ${cert.student_name}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;800;900&family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Playfair+Display:ital,wght@1,600;1,800&display=swap');
    @page { size: landscape; margin: 0; }
    body {
      margin: 0;
      padding: 24px;
      background: #0f172a;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      box-sizing: border-box;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    .cert-frame {
      width: 1000px;
      height: 700px;
      background: #ffffff;
      padding: 40px;
      box-sizing: border-box;
      position: relative;
      box-shadow: 0 25px 60px rgba(0,0,0,0.5);
      border: 12px double ${borderCol};
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      text-align: center;
      background-image: radial-gradient(circle at 50% 50%, rgba(248, 250, 252, 1) 0%, rgba(241, 245, 249, 0.9) 100%);
    }
    .corner-decor {
      position: absolute;
      width: 44px;
      height: 44px;
      border: 4px solid ${borderCol};
    }
    .tl { top: 12px; left: 12px; border-right: none; border-bottom: none; }
    .tr { top: 12px; right: 12px; border-left: none; border-bottom: none; }
    .bl { bottom: 12px; left: 12px; border-right: none; border-top: none; }
    .br { bottom: 12px; right: 12px; border-left: none; border-top: none; }
    .cert-header {
      margin-top: 10px;
    }
    .org-title {
      font-size: 14px;
      font-weight: 800;
      letter-spacing: 4px;
      text-transform: uppercase;
      color: #64748b;
    }
    .org-college {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      margin: 4px 0 2px;
    }
    .org-sub {
      font-size: 11px;
      color: #94a3b8;
      letter-spacing: 1px;
    }
    .main-title {
      font-family: 'Cinzel', serif;
      font-size: 32px;
      font-weight: 900;
      letter-spacing: 2px;
      color: ${borderCol};
      margin: 18px 0 6px;
      text-transform: uppercase;
    }
    .presented-to {
      font-size: 13px;
      font-style: italic;
      color: #64748b;
      margin-bottom: 8px;
    }
    .student-name {
      font-family: 'Playfair Display', serif;
      font-size: 42px;
      font-style: italic;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 10px;
      text-decoration: underline;
      text-decoration-color: ${borderCol};
      text-underline-offset: 8px;
    }
    .cert-body {
      font-size: 15px;
      color: #334155;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
    }
    .event-name {
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
    }
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding: 0 30px 10px;
      border-top: 1px solid #e2e8f0;
      padding-top: 18px;
    }
    .signature {
      text-align: center;
      width: 220px;
    }
    .sig-line {
      border-bottom: 1.5px solid #0f172a;
      height: 30px;
      margin-bottom: 6px;
      font-family: 'Playfair Display', serif;
      font-size: 18px;
      color: #1e293b;
    }
    .sig-name {
      font-size: 12px;
      font-weight: 700;
      color: #0f172a;
    }
    .sig-role {
      font-size: 10px;
      color: #64748b;
    }
    .qr-box {
      text-align: center;
      font-size: 9px;
      color: #64748b;
    }
    .qr-placeholder {
      width: 68px;
      height: 68px;
      border: 2px solid #0f172a;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 10px;
      background: #f8fafc;
      margin-bottom: 4px;
    }
    @media print {
      body { background: transparent; padding: 0; }
      .cert-frame { box-shadow: none; width: 100vw; height: 100vh; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="cert-frame">
    <div class="corner-decor tl"></div>
    <div class="corner-decor tr"></div>
    <div class="corner-decor bl"></div>
    <div class="corner-decor br"></div>

    <div class="cert-header">
      <div class="org-title">NextSpark Collegiate Honors</div>
      <div class="org-college">${cert.host_college || cert.college_name || 'Inter-College Arena'}</div>
      <div class="org-sub">${orgSub}</div>
      <div class="main-title">${certTitle}</div>
      <div class="presented-to">This is proudly presented in recognition of excellence to</div>
    </div>

    <div>
      <div class="student-name">${cert.student_name}</div>
      <div class="cert-body">
        for exemplary demonstration of skill, innovation, and leadership as
        <strong style="color: ${borderCol}; font-size: 17px;">${cert.position}</strong> in the state-level inter-college arena
        <div class="event-name" style="margin-top: 4px;">${cert.event_title}</div>
      </div>
    </div>

    <div class="footer">
      <div class="signature">
        <div class="sig-line">${issuedBy.split(' ')[0]}</div>
        <div class="sig-name">${issuedBy}</div>
        <div class="sig-role">Event Operations Head</div>
      </div>

      <div class="qr-box">
        <div class="qr-placeholder">VERIFIED<br>QR</div>
        <div>ID: <strong>${cert.id}</strong></div>
        <div>nextspark.in/verify</div>
      </div>

      <div class="signature">
        <div class="sig-line">Institutional Head</div>
        <div class="sig-name">Dean / Academic Principal</div>
        <div class="sig-role">Governing Board Representative</div>
      </div>
    </div>
  </div>
  <script>
    window.onload = function() {
      // Auto trigger print dialogue for user convenience
      setTimeout(function() { window.print(); }, 600);
    };
  </script>
</body>
</html>`;

  res.send(html);
});

// ─── NOTIFICATIONS ───────────────────────────────────────────────────────
app2.get('/api2/notifications', auth, (req: AuthReq, res) => {
  const notifs = db2.prepare('SELECT * FROM ns_notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50').all(req.user.id);
  res.json(notifs);
});

app2.patch('/api2/notifications/:id/read', auth, (req: AuthReq, res) => {
  db2.prepare('UPDATE ns_notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  res.json({ success: true });
});

app2.patch('/api2/notifications/read-all', auth, (req: AuthReq, res) => {
  db2.prepare('UPDATE ns_notifications SET is_read = 1 WHERE user_id = ?').run(req.user.id);
  res.json({ success: true });
});

// ─── ANALYTICS / DASHBOARD ──────────────────────────────────────────────
app2.get('/api2/analytics/overview', auth, (_req, res) => {
  const totalEvents = (db2.prepare('SELECT count(*) as c FROM ns_events').get() as any).c;
  const openEvents = (db2.prepare("SELECT count(*) as c FROM ns_events WHERE status = 'Open'").get() as any).c;
  const completedEvents = (db2.prepare("SELECT count(*) as c FROM ns_events WHERE status = 'Completed'").get() as any).c;
  const totalStudents = (db2.prepare("SELECT count(*) as c FROM ns_users WHERE role = 'student'").get() as any).c;
  const totalColleges = (db2.prepare('SELECT count(*) as c FROM ns_colleges').get() as any).c;
  const totalRegistrations = (db2.prepare('SELECT count(*) as c FROM ns_registrations').get() as any).c;
  const totalCertificates = (db2.prepare('SELECT count(*) as c FROM ns_certificates').get() as any).c;

  const eventsByCategory = db2.prepare(`
    SELECT category, count(*) as count FROM ns_events GROUP BY category ORDER BY count DESC
  `).all();

  const topEvents = db2.prepare(`
    SELECT e.id, e.title, e.banner_gradient, e.status, count(r.id) as registrations
    FROM ns_events e LEFT JOIN ns_registrations r ON r.event_id = e.id
    GROUP BY e.id ORDER BY registrations DESC LIMIT 5
  `).all();

  const recentActivity = db2.prepare(`
    SELECT r.registered_at, u.name as student_name, e.title as event_title, r.team_name
    FROM ns_registrations r JOIN ns_users u ON r.student_id = u.id JOIN ns_events e ON r.event_id = e.id
    ORDER BY r.registered_at DESC LIMIT 10
  `).all();

  res.json({
    kpis: { totalEvents, openEvents, completedEvents, totalStudents, totalColleges, totalRegistrations, totalCertificates },
    eventsByCategory,
    topEvents,
    recentActivity
  });
});

// Jury panel - available jury members (for assignment)
app2.get('/api2/users/jury', auth, requireRole('admin', 'committee_head'), (_req, res) => {
  const jury = db2.prepare(`
    SELECT u.id, u.name, u.email, u.department, u.avatar_color, c.name as college_name
    FROM ns_users u LEFT JOIN ns_colleges c ON u.college_id = c.id
    WHERE u.role = 'jury' ORDER BY u.name
  `).all();
  res.json(jury);
});

app2.listen(PORT2, () => {
  console.log(`[NextSpark Server] Running on port ${PORT2}`);
});

export default app2;
