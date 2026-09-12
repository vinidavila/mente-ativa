/* exercicios.js — Banco de exercícios resistidos e de equilíbrio para idosos.
   Campos de mídia (preencher depois, sem tocar no resto):
     midia: { video: 'URL ou caminho .mp4', foto: 'URL ou caminho', credito: 'fonte/licença', videoInicio: segundos }
   Fontes (siglas): OMS20 = OMS 2020; NSCA19 = Fragala 2019; ICFSR = Izquierdo 2021/2024; COCH19 = Sherrington 2019;
     MS21 = Guia MS 2021; OEP = Otago; VF = Vivifrail; NIA = NIA/Go4Life; NHS = NHS Strength & Balance; LIFE = LiFE.
*/
const NIVEIS = {
  A: { nome: 'A — Limitação grave', criterio: 'SPPB 0–3 · VM <0,5 m/s ou incapaz de levantar da cadeira sem ajuda', cor: '#b3261e' },
  B: { nome: 'B — Limitação moderada (frágil)', criterio: 'SPPB 4–6 · VM 0,5–0,8 m/s', cor: '#c8781e' },
  C: { nome: 'C — Limitação leve (pré-frágil)', criterio: 'SPPB 7–9 · VM 0,8–1,0 m/s', cor: '#8a7a1a' },
  D: { nome: 'D — Robusto', criterio: 'SPPB 10–12 · VM >1,0 m/s', cor: '#0e7c78' }
};
// Estratificação seguindo Vivifrail (Izquierdo 2017/2021); parâmetros de dose seguindo NSCA 2019 e ICFSR 2021/2024.
const DOSE = {
  forca: {
    A: '1 série × 8–10 rep · sem carga ou elástico leve · PSE 2–3/10 · 2 dias/sem · sempre sentado ou com apoio firme',
    B: '1–2 séries × 10–12 rep · carga leve (PSE 3–4/10, ≈30–50% 1RM) · 2–3 dias/sem · descanso 1–2 min',
    C: '2 séries × 10–15 rep → 2–3 × 8–12 · carga moderada (PSE 5–6/10, ≈51–69% 1RM) · 2–3 dias/sem · descanso 1–2 min',
    D: '2–3 séries × 8–12 rep · carga moderada-alta (PSE 6–8/10, 70–85% 1RM) · 2–3 dias/sem · nunca até a falha · descanso 2 min'
  },
  potencia: {
    A: 'Não indicado neste nível (fazer a versão de força, com apoio)',
    B: 'Sentar-levantar "sobe em 1 s, desce em 3 s" · 1 série × 6–8 · com apoio das mãos se necessário',
    C: '1–2 séries × 6–8 rep · carga leve-moderada (40–60% 1RM) · subir o mais rápido possível com controle, descer em 2–3 s',
    D: '2–3 séries × 6–8 rep · 40–60% 1RM (NSCA) ou 60–80% (ICFSR 2024) · fase concêntrica rápida, excêntrica controlada · sem falha'
  },
  equilibrio: {
    A: 'Sentado ou com as duas mãos no apoio · 10–15 s por posição · 2–3 vezes · todos os dias que puder',
    B: 'Com uma mão no apoio · 15–20 s · 2–3 vezes · ≥3 dias/sem',
    C: 'Sem apoio (mão próxima ao apoio) · 20–30 s · 3 vezes · ≥3 dias/sem · progredir para olhos fechados só com supervisão',
    D: 'Sem apoio · 30 s · 3 vezes · ≥3 dias/sem · progredir: superfície instável, dupla tarefa, olhos fechados (supervisão)'
  }
};
const PARAR_GERAL = [
  'Dor ou aperto no peito, braço, pescoço ou mandíbula',
  'Falta de ar desproporcional (não consegue falar uma frase curta)',
  'Tontura, sensação de desmaio ou visão escurecida',
  'Palpitações ou batimentos irregulares',
  'Dor articular aguda ou que piora durante o movimento',
  'Náusea, suor frio ou palidez'
];
const NAO_FAZER = [
  'Febre ou infecção aguda',
  'Pressão arterial descontrolada em repouso (≥180/110)',
  'Dor no peito recente sem avaliação médica',
  'Fratura ou cirurgia recente sem liberação',
  'Queda no dia anterior com dor ou tontura persistente'
];
const PROGRESSAO = {
  regra: 'Regra de progressão dupla (NIA/Go4Life): comece com um peso que consiga levantar no máximo 8 vezes. Mantenha até fazer 2 séries de 10–15 repetições com facilidade. Então aumente o peso de modo que só consiga fazer 8 repetições de novo e recomece o ciclo.',
  frageis: 'Níveis A e B — progredir primeiro a TÉCNICA, depois o número de SÉRIES (1 → 2), depois a FREQUÊNCIA (2 → 3 dias) e só por último a CARGA. Nunca até a falha. (NSCA 2019; Vivifrail)',
  robustos: 'Níveis C e D — quando 2×12–15 ficarem fáceis, aumentar a carga e reduzir para 8–12 repetições (mais carga, menos repetições). Retestar 1RM/carga a cada ~12–24 semanas. (NSCA 2019; ICFSR 2024)',
  potencia: 'Potência (subir rápido, descer devagar) para níveis C e D e, com apoio, no B: a potência cai mais rápido que a força com a idade e prediz melhor a função (levantar da cadeira, subir escada). Evidência de benefício modesto sobre força tradicional (Balachandran 2022, baixa certeza).',
  equilibrio: 'Equilíbrio — progredir por ordem: pés afastados → juntos → semi-tandem → tandem → um pé; com duas mãos → uma mão → sem apoio → olhos fechados (supervisão) → superfície macia → dupla tarefa (contar, conversar). (Otago; Vivifrail; ICFSR)'
};
const METAS = { aerobico: [150, 300], forcaDias: 2, equilibrioDias: 3 }; // OMS 2020

const q = (p, d) => [p, d];
const EX = [];
const add = (o) => EX.push(Object.assign({ midia: { video: '', foto: '', credito: '', videoInicio: 0 } }, o));

