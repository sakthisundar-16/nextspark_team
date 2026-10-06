import db2, { initNextSparkDB } from './db2.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export function seedNextSpark() {
  initNextSparkDB();

  const count = db2.prepare('SELECT count(*) as count FROM ns_users').get() as { count: number };
  if (count.count > 0) {
    console.log('[NextSpark] Already seeded. Skipping.');
    return;
  }

  console.log('[NextSpark] Seeding demo data...');
  const pw = bcrypt.hashSync('nextspark123', 10);

  // Colleges
  const colleges = [
    { id: 'clg-1', name: 'Sri Venkateswara College of Engineering', code: 'SVCE', location: 'Chennai, TN' },
    { id: 'clg-2', name: 'PSG College of Technology', code: 'PSGCT', location: 'Coimbatore, TN' },
    { id: 'clg-3', name: 'Coimbatore Institute of Technology', code: 'CIT', location: 'Coimbatore, TN' },
    { id: 'clg-4', name: 'National Engineering College', code: 'NEC', location: 'Kovilpatti, TN' },
  ];
  const cStmt = db2.prepare('INSERT INTO ns_colleges (id, name, code, location) VALUES (?, ?, ?, ?)');
  colleges.forEach(c => cStmt.run(c.id, c.name, c.code, c.location));

  // Users
  const uStmt = db2.prepare('INSERT INTO ns_users (id, name, email, password, role, college_id, department, reg_number, phone, avatar_color) VALUES (?,?,?,?,?,?,?,?,?,?)');
  const users = [
    // Admin
    { id: 'u-admin', name: 'Dr. R. Vikram', email: 'admin@nextspark.in', role: 'admin', clg: 'clg-1', dept: 'Administration', reg: null, ph: '+91 98400 10001', color: '#ef4444' },
    // Committee Heads
    { id: 'u-head-1', name: 'Prof. Kavitha Rajan', email: 'head1@nextspark.in', role: 'committee_head', clg: 'clg-1', dept: 'Computer Science', reg: null, ph: '+91 98400 10002', color: '#8b5cf6' },
    { id: 'u-head-2', name: 'Prof. Arjun Menon', email: 'head2@nextspark.in', role: 'committee_head', clg: 'clg-2', dept: 'Electronics', reg: null, ph: '+91 98400 10003', color: '#06b6d4' },
    // Jury
    { id: 'u-jury-1', name: 'Dr. Suresh Babu', email: 'jury1@nextspark.in', role: 'jury', clg: 'clg-3', dept: 'AI & Data Science', reg: null, ph: '+91 98400 10004', color: '#f59e0b' },
    { id: 'u-jury-2', name: 'Ms. Preethi Nair', email: 'jury2@nextspark.in', role: 'jury', clg: 'clg-4', dept: 'Information Technology', reg: null, ph: '+91 98400 10005', color: '#10b981' },
    { id: 'u-jury-3', name: 'Mr. Kiran Reddy', email: 'jury3@nextspark.in', role: 'jury', clg: 'clg-2', dept: 'Machine Learning', reg: null, ph: '+91 98400 10006', color: '#ec4899' },
    // Students
    { id: 'u-stu-1', name: 'Sakthi Sundar K', email: 'student@nextspark.in', role: 'student', clg: 'clg-1', dept: 'Computer Science', reg: '21CS084', ph: '+91 98765 43210', color: '#6366f1' },
    { id: 'u-stu-2', name: 'Priya Dharshini R', email: 'priya@nextspark.in', role: 'student', clg: 'clg-2', dept: 'AI & Data Science', reg: '21AI032', ph: '+91 98765 43211', color: '#14b8a6' },
    { id: 'u-stu-3', name: 'Arun Vijay S', email: 'arun@nextspark.in', role: 'student', clg: 'clg-3', dept: 'Electronics', reg: '22EC015', ph: '+91 98765 43212', color: '#f97316' },
    { id: 'u-stu-4', name: 'Kavya Ramesh T', email: 'kavya@nextspark.in', role: 'student', clg: 'clg-1', dept: 'Information Technology', reg: '21IT045', ph: '+91 98765 43213', color: '#a855f7' },
    { id: 'u-stu-5', name: 'Rohan Sharma M', email: 'rohan@nextspark.in', role: 'student', clg: 'clg-4', dept: 'Computer Science', reg: '22CS110', ph: '+91 98765 43214', color: '#22c55e' },
    { id: 'u-stu-6', name: 'Deepika Murali', email: 'deepika@nextspark.in', role: 'student', clg: 'clg-2', dept: 'Mechanical', reg: '21ME022', ph: '+91 98765 43215', color: '#eab308' },
  ];
  users.forEach(u => uStmt.run(u.id, u.name, u.email, pw, u.role, u.clg, u.dept, u.reg, u.ph, u.color));

  // Default scoring criteria
  const defaultCriteria = JSON.stringify([
    { criterion: 'Innovation & Creativity', max_points: 25, description: 'Originality and creative thinking' },
    { criterion: 'Technical Implementation', max_points: 30, description: 'Code quality and technical complexity' },
    { criterion: 'Presentation & Communication', max_points: 20, description: 'Clarity of presentation' },
    { criterion: 'Business Viability', max_points: 15, description: 'Market potential and feasibility' },
    { criterion: 'Impact & Scalability', max_points: 10, description: 'Social impact and scalability' },
  ]);

  const hackCriteria = JSON.stringify([
    { criterion: 'Problem Understanding', max_points: 20, description: 'Clarity of problem statement addressed' },
    { criterion: 'Technical Solution', max_points: 35, description: 'Effectiveness and quality of solution' },
    { criterion: 'Innovation', max_points: 25, description: 'Novelty and uniqueness of approach' },
    { criterion: 'Demo & Presentation', max_points: 20, description: 'Live demo quality and explanation' },
  ]);

  // Events
  const eStmt = db2.prepare(`
    INSERT INTO ns_events (id, title, description, category, event_type, college_id, created_by,
      start_date, end_date, registration_deadline, venue, mode, max_participants,
      team_size_min, team_size_max, prize_pool, first_prize, second_prize, third_prize,
      banner_gradient, status, scoring_criteria, rules, contact_email)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `);

  const events = [
    {
      id: 'evt-ns-1',
      title: 'NextGen AI Hackathon 2026',
      description: 'A 36-hour inter-college AI hackathon where teams build real-world AI-powered solutions. Open to all engineering students across Tamil Nadu.',
      category: 'Technical',
      type: 'Hackathon',
      clg: 'clg-1',
      by: 'u-head-1',
      start: '2026-10-20',
      end: '2026-10-21',
      deadline: '2026-10-15',
      venue: 'Main Auditorium, SVCE Campus',
      mode: 'Offline',
      maxP: 200,
      tMin: 2,
      tMax: 4,
      prize: '₹1,00,000 Total Prize Pool',
      p1: '₹50,000 + Internship Opportunity',
      p2: '₹25,000 + Mentorship',
      p3: '₹10,000 + Certificate',
      gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      status: 'Open',
      criteria: hackCriteria,
      rules: '1. Teams of 2-4 members\n2. All code must be written during the event\n3. Open source libraries allowed\n4. Use of AI APIs permitted',
      email: 'hackathon@svce.ac.in',
    },
    {
      id: 'evt-ns-2',
      title: 'TechTalks National Symposium',
      description: 'An annual national-level technical symposium featuring paper presentations, project expos, and workshops. Students from across India are welcome.',
      category: 'Technical',
      type: 'Symposium',
      clg: 'clg-2',
      by: 'u-head-2',
      start: '2026-11-05',
      end: '2026-11-06',
      deadline: '2026-10-25',
      venue: 'Dr. G.R. Damodaran Auditorium, PSGCT',
      mode: 'Hybrid',
      maxP: 300,
      tMin: 1,
      tMax: 3,
      prize: '₹75,000 Total Prize Pool',
      p1: '₹30,000 + Publish Opportunity',
      p2: '₹15,000',
      p3: '₹8,000',
      gradient: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
      status: 'Open',
      criteria: defaultCriteria,
      rules: '1. Paper must be original work\n2. Plagiarism limit: 20%\n3. Presentation: 10 min + 5 min QA\n4. Submitted papers will be reviewed',
      email: 'symposium@psgct.ac.in',
    },
    {
      id: 'evt-ns-3',
      title: 'RoboWars 2026 - Robotics Competition',
      description: 'Battle-bot competition and autonomous robot challenge. Design, build, and compete with your robots.',
      category: 'Technical',
      type: 'Competition',
      clg: 'clg-3',
      by: 'u-head-1',
      start: '2026-10-30',
      end: '2026-10-31',
      deadline: '2026-10-22',
      venue: 'Engineering Workshop Block, CIT',
      mode: 'Offline',
      maxP: 80,
      tMin: 2,
      tMax: 5,
      prize: '₹40,000 Total Prize Pool',
      p1: '₹20,000 + Trophy',
      p2: '₹12,000',
      p3: '₹5,000',
      gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
      status: 'Open',
      criteria: JSON.stringify([
        { criterion: 'Robot Design & Build Quality', max_points: 30, description: 'Structural integrity and design' },
        { criterion: 'Combat Effectiveness', max_points: 40, description: 'Performance in combat arena' },
        { criterion: 'Autonomous Navigation', max_points: 20, description: 'Ability to navigate autonomously' },
        { criterion: 'Innovation', max_points: 10, description: 'Novel features or mechanisms' },
      ]),
      rules: '1. Robots must weigh under 15kg\n2. No open flames\n3. Remote controlled or autonomous\n4. Safety guidelines must be followed',
      email: 'robowars@cit.ac.in',
    },
    {
      id: 'evt-ns-4',
      title: 'Culturals Fiesta 2026',
      description: 'The grandest inter-college cultural fest featuring dance, music, drama, and art competitions. Celebrate talent and creativity!',
      category: 'Cultural',
      type: 'Competition',
      clg: 'clg-4',
      by: 'u-head-2',
      start: '2026-12-10',
      end: '2026-12-12',
      deadline: '2026-12-01',
      venue: 'Open Air Theatre, NEC Campus',
      mode: 'Offline',
      maxP: 500,
      tMin: 1,
      tMax: 10,
      prize: '₹2,00,000 Total Prize Pool',
      p1: '₹80,000 + Rolling Trophy',
      p2: '₹40,000',
      p3: '₹20,000',
      gradient: 'linear-gradient(135deg, #ec4899, #f97316)',
      status: 'Open',
      criteria: JSON.stringify([
        { criterion: 'Stage Presence', max_points: 25, description: 'Confidence and energy on stage' },
        { criterion: 'Skill & Technique', max_points: 35, description: 'Technical skill and execution' },
        { criterion: 'Creativity', max_points: 25, description: 'Originality and artistic expression' },
        { criterion: 'Audience Engagement', max_points: 15, description: 'Crowd response and connection' },
      ]),
      rules: '1. Each team can participate in max 3 events\n2. Vulgar content is strictly prohibited\n3. Time limits will be strictly enforced\n4. Costumes and props allowed',
      email: 'culturals@nec.ac.in',
    },
    {
      id: 'evt-ns-5',
      title: 'CodeSprint — Competitive Programming',
      description: 'A 4-hour competitive programming contest with algorithmic problems ranging from beginner to expert level. Solo or duo participation.',
      category: 'Technical',
      type: 'Competition',
      clg: 'clg-1',
      by: 'u-head-1',
      start: '2026-10-18',
      end: '2026-10-18',
      deadline: '2026-10-16',
      venue: 'CS Lab - Block A, SVCE',
      mode: 'Online',
      maxP: 150,
      tMin: 1,
      tMax: 2,
      prize: '₹30,000 Total Prize Pool',
      p1: '₹15,000 + Internship',
      p2: '₹8,000',
      p3: '₹4,000',
      gradient: 'linear-gradient(135deg, #10b981, #14b8a6)',
      status: 'Completed',
      criteria: JSON.stringify([
        { criterion: 'Problems Solved', max_points: 60, description: 'Number of correct solutions' },
        { criterion: 'Time Efficiency', max_points: 30, description: 'Speed of solving problems' },
        { criterion: 'Code Quality', max_points: 10, description: 'Clean and readable code' },
      ]),
      rules: '1. No plagiarism\n2. Any language allowed\n3. Judging by online judge\n4. Tie-breaking by submission time',
      email: 'codesprint@svce.ac.in',
    },
  ];

  events.forEach(e => {
    eStmt.run(
      e.id, e.title, e.description, e.category, e.type, e.clg, e.by,
      e.start, e.end, e.deadline, e.venue, e.mode, e.maxP,
      e.tMin, e.tMax, e.prize, e.p1, e.p2, e.p3,
      e.gradient, e.status, e.criteria, e.rules, e.email
    );
  });

  // Event Updates
  const updStmt = db2.prepare('INSERT INTO ns_event_updates (id, event_id, posted_by, title, content, update_type, is_pinned) VALUES (?,?,?,?,?,?,?)');
  const updates = [
    { id: 'upd-1', evt: 'evt-ns-1', by: 'u-head-1', title: 'Registration Now Open! 🎉', content: 'We are thrilled to announce that registrations for NextGen AI Hackathon 2026 are now OPEN. Register your team before October 15th to secure your spot!', type: 'Important', pin: 1 },
    { id: 'upd-2', evt: 'evt-ns-1', by: 'u-head-1', title: 'Problem Statements Released', content: 'The hackathon problem statements across 4 domains (Healthcare AI, AgriTech, Smart City, EdTech) have been released. Check the event website for details.', type: 'Info', pin: 0 },
    { id: 'upd-3', evt: 'evt-ns-1', by: 'u-head-1', title: 'Mentorship Sessions Added', content: 'We have arranged pre-hackathon mentorship sessions with industry experts on Oct 18 & 19. All registered teams will receive invites via email.', type: 'Schedule', pin: 0 },
    { id: 'upd-4', evt: 'evt-ns-2', by: 'u-head-2', title: 'Call for Papers — Extended Deadline!', content: 'Due to overwhelming response, the paper submission deadline has been extended to October 28th. Submit your research papers at papers.techhtalks.in', type: 'Important', pin: 1 },
    { id: 'upd-5', evt: 'evt-ns-2', by: 'u-head-2', title: 'Keynote Speaker Announced', content: 'We are honored to welcome Dr. Pramod Varma (Chief Architect, Aadhaar) as our keynote speaker for TechTalks 2026!', type: 'Info', pin: 0 },
    { id: 'upd-6', evt: 'evt-ns-5', by: 'u-head-1', title: '🏆 Results Declared!', content: 'Congratulations to all participants! Winners: 1st Place - Sakthi Sundar K (SVCE), 2nd Place - Priya Dharshini (PSGCT), 3rd Place - Rohan Sharma (NEC). Certificates being issued shortly.', type: 'Winner', pin: 1 },
    { id: 'upd-7', evt: 'evt-ns-5', by: 'u-head-1', title: 'E-Certificates Generated', content: 'All participant e-certificates have been generated and are available for download in your profile. Congratulations everyone on a great competition!', type: 'Result', pin: 0 },
  ];
  updates.forEach(u => updStmt.run(u.id, u.evt, u.by, u.title, u.content, u.type, u.pin));

  // Jury Assignments
  const jaStmt = db2.prepare('INSERT INTO ns_jury_assignments (id, event_id, jury_id, assigned_by, domain) VALUES (?,?,?,?,?)');
  jaStmt.run('ja-1', 'evt-ns-1', 'u-jury-1', 'u-head-1', 'AI/ML');
  jaStmt.run('ja-2', 'evt-ns-1', 'u-jury-2', 'u-head-1', 'Web Development');
  jaStmt.run('ja-3', 'evt-ns-1', 'u-jury-3', 'u-head-1', 'Blockchain');
  jaStmt.run('ja-4', 'evt-ns-2', 'u-jury-1', 'u-head-2', 'Research');
  jaStmt.run('ja-5', 'evt-ns-5', 'u-jury-2', 'u-head-1', 'Competitive Programming');
  jaStmt.run('ja-6', 'evt-ns-5', 'u-jury-3', 'u-head-1', 'Algorithms');

  // Registrations
  const rStmt = db2.prepare('INSERT INTO ns_registrations (id, event_id, student_id, team_name, project_title, project_description, status) VALUES (?,?,?,?,?,?,?)');
  const regs = [
    // CodeSprint (Completed) - multiple students
    { id: 'reg-1', evt: 'evt-ns-5', stu: 'u-stu-1', team: null, proj: 'Solo Entry', desc: 'Competitive programming', status: 'Selected' },
    { id: 'reg-2', evt: 'evt-ns-5', stu: 'u-stu-2', team: null, proj: 'Solo Entry', desc: 'Algorithm optimization specialist', status: 'Selected' },
    { id: 'reg-3', evt: 'evt-ns-5', stu: 'u-stu-5', team: null, proj: 'Solo Entry', desc: 'Graph theory and DP expert', status: 'Selected' },
    { id: 'reg-4', evt: 'evt-ns-5', stu: 'u-stu-3', team: null, proj: 'Solo Entry', desc: 'Competitive coder', status: 'Selected' },
    { id: 'reg-5', evt: 'evt-ns-5', stu: 'u-stu-4', team: null, proj: 'Solo Entry', desc: 'Problem solver', status: 'Selected' },
    // AI Hackathon (Open)
    { id: 'reg-6', evt: 'evt-ns-1', stu: 'u-stu-1', team: 'Team Nexus', proj: 'AgriBot - AI-Powered Crop Disease Detection', desc: 'Mobile app using computer vision to detect crop diseases from leaf images', status: 'Registered' },
    { id: 'reg-7', evt: 'evt-ns-1', stu: 'u-stu-2', team: 'Team Aurora', proj: 'MedAI - Diagnostic Assistant', desc: 'AI-powered preliminary medical diagnosis tool for rural healthcare', status: 'Registered' },
    // Symposium
    { id: 'reg-8', evt: 'evt-ns-2', stu: 'u-stu-4', team: null, proj: 'Deep Learning in Edge Computing', desc: 'Research paper on optimizing neural networks for IoT devices', status: 'Registered' },
  ];
  regs.forEach(r => rStmt.run(r.id, r.evt, r.stu, r.team, r.proj, r.desc, r.status));

  // Scores for CodeSprint (Completed event)
  const sStmt = db2.prepare('INSERT INTO ns_scores (id, event_id, registration_id, jury_id, criteria_scores, total_score, max_possible, remarks) VALUES (?,?,?,?,?,?,?,?)');
  const csCriteria = JSON.parse(JSON.stringify([
    { criterion: 'Problems Solved', max_points: 60 },
    { criterion: 'Time Efficiency', max_points: 30 },
    { criterion: 'Code Quality', max_points: 10 },
  ]));

  // reg-1: Sakthi - 1st place (92/100)
  sStmt.run('sc-1', 'evt-ns-5', 'reg-1', 'u-jury-2', JSON.stringify([
    { criterion: 'Problems Solved', score: 55, max_points: 60, comments: 'Solved all 6 problems correctly' },
    { criterion: 'Time Efficiency', score: 28, max_points: 30, comments: 'Excellent speed' },
    { criterion: 'Code Quality', score: 9, max_points: 10, comments: 'Very clean code' },
  ]), 92, 100, 'Outstanding performance - first to solve all problems');

  // reg-2: Priya - 2nd place (85/100)
  sStmt.run('sc-2', 'evt-ns-5', 'reg-2', 'u-jury-2', JSON.stringify([
    { criterion: 'Problems Solved', score: 50, max_points: 60, comments: 'Solved 5 problems correctly' },
    { criterion: 'Time Efficiency', score: 26, max_points: 30, comments: 'Quick solver' },
    { criterion: 'Code Quality', score: 9, max_points: 10, comments: 'Clean, readable code' },
  ]), 85, 100, 'Excellent performance');

  // reg-3: Rohan - 3rd place (78/100)
  sStmt.run('sc-3', 'evt-ns-5', 'reg-3', 'u-jury-3', JSON.stringify([
    { criterion: 'Problems Solved', score: 46, max_points: 60, comments: 'Solved 5 problems' },
    { criterion: 'Time Efficiency', score: 23, max_points: 30, comments: 'Good speed' },
    { criterion: 'Code Quality', score: 9, max_points: 10, comments: 'Good quality' },
  ]), 78, 100, 'Solid performance');

  // reg-4: Arun (72)
  sStmt.run('sc-4', 'evt-ns-5', 'reg-4', 'u-jury-2', JSON.stringify([
    { criterion: 'Problems Solved', score: 42, max_points: 60, comments: 'Solved 4 problems' },
    { criterion: 'Time Efficiency', score: 21, max_points: 30, comments: 'Average speed' },
    { criterion: 'Code Quality', score: 9, max_points: 10, comments: 'Decent code' },
  ]), 72, 100, 'Good effort');

  // reg-5: Kavya (65)
  sStmt.run('sc-5', 'evt-ns-5', 'reg-5', 'u-jury-3', JSON.stringify([
    { criterion: 'Problems Solved', score: 38, max_points: 60, comments: 'Solved 4 problems' },
    { criterion: 'Time Efficiency', score: 18, max_points: 30, comments: 'Needs to improve speed' },
    { criterion: 'Code Quality', score: 9, max_points: 10, comments: 'Good code structure' },
  ]), 65, 100, 'Good participation');

  // Results for CodeSprint
  const resStmt = db2.prepare('INSERT INTO ns_results (id, event_id, registration_id, rank, position, avg_score, prize_awarded, published, published_at) VALUES (?,?,?,?,?,?,?,?,?)');
  const now = new Date().toISOString();
  resStmt.run('res-1', 'evt-ns-5', 'reg-1', 1, 'Winner', 92, '₹15,000 + Internship', 1, now);
  resStmt.run('res-2', 'evt-ns-5', 'reg-2', 2, 'Runner-Up', 85, '₹8,000', 1, now);
  resStmt.run('res-3', 'evt-ns-5', 'reg-3', 3, '2nd Runner-Up', 78, '₹4,000', 1, now);
  resStmt.run('res-4', 'evt-ns-5', 'reg-4', null, 'Participant', 72, null, 1, now);
  resStmt.run('res-5', 'evt-ns-5', 'reg-5', null, 'Participant', 65, null, 1, now);

  // Certificates for CodeSprint
  const certStmt = db2.prepare(`
    INSERT INTO ns_certificates (id, event_id, registration_id, student_id, student_name, college_name, event_title, position, score, issued_by, issued_at, qr_data, status)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
  `);
  const issueDate = new Date().toISOString().split('T')[0];
  const certData = [
    { id: 'NSP-2026-EVT5-001', reg: 'reg-1', stu: 'u-stu-1', name: 'Sakthi Sundar K', clg: 'Sri Venkateswara College of Engineering', pos: 'Winner', score: '92/100', prize: '₹15,000' },
    { id: 'NSP-2026-EVT5-002', reg: 'reg-2', stu: 'u-stu-2', name: 'Priya Dharshini R', clg: 'PSG College of Technology', pos: 'Runner-Up', score: '85/100', prize: '₹8,000' },
    { id: 'NSP-2026-EVT5-003', reg: 'reg-3', stu: 'u-stu-5', name: 'Rohan Sharma M', clg: 'National Engineering College', pos: '2nd Runner-Up', score: '78/100', prize: '₹4,000' },
    { id: 'NSP-2026-EVT5-004', reg: 'reg-4', stu: 'u-stu-3', name: 'Arun Vijay S', clg: 'Coimbatore Institute of Technology', pos: 'Participant', score: '72/100', prize: null },
    { id: 'NSP-2026-EVT5-005', reg: 'reg-5', stu: 'u-stu-4', name: 'Kavya Ramesh T', clg: 'Sri Venkateswara College of Engineering', pos: 'Participant', score: '65/100', prize: null },
  ];
  certData.forEach(c => {
    certStmt.run(
      c.id, 'evt-ns-5', c.reg, c.stu, c.name, c.clg,
      'CodeSprint — Competitive Programming', c.pos, c.score,
      'Prof. Kavitha Rajan', issueDate,
      `https://nextspark.in/verify/${c.id}`, 'VALID'
    );
  });

  // Notifications
  const nStmt = db2.prepare('INSERT INTO ns_notifications (id, user_id, title, message, type, link) VALUES (?,?,?,?,?,?)');
  nStmt.run(uuidv4(), 'u-stu-1', '🏆 You won CodeSprint 2026!', 'Congratulations! You placed 1st in CodeSprint. Your e-certificate is ready for download.', 'success', '/certificates');
  nStmt.run(uuidv4(), 'u-stu-2', '🥈 You placed 2nd in CodeSprint!', 'Great job! You placed 2nd in CodeSprint 2026. Download your certificate now.', 'success', '/certificates');
  nStmt.run(uuidv4(), 'u-stu-1', '✅ Registration Confirmed', 'You are registered for NextGen AI Hackathon 2026 with Team Nexus.', 'info', '/events/evt-ns-1');
  nStmt.run(uuidv4(), 'u-head-1', '📋 New Registration', 'Team Nexus has registered for NextGen AI Hackathon 2026.', 'info', '/events/evt-ns-1');

  console.log('[NextSpark] Seeding complete!');
}
