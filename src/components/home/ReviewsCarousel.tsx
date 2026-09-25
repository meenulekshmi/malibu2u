import React from 'react';
import { Star, ShieldCheck, MessageSquare } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

export async function ReviewsCarousel() {
  let reviews: any[] = [];
  try {
    reviews = await prisma.review.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: { name: true },
        },
      },
    });
  } catch (e) {
    console.error('Error fetching reviews:', e);
  }

  return (
    <section className="space-y-6">
      <ScrollReveal className="flex items-end justify-between border-b border-slate-800/80 pb-4">
        <div>
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 fill-cyan-400 text-cyan-400 animate-pulse" /> COMMUNITY FEEDBACK
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1 uppercase">
            Customer Reviews & Ratings
          </h2>
        </div>
      </ScrollReveal>

      {reviews.length === 0 ? (
        <ScrollReveal>
          <div className="p-10 rounded-2xl bg-[#111726] border border-slate-800/80 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">No reviews yet.</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Be the first customer to share your experience on Malibu2u after purchasing!
            </p>
          </div>
        </ScrollReveal>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev, idx) => (
            <ScrollReveal key={rev.id} delayMs={idx * 100}>
              <div
                className="group p-6 rounded-2xl bg-[#111726] border border-slate-800/80 hover:border-cyan-500/40 hover:-translate-y-1.5 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-cyan-500/10 space-y-4 flex flex-col justify-between h-full"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed italic group-hover:text-white transition-colors">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      {rev.userName}
                      <span title="Verified Gamer Purchase">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      </span>
                    </h4>
                    <p className="text-[10px] text-cyan-400 font-mono truncate max-w-[200px]">
                      {rev.product?.name || 'Verified Product'}
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      )}
    </section>
  );
}
