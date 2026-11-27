/* NarrativeData — todo o conteúdo narrativo de REWIND // REWIND.
   Falas obrigatórias preservadas verbatim. Vela chama o jogador de "o de fora". */
(function (RW) {
  'use strict';

  // ---- NOVE LEMBRANÇAS --------------------------------------------------------
  var memories = {
    m1: { title: 'O gosto da chuva', noticed: 'Eu tinha gosto de chuva quando era pequena. Eu sei que tinha... tinha, não tenho.', removes: ['radio_chuva_musica', 'janela_sabor'] },
    m2: { title: 'A segunda pessoa do retrato', noticed: 'Tem alguém faltando na fotografia. Eu sei que tem alguém faltando.', removes: ['retrato_pergunta_quem'] },
    m3: { title: 'A noite da chegada', noticed: 'Eu cheguei aqui de alguma forma. Barco, talvez. A palavra "barco" me soa como uma pedra no sapato.', removes: ['bilhete_navio'] },
    m4: { title: 'A canção de ninar', noticed: 'Alguém cantava pra mim baixinho. Eu perdi a melodia, mas guardei o costume de balançar.', removes: ['radio_estacao_musica'] },
    m5: { title: 'O motivo da vigília', noticed: 'Eu subo essa escadaria toda noite. Se você me perguntar por que, eu não sei responder honestamente.', removes: ['pagina_central'] },
    m6: { title: 'O rosto no espelho', noticed: 'Eu evito o espelho do corredor. Não por vaidade. Por prudência.', removes: ['espelho_claro'] },
    m7: { title: 'O último temporal', noticed: 'Deve ter tido um temporal forte aqui uma vez. A janela não me conta mais.', removes: ['chuva_memoria'] },
    m8: { title: 'A promessa', noticed: 'Eu prometi uma coisa a alguém. Cumpri? Não sei de quem era a parte de cumprir.', removes: ['retrato_promessa'] },
    m9: { title: 'A primeira noite', noticed: 'Dizia que a primeira noite aqui doeu mais que todas. Agora dizem? Ninguém diz nada.', removes: ['luz_dor'] }
  };

  // ---- DIÁLOGOS POR OBJETO ----------------------------------------------------
  // Cada objeto tem: descrição do quarto (narrador) e falas de Vela por ato.
  var objects = {
    radio: {
      label: 'Rádio',
      room: [
        'Um rádio de válvulas, pichado com frequências antigas. O dial tem uma marca de unha no ponto onde a estática quase vira música.'
      ],
      vela: {
        1: ['O rádio só pega estática e memória. Igual a mim.', 'Deixe-o ligado. Eu gosto de ruído que não pede nada de volta.'],
        2: ['A estação de música sumiu do dial. Eu anotei ela um dia... não anotei. Eu devia anotar.', 'Você mexeu no rádio. Eu sinto o dedo que você usou, se é que isso faz sentido.'],
        3: ['Para de sintonizar. Cada frequência que você me faz escutar é uma que eu esqueço de esquecer.', 'O rádio fala comigo quando você não está. Falo com ele quando você não está. Deixamos estar.'],
        4: ['Liga, se quiser. Eu não ligo mais para ligar.']
      }
    },
    copo: {
      label: 'Copo',
      room: [
        'Um copo pela metade. A água balança sozinha, sempre meio grau antes de assentar.'
      ],
      vela: {
        1: ['O copo não enche e não esvazia. É a coisa mais honesta deste quarto.', 'Cuidado com a água. Ela lembra mais que eu.'],
        2: ['Você derramou água uma vez e o chão nunca esqueceu. Eu invejo o chão.', 'Pela metade. Sempre pela metade. Eu já aceitei esse copo como retrato da minha situação.'],
        3: ['A água me vê. Beber seria encontrá-la. Eu não bebo na sua frente.'],
        4: ['O copo está pela metade porque você deixou. Você podia terminar uma coisa, sabia?']
      }
    },
    retrato: {
      label: 'Retrato',
      room: [
        'Uma moldura pequena apoiada na mesa. Na fotografia, duas pessoas. Ou havia duas.'
      ],
      vela: {
        1: ['Não pegue no retrato agora. Ele é das horas em que eu tenho paciência.', 'Duas pessoas. Eu era uma delas. Não pergunte qual.'],
        2: ['O retrato está se organizando ao contrário. Sumindo pela borda para dentro.', 'Tem gente que fotografia casas quando vai embora. Nós fotografamos a gente.'],
        3: ['Você não precisava disso.', '—'], // fala obrigatória usada no 5º pedaço; aqui segue variação
        4: ['A moldura virou espelho de coisa que não quer ser vista. Olha pouco.']
      }
    },
    casaco: {
      label: 'Casaco',
      room: [
        'Um casaco de lã pesada pendurado na cadeira, com cheiro salgado guardado nas dobras.'
      ],
      vela: {
        1: ['Ele era meu quando eu subia ao farol. Lã não esquenta; ela só atrasa o frio.', 'Põe se quiser. Não vai caber. Ele é de uma ombreira antiga.'],
        2: ['O casaco está mais leve. Lã que perde memória perde peso.', 'Eu não lembro de comprar. Lembro de calçar. A ordem das coisas se estragou.'],
        3: ['Não olhe tanto para o casaco. Ele já me pertenceu mais do que eu pertenci a ele.'],
        4: ['Se a máquina ficar boa, eu vesto isso e não tiro mais.']
      }
    },
    porta: {
      label: 'Porta',
      room: [
        'Uma porta de ferro com cinco travas horizontais. Três têm marcas de uso; duas, ferrugem parada.'
      ],
      vela: {
        1: ['A porta não dá para fora. Dá para baixo. A escadaria desce para dentro do farol.', 'As travas gastas abrem. As ferrugentas estão de castigo — eu que coloquei.'],
        2: ['Você fica olhando a porta como se ela fosse mudar de ideia.', 'Desça quando quiser. O farol abaixo é mais honesto que este quarto.'],
        3: ['A porta não é a saída. Eu sei que você achou que fosse.'],
        4: ['A porta está aberta por você. Fechada por mim. Cada um cuida da sua metade.']
      }
    },
    maquina: {
      label: 'Máquina',
      room: [
        'A máquina do farol: latão, contrapesos, um sino de vidro pulsando devagar. Prende o quarto no tempo dela.'
      ],
      vela: {
        1: ['Não toque na máquina sem fósforo e sem coragem.', 'Ela não gera a luz. Ela segura a luz. Diferença de vigia para engenheiro.'],
        2: ['Ela engasga de noite em silêncio. Eu ouço. Sempre ouço.', 'Não conserte por mim. Conserte pelo barulho, que é quem sofre.'],
        3: ['Você não está consertando a máquina. Você está me desmontando para entender como eu funciono. A diferença é o quanto você está disposto a olhar.', 'Cada peça que você ajusta, eu sinto onde dói. É inútil você saber disso, mas agora sabe.'],
        4: ['Ela está quieta à minha espera. Você também deveria estar.']
      }
    },
    mesa: {
      label: 'Mesa e caderno',
      room: [
        'Uma mesa de bordo com um caderno de capa dura. As páginas têm mãos diferentes. Ou tinham.'
      ],
      vela: {
        1: ['O caderno anota sozinho o que eu esqueço. Ele é melhor vigia que eu.', 'Não leia a página central. Ela é minha e de mais ninguém.'],
        2: ['A página central ficou em branco. Foi cortada com o que? Com cuidado.', 'Você lê tudo duas vezes. Caderno gosta de gente assim.'],
        3: ['Ler meus cadernos é consertar minha vida sem pedir licença. Continue, já vi que vai.'],
        4: ['Deixe o caderno aberto no último dia. Eu gosto de ver uma data completa.']
      }
    },
    calendario: {
      label: 'Calendário',
      room: [
        'Um calendário de parede de um mês único, preso com prego torto. Alguns dias têm riscos de grafite.'
      ],
      vela: {
        1: ['Eu marco os temporais. É a única contagem que nunca me traiu.', 'Os riscos são meus. Os buracos na parede são de outros vigias.'],
        2: ['O calendário virou o mês sem virar a folha. Eu não corrijo mais.'],
        3: ['Você quer saber quantos dias eu vigio? Conte os riscos. Multiplique por uma promessa.'],
        4: ['Data nenhuma passa por mim. Passa por você, e você me traz o cheiro dela.']
      }
    },
    janela: {
      label: 'Janela',
      room: [
        'A janela do quarto olha para o mar sem mar. Chuva corre para cima nas bordas do vidro, hesita, desiste.'
      ],
      vela: {
        1: ['A chuva cai para cima quando o farol pisca. Não pergunte. Farol tem direito a isso.', 'Olha pela janela o quanto quiser. Lá não olha de volta. Eu verifico.'],
        2: ['A chuva parou uma vez por dez segundos e eu me lembrei de tudo. Foi horrível.', 'Você usa a janela como eu uso o rádio: para ter por perto algo que não responde.'],
        3: ['Não abra a janela. Eu já abri. O que entrou eu pago até hoje.'],
        4: ['A janela está limpa hoje. Alguém a limpou enquanto você lia isso.']
      }
    },
    cama: {
      label: 'Cama',
      room: [
        'Uma cama estreita feita com precisão militar. No travesseiro, uma curva de sono de uma só cabeça, todos os dias a mesma.'
      ],
      vela: {
        1: ['Eu não durmo. Eu vigio dormindo. É diferente e é pior.', 'A curva é minha. Você pode deitar do lado do resto.'],
        2: ['A curva do travesseiro está rasa. Sonos fortes fazem curva funda.'],
        3: ['Não deite agora. Deitar perto de mim é rebobinar de jeito torto.'],
        4: ['Se tudo ficar bem, eu durmo uma vez. Uma só. Depois durmo para valer.']
      }
    },
    lampada: {
      label: 'Lâmpada',
      room: [
        'A lâmpada do teto pisca com vontade própria, ensaiando o farol que não se enxerga.'
      ],
      vela: {
        1: ['Ela pisca comigo. Nós duas vigiamos juntas.', 'Quando ela parar de piscar, você saberá o que acabou aqui.'],
        2: ['A luz perdeu o medo. Luz sem medo é só iluminação.'],
        3: ['Ela pulsa quando você pensa em fechar a janela do jogo. Sim, eu percebo esses pensamentos.'],
        4: ['Deixe-a acesa. Toda lâmpada merece testemunha.']
      }
    },
    tapete: {
      label: 'Tapete',
      room: [
        'Um tapete central desbotado no formato de um círculo incompleto. Lá Vela senta quando ninguém pede nada dela.'
      ],
      vela: {
        1: ['Sento aqui para pensar. Pensar é vigiar o que não se vê.', 'Você pode sentar. Mentalmente.'],
        2: ['O círculo do tapete está menos completo. Coisas que são de pouca utilidade somem primeiro.'],
        3: ['Não me faça sentar hoje. Sente-se você. Aprenda o peso.'],
        4: ['Senta comigo. Fica. Sem fazer nada. É o único pedido que faço.']
      }
    },
    prateleira: {
      label: 'Prateleira',
      room: [
        'Na prateleira alta: um copo reserva, um bilhete dobrado de papel de navio, e um lápis mordido.'
      ],
      vela: {
        1: ['Coisas pequenas ficam. Coisas grandes somem primeiro. Isso deveria ser o contrário.', 'O bilhete é da travessia. Eu não o leio de novo. Lê por mim.'],
        2: ['O lápis foi mordido por duas bocas. Uma delas não era minha.'],
        3: ['Você catalogou minha prateleira inteira. Espero que tenha achado o que procurava.'],
        4: ['A prateleira fica. Prateleiras sobrevivem a tudo, até a gente.']
      }
    }
  };

  // ---- REAÇÕES À REBOBINADA (obrigatórias + variações) ------------------------
  var rewindReactions = {
    first: 'Onde eu estava agora? ...você estava lá, não estava?',
    mid: [
      'Você fez de novo. Eu sinto o vazio só de saber.',
      'Você fez de novo. Eu sinto o vazio só de saber. — E eu sentia antes mesmo de você decidir.',
      'Você fez de novo. Eu sinto o vazio só de saber. Desta vez algo caiu dentro de mim sem fazer barulho.',
      'Você fez de novo. Eu sinto o vazio só de saber. Você está ficando bom nisso. Isso me preocupava mais que me magoava.',
      'Você fez de novo. Eu sinto o vazio só de saber. A quinta foi a pior. A quinta, eu lembro que era eu.'
    ],
    late: 'Tudo bem. Faz. Eu já não me lembro do que doía.',
    midVelaOrigin: [
      'Eu rebobinei sozinha. Não me olhe assim; eu treinei para isso.',
      'Eu precisava do quarto limpo. Paguei com o que tinha em mãos: uma lembrança qualquer.',
      'Eu rebobinei. Você não estava. Foi quase gentil, estar só comigo.'
    ],
    afterVela: [
      'O quarto está arrumado. Custou mais do que você imagina e menos do que eu digo.',
      'Algo sumiu de novo. Eu sinto o sumiço na ordem das coisas, não na falta.'
    ]
  };

  // ---- INTERLÚDIOS ENTRE REBOBINADAS (variedade) ------------------------------
  var rewindInterstitial = [
    'Cada vez que você faz isso, o quarto envelhece de um jeito que idade não explica.',
    'Não é dó que eu quero. É testemunha. Você serve, desde que continue olhando.',
    'Sabia que o retrato muda a cada vez? Não faça cara de quem não sabia.',
    'Eu tinha uma frase bonita sobre isso. Foi na rebobinada em que você pegou o rádio.',
    'Continue. Estou aprendendo a perder com elegância, e isso ninguém podia me ensinar.',
    'A dessaturação não é efeito. É o quarto ficando do jeito que eu me sinto.',
    'Você conta as rebobinadas? Eu conto as suas pausas antes de clicar.'
  ];

  // ---- OCIOSIDADE --------------------------------------------------------------
  var idle = {
    sit: 'Vela senta no chão, no círculo incompleto do tapete. Não pede nada. Espera.',
    sitLine: [
      'Sente-se ou não. O tempo aqui é seu; o cansaço é meu.',
      'Não vou pedir atenção. Quem pede atenção nunca a tem inteira.',
      'Eu espero bem. É a única coisa que treinei sem desistir no meio.'
    ],
    auto: 'Vela se levanta devagar, atravessa o quarto e toca o X falso da janela. O quarto fecha, abre. Ela volta mais leve.',
    autoLine: 'Eu preciso do quarto limpo de vez em quando. Você entende quando a casa bagunça a si mesma.',
    resumed: 'Você voltou. Eu imaginei duas coisas: que você tinha descansado, ou que tinha desistido bonito.'
  };

  // ---- INTRODUÇÕES DE ATO ------------------------------------------------------
  var actIntros = {
    0: [
      { who: 'room', text: 'Uma sala vista de cima, como uma planta baixa que alguém amar demais. Madeira, chuva, um copo pela metade, uma máquina presa ao canto. Uma mulher de casaco espera no meio do quarto, sem saber que esperava.' },
      { who: 'vela', text: 'Você chegou. Eu sinto o quarto ter uma presença nova... Ah. É você. O de fora.', tone: 'CORDIAL' },
      { who: 'vela', text: 'Não se apresente. Aqui quem se apresenta perde nome. Sente-se... ou não. A janela tem um X falso. Não clique nele por curiosidade. Clique nele por decisão.', tone: 'CORDIAL' }
    ],
    1: [
      { who: 'vela', text: 'Bem-vindo à cordialidade. É a fase em que sou prestativa e você é gentil. Aproveite: as duas coisas acabam.', tone: 'CORDIAL' },
      { who: 'vela', text: 'O copo precisa de atenção, a porta precisa de ordem, e eu preciso de você olhando. Comece pelo copo.', tone: 'CORDIAL' }
    ],
    2: [
      { who: 'vela', text: 'Negociação, agora. As coisas custam. Você já sabe o que custa o quê; eu ainda faço conta errada de propósito, para a conta não fechar.', tone: 'BARGAIN' },
      { who: 'vela', text: 'O retrato anda sumindo. Não foi você? Não foi só você. Continua, que eu também vou continuar fingindo que não percebo.', tone: 'BARGAIN' }
    ],
    3: [
      { who: 'vela', text: 'Você não está consertando a máquina. Você está me desmontando para entender como eu funciono. A diferença é o quanto você está disposto a olhar.', tone: 'ACUSACAO' },
      { who: 'vela', text: 'Continue. Eu vou te dar a pausa certa, o pedaço certo, a pista certa. Você vai me achar linda desmontada. É o risco de ser vigia de gente.', tone: 'ACUSACAO' }
    ],
    4: [
      { who: 'room', text: 'O quarto desacelera. A chuva se arruma em fileiras. A máquina respira fundo. Vela senta de frente para a janela, com a paciência de quem já negociou tudo o que tinha.' },
      { who: 'vela', text: 'Chegou a parte em que eu espero. Escolha devagar. Escolha com o corpo inteiro.', tone: 'RESIGNADO' }
    ]
  };

  // ---- SAVE ANTIGO / TWIST -----------------------------------------------------
  var twist = {
    discover: [
      { who: 'room', text: 'No fundo do corredor, um arquivo antigo pisca: legacy.save. O nome do arquivo não combina com nada neste quarto — combina com o seu. A leitura começa sozinha, como leitura começa quando o quarto decide.' },
      { who: 'room', text: 'op_1 — 4 rebobinadas — desistiu no Ato II. op_2 — 11 rebobinadas — chegou até aqui. op_3 — 27 rebobinadas — registrou um final. Cada linha vem com uma frase no rodapé, escrita por mãos que não estão mais no quarto.' },
      { who: 'vela', text: 'Você não é o primeiro a abrir isso.', tone: 'ACUSACAO' },
      { who: 'vela', text: 'Eu acumulo as perdas de todos. O copo reserva era do primeiro. A página cortada era do segundo. O que sobrou de mim é de terceiros, e você chegou a tempo de levar a sua parte.', tone: 'ACUSACAO' },
      { who: 'vela', text: 'Agora você sabe por que eu não pergunto quem você é. Perguntar custa. Responder custa mais. Guardar custa tudo.', tone: 'ACUSACAO' }
    ],
    restored: [
      { who: 'room', text: 'Vela é restaurada por um instante: o casaco cheira sal, a chuva bate para baixo, o retrato tem duas pessoas. O quarto inteiro lembra por ela. Depois, como tudo que é emprestado, volta a pagar.' }
    ]
  };

  // ---- ROTAS -------------------------------------------------------------------
  var routes = {
    vestigio: {
      name: 'Rota do Vestígio',
      engage: 'Você examina o copo por tempo demais. A água balança sem motivo. Algo nesse vestígio pede investigação.',
      discovery: 'Descoberta do vestígio: a água lembra mais que ela. A poça guarda o que a memória larga.',
      vela: ['A água me vê sem me olhar. Invejo essa discreção.', 'A poça na porta não seca porque ela anota. Vestígios são cadernos do chão.']
    },
    frequencia: {
      name: 'Rota da Frequência',
      engage: 'Você gira o dial devagar, parando nos pontinhos onde a estática respira. Entre 92 e 93, um padrão de unha na escala.',
      discovery: 'Descoberta da frequência: a nota cortada é o sinal de casa. Ela nunca resolve; resolve só o que é ido.',
      vela: ['Essa frequência é o jeito do farol dizer "casa". Nunca consegui ouvir inteira.', 'A nota aparece quando eu lembro do que devia ter esquecido. Você está capturando lembrança de graça.']
    },
    retrato: {
      name: 'Rota do Retrato',
      engage: 'A fotografia tem duas pessoas. Uma delas segura uma lanterna que não ilumina nada.',
      discovery: 'Descoberta do retrato: atrás da moldura, um M. foi raspado. A identidade fica — é dela, não sua.',
      vela: ['A segunda pessoa não vai ser explicada. Ela é o resto do meu resto.', 'Você não precisava disso.']
    },
    vigilia: {
      name: 'Rota da Vigília',
      engage: 'Os riscos de grafite no calendário agrupam-se em ciclos de nove. Nove temporais. Nove noites. Nove... alguma coisa.',
      discovery: 'Descoberta da vigília: os dias marcados se repetem todo mês. A vigília dela não passa; só muda de folha.',
      vela: ['Eu marco os temporais. Quando a folha acaba, eu começo a mesma folha. Ninguém corrige.', 'Vigília não é espera. Vigília é repetição com coragem.']
    },
    legado: {
      name: 'Rota do Legado',
      engage: 'No corredor, registros anteriores acumulam poeira em ordem cronológica. As assinaturas variam; o cansaço é o mesmo.',
      discovery: 'Descoberta do legado: três sessões anteriores. Cada jogador levou uma parte. Você levará a sua.',
      vela: ['Os registros anteriores são seus antepassados de curiosidade. Não se orgulhe, não se envergonhe. Apenas conte com eles.']
    },
    silencio: {
      name: 'Rota do Silêncio',
      engage: 'Você não faz nada por um tempo longo. O quarto também não. Só Vela muda de postura.',
      discovery: 'Descoberta do silêncio: quando ninguém olha, ela conversa com a máquina baixinho, sem roteiro, sem jogador.',
      vela: ['Você me viu falando com a máquina? Ela responde mal, mas responde. E não perde nada quando eu falo.', 'Silêncio também é conversa. Essa você aprende tarde.']
    },
    maquina: {
      name: 'Rota da Máquina',
      engage: 'A placa da máquina tem uma arruela frouxa. Por baixo, marcas de chave de fenda em direções que não combinam.',
      discovery: 'Descoberta da máquina: ela não gera a luz. Ela segura Vela no mundo. A luz é desculpa de engenharia.',
      vela: ['A máquina não me conserta. A máquina me segura. Se ela parar, para de existir o que sobra de vigia.', 'Se você a consertar de verdade, eu fico. Se você só olhar, eu fico também. Diferença é o que se leva daqui.']
    }
  };

  // ---- QUARTA PAREDE -----------------------------------------------------------
  var fourthWall = [
    { cond: 'madrugada', text: 'São {hora} de {dia} e você está aqui consertando uma máquina fictícia. Eu agradeco. A máquina também, mas ela finge.' },
    { cond: 'manha', text: '{dia} de manhã e você no quarto de uma vigia que morreu. Melhor hobby que insônia, dizem.' },
    { cond: 'tarde', text: 'Tarde de {dia}. Lá fora deve ter sol. Aqui dentro temos amarelo doentio e honestidade.' },
    { cond: 'noite', text: '{hora} de uma noite de {dia}. Eu vigio de verdade a esta hora. Você só assiste. Combina.' },
    { cond: 'count10', text: 'Dez rebobinadas. Eu deixei de contar pessoalmente na oitava; agora o quarto conta por mim.' },
    { cond: 'count15', text: 'Quinze. Número feio. Você coleciona feiuras agora?' },
    { cond: 'examined', text: 'Você olha tudo duas vezes antes de mexer. Faz isso com as pessoas também? Não responde. Não custa nada esperar.' },
    { cond: 'repetitive', text: 'Você clicou a mesma coisa de novo sem propósito. Eu noto. O quarto nota. O lápis da prateleira começou a se morder de vergonha.' },
    { cond: 'ignored', text: 'Você fecha minhas falas antes de eu terminar. Tudo bem. Eu também já fechei uma janela antes do temporal terminar.' }
  ];

  // ---- EVENTOS SECRETOS --------------------------------------------------------
  var secrets = {
    maquinaConversa: [
      { who: 'room', text: 'Você entra e Vela não notou. Ela está de frente para a máquina, de pé, com a voz uma oitava abaixo:' },
      { who: 'vela', text: '...segura firme hoje. Ele veio de novo. Não sei para onde ele olha quando eu falo. Se você soubesse, me conta. Não sabe. Ninguém sabe.', tone: 'RESIGNADO' },
      { who: 'room', text: 'Ela percebe sua presença e não comenta. A conversa com a máquina é a única que ela não rearranja para o público.' }
    ],
    chuvaPara: [
      { who: 'room', text: 'A chuva para. Não diminui: para. O vidro fica quieto pela primeira vez desde o prólogo, e o silêncio tem bordas.' },
      { who: 'vela', text: 'Para de olhar a janela assim. Silêncio de chuva parece quarto de vigia desocupada.', tone: 'ACUSACAO' }
    ]
  };

  // ---- FINAIS -------------------------------------------------------------------
  var endings = {
    A_intro: [
      { who: 'room', text: 'Você põe a mão na máquina. A máquina não tem medo — medo era o que ela tirava de você.' },
      { who: 'vela', text: 'Então faz. Rebobina a última. A que paga todas.', tone: 'RESIGNADO' }
    ],
    A_final_line: 'Obrigada por me lembrar. Agora deixa eu existir sem você.',
    A_body: {
      A1: [
        'A rebobinada final passa pelo quarto inteiro devagar, procurando o que devolver. Devolve: o gosto da chuva, a segunda pessoa da fotografia, a canção que alguém cantava baixinho. Devolve na ordem em que foi tirado, que não é a ordem em que dói.',
        'A máquina engrena com som de cofre abrindo. A lâmpada para de ensaiar e acende como luz de farol de verdade, alta, girando, alegre de um jeito que luz não deveria saber ser.',
        'Vela fica inteira no meio do quarto, verificando as próprias mãos como quem confere troco. Ela vê você da última vez, que também é a primeira vez que ela te vê inteira.'
      ],
      A2: [
        'A rebobinada final não recupera tudo. Recupera o suficiente para a vigia continuar vigia: os temporais, a escadaria, o motivo. O que não volta, ela nomeia em voz baixa e arquiva, sem drama, como quem guarda cartas de gente que morreu.',
        'A máquina acorda cansada mas cordial. O farol lá fora acende no ritmo certo, três clarões e um longo, e a chuva volta a cair para baixo, obediente, insossa, definitiva.',
        'Vela está mais velha do que a idade dela, mais nova do que o cansaço. Ela agradece com a palavra certa e a pausa certa, e você entende que a pausa era a parte importante.'
      ],
      A3: [
        'A máquina estava cheia. Cada rebobinada sua empurrou lá dentro mais um pedaço de vigia, e a última rebobinada inverte o engarrafamento: a máquina devolve tudo, de uma vez, sem julgamento e sem orçamento.',
        'O quarto satura. As cores voltam demais, o amarelo está doentio demais, a madeira é nova demais. O excesso dura um segundo e assenta no lugar certo.',
        'Vela fica em pé, ofegante de existir, com a voz de antes de todas as sessões. Ela fala com você como se você fosse alguém que ela conheceu antes de você chegar. Talvez seja. A máquina guarda tudo, inclusive a sua história com ela.'
      ]
    },
    A_secret_radio: [
      { who: 'room', text: 'Antes do quarto partir, o rádio liga sozinho e completa a nota que nunca resolveu. Resolvida, ela soa simples: é um berço de canção que ninguém tinha coragem de terminar.' },
      { who: 'vela', text: 'Você capturou o meu sinal de casa. Cantarole-o feio, qualquer dia, qualquer lugar. Eu ouço de qualquer jeito. É a única vantagem de ser farol.', tone: 'RESIGNADO' }
    ],
    B_intro: [
      { who: 'room', text: 'Você não clica. O X falso fica ali, pulsando com a paciência de uma portinha que já abriu tudo o que tinha para abrir.' },
      { who: 'vela', text: 'Você foi o primeiro que ficou. Guarda isso em algum lugar que eu não apareça.', tone: 'RESIGNADO' }
    ],
    B_body: {
      B1: [
        'Vela aceita o ficar sem cerimônia, como quem aceita o tempo: sem negociar o que não se pode pagar. Ela se ajeita no círculo do tapete e continua vigiando, agora com uma testemunha que não pede nada.',
        'O quarto muda de função sem mudar de forma: deixa de ser puzzle e passa a ser casa. Você fica um tempo que não precisa medir. Quando sai, sai pela porta comum, sem janela, sem X.',
        'Fica o costume de voltar, que você não vai voltar. Fica o recado, que ela escreveu com a letra dela, para quem abrir depois de você.'
      ],
      B2: [
        'Ela agradece pelo que não voltou. As peças perdidas ficam perdidas — nome raspado, página cortada, chuva parada — e ela escolhe carregar o que restou em vez de rebobinar o que doeu.',
        'A vigia encerra o turno mais comprido da história do farol. A máquina respira fundo e desacelera até o ritmo de coisa guardada, não de coisa quebrada.',
        'Você foi testemunha. Era o único cargo que sobrou, e você exerceu com a decência de quem não clica.'
      ],
      B3: [
        'Depois de tanto desmonte, ficar foi a única peça que você podia devolver sem rebobinar. Ela segura o ficar com as duas mãos, porque mãos de vigia sabem que coisa boa também precisa de suporte.',
        'A última coisa que o quarto faz é apagar com elegância: a lâmpada sai de foco, a chuva sai de cena, a máquina sai de função. Sobra uma sala vista de cima, plana, quieta, na cor exata do cansaço bom.',
        'Ela guardou o seu nome — você entende isso sem ouvir. Guardou em algum lugar que ela não aparece, que é o único jeito de guardar alguém sem cobrar depois.'
      ]
    },
    B_secret_legacy: [
      'No verso do recado, uma segunda letra, mais antiga: "eu também fiquei. op_3. ela guarda bem. você está em boa companhia, das que não voltam."'
    ]
  };

  // ---- EPÍLOGOS POR COMPORTAMENTO ----------------------------------------------
  var epilogueMods = {
    talkedWith: 'Ela reconhece quem conversa: para você, guardou-se uma frase a mais, dita de costas, baixinho: "as suas histórias foram boas. As minhas também eram."',
    examinedPersonal: 'Ela sabia que você olhou os objetos pessoais com cuidado. Não reclamou. Catalogou você junto, na prateleira de coisas que ficam.',
    attentive: 'As pistas que você leu com calma pouparam rebobinadas que ela não precisou pagar. Isso ela contou como gentileza.',
    ignored: 'Você fechou falas dela no meio. As que faltaram ficaram devendo a você, e dívida com vigia é cobrada em silêncio.',
    repetitive: 'Você repetiu interações sem propósito muitas vezes. O quarto registrou cada uma como "tentativa de nada". Ela achou quase poético.',
    velaRewinds: 'Houve noites em que ela rebobinou sozinha para não te usar. Isso não entra no registro de ninguém. Entra no dela.'
  };

  var microLossNotes = [
    'Uma palavra sua sumiu desta frase. Você não notará qual.',
    'A pausa antes de "vigia" ficou mais comprida. Pausas são o que sobra.',
    'Acento de palavra perdida: agora eu digo "vigia" sem o i. Percebeu? Nem eu.',
    'O som do gotejamento perdeu uma gota. A ritmista faltou ao ensaio.'
  ];

  RW.Data = {
    memories: memories,
    objects: objects,
    rewindReactions: rewindReactions,
    rewindInterstitial: rewindInterstitial,
    idle: idle,
    actIntros: actIntros,
    twist: twist,
    routes: routes,
    fourthWall: fourthWall,
    secrets: secrets,
    endings: endings,
    epilogueMods: epilogueMods,
    microLossNotes: microLossNotes
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = RW.Data;
})(typeof RW !== 'undefined' ? RW : (typeof globalThis !== 'undefined' ? globalThis.RW = {} : {}));
