/**
 * Natação · Tempos e Ranking
 * Cole este código em: Planilha > Extensões > Apps Script (apague o que estiver lá)
 * Depois: Implantar > Nova implantação > Tipo: App da Web
 *   - Executar como: Eu
 *   - Quem pode acessar: Qualquer pessoa
 * Copie a URL que termina em /exec e cole na página (primeira tela) ou em SCRIPT_URL no index.html.
 * A planilha pode estar vazia: no primeiro acesso da página o script cria as abas e a lista de atletas.
 */

// Código para lançar e corrigir tempos (botão "Editar" na página). Troque se quiser.
// Quem só abre o link vê os resultados, sem poder alterar nada.
const CODIGO_EDICAO = 'natacao2026';

// Nomes das abas e das colunas (linha 1). O script acha cada coluna pelo título.
const ABA = { insc: 'Inscrições', provas: 'Provas', pontos: 'Pontuação', classif: 'Classificação', geral: 'Ranking Geral' };
const COL = {
  id: 'ID', provaId: 'Prova ID', prova: 'Prova', atleta: 'Atleta', atletica: 'Atlética', inst: 'Instituição',
  integrantes: 'Integrantes', tempo: 'Tempo', seg: 'Tempo (s)', situacao: 'Situação', obs: 'Observação', atualizado: 'Atualizado em'
};
const SITUACOES = ['', 'Desclassificado', 'W.O.'];

