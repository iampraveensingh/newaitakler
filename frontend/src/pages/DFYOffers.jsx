import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gift, ExternalLink, Copy, Mic, FileText, Search, Filter, DollarSign, TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import PageHeader from '@/components/ui/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import EmptyState from '@/components/ui/EmptyState';
import { toast } from 'sonner';

export default function DFYOffers() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const { data: offers = [], isLoading } = useQuery({
    queryKey: ['dfyOffers'],
    queryFn: () => base44.entities.DFYOffer.list('-created_at')
  });

  const filteredOffers = offers.filter(offer => {
    const matchesSearch = offer.product_name?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || offer.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const copyAffiliateLink = (link) => {
    navigator.clipboard.writeText(link);
    toast.success('Affiliate link copied!');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="DFY Swipes & Offers"
        description="Ready-to-promote affiliate products with materials"
        icon={Gift}
        gradient="from-rose-500 to-pink-500"
      />

      {/* Filters */}
      <GlassCard className="p-4" hover={false}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search offers..."
              className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
            />
          </div>
        </div>
      </GlassCard>

      {/* Offers Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <GlassCard key={i} className="h-80 animate-pulse" hover={false} />
          ))}
        </div>
      ) : filteredOffers.length === 0 ? (
        <EmptyState
          icon={Gift}
          title="No offers available"
          description="DFY offers will appear here when available"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredOffers.map((offer) => (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <GlassCard className="overflow-hidden h-full flex flex-col">
                  {/* Product Image */}
                  <div className="h-48 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                    {offer.image_url ? (
                      <img src={offer.image_url} alt={offer.product_name} className="w-full h-full object-cover" />
                    ) : (
                      <Gift className="w-16 h-16 text-slate-600" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    {offer.is_featured && (
                      <Badge className="w-fit mb-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                        Featured
                      </Badge>
                    )}

                    <h3 className="font-semibold text-white mb-2">{offer.product_name}</h3>
                    <p className="text-sm text-slate-400 mb-4 line-clamp-2">{offer.description}</p>

                    {offer.commission && (
                      <div className="flex items-center gap-2 mb-4">
                        <DollarSign className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400 font-semibold">{offer.commission} Commission</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-auto space-y-2">
                      {offer.affiliate_link && (
                        <Button 
                          onClick={() => copyAffiliateLink(offer.affiliate_link)}
                          variant="outline" 
                          className="w-full border-slate-700"
                        >
                          <Copy className="w-4 h-4 mr-2" /> Copy Affiliate Link
                        </Button>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        <Link to={createPageUrl('CreateAdCopy')} className="w-full">
                          <Button size="sm" variant="outline" className="w-full border-slate-700">
                            <FileText className="w-4 h-4 mr-1" /> Ad Copy
                          </Button>
                        </Link>
                        <Link to={createPageUrl('CreateVoiceover')} className="w-full">
                          <Button size="sm" variant="outline" className="w-full border-slate-700">
                            <Mic className="w-4 h-4 mr-1" /> Voice
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}