/* ============================ MEMBROS SUPERIORES ============================ */
add({ id: 'S01', regiao: 'MMSS', tipo: 'forca', nome: 'Flexão de braços na parede', musculos: 'Peitoral, deltoide anterior, tríceps', equipamento: 'Parede',
  fontes: ['NIA', 'NHS', 'VF'], vista: 'lateral', props: ['parede'], guias: ['coluna', 'olhar-frente'],
  base: { sL: 72, sR: 72, eL: 6, eR: 6, lean: 8 },
  quadros: [q({}, 0), q({ eL: 62, eR: 62, lean: 18, sL: 30, sR: 30 }, 2), q({ eL: 62, eR: 62, lean: 18, sL: 30, sR: 30 }, 0.6)], retornoDur: 1.5,
  exec: ['De frente para a parede, um pouco mais que um braço de distância, pés na largura dos ombros.', 'Palmas na parede, na altura e largura dos ombros.', 'Dobre os cotovelos e aproxime o peito da parede devagar (2–3 s), calcanhares no chão.', 'Segure 1 s e empurre de volta até esticar os braços.'],
  postura: ['Corpo em linha reta da cabeça ao calcanhar (prancha).', 'Olhar à frente, pescoço alinhado.'],
  erros: ['Curvar as costas ou deixar o quadril cair.', 'Levantar os calcanhares.', 'Prender a respiração.'],
  cuidados: ['Mãos secas e parede lisa sem quadros.', 'Se houver dor no punho, apoiar nos punhos fechados ou reduzir a inclinação.'],
  erro: { rotulo: 'costas curvadas, quadril caído', base: { tor: 22, head: -15, hL: 12, hR: 12 } } });

add({ id: 'S02', regiao: 'MMSS', tipo: 'forca', nome: 'Remada sentada com elástico', musculos: 'Dorsal, romboides, bíceps', equipamento: 'Cadeira + faixa elástica',
  fontes: ['NIA', 'NSCA19'], vista: 'lateral', props: ['cadeira', 'elastico_pe'], guias: ['ombros-baixos', 'coluna'],
  base: { hL: 90, hR: 90, kL: 90, kR: 90, sL: 62, sR: 62, eL: 8, eR: 8, tor: 3 },
  quadros: [q({}, 0), q({ sL: 10, sR: 10, eL: 105, eR: 105, tor: 0 }, 1.2), q({ sL: 10, sR: 10, eL: 105, eR: 105 }, 0.5)], retornoDur: 2,
  exec: ['Sentado na borda da cadeira, coluna reta, faixa presa nos pés (sola do pé).', 'Braços estendidos à frente segurando a faixa.', 'Puxe os cotovelos para trás, junto ao corpo, aproximando as omoplatas.', 'Segure 1 s e volte devagar (2–3 s).'],
  postura: ['Peito aberto, ombros para baixo e para trás.', 'Cotovelos rentes ao tronco.'],
  erros: ['Encolher os ombros até as orelhas.', 'Inclinar o tronco para trás para puxar.', 'Soltar a faixa rápido demais.'],
  cuidados: ['Verifique se a faixa está bem presa nos dois pés antes de puxar.', 'Nunca solte a faixa esticada.'],
  erro: { rotulo: 'tronco jogado para trás', base: { tor: -22 } } });

add({ id: 'S03', regiao: 'MMSS', tipo: 'forca', nome: 'Rosca de bíceps', musculos: 'Bíceps braquial, braquial', equipamento: 'Halteres, garrafas de água ou faixa',
  fontes: ['NIA', 'NHS', 'VF'], vista: 'frontal', props: ['halteres'], guias: ['cotovelo-colado'],
  base: { bL: 4, bR: 4, eL: 8, eR: 8 },
  quadros: [q({}, 0), q({ eL: 135, eR: 135 }, 1.2), q({ eL: 135, eR: 135 }, 0.5)], retornoDur: 2.5,
  exec: ['Em pé (ou sentado), pés na largura do quadril, pesos ao lado do corpo, palmas para a frente.', 'Dobre os cotovelos levando os pesos aos ombros (1–2 s).', 'Segure 1 s e desça devagar (2–3 s) até quase esticar.'],
  postura: ['Cotovelos colados ao tronco o tempo todo.', 'Punhos retos, abdome firme.'],
  erros: ['Balançar o tronco para ajudar.', 'Cotovelos abrindo para a frente.', 'Descer o peso "solto".'],
  cuidados: ['Comece com 0,5–1 kg; a descida controlada é a parte que mais fortalece.', 'Se houver dor no cotovelo, reduzir carga e amplitude.'],
  erro: { rotulo: 'tronco balançando, cotovelos à frente', base: { bL: 30, bR: 30, tor: -8 } } });

add({ id: 'S04', regiao: 'MMSS', tipo: 'forca', nome: 'Elevação lateral de ombros', musculos: 'Deltoide médio, supraespinal', equipamento: 'Halteres leves ou sem carga',
  fontes: ['NIA', 'NHS'], vista: 'frontal', props: ['halteres'], guias: ['ombros-baixos'],
  base: { bL: 8, bR: 8, eL: 12, eR: 12 },
  quadros: [q({}, 0), q({ bL: 85, bR: 85 }, 1.5), q({ bL: 85, bR: 85 }, 0.5)], retornoDur: 2.2,
  exec: ['Em pé ou sentado, braços ao lado do corpo, cotovelos levemente dobrados.', 'Eleve os braços para os lados até a altura dos ombros (não acima).', 'Segure 1 s e desça devagar.'],
  postura: ['Polegares levemente para cima; ombros longe das orelhas.', 'Tronco imóvel.'],
  erros: ['Passar da altura dos ombros (irrita o manguito).', 'Encolher os ombros.', 'Impulso com o tronco.'],
  cuidados: ['Se houver dor no ombro ao subir, limitar a 60° ou fazer sem carga.', 'Em síndrome do impacto: preferir elevação no plano da escápula (30° à frente).'],
  erro: { rotulo: 'acima da linha dos ombros, ombros encolhidos', quadros: [q({}, 0), q({ bL: 125, bR: 125 }, 1.5)] } });

add({ id: 'S05', regiao: 'MMSS', tipo: 'forca', nome: 'Elevação frontal de braços', musculos: 'Deltoide anterior', equipamento: 'Halteres leves',
  fontes: ['NIA'], vista: 'lateral', props: ['halteres'], guias: ['coluna'],
  base: { sL: 10, sR: 10, eL: 6, eR: 6 },
  quadros: [q({}, 0), q({ sL: 90, sR: 90 }, 1.5), q({ sL: 90, sR: 90 }, 0.5)], retornoDur: 2.2,
  exec: ['Em pé ou sentado, pesos à frente das coxas, palmas para baixo.', 'Eleve os braços à frente até a altura dos ombros, cotovelos quase retos.', 'Segure 1 s e desça em 2–3 s.'],
  postura: ['Coluna neutra, abdome firme.', 'Movimento apenas no ombro.'],
  erros: ['Inclinar o tronco para trás.', 'Subir com impulso.'],
  cuidados: ['Carga menor que na rosca (ombro tolera menos).'],
  erro: { rotulo: 'tronco inclinado para trás', base: { tor: -18 } } });