// Lista inicial: COMPETIÇÃO FICTÍCIA PARA TESTE. Usada só quando a aba "Inscrições" está vazia.
// Linhas: [prova, atleta/equipe, atlética, instituição, integrantes, tempo em segundos, situação, observação]
const SEED = {"provas":[["p01","50M LIVRE FEMININO","Não"],
  ["p02","50M LIVRE MASCULINO","Não"],
  ["p03","50M PEITO FEMININO","Não"],
  ["p04","50M PEITO MASCULINO","Não"],
  ["p05","50M COSTAS FEMININO","Não"],
  ["p06","50M COSTAS MASCULINO","Não"],
  ["p07","50M BORBOLETA FEMININO","Não"],
  ["p08","50M BORBOLETA MASCULINO","Não"],
  ["p09","100M LIVRE FEMININO","Não"],
  ["p10","100M LIVRE MASCULINO","Não"],
  ["p11","REVEZAMENTO 4X50M LIVRE MISTO","Sim"]],"inscricoes":[["p01","Luana Correia Oliveira","Golfinho","UNIPRAIA","",30.4,"",""],
  ["p01","Helena Moura Cardoso","Marlin","FACSUL","",30.4,"",""],
  ["p01","Larissa Pires Lima","Arraia","UNIMAR","",29.07,"",""],
  ["p01","Vitória Queiroz Barbosa","Arraia","UNIMAR","",29.56,"",""],
  ["p01","Paula Brito Lima","Arraia","UNIMAR","",35.36,"",""],
  ["p01","Fernanda Vasconcelos Henriques","Marlin","FACSUL","",33.84,"",""],
  ["p01","Lívia Dias Vasconcelos","Arraia","UNIMAR","",29.07,"",""],
  ["p01","Carla Pires Dias","Orca","UNIVALE","",35.73,"",""],
  ["p01","Luana Dias Almeida","Tubarão","FATEC MAR","",33.06,"",""],
  ["p01","Bianca Cardoso Correia","Tubarão","FATEC MAR","",35.97,"",""],
  ["p01","Larissa Barbosa Henriques","Arraia","UNIMAR","",30.21,"",""],
  ["p01","Daniela Pires Lima","Piranha","ESBA","",33.54,"",""],
  ["p02","Rafael Vasconcelos Farias","Orca","UNIVALE","",30.41,"",""],
  ["p02","Davi Santana Pires","Tubarão","FATEC MAR","",25.77,"",""],
  ["p02","Caio Cardoso Santana","Arraia","UNIMAR","",26.07,"Desclassificado","Saída antecipada"],
  ["p02","Heitor Barbosa Henriques","Golfinho","UNIPRAIA","",29.33,"",""],
  ["p02","Thiago Esteves Esteves","Tubarão","FATEC MAR","",24.9,"",""],
  ["p02","Heitor Vasconcelos Vasconcelos","Orca","UNIVALE","",30.74,"",""],
  ["p02","Samuel Correia Queiroz","Marlin","FACSUL","",25.32,"",""],
  ["p02","Davi Nunes Dias","Orca","UNIVALE","",28.55,"",""],
  ["p02","Igor Vasconcelos Almeida","Tubarão","FATEC MAR","",28.52,"",""],
  ["p02","Thiago Gomes Moura","Piranha","ESBA","",28.01,"",""],
  ["p02","Diego Esteves Farias","Tubarão","FATEC MAR","",25.45,"",""],
  ["p02","Samuel Correia Gomes","Marlin","FACSUL","",25.48,"",""],
  ["p02","Leonardo Lima Teixeira","Marlin","FACSUL","",30.87,"",""],
  ["p03","Fernanda Queiroz Nunes","Orca","UNIVALE","",43.19,"",""],
  ["p03","Luana Correia Oliveira","Golfinho","UNIPRAIA","",43.75,"",""],
  ["p03","Eduarda Gomes Nunes","Arraia","UNIMAR","",43.63,"",""],
  ["p03","Natália Cardoso Vasconcelos","Orca","UNIVALE","",null,"W.O.","Não compareceu"],
  ["p03","Daniela Pires Lima","Piranha","ESBA","",39.97,"",""],
  ["p03","Gabriela Cardoso Barbosa","Tubarão","FATEC MAR","",42.78,"",""],
  ["p03","Carla Gomes Henriques","Golfinho","UNIPRAIA","",45.35,"",""],
  ["p03","Camila Vasconcelos Queiroz","Marlin","FACSUL","",47.59,"",""],
  ["p03","Camila Vasconcelos Henriques","Tubarão","FATEC MAR","",38.1,"",""],
  ["p03","Luana Oliveira Farias","Orca","UNIVALE","",46.45,"",""],
  ["p03","Isabela Henriques Henriques","Marlin","FACSUL","",39.45,"",""],
  ["p03","Fernanda Vasconcelos Henriques","Marlin","FACSUL","",44.59,"",""],
  ["p03","Marina Correia Lima","Arraia","UNIMAR","",38.34,"",""],
  ["p04","Diego Esteves Farias","Tubarão","FATEC MAR","",36.53,"",""],
  ["p04","Otávio Correia Cardoso","Piranha","ESBA","",34.19,"",""],
  ["p04","Davi Nunes Dias","Orca","UNIVALE","",35.93,"",""],
  ["p04","Leonardo Brito Queiroz","Golfinho","UNIPRAIA","",33.19,"",""],
  ["p04","Caio Cardoso Santana","Arraia","UNIMAR","",32.9,"",""],
  ["p04","Heitor Barbosa Henriques","Golfinho","UNIPRAIA","",37.04,"",""],
  ["p04","Nicolas Correia Rocha","Golfinho","UNIPRAIA","",35.13,"",""],
  ["p04","Leonardo Lima Teixeira","Marlin","FACSUL","",37.57,"",""],
  ["p04","Igor Vasconcelos Almeida","Tubarão","FATEC MAR","",32.62,"",""],
  ["p04","Pedro Esteves Lima","Marlin","FACSUL","",36.82,"",""],
  ["p04","Gustavo Brito Nunes","Marlin","FACSUL","",36.87,"",""],
  ["p04","Thiago Gomes Moura","Piranha","ESBA","",34.55,"",""],
  ["p05","Fernanda Queiroz Nunes","Orca","UNIVALE","",38.03,"",""],
  ["p05","Eduarda Gomes Nunes","Arraia","UNIMAR","",39.25,"",""],
  ["p05","Marina Gomes Lima","Tubarão","FATEC MAR","",36.49,"",""],
  ["p05","Camila Vasconcelos Queiroz","Marlin","FACSUL","",41.34,"",""],
  ["p05","Carla Pires Dias","Orca","UNIVALE","",36.63,"",""],
  ["p05","Paula Pires Lima","Tubarão","FATEC MAR","",41.06,"",""],
  ["p05","Larissa Pires Lima","Arraia","UNIMAR","",38.07,"",""],
  ["p05","Helena Moura Cardoso","Marlin","FACSUL","",34.03,"",""],
  ["p05","Gabriela Cardoso Barbosa","Tubarão","FATEC MAR","",40.07,"",""],
  ["p05","Camila Vasconcelos Henriques","Tubarão","FATEC MAR","",34.88,"",""],
  ["p05","Isabela Henriques Henriques","Marlin","FACSUL","",34.09,"",""],
  ["p06","Nicolas Correia Rocha","Golfinho","UNIPRAIA","",30.98,"",""],
  ["p06","Leonardo Dias Vasconcelos","Orca","UNIVALE","",37.54,"",""],
  ["p06","Davi Santana Pires","Tubarão","FATEC MAR","",37.14,"",""],
  ["p06","Samuel Correia Queiroz","Marlin","FACSUL","",37.15,"",""],
  ["p06","Samuel Santana Cardoso","Arraia","UNIMAR","",30.84,"",""],
  ["p06","Diego Esteves Farias","Tubarão","FATEC MAR","",35.69,"",""],
  ["p06","Heitor Vasconcelos Vasconcelos","Orca","UNIVALE","",30.96,"",""],
  ["p06","Thiago Esteves Esteves","Tubarão","FATEC MAR","",32.91,"",""],
  ["p06","Mateus Farias Vasconcelos","Golfinho","UNIPRAIA","",31.46,"",""],
  ["p06","Otávio Farias Rocha","Arraia","UNIMAR","",36.11,"",""],
  ["p07","Camila Vasconcelos Queiroz","Marlin","FACSUL","",39.39,"",""],
  ["p07","Luana Correia Oliveira","Golfinho","UNIPRAIA","",39.42,"",""],
  ["p07","Marina Correia Lima","Arraia","UNIMAR","",39.52,"",""],
  ["p07","Eduarda Gomes Nunes","Arraia","UNIMAR","",34.47,"",""],
  ["p07","Paula Brito Lima","Arraia","UNIMAR","",39.15,"",""],
  ["p07","Fernanda Vasconcelos Henriques","Marlin","FACSUL","",36.57,"",""],
  ["p07","Luana Dias Almeida","Tubarão","FATEC MAR","",33.42,"",""],
  ["p07","Larissa Pires Lima","Arraia","UNIMAR","",38.5,"",""],
  ["p07","Lívia Rocha Vasconcelos","Arraia","UNIMAR","",32.55,"",""],
  ["p07","Carla Pires Dias","Orca","UNIVALE","",32.0,"",""],
  ["p07","Fernanda Queiroz Nunes","Orca","UNIVALE","",35.65,"",""],
  ["p08","André Correia Nunes","Piranha","ESBA","",null,"",""],
  ["p08","Samuel Santana Cardoso","Arraia","UNIMAR","",null,"",""],
  ["p08","Otávio Correia Cardoso","Piranha","ESBA","",null,"",""],
  ["p08","Davi Santana Pires","Tubarão","FATEC MAR","",null,"",""],
  ["p08","Otávio Farias Rocha","Arraia","UNIMAR","",null,"",""],
  ["p08","Gustavo Brito Nunes","Marlin","FACSUL","",null,"",""],
  ["p08","Samuel Correia Gomes","Marlin","FACSUL","",null,"",""],
  ["p08","Mateus Farias Vasconcelos","Golfinho","UNIPRAIA","",null,"",""],
  ["p08","Samuel Correia Queiroz","Marlin","FACSUL","",null,"",""],
  ["p08","Leonardo Dias Vasconcelos","Orca","UNIVALE","",null,"",""],
  ["p08","Caio Cardoso Santana","Arraia","UNIMAR","",null,"",""],
  ["p08","Thiago Esteves Esteves","Tubarão","FATEC MAR","",null,"",""],
  ["p08","Igor Vasconcelos Almeida","Tubarão","FATEC MAR","",null,"",""],
  ["p09","Luana Correia Oliveira","Golfinho","UNIPRAIA","",null,"",""],
  ["p09","Larissa Pires Lima","Arraia","UNIMAR","",null,"",""],
  ["p09","Larissa Barbosa Henriques","Arraia","UNIMAR","",null,"",""],
  ["p09","Fernanda Vasconcelos Henriques","Marlin","FACSUL","",null,"",""],
  ["p09","Camila Vasconcelos Queiroz","Marlin","FACSUL","",null,"",""],
  ["p09","Helena Moura Cardoso","Marlin","FACSUL","",null,"",""],
  ["p09","Gabriela Cardoso Barbosa","Tubarão","FATEC MAR","",null,"",""],
  ["p09","Yasmin Almeida Vasconcelos","Marlin","FACSUL","",null,"",""],
  ["p09","Lívia Dias Vasconcelos","Arraia","UNIMAR","",null,"",""],
  ["p09","Eduarda Gomes Nunes","Arraia","UNIMAR","",null,"",""],
  ["p09","Carla Pires Dias","Orca","UNIVALE","",null,"",""],
  ["p09","Isabela Henriques Henriques","Marlin","FACSUL","",null,"",""],
  ["p10","Thiago Gomes Moura","Piranha","ESBA","",null,"",""],
  ["p10","Thiago Esteves Esteves","Tubarão","FATEC MAR","",null,"",""],
  ["p10","Samuel Correia Gomes","Marlin","FACSUL","",null,"",""],
  ["p10","Leonardo Lima Teixeira","Marlin","FACSUL","",null,"",""],
  ["p10","Davi Santana Pires","Tubarão","FATEC MAR","",null,"",""],
  ["p10","Mateus Farias Vasconcelos","Golfinho","UNIPRAIA","",null,"",""],
  ["p10","Diego Esteves Farias","Tubarão","FATEC MAR","",null,"",""],
  ["p10","Heitor Vasconcelos Vasconcelos","Orca","UNIVALE","",null,"",""],
  ["p10","Samuel Correia Queiroz","Marlin","FACSUL","",null,"",""],
  ["p10","Leonardo Brito Queiroz","Golfinho","UNIPRAIA","",null,"",""],
  ["p10","Heitor Barbosa Henriques","Golfinho","UNIPRAIA","",null,"",""],
  ["p11","Arraia","Arraia","UNIMAR","Lívia Dias Vasconcelos, Vitória Queiroz Barbosa, Samuel Santana Cardoso, Otávio Farias Rocha",null,"",""],
  ["p11","Marlin","Marlin","FACSUL","Isabela Henriques Henriques, Yasmin Almeida Vasconcelos, Gustavo Brito Nunes, Pedro Esteves Lima",null,"",""],
  ["p11","Orca","Orca","UNIVALE","Fernanda Queiroz Nunes, Carla Pires Dias, Heitor Vasconcelos Vasconcelos, Leonardo Dias Vasconcelos",null,"",""],
  ["p11","Piranha","Piranha","ESBA","Daniela Pires Lima, Otávio Correia Cardoso, André Correia Nunes",null,"",""],
  ["p11","Golfinho","Golfinho","UNIPRAIA","Carla Gomes Henriques, Luana Correia Oliveira, Leonardo Brito Queiroz, Nicolas Correia Rocha",null,"",""],
  ["p11","Tubarão","Tubarão","FATEC MAR","Luana Dias Almeida, Gabriela Cardoso Barbosa, Davi Santana Pires, Diego Esteves Farias",null,"",""]]};


