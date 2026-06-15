# Claude Code — Commands & Skills

Comandos customizados e skills para o Claude Code, construídos e validados em produção em projetos de produto digital.

---

## Estrutura

```
commands/        → Slash commands (/auditoria, etc.)
skills/          → Skills invocáveis pelo Claude (/quiz-funil, etc.)
memory/          → Regras de memória persistente (feedback consolidado)
```

---

## Skills

### `/quiz-funil`

Cria do zero um quiz de funil de vendas completo.

**O que cobre:**
- State machine de telas progressivas (hero → perguntas → email-gate → resultado → oferta)
- Tracking de funil completo com Supabase (sessão, cada resposta, duração real, clique de compra)
- Email-gate obrigatório antes dos resultados — garante 100% de captura de leads
- Dashboard de métricas com auth segura (Supabase Auth, não credenciais hardcoded)
- Webhook PHP com senha hasheada via bcrypt
- SQL versionado para todas as tabelas
- Checklist de 15 itens antes de entregar

**Como instalar:**

```bash
# Copiar para o diretório de skills do Claude Code
cp -r skills/quiz-funil ~/.claude/skills/
```

Depois invocar com `/quiz-funil` em qualquer conversa.

**Handoffs automáticos:**
A skill sinaliza quando ceder o trabalho para `/brainstorming` (estrutura do quiz), `/frontend-design` (identidade visual), `/copywriting` (textos) e `/humanizer` (revisão antes do deploy).

---

## Commands

### `/auditoria`

Auditoria final de qualidade antes de entregar qualquer projeto. Verifica os 8 pilares: código, segurança, observabilidade, estado, testes, performance web, SEO e banco de dados.

**Como instalar:**

```bash
cp commands/auditoria.md ~/.claude/commands/
```

Invocar com `/auditoria` em qualquer conversa.

---

## Memória

### `feedback_quiz_build_rules.md`

7 regras derivadas da análise pós-mortem de um quiz real em produção (fitgym.site). Cada regra tem **Why** (o que aconteceu quando a regra foi ignorada) e **How to apply** (como aplicar em novos projetos).

**Como instalar:**

```bash
# Copiar para o diretório de memória do projeto
cp memory/feedback_quiz_build_rules.md ~/.claude/projects/SEU-PROJETO/memory/
# Adicionar ao MEMORY.md do projeto
```

---

## Contexto

Estes recursos foram construídos ao longo de projetos reais de produto digital no mercado brasileiro — quizzes de fitness, sistemas de mentoria, funis de venda com Kiwify + Supabase + Hostinger. As regras e padrões refletem problemas encontrados e resolvidos em produção, não apenas teoria.
