import React from 'react';
import { LogEntry } from '../types';
import { Activity, Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface LogPanelProps {
  logs: LogEntry[];
}

export const LogPanel: React.FC<LogPanelProps> = ({ logs }) => {
  const getIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'success': return <CheckCircle size={14} className="text-green-500" />;
      case 'warning': return <AlertTriangle size={14} className="text-yellow-500" />;
      case 'error': return <XCircle size={14} className="text-red-500" />;
      default: return <Info size={14} className="text-blue-500" />;
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-surface border-l border-slate-700">
      <div className="p-4 border-b border-slate-700 flex items-center gap-2 bg-surface/50 backdrop-blur">
        <Activity size={18} className="text-slate-400" />
        <h3 className="font-semibold text-slate-200">Log do Sistema</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {logs.length === 0 ? (
          <div className="text-center text-slate-500 text-sm mt-10 p-4">
            Nenhuma atividade registrada ainda. O sistema está aguardando o início do monitoramento.
          </div>
        ) : (
          logs.map((log) => (
            <div 
              key={log.id} 
              className="text-xs flex gap-2 p-2 hover:bg-white/5 rounded transition-colors group"
            >
              <div className="mt-0.5 shrink-0 opacity-80 group-hover:opacity-100">
                {getIcon(log.type)}
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-slate-500 font-mono text-[10px]">
                  {log.timestamp.toLocaleTimeString()}
                </span>
                <span className={`break-words ${log.type === 'error' ? 'text-red-300' : 'text-slate-300'}`}>
                  {log.message}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};