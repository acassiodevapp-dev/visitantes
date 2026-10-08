import { Visitor, AppSettings } from '../types';

export function normalizePhoneForWhatsApp(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (!cleaned) return '';
  // If user only entered 10 or 11 digits without country code 55 (standard Brazil)
  if (cleaned.length === 10 || cleaned.length === 11) {
    cleaned = '55' + cleaned;
  }
  return cleaned;
}

export function buildWhatsAppLink(phone: string, message: string): string {
  const target = normalizePhoneForWhatsApp(phone);
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${target}?text=${encoded}`;
}

export function buildWelcomeMessage(visitor: Visitor, settings: AppSettings): string {
  const church = settings.churchName || 'nossa igreja';
  return `Olá ${visitor.name}! Graça e paz! 🙏✨\n\nFoi uma imensa alegria ter você conosco no ${visitor.cultoName} aqui na ${church}! Toda a nossa comunidade se alegra com a sua presença.\n\nEsperamos que tenha sido ricamente abençoado(a). Se precisar de qualquer coisa, oração ou se quiser conhecer mais sobre nossos ministérios, estamos de braços abertos!\n\nDeus abençoe você e sua família!`;
}

export function buildVisitorRegistrationWhatsAppMessage(visitor: Partial<Visitor>, settings: AppSettings): string {
  const church = settings.churchName || 'nossa igreja';
  const firstTimeText = visitor.isFirstTime ? 'Sim (1ª Vez)' : 'Já visitei antes';
  
  return `*NOVO CADASTRO DE VISITANTE - ${church.toUpperCase()}* ⛪\n\n` +
    `👤 *Nome:* ${visitor.name || 'Não informado'}\n` +
    `📱 *WhatsApp:* ${visitor.phone || 'Não informado'}\n` +
    `📍 *Bairro/Cidade:* ${visitor.neighborhood || visitor.city || 'Não informado'}\n` +
    `🤝 *Quem convidou:* ${visitor.invitedBy || 'Não informado'}\n` +
    `✨ *Primeira vez?* ${firstTimeText}\n` +
    `🎯 *Interesse:* ${visitor.interest || 'Conhecer a igreja'}\n` +
    `🙏 *Pedido de Oração:* ${visitor.prayerRequest || 'Nenhum'}\n` +
    `🏛️ *Culto/Evento:* ${visitor.cultoName || 'Culto de hoje'}\n` +
    `⏰ *Data:* ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}\n\n` +
    `_Enviado pelo sistema de recepção digital da igreja._`;
}
