"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function DetailModal({ isOpen, onClose, title, children }: DetailModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 z-50"
          />

          {/* Modal Container - centered with flexbox */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: [0.25, 0.4, 0.25, 1] }}
              className="w-full max-w-lg max-h-[85vh] bg-[#171615] border border-[#2D2B2B] rounded-xl flex flex-col overflow-hidden pointer-events-auto"
            >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#2D2B2B]">
              <code className="text-lg sm:text-xl font-mono font-semibold text-white">{title}</code>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Close modal"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {children}
            </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// Command modal content component
interface CommandDetail {
  name: string;
  desc: string;
  fullDescription?: string;
  whenToUse?: string[];
  whatItDoes?: string[];
  example?: string;
}

export function CommandModalContent({ command }: { command: CommandDetail }) {
  return (
    <div className="space-y-5">
      {/* Description */}
      <p className="text-[#9C9C99] text-sm leading-relaxed">
        {command.fullDescription || command.desc}
      </p>

      {/* When to Use */}
      {command.whenToUse && command.whenToUse.length > 0 && (
        <div>
          <h4 className="text-white text-sm font-semibold mb-2">When to Use</h4>
          <ul className="space-y-1.5">
            {command.whenToUse.map((item, i) => (
              <li key={i} className="text-[#9C9C99] text-sm flex items-start gap-2">
                <span className="text-[#666665] mt-1">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* What It Does */}
      {command.whatItDoes && command.whatItDoes.length > 0 && (
        <div>
          <h4 className="text-white text-sm font-semibold mb-2">What It Does</h4>
          <ol className="space-y-1.5">
            {command.whatItDoes.map((item, i) => (
              <li key={i} className="text-[#9C9C99] text-sm flex items-start gap-2">
                <span className="text-[#666665] font-mono text-xs mt-0.5">{i + 1}.</span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Example */}
      {command.example && (
        <div>
          <h4 className="text-white text-sm font-semibold mb-2">Example</h4>
          <pre className="bg-[#0A0908] rounded-lg p-3 overflow-x-auto">
            <code className="text-xs sm:text-sm text-[#9C9C99] font-mono whitespace-pre-wrap">{command.example}</code>
          </pre>
        </div>
      )}
    </div>
  );
}

// Agent modal content component
interface AgentDetail {
  name: string;
  desc: string;
  fullDescription?: string;
  expertise?: string[];
  focusAreas?: string[];
  whenToUse?: string[];
}

export function AgentModalContent({ agent }: { agent: AgentDetail }) {
  return (
    <div className="space-y-5">
      {/* Description */}
      <p className="text-[#9C9C99] text-sm leading-relaxed">
        {agent.fullDescription || agent.desc}
      </p>

      {/* Expertise */}
      {agent.expertise && agent.expertise.length > 0 && (
        <div>
          <h4 className="text-white text-sm font-semibold mb-2">Expertise</h4>
          <ul className="space-y-1.5">
            {agent.expertise.map((item, i) => (
              <li key={i} className="text-[#9C9C99] text-sm flex items-start gap-2">
                <span className="text-[#666665] mt-1">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Focus Areas */}
      {agent.focusAreas && agent.focusAreas.length > 0 && (
        <div>
          <h4 className="text-white text-sm font-semibold mb-2">Focus Areas</h4>
          <ul className="space-y-1.5">
            {agent.focusAreas.map((item, i) => (
              <li key={i} className="text-[#9C9C99] text-sm flex items-start gap-2">
                <span className="text-[#666665] mt-1">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* When to Use */}
      {agent.whenToUse && agent.whenToUse.length > 0 && (
        <div>
          <h4 className="text-white text-sm font-semibold mb-2">Example Usage</h4>
          <div className="bg-[#0A0908] rounded-lg p-3 space-y-1">
            {agent.whenToUse.map((item, i) => (
              <code key={i} className="block text-xs sm:text-sm text-[#9C9C99] font-mono">{item}</code>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
