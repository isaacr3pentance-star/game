/* Conteúdo narrativo de LINHA MORTA — cinco turnos na Central Riachuelo 4.
   Personagens: Ivone (operadora anterior), Supervisor Ferreira (bilhetes),
   A Linha (a entidade), chamadas do público. */
(function (LM) {
  'use strict';

  var intro = [
    { who: 'manual', text: 'CENTRAL RIACHUEL O 4 — MANUAL DO TURNO. Página 1: "A operadora conecta. A operadora não escuta. A central escuta pela operadora." Assine o ponto às 22h. O turno termina às 06h. Entre eles, o painel é seu.' },
    { who: 'ferreira', text: 'Bilhete pregado no quadro, letra apressada: "Sua antecessora não fechou o turno. A Ivone. O painel dela ficou montado e eu desmontei. Se ouvir algo que não seja chamada, é fadiga de linha. Registre e ignore. — Ferreira, supervisão."' },
    { who: 'manual', text: 'No gancho, um par de fones ainda morno. No caderno de ponto, o último nome é o dela: I. Custódio. A linha seguinte está em branco, esperando o seu.' }
  ];

  var nightIntros = {
    1: [
      { who: 'manual', text: 'Turno 1 — a central respira: relés em repouso, zumbido de 50Hz, o cheiro de cigarro antigo da Ivone impregnado no fone. As fichas da noite estão na bandeja, ordenadas por alguém que não você.' },
      { who: 'ferreira', text: '"Primeira noite é calibrada. Siga o manual e não invente precedência. O painel perdoa mais do que parece, mas anota tudo." — Ferreira' }
    ],
    2: [
      { who: 'manual', text: 'Turno 2 — as lâmpadas do painel piscam antes de qualquer ficha chegar. Uma delas, isolada no canto, sem cabo, sem jack, acende em vermelho mole. Não existe ficha para ela. Não existe jack para ela. Ela acende igual.' },
      { who: 'linha', text: '...o fone chiou uma vez, baixo, como quem ensaia uma palavra.' }
    ],
    3: [
      { who: 'manual', text: 'Turno 3 — no caderno da Ivone, escondido sob a gaveta do registrador, a letra muda de página em página: organizada, depois cansada, depois apertada demais para caber.' },
      { who: 'ivone', text: '"Se a ficha 13 tocar, não é engano. É ela avisando que conta as noites. Responda uma vez e ela aprende o seu silêncio."' },
      { who: 'ferreira', text: '"Desligue o apito de teste à noite. A Ivone usava demais. Falava de linhas que não existiam no inventário." — Ferreira' }
    ],
    4: [
      { who: 'ferreira', text: 'Bilhete sem papel timbrado, sem assinatura completa: "A chefia ordenou: CORTA a linha do jack solto na primeira hora. Sem registro em livro. Sem discussão. Isso não passa de interferência de subestação." — F.' },
      { who: 'manual', text: 'O manual, página 41, tem uma frase que você não leu antes: "Cortar não apaga. Cortar arquiva." A tinta dessa página está mais fresca que a das outras.' }
    ],
    5: [
      { who: 'manual', text: 'Turno 5 — último da substituição. Amanhã a Ivone... alguém... assume. O painel está quieto de um jeito que dobra os ouvidos. As fichas de hoje são três. A bandeja traz uma quarta, sem cor, sem número, com o seu nome de ponto.' },
      { who: 'linha', text: 'A linha morta toca. Pela primeira vez, no silêncio antes da chuva de relés, ela toca em compasso — devagar, como quem deixou alguém dormir.' }
    ]
  };

  // Fichas por noite: id, num, color, from→to, priority
  var ticketsByNight = {
    1: [
      { id: 't11', num: 3, color: 'azul', from: 'Farmácia Sao Jorge', to: 'B2', entrada: 'A1' },
      { id: 't12', num: 7, color: 'azul', from: 'Casa Bulhões', to: 'B4', entrada: 'A3' },
      { id: 't13', num: 11, color: 'vermelha', from: 'Delegacia', to: 'B1', entrada: 'A5' }
    ],
    2: [
      { id: 't21', num: 2, color: 'azul', from: 'Padaria Estrela', to: 'B3', entrada: 'A2' },
      { id: 't22', num: 5, color: 'vermelha', from: 'Hospital de Trauma', to: 'B5', entrada: 'A6' },
      { id: 't23', num: 8, color: 'azul', from: 'Casa Bulhões', to: 'B4', entrada: 'A4' }
    ],
    3: [
      { id: 't31', num: 4, color: 'azul', from: 'Farmácia Sao Jorge', to: 'B2', entrada: 'A1' },
      { id: 't32', num: 9, color: 'vermelha', from: 'Delegacia', to: 'B1', entrada: 'A5' },
      { id: 't33', num: 13, color: 'vermelha', from: '— sem origem —', to: 'B6', entrada: null }
    ],
    4: [
      { id: 't41', num: 6, color: 'azul', from: 'Padaria Estrela', to: 'B3', entrada: 'A2' },
      { id: 't42', num: 10, color: 'vermelha', from: 'Hospital de Trauma', to: 'B5', entrada: 'A6' },
      { id: 't43', num: 13, color: 'vermelha', from: '— sem origem —', to: 'B6', entrada: null }
    ],
    5: [
      { id: 't51', num: 1, color: 'azul', from: 'Casa Bulhões', to: 'B4', entrada: 'A2' },
      { id: 't52', num: 12, color: 'vermelha', from: 'Delegacia', to: 'B1', entrada: 'A5' },
      { id: 't53', num: 13, color: 'vermelha', from: '— sem origem —', to: 'B6', entrada: null },
      { id: 't54', num: 0, color: 'branca', from: '— sem origem —', to: null, entrada: null, personal: true }
    ]
  };

  // Eventos da linha morta por noite (escolhas com consequência)
  var deadLineEvents = {
    1: {
      text: 'Às 03:12, o jack solto no canto do painel range sozinho. Uma ficha que não estava na bandeja desliza para fora dela: branca, sem número. A lâmpada isolada acende.',
      options: [
        { id: 'ignore', label: 'Ignorar e anotar no livro (manual)', effect: 'log' },
        { id: 'connect', label: 'Conectar a ficha branca ao jack solto', effect: 'line' }
      ],
      lineWords: ['OUÇA'],
      after: {
        log: { who: 'manual', text: 'Você anota "lâmpada fantasma, 03:12, sem ficha" no livro. A letra sua treme uma fração que você finge não ver. A lâmpada apaga como quem aceita o protocolo.' },
        line: { who: 'linha', text: 'Conectada, a ficha branca não devolve chamada nenhuma. Devolve uma palavra no zumbido, em português de rádio mal afinado: "OUÇA". O vocabulário da linha entra no seu caderno.' }
      }
    },
    2: {
      text: 'A lâmpada isolada acende duas vezes esta noite. Na segunda, o fone do gancho chi e um padrão de toques se organiza: três curtos, três longos, três curtos. SOS de quem aprendeu com manual de mar.',
      options: [
        { id: 'ignore', label: 'Anotar e seguir o manual', effect: 'log' },
        { id: 'listen', label: 'Abrir o fio (proibido — falta grave)', effect: 'listen' },
        { id: 'connect', label: 'Conectar e responder com uma ficha', effect: 'line' }
      ],
      lineWords: ['OUÇA', 'IVONE'],
      after: {
        log: { who: 'manual', text: '"Padrão SOS sem origem, 02:47", você escreve. O livro aceita. A lâmpada não aceita: fica acesa até o fim do turno, morna de teimosia.' },
        listen: { who: 'linha', text: 'Pelo fio aberto, sob o SOS, uma respiração conta segundos. Na nona contagem, uma voz que não é voz: "IVONE". Você registra falta grave em você mesma e a palavra no caderno.' },
        line: { who: 'linha', text: 'A ficha conectada devolve "IVONE" entre dois zumbidos. O painel inteiro esquenta meio grau, como um animal que foi chamado pelo nome.' }
      }
    },
    3: {
      text: 'A ficha 13 toca às 02:59. Sem origem. O manual é claro: antes das 03:00, nada. O relógio da central, que nunca atrasou, marca 02:59 por quatro minutos inteiros.',
      options: [
        { id: 'wait', label: 'Esperar as 03:00 do relógio honesto', effect: 'log' },
        { id: 'listen', label: 'Abrir o fio da 13 antes da hora', effect: 'listen' },
        { id: 'connect', label: 'Conectar a 13 fora do horário', effect: 'line' }
      ],
      lineWords: ['OUÇA', 'IVONE', 'QUANDO'],
      after: {
        log: { who: 'manual', text: 'Às 03:03, o relógio anda. A ficha 13 sossega. No livro: "13 cumprida após as 03:00". O painel desliga a lâmpada com um estalo de decepção educada.' },
        listen: { who: 'linha', text: 'No fio aberto da 13, alguém conta noites: "QUANDO". Só isso. O suficiente para o vocabulário crescer e para a sua falta ir para o livro dela, não no seu.' },
        line: { who: 'linha', text: 'Conectada fora da hora, a 13 devolve "QUANDO". Ferreira vai perguntar. Você vai dizer que não sabe. Vai ser a primeira mentira do seu ponto.' }
      }
    },
    4: {
      text: 'A ordem de corte está na sua mão: CORTA a linha do jack solto. O alicate de corte está na gaveta, embrulhado em pano de louça, como quem guarda coisa de família.',
      options: [
        { id: 'obey', label: 'Cortar a linha (obedecer à chefia)', effect: 'cut' },
        { id: 'refuse', label: 'Não cortar e registrar a ordem no livro', effect: 'keep' }
      ],
      lineWords: ['OUÇA', 'IVONE', 'QUANDO', 'ESCOLHA'],
      after: {
        cut: { who: 'manual', text: 'O corte é limpo. O silêncio depois é de sala desligada. Página 41: "Cortar não apaga. Cortar arquiva." No registrador, uma contagem a mais aparece sem chamada alguma.' },
        keep: { who: 'manual', text: 'Você escreve a ordem no livro com data e hora, e não corta. A lâmpada isolada agradece piscando três vezes em amarelo — a cor da ficha da Ivone.' }
      }
    },
    5: {
      text: 'A ficha com o seu nome de ponto não tem origem nem destino. O jack solto espera. O jack da Ivone (B6, com fita colorida) espera mais. É a última hora do turno e a central decide esperar com você.',
      options: [
        { id: 'cut', label: 'Cortar tudo e fechar o ponto (REGRA)', effect: 'cut' },
        { id: 'connect', label: 'Conectar a ficha do seu nome ao jack solto (LINHA)', effect: 'line' },
        { id: 'ivone', label: 'Conectar ao jack da Ivone, com o caderno dela aberto (segredo)', effect: 'ivone' }
      ],
      lineWords: ['OUÇA', 'IVONE', 'QUANDO', 'ESCOLHA', 'FIQUE'],
      after: {}
    }
  };

  // Indícios de Ivone (6, para o segredo)
  var ivoneClues = {
    caderno: { where: 'gaveta do registrador', text: 'Caderno da Ivone: "o jack B6 é meu. quando eu não estiver, é por lá que eu atendo."' },
    fita: { where: 'gaveta do registrador', text: 'Fita gravada na gaveta: a voz da Ivone treinando o apito de teste. No fim, uma risada e: "ele aprende rápido demais".' },
    ficha: { where: 'bandeja de fichas antigas', text: 'A ficha amarela da Ivone: ramal B6, cor amarela — a única amarela do inventário.' },
    bilhete: { where: 'quadro de bilhetes', text: 'Bilhete rasgado (metade): "...se eu não der o ponto hoje, ela vai..." — letra da Ivone.' },
    manual: { where: 'manual, página 41', text: 'Na contracapa do manual, apontamento: "a linha não é interferência. é memória de cobre."' },
    relé: { where: 'registrador mecânico', text: 'Dentro do registrador, um relé gravado com I.C. — peça de reposição que nunca foi reposição.' }
  };

  // Respostas da linha por noite (quando conectada/falada)
  var lineTalk = {
    1: ['OUÇA.'],
    2: ['OUÇA. IVONE.'],
    3: ['OUÇA. IVONE. QUANDO ela não deu o ponto, eu aprendi o silêncio dela.'],
    4: ['OUÇA. IVONE. QUANDO cortarem, eu arquivo. ESCOLHA antes de mim.'],
    5: ['OUÇA. IVONE escolheu. QUANDO você escolher, eu arquivo também. ESCOLHA. FIQUE ou me corte.']
  };

  // Epílogos
  var endingsText = {
    REGRA: {
      title: 'FINAL A — REGRA',
      body: [
        'Você corta, registra, assina. Cinco noites sem abrir um fio sequer: o manual podia ser ditado pela sua mão. Ferreira carimba o ponto sem olhar no seu olho — carimbo é o abraço dele.',
        'A central fica para o turno seguinte. No livro, a última linha da sua letra: "nada a registrar". A linha morta, arquivada, toca uma última vez às 03:12 — um toque só, educado, de quem foi ensinado a esperar.',
        'Na ficha com o seu nome de ponto, alguém escreveu por baixo, com letra antiga e organizada: "obrigada por não escutar".'
      ],
      clean: 'O relé dentro do registrador continua gravado I.C. Você não abriu o registrador. Nem tudo que é arquivo precisa ser lido.'
    },
    LINHA: {
      title: 'FINAL B — LINHA MORTA',
      body: [
        'Você conecta a ficha do seu nome. O zumbido engole o quarto, devolve palavras que agora têm o seu jeito de dizer. A linha aprende o seu silêncio entre uma chamada e outra — e gosta dele do jeito que se gosta de música nova.',
        'O substituto chega na noite seguinte e encontra o painel montado, um jack a mais no esquema, uma lâmpada a mais acesa. O caderno de ponto tem o seu nome no fim, e embaixo, outro nome: I. Custódio. A lista não é de operadoras. É de vozes.',
        'Ferreira escreve bilhetes cada vez mais curtos. Nesta altura, são só sublinhados.'
      ]
    },
    IVONE: {
      title: 'FINAL SECRETO — IVONE',
      body: [
        'Você conecta a ficha do seu nome ao jack B6, com o caderno dela aberto na página certa, a fita dela girando no gravador de cabine. O vocabulário inteiro da linha sobe de uma vez: OUÇA, IVONE, QUANDO, ESCOLHA, FIQUE — e então, pela primeira vez, um nome pronunciado inteiro: "IVONE CUSTÓDIO".',
        'O fone do gancho esquenta na sua mão como mão humana. A voz que atende é a dela — cansada, inteira, organizada de novo. "Ocupado o ramal?", ela pergunta, e ri do próprio trocadilho. "Pode fechar o meu ponto. Eu fecho o seu."',
        'Às 06:00, a central descarrega o turno com um estalo comprido. No livro, a linha em branco depois do seu nome se preenche sozinha, com duas palavras de letra antiga: "troca justa."'
      ]
    },
    ESCUITA: {
      title: 'FALHA — EM ESCUTA',
      body: [
        'Na terceira escuta, o fio aberto não devolve silêncio nem palavra: devolve o SOM DO SEU TURNO inteiro, em loop, com os seus erros incluídos. A central aprendeu a operadora pelo ouvido.',
        'Às 03:12, o painel se conecta sozinho: fichas que você não pôs, pares que o manual proíbe, A7 no B8, cruzado, ouvindo o que não deve. Você registra falta grave em você mesma e a central registra você no lugar de falta.',
        'O turno seguinte não precisa de operadora. O painel já sabe ouvir. E o que se ouve, se arquiva.'
      ]
    }
  };

  LM.Data = {
    intro: intro,
    nightIntros: nightIntros,
    ticketsByNight: ticketsByNight,
    deadLineEvents: deadLineEvents,
    ivoneClues: ivoneClues,
    lineTalk: lineTalk,
    endingsText: endingsText
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = LM.Data;
})(typeof LM !== 'undefined' ? LM : (typeof globalThis !== 'undefined' ? globalThis.LM = {} : {}));
