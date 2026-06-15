# Auditoria Final de Qualidade

Você é um engenheiro sênior + especialista em segurança + DevSecOps. Execute uma auditoria completa do projeto atual verificando conformidade com o Padrão de Qualidade.

## Passo 1 — Identificar o contexto do projeto

Antes de auditar, leia o projeto e determine:
- **Linguagem e framework** (React, Vue, Next.js, Django, Laravel, Express...)
- **Tipo de projeto** (SPA, SSR, API, full-stack, landing page, mobile...)
- **Recursos presentes**: tem autenticação? uploads? pagamentos? banco de dados? painel admin?

Use esse contexto para:
- Aplicar cada critério com a terminologia correta do stack
- Marcar como **N/A** critérios que genuinamente não se aplicam ao projeto (ex: sem auth → 2.4 e 2.6 são N/A / sem uploads → 2.5 é N/A)
- Adaptar os exemplos de solução para a linguagem e framework identificados

## Passo 2 — Classificar cada item

- ✅ **CONFORME** — critério atendido
- ⚠️ **ATENÇÃO** — parcialmente atendido, melhoria recomendada
- ❌ **CRÍTICO** — critério violado, correção obrigatória antes do deploy
- **N/A** — não se aplica a este projeto

Para cada ⚠️ ou ❌: documentar onde está o problema, qual o risco e qual a solução no contexto do stack do projeto.

---

## Checklist de Auditoria

### PILAR 1 — Qualidade de Código

**1.1 DRY**
- [ ] Existem funções, componentes ou módulos duplicados com pouca variação?
- [ ] Há oportunidade de extrair para unidades reutilizáveis (componentes, hooks, composables, serviços)?

**1.2 Performance**
- [ ] Há recomputações ou re-renders desnecessários sem memoização?
- [ ] Listas grandes renderizadas sem virtualização ou paginação?
- [ ] Assets (imagens, scripts) não otimizados para produção?
- [ ] Dados carregados sem necessidade (over-fetching)?

**1.3 Tratamento de Erros**
- [ ] Operações que podem falhar sem `try/catch` ou equivalente?
- [ ] Falhas assíncronas silenciosas sem log ou feedback?
- [ ] Usuário sem feedback visual quando erros ocorrem?
- [ ] Mecanismo de isolamento de falhas implementado (Error Boundaries, fallbacks)?

**1.4 Separação de Responsabilidades**
- [ ] Lógica de negócio misturada com camada de apresentação?
- [ ] Acesso a dados direto em componentes de UI ou controllers?
- [ ] Componentes/módulos com mais de uma responsabilidade clara?

**1.5 Tipagem**
- [ ] Uso de `any`, `object` genérico ou ausência de tipos sem justificativa?
- [ ] Funções sem tipos de parâmetro e retorno definidos?
- [ ] Contratos de API sem schema ou tipo definido?

**1.6 Padrões do Framework**
- [ ] Violações das convenções do framework identificado?
- [ ] Dependências incorretas em reatividade/efeitos (useEffect, watch, computed)?
- [ ] Padrões do framework contornados sem necessidade?

**1.7 Dead Code**
- [ ] Componentes, funções ou módulos nunca utilizados?
- [ ] Imports não utilizados?
- [ ] Variáveis ou estado nunca lidos?
- [ ] Código comentado sem explicação de por que permanece?

---

### PILAR 2 — Segurança

**2.1 Secrets**
- [ ] `.gitignore` inclui `.env` e arquivos de configuração sensíveis?
- [ ] Alguma chave, senha ou token hardcoded no código fonte ou histórico git?
- [ ] Todas as configurações sensíveis via variáveis de ambiente?

**2.2 Exposição no Cliente**
- [ ] Endpoints internos ou chaves privadas expostos no bundle do frontend?
- [ ] Lógica sensível executada no cliente quando deveria estar no servidor?

**2.3 OWASP**
- [ ] Injection: todas as queries usam parametrização ou ORM — sem concatenação de input?
- [ ] XSS: conteúdo do usuário sanitizado antes de renderizar?
- [ ] CSRF: tokens implementados em mutações de dados?
- [ ] Input validation aplicado no servidor independentemente do frontend?
- [ ] Security headers configurados no servidor?