add({ id: 'S06', regiao: 'MMSS', tipo: 'forca', nome: 'Desenvolvimento de ombros sentado', musculos: 'Deltoide, tríceps, trapézio', equipamento: 'Cadeira + halteres',
  fontes: ['NIA', 'VF', 'NHS'], vista: 'frontal', props: ['cadeira', 'halteres'], guias: ['ombros-baixos'],
  base: { bL: 82, bR: 82, eL: 100, eR: 100, hL: 90, hR: 90, kL: 90, kR: 90 },
  quadros: [q({}, 0), q({ bL: 165, bR: 165, eL: 6, eR: 6 }, 1.4), q({ bL: 165, bR: 165, eL: 6, eR: 6 }, 0.5)], retornoDur: 2.2,
  exec: ['Sentado com as costas apoiadas, pesos na altura dos ombros, palmas para a frente.', 'Empurre os pesos para cima até quase esticar os cotovelos.', 'Desça devagar até a altura das orelhas.'],
  postura: ['Costas apoiadas no encosto; pés no chão.', 'Não travar os cotovelos no alto.'],
  erros: ['Arquear a lombar para empurrar.', 'Descer os cotovelos abaixo dos ombros com carga alta.'],
  cuidados: ['Em hipertensão: expirar ao empurrar, nunca prender o ar.', 'Dor no ombro acima de 90°: reduzir amplitude.'],
  erro: { rotulo: 'lombar arqueada, cotovelos travados', base: { tor: -14 } } });

add({ id: 'S07', regiao: 'MMSS', tipo: 'forca', nome: 'Extensão de tríceps acima da cabeça', musculos: 'Tríceps', equipamento: 'Um halter (duas mãos)',
  fontes: ['NIA'], vista: 'lateral', props: ['halteres'], guias: ['coluna'],
  base: { sL: 168, sR: 168, eL: 110, eR: 110 },
  quadros: [q({}, 0), q({ eL: 8, eR: 8 }, 1.4), q({ eL: 8, eR: 8 }, 0.5)], retornoDur: 2.2,
  exec: ['Sentado ou em pé, segure um peso com as duas mãos acima da cabeça.', 'Dobre os cotovelos levando o peso atrás da cabeça (2–3 s).', 'Estenda os cotovelos de volta ao alto, mantendo os braços junto às orelhas.'],
  postura: ['Cotovelos apontando para a frente, não para os lados.', 'Abdome firme, sem arquear a lombar.'],
  erros: ['Abrir os cotovelos.', 'Bater o peso na nuca.'],
  cuidados: ['Começar sem carga ou com 0,5 kg; evitar se houver dor cervical.'],
  erro: { rotulo: 'lombar arqueada', base: { tor: -16 } } });

add({ id: 'S08', regiao: 'MMSS', tipo: 'forca', nome: 'Tríceps na cadeira (apoio)', musculos: 'Tríceps, peitoral inferior', equipamento: 'Cadeira firme com braços ou assento',
  fontes: ['NIA'], vista: 'lateral', props: ['cadeira'], guias: [],
  base: { hL: 76, hR: 76, kL: 76, kR: 76, sL: -30, sR: -30, eL: 6, eR: 6, tor: 6 },
  quadros: [q({}, 0), q({ eL: 50, eR: 50, hL: 87, hR: 87, kL: 87, kR: 87, tor: 10 }, 1.5), q({ eL: 50, eR: 50, hL: 87, hR: 87, kL: 87, kR: 87, tor: 10 }, 0.4)], retornoDur: 1.4,
  exec: ['Sentado na borda da cadeira, mãos no assento (ou nos braços) ao lado do quadril, pés à frente.', 'Empurre com os braços tirando o quadril do assento (2–5 cm).', 'Dobre os cotovelos devagar voltando ao assento.'],
  postura: ['Cotovelos apontando para trás.', 'Ombros para baixo.'],
  erros: ['Descer demais (ombro à frente dos cotovelos).', 'Usar as pernas para empurrar.'],
  cuidados: ['Cadeira encostada na parede.', 'Não fazer em dor de ombro ou punho.', 'Nível A/B: só a versão de "empurrar os braços da cadeira" sem levantar.'],
  erro: { rotulo: 'ombros jogados à frente', base: { tor: 22, sL: -60, sR: -60 } } });

add({ id: 'S09', regiao: 'MMSS', tipo: 'forca', nome: 'Rosca de punho', musculos: 'Flexores e extensores do antebraço', equipamento: 'Cadeira + halter leve',
  fontes: ['NIA'], vista: 'lateral', props: ['cadeira', 'halteres'], guias: [],
  base: { hL: 90, hR: 90, kL: 90, kR: 90, sL: 25, sR: 25, eL: 95, eR: 95, wr: -35, tor: 8 },
  quadros: [q({}, 0), q({ wr: 45 }, 1.2), q({ wr: 45 }, 0.4)], retornoDur: 1.6,
  exec: ['Sentado, antebraço apoiado na coxa, mão para além do joelho, palma para cima.', 'Dobre o punho levantando o peso (1–2 s).', 'Desça devagar abaixo da linha do antebraço.', 'Repita com a palma para baixo (extensores).'],
  postura: ['Antebraço sempre apoiado.', 'Só o punho se move.'],
  erros: ['Levantar o cotovelo da coxa.'],
  cuidados: ['Útil para força de preensão (marcador de fragilidade). Carga 0,5–1 kg.'] });

add({ id: 'S10', regiao: 'MMSS', tipo: 'forca', nome: 'Preensão manual (bola)', musculos: 'Flexores dos dedos, intrínsecos da mão', equipamento: 'Bola de tênis ou macia',
  fontes: ['NIA', 'VF'], vista: 'frontal', props: ['bola'], guias: [],
  base: { bL: 12, bR: 12, eL: 90, eR: 90, grip: 1 },
  quadros: [q({}, 0), q({ grip: 0.72 }, 0.8), q({ grip: 0.72 }, 3)], retornoDur: 1.2,
  exec: ['Segure a bola com a mão inteira.', 'Aperte o mais forte que conseguir por 3–5 s.', 'Solte devagar. Troque de mão.'],
  postura: ['Punho reto; cotovelo dobrado a 90° e apoiado.'],
  erros: ['Prender a respiração ao apertar (sobe a pressão).'],
  cuidados: ['Contar em voz alta durante o aperto garante a respiração.', 'Evitar em artrite ativa da mão com dor.'] });

