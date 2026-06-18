import { useEffect, useMemo, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { Header } from '../components/layout/Header'
import { ActionSheet } from '../components/ui/ActionSheet'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { EvolutionChart } from '../components/ui/EvolutionChart'
import { Eyebrow } from '../components/ui/Eyebrow'
import copy from '../i18n/pt-BR'
import { buildEvolutionSeries, isToday, type EvolutionPoint } from '../lib/evolution'
import { useAppState } from '../state/AppStateContext'

export function EvolutionScreen() {
  const { journalEntries, navigate, requestReflection, requestEvolutionSummary, markActivityDone, seedDemoData, devAddEvolutionDay, openExerciseOfTheDay } = useAppState()

  const series = useMemo(() => buildEvolutionSeries(journalEntries), [journalEntries])

  // Guardamos só o id do dia selecionado e derivamos o ponto da série viva, para
  // que o sheet reflita na hora mudanças como "atividade concluída" (em vez de
  // segurar um snapshot que envelhece).
  const [activeId, setActiveId] = useState<string | null>(null)
  const active = useMemo(() => series.find((p) => p.entryId === activeId) ?? null, [series, activeId])
  const [reflection, setReflection] = useState<string[] | null>(null)
  const [loadingReflection, setLoadingReflection] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)

  // Pede um resumo da evolução à IA sempre que a série muda. A assinatura
  // (data + humor + ansiedade) evita refazer a chamada sem necessidade.
  const summaryKey = useMemo(
    () => series.map((p) => `${p.date}:${p.moodScore}:${p.anxietyLevel}`).join('|'),
    [series],
  )
  useEffect(() => {
    if (series.length === 0) {
      setSummary(null)
      return
    }
    let cancelled = false
    setSummary(null)
    void requestEvolutionSummary(
      series.map((p) => ({ date: p.date, moodScore: p.moodScore, anxietyLevel: p.anxietyLevel })),
    ).then((text) => {
      if (!cancelled) setSummary(text)
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summaryKey])

  const openAction = async (point: EvolutionPoint) => {
    setActiveId(point.entryId)
    setReflection(null)
    setLoadingReflection(true)
    const paragraphs = await requestReflection({
      id: point.entryId,
      userId: '',
      mood: point.mood,
      text: point.text,
      anxietyLevel: point.anxietyLevel,
      activityDone: point.activityDone,
      createdAt: `${point.date}T00:00:00.000Z`,
    })
    setReflection(paragraphs)
    setLoadingReflection(false)
  }

  const closeAction = () => setActiveId(null)

  if (series.length === 0) {
    return (
      <div className="flex flex-1 flex-col">
        <Header title={copy.evolution.title} />
        <Card className="flex flex-1 flex-col items-center justify-center text-center">
          <Sparkles size={28} strokeWidth={1.5} style={{ color: 'var(--color-primary)' }} />
          <p className="mt-4 text-[15px] font-semibold text-slate-800">{copy.evolution.emptyTitle}</p>
          <p className="mt-1 max-w-xs text-sm text-slate-500">{copy.evolution.emptyBody}</p>
          <div className="mt-6 w-full space-y-2">
            <Button onClick={() => navigate('journal')}>{copy.evolution.emptyCta}</Button>
            {import.meta.env.DEV && (
              <>
                <Button variant="ghost" onClick={() => void seedDemoData()}>
                  Preencher dados de exemplo (demo)
                </Button>
                <Button variant="ghost" onClick={() => void devAddEvolutionDay()}>
                  Dev: passar +1 dia no gráfico
                </Button>
              </>
            )}
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      <Header title={copy.evolution.title} />

      <Card>
        <Eyebrow>{copy.evolution.subtitle}</Eyebrow>
        <div className="mt-4">
          <EvolutionChart series={series} onPointClick={openAction} />
        </div>
        <p className="mt-3 text-center text-xs text-slate-400">{copy.evolution.chartHint}</p>
        {import.meta.env.DEV && (
          <Button variant="ghost" className="mt-4" onClick={() => void devAddEvolutionDay()}>
            Dev: passar +1 dia no gráfico
          </Button>
        )}
      </Card>

      <div className="mt-4 rounded-2xl border border-slate-100 bg-white px-4 py-3.5 shadow-sm">
        <div className="flex items-center gap-2">
          <Sparkles size={15} strokeWidth={1.8} style={{ color: 'var(--color-primary)' }} />
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{copy.evolution.summaryHeading}</p>
        </div>
        {summary === null ? (
          <p className="mt-2 text-sm text-slate-400">{copy.evolution.summaryLoading}</p>
        ) : (
          <p className="mt-2 text-[15px] leading-relaxed text-slate-700">{summary}</p>
        )}
      </div>

      <ActionSheet
        open={active !== null}
        title={copy.evolution.actionTitle}
        onClose={closeAction}
        closeLabel={copy.evolution.closeAction}
      >
        {active && (
          <div className="space-y-6">
            <section>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
                {copy.evolution.reflectionHeading}
              </p>
              {loadingReflection || !reflection ? (
                <p className="mt-2 text-sm text-slate-400">{copy.evolution.reflectionLoading}</p>
              ) : (
                <div className="mt-2 space-y-3">
                  {reflection.map((paragraph, index) => (
                    <p key={index} className="text-[15px] leading-relaxed text-slate-700">
                      {paragraph}
                    </p>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-700">{copy.evolution.exerciseHeading}</p>
              <p className="mt-1 text-sm text-slate-500">
                {active.activityDone
                  ? isToday(active.date)
                    ? copy.evolution.exerciseIntroTodayDone
                    : copy.evolution.exerciseIntroWithActivity
                  : copy.evolution.exerciseIntroNoActivity}
              </p>

              <div className="mt-4 space-y-2">
                <Button
                  onClick={() => {
                    closeAction()
                    void openExerciseOfTheDay()
                  }}
                >
                  {copy.dashboard.exerciseCta}
                </Button>
                {!active.activityDone && (
                  <Button
                    variant="secondary"
                    onClick={async () => {
                      await markActivityDone(active.entryId)
                      closeAction()
                    }}
                  >
                    {copy.evolution.markActivityCta}
                  </Button>
                )}
              </div>
            </section>
          </div>
        )}
      </ActionSheet>
    </div>
  )
}
