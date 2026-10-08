import React, { useState } from 'react';
import { AppSettings, FilterState, ShiftType, Visitor, VisitorStatus } from '../types';
import { formatPhone, maskPhone, maskText, getShiftLabel } from '../utils/storage';
import { buildWelcomeMessage, buildWhatsAppLink } from '../utils/whatsapp';
import {
  Search,
  Filter,
  Tv,
  MessageCircle,
  Edit2,
  Trash2,
  Heart,
  UserCheck,
  Sparkles,
  Calendar,
  Clock,
  Phone,
  MapPin,
  ExternalLink,
  ChevronDown,
  CheckCircle2,
  Users,
  QrCode,
  AlertCircle,
} from 'lucide-react';

interface VisitorListProps {
  visitors: Visitor[];
  settings: AppSettings;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onToggleProjected: (id: string) => void;
  onUpdateStatus: (id: string, status: VisitorStatus) => void;
  onEditVisitor: (visitor: Visitor) => void;
  onDeleteVisitor: (id: string) => void;
  onOpenNewVisitor: () => void;
  onOpenProjection: () => void;
}

export const VisitorList: React.FC<VisitorListProps> = ({
  visitors,
  settings,
  filters,
  setFilters,
  onToggleProjected,
  onUpdateStatus,
  onEditVisitor,
  onDeleteVisitor,
  onOpenNewVisitor,
  onOpenProjection,
}) => {
  const [selectedVisitorForDetails, setSelectedVisitorForDetails] = useState<Visitor | null>(null);

  // Filter application
  const filteredVisitors = visitors.filter((v) => {
    // Search query
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matchName = v.name.toLowerCase().includes(q);
      const matchPhone = (v.phone || '').includes(q);
      const matchInvited = (v.invitedBy || '').toLowerCase().includes(q);
      const matchCity = (v.neighborhood || v.city || '').toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchInvited && !matchCity) return false;
    }

    // Shift filter
    if (filters.shift !== 'all' && v.shift !== filters.shift) {
      return false;
    }

    // Culto filter
    if (filters.cultoId !== 'all' && v.cultoId !== filters.cultoId) {
      return false;
    }

    // Status filter
    if (filters.status !== 'all' && v.status !== filters.status) {
      return false;
    }

    // Projected filter
    if (filters.projectedOnly && !v.projected) {
      return false;
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const visitorDate = new Date(v.createdAt);
      const now = new Date();
      const visitorDateOnly = new Date(visitorDate.getFullYear(), visitorDate.getMonth(), visitorDate.getDate()).getTime();
      const todayDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

      if (filters.dateRange === 'today') {
        if (visitorDateOnly !== todayDateOnly) return false;
      } else if (filters.dateRange === 'week') {
        const diffDays = (todayDateOnly - visitorDateOnly) / (1000 * 60 * 60 * 24);
        if (diffDays > 7 || diffDays < 0) return false;
      } else if (filters.dateRange === 'month') {
        const diffDays = (todayDateOnly - visitorDateOnly) / (1000 * 60 * 60 * 24);
        if (diffDays > 30 || diffDays < 0) return false;
      }
    }

    return true;
  });

  // Calculate live statistics
  const totalCount = filteredVisitors.length;
  const firstTimeCount = filteredVisitors.filter((v) => v.isFirstTime).length;
  const firstTimePercentage = totalCount > 0 ? Math.round((firstTimeCount / totalCount) * 100) : 0;
  const projectedCount = filteredVisitors.filter((v) => v.projected).length;
  const prayerCount = filteredVisitors.filter((v) => !!v.prayerRequest).length;

  const handleSendWhatsApp = (visitor: Visitor) => {
    if (!visitor.phone) return;
    const msg = buildWelcomeMessage(visitor, settings);
    const link = buildWhatsAppLink(visitor.phone, msg);
    window.open(link, '_blank');
  };

  return (
    <div className="space-y-6">
      
      {/* KPI Cards Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Visitantes
            </span>
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
              {totalCount}
            </span>
            <span className="text-xs text-slate-500 font-medium">filtrados</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Primeira Vez
            </span>
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-800 tabular-nums">
              {firstTimeCount}
            </span>
            <span className="text-xs text-amber-700/80 font-medium">
              ({firstTimePercentage}%)
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              No Telão
            </span>
            <Tv className="w-3.5 h-3.5 text-sky-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-sky-900 tabular-nums">
              {projectedCount}
            </span>
            <button
              onClick={onOpenProjection}
              className="text-xs text-sky-700 hover:text-sky-900 font-semibold underline underline-offset-2 ml-auto"
            >
              Abrir Telão
            </button>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pedidos Oração
            </span>
            <Heart className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-800 tabular-nums">
              {prayerCount}
            </span>
            <span className="text-xs text-slate-500 font-medium">motivos</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome, telefone, bairro ou quem convidou..."
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none"
            />
          </div>

          {/* Quick Filters (Culto, Turno, Período) */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Culto Selector */}
            <select
              value={filters.cultoId}
              onChange={(e) => setFilters((prev) => ({ ...prev, cultoId: e.target.value }))}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none hover:bg-slate-100 focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="all">Todos os Cultos / Eventos</option>
              {settings.customEvents.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name}
                </option>
              ))}
            </select>

            {/* Turno Selector */}
            <select
              value={filters.shift}
              onChange={(e) => setFilters((prev) => ({ ...prev, shift: e.target.value }))}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none hover:bg-slate-100 focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="all">Todos os Turnos</option>
              <option value="manha">Manhã</option>
              <option value="tarde">Tarde</option>
              <option value="noite">Noite</option>
            </select>

            {/* Período */}
            <select
              value={filters.dateRange}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  dateRange: e.target.value as 'today' | 'week' | 'month' | 'all',
                }))
              }
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none hover:bg-slate-100 focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="today">Hoje</option>
              <option value="week">Últimos 7 dias</option>
              <option value="month">Este Mês</option>
              <option value="all">Todas as Datas</option>
            </select>

            {/* Filter Toggle: Only Projected */}
            <button
              type="button"
              onClick={() => setFilters((prev) => ({ ...prev, projectedOnly: !prev.projectedOnly }))}
              className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                filters.projectedOnly
                  ? 'bg-amber-100 text-amber-900 border-amber-300 font-semibold'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Apenas no Telão</span>
            </button>
          </div>
        </div>

        {/* Clear Filters Reset */}
        {(filters.search || filters.shift !== 'all' || filters.cultoId !== 'all' || filters.projectedOnly || filters.dateRange !== 'today') && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500">Filtros ativos aplicados</span>
            <button
              onClick={() =>
                setFilters({
                  search: '',
                  shift: 'all',
                  cultoId: 'all',
                  dateRange: 'all',
                  status: 'all',
                  projectedOnly: false,
                })
              }
              className="text-amber-800 hover:underline font-semibold"
            >
              Limpar todos os filtros
            </button>
          </div>
        )}
      </div>

      {/* Visitors List / Empty State */}
      {filteredVisitors.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs">
          <div className="w-14 h-14 bg-amber-50 text-amber-700 rounded-2xl mx-auto flex items-center justify-center mb-3">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Nenhum visitante encontrado</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {filters.search || filters.shift !== 'all' || filters.cultoId !== 'all'
              ? 'Tente ajustar os filtros acima para visualizar outros registros.'
              : 'Seja o primeiro a registrar um visitante para este culto ou compartilhe o QR Code para auto-atendimento.'}
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              onClick={onOpenNewVisitor}
              type="button"
              className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs shadow-xs transition-colors"
            >
              + Cadastrar Novo Visitante
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1 text-xs text-slate-500">
            <span>Listando {filteredVisitors.length} visitantes</span>
            <span className="font-medium">
              Dica: Clique no ícone do Telão para ativar/desativar a projeção instantânea
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {filteredVisitors.map((v) => {
              const displayPhone = settings.isPrivacyLocked || settings.maskSensitiveData
                ? maskPhone(v.phone)
                : formatPhone(v.phone);

              const displayPrayer = settings.isPrivacyLocked || settings.maskSensitiveData
                ? maskText(v.prayerRequest)
                : v.prayerRequest;

              const isRecentlyAdded =
                Date.now() - new Date(v.createdAt).getTime() < 1000 * 60 * 30; // within 30 min

              return (
                <div
                  key={v.id}
                  className={`bg-white border rounded-2xl p-4 sm:p-5 transition-all shadow-xs hover:border-slate-300 ${
                    v.projected ? 'border-amber-300/80 ring-1 ring-amber-300/40' : 'border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    
                    {/* Left: Info */}
                    <div className="space-y-2 flex-1 min-w-0">
                      
                      {/* Name & First Time */}
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                          {v.name}
                        </h4>

                        {v.isFirstTime && (
                          <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md">
                            1ª Vez Conosco
                          </span>
                        )}

                        {isRecentlyAdded && (
                          <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Chegou Agora
                          </span>
                        )}

                        {v.source === 'whatsapp_bot' && (
                          <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50/60 px-2 py-0.5 rounded-md">
                            Via WhatsApp Bot
                          </span>
                        )}

                        {v.source === 'qrcode_totem' && (
                          <span className="text-[11px] font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                            Via QR Code
                          </span>
                        )}
                      </div>

                      {/* Culto / Turno / Data */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                        <span className="font-semibold text-slate-700 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-amber-700" />
                          {v.cultoName}
                        </span>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          Turno: {getShiftLabel(v.shift)}
                        </span>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span>
                          {new Date(v.createdAt).toLocaleDateString('pt-BR')} às{' '}
                          {new Date(v.createdAt).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      {/* Phone & Location */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                        {v.phone && (
                          <span className="flex items-center gap-1 font-mono text-slate-800">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            {displayPhone}
                          </span>
                        )}

                        {(v.neighborhood || v.city) && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {v.neighborhood ? `${v.neighborhood}` : ''}
                            {v.neighborhood && v.city ? ` · ` : ''}
                            {v.city ? `${v.city}` : ''}
                          </span>
                        )}

                        {v.invitedBy && (
                          <span className="text-slate-500">
                            Convidado por: <strong className="text-slate-700 font-medium">{v.invitedBy}</strong>
                          </span>
                        )}
                      </div>

                      {/* Prayer Request Quote */}
                      {v.prayerRequest && (
                        <div className="p-2.5 bg-rose-50/60 border border-rose-100 rounded-xl text-xs text-rose-950 flex items-start gap-2 max-w-2xl">
                          <Heart className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-rose-900">Motivo de Oração: </span>
                            <span>{displayPrayer}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right: Quick Action Controls */}
                    <div className="flex flex-wrap sm:flex-col items-end sm:items-stretch gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                      
                      {/* Telão Toggle Button */}
                      <button
                        type="button"
                        onClick={() => onToggleProjected(v.id)}
                        className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                          v.projected
                            ? 'bg-amber-600 hover:bg-amber-700 text-white border-amber-600 shadow-xs'
                            : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                        title={v.projected ? 'Visitante ativo no Telão' : 'Clique para projetar este nome'}
                      >
                        <Tv className="w-3.5 h-3.5" />
                        <span>{v.projected ? 'No Telão' : '+ Adicionar Telão'}</span>
                      </button>

                      {/* WhatsApp Agradecimento Button */}
                      {v.phone && (
                        <button
                          type="button"
                          onClick={() => handleSendWhatsApp(v)}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs border border-emerald-200/80 transition-colors"
                          title="Enviar mensagem de carinho pelo WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Enviar Zap</span>
                        </button>
                      )}

                      {/* Edit & Delete Actions */}
                      <div className="flex items-center justify-end gap-1 w-full pt-1">
                        <button
                          onClick={() => onEditVisitor(v)}
                          type="button"
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Editar cadastro"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Tem certeza que deseja excluir o cadastro de ${v.name}?`)) {
                              onDeleteVisitor(v.id);
                            }
                          }}
                          type="button"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