add({ id: 'S11', regiao: 'MMSS', tipo: 'forca', nome: 'Supino sentado com faixa (empurrar)', musculos: 'Peitoral, deltoide anterior, tríceps', equipamento: 'Cadeira + faixa elástica atrás das costas',
  fontes: ['ICFSR', 'NSCA19'], vista: 'lateral', props: ['cadeira', 'elastico_costas'], guias: ['ombros-baixos'],
  base: { hL: 90, hR: 90, kL: 90, kR: 90, sL: 78, sR: 78, eL: 98, eR: 98 },
  quadros: [q({}, 0), q({ sL: 88, sR: 88, eL: 6, eR: 6 }, 1.2), q({ sL: 88, sR: 88, eL: 6, eR: 6 }, 0.4)], retornoDur: 2,
  exec: ['Sentado, faixa passando pelas costas na altura das omoplatas, uma ponta em cada mão.', 'Mãos ao lado do peito, cotovelos para trás.', 'Empurre à frente até quase esticar os braços.', 'Volte devagar.'],
  postura: ['Costas apoiadas; ombros para baixo.'],
  erros: ['Empurrar com impulso do tronco.', 'Esticar totalmente e travar os cotovelos.'],
  cuidados: ['Exercício de "empurrar" que complementa a remada ("puxar") — sempre prescrever os dois.'] });

add({ id: 'S12', regiao: 'MMSS', tipo: 'forca', nome: 'Puxada vertical com faixa', musculos: 'Grande dorsal, bíceps, romboides', equipamento: 'Faixa presa no alto (porta) ou segura acima da cabeça',
  fontes: ['ICFSR', 'NSCA19'], vista: 'frontal', props: ['elastico_alto'], guias: ['ombros-baixos'],
  base: { bL: 150, bR: 150, eL: 8, eR: 8 },
  quadros: [q({}, 0), q({ bL: 95, bR: 95, eL: 105, eR: 105 }, 1.2), q({ bL: 95, bR: 95, eL: 105, eR: 105 }, 0.5)], retornoDur: 2,
  exec: ['Sentado ou em pé, faixa presa acima da cabeça; segure as pontas com os braços estendidos.', 'Puxe os cotovelos para baixo e para trás até as mãos ficarem na altura dos ombros.', 'Segure 1 s e volte devagar.'],
  postura: ['Peito aberto; omoplatas descendo e se aproximando.', 'Punhos retos.'],
  erros: ['Encolher os ombros no início.', 'Inclinar-se para trás.'],
  cuidados: ['Confirmar que a âncora da faixa está firme (porta fechada e travada).'] });

add({ id: 'S13', regiao: 'MMSS', tipo: 'forca', nome: 'Rotação externa de ombro com faixa', musculos: 'Manguito rotador (infraespinal, redondo menor), romboides', equipamento: 'Faixa elástica entre as mãos',
  fontes: ['Consenso fisioterapia (sem programa validado próprio)'], vista: 'frontal', props: ['elastico_maos'], guias: ['cotovelo-colado'],
  base: { bL: 6, bR: 6, eL: 92, eR: 92 },
  quadros: [q({}, 0), q({ eL: 30, eR: 30 }, 1.4), q({ eL: 30, eR: 30 }, 0.5)], retornoDur: 1.8,
  exec: ['Cotovelos dobrados a 90° e colados ao tronco, faixa entre as mãos, antebraços à frente.', 'Afaste as mãos girando os braços para fora, cotovelos parados.', 'Volte devagar.'],
  postura: ['Cotovelos grudados nas costelas (uma toalha embaixo ajuda).', 'Ombros para baixo.'],
  erros: ['Abrir os cotovelos.', 'Compensar com o tronco.'],
  cuidados: ['Faixa leve; é exercício de estabilidade, não de carga.'] });

add({ id: 'S14', regiao: 'MMSS', tipo: 'forca', nome: 'Flexão de ombros com bastão', musculos: 'Deltoide, serrátil; mobilidade de ombro', equipamento: 'Bastão, cabo de vassoura ou toalha',
  fontes: ['NIA (variante de mobilidade)'], vista: 'lateral', props: ['bastao'], guias: ['coluna'],
  base: { sL: 15, sR: 15, eL: 8, eR: 8 },
  quadros: [q({}, 0), q({ sL: 165, sR: 165, eL: 4, eR: 4 }, 2), q({ sL: 165, sR: 165, eL: 4, eR: 4 }, 0.8)], retornoDur: 2,
  exec: ['Segure o bastão com as mãos na largura dos ombros, braços à frente das coxas.', 'Eleve o bastão à frente até acima da cabeça, tão alto quanto for confortável.', 'Desça devagar.'],
  postura: ['Cotovelos quase retos; lombar neutra.'],
  erros: ['Arquear a lombar para subir mais.'],
  cuidados: ['Amplitude até o limite sem dor; ganho de amplitude vem com semanas.'] });

add({ id: 'S15', regiao: 'MMSS', tipo: 'forca', nome: 'Caminhada com carga (farmer\'s walk)', musculos: 'Preensão, trapézio, core, membros inferiores', equipamento: 'Dois pesos iguais (sacolas, garrafas, halteres)',
  fontes: ['VF (nível D)', 'LIFE (carregar compras)'], vista: 'lateral', props: ['halteres'], guias: ['coluna', 'olhar-frente'],
  base: { eL: 4, eR: 4, sL: 2, sR: 2 },
  quadros: [q({ hL: 18, hR: -14, kL: 8, kR: 14 }, 0), q({ hL: -14, hR: 18, kL: 14, kR: 8 }, 0.7)], retornoDur: 0.7,
  exec: ['Segure um peso em cada mão, braços ao lado do corpo.', 'Caminhe 10–20 m com passos normais, ombros para trás.', 'Descanse e repita 2–4 vezes.'],
  postura: ['Tronco ereto, olhar à frente, ombros longe das orelhas.'],
  erros: ['Inclinar para um lado.', 'Passos arrastados.'],
  cuidados: ['Corredor livre de obstáculos; começar com 1–2 kg por mão.', 'Nível A/B: não indicado.'] });

