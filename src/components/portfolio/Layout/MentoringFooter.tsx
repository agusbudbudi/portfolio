import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, ExternalLink } from 'lucide-react';

const WHATSAPP_NUMBER = '6285559496968';

const MentoringFooter: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800/80">
      <div className="max-w-[1200px] mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Mentor.<span className="text-blue-500">QA</span>
            </span>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Helping QA engineers level up their skills and accelerate their careers.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">Quick Links</p>
            <ul className="flex flex-col gap-2 list-none p-0 m-0">
              <li>
                <Link
                  to="/mentoring/booking"
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors no-underline"
                >
                  Book a Session
                </Link>
              </li>
              <li>
                <Link
                  to="/portfolio"
                  className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors no-underline"
                >
                  View Portfolio
                  <ExternalLink size={12} />
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">Contact</p>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 w-fit px-4 py-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-medium transition-all duration-200 hover:bg-emerald-500/20 hover:-translate-y-0.5 no-underline"
            >
              <MessageCircle size={16} />
              Chat on WhatsApp
            </a>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
            &copy; {new Date().getFullYear()} Agus Budiman &middot; QA Mentoring
          </p>
        </div>
      </div>
    </footer>
  );
};

export default MentoringFooter;
