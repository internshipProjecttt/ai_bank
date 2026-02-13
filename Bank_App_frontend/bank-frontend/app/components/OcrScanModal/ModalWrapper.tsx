'use client';

import { X } from 'lucide-react';

export default function ModalWrapper({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* arka plan */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* modal */}
      <div className="relative z-10 w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl p-4">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X />
        </button>

        {children}
      </div>
    </div>
  );
}
