import { Download, Gift, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const BASE_URL = 'https://app.aitalker.io/bonuses/';

const BONUSES = [
  { name: '100 DFY VSL & Sales Scripts (90K)',              file: 'Bonus_01_100_DFY_VSL_Sales_Scripts.pdf' },
  { name: '100 DFY Ad Scripts (78K)',                       file: 'Bonus_02_100_DFY_Ad_Scripts.pdf' },
  { name: '50 DFY Fiverr Gig Listings (69K)',               file: 'Bonus_03_50_DFY_Fiverr_Gig_Listings.pdf' },
  { name: '50 DFY Upwork & Freelance Proposals (63K)',      file: 'Bonus_04_50_DFY_Upwork_Proposals.pdf' },
  { name: '100 Profit-Ready Voice Prompts Vault (67K)',     file: 'Bonus_05_100_Voice_Prompts_Vault.pdf' },
  { name: '100 Emotion + Scene Combo Presets (69K)',        file: 'Bonus_06_100_Emotion_Scene_Combos.pdf' },
  { name: '50 DFY Podcast Episode Scripts (71K)',           file: 'Bonus_07_50_DFY_Podcast_Scripts.pdf' },
  { name: '50 Faceless YouTube Niches Kit (145K)',          file: 'Bonus_08_50_YouTube_Faceless_Kit.pdf' },
  { name: '50 DFY Voiceover Service Packages (66K)',        file: 'Bonus_09_50_Voiceover_Service_Packages.pdf' },
  { name: 'First Client In 7 Days — Daily Action Checklist (32K)', file: 'Bonus_10_First_Client_7_Days.pdf' },
];

export default function Bonuses() {
  const handleDownload = async (file) => {
    try {
      const response = await fetch(BASE_URL + file);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Download failed. Please try again.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <Gift className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">All Bonuses</h1>
          <p className="text-slate-400 text-sm mt-0.5">10 exclusive resources — download them all for free</p>
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {BONUSES.map((bonus, i) => (
          <div
            key={i}
            className="group flex items-center gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/60 hover:border-violet-500/30 hover:bg-slate-900/90 transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/5"
          >
            {/* Number badge */}
            <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600/20 to-purple-600/20 border border-violet-500/20 flex items-center justify-center">
              <span className="text-sm font-bold text-violet-400">{String(i + 1).padStart(2, '0')}</span>
            </div>

            {/* Title */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <p className="text-sm font-medium text-slate-200 leading-snug truncate">{bonus.name}</p>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">PDF Resource</p>
            </div>

            {/* Download button */}
            <Button
              size="sm"
              onClick={() => handleDownload(bonus.file)}
              className="shrink-0 gap-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs px-3 py-1.5 h-auto rounded-lg transition-all duration-200"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