/* ============================ MEMBROS INFERIORES E EQUILÍBRIO ============================ */
add({ id: 'I01', regiao: 'MMII', tipo: 'potencia', nome: 'Sentar e levantar da cadeira', musculos: 'Quadríceps, glúteos, isquiotibiais', equipamento: 'Cadeira firme sem rodas',
  fontes: ['OEP', 'VF', 'NIA', 'NHS', 'NSCA19', 'LIFE'], vista: 'lateral', props: ['cadeira'], guias: ['joelho-pe', 'coluna'],
  base: { sL: 25, sR: 25, eL: 30, eR: 30 },
  quadros: [q({ hL: 90, hR: 90, kL: 90, kR: 90 }, 0), q({ hL: 100, hR: 100, kL: 90, kR: 90, tor: 35, sL: 40, sR: 40 }, 0.8), q({ hL: 40, hR: 40, kL: 45, kR: 45, tor: 22, sL: 35, sR: 35 }, 0.5), q({ hL: 0, hR: 0, kL: 0, kR: 0, tor: 0 }, 0.4), q({ hL: 0, hR: 0, kL: 0, kR: 0, tor: 0 }, 0.6), q({ hL: 40, hR: 40, kL: 45, kR: 45, tor: 22, sL: 35, sR: 35 }, 1.4), q({ hL: 95, hR: 95, kL: 90, kR: 90, tor: 25 }, 1.2)], retornoDur: 0.5,
  exec: ['Sentado na borda da cadeira, pés na largura do quadril, um pouco atrás dos joelhos.', 'Incline o tronco à frente ("nariz sobre os dedos dos pés").', 'Levante empurrando o chão com as pernas — o mais rápido que conseguir com controle.', 'Fique em pé 1 s e sente devagar (3 s), controlando a descida.'],
  postura: ['Joelhos alinhados sobre os pés.', 'Coluna reta durante a inclinação.'],
  erros: ['Usar as mãos para empurrar (só permitido no nível A/B).', 'Joelhos caindo para dentro.', 'Deixar-se "cair" na cadeira.'],
  cuidados: ['Cadeira contra a parede.', 'Progressão: com mãos → sem mãos → braços cruzados → mais rápido → com pesos.', 'É também o teste de referência (30 s ou 5 repetições).'],
  erro: { rotulo: 'joelhos à frente dos pés, tronco curvado', quadros: [q({ hL: 90, hR: 90, kL: 90, kR: 90 }, 0), q({ hL: 70, hR: 70, kL: 110, kR: 110, tor: 55, head: -20 }, 1.2)] } });

add({ id: 'I02', regiao: 'MMII', tipo: 'forca', nome: 'Extensão de joelho sentado', musculos: 'Quadríceps', equipamento: 'Cadeira; caneleira opcional',
  fontes: ['OEP', 'NIA', 'VF'], vista: 'lateral', props: ['cadeira'], guias: ['coluna'],
  base: { hL: 90, hR: 90, kL: 90, kR: 90, sL: -8, sR: -8, eL: 25, eR: 25 },
  quadros: [q({}, 0), q({ kR: 4, hR: 88 }, 1.2), q({ kR: 4, hR: 88 }, 1)], retornoDur: 2.5,
  exec: ['Sentado com as costas apoiadas, pés no chão.', 'Estique uma perna à frente até o joelho ficar reto, ponta do pé para cima.', 'Segure 1–2 s e desça devagar (3 s).', 'Alterne as pernas.'],
  postura: ['Coxa apoiada no assento; tronco ereto.'],
  erros: ['Balançar a perna.', 'Inclinar-se para trás.'],
  cuidados: ['Em osteoartrite de joelho: amplitude sem dor, carga leve, 2–3×/sem (NSCA).', 'Progressão: caneleira 0,5 → 1 → 2 kg.'] });

add({ id: 'I03', regiao: 'MMII', tipo: 'forca', nome: 'Flexão de joelho em pé', musculos: 'Isquiotibiais', equipamento: 'Apoio (encosto de cadeira); caneleira opcional',
  fontes: ['OEP', 'NIA'], vista: 'lateral', props: ['apoio'], guias: ['coluna', 'apoio-mao'],
  base: { sL: 42, sR: 42, eL: 12, eR: 12 },
  quadros: [q({}, 0), q({ kR: 100, hR: -4 }, 1.2), q({ kR: 100, hR: -4 }, 0.8)], retornoDur: 2,
  exec: ['Em pé atrás da cadeira, mãos no encosto.', 'Dobre um joelho levando o calcanhar em direção ao glúteo.', 'Segure 1 s e desça devagar.', 'Alterne.'],
  postura: ['Coxas paralelas; joelho de apoio levemente dobrado.', 'Quadril não se inclina à frente.'],
  erros: ['Fletir o quadril junto (levar a coxa à frente).', 'Arquear a lombar.'],
  cuidados: ['Apoio sempre ao alcance.'],
  erro: { rotulo: 'quadril flexionado, tronco à frente', base: { tor: 20 }, quadros: [q({}, 0), q({ kR: 100, hR: 40 }, 1.2)] } });

add({ id: 'I04', regiao: 'MMII', tipo: 'forca', nome: 'Abdução de quadril em pé', musculos: 'Glúteo médio e mínimo', equipamento: 'Apoio; caneleira opcional',
  fontes: ['OEP', 'NIA', 'NHS'], vista: 'frontal', props: ['apoio'], guias: [],
  base: { bL: 6, bR: 45, eR: 70, eL: 8 },
  quadros: [q({}, 0), q({ aL: 30 }, 1.2), q({ aL: 30 }, 0.8)], retornoDur: 2,
  exec: ['Em pé de lado para a cadeira, uma mão no encosto.', 'Eleve a perna de fora para o lado, ponta do pé para a frente.', 'Segure 1 s e volte devagar.', 'Troque de lado.'],
  postura: ['Tronco ereto, sem inclinar para o lado oposto.', 'Pé apontando para a frente (não para cima).'],
  erros: ['Inclinar o tronco para compensar.', 'Girar o pé para fora.'],
  cuidados: ['Músculo-chave da estabilidade da marcha e prevenção de quedas.'],
  erro: { rotulo: 'tronco inclinado para o lado', quadros: [q({}, 0), q({ aL: 45, aR: -12 }, 1.2)] } });

add({ id: 'I05', regiao: 'MMII', tipo: 'forca', nome: 'Extensão de quadril em pé', musculos: 'Glúteo máximo, isquiotibiais', equipamento: 'Apoio; caneleira opcional',
  fontes: ['NIA', 'NHS'], vista: 'lateral', props: ['apoio'], guias: ['coluna', 'apoio-mao'],
  base: { sL: 42, sR: 42, eL: 12, eR: 12, tor: 6 },
  quadros: [q({}, 0), q({ hR: -26, kR: 4 }, 1.2), q({ hR: -26, kR: 4 }, 0.8)], retornoDur: 2,
  exec: ['Em pé atrás da cadeira, mãos no encosto, tronco levemente inclinado.', 'Leve uma perna estendida para trás, sem dobrar o joelho.', 'Segure 1 s e volte devagar.'],
  postura: ['Movimento pequeno (20–30 cm); lombar não arqueia.'],
  erros: ['Arquear a lombar para levantar mais.', 'Inclinar o tronco à frente demais.'],
  cuidados: ['Em dor lombar: reduzir amplitude.'],
  erro: { rotulo: 'lombar arqueada', base: { tor: -12 }, quadros: [q({}, 0), q({ hR: -45 }, 1.2)] } });

