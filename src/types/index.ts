export type ShiftType = 'manha' | 'tarde' | 'noite';

export type VisitorStatus = 'novo' | 'recepcionado' | 'apresentado_telao' | 'contatado';

export type VisitorSource = 'recepcao' | 'whatsapp_bot' | 'qrcode_totem';

export type VisitorInterest = 
  | 'conhecer'
  | 'quer_visita'
  | 'quer_batismo'
  | 'quer_fazer_parte'
  | 'oracao_apenas'
  | 'outro';

export interface Visitor {
  id: string;
  name: string;
  phone: string;
  city?: string;
  neighborhood?: string;
  invitedBy?: string;
  isFirstTime: boolean;
  interest: VisitorInterest;
  prayerRequest?: string;
  cultoId: string;
  cultoName: string;
  shift: ShiftType;
  createdAt: string; // ISO format
  status: VisitorStatus;
  source: VisitorSource;
  projected: boolean;
  notes?: string;
}

export interface ChurchEvent {
  id: string;
  name: string;
  category: 'culto_regular' | 'evento_especial' | 'congresso' | 'reuniao';
  defaultShift: ShiftType;
  active: boolean;
  dayOfWeek?: string;
}

export interface ChatbotQuestion {
  id: string;
  prompt: string;
  field: 'name' | 'phone' | 'neighborhood' | 'isFirstTime' | 'invitedBy' | 'interest' | 'prayerRequest';
  quickOptions?: string[];
  placeholder?: string;
}

export interface AppSettings {
  churchName: string;
  whatsappContact: string; // format: 5511999999999
  receptionLeaderName?: string;
  adminPin: string;
  isPrivacyLocked: boolean;
  maskSensitiveData: boolean;
  projectionTheme: 'celestial_gold' | 'midnight_blue' | 'sacred_stone' | 'emerald_peace';
  welcomeVerse: string;
  welcomeVerseReference: string;
  projectionSubtitle: string;
  chatbotGreeting: string;
  customEvents: ChurchEvent[];
}

export interface FilterState {
  search: string;
  shift: string; // 'all' | 'manha' | 'tarde' | 'noite'
  cultoId: string; // 'all' | specific id
  dateRange: 'today' | 'week' | 'month' | 'all';
  status: 'all' | VisitorStatus;
  projectedOnly?: boolean;
}
