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
const W = 320
const H = 200
const PAD_L = 28
const PAD_R = 30
const PAD_T = 16
const PAD_B = 28

const MOOD_MIN = 1
const MOOD_MAX = 5
const ANX_MIN = 1
const ANX_MAX = 10

// Linhas em cinza neutro: a COR é reservada aos pontos (humor do dia / preto na
// ansiedade), então as linhas só conectam sem competir com a leitura de cor.
const LINE_MOOD = '#94a3b8' // cinza contínuo (humor)
const LINE_ANX = '#94a3b8' // cinza tracejado (ansiedade)
const ANX_DOT = '#1e1b2e' // ponto de ansiedade: preto (tinta da marca)
const ANX_LABEL = '#64748b' // rótulos do eixo de ansiedade, neutros

// Cores das duas zonas de leitura rápida. Topo = "bem-estar" (humor bom +
// ansiedade baixa), base = "atenção" (humor baixo + ansiedade alta).
const ZONE_GOOD = '#dcfce7' // verde-menta suave
const ZONE_WATCH = '#fef3c7' // âmbar suave
const DIVIDER_COLOR = '#cbd5e1'

// Cortes de cada escala: humor médio = 3 (neutro), ansiedade = 5.
const MOOD_DIVIDE = 3
const ANX_DIVIDE = 5

export function EvolutionChart({ series, onPointClick }: EvolutionChartProps) {
  const plotW = W - PAD_L - PAD_R
  const plotH = H - PAD_T - PAD_B

  const xFor = (index: number) => {
    if (series.length === 1) return PAD_L + plotW / 2
    return PAD_L + (index / (series.length - 1)) * plotW
  }
  const yMood = (score: number) => PAD_T + plotH - ((score - MOOD_MIN) / (MOOD_MAX - MOOD_MIN)) * plotH
  // Invertida: ansiedade baixa (boa) fica no topo, ansiedade alta (ruim) embaixo.
  const yAnx = (level: number) => PAD_T + ((level - ANX_MIN) / (ANX_MAX - ANX_MIN)) * plotH

  const moodPath = series.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yMood(p.moodScore)}`).join(' ')
  const anxPath = series.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yAnx(p.anxietyLevel)}`).join(' ')

  // As duas escalas cortam em alturas levemente diferentes; usamos a média para
  // uma divisória única e honesta entre a zona "bem" (cima) e "atenção" (baixo).
  const yDivide = (yMood(MOOD_DIVIDE) + yAnx(ANX_DIVIDE)) / 2

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Gráfico de humor e ansiedade por dia">
        <defs>
          <clipPath id="evo-plot">
            <rect x={PAD_L} y={PAD_T} width={plotW} height={plotH} rx={10} />
          </clipPath>
        </defs>

        {/* faixas de fundo: bem-estar (cima) e atenção (baixo) */}
        <g clipPath="url(#evo-plot)">
          <rect x={PAD_L} y={PAD_T} width={plotW} height={yDivide - PAD_T} fill={ZONE_GOOD} opacity={0.55} />
          <rect x={PAD_L} y={yDivide} width={plotW} height={PAD_T + plotH - yDivide} fill={ZONE_WATCH} opacity={0.5} />
        </g>

        {/* divisória entre as zonas */}
        <line x1={PAD_L} y1={yDivide} x2={W - PAD_R} y2={yDivide} stroke={DIVIDER_COLOR} strokeWidth={1} strokeDasharray="2 3" />
        <text x={PAD_L + 4} y={yDivide - 4} fontSize={7.5} fill="#16a34a" fontWeight={600} opacity={0.8}>
          BEM-ESTAR
        </text>
        <text x={PAD_L + 4} y={yDivide + 10} fontSize={7.5} fill="#b45309" fontWeight={600} opacity={0.8}>
          ATENÇÃO
        </text>

        {/* grades horizontais */}
        {[1, 2, 3, 4, 5].map((score) => (
          <g key={score}>
            <line x1={PAD_L} y1={yMood(score)} x2={W - PAD_R} y2={yMood(score)} stroke="#ffffff" strokeWidth={1} opacity={0.6} />
            <text x={PAD_L - 6} y={yMood(score) + 3} textAnchor="end" fontSize={8} fill="#94a3b8">
              {moodThemes[(['sad', 'neutral', 'happy', 'veryHappy', 'excited'] as const)[score - 1]].emoji}
            </text>
          </g>
        ))}

        {/* rótulos eixo direito (ansiedade) */}
        {[1, 5, 10].map((level) => (
          <text key={level} x={W - PAD_R + 6} y={yAnx(level) + 3} textAnchor="start" fontSize={8} fill={ANX_LABEL}>
            {level}
          </text>
        ))}

        {/* linha de ansiedade: cinza tracejada */}
        <path d={anxPath} fill="none" stroke={LINE_ANX} strokeWidth={1.5} strokeDasharray="4 3" strokeLinecap="round" opacity={0.7} />
        {series.map((p, i) => (
          <circle key={`a-${p.entryId}`} cx={xFor(i)} cy={yAnx(p.anxietyLevel)} r={2.5} fill={ANX_DOT} />
        ))}

        {/* linha de humor: cinza contínua */}
        <path d={moodPath} fill="none" stroke={LINE_MOOD} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" opacity={0.7} />
        {series.map((p, i) => {
          // Ponto colorido com a cor daquele humor — comunica o dia sem depender
          // do humor atual do app.
          const moodColor = moodThemes[p.mood].bar
          return (
            <g key={`m-${p.entryId}`}>
              {p.isCritical && (
                <circle cx={xFor(i)} cy={yMood(p.moodScore)} r={8} fill="#fee2e2" stroke="#fca5a5" strokeWidth={1} />
              )}
              <circle
                cx={xFor(i)}
                cy={yMood(p.moodScore)}
                r={4.5}
                fill={moodColor}
                stroke="#fff"
                strokeWidth={1.5}
                style={{ cursor: onPointClick ? 'pointer' : 'default' }}
                onClick={() => onPointClick?.(p)}
              />
            </g>
          )
        })}

        {/* rótulos do eixo X (mostra só alguns para não poluir) */}
        {series.map((p, i) => {
          const step = Math.ceil(series.length / 6)
          if (i % step !== 0 && i !== series.length - 1) return null
          return (
            <text key={`x-${p.entryId}`} x={xFor(i)} y={H - 8} textAnchor="middle" fontSize={8} fill="#94a3b8">
              {p.dayLabel}
            </text>
          )
        })}
      </svg>

      <div className="mt-2 flex items-center justify-center gap-5 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          {/* linha cinza contínua + ponto colorido (humor do dia) */}
          <svg width="22" height="8" aria-hidden className="overflow-visible">
            <line x1="0" y1="4" x2="22" y2="4" stroke={LINE_MOOD} strokeWidth="1.5" opacity="0.7" />
            <circle cx="11" cy="4" r="3.5" fill="#cbd5e1" stroke="#fff" strokeWidth="1.5" />
          </svg>
          Humor
        </span>
        <span className="flex items-center gap-1.5">
          {/* linha cinza tracejada + ponto preto (ansiedade) */}
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