add({ id: 'I06', regiao: 'MMII', tipo: 'forca', nome: 'Elevação de panturrilha', musculos: 'Gastrocnêmio, sóleo', equipamento: 'Apoio',
  fontes: ['OEP', 'NIA', 'NHS', 'VF'], vista: 'lateral', props: ['apoio'], guias: ['coluna', 'apoio-mao'],
  base: { sL: 42, sR: 42, eL: 12, eR: 12 },
  quadros: [q({}, 0), q({ heel: 1 }, 1.2), q({ heel: 1 }, 0.8)], retornoDur: 2.2,
  exec: ['Em pé, mãos no apoio, pés na largura do quadril.', 'Suba na ponta dos pés o mais alto que conseguir.', 'Segure 1 s e desça devagar até o calcanhar tocar o chão.'],
  postura: ['Peso distribuído sobre o dedão e o segundo dedo.', 'Tronco ereto.'],
  erros: ['Tornozelos virando para fora.', 'Descer rápido.'],
  cuidados: ['Progressão: duas pernas → uma perna → sem apoio.'] });

add({ id: 'I07', regiao: 'MMII', tipo: 'forca', nome: 'Elevação da ponta dos pés (dorsiflexão)', musculos: 'Tibial anterior', equipamento: 'Apoio (encosto) ou parede atrás',
  fontes: ['OEP'], vista: 'lateral', props: ['apoio'], guias: ['apoio-mao'],
  base: { sL: 42, sR: 42, eL: 12, eR: 12 },
  quadros: [q({}, 0), q({ toe: 1, tor: -3 }, 1), q({ toe: 1, tor: -3 }, 0.8)], retornoDur: 1.6,
  exec: ['Em pé, mãos no apoio, peso nos calcanhares.', 'Levante a ponta dos dois pés do chão, mantendo os calcanhares apoiados.', 'Segure 1 s e desça.'],
  postura: ['Corpo ereto, sem jogar o quadril para trás.'],
  erros: ['Inclinar o tronco para trás.'],
  cuidados: ['Previne o "pé caído" na marcha e tropeços.'] });

add({ id: 'I08', regiao: 'MMII', tipo: 'forca', nome: 'Mini-agachamento', musculos: 'Quadríceps, glúteos', equipamento: 'Apoio opcional',
  fontes: ['OEP', 'NHS', 'LIFE', 'VF'], vista: 'lateral', props: [], guias: ['joelho-pe', 'coluna'],
  base: { sL: 35, sR: 35, eL: 8, eR: 8 },
  quadros: [q({}, 0), q({ hL: 38, hR: 38, kL: 42, kR: 42, tor: 22, sL: 60, sR: 60 }, 1.6), q({ hL: 38, hR: 38, kL: 42, kR: 42, tor: 22, sL: 60, sR: 60 }, 0.6)], retornoDur: 1.2,
  exec: ['Em pé, pés na largura do quadril, braços à frente (ou mãos no apoio).', 'Dobre os joelhos e leve o quadril para trás como se fosse sentar, até 45° (metade do caminho).', 'Segure 1 s e suba empurrando o chão.'],
  postura: ['Joelhos sobre os pés, sem passar da ponta.', 'Coluna reta, calcanhares no chão.'],
  erros: ['Joelhos para dentro.', 'Levantar os calcanhares.', 'Curvar as costas.'],
  cuidados: ['Uma cadeira atrás serve de limite seguro.', 'Osteoartrite: amplitude reduzida (30°).'],
  erro: { rotulo: 'joelhos passando os pés, costas curvadas', quadros: [q({}, 0), q({ hL: 30, hR: 30, kL: 75, kR: 75, tor: 45, head: -20, heel: 0.6 }, 1.6)] } });

add({ id: 'I09', regiao: 'MMII', tipo: 'potencia', nome: 'Subida em degrau (step-up)', musculos: 'Quadríceps, glúteos', equipamento: 'Degrau de 10–20 cm ou primeiro degrau da escada com corrimão',
  fontes: ['VF', 'ICFSR', 'LIFE'], vista: 'lateral', props: ['degrau'], guias: ['joelho-pe'],
  base: { sL: 15, sR: 15, eL: 20, eR: 20 },
  quadros: [q({}, 0), q({ hR: 50, kR: 70, tor: 8 }, 0.8), q({ elev: 16, dx: 30, tor: 4 }, 0.7), q({ elev: 16, dx: 30 }, 0.5), q({ hR: 50, kR: 70, tor: 8 }, 1.1)], retornoDur: 0.8,
  exec: ['De frente para o degrau, mão no corrimão.', 'Coloque um pé inteiro no degrau.', 'Suba empurrando com essa perna (sem impulso da de trás) até ficar em pé no degrau.', 'Desça devagar com a mesma perna à frente. Alterne a perna que lidera.'],
  postura: ['Pé inteiro no degrau; joelho sobre o pé.', 'Tronco ereto.'],
  erros: ['Impulsionar com a perna de trás.', 'Joelho caindo para dentro.'],
  cuidados: ['Sempre com corrimão ou parede; degrau firme.', 'Nível A: não indicado. Nível B: 10 cm com duas mãos no apoio.'] });

add({ id: 'I10', regiao: 'MMII', tipo: 'forca', nome: 'Leg press (academia)', musculos: 'Quadríceps, glúteos, isquiotibiais', equipamento: 'Máquina leg press',
  fontes: ['NSCA19', 'ICFSR'], vista: 'lateral', props: ['legpress'], guias: [],
  base: { livre: 1, tor: -45, hL: 100, hR: 100, kL: 95, kR: 95, sL: -30, sR: -30, eL: 30, eR: 30 },
  quadros: [q({}, 0), q({ kL: 20, kR: 20, hL: 92, hR: 92 }, 1.2), q({ kL: 20, kR: 20, hL: 92, hR: 92 }, 0.4)], retornoDur: 2.4,
  exec: ['Sentado na máquina com as costas e a cabeça apoiadas, pés na plataforma na largura do quadril.', 'Empurre a plataforma até quase esticar os joelhos (não travar).', 'Volte devagar até os joelhos a 90°.'],
  postura: ['Lombar sempre encostada; joelhos alinhados com os pés.'],
  erros: ['Travar os joelhos no fim.', 'Descolar a lombar do encosto (amplitude excessiva).', 'Prender a respiração.'],
  cuidados: ['Exercício multiarticular de eleição para 70–85% 1RM em nível D (NSCA); em osteoporose evitar flexão lombar.', 'Versão de potência: empurrar rápido, voltar em 2–3 s (40–60% 1RM).'] });