function doGet(e) {
  const p = (e && e.parameter) || {};
  try {
    inicializar_();
    if (p.acao === 'listar') return saida_(Object.assign({ ok: true }, listar_()));   // leitura pública
    if (p.codigo !== CODIGO_EDICAO) return saida_({ ok: false, erro: 'codigo' });  // daqui para baixo, só com o código
    switch (p.acao) {
      case 'verificar': return saida_({ ok: true });
      case 'salvar':    return saida_(comLock_(() => salvar_(p)));
      case 'adicionar': return saida_(comLock_(() => adicionar_(p)));
      case 'remover':   return saida_(comLock_(() => remover_(p.id)));
      default:          return saida_({ ok: false, erro: 'acao' });
    }
  } catch (err) {
    return saida_({ ok: false, erro: String(err && err.message || err) });
  }
}

// ===== Preparação da planilha (roda sozinha no primeiro acesso) =====
// Cria as abas que faltarem. Se a aba "Inscrições" estiver vazia, preenche com a lista em SEED (súmulas).
// Para uma nova competição: apague as linhas das abas "Inscrições" e "Provas" e cole a lista nova
// (ou peça um novo SEED), mantendo os títulos da linha 1.
function inicializar_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const props = PropertiesService.getScriptProperties();
  if (props.getProperty('pronta') === '1' && ss.getSheetByName(ABA.insc) && ss.getSheetByName(ABA.provas) && ss.getSheetByName(ABA.pontos)) return;
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const cabec = (sh, cols) => { sh.getRange(1, 1, 1, cols.length).setValues([cols]).setFontWeight('bold').setFontColor('#ffffff').setBackground('#0F5876'); sh.setFrozenRows(1); };
    let insc = ss.getSheetByName(ABA.insc);
    if (!insc) {
      const s0 = ss.getSheets()[0];
      insc = (s0.getLastRow() === 0 && s0.getName() !== ABA.provas) ? s0.setName(ABA.insc) : ss.insertSheet(ABA.insc, 0);
    }
    const colsI = [COL.id, COL.provaId, COL.prova, COL.atleta, COL.atletica, COL.inst, COL.integrantes, COL.tempo, COL.seg, COL.situacao, COL.obs, COL.atualizado];
    let provas = ss.getSheetByName(ABA.provas) || ss.insertSheet(ABA.provas);
    if (provas.getLastRow() === 0) {
      cabec(provas, ['Ordem', 'ID', 'Prova', 'Revezamento']);
      if (SEED.provas.length) provas.getRange(2, 1, SEED.provas.length, 4).setValues(SEED.provas.map((p, i) => [i + 1, p[0], p[1], p[2]]));
      provas.setColumnWidth(3, 280);
    }
    if (insc.getLastRow() === 0) {
      cabec(insc, colsI);
      const nomes = {}; SEED.provas.forEach(p => nomes[p[0]] = p[1]);
      insc.getRange('H:H').setNumberFormat('@');
      if (SEED.inscricoes.length) insc.getRange(2, 1, SEED.inscricoes.length, colsI.length)
        .setValues(SEED.inscricoes.map((r, i) => [i + 1, r[0], nomes[r[0]] || '', r[1], r[2], r[3], r[4],
          typeof r[5] === 'number' ? formatarTempo(r[5]) : '', typeof r[5] === 'number' ? r[5] : '', r[6] || '', r[7] || '', '']));
      insc.getRange('H:H').setNumberFormat('@');
      insc.getRange('L:L').setNumberFormat('dd/mm/yyyy hh:mm');
      insc.getRange('J2:J').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['Desclassificado', 'W.O.'], true).setAllowInvalid(false).build());
      [60, 70, 230, 280, 140, 110, 320, 80, 80, 120, 220, 130].forEach((w, i) => insc.setColumnWidth(i + 1, w));
    }
    let pts = ss.getSheetByName(ABA.pontos) || ss.insertSheet(ABA.pontos);
    if (pts.getLastRow() === 0) {
      cabec(pts, ['Posição', 'Individual', 'Revezamento']);
      const ind = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
      pts.getRange(2, 1, ind.length, 3).setValues(ind.map((v, i) => [i + 1, v, '=B' + (i + 2) + '*2']));
      pts.getRange('E1').setValue('Pontuação do JUD 2026 (Art. 39 e Natação Art. 4º): até o 10º lugar, revezamento em dobro. Mude a coluna Individual se a regra for outra; para pontuar menos posições, apague as linhas finais.');
      pts.setColumnWidth(5, 520); pts.getRange('E1').setWrap(true);
    }
    props.setProperty('pronta', '1');
    try { atualizarRanking_(); } catch (e) {}
  } finally { lock.releaseLock(); }
}

