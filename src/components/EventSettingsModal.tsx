import React, { useState } from 'react';
import { AppSettings, ChurchEvent, ShiftType } from '../types';
import { getShiftLabel } from '../utils/storage';
import {
  Settings,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Church,
  Phone,
  BookOpen,
  Sparkles,
  Check,
  Tag,
  CheckCircle2,
} from 'lucide-react';

interface EventSettingsModalProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
}

export const EventSettingsModal: React.FC<EventSettingsModalProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const [churchName, setChurchName] = useState(settings.churchName);
  const [whatsappContact, setWhatsappContact] = useState(settings.whatsappContact);
  const [welcomeVerse, setWelcomeVerse] = useState(settings.welcomeVerse);
  const [welcomeVerseReference, setWelcomeVerseReference] = useState(settings.welcomeVerseReference);
  const [projectionSubtitle, setProjectionSubtitle] = useState(settings.projectionSubtitle);
  
  // New event form state
  const [newEventName, setNewEventName] = useState('');
  const [newEventCategory, setNewEventCategory] = useState<ChurchEvent['category']>('culto_regular');
  const [newEventShift, setNewEventShift] = useState<ShiftType>('noite');
  const [newEventDay, setNewEventDay] = useState('');
  const [eventsList, setEventsList] = useState<ChurchEvent[]>(settings.customEvents);
  const [savedAlert, setSavedAlert] = useState(false);

  const handleAddEvent = () => {
    if (!newEventName.trim()) return;

    const newEvent: ChurchEvent = {
      id: `ev-${Date.now()}`,
      name: newEventName.trim(),
      category: newEventCategory,
      defaultShift: newEventShift,
      dayOfWeek: newEventDay.trim() || undefined,
      active: true,
    };

    const updated = [...eventsList, newEvent];
    setEventsList(updated);
    setNewEventName('');
    setNewEventDay('');

    // Save
    onUpdateSettings({
      ...settings,
      customEvents: updated,
    });
  };

  const handleToggleEventActive = (id: string) => {
    const updated = eventsList.map((e) => (e.id === id ? { ...e, active: !e.active } : e));
    setEventsList(updated);
    onUpdateSettings({
      ...settings,
      customEvents: updated,
    });
  };

  const handleDeleteEvent = (id: string) => {
    if (eventsList.length <= 1) {
      alert('É necessário manter ao menos 1 culto/evento cadastrado no sistema.');
      return;
    }
    const updated = eventsList.filter((e) => e.id !== id);
    setEventsList(updated);
    onUpdateSettings({
      ...settings,
      customEvents: updated,
    });
  };

  const handleSaveGeneralSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      ...settings,
      churchName: churchName.trim(),
      whatsappContact: whatsappContact.trim(),
      welcomeVerse: welcomeVerse.trim(),
      welcomeVerseReference: welcomeVerseReference.trim(),
      projectionSubtitle: projectionSubtitle.trim(),
      customEvents: eventsList,
    });
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-150">
      
      {/* Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-700" />
            Configuração de Cultos, Eventos & Recepção
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Personalize os cultos da sua igreja, tipos de conferências e contatos para os filtros da busca.
          </p>
        </div>

        {savedAlert && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            Configurações salvas!
          </div>
        )}
      </div>

      {/* SECTION 1: CULTOS & EVENTOS MANAGEMENT */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-700" />
            Cultos e Tipos de Eventos Cadastrados
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Estes eventos aparecem nas opções de cadastro e como filtros na busca de dados em tempo real.
          </p>
        </div>

        {/* Add New Event Form */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
            + Adicionar Novo Culto ou Evento Especial
          </span>
          
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-4">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Nome do Culto / Evento
              </label>
              <input
                type="text"
                placeholder="Ex: Encontro de Casais, Conferência de Jovens..."
                value={newEventName}
                onChange={(e) => setNewEventName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Categoria
              </label>
              <select
                value={newEventCategory}
                onChange={(e) => setNewEventCategory(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-amber-500/20 outline-none"
              >
                <option value="culto_regular">Culto Regular</option>
                <option value="evento_especial">Evento Especial</option>
                <option value="congresso">Congresso / Conferência</option>
                <option value="reuniao">Reunião / Grupo</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Turno Padrão
              </label>
              <select
                value={newEventShift}
                onChange={(e) => setNewEventShift(e.target.value as ShiftType)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-amber-500/20 outline-none"
              >
                <option value="manha">Manhã</option>
                <option value="tarde">Tarde</option>
                <option value="noite">Noite</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Dia (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ex: Domingo"
                value={newEventDay}
                onChange={(e) => setNewEventDay(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-amber-500/20 outline-none"
              />
            </div>

            <div className="sm:col-span-1 flex items-end">
              <button
                type="button"
                onClick={handleAddEvent}
                className="w-full py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center transition-colors"
                title="Adicionar Evento"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Existing Events List */}
        <div className="space-y-2">
          {eventsList.map((ev) => (
            <div
              key={ev.id}
              className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                ev.active
                  ? 'bg-white border-slate-200'
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => handleToggleEventActive(ev.id)}
                  className={`w-5 h-5 rounded-md flex items-center justify-center border text-xs transition-colors ${
                    ev.active
                      ? 'bg-amber-700 border-amber-700 text-white'
                      : 'border-slate-300 bg-white'
                  }`}
                  title={ev.active ? 'Culto ativo' : 'Culto inativo'}
                >
                  {ev.active && <Check className="w-3 h-3 stroke-[3]" />}
                </button>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 text-sm">{ev.name}</span>
                    {ev.dayOfWeek && (
                      <span className="text-xs text-slate-400">({ev.dayOfWeek})</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span className="capitalize">{ev.category.replace('_', ' ')}</span>
                    <span aria-hidden="true">·</span>
                    <span>Turno padrão: {getShiftLabel(ev.defaultShift)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleDeleteEvent(ev.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Excluir evento"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: GERAL & TELÃO SETTINGS */}
      <form onSubmit={handleSaveGeneralSettings} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Church className="w-4 h-4 text-amber-700" />
            Dados da Igreja & Telão de Projeção
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Personalize o nome da igreja, versículo projetado e número do WhatsApp.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nome da Igreja
            </label>
            <input
              type="text"
              value={churchName}
              onChange={(e) => setChurchName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              WhatsApp da Recepção (com DDI e DDD)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={whatsappContact}
                onChange={(e) => setWhatsappContact(e.target.value)}
                placeholder="5511999998888"
                className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 font-mono text-slate-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Para onde os dados dos visitantes serão enviados no auto-atendimento.
            </p>
          </div>
        </div>

        <div className="space-y-4 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
            Mensagens de Boas-Vindas no Telão
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Versículo de Boas-Vindas (Exibido no rodapé do Telão)
              </label>
              <input
                type="text"
                value={welcomeVerse}
                onChange={(e) => setWelcomeVerse(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-amber-500/20 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Referência Bíblica
              </label>
              <input
                type="text"
                value={welcomeVerseReference}
                onChange={(e) => setWelcomeVerseReference(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-amber-500/20 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Frase de Boas-Vindas Principal
            </label>
            <input
              type="text"
              value={projectionSubtitle}
              onChange={(e) => setProjectionSubtitle(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-amber-500/20 outline-none"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs shadow-xs transition-colors"
          >
            Salvar Alterações
          </button>
        </div>
      </form>
    </div>
  );
};
