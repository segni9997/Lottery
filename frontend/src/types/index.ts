export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  status: 'Active' | 'Inactive';
  created_at: string;
  updated_at: string;
}

export interface PaymentPlan {
  id: string;
  name: string;
  base_amount: number;
  penalty_amount: number;
  installment_count: number;
  total_amount: number;
  installment_amount: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  title: string;
  holiday_name: string;
  description: string;
  banner_image: string | null;
  cover_image: string | null;
  draw_date: string;
  registration_start_date: string;
  registration_end_date: string;
  telegram_link: string | null;
  status: 'Draft' | 'Active' | 'Closed' | 'Drawn';
  created_at: string;
  updated_at: string;
}

export interface Installment {
  id: string;
  registration: string;
  installment_number: number;
  amount: number;
  status: 'Open' | 'Paid' | 'Approved';
  due_date: string | null;
  created_at: string;
  updated_at: string;
  requests?: InstallmentRequest[];
  proof?: PaymentProof | null;
}

export interface InstallmentRequest {
  id: string;
  installment: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentProof {
  id: string;
  installment: string;
  telegram_message_id: string | null;
  telegram_user_id: string | null;
  proof_image: string | null;
  submitted_at: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Registration {
  id: string;
  campaign: string;
  campaign_detail?: Campaign;
  full_name: string;
  phone_number: string;
  department: string;
  department_detail?: Department;
  payment_plan: string;
  payment_plan_detail?: {
    id: string;
    name: string;
    base_amount: number;
    penalty_amount: number;
    installment_count: number;
    total_amount: number;
    installment_amount: number;
  };
  lottery_number: string;
  is_eligible: boolean;
  installments?: Installment[];
  created_at: string;
  updated_at: string;
}

export interface Winner {
  id: string;
  campaign: string;
  campaign_title: string;
  registration: string;
  registration_detail: Registration;
  draw_time: string;
  rank: number;
  prize_description: string;
}

export interface AuditLog {
  id: string;
  action: string;
  performed_by: string | null;
  username: string;
  details: Record<string, any>;
  timestamp: string;
}