function aba_(nome) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(nome);
  if (!sh) throw new Error('Aba não encontrada: ' + nome);
  return sh;
}
function mapa_(sh, cols) {
  const cab = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(String);
  const m = {};
  Object.keys(cols).forEach(k => {
    const i = cab.indexOf(cols[k]);
    if (i < 0) throw new Error('Coluna não encontrada na aba ' + sh.getName() + ': ' + cols[k]);
    m[k] = i;
  });
  return m;
}
function linhas_(sh) {
  const n = sh.getLastRow() - 1;
  return n < 1 ? [] : sh.getRange(2, 1, n, sh.getLastColumn()).getValues();
}
function comLock_(fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try { const r = fn(); SpreadsheetApp.flush(); return r; } finally { lock.releaseLock(); }
}

function lerProvas_() {
  const sh = aba_(ABA.provas), m = mapa_(sh, { ordem: 'Ordem', id: 'ID', nome: 'Prova', rev: 'Revezamento' });
  return linhas_(sh).filter(r => r[m.id] !== '').map(r => ({
    id: String(r[m.id]), ordem: Number(r[m.ordem]) || 0, nome: String(r[m.nome]),
    revezamento: /^s/i.test(String(r[m.rev]))
  })).sort((a, b) => a.ordem - b.ordem);
}
function lerPontos_() {
  const sh = aba_(ABA.pontos), m = mapa_(sh, { pos: 'Posição', ind: 'Individual', rev: 'Revezamento' });
  const L = linhas_(sh).filter(r => r[m.pos] !== '').sort((a, b) => a[m.pos] - b[m.pos]);
  return { individual: L.map(r => Number(r[m.ind]) || 0), revezamento: L.map(r => Number(r[m.rev]) || 0) };
}
function lerInscricoes_() {
  const sh = aba_(ABA.insc), m = mapa_(sh, COL);
  return linhas_(sh).filter(r => r[m.id] !== '').map((r, i) => ({
    id: String(r[m.id]), provaId: String(r[m.provaId]), atleta: String(r[m.atleta]), atletica: String(r[m.atletica]),
    inst: String(r[m.inst]), integrantes: String(r[m.integrantes]),
    seg: (r[m.seg] === '' || r[m.seg] === null) ? null : Number(r[m.seg]),
    situacao: String(r[m.situacao]), obs: String(r[m.obs]), ordem: i + 1
  }));
}
function listar_() {
  return { provas: lerProvas_(), pontos: lerPontos_(), inscricoes: lerInscricoes_(),
           titulo: SpreadsheetApp.getActiveSpreadsheet().getName() };
}

