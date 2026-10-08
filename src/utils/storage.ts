import { AppSettings, ChurchEvent, ShiftType, Visitor } from '../types';

export const DEFAULT_EVENTS: ChurchEvent[] = [
  {
    id: 'culto-familia',
    name: 'Culto da Família',
    category: 'culto_regular',
    defaultShift: 'manha',
    active: true,
    dayOfWeek: 'Domingo',
  },
  {
    id: 'culto-celebracao',
    name: 'Culto de Celebração',
    category: 'culto_regular',
    defaultShift: 'noite',
    active: true,
    dayOfWeek: 'Domingo',
  },
  {
    id: 'culto-jovens',
    name: 'Culto de Jovens (Conexão)',
    category: 'culto_regular',
    defaultShift: 'noite',
    active: true,
    dayOfWeek: 'Sábado',
  },
  {
    id: 'culto-doutrina',
    name: 'Culto de Oração & Ensino',
    category: 'culto_regular',
    defaultShift: 'noite',
    active: true,
    dayOfWeek: 'Quarta-feira',
  },
  {
    id: 'evento-mulheres',
    name: 'Encontro de Mulheres',
    category: 'evento_especial',
    defaultShift: 'tarde',
    active: true,
  },
  {
    id: 'evento-conferencia',
    name: 'Conferência / Congresso Especial',
    category: 'congresso',
    defaultShift: 'noite',
    active: true,
  },
];

export const DEFAULT_SETTINGS: AppSettings = {
  churchName: 'Igreja Comunidade da Graça',
  whatsappContact: '5511999998888', // Pode ser alterado nas configurações
  receptionLeaderName: 'Equipe de Boas-Vindas',
  adminPin: '1234',
  isPrivacyLocked: false,
  maskSensitiveData: false,
  projectionTheme: 'celestial_gold',
  welcomeVerse: 'Alegrei-me quando me disseram: Vamos à casa do Senhor.',
  welcomeVerseReference: 'Salmos 122:1',
  projectionSubtitle: 'É uma imensa alegria e privilégio receber você em nossa igreja!',
  chatbotGreeting: 'Graça e paz! Seja muito bem-vindo à nossa casa. Queremos te acolher com muito amor!',
  customEvents: DEFAULT_EVENTS,
};

export const INITIAL_VISITORS: Visitor[] = [
  {
    id: 'vis-1',
    name: 'Gabriel e Priscila Mendes',
    phone: '11987654321',
    city: 'São Paulo',
    neighborhood: 'Vila Mariana',
    invitedBy: 'Irmão Carlos (Célula Esperança)',
    isFirstTime: true,
    interest: 'conhecer',
    prayerRequest: 'Pela saúde da nossa família e nova oportunidade de emprego.',
    cultoId: 'culto-celebracao',
    cultoName: 'Culto de Celebração',
    shift: 'noite',
    createdAt: new Date().toISOString(),
    status: 'recepcionado',
    source: 'recepcao',
    projected: true,
    notes: 'Casal simpático, vieram pelo convite de amigos.',
  },
  {
    id: 'vis-2',
    name: 'Mariana Duarte de Oliveira',
    phone: '11977771234',
    city: 'São Paulo',
    neighborhood: 'Moema',
    invitedBy: 'Instagram da Igreja',
    isFirstTime: true,
    interest: 'quer_fazer_parte',
    prayerRequest: 'Direção espiritual e restauração.',
    cultoId: 'culto-celebracao',
    cultoName: 'Culto de Celebração',
    shift: 'noite',
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    status: 'novo',
    source: 'whatsapp_bot',
    projected: false,
    notes: 'Preencheu pelo auto-atendimento do WhatsApp.',
  },
  {
    id: 'vis-3',
    name: 'Lucas Ferreira dos Santos',
    phone: '11965439876',
    city: 'São Bernardo do Campo',
    neighborhood: 'Rudge Ramos',
    invitedBy: 'Passou em frente e entrou',
    isFirstTime: false,
    interest: 'quer_batismo',
    prayerRequest: 'Agradecimento pelo livramento e pedido por batismo nas águas.',
    cultoId: 'culto-celebracao',
    cultoName: 'Culto de Celebração',
    shift: 'noite',
    createdAt: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
    status: 'novo',
    source: 'qrcode_totem',
    projected: true,
    notes: 'Já veio 2 vezes, tem interesse no batismo.',
  },
];

