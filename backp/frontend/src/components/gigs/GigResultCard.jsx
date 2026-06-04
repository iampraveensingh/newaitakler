import { motion } from 'framer-motion';
import { Copy, Check, Tag, HelpCircle, Package, List, Download, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

// Renders a subset of markdown: headings, bold, bullet lists, paragraphs
function renderMarkdown(text) {
  // Normalise literal \n sequences that the LLM sometimes emits as characters
  const normalised = text.replace(/\\n/g, '\n');
  const blocks = normalised.split(/\n{2,}/);

  return blocks.map((block, bi) => {
    // Heading: ### or ## or #
    const headingMatch = block.match(/^(#{1,3})\s+(.+)/);
    if (headingMatch) {
      return (
        <p key={bi} className="font-bold text-white text-sm mt-4 mb-1">
          {inlineMarkdown(headingMatch[2])}
        </p>
      );
    }

    // Bullet list block: lines starting with - or *
    const lines = block.split('\n');
    const isList = lines.every(l => /^\s*[-*]\s/.test(l) || l.trim() === '');
    if (isList) {
      return (
        <ul key={bi} className="list-none space-y-1 my-1">
          {lines.filter(l => l.trim()).map((l, li) => (
            <li key={li} className="flex items-start gap-2 text-slate-300">
              <span className="text-violet-400 mt-0.5 shrink-0">•</span>
              <span>{inlineMarkdown(l.replace(/^\s*[-*]\s+/, ''))}</span>
            </li>
          ))}
        </ul>
      );
    }

    // Mixed block: some lines are bullets, render line-by-line
    const hasBullets = lines.some(l => /^\s*[-*]\s/.test(l));
    if (hasBullets) {
      return (
        <div key={bi} className="space-y-1 my-1">
          {lines.filter(l => l.trim()).map((l, li) => {
            if (/^\s*[-*]\s/.test(l)) {
              return (
                <div key={li} className="flex items-start gap-2 text-slate-300">
                  <span className="text-violet-400 mt-0.5 shrink-0">•</span>
                  <span>{inlineMarkdown(l.replace(/^\s*[-*]\s+/, ''))}</span>
                </div>
              );
            }
            return <p key={li} className="text-slate-300">{inlineMarkdown(l)}</p>;
          })}
        </div>
      );
    }

    // Normal paragraph
    return (
      <p key={bi} className="text-slate-300">
        {inlineMarkdown(block)}
      </p>
    );
  });
}

// Handles **bold** and *italic* within a line
function inlineMarkdown(text) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (/^\*\*[^*]+\*\*$/.test(part)) {
      return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (/^\*[^*]+\*$/.test(part)) {
      return <em key={i} className="text-violet-300">{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="text-slate-500 hover:text-violet-400 transition-colors p-1">
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function PackageCard({ pkg, tier, color }) {
  if (!pkg) return null;
  return (
    <div className={`rounded-xl border p-4 ${color}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{tier}</span>
        <span className="text-lg font-bold text-emerald-400">${pkg.price}</span>
      </div>
      <h4 className="text-sm font-semibold text-white mb-1">{pkg.title}</h4>
      <p className="text-xs text-slate-400 mb-2">{pkg.description}</p>
      <div className="flex gap-3 text-xs text-slate-500">
        <span>📅 {pkg.delivery_days} days</span>
        <span>🔄 {pkg.revisions} revisions</span>
      </div>
    </div>
  );
}

export default function GigResultCard({ gig, onReset }) {
  const handleDownload = () => {
    const pkg = (tier, p) => p
      ? `${tier}: ${p.title} | $${p.price} | ${p.delivery_days} days | ${p.revisions} revisions\n${p.description}`
      : '';

    const lines = [
      `GIG TITLE`, `=========`, gig.gig_title, ``,
      `CATEGORY`, `========`, `${gig.category || ''}${gig.subcategory ? ` > ${gig.subcategory}` : ''}`, ``,
      `DESCRIPTION`, `===========`, gig.gig_description, ``,
      `PACKAGES`, `========`,
      pkg('Basic',    gig.basic_package),
      pkg('Standard', gig.standard_package),
      pkg('Premium',  gig.premium_package), ``,
      `SEARCH TAGS`, `===========`, (gig.search_tags || []).join(', '), ``,
      `FAQ`, `===`,
      ...(gig.faq || []).flatMap(f => [`Q: ${f.question}`, `A: ${f.answer}`, '']),
      ...(gig.requirements?.length ? [
        `BUYER REQUIREMENTS`, `==================`,
        ...(gig.requirements || []).map(r => `• ${r}`),
      ] : []),
    ].join('\n');

    const blob = new Blob([lines], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'fiverr-gig.txt'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Action bar */}
      <div className="flex justify-end gap-2">
        {onReset && (
          <Button size="sm" variant="outline" onClick={onReset} className="gap-2">
            <RotateCcw className="w-4 h-4" /> Create New
          </Button>
        )}
        <Button size="sm" variant="outline" onClick={handleDownload} className="gap-2 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10">
          <Download className="w-4 h-4" /> Download Gig
        </Button>
      </div>

      {/* Title */}
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-violet-400">Gig Title</span>
          <CopyButton text={gig.gig_title} />
        </div>
        <h2 className="text-xl font-bold text-white leading-tight">{gig.gig_title}</h2>
        {(gig.category || gig.subcategory) && (
          <div className="flex gap-2 mt-3">
            {gig.category    && <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">{gig.category}</span>}
            {gig.subcategory && <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">{gig.subcategory}</span>}
          </div>
        )}
      </div>

      {/* Description */}
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-violet-400">Gig Description</span>
          <button
            onClick={() => navigator.clipboard.writeText(gig.gig_description)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500/15 hover:bg-violet-500/25 text-violet-300 text-xs font-medium transition-colors"
          >
            <Copy className="w-3.5 h-3.5" /> Copy Description
          </button>
        </div>
        <div className="text-sm text-slate-300 leading-relaxed space-y-2">
          {renderMarkdown(gig.gig_description || '')}
        </div>
      </div>

      {/* Packages */}
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-4 h-4 text-violet-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-violet-400">Pricing Packages</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <PackageCard pkg={gig.basic_package}    tier="Basic"    color="border-slate-700/50 bg-slate-800/40" />
          <PackageCard pkg={gig.standard_package} tier="Standard" color="border-violet-500/30 bg-violet-500/5" />
          <PackageCard pkg={gig.premium_package}  tier="Premium"  color="border-amber-500/30 bg-amber-500/5" />
        </div>
      </div>

      {/* Tags */}
      {gig.search_tags?.length > 0 && (
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-4 h-4 text-violet-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-violet-400">Search Tags</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {gig.search_tags.map((tag, i) => (
              <span key={i} className="px-3 py-1 rounded-full text-sm bg-violet-500/15 text-violet-300 border border-violet-500/25">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* FAQ */}
      {gig.faq?.length > 0 && (
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="flex items-center gap-2 mb-3">
            <HelpCircle className="w-4 h-4 text-violet-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-violet-400">FAQ</span>
          </div>
          <div className="space-y-3">
            {gig.faq.map((item, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-800/50">
                <p className="text-sm font-medium text-white mb-1">Q: {item.question}</p>
                <p className="text-sm text-slate-400">A: {item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Requirements */}
      {gig.requirements?.length > 0 && (
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="flex items-center gap-2 mb-3">
            <List className="w-4 h-4 text-violet-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-violet-400">Buyer Requirements</span>
          </div>
          <ul className="space-y-2">
            {gig.requirements.map((req, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="text-violet-400 mt-0.5">•</span> {req}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}