function linhaDoId_(sh, m, id) {
  const n = sh.getLastRow() - 1;
  if (n < 1) return -1;
  const ids = sh.getRange(2, m.id + 1, n, 1).getValues().map(r => String(r[0]));
  const i = ids.indexOf(String(id));
  return i < 0 ? -1 : i + 2;
}
function salvar_(p) {
  const sh = aba_(ABA.insc), m = mapa_(sh, COL);
  const linha = linhaDoId_(sh, m, p.id);
  if (linha < 0) return { ok: false, erro: 'nao_encontrado' };
  const set = (k, v) => sh.getRange(linha, m[k] + 1).setValue(v);
  if ('seg' in p) {
    const s = p.seg === '' ? '' : Number(p.seg);
    if (s !== '' && !isFinite(s)) return { ok: false, erro: 'tempo' };
    set('seg', s); sh.getRange(linha, m.tempo + 1).setNumberFormat('@').setValue(s === '' ? '' : formatarTempo(s));
  }
  if ('situacao' in p) { if (SITUACOES.indexOf(p.situacao) < 0) return { ok: false, erro: 'situacao' }; set('situacao', p.situacao); }
  ['obs', 'atleta', 'atletica', 'inst'].forEach(k => { if (k in p) set(k, p[k]); });
  set('atualizado', new Date());
  atualizarRanking_();
  return { ok: true };
}
function adicionar_(p) {
  if (!p.atleta || !p.provaId) return { ok: false, erro: 'dados' };
  const prova = lerProvas_().find(x => x.id === String(p.provaId));
  if (!prova) return { ok: false, erro: 'prova' };
  const sh = aba_(ABA.insc), m = mapa_(sh, COL);
  const ids = linhas_(sh).map(r => Number(r[m.id]) || 0);
  const novo = (ids.length ? Math.max.apply(null, ids) : 0) + 1;
  const linha = new Array(sh.getLastColumn()).fill('');
  linha[m.id] = novo; linha[m.provaId] = prova.id; linha[m.prova] = prova.nome;
  linha[m.atleta] = p.atleta; linha[m.atletica] = p.atletica || ''; linha[m.inst] = p.inst || '';
  linha[m.obs] = 'Incluído na página'; linha[m.atualizado] = new Date();
  sh.appendRow(linha);
  return { ok: true, id: String(novo) };
}
function remover_(id) {
  const sh = aba_(ABA.insc), m = mapa_(sh, COL);
  const linha = linhaDoId_(sh, m, id);
  if (linha < 0) return { ok: false, erro: 'nao_encontrado' };
  sh.deleteRow(linha);
  atualizarRanking_();
  return { ok: true };
}

