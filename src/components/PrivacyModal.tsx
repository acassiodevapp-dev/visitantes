import React, { useState } from 'react';
import { AppSettings, Visitor } from '../types';
import { exportVisitorsToCsv, exportBackupJson } from '../utils/storage';
import {
  Shield,
  ShieldAlert,
  Lock,
  Unlock,
  KeyRound,
  Download,
  Upload,
  FileSpreadsheet,
  FileCode,
  X,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  visitors: Visitor[];
  onImportBackup: (importedVisitors: Visitor[], importedSettings?: AppSettings) => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  visitors,
  onImportBackup,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinSuccess, setPinSuccess] = useState('');
  const [isChangingPin, setIsChangingPin] = useState(false);

  if (!isOpen) return null;

  const handleUnlockWithPin = () => {
    if (pinInput === settings.adminPin || (!settings.adminPin && pinInput === '1234')) {
      onUpdateSettings({
        ...settings,
        isPrivacyLocked: false,
        maskSensitiveData: false,
      });
      setPinError('');
      setPinSuccess('Acesso administrativo desbloqueado com sucesso!');
      setPinInput('');
      setTimeout(() => setPinSuccess(''), 2500);
    } else {
      setPinError('PIN incorreto. O PIN padrão inicial é 1234.');
    }
  };

  const handleLockData = () => {
    onUpdateSettings({
      ...settings,
      isPrivacyLocked: true,
      maskSensitiveData: true,
    });
    setPinSuccess('Modo Privado Ativado. Telefones e dados pessoais mascarados!');
    setTimeout(() => setPinSuccess(''), 2500);
  };

  const handleChangePin = () => {
    if (newPinInput.length < 4) {
      setPinError('O novo PIN deve conter pelo menos 4 dígitos.');
      return;
    }
    onUpdateSettings({
      ...settings,
      adminPin: newPinInput,
    });
    setPinSuccess('Novo PIN salvo com sucesso!');
    setNewPinInput('');
    setIsChangingPin(false);
    setTimeout(() => setPinSuccess(''), 2500);
  };

  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.visitors && Array.isArray(json.visitors)) {
          onImportBackup(json.visitors, json.settings);
          alert('Backup restaurado com sucesso!');
          onClose();
        } else {
          alert('Formato de backup inválido.');
        }
      } catch (err) {
        alert('Erro ao processar o arquivo de backup.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Privacidade, PIN & Backup</h2>
              <p className="text-xs text-slate-400">
                Proteção para hospedar online/GitHub com dados sigilosos
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

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          
          {/* Status Alert */}
          {pinSuccess && (
            <div className="p-3 text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{pinSuccess}</span>
            </div>
          )}

          {pinError && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-800 rounded-xl font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>{pinError}</span>
            </div>
          )}

          {/* Privacy Status & Lock Control */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {settings.isPrivacyLocked ? (
                  <Lock className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Unlock className="w-4 h-4 text-amber-600" />
                )}
                <span className="text-sm font-bold text-slate-900">
                  {settings.isPrivacyLocked ? 'Modo Seguro ATIVADO' : 'Painel Desbloqueado'}
                </span>
              </div>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                settings.isPrivacyLocked ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {settings.isPrivacyLocked ? 'Dados Ocultos' : 'Visível'}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {settings.isPrivacyLocked
                ? 'Os números de telefone, bairros e pedidos de oração estão mascarados na tela para evitar exposição caso outras pessoas ou voluntários usem o telão ou totem.'
                : 'Você está no modo administrativo completo. Para ocultar os dados pessoais dos visitantes antes de deixar a tela em público, ative o Modo Seguro.'}
            </p>

            {settings.isPrivacyLocked ? (
              <div className="pt-2 flex gap-2">
                <input
                  type="password"
                  maxLength={6}
                  placeholder="Digite o PIN (Padrão: 1234)"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono text-center tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
                <button
                  type="button"
                  onClick={handleUnlockWithPin}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  Desbloquear
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleLockData}
                className="w-full py-2 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Ativar Modo Seguro (Ocultar Telefones e Pedidos)</span>
              </button>
            )}
          </div>

          {/* Change PIN Accordion */}
          <div className="pt-2 border-t border-slate-100">
            {!isChangingPin ? (
              <button
                type="button"
                onClick={() => setIsChangingPin(true)}
                className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                <span>Alterar PIN de Segurança de 4 dígitos (Atual: {settings.adminPin || '1234'})</span>
              </button>
            ) : (
              <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block text-xs font-semibold text-slate-700">
                  Novo PIN (4 a 6 números):
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    maxLength={6}
                    placeholder="Novo PIN"
                    value={newPinInput}
                    onChange={(e) => setNewPinInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono tracking-widest text-center"
                  />
                  <button
                    type="button"
                    onClick={handleChangePin}
                    className="px-3 py-1.5 bg-amber-700 text-white rounded-lg text-xs font-semibold"
                  >
                    Salvar Novo PIN
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsChangingPin(false)}
                    className="px-2 py-1.5 text-slate-500 text-xs"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Export & Backup Section */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Exportação de Dados & Backup Local
            </span>
            <p className="text-xs text-slate-500">
              Faça download da lista para o Excel ou exporte o backup completo para salvar em segurança.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => exportVisitorsToCsv(visitors)}
                className="p-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 flex items-center gap-2.5 text-left transition-colors"
              >
                <FileSpreadsheet className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-slate-900">Baixar Excel (CSV)</p>
                  <p className="text-[10px] text-slate-500">Para relatórios e secretaria</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => exportBackupJson(visitors, settings)}
                className="p-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 flex items-center gap-2.5 text-left transition-colors"
              >
                <Download className="w-5 h-5 text-amber-700 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-slate-900">Baixar Backup JSON</p>
                  <p className="text-[10px] text-slate-500">Cópia de segurança completa</p>
                </div>
              </button>
            </div>

            {/* Restore */}
            <div className="pt-2">
              <label className="inline-flex items-center gap-2 text-xs text-slate-600 hover:text-slate-900 font-medium cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>Restaurar Backup de Arquivo JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJsonFile}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
