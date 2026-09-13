import React from 'react';
import { LogOut, X, AlertTriangle } from 'lucide-react';

export const LogoutWarningModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void/80 backdrop-blur-xl animate-fade-in select-none">
      <div className="relative w-full max-w-sm rounded-3xl glass-panel border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.8)] p-6 text-center z-10">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Warning Icon Badge */}
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-3.5 shadow-[0_0_20px_rgba(244,63,94,0.2)]">
          <AlertTriangle className="w-6 h-6 text-rose-400" />
        </div>

        <h3 className="text-lg font-bold font-display tracking-wide text-white mb-1.5">
          Log Out of AURA?
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed mb-6">
          Your active listening session will end. You can sign back in anytime with your email and password.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-medium text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-bold text-xs shadow-[0_0_15px_rgba(244,63,94,0.4)] active:scale-95 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