// Grava as abas "Classificação" e "Ranking Geral" (só leitura, refeitas a cada lançamento).
function atualizarRanking_() {
  const d = listar_(), ss = SpreadsheetApp.getActiveSpreadsheet();
  const abaOuNova = n => ss.getSheetByName(n) || ss.insertSheet(n);
  const c = [['Prova', 'Class.', 'Atleta / Equipe', 'Atlética', 'Instituição', 'Tempo', 'Pontos', 'Observação']];
  d.provas.forEach(p => {
    const L = d.inscricoes.filter(e => e.provaId === p.id);
    classificarProva(L, p.revezamento ? d.pontos.revezamento : d.pontos.individual).forEach(r =>
      c.push([p.nome, r.rotulo, r.e.atleta, r.e.atletica, r.e.inst, formatarTempo(r.e.seg), r.pts, r.e.obs]));
  });
  const shc = abaOuNova(ABA.classif); shc.clearContents();
  shc.getRange(1, 1, c.length, c[0].length).setNumberFormat('@').setValues(c.map(l => l.map(String)));
  shc.getRange(2, 7, Math.max(c.length - 1, 1), 1).setNumberFormat('0');
  if (c.length > 1) shc.getRange(2, 7, c.length - 1, 1).setValues(c.slice(1).map(l => [Number(l[6])]));
  const NP = d.pontos.individual.length;
  const g = [['Posição', 'Atlética - Instituição', 'Pontos', 'W.O.'].concat(d.pontos.individual.map((_, i) => (i + 1) + 'º'))];
  rankingGeral(d.provas, d.inscricoes, d.pontos, 'Geral').forEach(t => g.push([t.pos, t.nome, t.pts, t.wo].concat(t.col)));
  const shg = abaOuNova(ABA.geral); shg.clearContents();
  shg.getRange(1, 1, g.length, 4 + NP).setValues(g);
}

