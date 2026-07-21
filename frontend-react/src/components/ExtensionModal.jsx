import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Download, FolderOpen, CheckCircle, ExternalLink, Puzzle, Layers, Sparkles, X, Copy, Eye } from 'lucide-react';

export default function ExtensionModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const folderPath = `c:\\Users\\Admin\\Downloads\\ET\\ET\\extension`;
  const extUrl = `chrome://extensions/`;

  const copyPath = () => {
    navigator.clipboard.writeText(folderPath);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyExtLink = () => {
    navigator.clipboard.writeText(extUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const modalContent = (
    <AnimatePresence>
      <div
        className="fixed inset-0 overflow-y-auto bg-slate-950/85 backdrop-blur-md"
        style={{ zIndex: 100000 }}
        onClick={onClose}
      >
        <div className="flex min-h-full items-start sm:items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col"
            style={{ maxHeight: 'calc(100vh - 2rem)' }}
          >
          {/* Header */}
          <div className="relative p-5 bg-gradient-to-r from-cyan-900/50 via-blue-900/40 to-purple-900/50 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-cyan-500/20 border border-cyan-500/30 rounded-xl text-cyan-400 shadow-lg shadow-cyan-500/10">
                <Puzzle size={28} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-white tracking-wide">SentinelAI Threat Shield Extension</h3>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Manifest V3
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Hackathon Presentation & Live Demo Installation Guide
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4 overflow-y-auto flex-1">
            {/* Impact Value Note */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 to-purple-950/40 border border-cyan-500/30">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm mb-1.5">
                <Sparkles size={16} /> High Impact Value (Zero Hosting Overhead)
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                To bypass Web Store publishing fees & approval delays during hackathon judging, SentinelAI includes a ready-to-run 1-click local Manifest V3 extension package. It brings real-time AI threat checking to citizens as they surf live websites (like Amazon, e-commerce, banking portals) and inspect on-page PDF advisories.
              </p>
            </div>

            {/* Live Extension Proof of Concept Screenshot */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                  <Eye size={14} /> Live Extension In Action (Amazon.com Verification Proof)
                </span>
                <span className="text-slate-400 text-[11px]">Real-Time Badge & Threat Popup</span>
              </div>
              <div className="rounded-lg overflow-hidden border border-slate-800 shadow-xl">
                <img
                  src="/extension-demo.png"
                  alt="SentinelAI Extension running on Amazon.com"
                  className="w-full h-auto object-contain max-h-[160px] sm:max-h-[220px] md:max-h-[270px]"
                />
              </div>
            </div>

            {/* Step-by-Step Installation Guide */}
            <div className="p-5 rounded-xl bg-slate-950/80 border border-cyan-500/20 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Puzzle size={15} /> Step-by-Step Installation Instructions
                </span>
                <span className="text-xs text-slate-400">Takes only 30 seconds</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* Step 1 */}
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="font-bold text-white mb-1">Step 1: Download or Locate Extension</div>
                  <p className="text-slate-400 leading-relaxed">
                    Click <strong className="text-cyan-300">Download Extension ZIP</strong> below or copy the local project path:
                  </p>
                  <div className="mt-2 flex items-center justify-between p-1.5 bg-slate-950 rounded border border-slate-800 text-[11px]">
                    <span className="truncate font-mono text-slate-400">{folderPath}</span>
                    <button
                      onClick={copyPath}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded font-semibold text-[10px] shrink-0 cursor-pointer"
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="font-bold text-white mb-1">Step 2: Open Browser Extensions</div>
                  <p className="text-slate-400 leading-relaxed">
                    Open a new tab and go to <code className="text-cyan-300">chrome://extensions/</code> (or Edge <code className="text-cyan-300">edge://extensions/</code>):
                  </p>
                  <div className="mt-2 flex items-center justify-between p-1.5 bg-slate-950 rounded border border-slate-800 text-[11px]">
                    <span className="font-mono text-slate-300">chrome://extensions/</span>
                    <button
                      onClick={copyExtLink}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded font-semibold text-[10px] shrink-0 cursor-pointer"
                    >
                      {copiedLink ? 'Copied!' : 'Copy URL'}
                    </button>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="font-bold text-white mb-1">Step 3: Enable Developer Mode</div>
                  <p className="text-slate-400 leading-relaxed">
                    In the top-right corner of the Extensions page, toggle the <strong className="text-amber-400">Developer mode</strong> switch to ON.
                  </p>
                </div>

                {/* Step 4 */}
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="font-bold text-white mb-1">Step 4: Load Unpacked Extension</div>
                  <p className="text-slate-400 leading-relaxed">
                    Click <strong className="text-white">Load unpacked</strong> and select the unzipped <code className="text-cyan-300">extension</code> directory. Done!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3 shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Dismiss
            </button>
            <a
              href="/sentinel-ai-extension.zip"
              download="sentinel-ai-extension.zip"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5"
            >
              <Download size={14} /> Download Extension ZIP
            </a>
          </div>
         </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}