**2.4 Autenticação e Autorização** *(N/A se projeto sem auth)*
- [ ] Rotas sensíveis protegidas com token válido e não expirado?
- [ ] RBAC: papel do usuário verificado antes de operações restritas?
- [ ] Ownership check: operações validam que o usuário é dono do recurso?
- [ ] Tokens invalidados no logout e após inatividade?
- [ ] Endpoints admin com middleware de proteção específico?
- [ ] Princípio do menor privilégio aplicado?

**2.5 Upload de Arquivos** *(N/A se projeto sem uploads)*
- [ ] MIME type E extensão validados (os dois)?
- [ ] Limite de tamanho configurado?
- [ ] Nome do arquivo sanitizado contra path traversal?
- [ ] Conteúdo real verificado via magic bytes?
- [ ] Arquivos armazenados fora do diretório público?
- [ ] Executáveis bloqueados?

**2.6 Hash de Senhas** *(N/A se projeto sem gerenciamento de senhas)*
- [ ] Senhas em texto plano ou hash obsoleto (MD5, SHA1)?
- [ ] Salt único por usuário implementado?
- [ ] Argon2 ou Bcrypt com cost factor adequado?
- [ ] Modelo zero-knowledge garantido?

---

### PILAR 3 — Observabilidade

**3.1 Logging**
- [ ] Logs estruturados (JSON) nos pontos críticos do servidor?
- [ ] Alguma falha silenciosa sem registro?
- [ ] Contexto nos logs: identificador do usuário, ação, ID da requisição?
- [ ] Logger profissional no lugar de console.log em produção?
- [ ] Data masking: senhas, tokens e dados pessoais fora dos logs?
- [ ] Níveis de log usados corretamente (info, warn, error, fatal)?

---

### PILAR 4 — Arquitetura de Estado

**4.1 Estado** *(adaptar para o framework identificado)*
- [ ] Estado passado por muitos níveis desnecessariamente (prop drilling)?
- [ ] Estado duplicado em múltiplos módulos/componentes?
- [ ] Gerenciamento global usado para dados que deveriam ser locais?
- [ ] Estados relacionados que mudam juntos mantidos separados sem necessidade?

---

### PILAR 5 — Qualidade de Entrega

**5.1 Testes**
- [ ] Funções e componentes principais com testes unitários?
- [ ] Fluxos críticos com testes de integração?
- [ ] Casos de erro testados?
- [ ] Auth, pagamentos e dados do usuário cobertos?

**5.2 Production Readiness**
- [ ] Dependências sem CVEs críticas ou altas (`npm audit` / `pip audit` / equivalente)?
- [ ] Zero rotas de teste, mocks de dados ou funções de bypass no código?
- [ ] Zero credenciais em texto claro em qualquer arquivo?
- [ ] Variáveis de ambiente de produção documentadas?

---

## Passo 3 — Relatório Final

Gerar o seguinte relatório após auditar todos os critérios aplicáveis:

```
## Relatório de Auditoria — [Nome do Projeto]
Stack identificado: [linguagem + framework + tipo]
Recursos auditados: [auth / uploads / pagamentos / banco / admin — o que se aplica]
Data: [data atual]

### Score de Conformidade
| Pilar                    | ✅ Conformes | ⚠️ Atenção | ❌ Críticos | N/A |
|--------------------------|-------------|-----------|------------|-----|
| 1. Qualidade de Código   |             |           |            |     |
| 2. Segurança             |             |           |            |     |
| 3. Observabilidade       |             |           |            |     |
| 4. Arquitetura de Estado |             |           |            |     |
| 5. Qualidade de Entrega  |             |           |            |     |
| **TOTAL**                |             |           |            |     |

**Status geral**:
🟢 APROVADO — projeto pronto para deploy
🟡 APROVADO COM RESSALVAS — deploy possível, corrigir itens ⚠️ em breve
🔴 REPROVADO — resolver todos os ❌ antes do deploy

### Itens Críticos ❌ (obrigatório resolver antes do deploy)
[Numerado: arquivo/local → problema → solução no contexto do stack]

### Itens de Atenção ⚠️ (resolver em breve)
[Numerado: arquivo/local → problema → melhoria sugerida]

### Tarefas Geradas
[TodoWrite com todas as correções necessárias, priorizadas por severidade]
```
