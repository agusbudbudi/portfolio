import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div 
      className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-0 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 md:rounded-2xl w-full max-w-3xl h-full md:h-auto md:max-h-[90vh] overflow-y-auto relative shadow-2xl border-none animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 md:p-6 border-none flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10">
          {title && <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white m-0">{title}</h3>}
          <button 
            className="bg-transparent border-none text-slate-450 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer p-1 rounded-full flex items-center justify-center transition-all hover:bg-slate-100 dark:hover:bg-slate-800 hover:rotate-90 duration-300"
            onClick={onClose} 
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-0">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
