// NextSpark Types

export type UserRole = 'admin' | 'committee_head' | 'jury' | 'student';

export interface NSUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  college_id?: string;
  college_name?: string;
  college_code?: string;
  department?: string;
  reg_number?: string;
  phone?: string;
  avatar_color?: string;
}

export interface NSCollege {
  id: string;
  name: string;
  code: string;
  location?: string;
  website?: string;
}

export interface NSScoringCriterion {
  criterion: string;
  max_points: number;
  description?: string;
}

export interface NSEvent {
  id: string;
  title: string;
  description?: string;
  category: string;
  event_type: string;
  college_id: string;
  college_name?: string;
  college_code?: string;
  created_by: string;
  created_by_name?: string;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  venue: string;
  mode: string;
  max_participants: number;
  team_size_min: number;
  team_size_max: number;
  prize_pool?: string;
  first_prize?: string;
  second_prize?: string;
  third_prize?: string;
  banner_gradient?: string;
  status: 'Draft' | 'Open' | 'Closed' | 'Ongoing' | 'Completed' | 'Cancelled';
  scoring_criteria?: string | NSScoringCriterion[];
  rules?: string;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  certificate_template?: string;
  image_url?: string;
  gallery_images?: string;
  registration_count?: number;
  jury_count?: number;
  updates?: NSEventUpdate[];
  jury?: NSJuryAssignment[];
  results?: NSResult[];
}

export interface NSEventUpdate {
  id: string;
  event_id: string;
  posted_by: string;
  posted_by_name?: string;
  posted_by_role?: string;
  avatar_color?: string;
  title: string;
  content: string;
  update_type: 'Info' | 'Important' | 'Result' | 'Schedule' | 'Winner';
  is_pinned: number;
  created_at: string;
}

export interface NSRegistration {
  id: string;
  event_id: string;
  student_id: string;
  student_name?: string;
  student_email?: string;
  reg_number?: string;
  department?: string;
  college_name?: string;
  college_code?: string;
  avatar_color?: string;
  team_name?: string;
  team_members?: string;
  project_title?: string;
  project_description?: string;
  status: 'Registered' | 'Shortlisted' | 'Selected' | 'Disqualified' | 'Withdrawn';
  registered_at: string;
  total_score?: number;
  avg_score?: number;
  rank?: number;
  position?: string;
  prize_awarded?: string;
  certificate_id?: string;
  // My registrations join fields
  event_title?: string;
  start_date?: string;
  end_date?: string;
  venue?: string;
  mode?: string;
  event_status?: string;
  banner_gradient?: string;
  category?: string;
  event_type?: string;
}

export interface NSJuryAssignment {
  id: string;
  event_id: string;
  jury_id: string;
  jury_name?: string;
  jury_email?: string;
  department?: string;
  college_name?: string;
  avatar_color?: string;
  domain?: string;
  assigned_by: string;
}

export interface NSScoreCriterion {
  criterion: string;
  score: number;
  max_points: number;
  comments?: string;
}

export interface NSScore {
  id: string;
  event_id: string;
  registration_id: string;
  jury_id: string;
  criteria_scores: NSScoreCriterion[];
  total_score: number;
  max_possible: number;
  remarks?: string;
  is_scored_by_me?: boolean;
}

export interface NSResult {
  id: string;
  event_id: string;
  registration_id: string;
  rank?: number;
  position: string;
  avg_score?: number;
  prize_awarded?: string;
  published: number;
  student_name?: string;
  college_name?: string;
  team_name?: string;
  project_title?: string;
}

export interface NSCertificate {
  id: string;
  event_id: string;
  registration_id: string;
  student_id: string;
  student_name: string;
  college_name?: string;
  event_title: string;
  position: string;
  score?: string;
  issued_by: string;
  issued_at: string;
  qr_data: string;
  status: 'VALID' | 'REVOKED';
  download_count: number;
  certificate_design?: string;
  banner_gradient?: string;
  category?: string;
}

export interface NSNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: number;
  link?: string;
  created_at: string;
}

export interface NSAnalytics {
  kpis: {
    totalEvents: number;
    openEvents: number;
    completedEvents: number;
    totalStudents: number;
    totalColleges: number;
    totalRegistrations: number;
    totalCertificates: number;
  };
  eventsByCategory: { category: string; count: number }[];
  topEvents: { id: string; title: string; banner_gradient: string; status: string; registrations: number }[];
  recentActivity: { registered_at: string; student_name: string; event_title: string; team_name?: string }[];
}
