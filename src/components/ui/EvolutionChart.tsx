import { useEffect, useRef } from 'react'
import { moodThemes } from '../../theme/moodTheme'
import type { EvolutionPoint } from '../../lib/evolution'

interface EvolutionChartProps {
  series: EvolutionPoint[]
  onPointClick?: (point: EvolutionPoint) => void
}

// Gráfico de duas escalas desenhado em SVG (sem dependência de lib de chart):
// eixo Y esquerdo = humor (1 a 5), eixo Y direito = ansiedade (1 a 10),
// eixo X = dias. Duas linhas, e cada ponto de humor é clicável.
// A escala de ansiedade é INVERTIDA (1 no topo, 10 embaixo) para que as duas
// linhas contem a mesma história: bom (humor alto / ansiedade baixa) em cima,
// ruim (humor baixo / ansiedade alta) embaixo.
//
// JANELA DESLIZANTE: para não poluir com muitos dias, mostramos ~5 dias por vez.
// A área do gráfico ROLA na horizontal (arrastar/scroll), e o eixo Y (emojis de
// humor) fica FIXO à esquerda. Ao registrar novos dias, o gráfico corre sozinho
// para a direita, revelando o dia mais recente.

const H = 200
const PAD_T = 16
const PAD_B = 28
const AXIS_W = 30 // faixa fixa do eixo Y (emojis de humor)
const RIGHT_PAD = 30 // espaço à direita para os rótulos de ansiedade
// Largura por dia (px). O container do gráfico tem ~5×DAY_W de largura, então
// ~5 dias cabem por vez; com mais dias, a área rola na horizontal.
const DAY_W = 62
const PLOT_T = PAD_T
const PLOT_H = H - PAD_T - PAD_B

const MOOD_MIN = 1
const MOOD_MAX = 5
const ANX_MIN = 1
const ANX_MAX = 10

const LINE_MOOD = '#94a3b8'
const LINE_ANX = '#94a3b8'
const ANX_DOT = '#1e1b2e'
const ANX_LABEL = '#64748b'

const ZONE_GOOD = '#dcfce7'
const ZONE_WATCH = '#fef3c7'
const DIVIDER_COLOR = '#cbd5e1'

const MOOD_DIVIDE = 3
const ANX_DIVIDE = 5

const MOOD_EMOJIS = ['sad', 'neutral', 'happy', 'veryHappy', 'excited'] as const