add({ id: 'I11', regiao: 'MMII', tipo: 'forca', nome: 'Marcha estacionária (elevação de joelhos)', musculos: 'Flexores de quadril, quadríceps; equilíbrio dinâmico', equipamento: 'Apoio opcional',
  fontes: ['VF', 'NHS'], vista: 'lateral', props: ['apoio'], guias: ['coluna'],
  base: { sL: 42, sR: 42, eL: 12, eR: 12 },
  quadros: [q({}, 0), q({ hR: 72, kR: 95 }, 0.6), q({}, 0.6), q({ hL: 72, kL: 95 }, 0.6)], retornoDur: 0.6,
  exec: ['Em pé, uma mão no apoio.', 'Eleve um joelho até a altura do quadril (ou o que for confortável).', 'Desça com controle e alterne, como marchar no lugar.', '20–30 elevações por perna.'],
  postura: ['Tronco ereto; olhar à frente.'],
  erros: ['Inclinar o tronco para trás ao levantar o joelho.'],
  cuidados: ['Nível A: sentado, elevando o joelho da cadeira.'] });

add({ id: 'I12', regiao: 'MMII', tipo: 'equilibrio', nome: 'Caminhada lateral', musculos: 'Glúteo médio; equilíbrio dinâmico', equipamento: 'Parede ou bancada ao lado',
  fontes: ['OEP', 'NHS'], vista: 'frontal', props: [], guias: [],
  base: { bL: 12, bR: 12, eL: 10, eR: 10 },
  quadros: [q({}, 0), q({ aR: 26 }, 0.6), q({ dx: 22 }, 0.6), q({ aR: 26, dx: 22 }, 0.6), q({ dx: 44 }, 0.6), q({ aL: 26, dx: 44 }, 0.6), q({ dx: 22 }, 0.6), q({ aL: 26, dx: 22 }, 0.6)], retornoDur: 0.6,
  exec: ['Em pé, pés juntos, joelhos levemente dobrados, perto de uma parede ou bancada.', 'Dê um passo para o lado e junte o outro pé — 10 passos para um lado, 10 para o outro.', 'Mantenha os pés apontando para a frente.'],
  postura: ['Passos pequenos e controlados; quadril não "cai".'],
  erros: ['Cruzar os pés.', 'Olhar para o chão.'],
  cuidados: ['Corredor livre; apoio ao alcance.'] });

add({ id: 'I13', regiao: 'MMII', tipo: 'equilibrio', nome: 'Caminhada para trás', musculos: 'Isquiotibiais, glúteos; controle postural', equipamento: 'Corredor livre, parede ao lado',
  fontes: ['OEP'], vista: 'lateral', props: [], guias: ['olhar-frente'],
  base: { sL: 6, sR: 6, eL: 8, eR: 8 },
  quadros: [q({ hL: 8, hR: -18, kR: 18 }, 0), q({ hL: -18, hR: 8, kL: 18, kR: 0, dx: -12 }, 0.8), q({ hL: 8, hR: -18, kR: 18, dx: -24 }, 0.8)], retornoDur: 0.01,
  exec: ['Em pé, mão próxima à parede ou bancada.', 'Caminhe 10 passos para trás, tocando primeiro a ponta do pé, depois o calcanhar.', 'Vire com cuidado e repita.'],
  postura: ['Tronco ereto; olhar à frente (não para o chão).'],
  erros: ['Passos longos demais.', 'Girar o corpo para olhar para trás.'],
  cuidados: ['Verificar o trajeto antes; sem tapetes soltos.', 'Nível A: não indicado.'] });

add({ id: 'I14', regiao: 'MMII', tipo: 'equilibrio', nome: 'Marcha tandem (calcanhar-ponta)', musculos: 'Equilíbrio dinâmico, estabilizadores do tornozelo', equipamento: 'Linha no chão, parede ao lado',
  fontes: ['OEP', 'NIA', 'NHS', 'ICFSR'], vista: 'lateral', props: [], guias: ['olhar-frente'],
  base: { sL: 6, sR: 6, eL: 8, eR: 8 },
  quadros: [q({ hL: 10, hR: -10 }, 0), q({ hL: -10, hR: 14, kR: 12, dx: 10 }, 0.9), q({ hL: -10, hR: 10, dx: 20 }, 0.5), q({ hL: 14, hR: -10, kL: 12, dx: 30 }, 0.9), q({ hL: 10, hR: -10, dx: 40 }, 0.5)], retornoDur: 0.01,
  exec: ['Em pé, ao lado de uma parede ou bancada.', 'Coloque um pé diretamente à frente do outro, calcanhar tocando a ponta.', 'Dê 10 passos assim, devagar; vire e volte.'],
  postura: ['Olhar em um ponto fixo à frente; braços levemente abertos.'],
  erros: ['Olhar para os pés.', 'Passos apressados.'],
  cuidados: ['Progressão: mão na parede → sem mão → 20 passos → com objeto na mão (dupla tarefa).'] });

add({ id: 'I15', regiao: 'MMII', tipo: 'equilibrio', nome: 'Apoio em um pé só', musculos: 'Estabilizadores de quadril e tornozelo', equipamento: 'Apoio ao lado',
  fontes: ['OEP', 'NIA', 'NHS', 'VF', 'ICFSR'], vista: 'frontal', props: ['apoio'], guias: [],
  base: { bL: 18, bR: 40, eR: 60, eL: 8 },
  quadros: [q({}, 0), q({ kL: 55, aL: 4 }, 0.8), q({ kL: 55, aL: 4 }, 5)], retornoDur: 0.8,
  exec: ['Em pé, uma mão no apoio (ou próxima dele).', 'Levante um pé do chão, dobrando o joelho.', 'Segure 10 s, chegando a 30 s com o tempo. Troque de perna.'],
  postura: ['Quadril nivelado; olhar fixo à frente.'],
  erros: ['Encostar a perna levantada na de apoio.', 'Segurar a respiração.'],
  cuidados: ['Progressão de apoio: duas mãos → uma → um dedo → sem apoio → olhos fechados (só com alguém ao lado).', 'Marcador: <5 s indica alto risco de queda.'] });

