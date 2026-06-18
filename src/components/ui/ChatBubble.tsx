import { motion } from 'framer-motion'

interface ChatBubbleProps {
  from: 'user' | 'ai'
  text: string
  pending?: boolean
}

export function ChatBubble({ from, text, pending }: ChatBubbleProps) {
  const isAI = from === 'ai'
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}
    >
      <div
        className={`max-w-[80%] whitespace-pre-line rounded-[20px] px-4 py-3 text-[15px] leading-relaxed shadow-card ${
          isAI ? 'rounded-tl-md bg-white text-ink/85' : 'rounded-tr-md text-white'
        }`}
        style={!isAI ? { background: 'linear-gradient(120deg, var(--color-primary), var(--color-primary-strong))' } : undefined}
      >
        {pending ? (
          <span className="flex gap-1 py-1">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-grape/40 [animation-delay:-0.2s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-grape/40" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-grape/40 [animation-delay:0.2s]" />
          </span>
        ) : (
          text
        )}
      </div>
    </motion.div>
  )
}
