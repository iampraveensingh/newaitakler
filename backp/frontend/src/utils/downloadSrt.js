/**
 * Generate and download an SRT subtitle file from conversation segments.
 * @param {string|null} _audioUrl - unused, kept for call-site compatibility
 * @param {number} duration - total audio duration in seconds (used when segments lack timing)
 * @param {string} title - filename (without extension)
 * @param {Array} segments - array of { text, speaker_label }
 */
export function downloadSrt(_audioUrl, duration = 0, title = 'transcript', segments = []) {
  if (!segments || segments.length === 0) return;

  const avgSegDuration = duration > 0 ? duration / segments.length : 3;

  const pad = (n) => String(Math.floor(n)).padStart(2, '0');
  const toSrtTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.round((secs % 1) * 1000);
    return `${pad(h)}:${pad(m)}:${pad(s)},${String(ms).padStart(3, '0')}`;
  };

  const lines = segments.map((seg, i) => {
    const start = i * avgSegDuration;
    const end = (i + 1) * avgSegDuration;
    const label = seg.speaker_label ? `${seg.speaker_label}: ` : '';
    return `${i + 1}\n${toSrtTime(start)} --> ${toSrtTime(end)}\n${label}${seg.text}\n`;
  });

  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title}.srt`;
  a.click();
  URL.revokeObjectURL(url);
}
