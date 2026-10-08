import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { AppSettings } from '../types';
import { X, Copy, Check, Printer, QrCode as QrIcon, Church, Sparkles, ExternalLink } from 'lucide-react';

interface QrCodeShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onOpenChatbot?: () => void;
}

export const QrCodeShareModal: React.FC<QrCodeShareModalProps> = ({
  isOpen,
  onClose,
  settings,
  onOpenChatbot,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://igreja.app';
  const visitorUrl = currentUrl.split('#')[0].split('?')[0] + '?autoatendimento=1';

  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(visitorUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#1e293b',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error(err));
    }
  }, [isOpen, visitorUrl]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(visitorUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-800 to-amber-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <QrIcon className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h2 className="text-base font-bold">QR Code de Boas-Vindas</h2>
              <p className="text-xs text-amber-200">
                Para imprimir nos bancos ou projetar no telão
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

        {/* Printable Placard Card */}
        <div className="p-6 space-y-5">
          <div
            ref={printRef}
            className="border-2 border-dashed border-amber-300 bg-gradient-to-b from-amber-50/50 to-white rounded-2xl p-6 text-center space-y-4 shadow-xs"
          >
            <div className="space-y-1">
              <span className="text-[11px] font-bold tracking-widest uppercase text-amber-800">
                Seja Muito Bem-Vindo!
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 font-cinzel">
                {settings.churchName}
              </h3>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">
                Aponte a câmera do seu celular para registrar sua visita com carinho e receber nossa saudação!
              </p>
            </div>

            {/* QR Code Graphic */}
            <div className="bg-white p-3 rounded-2xl shadow-xs border border-slate-200 inline-block">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="QR Code de Boas-Vindas"
                  className="w-48 h-48 mx-auto"
                />
              ) : (
                <div className="w-48 h-48 bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                  Gerando QR Code...
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-500 font-medium">
              ✨ Cadastro rápido via WhatsApp · Sem baixar aplicativo
            </p>
          </div>

          {/* Test in Preview / Actions Box */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Como testar agora mesmo (sem precisar do Visual Studio):</span>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              <strong>1. No celular:</strong> Aponte a câmera do seu celular para este QR Code na sua tela. Ele abrirá o auto-atendimento no seu celular!<br />
              <strong>2. No computador:</strong> Você pode testar direto nesta tela clicando no botão abaixo.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {onOpenChatbot && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenChatbot();
                  }}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Testar Chatbot Aqui no Preview</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => window.open(visitorUrl, '_blank')}
                className="px-3 py-1.5 bg-white hover:bg-slate-50 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Abrir em Nova Aba</span>
              </button>
            </div>
          </div>

          {/* Link Share Box */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Link Direto para o Auto-Cadastro
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={visitorUrl}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50 text-slate-600 font-mono select-all outline-none"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 text-xs font-medium"
          >
            Fechar
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir Cartaz / Plaquinha</span>
          </button>
        </div>
      </div>
    </div>
  );
};
