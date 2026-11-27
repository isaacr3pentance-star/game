# game — Biblioteca de Jogos de Terror

Portal estático com dois jogos independentes e uma página inicial de seleção.

## Os jogos

| | REWIND // REWIND | LINHA MORTA |
|---|---|---|
| Gênero | Terror psicológico, mistério, meta-narrativa | Terror analógico, central telefônica |
| Câmera | 2D top-down, câmera fixa | Painel frontal fixo (SVG) |
| Duração | 1h30–2h | 35–55 min |
| Rotas/Puzzles | 7 rotas · 8 puzzles | 5 turnos · roteamento + 3 puzzles |
| Finais | 2 principais · 6 variações · 2 segredos | 4 (REGRA, LINHA MORTA, IVONE, EM ESCUTA) |
| Saves | `rewind_db` / `rewind_*` | `second_horror_db` / `second_horror_*` |

## Como rodar

- **Abertura direta:** abra `index.html` no navegador (funciona por `file://`).
- **Servidor local:** `python3 -m http.server 8000` na raiz e visite `http://localhost:8000/`.
- **GitHub Pages:** ver `docs/DEPLOYMENT.md`.

## Estrutura

```text
game/
├── index.html            # portal de seleção dos dois jogos
├── launcher/             # estilo, script e capas do portal
├── games/
│   ├── rewind/           # REWIND // REWIND (jogo principal)
│   └── second-horror/    # LINHA MORTA (jogo original independente)
├── tests/               # rotina de qualidade + smoke test de navegador
├── .github/workflows/    # CI (sintaxe, lógica, integração, smoke)
└── docs/                 # arquitetura, deployment, log, auditoria 11/10, relatórios
```

Cada jogo tem entrada, estilos, módulos, assets, estado, persistência, documentação e
testes próprios. Nenhum código de um depende do outro; os saves são bancos IndexedDB
separados e o portal apenas identifica os jogos e oferece acesso.

## Publicação

A raiz contém `.nojekyll`. Todos os caminhos são relativos (compatível com
subdiretório do Pages). Sem backend, sem build, sem dependências externas.

## Desenvolvimento

Branch de desenvolvimento: `feat/rewind-expansion-3` (não faça merge na principal sem
revisar o Pull Request). Documentação completa em `docs/`.

## Qualidade e testes (operação 11/10)

```bash
bash tests/verify_repo.sh      # sintaxe + suítes + arquivos + caminhos + assets + isolamento
node games/rewind/tests/logic-tests.js          # 35 testes
node games/second-horror/tests/logic-tests.js   # 26 testes
node tests/smoke_browser.js     # smoke Playwright nos 3 componentes (npm i playwright)
```

CI: `.github/workflows/ci.yml` executa a rotina completa a cada push/PR.
Estado da operação 11/10: `docs/AUDIT_11_10.md` (auditoria + correções),
`docs/REVIEW_CYCLES_11_10.md` (dez ciclos), `docs/QUALITY_REPORT.md`,
`docs/TEST_RESULTS.md`, `docs/CHANGELOG_11_10.md`, `docs/ROADMAP_11_10.md`.

Arte embutida: a edição de referência usa **SVG vetorial** (capas, retrato e
splashes) — nítida, leve e sem hotlink; a arte JPEG/PNG original permanece em
`assets/` e nos arquivos de distribuição.
