import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { AppSettings, ChurchEvent, ShiftType } from '../types';
import { getShiftLabel } from '../utils/storage';
import {
  Users,
  Tv,
  MessageSquare,
  Plus,
  Settings,
  Shield,
  ShieldAlert,
  QrCode,
  Sparkles,
  Church,
} from 'lucide-react';

interface NavbarProps {
  currentTab: 'realtime' | 'chatbot' | 'projection' | 'settings';
  setCurrentTab: (tab: 'realtime' | 'chatbot' | 'projection' | 'settings') => void;
  onOpenNewVisitor: () => void;
  onOpenPrivacy: () => void;
  onOpenQrCode: () => void;
  activeShift: ShiftType;
  setActiveShift: (shift: ShiftType) => void;
  activeCulto: string;
  setActiveCulto: (cultoId: string) => void;
  settings: AppSettings;
  visitorCountToday: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenNewVisitor,
  onOpenPrivacy,
  onOpenQrCode,
  activeShift,
  setActiveShift,
  activeCulto,
  setActiveCulto,
  settings,
  visitorCountToday,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Banner / Church Brand & Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Church Name */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-700 text-white flex items-center justify-center shadow-xs shrink-0">
              <Church className="w-5 h-5 text-amber-100" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate tracking-tight">
                  {settings.churchName || 'Igreja - Boas-Vindas'}
                </h1>
                <span className="inline-flex items-center gap-1.5 text-xs text-amber-800 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="hidden sm:inline">Recepção Ativa</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate">
                Gestão de Visitantes · Telão & WhatsApp
              </p>
            </div>
          </div>

          {/* Quick Context Switchers (Culto & Turno Atual) */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-xl p-1 text-xs">
            <span className="text-slate-400 font-medium px-2">Contexto Atual:</span>
            
            {/* Turno Selector */}
            <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5">
              {(['manha', 'tarde', 'noite'] as ShiftType[]).map((shift) => (
                <button
                  key={shift}
                  type="button"
                  onClick={() => setActiveShift(shift)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    activeShift === shift
                      ? 'bg-amber-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {getShiftLabel(shift)}
                </button>
              ))}
            </div>

            {/* Culto Selector */}
            <select
              value={activeCulto}
              onChange={(e) => setActiveCulto(e.target.value)}
              className="bg-white border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1 font-medium text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none"
            >
              <option value="all">Todos os Cultos / Eventos</option>
              {settings.customEvents
                .filter((e) => e.active)
                .map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            
            {/* New Visitor CTA */}
            <button
              onClick={onOpenNewVisitor}
              type="button"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Cadastrar Visitante</span>
              <span className="sm:hidden">Novo</span>
            </button>

            {/* QR Code Action */}
            <button
              onClick={onOpenQrCode}
              type="button"
              title="QR Code de Auto-Atendimento para Visitantes"
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200/60"
            >
              <QrCode className="w-4 h-4" />
            </button>

            {/* Privacy Shield Button */}
            <button
              onClick={onOpenPrivacy}
              type="button"
              title={settings.isPrivacyLocked ? 'Dados Protegidos por PIN' : 'Configurações de Privacidade & Backup'}
              className={`p-2 rounded-xl border transition-colors ${
                settings.isPrivacyLocked
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-100'
              }`}
            >
              {settings.isPrivacyLocked ? (
                <Shield className="w-4 h-4 text-emerald-600" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-slate-500" />
              )}
            </button>
          </div>
        </div>

        {/* Tab Navigation Navigation Bar */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 -mx-4 px-4 sm:mx-0 sm:px-0 border-t border-slate-100 scrollbar-none text-xs sm:text-sm font-medium">
          <button
            type="button"
            onClick={() => setCurrentTab('realtime')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              currentTab === 'realtime'
                ? 'bg-amber-50 text-amber-900 font-semibold border border-amber-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4 text-amber-700" />
            <span>Recepção em Tempo Real</span>
            {visitorCountToday > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-xs font-semibold bg-amber-700 text-white">
                {visitorCountToday}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('projection')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              currentTab === 'projection'
                ? 'bg-slate-900 text-amber-300 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Tv className="w-4 h-4 text-amber-400" />
            <span>Modo Telão / Projeção</span>
            <span className="hidden sm:inline text-xs text-amber-400/80 font-normal">
              · Boas-Vindas
            </span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('chatbot')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              currentTab === 'chatbot'
                ? 'bg-emerald-50 text-emerald-900 font-semibold border border-emerald-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>Chatbot WhatsApp & Auto-Cadastro</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('settings')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              currentTab === 'settings'
                ? 'bg-amber-50 text-amber-900 font-semibold border border-amber-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Settings className="w-4 h-4 text-amber-700" />
            <span>Configurar Cultos & Eventos</span>
          </button>
        </div>
      </div>
    </header>
  );
};
