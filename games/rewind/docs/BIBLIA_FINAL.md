# BÍBLIA FINAL — REWIND // REWIND (Expansão 3.0)

## 1. Cânone

Vela é vigia de farol e sabe que morreu. Permanece ligada a uma máquina que não gera
luz: **a máquina a segura no mundo**. O jogador é "o de fora" — uma presença que abre
o quarto como quem abre uma janela. O gesto central é a **rebobinada pelo X falso** da
barra de título. Cada rebobinada restaura a linha temporal e cobra, permanentemente,
uma lembrança, um objeto e uma fala de Vela.

- Paleta: azul-acinzentado, cinza frio, madeira envelhecida, ferrugem, amarelo doentio.
- Câmera: top-down 90°, ortográfica, fixa. Nada de perspectiva frontal ou isométrica.
- Duração alvo: 1h30–2h. A duração real depende de quão devagar o jogador lê.

## 2. Estrutura

**Prólogo — A janela:** o quarto, o rádio, o copo pela metade, a máquina e a nota
cortada antes do primeiro input. Vela chama o jogador de "o de fora".

**Ato I — Cordialidade:** Vela prestativa; o jogador aprende a interagir; o copo e a
porta ensinam que água anota (vestígio) e que a porta desce para dentro do farol.

**Ato II — Negociação:** perdas afetam o cotidiano; o retrato perde a segunda pessoa
pedaço a pedaço; o rádio abre a rota da frequência; Vela começa a desconfiar.

**Revelação intermediária:** `legacy.save` aparece no corredor. "Você não é o primeiro
a abrir isso." O título da janela ganha `// 2`; o X falso passa a pulsar no hover.

**Ato III — Acusação:** a fala obrigatória ("Você não está consertando a máquina...")
redefine o jogo: o jogador entende o que estava fazendo com ela.

**Ato IV — Escolha:** o quarto desacelera; a máquina espera; o jogador escolhe entre
a rebobinada final (Final A) e parar (Final B).

## 3. As nove lembranças (ordem de perda)

m1 O gosto da chuva · m2 A segunda pessoa do retrato · m3 A noite da chegada ·
m4 A canção de ninar · m5 O motivo da vigília · m6 O rosto no espelho ·
m7 O último temporal · m8 A promessa · m9 A primeira noite.
Após m9, novas rebobinadas produzem micro-perdas (palavras, pausas, sons, detalhes).

## 4. Rotas (7)

1. **Vestígio** — copo, poça, reflexos: a água lembra mais que ela.
2. **Frequência** — rádio, nota cortada: a nota é o sinal de casa; captura por janela temporal.
3. **Retrato** — identidade, fotografia, ausência: o verso guarda "V. & M." raspado.
4. **Vigília** — calendário, rotina: nove temporais que se repetem todo mês.
5. **Legado** — save antigo, três sessões anteriores (op_1, op_2, op_3).
6. **Silêncio** — inatividade: ela senta; depois, rebobina sozinha; quando ninguém
   olha, conversa com a máquina.
7. **Máquina** — manutenção e luz: a máquina não conserta; segura.

Rotas têm conteúdo exclusivo (descoberta + falas + puzzle ou evento) e re-convergem
no Ato IV.

## 5. Áreas

Sala principal (centro), Escadaria/Corredor da memória (registros + cacos),
Câmara de manutenção (engrenagens), Câmara da luz (lente + lampiões) e o **Exterior
impossível** (vista pela janela da câmara da luz — cena narrativa, não explorável).

## 6. Puzzles (7)

1. **Copo** — derramar/estados; consequência: Vela chora sem entender por quê (via falas do vestígio).
2. **Porta** — travas gastas reveladas pela poça (ordem determinística [0,2,4]).
3. **Rádio** — dial 87.5–108; nota cortada em 92.7; captura = rebobinar com o dial na janela (2 rebobinadas completam).
4. **Retrato** — 5 pedaços da segunda pessoa por rebobinada própria; 5 acumulados → verso da moldura + chave.
5. **Calendário** — marcar os 9 dias de temporal; abre a gaveta (caderno + fósforos).
6. **Fósforos/Luz** — característica fl(3): três clarões curtos, pausa, um longo (toque/segurar ≥600ms).
7. **Engrenagens** — dois pares, relação de dobro, o menor recebe o movimento ([12,24] e [18,36]).
8. **Reflexos** — três cacos, lei do espelho (2a−90°); alvos 0°/180°/270° → ângulos 45°/135°/180°.

Todos: introdução, pistas graduais, feedback, solução determinística, consequência,
estado persistente, recuperação após erro.

## 7. Rebobinada

Validação → registro de origem (own/vela) → efeito de fechamento → flash preto →
desktop fictício ~200ms → retorno → restauração temporal → perda permanente →
retrato/cenário/dessaturação (+6% por rebobinada, piso 35%) → áudio reverso real
(últimos ~2,6s gravados do mix, reproduzidos com o canal invertido) → persistência.

Falas obrigatórias:
- 1ª: "Onde eu estava agora? ...você estava lá, não estava?"
- 5ª–9ª: "Você fez de novo. Eu sinto o vazio só de saber."
- 10ª+: "Tudo bem. Faz. Eu já não me lembro do que doía."

Ocioso: 90s → Vela senta; +90s → Vela rebobina sozinha (origem `vela`, não conta na
assinatura do jogador; suspensa com página oculta, diálogos e transições críticas).

## 8. Save antigo e twist

`legacy.save` (determinístico, sem dados pessoais) é criado silenciosamente na primeira
execução. Twist: ≥7 rebobinadas próprias + 3 puzzles centrais (porta, rádio capturado,
retrato virado) + corredor visitado → revelação dos registros, título `// 2`, pulsação
do X. O save antigo não pode ser sobrescrito pelo save atual.

## 9. Finais

**A — Consertar a máquina** (rebobinada final): variações por faixa de rebobinadas
próprias — A1 (7–9) A última lembrança; A2 (10–14) A memória cansada; A3 (15+) A
máquina cheia. Linha final: "Obrigada por me lembrar. Agora deixa eu existir sem você."
Cria `ultima_rebobinada.save`; estado terminal persistente (desktop fictício 8s + nota
completa na próxima abertura).

**B — Parar de jogar:** B1 (7–9) O tempo que restou; B2 (10–14) O que não voltou;
B3 (15+) A última coisa. Linha final: "Você foi o primeiro que ficou. Guarda isso em
algum lugar que eu não apareça." Cria `recado.txt` (Blob + download com data local).

**Segredos (2, por construção):** rádio capturado → cena extra no Final A (nota
completa, "sinal de casa"); legado completo (3 dossiês + rota) → mensagem de op_3 no
verso do recado do Final B. Os dois finais principais nunca são substituídos.

**Modificadores de epílogo:** conversas com Vela, atenção às pistas, objetos pessoais
examinados, falas ignoradas, repetições sem propósito, rebobinadas da própria Vela.
Nenhum contador de empatia é exibido.

## 10. Quarta parede

Hora local, dia da semana, contagens e comportamentos observados viram falas
contextuais. Nada pessoal é inventado; nada é enviado a servidores.

## 11. O que permanece sem resposta (deliberado)

A identidade de M. · por que a segunda pessoa segura uma lanterna que não ilumina ·
o que entrou pela janela aberta · o nome inteiro de Vela. O desconforto de não saber
faz parte do desenho.
