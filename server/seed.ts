import db, { initDatabase } from './db.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export function seedDatabase() {
  initDatabase();

  const count = db.prepare('SELECT count(*) as count FROM users').get() as { count: number };
  if (count.count > 0) {
    console.log('Database already seeded. Skipping initial seed.');
    return;
  }

  console.log('Seeding database with realistic institutional data...');

  const hashedPw = bcrypt.hashSync('externiq123', 10);

  // 1. Departments
  const deptStmt = db.prepare('INSERT INTO departments (id, code, name, hod_name) VALUES (?, ?, ?, ?)');
  const depts = [
    { id: 'dept-cse', code: 'CSE', name: 'Computer Science & Engineering', hod: 'Dr. S. R. Shankaran' },
    { id: 'dept-aids', code: 'AI&DS', name: 'Artificial Intelligence & Data Science', hod: 'Dr. M. Kalaiyarasi' },
    { id: 'dept-it', code: 'IT', name: 'Information Technology', hod: 'Dr. Anand Narayanan' },
    { id: 'dept-ece', code: 'ECE', name: 'Electronics & Communication Engineering', hod: 'Dr. Radhika Menon' },
    { id: 'dept-eee', code: 'EEE', name: 'Electrical & Electronics Engineering', hod: 'Dr. G. Venkatraman' },
    { id: 'dept-mech', code: 'MECH', name: 'Mechanical Engineering', hod: 'Dr. V. Rajesh' }
  ];
  depts.forEach(d => deptStmt.run(d.id, d.code, d.name, d.hod));

  // 2. Users (Student, Faculty, Verifier, HOD, Admin)
  const userStmt = db.prepare(`
    INSERT INTO users (id, name, email, password, role, department_id, reg_number, designation, year_of_study, phone)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const users = [
    // Admin
    { id: 'usr-admin', name: 'Dr. K. R. Ramanathan', email: 'admin@externiq.edu', role: 'admin', dept: 'dept-cse', reg: null, desig: 'Dean of Academic & External Affairs', year: null, phone: '+91 98401 23450' },
    // HODs
    { id: 'usr-hod-cse', name: 'Dr. S. R. Shankaran', email: 'hod.cse@externiq.edu', role: 'hod', dept: 'dept-cse', reg: null, desig: 'Professor & Head of Department (CSE)', year: null, phone: '+91 98401 23451' },
    { id: 'usr-hod-aids', name: 'Dr. M. Kalaiyarasi', email: 'hod.aids@externiq.edu', role: 'hod', dept: 'dept-aids', reg: null, desig: 'Professor & Head of Department (AI&DS)', year: null, phone: '+91 98401 23452' },
    // Verifiers / Mentors
    { id: 'usr-ver-1', name: 'Prof. Anitha Selvam', email: 'verifier@externiq.edu', role: 'verifier', dept: 'dept-cse', reg: null, desig: 'Associate Professor & Verification Officer', year: null, phone: '+91 98401 23453' },
    { id: 'usr-ver-2', name: 'Dr. Karthik Sundaram', email: 'karthik.verifier@externiq.edu', role: 'verifier', dept: 'dept-aids', reg: null, desig: 'Assistant Professor & Innovation Lead', year: null, phone: '+91 98401 23454' },
    // Faculty
    { id: 'usr-fac-1', name: 'Dr. Meenakshi Sundaram', email: 'faculty@externiq.edu', role: 'faculty', dept: 'dept-cse', reg: null, desig: 'Associate Professor', year: null, phone: '+91 98401 23455' },
    { id: 'usr-fac-2', name: 'Prof. Suresh Kumar', email: 'suresh.fac@externiq.edu', role: 'faculty', dept: 'dept-ece', reg: null, desig: 'Assistant Professor (Sr. Gr)', year: null, phone: '+91 98401 23456' },
    // Students
    { id: 'usr-stu-1', name: 'Sakthi Sundar', email: 'student@externiq.edu', role: 'student', dept: 'dept-cse', reg: '21CS084', desig: 'Student Researcher', year: 3, phone: '+91 98765 43210' },
    { id: 'usr-stu-2', name: 'Priya Dharshini', email: 'priya@externiq.edu', role: 'student', dept: 'dept-aids', reg: '21AI032', desig: 'Student Member', year: 3, phone: '+91 98765 43211' },
    { id: 'usr-stu-3', name: 'Arun Vijay', email: 'arun@externiq.edu', role: 'student', dept: 'dept-ece', reg: '22EC015', desig: 'IoT Lead', year: 2, phone: '+91 98765 43212' },
    { id: 'usr-stu-4', name: 'Kavya Ramesh', email: 'kavya@externiq.edu', role: 'student', dept: 'dept-it', reg: '21IT045', desig: 'Full Stack Developer', year: 3, phone: '+91 98765 43213' },
    { id: 'usr-stu-5', name: 'Rohan Sharma', email: 'rohan@externiq.edu', role: 'student', dept: 'dept-cse', reg: '22CS110', desig: 'Cybersecurity Club Lead', year: 2, phone: '+91 98765 43214' },
    { id: 'usr-stu-6', name: 'Deepika Murali', email: 'deepika@externiq.edu', role: 'student', dept: 'dept-mech', reg: '21ME022', desig: 'Robotics Enthusiast', year: 3, phone: '+91 98765 43215' }
  ];

  users.forEach(u => {
    userStmt.run(u.id, u.name, u.email, hashedPw, u.role, u.dept, u.reg, u.desig, u.year, u.phone);
  });

  // 3. Organizers
  const orgStmt = db.prepare('INSERT INTO organizers (id, name, category, website, location) VALUES (?, ?, ?, ?, ?)');
  const organizers = [
    { id: 'org-1', name: 'IIT Madras (Shaastra)', category: 'University', website: 'https://shaastra.org', location: 'Chennai, TN' },
    { id: 'org-2', name: 'Smart India Hackathon (MoE & AICTE)', category: 'Government', website: 'https://sih.gov.in', location: 'New Delhi' },
    { id: 'org-3', name: 'IEEE Computer Society', category: 'Professional Body', website: 'https://computer.org', location: 'Bangalore, KA' },
    { id: 'org-4', name: 'Google Cloud Student Club / GDG', category: 'Industry', website: 'https://gdg.community.dev', location: 'Hyderabad, TS' },
    { id: 'org-5', name: 'National Institute of Technology Trichy', category: 'University', website: 'https://nitt.edu', location: 'Trichy, TN' },
    { id: 'org-6', name: 'Microsoft Learn Student Ambassadors', category: 'Industry', website: 'https://studentambassadors.microsoft.com', location: 'Virtual' },
    { id: 'org-7', name: 'ACM India Chapter', category: 'Professional Body', website: 'https://india.acm.org', location: 'Pune, MH' }
  ];
  organizers.forEach(o => orgStmt.run(o.id, o.name, o.category, o.website, o.location));

  // 4. Events
  const eventStmt = db.prepare(`
    INSERT INTO events (id, name, organizer_id, category, level, start_date, end_date, venue, mode, description, theme, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const events = [
    { id: 'evt-1', name: 'Smart India Hackathon 2025 Grand Finale', org: 'org-2', cat: 'Hackathon', level: 'National', start: '2025-12-19', end: '2025-12-21', venue: 'Persistent Systems Hub, Pune', mode: 'Offline', desc: '36-hour nationwide hardware and software hackathon solving ministerial problem statements.', theme: 'AI in Governance', status: 'Completed' },
    { id: 'evt-2', name: 'International Conference on Emerging AI & Robotics (ICEAIR 2026)', org: 'org-3', cat: 'Conference', level: 'International', start: '2026-02-14', end: '2026-02-16', venue: 'IISc Convention Centre', mode: 'Hybrid', desc: 'Premier research conference indexing papers under IEEE Xplore digital library.', theme: 'Deep Learning & Autonomous Systems', status: 'Completed' },
    { id: 'evt-3', name: 'Shaastra AI Summit Hackathon 2026', org: 'org-1', cat: 'Hackathon', level: 'National', start: '2026-01-05', end: '2026-01-07', venue: 'IIT Madras Campus', mode: 'Offline', desc: 'Student-run tech festival hosting enterprise ML challenges and generative AI tracks.', theme: 'Generative AI for Social Impact', status: 'Completed' },
    { id: 'evt-4', name: 'NIT Trichy Pragyan National Project Expo', org: 'org-5', cat: 'Project Expo', level: 'National', start: '2026-03-01', end: '2026-03-03', venue: 'NIT Trichy', mode: 'Offline', desc: 'Annual techno-management festival project showcase attracting 500+ colleges.', theme: 'Sustainable CleanTech Innovations', status: 'Completed' },
    { id: 'evt-5', name: 'Google Cloud Generative AI Innovators Workshop', org: 'org-4', cat: 'Workshop', level: 'State', start: '2026-02-20', end: '2026-02-21', venue: 'Google Office, Bangalore', mode: 'Hybrid', desc: 'Intensive hands-on masterclass building LLM RAG pipelines with Vertex AI.', theme: 'Enterprise LLM Deployment', status: 'Completed' },
    { id: 'evt-6', name: 'ACM India Student Research Colloquium', org: 'org-7', cat: 'Paper Presentation', level: 'National', start: '2026-01-25', end: '2026-01-26', venue: 'Symbiosis Pune', mode: 'Online', desc: 'Peer-reviewed forum for undergraduate and postgraduate paper presentations.', theme: 'Edge Computing & Distributed Systems', status: 'Completed' },
    { id: 'evt-7', name: 'Microsoft Imagine Cup 2026 - Regional Semifinals', org: 'org-6', cat: 'Competition', level: 'International', start: '2026-02-28', end: '2026-03-01', venue: 'Virtual Arena', mode: 'Online', desc: 'Global student technology competition empowering students to solve global problems with Azure.', theme: 'Healthcare AI Innovations', status: 'Completed' }
  ];
  events.forEach(e => eventStmt.run(e.id, e.name, e.org, e.cat, e.level, e.start, e.end, e.venue, e.mode, e.desc, e.theme, e.status));

  // 5. Participations & Evidence
  const partStmt = db.prepare(`
    INSERT INTO participations (id, user_id, event_id, participation_type, team_name, role_title, result_type, description, skills_gained, outcomes, relevance, status, ai_confidence_score, ai_extracted_data)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const evidStmt = db.prepare(`
    INSERT INTO evidence_files (id, participation_id, file_name, file_path, file_type, file_size, uploaded_by, ai_parsed_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const certStmt = db.prepare(`
    INSERT INTO certificates (id, participation_id, template_id, issued_to_name, event_name, achievement, department_name, issue_date, signer_name, signer_designation, qr_code_data, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const verStmt = db.prepare(`
    INSERT INTO verifications (id, participation_id, verifier_id, status, remarks, evidence_quality, verified_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const participationsData = [
    {
      id: 'part-1',
      userId: 'usr-stu-1',
      eventId: 'evt-1',
      type: 'Team Lead',
      team: 'Team NeuroSpark',
      role: 'Team Lead & ML Architect',
      result: 'Winner',
      desc: 'Built an automated crop disease classification and drone telemetry dashboard for Ministry of Agriculture.',
      skills: 'PyTorch, FastApi, Edge Computing, Drone Telemetry',
      outcomes: JSON.stringify(['Innovation', 'Skill Development', 'National Recognition']),
      relevance: 'Direct alignment with institutional R&D objectives and Smart Agriculture Center of Excellence.',
      status: 'VERIFIED',
      aiScore: 0.96,
      aiData: JSON.stringify({ participant: 'Sakthi Sundar', event: 'Smart India Hackathon 2025 Grand Finale', rank: 'Winner (1st Prize)', certId: 'SIH-2025-FIN-9821' }),
      certId: 'EXN-2026-CSE-000184',
      verifierId: 'usr-ver-1',
      remarks: 'Outstanding achievement! Certificate cryptographically signed and verified with SIH central portal.',
      evidQuality: 'High'
    },
    {
      id: 'part-2',
      userId: 'usr-stu-1',
      eventId: 'evt-3',
      type: 'Team Member',
      team: 'PromptCrafters',
      role: 'Backend Architect',
      result: 'Runner-up',
      desc: 'Developed offline medical diagnostic copilot utilizing quantised Llama models on low-power devices.',
      skills: 'Generative AI, Local LLMs, WebSockets, React',
      outcomes: JSON.stringify(['Skill Development', 'Innovation']),
      relevance: 'Enhances institutional research in edge healthcare AI applications.',
      status: 'VERIFIED',
      aiScore: 0.94,
      aiData: JSON.stringify({ participant: 'Sakthi Sundar', event: 'Shaastra AI Summit Hackathon 2026', rank: 'Runner-up', certId: 'IITM-SH-2026-0412' }),
      certId: 'EXN-2026-CSE-000185',
      verifierId: 'usr-ver-1',
      remarks: 'Verified against IIT Madras participant credentials roster.',
      evidQuality: 'High'
    },
    {
      id: 'part-3',
      userId: 'usr-stu-2',
      eventId: 'evt-2',
      type: 'Presenter',
      team: null,
      role: 'First Author & Presenter',
      result: 'Best Paper',
      desc: 'Presented research on "Privacy-Preserving Federated Learning for Distributed EHR Systems". Paper to be indexed in IEEE Xplore.',
      skills: 'Federated Learning, Differential Privacy, Academic Writing',
      outcomes: JSON.stringify(['Research', 'Publication', 'Academic Recognition']),
      relevance: 'Contributes to NIRF Ranking research metrics and institutional citation count.',
      status: 'VERIFIED',
      aiScore: 0.97,
      aiData: JSON.stringify({ participant: 'Priya Dharshini', event: 'ICEAIR 2026', rank: 'Best Paper Award', certId: 'IEEE-ICEAIR-BP-2026-11' }),
      certId: 'EXN-2026-AIDS-000092',
      verifierId: 'usr-ver-2',
      remarks: 'Remarkable research output. Accepted for publication.',
      evidQuality: 'High'
    },
    {
      id: 'part-4',
      userId: 'usr-stu-3',
      eventId: 'evt-4',
      type: 'Team Lead',
      team: 'IoT GreenPulse',
      role: 'Hardware Engineer',
      result: 'Finalist',
      desc: 'Demonstrated smart solar panel dust mitigation mechanism with auto-cleaning robotics.',
      skills: 'Embedded C, ESP32, Solar Engineering',
      outcomes: JSON.stringify(['Skill Development', 'Innovation']),
      relevance: 'Promotes interdisciplinary research between ECE and Renewable Energy labs.',
      status: 'PENDING_VERIFICATION',
      aiScore: 0.89,
      aiData: JSON.stringify({ participant: 'Arun Vijay', event: 'NIT Trichy Pragyan National Project Expo', rank: 'Finalist Certificate of Merit', certId: 'PRAG-2026-FIN-332' }),
      certId: null,
      verifierId: null,
      remarks: null,
      evidQuality: 'Medium'
    },
    {
      id: 'part-5',
      userId: 'usr-stu-4',
      eventId: 'evt-5',
      type: 'Individual',
      team: null,
      role: 'Participant',
      result: 'Certificate of Excellence',
      desc: 'Completed 20-hour intensive track building autonomous multi-agent systems with Google Vertex AI.',
      skills: 'Vertex AI, LangChain, Vector Embeddings',
      outcomes: JSON.stringify(['Skill Development', 'Industry Exposure']),
      relevance: 'Equips department students with modern cloud AI development practices.',
      status: 'PENDING_VERIFICATION',
      aiScore: 0.91,
      aiData: JSON.stringify({ participant: 'Kavya Ramesh', event: 'Google Cloud Generative AI Innovators Workshop', rank: 'Certificate of Excellence', certId: 'GDG-BLR-2026-901' }),
      certId: null,
      verifierId: null,
      remarks: null,
      evidQuality: 'High'
    },
    {
      id: 'part-6',
      userId: 'usr-stu-5',
      eventId: 'evt-7',
      type: 'Team Member',
      team: 'HealthAI Sentinel',
      role: 'Security Engineer',
      result: 'Finalist',
      desc: 'Architected zero-trust telemetry infrastructure for telehealth remote intensive care monitors.',
      skills: 'Azure Security, Zero-Trust Architecture, HIPAA Compliance',
      outcomes: JSON.stringify(['International Recognition', 'Innovation']),
      relevance: 'Strengthens global institutional presence in Microsoft Imagine Cup.',
      status: 'PENDING_VERIFICATION',
      aiScore: 0.92,
      aiData: JSON.stringify({ participant: 'Rohan Sharma', event: 'Microsoft Imagine Cup 2026 - Regional Semifinals', rank: 'Regional Finalist', certId: 'MSFT-IC-2026-APAC-441' }),
      certId: null,
      verifierId: null,
      remarks: null,
      evidQuality: 'High'
    },
    {
      id: 'part-7',
      userId: 'usr-fac-1',
      eventId: 'evt-2',
      type: 'Presenter',
      team: null,
      role: 'Session Chair & Keynote Speaker',
      result: 'Presentation',
      desc: 'Delivered invited keynote on Neuromorphic Computing Architectures and chaired the Computer Vision Session.',
      skills: 'Neuromorphic Architectures, Academic Leadership',
      outcomes: JSON.stringify(['Faculty Development', 'Research', 'Academic Recognition']),
      relevance: 'Showcases institutional research faculty at tier-1 international venues.',
      status: 'VERIFIED',
      aiScore: 0.98,
      aiData: JSON.stringify({ participant: 'Dr. Meenakshi Sundaram', event: 'ICEAIR 2026', rank: 'Keynote & Session Chair', certId: 'IEEE-ICEAIR-CHAIR-08' }),
      certId: 'EXN-2026-FAC-000031',
      verifierId: 'usr-admin',
      remarks: 'Verified institutional representation.',
      evidQuality: 'High'
    }
  ];

  participationsData.forEach(p => {
    partStmt.run(
      p.id,
      p.userId,
      p.eventId,
      p.type,
      p.team,
      p.role,
      p.result,
      p.desc,
      p.skills,
      p.outcomes,
      p.relevance,
      p.status,
      p.aiScore,
      p.aiData
    );

    // Add evidence file record
    evidStmt.run(
      `evid-${p.id}`,
      p.id,
      `certificate_${p.id}.pdf`,
      `/uploads/sample_cert_${p.id}.pdf`,
      'application/pdf',
      450210,
      p.userId,
      'COMPLETED'
    );

    // If verified, add certificate & verification record
    if (p.status === 'VERIFIED' && p.certId) {
      const user = users.find(u => u.id === p.userId);
      const event = events.find(e => e.id === p.eventId);
      const dept = depts.find(d => d.id === user?.dept);

      certStmt.run(
        p.certId,
        p.id,
        'achievement-premium',
        user?.name || 'Participant',
        event?.name || 'Event',
        p.result,
        dept?.name || 'Engineering',
        '2026-03-10',
        'Dr. K. R. Ramanathan',
        'Dean of Academic & External Affairs',
        `http://localhost:5173/verify/${p.certId}`,
        'VALID'
      );

      if (p.verifierId) {
        verStmt.run(
          `ver-${p.id}`,
          p.id,
          p.verifierId,
          'APPROVED',
          p.remarks,
          p.evidQuality,
          '2026-03-10 14:30:00'
        );
      }
    }
  });

  // 6. Audit logs
  const auditStmt = db.prepare(`
    INSERT INTO audit_logs (id, user_id, action, record_type, record_id, old_value, new_value)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  auditStmt.run(uuidv4(), 'usr-ver-1', 'VERIFY_APPROVE', 'participation', 'part-1', 'PENDING_VERIFICATION', 'VERIFIED');
  auditStmt.run(uuidv4(), 'usr-admin', 'ISSUE_CERTIFICATE', 'certificate', 'EXN-2026-CSE-000184', null, 'ISSUED');
  auditStmt.run(uuidv4(), 'usr-ver-2', 'VERIFY_APPROVE', 'participation', 'part-3', 'PENDING_VERIFICATION', 'VERIFIED');
  auditStmt.run(uuidv4(), 'usr-admin', 'ISSUE_CERTIFICATE', 'certificate', 'EXN-2026-AIDS-000092', null, 'ISSUED');

  // 7. Notifications
  const notifStmt = db.prepare(`
    INSERT INTO notifications (id, user_id, title, message, type, action_url)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  notifStmt.run(uuidv4(), 'usr-stu-1', 'Certificate Issued 🎉', 'Your digital verified credential for SIH 2025 (EXN-2026-CSE-000184) is ready for download.', 'SUCCESS', '/certificates');
  notifStmt.run(uuidv4(), 'usr-stu-1', 'Achievement Recorded', 'Team NeuroSpark 1st Prize verified by Prof. Anitha Selvam.', 'INFO', '/activities');
  notifStmt.run(uuidv4(), 'usr-ver-1', 'New Verification Pending', 'Arun Vijay submitted Pragyan Project Expo participation for review.', 'WARNING', '/verification');
  notifStmt.run(uuidv4(), 'usr-admin', 'Impact Milestone Reached', 'Institutional External Impact score exceeded 88% this academic cycle.', 'INFO', '/impact');

  console.log('Database successfully seeded with realistic users, events, participations, certificates, and audits.');
}