function saida_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// ===== Regras de classificação (mesmas na página e no Apps Script) =====
// Empate: mesma posição, a seguinte é pulada. Desclassificado / W.O.: fim da lista, 0 ponto, não ocupa posição.
// Pontos por posição vêm da aba "Pontuação". Desempate do geral: pontos > menos W.O. > mais 1º, 2º ... 10º > nome.
var EPS_S = 0.0005;
function categoriaDaProva(nome) {
  var n = String(nome || '').toUpperCase();
  if (n.indexOf('FEMININO') >= 0) return 'Feminino';
  if (n.indexOf('MASCULINO') >= 0) return 'Masculino';
  return 'Misto';
}
function chaveEquipe(atletica, inst) {
  var a = String(atletica || '').trim(), i = String(inst || '').trim();
  return a && i ? a + ' - ' + i : (a || i);
}
function classificarProva(inscricoes, tabela) {
  var ok = inscricoes.filter(function (e) { return !e.situacao && typeof e.seg === 'number' && isFinite(e.seg); })
    .sort(function (a, b) { return a.seg - b.seg || a.ordem - b.ordem; });
  var fora = inscricoes.filter(function (e) { return !!e.situacao; })
    .sort(function (a, b) { var x = typeof a.seg === 'number' ? a.seg : 1e9, y = typeof b.seg === 'number' ? b.seg : 1e9; return x - y || a.ordem - b.ordem; });
  var out = [], prev = null;
  ok.forEach(function (e) {
    var pos = 1; ok.forEach(function (o) { if (o.seg < e.seg - EPS_S) pos++; });
    var empate = prev && Math.abs(prev.seg - e.seg) < EPS_S;
    out.push({ e: e, pos: pos, rotulo: empate ? '' : String(pos), pts: pos <= tabela.length ? (Number(tabela[pos - 1]) || 0) : 0 });
    prev = e;
  });
  fora.forEach(function (e) { out.push({ e: e, pos: null, rotulo: e.situacao === 'W.O.' ? 'W.O.' : 'DESC', pts: 0 }); });
  return out;
}
function rankingGeral(provas, inscricoes, pontos, filtro) {
  var NP = pontos.individual.length, mapa = {};
  function eq(k) { if (!mapa[k]) { mapa[k] = { nome: k, pts: 0, wo: 0, col: [] }; for (var i = 0; i < NP; i++) mapa[k].col.push(0); } return mapa[k]; }
  inscricoes.forEach(function (e) { var k = chaveEquipe(e.atletica, e.inst); if (k) eq(k); });
  provas.forEach(function (p) {
    if (filtro && filtro !== 'Geral' && categoriaDaProva(p.nome) !== filtro) return;
    var lista = inscricoes.filter(function (e) { return e.provaId === p.id; });
    classificarProva(lista, p.revezamento ? pontos.revezamento : pontos.individual).forEach(function (r) {
      var k = chaveEquipe(r.e.atletica, r.e.inst); if (!k) return;
      var t = eq(k); t.pts += r.pts;
      if (r.e.situacao === 'W.O.') t.wo++;
      if (r.pos && r.pos <= NP) t.col[r.pos - 1]++;
    });
  });
  var lista = Object.keys(mapa).map(function (k) { return mapa[k]; });
  function cmp(a, b, comNome) {
    if (a.pts !== b.pts) return b.pts - a.pts;
    if (a.wo !== b.wo) return a.wo - b.wo;
    for (var i = 0; i < NP; i++) if (a.col[i] !== b.col[i]) return b.col[i] - a.col[i];
    return comNome ? a.nome.localeCompare(b.nome, 'pt-BR') : 0;
  }
  lista.sort(function (a, b) { return cmp(a, b, true); });
  lista.forEach(function (t, i) { t.pos = (i > 0 && cmp(lista[i - 1], t, false) === 0) ? lista[i - 1].pos : i + 1; });
  return lista;
}
function formatarTempo(seg) {
  if (typeof seg !== 'number' || !isFinite(seg)) return '';
  var ms = Math.round(seg * 1000), m = Math.floor(ms / 60000), r = ms - m * 60000, s = Math.floor(r / 1000), f = r - s * 1000;
  var fr = String(f).padStart(3, '0');   // sempre 3 casas (milésimos)
  return (m ? m + ':' + String(s).padStart(2, '0') : String(s)) + ',' + fr;
}
