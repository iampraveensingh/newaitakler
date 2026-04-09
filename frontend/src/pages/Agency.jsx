import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Crown, Trash2, MoreVertical, Clock, TrendingUp,
  Zap, UserPlus, CreditCard, Edit2, Lock,
  AlertCircle, Loader2, Eye, EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/ui/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ─── Add / Edit User Dialog ───────────────────────────────────────────────────
function UserFormDialog({ open, onClose, onSubmit, isLoading, editUser = null }) {
  const [form, setForm] = useState({
    username: editUser?.username || '',
    full_name: editUser?.full_name || '',
    email: editUser?.email || '',
    password: '',
    credits_balance: editUser?.credits_balance ?? 0,
  });
  const [showPassword, setShowPassword] = useState(false);
  const isEdit = !!editUser;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.username.trim()) { toast.error('Username is required'); return; }
    if (form.username.trim().length < 3) { toast.error('Username must be at least 3 characters'); return; }
    if (!/^[a-zA-Z0-9_.-]+$/.test(form.username.trim())) { toast.error('Username can only contain letters, numbers, underscores, dots, and hyphens'); return; }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) { toast.error('Please enter a valid email address'); return; }
    if (!isEdit && !form.password.trim()) { toast.error('Password is required'); return; }
    if (!isEdit && form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (isEdit && form.password && form.password.length < 6) { toast.error('New password must be at least 6 characters'); return; }
    if (form.credits_balance < 0) { toast.error('Credits balance cannot be negative'); return; }
    onSubmit(form);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">
            {isEdit ? 'Edit Agency User' : 'Add Agency User'}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {isEdit
              ? "Update this sub-user's details. Leave password blank to keep it unchanged."
              : 'Create a sub-user. They log in at the same /SignIn page with their own credentials.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label className="text-slate-300">Username *</Label>
            <Input
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              placeholder="e.g. john_doe"
              disabled={isEdit}
              className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
            />
            {isEdit && <p className="text-xs text-slate-500">Username cannot be changed after creation.</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-300">Full Name</Label>
            <Input
              value={form.full_name}
              onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
              placeholder="e.g. John Doe"
              className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-300">Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="e.g. john@company.com"
              className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-300">
              Password {isEdit ? '(leave blank to keep current)' : '*'}
            </Label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder={isEdit ? 'Enter new password to change' : 'Min. 6 characters'}
                className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-300">Credits Balance</Label>
            <Input
              type="number"
              min="0"
              value={form.credits_balance}
              onChange={e => setForm(f => ({ ...f, credits_balance: parseInt(e.target.value) || 0 }))}
              className="bg-slate-800 border-slate-600 text-white"
            />
            <p className="text-xs text-slate-500">
              Number of voiceover credits this sub-user can use this month.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}
              className="flex-1 border-slate-600 hover:bg-slate-800 text-slate-300">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white">
              {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {isEdit ? 'Update User' : 'Create User'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Allocate Credits Dialog ──────────────────────────────────────────────────
function AllocateCreditsDialog({ open, onClose, user, onSubmit, isLoading }) {
  const [amount, setAmount] = useState(user?.credits_balance ?? 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-white">Allocate Credits</DialogTitle>
          <DialogDescription className="text-slate-400">
            Set the total credit balance for{' '}
            <strong className="text-white">{user?.full_name || user?.username}</strong>.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={e => {
            e.preventDefault();
            if (amount < 0) { toast.error('Credits cannot be negative'); return; }
            onSubmit(amount);
          }}
          className="space-y-4 mt-2"
        >
          <div className="space-y-1.5">
            <Label className="text-slate-300">Credit Balance</Label>
            <Input
              type="number"
              min="0"
              value={amount}
              onChange={e => setAmount(parseInt(e.target.value) || 0)}
              className="bg-slate-800 border-slate-600 text-white text-lg font-semibold"
            />
            <p className="text-xs text-slate-500">Current balance: {user?.credits_balance ?? 0} credits</p>
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose}
              className="flex-1 border-slate-600 hover:bg-slate-800 text-slate-300">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CreditCard className="w-4 h-4 mr-2" />}
              Set Credits
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Agency Page ─────────────────────────────────────────────────────────
export default function Agency() {
  const qc = useQueryClient();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [creditsUser, setCreditsUser] = useState(null);

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const addons = (() => {
    let a = currentUser?.addons;
    if (typeof a === 'string') { try { a = JSON.parse(a); } catch { a = {}; } }
    return a || {};
  })();

  const basePlan    = (currentUser?.base_plan || '').toUpperCase();
  const hasAllAccess = addons?.ALLACCESS === true || addons?.allaccess === true;
  const plan        = hasAllAccess ? 'ALLACCESS' : basePlan;
  // BUNDLE and ALLACCESS unlock agency features; individual AGENCY addon also grants access
  const hasAgency   = plan === 'BUNDLE' || plan === 'ALLACCESS' || addons?.AGENCY === true || addons?.agency === true;
  const isAdmin    = currentUser?.role === 'admin';

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['agencyStats'],
    queryFn: () => base44.agency.getStats(),
    enabled: hasAgency && isAdmin,
  });

  const { data: agencyUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ['agencyUsers'],
    queryFn: () => base44.agency.listUsers(),
    enabled: hasAgency && isAdmin,
  });

  const createMutation = useMutation({
    mutationFn: (payload) => base44.agency.createUser(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agencyUsers'] });
      qc.invalidateQueries({ queryKey: ['agencyStats'] });
      qc.invalidateQueries({ queryKey: ['currentUser'] });
      setAddDialogOpen(false);
      toast.success('Agency user created successfully');
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to create user'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => base44.agency.updateUser(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agencyUsers'] });
      setEditUser(null);
      toast.success('User updated');
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to update user'),
  });

  const removeMutation = useMutation({
    mutationFn: (id) => base44.agency.removeUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agencyUsers'] });
      qc.invalidateQueries({ queryKey: ['agencyStats'] });
      qc.invalidateQueries({ queryKey: ['currentUser'] });
      toast.success('User removed');
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to remove user'),
  });

  const creditsMutation = useMutation({
    mutationFn: ({ id, amount }) => base44.agency.allocateCredits(id, amount),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agencyUsers'] });
      qc.invalidateQueries({ queryKey: ['agencyStats'] });
      qc.invalidateQueries({ queryKey: ['currentUser'] });
      setCreditsUser(null);
      toast.success('Credits updated');
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to update credits'),
  });

  // ── No agency addon ───────────────────────────────────────────────────────
  if (!hasAgency || !isAdmin) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Agency Management"
          description="Manage your team and clients"
          icon={Users}
          gradient="from-indigo-500 to-purple-500"
        />
        <GlassCard
          className="p-10 bg-gradient-to-br from-violet-900/30 via-purple-900/20 to-pink-900/20 border-violet-500/30 relative overflow-hidden"
          hover={false}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-full blur-3xl" />
          <div className="relative text-center">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0], y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="inline-block mb-6"
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-2xl shadow-amber-500/30">
                <Crown className="w-10 h-10 text-white" />
              </div>
            </motion.div>
            <h3 className="text-3xl font-bold text-white mb-3">Agency Addon Required</h3>
            <p className="text-slate-400 mb-4 max-w-2xl mx-auto text-lg">
              Your account needs the <strong className="text-white">AGENCY</strong> addon to manage sub-users and allocate credits.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-sm text-slate-300 mb-8">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              {isAdmin ? 'Agency add-on not active on your account.' : 'Only the account admin can manage agency users.'}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8 text-left">
              {[
                { icon: UserPlus, title: 'Create Sub-Users', desc: 'Add team members with their own login credentials' },
                { icon: CreditCard, title: 'Allocate Credits', desc: 'Control how many credits each sub-user can consume' },
                { icon: TrendingUp, title: 'Track Usage', desc: 'Monitor usage and activity per team member' },
              ].map((f) => (
                <div key={f.title} className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/40">
                  <f.icon className="w-5 h-5 text-violet-400 mb-2" />
                  <p className="font-semibold text-white text-sm mb-1">{f.title}</p>
                  <p className="text-xs text-slate-400">{f.desc}</p>
                </div>
              ))}
            </div>
            <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 h-12 px-8 text-base font-semibold shadow-lg shadow-amber-500/25">
              <Crown className="w-5 h-5 mr-2" /> Upgrade to Agency
            </Button>
          </div>
        </GlassCard>
      </div>
    );
  }

  // ── Full agency dashboard ─────────────────────────────────────────────────
  const statCards = [
    { label: 'Team Members', value: stats?.total_users ?? agencyUsers.length, icon: Users, gradient: 'from-violet-500 to-purple-500' },
    { label: 'Credits Allocated', value: stats?.total_credits_allocated ?? 0, icon: CreditCard, gradient: 'from-emerald-500 to-teal-500' },
    { label: 'Credits Used (Month)', value: stats?.total_credits_used ?? 0, icon: TrendingUp, gradient: 'from-blue-500 to-cyan-500' },
    { label: 'Login Page', value: '/SignIn', icon: Lock, gradient: 'from-amber-500 to-orange-500', isText: true },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agency Management"
        description="Create sub-users, allocate credits, and track team usage"
        icon={Users}
        gradient="from-indigo-500 to-purple-500"
      />

      {/* Info Banner */}
      <GlassCard className="p-4 bg-blue-900/20 border-blue-500/30" hover={false}>
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-blue-300 text-sm">
            <strong>Sub-user login:</strong> Agency sub-users log in at the{' '}
            <strong className="text-blue-200">/SignIn</strong> page (same URL as you) using the username and password
            you set for them. They do not need a ProWebVentures account.
          </p>
        </div>
      </GlassCard>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}>
            <GlassCard className="p-5" hover={false}>
              <div className="flex items-center gap-3">
                <div className={cn('w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg', stat.gradient)}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">{stat.label}</p>
                  <p className={cn('font-bold text-white', stat.isText ? 'text-sm' : 'text-xl')}>{stat.value}</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Users */}
      <GlassCard className="p-6" hover={false}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-violet-400" />
            Sub-Users
            <Badge className="bg-violet-500/10 text-violet-400 border-violet-500/20 ml-1">{agencyUsers.length}</Badge>
          </h2>
          <Button
            onClick={() => setAddDialogOpen(true)}
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
          >
            <UserPlus className="w-4 h-4 mr-2" /> Add User
          </Button>
        </div>

        {loadingUsers ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
          </div>
        ) : agencyUsers.length === 0 ? (
          <div className="text-center py-12">
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity }}
              className="w-16 h-16 mx-auto rounded-2xl bg-slate-800/50 flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-slate-500" />
            </motion.div>
            <h3 className="text-white font-semibold mb-1">No sub-users yet</h3>
            <p className="text-slate-400 text-sm mb-4">Click "Add User" to create the first agency sub-user.</p>
            <Button onClick={() => setAddDialogOpen(true)} variant="outline"
              className="border-violet-500/50 text-violet-400 hover:bg-violet-500/10">
              <UserPlus className="w-4 h-4 mr-2" /> Add First User
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {agencyUsers.map((user, idx) => {
                const usageData = stats?.users?.find(u => u.id === user.id);
                const creditsUsed = usageData?.credits_used ?? 0;
                const creditsTotal = user.credits_balance;
                const usagePct = creditsTotal > 0 ? Math.min(100, Math.round((creditsUsed / creditsTotal) * 100)) : 0;

                return (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: idx * 0.04 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700/30 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <span className="text-white font-bold text-lg">
                        {(user.full_name || user.username)?.[0]?.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-white">{user.full_name || user.username}</h3>
                        <Badge className="bg-slate-700/60 text-slate-300 border-slate-600/40 text-xs">@{user.username}</Badge>
                      </div>
                      {user.email && <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>}
                      <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        Added {format(new Date(user.created_at), 'MMM d, yyyy')}
                        {usageData?.last_login_at && (
                          <span className="ml-2">· Last login: {format(new Date(usageData.last_login_at), 'MMM d')}</span>
                        )}
                      </span>
                    </div>

                    {/* Credits bar */}
                    <div className="hidden sm:flex flex-col items-end min-w-[130px]">
                      <div className="flex items-center gap-1.5 mb-1">
                        <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-sm font-medium text-white">
                          {creditsUsed}<span className="text-slate-400 font-normal"> / {creditsTotal}</span>
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-700">
                        <div
                          className={cn('h-full rounded-full transition-all',
                            usagePct >= 90 ? 'bg-red-500' : usagePct >= 70 ? 'bg-amber-500' : 'bg-emerald-500')}
                          style={{ width: `${usagePct}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 mt-0.5">{usagePct}% used</span>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost"
                          className="text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                        <DropdownMenuItem
                          className="text-slate-300 focus:text-white focus:bg-slate-700"
                          onClick={() => setEditUser(user)}>
                          <Edit2 className="w-4 h-4 mr-2" /> Edit User
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-emerald-400 focus:text-emerald-300 focus:bg-emerald-500/10"
                          onClick={() => setCreditsUser(user)}>
                          <CreditCard className="w-4 h-4 mr-2" /> Allocate Credits
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-400 focus:text-red-300 focus:bg-red-500/10"
                          onClick={() => {
                            if (confirm(`Remove ${user.full_name || user.username}? They will no longer be able to log in.`)) {
                              removeMutation.mutate(user.id);
                            }
                          }}>
                          <Trash2 className="w-4 h-4 mr-2" /> Remove User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </GlassCard>

      {/* Credit flow explanation */}
      <GlassCard className="p-6 bg-slate-800/20 border-slate-700/30" hover={false}>
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-emerald-400" />
          How Agency Credits Work
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          {[
            { icon: UserPlus, title: '1. Create Sub-User', color: 'text-violet-400',
              desc: 'Add a sub-user with a username and password. They log in at the same /SignIn page — no ProWebVentures account needed.' },
            { icon: CreditCard, title: '2. Allocate Credits', color: 'text-emerald-400',
              desc: 'Set a credits_balance for each sub-user. This controls how many voiceover credits they can consume.' },
            { icon: TrendingUp, title: '3. Track Usage', color: 'text-blue-400',
              desc: 'The stats panel shows each sub-user\'s credit usage this month. Credits renew when you reset the balance.' },
          ].map((step) => (
            <div key={step.title} className="flex gap-3">
              <step.icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', step.color)} />
              <div>
                <p className="font-medium text-white">{step.title}</p>
                <p className="text-slate-400 mt-0.5 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Dialogs */}
      <UserFormDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSubmit={(form) => createMutation.mutate(form)}
        isLoading={createMutation.isPending}
      />

      {editUser && (
        <UserFormDialog
          open={!!editUser}
          onClose={() => setEditUser(null)}
          editUser={editUser}
          onSubmit={(form) => {
            const payload = {};
            if (form.full_name !== undefined) payload.full_name = form.full_name;
            if (form.email !== undefined) payload.email = form.email;
            if (form.password) payload.password = form.password;
            updateMutation.mutate({ id: editUser.id, payload });
          }}
          isLoading={updateMutation.isPending}
        />
      )}

      {creditsUser && (
        <AllocateCreditsDialog
          open={!!creditsUser}
          onClose={() => setCreditsUser(null)}
          user={creditsUser}
          onSubmit={(amount) => creditsMutation.mutate({ id: creditsUser.id, amount })}
          isLoading={creditsMutation.isPending}
        />
      )}
    </div>
  );
}
