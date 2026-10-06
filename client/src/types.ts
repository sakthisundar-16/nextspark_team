export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'faculty' | 'verifier' | 'hod' | 'admin';
  department_id?: string;
  department_name?: string;
  department_code?: string;
  reg_number?: string;
  designation?: string;
  year_of_study?: number;
  phone?: string;
}

export interface EventItem {
  id: string;
  name: string;
  organizer_id?: string;
  organizer_name?: string;
  organizer_category?: string;
  organizer_website?: string;
  category: string;
  level: string;
  start_date: string;
  end_date: string;
  venue?: string;
  mode: string;
  description?: string;
  theme?: string;
  status: string;
  participants?: any[];
}

export interface Participation {
  id: string;
  user_id: string;
  event_id: string;
  event_name: string;
  event_category: string;
  event_level: string;
  event_date: string;
  organizer_name?: string;
  participant_name: string;
  participant_email?: string;
  reg_number?: string;
  department_name?: string;
  department_code?: string;
  participation_type: string;
  team_name?: string;
  role_title?: string;
  result_type: string;
  description?: string;
  skills_gained?: string;
  outcomes?: string;
  relevance?: string;
  status: 'DRAFT' | 'PENDING_VERIFICATION' | 'CORRECTION_REQUIRED' | 'REJECTED' | 'APPROVED' | 'VERIFIED';
  duplicate_flag?: number;
  duplicate_details?: string;
  ai_confidence_score?: number;
  ai_extracted_data?: string;
  certificate_id?: string;
  certificate_status?: string;
  created_at: string;
  evidence?: any[];
  verifications?: any[];
}

export interface CertificateItem {
  id: string;
  participation_id: string;
  template_id: string;
  issued_to_name: string;
  event_name: string;
  achievement: string;
  department_name: string;
  institution_name: string;
  issue_date: string;
  signer_name: string;
  signer_designation: string;
  qr_code_data: string;
  status: 'VALID' | 'REVOKED';
  download_count: number;
  event_category?: string;
  event_level?: string;
}

export interface AnalyticsOverview {
  kpis: {
    totalActivities: number;
    verifiedActivities: number;
    pendingVerification: number;
    certificatesIssued: number;
    studentsEngaged: number;
    facultyEngaged: number;
    achievementsCount: number;
    institutionalImpactScore: number;
  };
  deptStats: {
    code: string;
    name: string;
    total_activities: number;
    verified_count: number;
    achievements: number;
  }[];
  categoryStats: {
    category: string;
    count: number;
  }[];
  levelStats: {
    level: string;
    count: number;
  }[];
  achievementStats: {
    type: string;
    count: number;
  }[];
  monthlyStats: {
    month: string;
    count: number;
    verified: number;
  }[];
  funnel: {
    stage: string;
    count: number;
    percentage: number;
  }[];
}
