import { motion, useReducedMotion } from 'framer-motion'
import { CheckCircle2, Heart, MessageCircleHeart, Sparkles, Target } from 'lucide-react'
import { Button } from '../components/ui/Button'
import copy from '../i18n/pt-BR'
import { setPlanTier } from '../lib/planTier'
import { useAppState } from '../state/AppStateContext'

// ─────────────────────────────────────────────────────────────────────────────
// Protótipo da tela de upsell do SoulSpace Conexão (treino de conversa com IA).
//
// Objetivo: apresentar o upgrade no auge do engajamento (gatilho ~7 dias +
// momento de vitória), atacando a dor #1 do nicho — medo de rejeição / paralisia
// no contato real. Copy 100% neutra de gênero (ver pt-BR.connectionUpsell).
//
// Ainda é protótipo: o CTA primário só fecha a tela (navega de volta). Quando o
// Conexão for um plano real, o CTA leva ao checkout do add-on (+R$ 29,90/mês) e
// grava o tier no User (ver lib/planTier.ts).
// ─────────────────────────────────────────────────────────────────────────────

const FEATURE_ICONS = [MessageCircleHeart, CheckCircle2, Target, Heart]

export function ConnectionUpsellScreen() {
  const { navigate, user } = useAppState()
  const reduce = useReducedMotion()
  const t = copy.connectionUpsell

  // Aceitar a oferta: ativa o tier Conexão e leva direto ao treino de conversa.
  // (Protótipo: grava o tier localmente. Quando virar plano pago, este clique
  // passa pelo checkout do add-on antes de ativar — ver lib/planTier.ts.)
  const accept = () => {
    // Upsell entrega o Conexão mensal (R$ 29,90). Grava o billing para a data de
    // vencimento e o status ficarem corretos (ver lib/planTier.ts e planAccess).
    setPlanTier(user, 'conexao', 'monthly')
    navigate('practice')
  }

  // Recusar/adiar: só volta ao início, sem ativar nada.
  const dismiss = () => navigate('dashboard')

  return (
    <div className="flex flex-1 flex-col pb-2">
      {/* Topo de marca em gradiente — apresenta o tier novo com brilho. */}
      <header className="relative mb-6 overflow-hidden rounded-[26px] px-6 pb-8 pt-7 shadow-aura">
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg,#10B981 0%,#6D28D9 52%,#FB5436 100%)' }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'linear-gradient(115deg, rgba(15,10,30,0.22) 0%, transparent 60%)' }}
        />
        <motion.div
          className="relative"
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white ring-1 ring-white/20 backdrop-blur-sm">
            <Sparkles size={13} strokeWidth={2.5} />
            {t.eyebrow}
          </span>
          <h1 className="mt-4 font-display text-[27px] font-semibold leading-[1.12] tracking-[-0.01em] text-white">
            {t.title}
          </h1>
          <p className="mt-2.5 text-[15px] leading-relaxed text-white/90">{t.lead}</p>
        </motion.div>
      </header>

      {/* Dor — fala diretamente com o medo que a pessoa sente. */}
      <p className="mb-6 rounded-2xl border border-grape/10 bg-grape/[0.04] px-5 py-4 text-[14px] leading-relaxed text-ink/75">
        {t.painLine}
      </p>

      {/* Benefícios — o que o Conexão desbloqueia. */}
      <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-grape/60">
        {t.featuresLabel}
      </p>
      <div className="space-y-3">
        {t.features.map((feature, i) => {
          const Icon = FEATURE_ICONS[i % FEATURE_ICONS.length]
          return (
            <motion.div
              key={feature.title}
              className="flex gap-3.5 rounded-[20px] border border-grape/10 bg-white p-4 shadow-card"
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 * i, ease: 'easeOut' }}
            >
              <div
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl text-white shadow-[0_8px_18px_-8px_rgba(109,40,217,0.6)]"
                style={{ background: 'linear-gradient(135deg,#6D28D9,#FB5436)' }}
              >
                <Icon size={19} strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <p className="text-[15px] font-bold text-ink">{feature.title}</p>
                <p className="mt-0.5 text-[13.5px] leading-relaxed text-ink/65">{feature.body}</p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Nota humana — desmecaniza: o apoio nasce de comportamento humano real. */}
      <div className="mt-5 flex items-start gap-2.5 px-1">
        <Heart size={15} strokeWidth={2} className="mt-0.5 flex-shrink-0 text-grape/55" />
        <p className="text-[13px] italic leading-relaxed text-ink/60">{t.humanNote}</p>
      </div>

      {/* Preço — âncora clara, comparada à terapia. */}
      <div className="mt-6 rounded-[22px] border-2 border-grape/15 bg-grape/[0.05] px-5 py-5 text-center">
        <p className="font-display text-[22px] font-semibold text-ink">{t.priceLine}</p>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink/60">{t.priceSubline}</p>
      </div>

      {/* CTAs */}
      <div className="mt-6 space-y-3">
        <Button onClick={accept}>{t.ctaPrimary}</Button>
        <Button variant="ghost" onClick={dismiss}>
          {t.ctaSecondary}
        </Button>
        <p className="px-2 text-center text-[12px] leading-relaxed text-ink/45">{t.reassurance}</p>
      </div>
    </div>
  )
}
