import { useEffect, useRef, useState } from 'react'
import { Send } from 'lucide-react'
import { Header } from '../components/layout/Header'
import { ChatBubble } from '../components/ui/ChatBubble'
import copy from '../i18n/pt-BR'
import { getChallengeById } from '../lib/challenges'
import { useAppState } from '../state/AppStateContext'
import { moodThemes } from '../theme/moodTheme'
import type { MoodId } from '../types'

function greetingPreview(name: string, mood: MoodId, challengeTitle: string | null) {
  const label = moodThemes[mood].label.toLowerCase()
  const hello = `Oi${name ? `, ${name}` : ''}! Vi que seu humor de hoje é "${label}".`
  if (challengeTitle) {
    return `${hello} A gente está no desafio "${challengeTitle}", e estou aqui pra te ajudar com isso. Quer me contar como está sendo?`
  }
  return `${hello} Quer me contar um pouco mais, ou já vamos direto para um exercício?`
}

export function AICoachScreen() {
  const { chatMessages, chatPending, sendChatMessage, navigate, user, mood, plan } = useAppState()
  const challengeTitle = plan ? getChallengeById(plan.challengeId)?.title ?? null : null
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, chatPending])

  const handleSend = async (text: string) => {
    if (!text.trim()) return
    setInput('')
    await sendChatMessage(text.trim())
  }

  return (
    <div className="flex flex-1 flex-col">
      <Header title={copy.aiCoach.title} />

      <div className="flex-1 space-y-3 overflow-y-auto">
        {chatMessages.length === 0 && (
          <ChatBubble from="ai" text={greetingPreview(user?.name?.trim().split(/\s+/)[0] ?? '', mood, challengeTitle)} />
        )}
        {chatMessages.map((message) => (
          <ChatBubble key={message.id} from={message.messageFrom} text={message.text} />
        ))}
        {chatPending && <ChatBubble from="ai" text="" pending />}
        <div ref={bottomRef} />
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {copy.aiCoach.quickReplies.map((reply) => (
          <button
            key={reply}
            type="button"
            onClick={() => handleSend(reply)}
            className="flex-shrink-0 rounded-full border border-grape/15 bg-white px-3.5 py-2 text-xs font-semibold text-grape transition-colors hover:bg-grape/[0.07]"
          >
            {reply}
          </button>
        ))}
      </div>

      <form
        className="mt-3 flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          handleSend(input)
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={copy.aiCoach.inputPlaceholder}
          className="flex-1 rounded-2xl border border-grape/15 bg-white px-4 py-3 text-[15px] text-ink placeholder:text-ink/35 transition-colors focus:border-grape"
        />
        <button
          type="submit"
          aria-label={copy.aiCoach.sendButton}
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl text-white shadow-[0_10px_22px_-10px_rgba(219,39,119,0.6)]"
          style={{ background: 'linear-gradient(120deg,#FB5436,#DB2777)' }}
        >
          <Send size={18} strokeWidth={2} />
        </button>
      </form>
    </div>
  )
}