const STORAGE_KEYS = {
  VISITORS: 'church_visitors_data_v1',
  SETTINGS: 'church_visitors_settings_v1',
  AUTH: 'church_visitors_auth_v1',
};

export function getStoredVisitors(): Visitor[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.VISITORS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.VISITORS, JSON.stringify(INITIAL_VISITORS));
      return INITIAL_VISITORS;
    }
    return JSON.parse(data);
  } catch (err) {
    console.error('Error loading visitors from localStorage:', err);
    return INITIAL_VISITORS;
  }
}

export function saveStoredVisitors(visitors: Visitor[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.VISITORS, JSON.stringify(visitors));
  } catch (err) {
    console.error('Error saving visitors to localStorage:', err);
  }
}

export function getStoredSettings(): AppSettings {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    const parsed = JSON.parse(data);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch (err) {
    console.error('Error loading settings from localStorage:', err);
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Error saving settings to localStorage:', err);
  }
}

export function detectCurrentShift(): ShiftType {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'manha';
  if (hour >= 12 && hour < 18) return 'tarde';
  return 'noite';
}

export function getShiftLabel(shift: ShiftType): string {
  switch (shift) {
    case 'manha':
      return 'Manhã';
    case 'tarde':
      return 'Tarde';
    case 'noite':
      return 'Noite';
  }
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length >= 10) {
    const ddd = digits.slice(0, 2);
    const last2 = digits.slice(-2);
    return `(${ddd}) •••••-••${last2}`;
  }
  return '••••••••';
}

export function maskText(text?: string): string {
  if (!text) return '';
  return '•••••••••••• (Confidencial)';
}

export function exportVisitorsToCsv(visitors: Visitor[]): void {
  const headers = [
    'ID',
    'Nome Completo',
    'Telefone / WhatsApp',
    'Cidade',
    'Bairro',
    'Quem Convidou',
    'Primeira Vez',
    'Interesse',
    'Culto / Evento',
    'Turno',
    'Data de Registro',
    'Status',
    'Origem',
    'Apresentado no Telão',
    'Pedido de Oração / Observações',
  ];

  const interestMap: Record<string, string> = {
    conhecer: 'Apenas conhecer',
    quer_visita: 'Gostaria de visita pastoral',
    quer_batismo: 'Interesse em batismo',
    quer_fazer_parte: 'Quer se tornar membro',
    oracao_apenas: 'Pedido de oração',
    outro: 'Outro',
  };

  const rows = visitors.map((v) => [
    v.id,
    `"${(v.name || '').replace(/"/g, '""')}"`,
    `"${(v.phone || '').replace(/"/g, '""')}"`,
    `"${(v.city || '').replace(/"/g, '""')}"`,
    `"${(v.neighborhood || '').replace(/"/g, '""')}"`,
    `"${(v.invitedBy || '').replace(/"/g, '""')}"`,
    v.isFirstTime ? 'Sim' : 'Não',
    `"${interestMap[v.interest] || v.interest}"`,
    `"${(v.cultoName || '').replace(/"/g, '""')}"`,
    getShiftLabel(v.shift),
    new Date(v.createdAt).toLocaleString('pt-BR'),
    v.status,
    v.source,
    v.projected ? 'Sim' : 'Não',
    `"${(v.prayerRequest || v.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `visitantes_igreja_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportBackupJson(visitors: Visitor[], settings: AppSettings): void {
  const data = {
    exportedAt: new Date().toISOString(),
    settings,
    visitors,
    version: '1.0',
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `backup_visitantes_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