export function EvolutionChart({ series, onPointClick }: EvolutionChartProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Largura total da área rolável: meio passo de folga em cada ponta + um passo
  // por dia, para o 1º e o último ponto não colarem na borda.
  const plotW = series.length * DAY_W
  const innerW = plotW + RIGHT_PAD

  // Posição X de cada dia dentro da área rolável (centralizado na sua "coluna").
  const xFor = (index: number) => index * DAY_W + DAY_W / 2
  const yMood = (score: number) => PLOT_T + PLOT_H - ((score - MOOD_MIN) / (MOOD_MAX - MOOD_MIN)) * PLOT_H
  const yAnx = (level: number) => PLOT_T + ((level - ANX_MIN) / (ANX_MAX - ANX_MIN)) * PLOT_H

  const moodPath = series.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yMood(p.moodScore)}`).join(' ')
  const anxPath = series.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yAnx(p.anxietyLevel)}`).join(' ')
  const yDivide = (yMood(MOOD_DIVIDE) + yAnx(ANX_DIVIDE)) / 2

  // Ao montar e sempre que a série cresce, rola até o fim (dia mais recente).
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollLeft = el.scrollWidth
  }, [series.length])

  return (
    <div>
      <div className="flex">
        {/* Eixo Y FIXO (emojis de humor) — não rola junto com o gráfico. */}
        <svg width={AXIS_W} height={H} className="flex-shrink-0" aria-hidden>
          {[1, 2, 3, 4, 5].map((score) => (
            <text key={score} x={AXIS_W - 6} y={yMood(score) + 3} textAnchor="end" fontSize={11} fill="#94a3b8">
              {moodThemes[MOOD_EMOJIS[score - 1]].emoji}
            </text>
          ))}
        </svg>

        {/* Área do gráfico — ROLÁVEL na horizontal (arrastar/scroll/touch). */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-x-auto overscroll-x-contain"
          style={{ scrollbarWidth: 'thin' }}
        >
          <svg
            width={innerW}
            height={H}
            // Largura proporcional ao nº de dias (DAY_W por dia). O container tem
            // ~5 colunas de largura, então com mais de ~5 dias o conteúdo
            // transborda e rola; com menos, fica compacto sem esticar.
            style={{ width: innerW, display: 'block' }}
            role="img"
            aria-label="Gráfico de humor e ansiedade por dia"
          >
            <defs>
              <clipPath id="evo-plot">
                <rect x={0} y={PLOT_T} width={plotW} height={PLOT_H} rx={10} />
              </clipPath>
            </defs>

            {/* faixas de fundo: bem-estar (cima) e atenção (baixo) */}
            <g clipPath="url(#evo-plot)">
              <rect x={0} y={PLOT_T} width={plotW} height={yDivide - PLOT_T} fill={ZONE_GOOD} opacity={0.55} />
              <rect x={0} y={yDivide} width={plotW} height={PLOT_T + PLOT_H - yDivide} fill={ZONE_WATCH} opacity={0.5} />
            </g>

            {/* divisória entre as zonas */}
            <line x1={0} y1={yDivide} x2={plotW} y2={yDivide} stroke={DIVIDER_COLOR} strokeWidth={1} strokeDasharray="2 3" />
            <text x={4} y={yDivide - 4} fontSize={7.5} fill="#16a34a" fontWeight={600} opacity={0.8}>
              BEM-ESTAR
            </text>
            <text x={4} y={yDivide + 10} fontSize={7.5} fill="#b45309" fontWeight={600} opacity={0.8}>
              ATENÇÃO
            </text>

            {/* grades horizontais */}
            {[1, 2, 3, 4, 5].map((score) => (
              <line key={score} x1={0} y1={yMood(score)} x2={plotW} y2={yMood(score)} stroke="#ffffff" strokeWidth={1} opacity={0.6} />
            ))}

            {/* linha de ansiedade: cinza tracejada */}
            <path d={anxPath} fill="none" stroke={LINE_ANX} strokeWidth={1.5} strokeDasharray="4 3" strokeLinecap="round" opacity={0.7} />
            {series.map((p, i) => (
              <circle key={`a-${p.entryId}`} cx={xFor(i)} cy={yAnx(p.anxietyLevel)} r={2.5} fill={ANX_DOT} />
            ))}

            {/* linha de humor: cinza contínua */}
            <path d={moodPath} fill="none" stroke={LINE_MOOD} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" opacity={0.7} />
            {series.map((p, i) => {
              const moodColor = moodThemes[p.mood].bar
              return (
                <g key={`m-${p.entryId}`}>
                  {p.isCritical && (
                    <circle cx={xFor(i)} cy={yMood(p.moodScore)} r={8} fill="#fee2e2" stroke="#fca5a5" strokeWidth={1} />
                  )}
                  <circle
                    cx={xFor(i)}
                    cy={yMood(p.moodScore)}
                    r={5}
                    fill={moodColor}
                    stroke="#fff"
                    strokeWidth={1.5}
                    style={{ cursor: onPointClick ? 'pointer' : 'default' }}
                    onClick={() => onPointClick?.(p)}
                  />
                </g>
              )
            })}

            {/* rótulos do eixo X — agora cabe um por dia, pois há espaço. */}
            {series.map((p, i) => (
              <text key={`x-${p.entryId}`} x={xFor(i)} y={H - 8} textAnchor="middle" fontSize={8} fill="#94a3b8">
                {p.dayLabel}
              </text>
            ))}
          </svg>
        </div>

        {/* rótulos do eixo direito (ansiedade) — fixos à direita. */}
        <svg width={RIGHT_PAD} height={H} className="flex-shrink-0" aria-hidden>
          {[1, 5, 10].map((level) => (
            <text key={level} x={4} y={yAnx(level) + 3} textAnchor="start" fontSize={9} fill={ANX_LABEL}>
              {level}
            </text>
          ))}
        </svg>
      </div>

      <div className="mt-2 flex items-center justify-center gap-5 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <svg width="22" height="8" aria-hidden className="overflow-visible">
            <line x1="0" y1="4" x2="22" y2="4" stroke={LINE_MOOD} strokeWidth="1.5" opacity="0.7" />
            <circle cx="11" cy="4" r="3.5" fill="#cbd5e1" stroke="#fff" strokeWidth="1.5" />
          </svg>
          Humor
        </span>
        <span className="flex items-center gap-1.5">
          <svg width="22" height="8" aria-hidden className="overflow-visible">
            <line x1="0" y1="4" x2="22" y2="4" stroke={LINE_ANX} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.7" />
            <circle cx="11" cy="4" r="2.5" fill={ANX_DOT} />
          </svg>
          Ansiedade
        </span>
      </div>
    </div>
  )
}
