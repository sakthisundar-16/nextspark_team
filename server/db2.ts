import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const db2 = new Database(path.join(dataDir, 'nextspark.db'));

db2.pragma('journal_mode = WAL');
db2.pragma('foreign_keys = ON');

export function initNextSparkDB() {
  db2.exec(`
    CREATE TABLE IF NOT EXISTS ns_colleges (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      location TEXT,
      logo_url TEXT,
      website TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ns_users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      college_id TEXT,
      department TEXT,
      reg_number TEXT,
      phone TEXT,
      avatar_color TEXT DEFAULT '#6366f1',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (college_id) REFERENCES ns_colleges(id)
    );

    CREATE TABLE IF NOT EXISTS ns_events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      event_type TEXT NOT NULL,
      college_id TEXT NOT NULL,
      created_by TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      registration_deadline TEXT NOT NULL,
      venue TEXT NOT NULL,
      mode TEXT NOT NULL DEFAULT 'Offline',
      max_participants INTEGER DEFAULT 100,
      team_size_min INTEGER DEFAULT 1,
      team_size_max INTEGER DEFAULT 4,
      prize_pool TEXT,
      first_prize TEXT,
      second_prize TEXT,
      third_prize TEXT,
      banner_color TEXT DEFAULT '#6366f1',
      banner_gradient TEXT DEFAULT 'linear-gradient(135deg,#6366f1,#8b5cf6)',
      status TEXT DEFAULT 'Open',
      scoring_criteria TEXT,
      rules TEXT,
      contact_email TEXT,
      contact_phone TEXT,
      website TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (college_id) REFERENCES ns_colleges(id),
      FOREIGN KEY (created_by) REFERENCES ns_users(id)
    );

    CREATE TABLE IF NOT EXISTS ns_event_updates (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      posted_by TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      update_type TEXT DEFAULT 'Info',
      is_pinned INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES ns_events(id),
      FOREIGN KEY (posted_by) REFERENCES ns_users(id)
    );

    CREATE TABLE IF NOT EXISTS ns_registrations (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      student_id TEXT NOT NULL,
      team_name TEXT,
      team_members TEXT,
      project_title TEXT,
      project_description TEXT,
      abstract_url TEXT,
      status TEXT DEFAULT 'Registered',
      registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES ns_events(id),
      FOREIGN KEY (student_id) REFERENCES ns_users(id),
      UNIQUE(event_id, student_id)
    );

    CREATE TABLE IF NOT EXISTS ns_jury_assignments (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      jury_id TEXT NOT NULL,
      assigned_by TEXT NOT NULL,
      domain TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES ns_events(id),
      FOREIGN KEY (jury_id) REFERENCES ns_users(id),
      UNIQUE(event_id, jury_id)
    );

    CREATE TABLE IF NOT EXISTS ns_scores (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      registration_id TEXT NOT NULL,
      jury_id TEXT NOT NULL,
      criteria_scores TEXT NOT NULL,
      total_score REAL NOT NULL DEFAULT 0,
      max_possible REAL NOT NULL DEFAULT 100,
      remarks TEXT,
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES ns_events(id),
      FOREIGN KEY (registration_id) REFERENCES ns_registrations(id),
      FOREIGN KEY (jury_id) REFERENCES ns_users(id),
      UNIQUE(registration_id, jury_id)
    );

    CREATE TABLE IF NOT EXISTS ns_results (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      registration_id TEXT NOT NULL,
      rank INTEGER,
      position TEXT,
      avg_score REAL,
      prize_awarded TEXT,
      published INTEGER DEFAULT 0,
      published_at DATETIME,
      FOREIGN KEY (event_id) REFERENCES ns_events(id),
      FOREIGN KEY (registration_id) REFERENCES ns_registrations(id)
    );

    CREATE TABLE IF NOT EXISTS ns_certificates (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      registration_id TEXT NOT NULL UNIQUE,
      student_id TEXT NOT NULL,
      student_name TEXT NOT NULL,
      college_name TEXT,
      event_title TEXT NOT NULL,
      position TEXT NOT NULL,
      score TEXT,
      issued_by TEXT NOT NULL,
      issued_at TEXT NOT NULL,
      qr_data TEXT NOT NULL,
      status TEXT DEFAULT 'VALID',
      download_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES ns_events(id),
      FOREIGN KEY (registration_id) REFERENCES ns_registrations(id),
      FOREIGN KEY (student_id) REFERENCES ns_users(id)
    );

    CREATE TABLE IF NOT EXISTS ns_notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'info',
      is_read INTEGER DEFAULT 0,
      link TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES ns_users(id)
    );
  `);

  try {
    db2.exec(`ALTER TABLE ns_events ADD COLUMN certificate_template TEXT;`);
  } catch {}
  try {
    db2.exec(`ALTER TABLE ns_certificates ADD COLUMN certificate_design TEXT;`);
  } catch {}
  try {
    db2.exec(`ALTER TABLE ns_events ADD COLUMN image_url TEXT;`);
  } catch {}
  try {
    db2.exec(`ALTER TABLE ns_events ADD COLUMN gallery_images TEXT;`);
  } catch {}

  console.log('[NextSpark] Database schema initialized.');
}

export default db2;
