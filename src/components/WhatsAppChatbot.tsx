import React, { useState, useEffect, useRef } from 'react';
import { AppSettings, ShiftType, Visitor, VisitorInterest } from '../types';
import { buildVisitorRegistrationWhatsAppMessage, buildWhatsAppLink, normalizePhoneForWhatsApp } from '../utils/whatsapp';
import confetti from 'canvas-confetti';
import {
  Send,
  MessageSquare,
  Bot,
  User,
  CheckCheck,
  Sparkles,
  Phone,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  QrCode,
  Heart,
  Share2,
} from 'lucide-react';

interface WhatsAppChatbotProps {
  settings: AppSettings;
  activeShift: ShiftType;
  activeCultoId: string;
  onRegisterVisitor: (visitor: Visitor, openWhatsAppPrompt?: boolean) => void;
  onUpdateWhatsAppContact: (newNumber: string) => void;
  onOpenQrCode: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  options?: string[];
}

export const WhatsAppChatbot: React.FC<WhatsAppChatbotProps> = ({
  settings,
  activeShift,
  activeCultoId,
  onRegisterVisitor,
  onUpdateWhatsAppContact,
  onOpenQrCode,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [step, setStep] = useState<number>(0);
  const [isTyping, setIsTyping] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    phone: string;
    neighborhood: string;
    isFirstTime: boolean;
    invitedBy: string;
    prayerRequest: string;
  }>({
    name: '',
    phone: '',
    neighborhood: '',
    isFirstTime: true,
    invitedBy: '',
    prayerRequest: '',
  });
  const [isFinished, setIsFinished] = useState(false);
  const [editingWhatsApp, setEditingWhatsApp] = useState(settings.whatsappContact || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeCulto = settings.customEvents.find((e) => e.id === activeCultoId) || settings.customEvents[0];
  const cultoName = activeCulto ? activeCulto.name : 'Culto de Celebração';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Initialize bot greeting
  useEffect(() => {
    resetChat();
  }, [settings.churchName]);

  const resetChat = () => {
    setIsFinished(false);
    setStep(0);
    setFormData({
      name: '',
      phone: '',
      neighborhood: '',
      isFirstTime: true,
      invitedBy: '',
      prayerRequest: '',
    });

    const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    setMessages([
      {
        id: 'msg-1',
        sender: 'bot',
        text: `Graça e paz! 🙏 Bem-vindo(a) à ${settings.churchName || 'nossa igreja'}! Ficamos imensamente felizes com a sua visita hoje no ${cultoName}!`,
        timestamp: now,
      },
      {
        id: 'msg-2',
        sender: 'bot',
        text: 'Para começarmos e podermos te abençoar, qual é o seu *Nome Completo*?',
        timestamp: now,
      },
    ]);
  };

  const addBotMessage = (text: string, options?: string[], nextStepNumber?: number) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text,
          timestamp: time,
          options,
        },
      ]);
      if (typeof nextStepNumber === 'number') {
        setStep(nextStepNumber);
      }
    }, 700);
  };

  const handleUserInput = (text: string) => {
    if (!text.trim()) return;

    const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: time,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    // Step logic
    if (step === 0) {
      // Name received
      setFormData((prev) => ({ ...prev, name: text }));
      addBotMessage(
        `Prazer em te conhecer, *${text}*! 😊\n\nPoderia me informar o seu *número de WhatsApp com DDD* para nossa equipe poder te enviar um versículo e uma mensagem de acolhimento?`,
        undefined,
        1
      );
    } else if (step === 1) {
      // Phone received
      setFormData((prev) => ({ ...prev, phone: text }));
      addBotMessage(
        `Perfeito! Qual é o seu *Bairro ou Cidade* onde você mora?`,
        undefined,
        2
      );
    } else if (step === 2) {
      // Neighborhood / City received
      setFormData((prev) => ({ ...prev, neighborhood: text }));
      addBotMessage(
        `Maravilha! E conta pra gente: é a sua *primeira vez* aqui conosco ou você já nos visitou antes?`,
        ['✨ É minha 1ª vez!', 'Já visitei antes', 'Sou de outra cidade/igreja'],
        3
      );
    } else if (step === 3) {
      // First time choice
      const isFirst = !text.toLowerCase().includes('já');
      setFormData((prev) => ({ ...prev, isFirstTime: isFirst }));
      addBotMessage(
        `Que alegria! Como você conheceu a nossa igreja ou *quem te convidou* para estar conosco hoje?`,
        ['Amigo ou Familiar', 'Redes Sociais / Instagram', 'Passou em frente', 'Convite de Célula / Grupo'],
        4
      );
    } else if (step === 4) {
      // Invited by received
      setFormData((prev) => ({ ...prev, invitedBy: text }));
      addBotMessage(
        `Estamos quase terminando! Você gostaria de deixar algum *pedido de oração* ou motivo de gratidão para nossos pastores e intercessores orarem por você hoje? 🙏`,
        ['Não, apenas agradecer a Deus!', 'Pela saúde da minha família', 'Por direção e portas abertas'],
        5
      );
    } else if (step === 5) {
      // Prayer request received
      const prayer = text.includes('Não, apenas') ? 'Agradecimento a Deus' : text;
      setFormData((prev) => ({ ...prev, prayerRequest: prayer }));

      // Complete
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          const finishTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
          setMessages((prev) => [
            ...prev,
            {
              id: `bot-fin`,
              sender: 'bot',
              text: `Glória a Deus, *${formData.name || text}*! 🎉 Seu registro foi concluído com muito carinho!\n\nAgora você pode clicar no botão abaixo para *enviar sua mensagem diretamente para o WhatsApp da igreja*, e seu nome já será preparado para as boas-vindas no telão!`,
              timestamp: finishTime,
            },
          ]);
          setIsFinished(true);
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
          });
        }, 800);
      }, 300);
      setStep(6);
    }
  };

  const handleFinishAndSave = (sendToWhatsAppNumber = false) => {
    const finalVisitor: Visitor = {
      id: `vis-${Date.now()}`,
      name: formData.name || 'Visitante',
      phone: formData.phone || '',
      neighborhood: formData.neighborhood || '',
      city: '',
      invitedBy: formData.invitedBy || 'WhatsApp Bot',
      isFirstTime: formData.isFirstTime,
      interest: 'conhecer' as VisitorInterest,
      prayerRequest: formData.prayerRequest,
      cultoId: activeCultoId !== 'all' ? activeCultoId : settings.customEvents[0]?.id || 'culto-celebracao',
      cultoName: cultoName,
      shift: activeShift,
      createdAt: new Date().toISOString(),
      status: 'novo',
      source: 'whatsapp_bot',
      projected: true,
      notes: 'Cadastrado pelo auto-atendimento Chatbot WhatsApp',
    };

    onRegisterVisitor(finalVisitor, false);

    if (sendToWhatsAppNumber) {
      const msg = buildVisitorRegistrationWhatsAppMessage(finalVisitor, settings);
      const link = buildWhatsAppLink(settings.whatsappContact, msg);
      window.open(link, '_blank');
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const handleSaveWhatsAppPhone = () => {
    onUpdateWhatsAppContact(editingWhatsApp);
    alert('Número de WhatsApp da recepção atualizado com sucesso!');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* Left Column: WhatsApp Chatbot Simulator Screen */}
      <div className="lg:col-span-7 flex flex-col items-center">
        <div className="w-full max-w-md bg-[#efeae2] rounded-3xl overflow-hidden shadow-xl border border-slate-300 flex flex-col h-[650px] relative">
          
          {/* WhatsApp Header */}
          <div className="bg-[#008069] text-white px-4 py-3 flex items-center justify-between shadow-xs z-10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-white shadow-inner">
                <Bot className="w-5 h-5 text-amber-200" />
              </div>
              <div>
                <h3 className="font-semibold text-sm leading-tight flex items-center gap-1.5">
                  <span>Recepção {settings.churchName}</span>
                </h3>
                <p className="text-[11px] text-emerald-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
                  {isTyping ? 'digitando...' : 'online'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-white/90">
              <button
                onClick={resetChat}
                type="button"
                className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                title="Reiniciar conversa"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-[radial-gradient(#d1d7db_1px,transparent_1px)] [background-size:16px_16px]">
            
            {/* Encryption & Greeting Notice */}
            <div className="text-center my-2">
              <span className="bg-[#ffeecd] text-[#54656f] text-[10px] px-2.5 py-1 rounded-md shadow-2xs inline-block">
                🔒 Canal oficial de boas-vindas da igreja. Seus dados estão seguros.
              </span>
            </div>

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-xs text-xs sm:text-[13px] leading-relaxed whitespace-pre-line ${
                    msg.sender === 'user'
                      ? 'bg-[#d9fdd3] text-[#111b21] rounded-tr-xs'
                      : 'bg-white text-[#111b21] rounded-tl-xs'
                  }`}
                >
                  <p>{msg.text}</p>
                  <div
                    className={`flex items-center justify-end gap-1 text-[10px] text-slate-400 mt-1 ${
                      msg.sender === 'user' ? 'text-emerald-700' : ''
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {msg.sender === 'user' && <CheckCheck className="w-3.5 h-3.5" />}
                  </div>
                </div>

                {/* Quick Reply Buttons underneath bot message */}
                {msg.options && !isFinished && (
                  <div className="flex flex-wrap gap-1.5 mt-2 max-w-[88%]">
                    {msg.options.map((option, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleUserInput(option)}
                        className="bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-3 py-1.5 rounded-full text-xs font-medium shadow-2xs transition-all active:scale-95 text-left"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 bg-white text-slate-400 px-3.5 py-2 rounded-2xl rounded-tl-xs w-20 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]"></span>
              </div>
            )}

            {/* Post Finish Card */}
            {isFinished && (
              <div className="bg-white border-2 border-emerald-500 rounded-2xl p-4 shadow-md text-center space-y-3 animate-in zoom-in-95 duration-200">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Cadastro Finalizado!
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Nome: <strong>{formData.name}</strong> · WhatsApp: <strong>{formData.phone}</strong>
                  </p>
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleFinishAndSave(true)}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#1faa53] text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Enviar para o WhatsApp da Recepção</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFinishAndSave(false)}
                    className="w-full py-2 px-3 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                    <span>Salvar no Telão de Boas-Vindas</span>
                  </button>
                </div>

                {savedSuccess && (
                  <p className="text-xs text-emerald-700 font-semibold bg-emerald-50 py-1 rounded-md">
                    ✓ Registrado com sucesso no sistema em tempo real!
                  </p>
                )}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="bg-[#f0f2f5] px-3 py-2.5 flex items-center gap-2 border-t border-slate-200 shrink-0">
            <input
              type="text"
              disabled={isFinished}
              placeholder={isFinished ? 'Atendimento concluído!' : 'Digite sua resposta aqui...'}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleUserInput(inputText);
                }
              }}
              className="flex-1 bg-white border border-slate-300 rounded-full px-4 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008069]/40 disabled:bg-slate-100 placeholder:text-slate-400"
            />
            <button
              type="button"
              disabled={isFinished || !inputText.trim()}
              onClick={() => handleUserInput(inputText)}
              className="w-9 h-9 rounded-full bg-[#008069] text-white flex items-center justify-center hover:bg-[#00705a] disabled:opacity-40 disabled:hover:bg-[#008069] transition-colors shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Church Reception WhatsApp Setup & Visitor Sharing */}
      <div className="lg:col-span-5 space-y-5">
        
        {/* Destination WhatsApp Phone Setup */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 text-slate-900">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">WhatsApp da Recepção da Igreja</h3>
              <p className="text-xs text-slate-500">
                Para onde os dados dos visitantes serão encaminhados
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Número com DDI e DDD (Apenas números)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ex: 5511999998888"
                value={editingWhatsApp}
                onChange={(e) => setEditingWhatsApp(e.target.value)}
                className="flex-1 px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 font-mono text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
              />
              <button
                type="button"
                onClick={handleSaveWhatsAppPhone}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold transition-colors shrink-0"
              >
                Salvar
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Você pode alterar esse número para o seu celular agora, e depois trocar para o celular do pastor ou da equipe de recepção.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Número ativo:</span>
            <span className="font-mono font-bold text-emerald-800">
              +{normalizePhoneForWhatsApp(settings.whatsappContact || '5511999998888')}
            </span>
          </div>
        </div>

        {/* QR Code & Direct Link for Church Visitors */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 text-amber-950">
            <div className="w-9 h-9 rounded-xl bg-amber-200/80 text-amber-900 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Disponibilizar aos Visitantes</h3>
              <p className="text-xs text-amber-800/80">
                Gere o QR Code para colocar nas cadeiras ou projetar no telão
              </p>
            </div>
          </div>

          <p className="text-xs text-amber-900 leading-relaxed">
            Os visitantes podem apontar a câmera do celular para responder esse mesmo chatbot de forma interativa, ou você pode usar como totem de recepção na entrada!
          </p>

          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <button
              type="button"
              onClick={onOpenQrCode}
              className="flex-1 py-2.5 px-4 bg-amber-800 hover:bg-amber-900 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Ver & Imprimir QR Code</span>
            </button>
          </div>
        </div>

        {/* How this works info card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs text-xs text-slate-600 space-y-2.5">
          <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Como o visitante entra pelo WhatsApp?</span>
          </h4>
          <ul className="space-y-1.5 list-disc list-inside text-slate-600">
            <li>
              <strong>Pelo Link / QR Code:</strong> O visitante abre o auto-atendimento no celular, responde as perguntas pré-configuradas e envia a mensagem pronta pro seu número.
            </li>
            <li>
              <strong>Tempo Real Instantâneo:</strong> Assim que ele preenche, os dados já caem no painel da recepção e podem ser projetados no telão no momento das boas-vindas!
            </li>
            <li>
              <strong>Zero complicação:</strong> Não precisa instalar nada, roda no navegador de qualquer smartphone.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