add({ id: 'I16', regiao: 'MMII', tipo: 'equilibrio', nome: 'Passar sobre obstáculo', musculos: 'Flexores de quadril; equilíbrio dinâmico; marcha', equipamento: 'Objeto baixo (livro, caixa de 5–10 cm)',
  fontes: ['ICFSR', 'VF', 'LIFE'], vista: 'lateral', props: ['obstaculo'], guias: ['olhar-frente'],
  base: { sL: 10, sR: 10, eL: 10, eR: 10 },
  quadros: [q({}, 0), q({ hR: 70, kR: 100, tor: 4 }, 0.8), q({ hR: 25, kR: 10, hL: -18, dx: 22 }, 0.7), q({ hL: 70, kL: 100, dx: 30 }, 0.8), q({ dx: 42 }, 0.7)], retornoDur: 0.01,
  exec: ['Coloque um objeto baixo no chão, apoio ao lado.', 'Levante bem o joelho e passe uma perna por cima, apoiando o pé inteiro do outro lado.', 'Passe a outra perna. Vire e repita 5–10 vezes.'],
  postura: ['Joelho alto; olhar à frente e não para o obstáculo depois de localizá-lo.'],
  erros: ['Arrastar o pé.', 'Olhar para baixo o tempo todo.'],
  cuidados: ['Objeto que não machuque se pisado (espuma, livro).'] });

add({ id: 'I17', regiao: 'MMII', tipo: 'equilibrio', nome: 'Postura tandem (calcanhar-ponta parado)', musculos: 'Equilíbrio estático', equipamento: 'Apoio ao lado',
  fontes: ['OEP', 'VF', 'NIA', 'ICFSR'], vista: 'lateral', props: ['apoio'], guias: ['olhar-frente'],
  base: { sL: 42, sR: 42, eL: 12, eR: 12 },
  quadros: [q({ hL: 8, hR: -8 }, 0), q({ hL: 8, hR: -8, sR: 12, sL: 12 }, 0.8), q({ hL: 8, hR: -8, sR: 12, sL: 12 }, 5)], retornoDur: 0.8,
  exec: ['Em pé ao lado do apoio, coloque um pé diretamente à frente do outro (calcanhar tocando a ponta).', 'Solte o apoio e segure a posição 10–30 s.', 'Troque o pé da frente.'],
  postura: ['Pés numa linha; olhar à frente.'],
  erros: ['Inclinar o tronco lateralmente.'],
  cuidados: ['Sequência: pés juntos → semi-tandem → tandem (SPPB).'] });

/* ============================ AERÓBICO (modalidades) ============================ */
const AEROBICO = [
  { id: 'A01', nome: 'Caminhada', progressao: 'Aumentar tempo (5 min/sem) → ritmo → rampas/escadas → peso leve nos punhos (ICFSR)' },
  { id: 'A02', nome: 'Bicicleta ergométrica', progressao: 'Cadência → resistência → tempo (ICFSR)' },
  { id: 'A03', nome: 'Hidroginástica / natação', progressao: 'Usar braços e pernas; adicionar resistência na água; ritmo (ICFSR)' },
  { id: 'A04', nome: 'Dança', progressao: 'Tempo e complexidade (ICFSR)' },
  { id: 'A05', nome: 'Subir escadas', progressao: 'Lances por sessão; sempre com corrimão (ICFSR/LiFE)' },
  { id: 'A06', nome: 'Tai Chi', progressao: 'Formas e tempo; conta como equilíbrio (Cochrane 2019; TJQMBB)' }
];

/* ============================ Referências ============================ */
const REFERENCIAS = [
  'Bull FC, et al. World Health Organization 2020 guidelines on physical activity and sedentary behaviour. Br J Sports Med. 2020;54:1451–62. doi:10.1136/bjsports-2020-102955',
  'Fragala MS, Cadore EL, Dorgo S, Izquierdo M, Kraemer WJ, Peterson MD, Ryan ED. Resistance Training for Older Adults: Position Statement From the NSCA. J Strength Cond Res. 2019;33(8):2019–52. doi:10.1519/JSC.0000000000003230',
  'Izquierdo M, et al. International Exercise Recommendations in Older Adults (ICFSR): Expert Consensus Guidelines. J Nutr Health Aging. 2021;25(7):824–53. doi:10.1007/s12603-021-1665-8',
  'Izquierdo M, et al. Global consensus on optimal exercise recommendations for enhancing healthy longevity in older adults (ICFSR). J Nutr Health Aging. 2025;29(1):100401. doi:10.1016/j.jnha.2024.100401',
  'Sherrington C, et al. Exercise for preventing falls in older people living in the community. Cochrane Database Syst Rev. 2019;(1):CD012424. doi:10.1002/14651858.CD012424.pub2',
  'Ministério da Saúde. Guia de Atividade Física para a População Brasileira. Brasília; 2021. Coelho-Ravagnani CF, et al. Rev Bras Ativ Fís Saúde. 2021;26:e0216',
  'Campbell AJ, Robertson MC. Otago Exercise Programme to prevent falls in older adults. ACC New Zealand, 2003. Thomas S, et al. Age Ageing. 2010;39:681–7',
  'Izquierdo M, et al. Vivifrail — Guía práctica para la prescripción de un programa de entrenamiento físico multicomponente. Pamplona; 2017. Casas-Herrero Á, et al. Trials. 2019',
  'National Institute on Aging. Exercise & Physical Activity: Your Everyday Guide (Go4Life). NIH Publication; Workout to Go (No. 11-4258)',
  'Clemson L, et al. LiFE study: randomised parallel trial. BMJ. 2012;345:e4547',
  'Balachandran AT, et al. Comparison of Power Training vs Traditional Strength Training on Physical Function in Older Adults. JAMA Netw Open. 2022;5(5):e2211623',
  'ACSM. Guidelines for Exercise Testing and Prescription. 11th ed. Wolters Kluwer; 2021 (critérios de interrupção e contraindicações)'
];
const FONTES_NOME = { OMS20: 'OMS 2020', NSCA19: 'NSCA 2019 (Fragala)', ICFSR: 'ICFSR 2021/2024 (Izquierdo)', COCH19: 'Cochrane 2019 (Sherrington)', MS21: 'Guia MS 2021', OEP: 'Otago (NZ)', VF: 'Vivifrail (ES/UE)', NIA: 'NIA / Go4Life (EUA)', NHS: 'NHS (UK)', LIFE: 'LiFE (AU)' };

if (typeof module !== 'undefined') module.exports = { EX, AEROBICO, NIVEIS, DOSE, PARAR_GERAL, NAO_FAZER, PROGRESSAO, METAS, REFERENCIAS, FONTES_NOME };
