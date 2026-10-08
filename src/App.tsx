import React, { useState, useEffect } from 'react';
import { AppSettings, FilterState, ShiftType, Visitor, VisitorStatus } from './types';
import {
  detectCurrentShift,
  getStoredSettings,
  getStoredVisitors,
  saveStoredSettings,
  saveStoredVisitors,
} from './utils/storage';
import { buildWelcomeMessage, buildWhatsAppLink } from './utils/whatsapp';
import { Navbar } from './components/Navbar';
import { VisitorList } from './components/VisitorList';
import { VisitorRegistrationModal } from './components/VisitorRegistrationModal';
import { WhatsAppChatbot } from './components/WhatsAppChatbot';
import { ProjectionView } from './components/ProjectionView';
import { EventSettingsModal } from './components/EventSettingsModal';
import { PrivacyModal } from './components/PrivacyModal';
import { QrCodeShareModal } from './components/QrCodeShareModal';
import confetti from 'canvas-confetti';

export default function App() {
  const [visitors, setVisitors] = useState<Visitor[]>(() => getStoredVisitors());
  const [settings, setSettings] = useState<AppSettings>(() => getStoredSettings());
  
  // Navigation tabs
  const [currentTab, setCurrentTab] = useState<'realtime' | 'chatbot' | 'projection' | 'settings'>(
    'realtime'
  );

  // Active Reception Context
  const [activeShift, setActiveShift] = useState<ShiftType>(() => detectCurrentShift());
  const [activeCulto, setActiveCulto] = useState<string>('all');

  // Modals
  const [isNewVisitorModalOpen, setIsNewVisitorModalOpen] = useState(false);
  const [visitorToEdit, setVisitorToEdit] = useState<Visitor | null>(null);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isQrCodeModalOpen, setIsQrCodeModalOpen] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    shift: 'all',
    cultoId: 'all',
    dateRange: 'today',
    status: 'all',
    projectedOnly: false,
  });

  // Check URL parameters on mount (e.g., ?autoatendimento=1 opens directly the WhatsApp Chatbot)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autoatendimento') === '1' || params.get('visitante') === '1') {
        setCurrentTab('chatbot');
      }
    }
  }, []);

  // Save visitors on change
  useEffect(() => {
    saveStoredVisitors(visitors);
  }, [visitors]);

  // Save settings on change
  useEffect(() => {
    saveStoredSettings(settings);
  }, [settings]);

  // Sync active cultos and shifts to filters when changed from topbar
  const handleShiftChange = (shift: ShiftType) => {
    setActiveShift(shift);
    setFilters((prev) => ({ ...prev, shift }));
  };

  const handleCultoChange = (cultoId: string) => {
    setActiveCulto(cultoId);
    setFilters((prev) => ({ ...prev, cultoId }));
  };

  // Add / Edit Visitor
  const handleSaveVisitor = (newOrEditedVisitor: Visitor, openWhatsAppPrompt = false) => {
    setVisitors((prev) => {
      const exists = prev.some((v) => v.id === newOrEditedVisitor.id);
      if (exists) {
        return prev.map((v) => (v.id === newOrEditedVisitor.id ? newOrEditedVisitor : v));
      } else {
        return [newOrEditedVisitor, ...prev];
      }
    });

    // Small celebratory confetti on new visitor entry
    try {
      confetti({
        particleCount: 35,
        spread: 50,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // ignore
    }

    if (openWhatsAppPrompt && newOrEditedVisitor.phone) {
      const msg = buildWelcomeMessage(newOrEditedVisitor, settings);
      const link = buildWhatsAppLink(newOrEditedVisitor.phone, msg);
      window.open(link, '_blank');
    }
  };

  // Toggle Projected
  const handleToggleProjected = (id: string) => {
    setVisitors((prev) =>
      prev.map((v) => (v.id === id ? { ...v, projected: !v.projected } : v))
    );
  };

  // Update Status
  const handleUpdateStatus = (id: string, status: VisitorStatus) => {
    setVisitors((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status } : v))
    );
  };

  // Delete Visitor
  const handleDeleteVisitor = (id: string) => {
    setVisitors((prev) => prev.filter((v) => v.id !== id));
  };

  // Edit Visitor
  const handleEditVisitor = (visitor: Visitor) => {
    setVisitorToEdit(visitor);
    setIsNewVisitorModalOpen(true);
  };

  // Open New Visitor Modal
  const handleOpenNewVisitorModal = () => {
    setVisitorToEdit(null);
    setIsNewVisitorModalOpen(true);
  };

  // Update Settings
  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
  };

  // Update WhatsApp Contact directly
  const handleUpdateWhatsAppContact = (newNumber: string) => {
    setSettings((prev) => ({ ...prev, whatsappContact: newNumber }));
  };

  // Import Backup
  const handleImportBackup = (importedVisitors: Visitor[], importedSettings?: AppSettings) => {
    setVisitors(importedVisitors);
    if (importedSettings) {
      setSettings(importedSettings);
    }
  };

  // Count of visitors arrived today
  const todayCount = visitors.filter((v) => {
    const d = new Date(v.createdAt);
    const now = new Date();
    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  }).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* If in Projection View Mode, render the full-screen cinematic stage */}
      {currentTab === 'projection' ? (
        <ProjectionView
          visitors={visitors}
          settings={settings}
          onClose={() => setCurrentTab('realtime')}
          onToggleProjected={handleToggleProjected}
        />
      ) : (
        <>
          {/* Top Header Navbar */}
          <Navbar
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
            onOpenNewVisitor={handleOpenNewVisitorModal}
            onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
            onOpenQrCode={() => setIsQrCodeModalOpen(true)}
            activeShift={activeShift}
            setActiveShift={handleShiftChange}
            activeCulto={activeCulto}
            setActiveCulto={handleCultoChange}
            settings={settings}
            visitorCountToday={todayCount}
          />

          {/* Main Content Area */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {currentTab === 'realtime' && (
              <VisitorList
                visitors={visitors}
                settings={settings}
                filters={filters}
                setFilters={setFilters}
                onToggleProjected={handleToggleProjected}
                onUpdateStatus={handleUpdateStatus}
                onEditVisitor={handleEditVisitor}
                onDeleteVisitor={handleDeleteVisitor}
                onOpenNewVisitor={handleOpenNewVisitorModal}
                onOpenProjection={() => setCurrentTab('projection')}
              />
            )}

            {currentTab === 'chatbot' && (
              <WhatsAppChatbot
                settings={settings}
                activeShift={activeShift}
                activeCultoId={activeCulto}
                onRegisterVisitor={(newVis, openZap) => handleSaveVisitor(newVis, openZap)}
                onUpdateWhatsAppContact={handleUpdateWhatsAppContact}
                onOpenQrCode={() => setIsQrCodeModalOpen(true)}
              />
            )}

            {currentTab === 'settings' && (
              <EventSettingsModal
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
              />
            )}
          </main>

          {/* Footer */}
          <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p>
                <strong>{settings.churchName}</strong> · Ministério de Boas-Vindas e Acolhimento
              </p>
              <div className="flex items-center gap-4 text-slate-600">
                <button
                  type="button"
                  onClick={() => setIsPrivacyModalOpen(true)}
                  className="hover:text-slate-900 transition-colors"
                >
                  Segurança & PIN
                </button>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => setIsQrCodeModalOpen(true)}
                  className="hover:text-slate-900 transition-colors"
                >
                  QR Code Visitantes
                </button>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => setCurrentTab('projection')}
                  className="text-amber-800 font-semibold hover:underline"
                >
                  Abrir Telão
                </button>
              </div>
            </div>
          </footer>
        </>
      )}

      {/* Manual Registration Modal */}
      <VisitorRegistrationModal
        isOpen={isNewVisitorModalOpen}
        onClose={() => {
          setIsNewVisitorModalOpen(false);
          setVisitorToEdit(null);
        }}
        onSave={handleSaveVisitor}
        settings={settings}
        defaultShift={activeShift}
        defaultCultoId={activeCulto}
        visitorToEdit={visitorToEdit}
      />

      {/* Privacy, Lock & Backup Modal */}
      <PrivacyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        visitors={visitors}
        onImportBackup={handleImportBackup}
      />

      {/* QR Code Printable Share Modal */}
      <QrCodeShareModal
        isOpen={isQrCodeModalOpen}
        onClose={() => setIsQrCodeModalOpen(false)}
        settings={settings}
        onOpenChatbot={() => setCurrentTab('chatbot')}
      />
    </div>
  );
}
