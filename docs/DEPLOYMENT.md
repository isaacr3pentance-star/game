# DEPLOYMENT — Publicação no GitHub Pages

## Requisitos já atendidos pelo repositório

- `index.html` na raiz (portal com os dois jogos).
- `.nojekyll` na raiz (evita processamento Jekyll).
- Todos os caminhos **relativos** (`games/...`, `launcher/...`) — o site funciona
  tanto em `https://<usuario>.github.io/game/` quanto em domínio próprio.
- Nenhum backend, nenhuma API externa, nenhum segredo, nenhum build.
- Sem módulos ES (sem problemas de CORS em `file://` ou subdiretório).

## Como publicar (via interface do GitHub)

1. Abra **Settings → Pages** no repositório `game`.
2. Em **Source**, escolha *Deploy from a branch*.
3. Em **Branch**, selecione a branch publicada (recomendação abaixo) e a pasta
   `/ (root)`. Salve.
4. Aguarde o build; a URL principal abrirá o portal de seleção.

## Qual branch publicar

- **Recomendado:** publicar a `main` **após** o merge revisado do Pull Request da
  `feat/rewind-expansion-3` (sem merge sem revisão, conforme as regras do projeto).
- Alternativa temporária: publicar diretamente a `feat/rewind-expansion-3` para
  revisão visual antes do merge — a URL ficará no formato de preview.

## Verificação pós-deploy (checklist)

- [ ] A URL principal abre o portal com as duas capas.
- [ ] "JOGAR REWIND" abre `games/rewind/index.html` (caminho relativo funciona).
- [ ] "JOGAR LINHA MORTA" abre `games/second-horror/index.html`.
- [ ] "voltar ao portal" dentro do LINHA MORTA retorna sem perder o save.
- [ ] Imagens (capas/splashes) carregam — estão embutidas como data URIs.
- [ ] Recarregar a página do jogo mantém o progresso (IndexedDB por origem).
- [ ] Console sem erros 404 (nenhum caminho absoluto `/` no código).

## Limitações honestas

- O estado terminal do REWIND (Final A) é narrativo e depende dos dados do navegador;
  navegação privada ou limpeza de dados o desfaz — isso é assumido no design e
  documentado no jogo.
- Safari/antigos WebViews podem ter políticas de áudio mais rígidas; o jogo funciona,
  mas o áudio só começa após a primeira interação (política padrão dos navegadores).
- **Binários PNG-fonte** (`games/*/assets/*.png`): o conector GitHub desta operação
  publica conteúdo textual; binários não são enviados por esse canal. O **runtime não
  depende deles** — todos os assets de execução (capas, retrato, splashes) estão
  embutidos como SVG vetorial nos respectivos `embedded.js`/`covers.js`, e a arte
  PNG/JPEG original permanece nos arquivos de distribuição (ZIPs) para uso offline.
  Publicar os PNGs no repositório, se desejado, requer upload pela interface web
  ou Git LFS — opcional, sem impacto funcional.
- **CI:** `.github/workflows/ci.yml` executa em cada push/PR: rotina
  `tests/verify_repo.sh` (sintaxe, suítes de lógica, arquivos, caminhos, XML dos
  assets, isolamento, placeholders) + `tests/smoke_browser.js` (Playwright sem
  erros de console nos 3 componentes).
