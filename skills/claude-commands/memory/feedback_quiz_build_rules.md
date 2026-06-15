---
name: feedback-quiz-build-rules
description: "Regras obrigatórias para construção de quizzes com funil de venda — derivadas da análise do projeto Rafaela/fitgym.site. Cobre email-gate, auth do dashboard, SQL, senhas e tracking."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: ebc65b7f-9877-49dd-90b5-4ce0bfbf07e1
---

# Regras de Quiz com Funil de Venda

Derivadas da análise pós-mortem do projeto Rafaela (fitgym.site). Aplicar em QUALQUER quiz com funil de produto digital.

---

## Regra 1 — Email-gate é OBRIGATÓRIO antes dos resultados

Sempre capturar o e-mail do usuário ANTES de mostrar o resultado final. Nunca depois.

**Why:** No projeto Rafaela, o quiz não tinha email-gate — o usuário ia direto para o Kiwify. Todos os leads que não compraram ficaram anônimos. A tabela `quiz_sessions` tem `name` mas não tem `email`. Perda total de leads não-compradores.

**How to apply:**
- Criar step intermediário (`showStep('email')`) entre a última pergunta e a tela de resultados
- O campo de e-mail é obrigatório para avançar
- Insert no banco é fire-and-forget (não bloqueia a UI)
- A tabela de sessões DEVE ter coluna `email` desde o início
- Padrão validado: projeto André Victor → `questionario_finalistas.html` com `showStep('email')`

---

## Regra 2 — Dashboard de métricas NUNCA com auth client-side

Credenciais do painel de métricas devem estar no servidor, nunca em HTML/JS.

**Why:** No projeto Rafaela, `metricas.html` tinha `{ email: 'gymfitness@gmail.com', pass: 'Gym@Fitness1991' }` hardcoded no JS. Qualquer pessoa com acesso ao arquivo (ou que abrisse o DevTools) bypassava o login. A "proteção" era `sessionStorage.setItem('fp_auth','1')` — trivialmente contornável pelo console.

**How to apply:**
- Usar Supabase Auth (`supabase.auth.signInWithPassword`) em vez de comparação de string local
- Ou criar `auth.php` no servidor que valida credenciais e retorna token
- Nunca comparar senha em JavaScript no cliente
- Se o dashboard precisar ser um arquivo estático simples, proteger via `.htpasswd` no servidor Apache

---

## Regra 3 — Senhas de alunos NUNCA em texto puro

Toda senha gerada automaticamente ou definida pelo aluno deve ser armazenada com hash.

**Why:** No projeto Rafaela, `webhook.php` salvava `password` direto no Supabase sem qualquer hashing. Se o banco fosse comprometido, todas as senhas dos alunos ficariam expostas.

**How to apply:**
- Em PHP: `password_hash($password, PASSWORD_BCRYPT)` ao inserir
- Verificação: `password_verify($input, $hash)` ao autenticar
- A função `verify_program_access` no Supabase deve comparar contra o hash, não texto puro
- Senhas auto-geradas (como no webhook.php da Rafaela) ainda devem ser hasheadas antes de salvar

---

## Regra 4 — SQL da tabela de tracking é obrigatório no projeto

A tabela `quiz_sessions` (ou equivalente) deve ter arquivo `.sql` de criação no repositório.

**Why:** No projeto Rafaela, a tabela `quiz_sessions` existia no Supabase mas não tinha migration documentada. Só existia o SQL do `program_access`. Impossível recriar o schema sem acesso ao painel.

**How to apply:**
- Criar `supabase/migrations/create_quiz_sessions.sql` com todas as colunas rastreadas
- Colunas mínimas: `session_id`, `gender`, `name`, `email`, `age`, `goals[]`, `bmi`, `activity`, `body_type`, `satisfaction`, `difficulties[]`, `preference`, `max_screen`, `clicked_buy`, `duration_seconds`, `created_at`, `updated_at`
- Documentar GRANTs necessários para `anon` e `authenticated`

---

## Regra 5 — Pedir credenciais MySQL ANTES de criar qualquer SQL para Hostinger

Antes de criar arquivo `.sql` ou `api.php` com MySQL, pedir obrigatoriamente:

```
Antes de criar o SQL e o arquivo de configuração, preciso de 3 informações da sua Hostinger:
- Nome do banco de dados (DB_NAME)
- Usuário do banco (DB_USER)
- Senha do banco (DB_PASS)
```

**Why:** Valores genéricos como `localhost`, `root`, `db_name` nunca funcionam direto na Hostinger. O usuário vai ter que editar o arquivo de qualquer forma, criando risco de erro. Perguntar antes evita retrabalho e arquivos com placeholders esquecidos.

**How to apply:** Disparar essa pergunta no início, ANTES de qualquer código, sempre que o projeto tiver banco MySQL na Hostinger. Para projetos Supabase, pedir `SUPABASE_URL` e `SUPABASE_KEY` antes de criar os arquivos de configuração.

---

## Regra 6 — Service role key não vai para o cliente

A `service_role` key do Supabase é equivalente a acesso de administrador ao banco. Só pode existir em código server-side.

**Why:** No projeto Rafaela, o `webhook.php` usava a service_role key — correto por ser PHP no servidor. Mas se o arquivo fosse exposto (via misconfiguration ou erro Apache), o banco inteiro ficaria comprometido.

**How to apply:**
- Arquivo HTML/JS do cliente → usar apenas `sb_publishable_*` (anon key)
- PHP/Node no servidor → pode usar service_role, mas proteger o arquivo com `.htaccess`
- Nunca commitar service_role key em repositório público
- Separar em constante `define('SUPABASE_KEY', '...')` no topo do PHP

---

## Regra 7 — Padrões que FUNCIONAM e devem ser replicados

Estes padrões do projeto Rafaela foram validados em produção e devem ser copiados:

**Tracking fire-and-forget:**
```js
async function _sbUpd(data) {
  if (!_sb || !_sid) return;
  try {
    await _sb.from('quiz_sessions')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('session_id', _sid);
  } catch(e) {}  // falha silenciosa — não bloqueia o usuário
}
```

**keepalive no beforeunload (salva duração real):**
```js
window.addEventListener('beforeunload', () => {
  const secs = Math.round((Date.now() - _startTime) / 1000);
  if (!_sid) return;
  fetch(`${SB_URL}/rest/v1/quiz_sessions?session_id=eq.${_sid}`, {
    method: 'PATCH', keepalive: true,
    headers: { 'Content-Type': 'application/json', 'apikey': SB_KEY, 'Authorization': `Bearer ${SB_KEY}` },
    body: JSON.stringify({ duration_seconds: secs })
  });
});
```

**Funil por tela no dashboard:**
- Calcular `allData.filter(s => s.max_screen >= i).length` para cada screen
- Mostrar % relativa ao total de sessões iniciadas
- Colorir verde (≥70%), amarelo (40–69%), vermelho (<40%)

---

## Checklist obrigatório antes de entregar qualquer quiz

- [ ] Email-gate implementado ANTES dos resultados?
- [ ] Tabela de sessões tem coluna `email`?
- [ ] Dashboard usa auth server-side (não comparação JS)?
- [ ] Senhas armazenadas com hash (bcrypt/argon2)?
- [ ] SQL de criação de TODAS as tabelas no repositório?
- [ ] GRANTs do Supabase documentados no SQL?
- [ ] Service role key apenas em código server-side?
- [ ] Credenciais MySQL pedidas antes de criar o código (se Hostinger)?
- [ ] `beforeunload` com `keepalive` para salvar duração?
