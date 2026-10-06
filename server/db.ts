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

const db = new Database(path.join(dataDir, 'externiq.db'));

// Pragmas for performance and foreign keys
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS departments (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      hod_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL, -- 'student', 'faculty', 'verifier', 'hod', 'admin'
      department_id TEXT,
      reg_number TEXT,
      designation TEXT,
      year_of_study INTEGER,
      phone TEXT,
      avatar TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (department_id) REFERENCES departments(id)
    );

    CREATE TABLE IF NOT EXISTS organizers (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL, -- 'University', 'Industry', 'Government', 'Professional Body', 'EdTech', 'NGO'
      website TEXT,
      location TEXT,
      verified INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS event_categories (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      icon TEXT
    );

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      organizer_id TEXT,
      category TEXT NOT NULL, -- Hackathon, Conference, Workshop, etc.
      level TEXT NOT NULL, -- Department, College, Local, District, State, National, International
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      venue TEXT,
      mode TEXT NOT NULL, -- Online, Offline, Hybrid
      description TEXT,
      website TEXT,
      theme TEXT,
      status TEXT DEFAULT 'Completed', -- Upcoming, Ongoing, Completed
      banner_url TEXT,
      created_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (organizer_id) REFERENCES organizers(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS participations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      event_id TEXT NOT NULL,
      participation_type TEXT NOT NULL, -- Individual, Team Lead, Team Member, Presenter, Organizer
      team_name TEXT,
      role_title TEXT,
      result_type TEXT NOT NULL, -- Participation, Winner, Runner-up, Finalist, Special Mention, Best Paper, etc.
      description TEXT,
      skills_gained TEXT, -- comma-separated
      outcomes TEXT, -- JSON array of outcomes like ['Skill Development', 'Innovation', 'Research']
      relevance TEXT,
      status TEXT NOT NULL DEFAULT 'PENDING_VERIFICATION', -- 'DRAFT', 'PENDING_VERIFICATION', 'CORRECTION_REQUIRED', 'REJECTED', 'APPROVED', 'VERIFIED'
      duplicate_flag INTEGER DEFAULT 0,
      duplicate_details TEXT,
      ai_confidence_score REAL,
      ai_extracted_data TEXT, -- JSON
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (event_id) REFERENCES events(id)
    );

    CREATE TABLE IF NOT EXISTS evidence_files (
      id TEXT PRIMARY KEY,
      participation_id TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_type TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      uploaded_by TEXT NOT NULL,
      file_hash TEXT,
      ai_parsed_status TEXT DEFAULT 'COMPLETED',
      extracted_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (participation_id) REFERENCES participations(id) ON DELETE CASCADE,
      FOREIGN KEY (uploaded_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS verifications (
      id TEXT PRIMARY KEY,
      participation_id TEXT NOT NULL,
      verifier_id TEXT NOT NULL,
      status TEXT NOT NULL, -- 'APPROVED', 'REJECTED', 'CORRECTION_REQUIRED'
      remarks TEXT,
      evidence_quality TEXT, -- 'High', 'Medium', 'Needs Review'
      verified_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (participation_id) REFERENCES participations(id) ON DELETE CASCADE,
      FOREIGN KEY (verifier_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS certificates (
      id TEXT PRIMARY KEY, -- EXN-2026-CSE-000184
      participation_id TEXT UNIQUE NOT NULL,
      template_id TEXT NOT NULL DEFAULT 'modern-minimal',
      issued_to_name TEXT NOT NULL,
      event_name TEXT NOT NULL,
      achievement TEXT NOT NULL,
      department_name TEXT NOT NULL,
      institution_name TEXT DEFAULT 'National Institute of Technology & Engineering',
      issue_date TEXT NOT NULL,
      signer_name TEXT DEFAULT 'Dr. K. R. Ramanathan',
      signer_designation TEXT DEFAULT 'Dean of Academic & External Affairs',
      qr_code_data TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'VALID', -- 'VALID', 'REVOKED'
      download_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (participation_id) REFERENCES participations(id)
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      action TEXT NOT NULL,
      record_type TEXT NOT NULL,
      record_id TEXT NOT NULL,
      old_value TEXT,
      new_value TEXT,
      ip_address TEXT DEFAULT '127.0.0.1',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL, -- 'SUCCESS', 'WARNING', 'INFO', 'ALERT'
      read INTEGER DEFAULT 0,
      action_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);
}

export default db;
