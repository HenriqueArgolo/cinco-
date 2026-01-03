import React, { useState, useEffect } from 'react';
import { X, Save, Bell, CheckCircle, AlertTriangle } from 'lucide-react';
import { AppSettings } from '../types';
import { sendTestNotification } from '../services/notification';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave }) => {
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [testingDiscord, setTestingDiscord] = useState(false);
  const [testingGeneric, setTestingGeneric] = useState(false);

  useEffect(() => {
    setFormData(settings);
  }, [settings, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      if (name === 'refreshInterval' || name === 'goalDiffThreshold') {
        // Convert to number, use previous value if invalid
        const numValue = parseInt(value, 10);
        if (!isNaN(numValue) && numValue > 0) {
          return { ...prev, [name]: numValue };
        }
        // If empty or invalid, keep previous value to allow user to continue typing
        return prev;
      }
      return { ...prev, [name]: value };
    });
  };

  const handleTest = async (type: 'discord' | 'generic') => {
    const url = type === 'discord' ? formData.discordWebhook : formData.genericWebhook;
    if (!url) return alert('Insira uma URL primeiro.');
    
    if (type === 'discord') setTestingDiscord(true);
    else setTestingGeneric(true);

    try {
      await sendTestNotification(url, type);
      alert('Teste enviado com sucesso!');
    } catch (e) {
      alert('Erro ao testar webhook. Verifique o console.');
    } finally {
      setTestingDiscord(false);
      setTestingGeneric(false);
    }
  };

  const handleSave = () => {
    if (formData.refreshInterval < 15) {
      alert("O intervalo mínimo é 15 segundos para evitar bloqueios da API.");
      return;
    }
    if (formData.goalDiffThreshold < 1 || formData.goalDiffThreshold > 20) {
      alert("A diferença de gols deve estar entre 1 e 20.");
      return;
    }
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-surface border border-slate-700 w-full max-w-lg rounded-xl shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <div className="p-2 bg-primary/20 rounded-lg text-primary">
            <Bell size={24} />
          </div>
          Configurações
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              API-Football Key (v3.football.api-sports.io)
            </label>
            <input
              type="password"
              name="apiKey"
              value={formData.apiKey}
              onChange={handleChange}
              placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full bg-background border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Discord Webhook URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                name="discordWebhook"
                value={formData.discordWebhook}
                onChange={handleChange}
                placeholder="https://discord.com/api/webhooks/..."
                className="flex-1 bg-background border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              />
              <button 
                onClick={() => handleTest('discord')}
                disabled={testingDiscord || !formData.discordWebhook}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {testingDiscord ? '...' : 'Testar'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Webhook Genérico (WhatsApp/Other)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                name="genericWebhook"
                value={formData.genericWebhook}
                onChange={handleChange}
                placeholder="https://api.meubot.com/webhook"
                className="flex-1 bg-background border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              />
              <button 
                 onClick={() => handleTest('generic')}
                 disabled={testingGeneric || !formData.genericWebhook}
                 className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {testingGeneric ? '...' : 'Testar'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Diferença de Gols para Notificação
            </label>
            <input
              type="number"
              name="goalDiffThreshold"
              min="1"
              max="20"
              value={formData.goalDiffThreshold}
              onChange={handleChange}
              className="w-full bg-background border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            />
            <p className="text-xs text-slate-500 mt-1">Será notificado quando a diferença de gols for igual ou maior que este valor.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Intervalo de Atualização (segundos)
            </label>
            <input
              type="number"
              name="refreshInterval"
              min="15"
              value={formData.refreshInterval}
              onChange={handleChange}
              className="w-full bg-background border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            />
            <p className="text-xs text-slate-500 mt-1">Mínimo: 15 segundos para evitar rate-limits.</p>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20"
          >
            <Save size={18} />
            Salvar Configurações
          </button>
        </div>
      </div>
    </div>
  );
};