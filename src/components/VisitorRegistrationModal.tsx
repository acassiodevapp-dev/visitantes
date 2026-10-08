import React, { useState, useEffect } from 'react';
import { AppSettings, ShiftType, Visitor, VisitorInterest, VisitorSource } from '../types';
import { getShiftLabel } from '../utils/storage';
import { buildWelcomeMessage, buildWhatsAppLink } from '../utils/whatsapp';
import { X, UserPlus, Phone, MapPin, Heart, BookOpen, Send, Sparkles, Check } from 'lucide-react';

interface VisitorRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (visitor: Visitor, openWhatsAppPrompt?: boolean) => void;
  settings: AppSettings;
  defaultShift: ShiftType;
  defaultCultoId: string;
  visitorToEdit?: Visitor | null;
}

export const VisitorRegistrationModal: React.FC<VisitorRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  settings,
  defaultShift,
  defaultCultoId,
  visitorToEdit,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [invitedBy, setInvitedBy] = useState('');
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [interest, setInterest] = useState<VisitorInterest>('conhecer');
  const [prayerRequest, setPrayerRequest] = useState('');
  const [cultoId, setCultoId] = useState(defaultCultoId);
  const [shift, setShift] = useState<ShiftType>(defaultShift);
  const [projected, setProjected] = useState(true);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (visitorToEdit) {
      setName(visitorToEdit.name);
      setPhone(visitorToEdit.phone || '');
      setNeighborhood(visitorToEdit.neighborhood || '');
      setCity(visitorToEdit.city || '');
      setInvitedBy(visitorToEdit.invitedBy || '');
      setIsFirstTime(visitorToEdit.isFirstTime);
      setInterest(visitorToEdit.interest || 'conhecer');
      setPrayerRequest(visitorToEdit.prayerRequest || '');
      setCultoId(visitorToEdit.cultoId);
      setShift(visitorToEdit.shift);
      setProjected(visitorToEdit.projected ?? true);
      setNotes(visitorToEdit.notes || '');
    } else {
      setName('');
      setPhone('');
      setNeighborhood('');
      setCity('');
      setInvitedBy('');
      setIsFirstTime(true);
      setInterest('conhecer');
      setPrayerRequest('');
      setCultoId(defaultCultoId !== 'all' ? defaultCultoId : settings.customEvents[0]?.id || 'culto-celebracao');
      setShift(defaultShift);
      setProjected(true);
      setNotes('');
    }
    setError('');
  }, [visitorToEdit, isOpen, defaultShift, defaultCultoId, settings.customEvents]);

  if (!isOpen) return null;

  const selectedCulto = settings.customEvents.find((e) => e.id === cultoId);
  const selectedCultoName = selectedCulto ? selectedCulto.name : 'Culto de Hoje';

  const handleSubmit = (sendWhatsAppMsg = false) => {
    if (!name.trim()) {
      setError('Por favor, informe ao menos o nome do visitante.');
      return;
    }

    const newVisitor: Visitor = {
      id: visitorToEdit ? visitorToEdit.id : `vis-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      neighborhood: neighborhood.trim(),
      city: city.trim(),
      invitedBy: invitedBy.trim(),
      isFirstTime,
      interest,
      prayerRequest: prayerRequest.trim(),
      cultoId: cultoId || settings.customEvents[0]?.id || 'geral',
      cultoName: selectedCultoName,
      shift,
      createdAt: visitorToEdit ? visitorToEdit.createdAt : new Date().toISOString(),
      status: visitorToEdit ? visitorToEdit.status : 'recepcionado',
      source: visitorToEdit ? visitorToEdit.source : 'recepcao',
      projected,
      notes: notes.trim(),
    };

    onSave(newVisitor, sendWhatsAppMsg);
    onClose();
  };

  const quickInviters = ['Amigo / Vizinho', 'Familiar', 'Instagram / Redes Sociais', 'Passou em frente', 'Convite de Célula'];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-800 to-amber-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {visitorToEdit ? 'Editar Dados do Visitante' : 'Cadastrar Novo Visitante'}
              </h2>
              <p className="text-xs text-amber-200">
                Recepção e Acolhimento da Igreja
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-800 rounded-xl font-medium">
              {error}
            </div>
          )}

          {/* Context: Culto & Turno */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-amber-50/60 border border-amber-200/60 rounded-xl">
            <div>
              <label className="block text-xs font-semibold text-amber-950 mb-1">
                Culto / Evento
              </label>
              <select
                value={cultoId}
                onChange={(e) => setCultoId(e.target.value)}
                className="w-full bg-white border border-amber-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none"
              >
                {settings.customEvents
                  .filter((e) => e.active)
                  .map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.name} ({ev.category === 'culto_regular' ? 'Culto' : 'Evento Especial'})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-amber-950 mb-1">
                Turno
              </label>
              <div className="grid grid-cols-3 gap-1">
                {(['manha', 'tarde', 'noite'] as ShiftType[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setShift(s)}
                    className={`py-1.5 text-xs font-medium rounded-lg transition-all ${
                      shift === s
                        ? 'bg-amber-700 text-white shadow-xs font-semibold'
                        : 'bg-white text-slate-700 border border-amber-200/80 hover:bg-amber-100/50'
                    }`}
                  >
                    {getShiftLabel(s)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Nome Completo */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Nome Completo do Visitante <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Carlos Eduardo e Família"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none placeholder:text-slate-400"
            />
          </div>

          {/* Telefone / WhatsApp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                WhatsApp / Celular com DDD
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  placeholder="(11) 98765-4321"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none placeholder:text-slate-400"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Usado para mandar mensagem de agradecimento pelo culto.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Bairro / Cidade
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Ex: Bairro Centro / São Paulo"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Quem Convidou */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Quem convidou / Como conheceu?
            </label>
            <input
              type="text"
              placeholder="Ex: Convidado pelo irmão Marcos da célula"
              value={invitedBy}
              onChange={(e) => setInvitedBy(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none placeholder:text-slate-400"
            />
            {/* Quick chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {quickInviters.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setInvitedBy(tag)}
                  className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium transition-colors"
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Primeira Vez & Interesse */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Frequência de Visita
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsFirstTime(true)}
                  className={`py-2 px-3 text-xs font-medium rounded-xl border transition-all text-center ${
                    isFirstTime
                      ? 'bg-amber-700 text-white border-amber-700 shadow-xs font-semibold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  ✨ Primeira Vez
                </button>
                <button
                  type="button"
                  onClick={() => setIsFirstTime(false)}
                  className={`py-2 px-3 text-xs font-medium rounded-xl border transition-all text-center ${
                    !isFirstTime
                      ? 'bg-amber-700 text-white border-amber-700 shadow-xs font-semibold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Já visitou antes
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Interesse do Visitante
              </label>
              <select
                value={interest}
                onChange={(e) => setInterest(e.target.value as VisitorInterest)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none"
              >
                <option value="conhecer">Apenas conhecer o culto</option>
                <option value="quer_fazer_parte">Quer congregar / ser membro</option>
                <option value="quer_batismo">Interesse em batismo</option>
                <option value="quer_visita">Gostaria de uma visita pastoral</option>
                <option value="oracao_apenas">Busca apenas oração</option>
                <option value="outro">Outro interesse</option>
              </select>
            </div>
          </div>

          {/* Pedido de Oração */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              <span>Pedido de Oração / Motivo de Agradecimento (Opcional)</span>
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Oração pela saúde da mãe, agradecimento por emprego novo..."
              value={prayerRequest}
              onChange={(e) => setPrayerRequest(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none placeholder:text-slate-400"
            ></textarea>
          </div>

          {/* Checkbox Telão */}
          <label className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100/70 transition-colors">
            <input
              type="checkbox"
              checked={projected}
              onChange={(e) => setProjected(e.target.checked)}
              className="mt-0.5 rounded text-amber-700 focus:ring-amber-500 w-4 h-4 border-slate-300"
            />
            <div>
              <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Incluir no Telão de Boas-Vindas (Projeção)
              </span>
              <p className="text-[11px] text-slate-500">
                O nome deste visitante aparecerá automaticamente no telão para ser recepcionado no púlpito.
              </p>
            </div>
          </label>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 font-medium text-xs transition-colors text-center order-2 sm:order-1"
          >
            Cancelar
          </button>

          <div className="w-full sm:w-auto flex items-center gap-2 order-1 sm:order-2">
            {phone && (
              <button
                type="button"
                onClick={() => handleSubmit(true)}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-xs transition-colors"
                title="Cadastra o visitante e já abre o WhatsApp para enviar mensagem de acolhimento"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Salvar & Enviar Zap</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleSubmit(false)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs shadow-xs transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>{visitorToEdit ? 'Atualizar Dados' : 'Concluir Cadastro'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
