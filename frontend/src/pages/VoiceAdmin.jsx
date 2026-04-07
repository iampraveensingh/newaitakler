import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { systemVoices as api } from '@/api/base44Client';
import {
  Plus, Pencil, Trash2, Check, X, ToggleLeft, ToggleRight,
  Loader2, Mic, Search, ChevronUp, ChevronDown, ChevronsUpDown,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import GlassCard from '@/components/ui/GlassCard';
import PageHeader from '@/components/ui/PageHeader';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const VOICE_TYPES = ['conversational', 'narration', 'characters', 'social_media', 'educational', 'advertisement', 'entertainment'];
const TYPE_COLORS = {
  conversational: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  narration:      'bg-teal-500/20 text-teal-300 border-teal-500/30',
  characters:     'bg-purple-500/20 text-purple-300 border-purple-500/30',
  social_media:   'bg-rose-500/20 text-rose-300 border-rose-500/30',
  educational:    'bg-green-500/20 text-green-300 border-green-500/30',
  advertisement:  'bg-orange-500/20 text-orange-300 border-orange-500/30',
  entertainment:  'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
};

const EMPTY_FORM = { name: '', type: 'conversational', description: '', audio_url: '', sort_order: 0 };
const PAGE_SIZES = [10, 25, 50, 100];

// ─── Sort icon helper ────────────────────────────────────────────────────────
function SortIcon({ col, sortCol, sortDir }) {
  if (sortCol !== col) return <ChevronsUpDown className="w-3.5 h-3.5 text-slate-600" />;
  return sortDir === 'asc'
    ? <ChevronUp   className="w-3.5 h-3.5 text-violet-400" />
    : <ChevronDown className="w-3.5 h-3.5 text-violet-400" />;
}

export default function VoiceAdmin() {
  const queryClient = useQueryClient();

  // ── Form state ──────────────────────────────────────────────────────────────
  const [showForm, setShowForm] = useState(false);
  const [editId,   setEditId]   = useState(null);
  const [form,     setForm]     = useState(EMPTY_FORM);

  // ── Datatable state ─────────────────────────────────────────────────────────
  const [search,   setSearch]   = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'active' | 'inactive'
  const [sortCol,  setSortCol]  = useState('sort_order');
  const [sortDir,  setSortDir]  = useState('asc');
  const [page,     setPage]     = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // ── Data ────────────────────────────────────────────────────────────────────
  const { data: voices = [], isLoading } = useQuery({
    queryKey: ['systemVoicesAll'],
    queryFn: api.listAll,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['systemVoicesAll'] });
    queryClient.invalidateQueries({ queryKey: ['systemVoices'] });
  };

  const createMutation = useMutation({
    mutationFn: api.create,
    onSuccess: () => { toast.success('Voice created'); invalidate(); resetForm(); },
    onError:   () => toast.error('Failed to create voice'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => api.update(id, payload),
    onSuccess: () => { toast.success('Voice updated'); invalidate(); resetForm(); },
    onError:   () => toast.error('Failed to update voice'),
  });

  const deleteMutation = useMutation({
    mutationFn: api.delete,
    onSuccess: () => { toast.success('Voice deleted'); invalidate(); },
    onError:   () => toast.error('Failed to delete voice'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }) => api.update(id, { is_active }),
    onSuccess: () => invalidate(),
    onError:   () => toast.error('Failed to toggle voice'),
  });

  // ── Form helpers ────────────────────────────────────────────────────────────
  const resetForm = () => { setForm(EMPTY_FORM); setEditId(null); setShowForm(false); };

  const handleEdit = (v) => {
    setForm({ name: v.name, type: v.type, description: v.description || '', audio_url: v.audio_url || '', sort_order: v.sort_order ?? 0 });
    setEditId(v.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    const payload = { ...form, sort_order: parseInt(form.sort_order) || 0 };
    if (editId) updateMutation.mutate({ id: editId, payload });
    else        createMutation.mutate(payload);
  };

  // ── Sort ─────────────────────────────────────────────────────────────────────
  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
    setPage(1);
  };

  // ── Filter + sort + paginate ─────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return voices.filter(v => {
      if (typeFilter !== 'all' && v.type !== typeFilter) return false;
      if (activeFilter === 'active'   && !v.is_active)  return false;
      if (activeFilter === 'inactive' &&  v.is_active)  return false;
      if (!q) return true;
      return (
        v.name.toLowerCase().includes(q) ||
        (v.description || '').toLowerCase().includes(q) ||
        v.type.toLowerCase().includes(q)
      );
    });
  }, [voices, search, typeFilter, activeFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let av = a[sortCol] ?? '';
      let bv = b[sortCol] ?? '';
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ?  1 : -1;
      return 0;
    });
  }, [filtered, sortCol, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage   = Math.min(page, totalPages);
  const paged      = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const ThBtn = ({ col, children, className = '' }) => (
    <th
      className={cn('px-4 py-3 font-medium text-left select-none', className)}
      onClick={() => handleSort(col)}
    >
      <button className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors">
        {children}
        <SortIcon col={col} sortCol={sortCol} sortDir={sortDir} />
      </button>
    </th>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Voice Library Manager"
        subtitle="Add, edit, and manage system voices available to all users"
        icon={Mic}
      />

      {/* ── Add / Edit Form ── */}
      {showForm && (
        <GlassCard className="p-6">
          <h2 className="text-lg font-semibold text-white mb-4">{editId ? 'Edit Voice' : 'Add New Voice'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300">Name *</Label>
              <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Sarah" className="mt-1 bg-slate-800/50 border-slate-700 text-white" />
            </div>
            <div>
              <Label className="text-slate-300">Type *</Label>
              <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v }))}>
                <SelectTrigger className="mt-1 bg-slate-800/50 border-slate-700 text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {VOICE_TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t.replace('_', ' ')}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-300">Description</Label>
              <Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="e.g. Warm & friendly" className="mt-1 bg-slate-800/50 border-slate-700 text-white" />
            </div>
            <div>
              <Label className="text-slate-300">Sort Order</Label>
              <Input type="number" value={form.sort_order} onChange={e => setForm(p => ({ ...p, sort_order: e.target.value }))}
                className="mt-1 bg-slate-800/50 border-slate-700 text-white" />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-slate-300">Audio URL</Label>
              <Input value={form.audio_url} onChange={e => setForm(p => ({ ...p, audio_url: e.target.value }))}
                placeholder="https://..." className="mt-1 bg-slate-800/50 border-slate-700 text-white" />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <Button type="submit" disabled={isSaving} className="bg-violet-600 hover:bg-violet-500">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                {editId ? 'Update Voice' : 'Create Voice'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm} className="border-slate-600">
                <X className="w-4 h-4 mr-2" /> Cancel
              </Button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* ── Toolbar ── */}
      <GlassCard className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search name, description, type…"
              className="pl-9 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
            />
          </div>

          {/* Type filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500 shrink-0" />
            <Select value={typeFilter} onValueChange={v => { setTypeFilter(v); setPage(1); }}>
              <SelectTrigger className="w-44 bg-slate-800/50 border-slate-700 text-white">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">All Types</SelectItem>
                {VOICE_TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t.replace('_', ' ')}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Active filter */}
          <Select value={activeFilter} onValueChange={v => { setActiveFilter(v); setPage(1); }}>
            <SelectTrigger className="w-36 bg-slate-800/50 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active only</SelectItem>
              <SelectItem value="inactive">Inactive only</SelectItem>
            </SelectContent>
          </Select>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Add button */}
          {!showForm && (
            <Button onClick={() => { setEditId(null); setForm(EMPTY_FORM); setShowForm(true); }} className="bg-violet-600 hover:bg-violet-500 shrink-0">
              <Plus className="w-4 h-4 mr-2" /> Add Voice
            </Button>
          )}
        </div>
      </GlassCard>

      {/* ── Table ── */}
      <GlassCard className="overflow-hidden p-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-800/60 bg-slate-900/40">
                  <tr>
                    <ThBtn col="name">Name</ThBtn>
                    <ThBtn col="type">Type</ThBtn>
                    <ThBtn col="description">Description</ThBtn>
                    <ThBtn col="sort_order" className="w-24">Order</ThBtn>
                    <th className="px-4 py-3 font-medium text-slate-400 text-left">Audio</th>
                    <ThBtn col="is_active" className="text-center w-24">Active</ThBtn>
                    <th className="px-4 py-3 font-medium text-slate-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-14 text-center text-slate-500">
                        <Mic className="w-8 h-8 mx-auto mb-2 text-slate-700" />
                        {voices.length === 0 ? 'No voices yet. Add your first one.' : 'No voices match the current filters.'}
                      </td>
                    </tr>
                  ) : (
                    paged.map((v) => (
                      <tr key={v.id} className={cn(
                        'border-b border-slate-800/30 transition-colors hover:bg-white/[0.03]',
                        !v.is_active && 'opacity-50',
                      )}>
                        <td className="px-4 py-3 font-medium text-white whitespace-nowrap">{v.name}</td>
                        <td className="px-4 py-3">
                          <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium border capitalize', TYPE_COLORS[v.type] || 'bg-slate-700 text-slate-300 border-slate-600')}>
                            {(v.type || '').replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400 max-w-[200px] truncate">{v.description || '—'}</td>
                        <td className="px-4 py-3 text-slate-400 text-center">{v.sort_order}</td>
                        <td className="px-4 py-3 text-xs">
                          {v.audio_url
                            ? <a href={v.audio_url} target="_blank" rel="noreferrer" className="text-violet-400 hover:underline">Preview ↗</a>
                            : <span className="text-slate-600">—</span>}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button onClick={() => toggleMutation.mutate({ id: v.id, is_active: !v.is_active })}
                            className="transition-colors" title={v.is_active ? 'Deactivate' : 'Activate'}>
                            {v.is_active
                              ? <ToggleRight className="w-5 h-5 text-emerald-400" />
                              : <ToggleLeft  className="w-5 h-5 text-slate-500" />}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center gap-1.5 justify-end">
                            <button onClick={() => handleEdit(v)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all" title="Edit">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => { if (confirm(`Delete "${v.name}"?`)) deleteMutation.mutate(v.id); }}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Delete">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* ── Pagination bar ── */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-slate-800/60 bg-slate-900/20">
              {/* Left: count + per-page */}
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <span>
                  {sorted.length === 0 ? '0 results' : `${(safePage - 1) * pageSize + 1}–${Math.min(safePage * pageSize, sorted.length)} of ${sorted.length}`}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Rows:</span>
                  <Select value={String(pageSize)} onValueChange={v => { setPageSize(Number(v)); setPage(1); }}>
                    <SelectTrigger className="h-7 w-16 bg-slate-800/50 border-slate-700 text-white text-xs px-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {PAGE_SIZES.map(s => <SelectItem key={s} value={String(s)}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Right: page nav */}
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(1)} disabled={safePage === 1}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="px-3 text-sm text-slate-300 whitespace-nowrap">
                  Page {safePage} / {totalPages}
                </span>

                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button onClick={() => setPage(totalPages)} disabled={safePage === totalPages}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </GlassCard>
    </div>
  );
}
