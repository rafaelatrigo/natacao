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
  integrantes: 'Integrantes', baliza: 'Baliza', tempo: 'Tempo', seg: 'Tempo (s)', situacao: 'Situação', obs: 'Observação', atualizado: 'Atualizado em'
};
const SITUACOES = ['', 'Desclassificado', 'W.O.'];

// Lista oficial: JUS 2026 · Natação 4 raias (balizamento/súmulas ATUALIZADO, 19/11). Usada para montar a planilha.
// Linhas: [prova, atleta/equipe, atlética, instituição, integrantes, tempo em segundos, situação, observação, baliza]
// SEED_VERSAO: ao mudar este valor e reimplantar, as abas "Inscrições" e "Provas" são refeitas com a lista abaixo
// (APAGA os tempos lançados). Não mude no dia da competição.
const SEED_VERSAO = 'JUS2026-balizamento-atualizado-v1';
const SEED = {"provas":[["p01", "50M LIVRE FEMININO", "Não"],
  ["p02", "50M LIVRE MASCULINO", "Não"],
  ["p03", "50M PEITO FEMININO", "Não"],
  ["p04", "50M PEITO MASCULINO", "Não"],
  ["p05", "50M COSTAS FEMININO", "Não"],
  ["p06", "50M COSTAS MASCULINO", "Não"],
  ["p07", "50M BORBOLETA FEMININO", "Não"],
  ["p08", "50M BORBOLETA MASCULINO", "Não"],
  ["p09", "REVEZAMENTO MISTO", "Sim"]],"inscricoes":[["p01", "Janniky Mello", "ODONTOLOGIA", "FTC", "", null, "", "", "B1 · R1"],
  ["p01", "Amanda Brandão de Lima", "EDUCAÇÃO FÍSICA", "UFAL", "", null, "", "", "B1 · R2"],
  ["p01", "Iasmim de Oliveira Araujo", "SAÚDE", "UNEB", "", null, "", "", "B1 · R3"],
  ["p01", "STEPHANIE ALMEIDA DA SILVA SANTOS", "SAÚDE", "UCSAL", "", null, "", "", "B1 · R4"],
  ["p01", "Lízian Simões", "NUTRIÇÃO", "UNIFACS", "", null, "", "", "B2 · R1"],
  ["p01", "Clara Luz Sales Soares", "EDUCAÇÃO FÍSICA", "UNIJORGE", "", null, "", "", "B2 · R2"],
  ["p01", "Juliana", "NUTRIÇÃO", "UNIFACS", "", null, "", "", "B2 · R3"],
  ["p01", "Rebeca de Jesus Pereira", "SAÚDE", "UNEB", "", null, "", "", "B2 · R4"],
  ["p01", "Isabela Oliveira", "FISIOTERAPIA", "UNIFACS", "", null, "", "", "B3 · R1"],
  ["p01", "Vanessa de Medeiros Stabile", "PSICOLOGIA", "BAHIANA", "", null, "", "", "B3 · R2"],
  ["p01", "Eliziane Beatriz Oliveira", "EDUCAÇÃO FÍSICA", "UFAL", "", null, "", "", "B3 · R3"],
  ["p01", "Assa Oliveira Serpa", "EDUCAÇÃO FÍSICA", "UFAL", "", null, "", "", "B3 · R4"],
  ["p01", "Tayana Costa Pinto da Silva", "MEDICINA", "UFBA", "", null, "", "", "B4 · R1"],
  ["p01", "RAFAELA RECHMANN OLIVEIRA", "PSICOLOGIA", "UNIFACS", "", null, "", "", "B4 · R2"],
  ["p01", "Evelyn Maiana Caldas de Matos", "EDUCAÇÃO FÍSICA", "UNIJORGE", "", null, "", "", "B4 · R3"],
  ["p01", "MAYELLE ALMDEIDA DE OLIVEIRA", "SAÚDE", "UCSAL", "", null, "", "", "B4 · R4"],
  ["p01", "Nathalia Caribé Oliveira Macêdo", "EDUCAÇÃO FÍSICA", "BAHIANA", "", null, "", "", "B5 · R1"],
  ["p01", "LAIS DIAS PORTO", "SAÚDE", "UCSAL", "", null, "", "", "B5 · R2"],
  ["p01", "Leticia Liberato de Matos Reis Sánchez", "PSICOLOGIA", "BAHIANA", "", null, "", "", "B5 · R3"],
  ["p01", "Victória Morgana", "ODONTOLOGIA", "UNIME", "", null, "", "", "B5 · R4"],
  ["p01", "Marianna Quadros Sande", "ODONTOLOGIA", "UNIME", "", null, "", "", "B6 · R1"],
  ["p01", "Camila de carvalho nunes", "ODONTOLOGIA", "UNIME", "", null, "", "", "B6 · R2"],
  ["p02", "Edval Tenório Júnior", "ODONTOLOGIA", "FTC", "", null, "", "", "B1 · R1"],
  ["p02", "Luis Gustavo Silva Lacerda Brechó", "EDUCAÇÃO FÍSICA", "UFAL", "", null, "", "", "B1 · R2"],
  ["p02", "Joao pedro duarte", "NUTRIÇÃO", "UNIFACS", "", null, "", "", "B1 · R3"],
  ["p02", "Daniel Barreto Mattos Motta Galli", "PSICOLOGIA", "BAHIANA", "", null, "", "", "B1 · R4"],
  ["p02", "Lucas Chamusca", "NUTRIÇÃO", "UNIFACS", "", null, "", "", "B2 · R1"],
  ["p02", "Thiago lisboa da Conceição", "EDUCAÇÃO FÍSICA", "UNIJORGE", "", null, "", "", "B2 · R2"],
  ["p02", "HUGO DE SOUZA MENDES", "NUTRIÇÃO", "UFBA", "", null, "", "", "B2 · R3"],
  ["p02", "FERNANDO SANTANA DE SOUZA", "SAÚDE", "UCSAL", "", null, "", "", "B2 · R4"],
  ["p02", "Matheus Macedo Ornelas", "NUTRIÇÃO", "UFBA", "", null, "", "", "B3 · R1"],
  ["p02", "Ian Fontenele Matos", "FISIOTERAPIA", "UFBA", "", null, "", "", "B3 · R2"],
  ["p02", "Thiago da Silva Faria", "MEDICINA", "UFBA", "", null, "", "", "B3 · R3"],
  ["p02", "Darlan Henrique Morais Neves", "MEDICINA", "UFBA", "", null, "", "", "B3 · R4"],
  ["p02", "LUIS FERNANDO LIRIO DOS SANTOS NASCIMENTO", "FISIOTERAPIA", "UNIFACS", "", null, "", "", "B4 · R1"],
  ["p02", "Álvaro Lima Freitas Neto", "PSICOLOGIA", "BAHIANA", "", null, "", "", "B4 · R2"],
  ["p02", "Kauan Macedo Silva", "EDUCAÇÃO FÍSICA", "BAHIANA", "", null, "", "", "B4 · R3"],
  ["p02", "Thor Urbano e Silva", "EDUCAÇÃO FÍSICA", "BAHIANA", "", null, "", "", "B4 · R4"],
  ["p02", "Artur Costa Rebouças Nascimento", "MEDICINA", "UFBA", "", null, "", "", "B5 · R1"],
  ["p02", "LUCAS REIS MASCARENHAS", "SAÚDE", "UCSAL", "", null, "", "", "B5 · R2"],
  ["p02", "Rodrigo Alves Gaia", "EDUCAÇÃO FÍSICA", "UFAL", "", null, "", "", "B5 · R3"],
  ["p02", "Rodrigo Antonio Alves de Freitas Silva", "EDUCAÇÃO FÍSICA", "UFAL", "", null, "", "", "B5 · R4"],
  ["p02", "Diego Moisés Contreras Briceno", "EDUCAÇÃO FÍSICA", "BAHIANA", "", null, "", "", "B6 · R1"],
  ["p02", "Elesson santana do Bomfim", "SAÚDE", "UNEB", "", null, "", "", "B6 · R2"],
  ["p02", "João Lima Brito", "FISIOTERAPIA", "UFBA", "", null, "", "", "B6 · R3"],
  ["p02", "Ian de Hollanda Cavalcanti Brito", "PSICOLOGIA", "BAHIANA", "", null, "", "", "B6 · R4"],
  ["p02", "luis miguel de matos silva", "ODONTOLOGIA", "UNIME", "", null, "", "", "B7 · R1"],
  ["p02", "João pedro menezes andrade silva", "ODONTOLOGIA", "UNIME", "", null, "", "", "B7 · R2"],
  ["p02", "Yan Richard Ventura Barreto", "ODONTOLOGIA", "UNIME", "", null, "", "", "B7 · R3"],
  ["p03", "Janniky Mello", "ODONTOLOGIA", "FTC", "", null, "", "", "B1 · R1"],
  ["p03", "Nathalia Caribé Oliveira Macêdo", "EDUCAÇÃO FÍSICA", "BAHIANA", "", null, "", "", "B1 · R2"],
  ["p03", "RAFAELA RECHMANN OLIVEIRA", "PSICOLOGIA", "UNIFACS", "", null, "", "", "B1 · R3"],
  ["p03", "MARIA EDUARDA ARAÚJO COSTA", "SAÚDE", "UCSAL", "", null, "", "", "B1 · R4"],
  ["p03", "Lízian Simões", "NUTRIÇÃO", "UNIFACS", "", null, "", "", "B2 · R1"],
  ["p03", "Assa Oliveira Serpa", "EDUCAÇÃO FÍSICA", "UFAL", "", null, "", "", "B2 · R2"],
  ["p03", "MAYELLE ALMDEIDA DE OLIVEIRA", "SAÚDE", "UCSAL", "", null, "", "", "B2 · R3"],
  ["p03", "Victória Morgana", "ODONTOLOGIA", "UNIME", "", null, "", "", "B2 · R4"],
  ["p03", "Isabela Oliveira", "FISIOTERAPIA", "UNIFACS", "", null, "", "", "B3 · R1"],
  ["p03", "Clara Luz Sales Soares", "EDUCAÇÃO FÍSICA", "UNIJORGE", "", null, "", "", "B3 · R2"],
  ["p03", "Rebeca de Jesus Pereira", "SAÚDE", "UNEB", "", null, "", "", "B3 · R3"],
  ["p03", "Marianna Quadros Sande", "ODONTOLOGIA", "UNIME", "", null, "", "", "B3 · R4"],
  ["p03", "Tayana Costa Pinto da Silva", "MEDICINA", "UFBA", "", null, "", "", "B4 · R1"],
  ["p03", "Vanessa de Medeiros Stabile", "PSICOLOGIA", "BAHIANA", "", null, "", "", "B4 · R2"],
  ["p03", "Leticia Liberato de Matos Reis Sánchez", "PSICOLOGIA", "BAHIANA", "", null, "", "", "B4 · R3"],
  ["p03", "Camila de carvalho nunes", "ODONTOLOGIA", "UNIME", "", null, "", "", "B4 · R4"],
  ["p04", "Felipe Braga Antunes de Azevedo", "ODONTOLOGIA", "FTC", "", null, "", "", "B1 · R1"],
  ["p04", "Kauan Macedo Silva", "EDUCAÇÃO FÍSICA", "BAHIANA", "", null, "", "", "B1 · R2"],
  ["p04", "LUÍS RICARDO DA SILVA", "SAÚDE", "UCSAL", "", null, "", "", "B1 · R3"],
  ["p04", "Daniel Barreto Mattos Motta Galli", "PSICOLOGIA", "BAHIANA", "", null, "", "", "B1 · R4"],
  ["p04", "Lucas Chamusca", "NUTRIÇÃO", "UNIFACS", "", null, "", "", "B2 · R1"],
  ["p04", "Luis Gustavo Silva Lacerda Brechó", "EDUCAÇÃO FÍSICA", "UFAL", "", null, "", "", "B2 · R2"],
  ["p04", "HUGO DE SOUZA MENDES", "NUTRIÇÃO", "UFBA", "", null, "", "", "B2 · R3"],
  ["p04", "LUCAS REIS MASCARENHAS", "SAÚDE", "UCSAL", "", null, "", "", "B2 · R4"],
  ["p04", "Matheus Macedo Ornelas", "NUTRIÇÃO", "UFBA", "", null, "", "", "B3 · R1"],
  ["p04", "Thiago lisboa da Conceição", "EDUCAÇÃO FÍSICA", "UNIJORGE", "", null, "", "", "B3 · R2"],
  ["p04", "Victor Fernando de Souza Oliveira", "MEDICINA", "UFBA", "", null, "", "", "B3 · R3"],
  ["p04", "Thor Urbano e Silva", "EDUCAÇÃO FÍSICA", "BAHIANA", "", null, "", "", "B3 · R4"],
  ["p04", "MARCOS PAULO MERCÊS SANTOS", "FISIOTERAPIA", "UNIFACS", "", null, "", "", "B4 · R1"],
  ["p04", "Ian Fontenele Matos", "FISIOTERAPIA", "UFBA", "", null, "", "", "B4 · R2"],
  ["p04", "Diego Moisés Contreras Briceno", "EDUCAÇÃO FÍSICA", "BAHIANA", "", null, "", "", "B4 · R3"],
  ["p04", "Diogo Ferreira Rogério de Souza", "PSICOLOGIA", "BAHIANA", "", null, "", "", "B4 · R4"],
  ["p04", "Thiago da Silva Faria", "MEDICINA", "UFBA", "", null, "", "", "B5 · R1"],
  ["p04", "Álvaro Lima Freitas Neto", "PSICOLOGIA", "BAHIANA", "", null, "", "", "B5 · R2"],
  ["p04", "João Lima Brito", "FISIOTERAPIA", "UFBA", "", null, "", "", "B5 · R3"],
  ["p04", "luis miguel de matos silva", "ODONTOLOGIA", "UNIME", "", null, "", "", "B5 · R4"],
  ["p04", "João pedro menezes andrade silva", "ODONTOLOGIA", "UNIME", "", null, "", "", "B6 · R1"],
  ["p04", "Yan Richard Ventura Barreto", "ODONTOLOGIA", "UNIME", "", null, "", "", "B6 · R2"],
  ["p05", "Janniky Mello", "ODONTOLOGIA", "FTC", "", null, "", "", "B1 · R1"],
  ["p05", "Nathalia Caribé Oliveira Macêdo", "EDUCAÇÃO FÍSICA", "BAHIANA", "", null, "", "", "B1 · R2"],
  ["p05", "Vanessa de Medeiros Stabile", "PSICOLOGIA", "BAHIANA", "", null, "", "", "B1 · R3"],
  ["p05", "Andressa da Silva Alves", "EDUCAÇÃO FÍSICA", "UFAL", "", null, "", "", "B1 · R4"],
  ["p05", "Lízian Simões", "NUTRIÇÃO", "UNIFACS", "", null, "", "", "B2 · R1"],
  ["p05", "Amanda Brandão de Lima", "EDUCAÇÃO FÍSICA", "UFAL", "", null, "", "", "B2 · R2"],
  ["p05", "RAFAELA RECHMANN OLIVEIRA", "PSICOLOGIA", "UNIFACS", "", null, "", "", "B2 · R3"],
  ["p05", "Leticia Liberato de Matos Reis Sánchez", "PSICOLOGIA", "BAHIANA", "", null, "", "", "B2 · R4"],
  ["p05", "Isabela Oliveira", "FISIOTERAPIA", "UNIFACS", "", null, "", "", "B3 · R1"],
  ["p05", "Clara Luz Sales Soares", "EDUCAÇÃO FÍSICA", "UNIJORGE", "", null, "", "", "B3 · R2"],
  ["p05", "Naielly Teixeira Santos Teotonio", "SAÚDE", "UCSAL", "", null, "", "", "B3 · R3"],
  ["p05", "LAIS DIAS PORTO", "SAÚDE", "UCSAL", "", null, "", "", "B3 · R4"],
  ["p05", "Victória Morgana", "ODONTOLOGIA", "UNIME", "", null, "", "", "B4 · R1"],
  ["p06", "Felipe Braga Antunes de Azevedo", "ODONTOLOGIA", "FTC", "", null, "", "", "B1 · R1"],
  ["p06", "Ian Fontenele Matos", "FISIOTERAPIA", "UFBA", "", null, "", "", "B1 · R2"],
  ["p06", "Kauan Macedo Silva", "EDUCAÇÃO FÍSICA", "BAHIANA", "", null, "", "", "B1 · R3"],
  ["p06", "JOÃO PAULO DA CRUZ BONFIM", "SAÚDE", "UCSAL", "", null, "", "", "B1 · R4"],
  ["p06", "Thor Urbano e Silva", "EDUCAÇÃO FÍSICA", "BAHIANA", "", null, "", "", "B2 · R1"],
  ["p06", "Daniel Barreto Mattos Motta Galli", "PSICOLOGIA", "BAHIANA", "", null, "", "", "B2 · R2"],
  ["p06", "Rodrigo Alves Gaia", "EDUCAÇÃO FÍSICA", "UFAL", "", null, "", "", "B2 · R3"],
  ["p06", "Diego Moisés Contreras Briceno", "EDUCAÇÃO FÍSICA", "BAHIANA", "", null, "", "", "B2 · R4"],
  ["p06", "Luis Gustavo Silva Lacerda Brechó", "EDUCAÇÃO FÍSICA", "UFAL", "", null, "", "", "B3 · R1"],
  ["p06", "LUÍS RICARDO DA SILVA", "SAÚDE", "UCSAL", "", null, "", "", "B3 · R2"],
  ["p06", "Diogo Ferreira Rogério de Souza", "PSICOLOGIA", "BAHIANA", "", null, "", "", "B3 · R3"],
  ["p06", "Ian de Hollanda Cavalcanti Brito", "PSICOLOGIA", "BAHIANA", "", null, "", "", "B3 · R4"],
  ["p06", "luis miguel de matos silva", "ODONTOLOGIA", "UNIME", "", null, "", "", "B4 · R1"],
  ["p07", "Janniky Mello", "ODONTOLOGIA", "FTC", "", null, "", "", "B1 · R1"],
  ["p07", "Isabela Oliveira", "FISIOTERAPIA", "UNIFACS", "", null, "", "", "B1 · R2"],
  ["p07", "Vanessa de Medeiros Stabile", "PSICOLOGIA", "BAHIANA", "", null, "", "", "B1 · R3"],
  ["p07", "Leticia Liberato de Matos Reis Sánchez", "PSICOLOGIA", "BAHIANA", "", null, "", "", "B1 · R4"],
  ["p07", "Lízian Simões", "NUTRIÇÃO", "UNIFACS", "", null, "", "", "B2 · R1"],
  ["p07", "Nathalia Caribé Oliveira Macêdo", "EDUCAÇÃO FÍSICA", "BAHIANA", "", null, "", "", "B2 · R2"],
  ["p07", "Naielly Teixeira Santos Teotonio", "SAÚDE", "UCSAL", "", null, "", "", "B2 · R3"],
  ["p07", "Victória Morgana", "ODONTOLOGIA", "UNIME", "", null, "", "", "B2 · R4"],
  ["p08", "Edval Tenório Júnior", "ODONTOLOGIA", "FTC", "", null, "", "", "B1 · R1"],
  ["p08", "Thiago lisboa da Conceição", "EDUCAÇÃO FÍSICA", "UNIJORGE", "", null, "", "", "B1 · R2"],
  ["p08", "Thor Urbano e Silva", "EDUCAÇÃO FÍSICA", "BAHIANA", "", null, "", "", "B1 · R3"],
  ["p08", "Diego Moisés Contreras Briceno", "EDUCAÇÃO FÍSICA", "BAHIANA", "", null, "", "", "B1 · R4"],
  ["p08", "Matheus Macedo Ornelas", "NUTRIÇÃO", "UFBA", "", null, "", "", "B2 · R1"],
  ["p08", "Ian Fontenele Matos", "FISIOTERAPIA", "UFBA", "", null, "", "", "B2 · R2"],
  ["p08", "João Lima Brito", "FISIOTERAPIA", "UFBA", "", null, "", "", "B2 · R3"],
  ["p08", "luis miguel de matos silva", "ODONTOLOGIA", "UNIME", "", null, "", "", "B2 · R4"],
  ["p08", "Kauan Macedo Silva", "EDUCAÇÃO FÍSICA", "BAHIANA", "", null, "", "", "B3 · R1"],
  ["p08", "Álvaro Lima Freitas Neto", "PSICOLOGIA", "BAHIANA", "", null, "", "", "B3 · R2"],
  ["p08", "Diogo Ferreira Rogério de Souza", "PSICOLOGIA", "BAHIANA", "", null, "", "", "B3 · R3"],
  ["p08", "Luis Gustavo Silva Lacerda Brechó", "EDUCAÇÃO FÍSICA", "UFAL", "", null, "", "", "B4 · R1"],
  ["p08", "LUÍS RICARDO DA SILVA", "SAÚDE", "UCSAL", "", null, "", "", "B4 · R2"],
  ["p08", "JOÃO PAULO DA CRUZ BONFIM", "SAÚDE", "UCSAL", "", null, "", "", "B4 · R3"],
  ["p09", "ODONTOLOGIA - FTC", "ODONTOLOGIA", "FTC", "Janniky Mello, Felipe Braga Antunes de Azevedo, Edval Tenório Júnior", null, "", "", "B1 · R1"],
  ["p09", "NUTRIÇÃO - UNIFACS", "NUTRIÇÃO", "UNIFACS", "Lízian Simões, Juliana, Lucas Chamusca, Joao pedro duarte", null, "", "", "B1 · R2"],
  ["p09", "EDUCAÇÃO FÍSICA - UFAL", "EDUCAÇÃO FÍSICA", "UFAL", "Amanda Brandão de Lima, Eliziane Beatriz Oliveira, Luis Gustavo Silva Lacerda Brechó, Rodrigo Antonio Alves de Freitas Silva · Reservas: Assa Oliveira Serpa, Rodrigo Alves Gaia", null, "", "", "B1 · R3"],
  ["p09", "ODONTOLOGIA - UNIME", "ODONTOLOGIA", "UNIME", "Marianna Quadros Sande, Victória Morgana, luis miguel de matos silva, Yan Richard Ventura Barreto · Reservas: João pedro menezes andrade silva, Camila de carvalho nunes", null, "", "", "B1 · R4"],
  ["p09", "PSICOLOGIA - BAHIANA", "PSICOLOGIA", "BAHIANA", "Leticia Liberato de Matos Reis Sánchez, Vanessa de Medeiros Stabile, Álvaro Lima Freitas Neto, Daniel Barreto Mattos Motta Galli", null, "", "", "B2 · R1"],
  ["p09", "PSICOLOGIA - UNIFACS", "PSICOLOGIA", "UNIFACS", "Alice Roni, RAFAELA RECHMANN OLIVEIRA, WELBERT DE JESUSBDA COSTA · Reservas: JOAO PAULO BORGES COSTA", null, "", "", "B2 · R2"],
  ["p09", "SAÚDE - UCSAL", "SAÚDE", "UCSAL", "MARIA EDUARDA ARAÚJO COSTA, Naielly Teixeira Santos Teotonio, FERNANDO SANTANA DE SOUZA, LUÍS RICARDO DA SILVA · Reservas: JOÃO PAULO DA CRUZ BONFIM, JUAN COHIM MANCIOLA SILVA", null, "", "", "B2 · R3"]]};

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
      case 'pontos':    return saida_(comLock_(() => salvarPontos_(p)));
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
  if (props.getProperty('pronta') === '1' && props.getProperty('seed') === SEED_VERSAO && ss.getSheetByName(ABA.insc) && ss.getSheetByName(ABA.provas) && ss.getSheetByName(ABA.pontos)) return;
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    if (props.getProperty('seed') !== SEED_VERSAO) {   // lista nova: refaz Inscrições e Provas
      [ABA.insc, ABA.provas, ABA.pontos, ABA.classif, ABA.geral].forEach(n => { const sh = ss.getSheetByName(n); if (sh) { sh.clearContents(); try { sh.getRange('A:Z').clearDataValidations(); } catch (e) {} } });
    }
    const cabec = (sh, cols) => { sh.getRange(1, 1, 1, cols.length).setValues([cols]).setFontWeight('bold').setFontColor('#ffffff').setBackground('#0F5876'); sh.setFrozenRows(1); };
    let insc = ss.getSheetByName(ABA.insc);
    if (!insc) {
      const s0 = ss.getSheets()[0];
      insc = (s0.getLastRow() === 0 && s0.getName() !== ABA.provas) ? s0.setName(ABA.insc) : ss.insertSheet(ABA.insc, 0);
    }
    const colsI = [COL.id, COL.provaId, COL.prova, COL.baliza, COL.atleta, COL.atletica, COL.inst, COL.integrantes, COL.tempo, COL.seg, COL.situacao, COL.obs, COL.atualizado];
    let provas = ss.getSheetByName(ABA.provas) || ss.insertSheet(ABA.provas);
    if (provas.getLastRow() === 0) {
      cabec(provas, ['Ordem', 'ID', 'Prova', 'Revezamento']);
      if (SEED.provas.length) provas.getRange(2, 1, SEED.provas.length, 4).setValues(SEED.provas.map((p, i) => [i + 1, p[0], p[1], p[2]]));
      provas.setColumnWidth(3, 280);
    }
    if (insc.getLastRow() === 0) {
      cabec(insc, colsI);
      const nomes = {}; SEED.provas.forEach(p => nomes[p[0]] = p[1]);
      insc.getRange('I:I').setNumberFormat('@');
      if (SEED.inscricoes.length) insc.getRange(2, 1, SEED.inscricoes.length, colsI.length)
        .setValues(SEED.inscricoes.map((r, i) => [i + 1, r[0], nomes[r[0]] || '', r[8] || '', r[1], r[2], r[3], r[4],
          typeof r[5] === 'number' ? formatarTempo(r[5]) : '', typeof r[5] === 'number' ? r[5] : '', r[6] || '', r[7] || '', '']));
      insc.getRange('I:I').setNumberFormat('@');
      insc.getRange('M:M').setNumberFormat('dd/mm/yyyy hh:mm');
      insc.getRange('K2:K').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['Desclassificado', 'W.O.'], true).setAllowInvalid(false).build());
      [60, 70, 230, 80, 280, 140, 110, 320, 80, 80, 120, 220, 130].forEach((w, i) => insc.setColumnWidth(i + 1, w));
    }
    let pts = ss.getSheetByName(ABA.pontos) || ss.insertSheet(ABA.pontos);
    if (pts.getLastRow() === 0) {
      cabec(pts, ['Posição', 'Individual', 'Revezamento']);
      const ind = [20, 13, 9, 7, 4, 3, 2, 1];   // pontuação oficial JUS 2026
      pts.getRange(2, 1, ind.length, 3).setValues(ind.map((v, i) => [i + 1, v, '=B' + (i + 2) + '*2']));
      pts.getRange('E1').setValue('Pontuação JUS 2026: do 1º ao 8º lugar (20-13-9-7-4-3-2-1); revezamento em dobro (fórmula). Pode alterar aqui ou na aba Regras da página, no modo edição.');
      pts.setColumnWidth(5, 520); pts.getRange('E1').setWrap(true);
    }
    props.setProperty('pronta', '1'); props.setProperty('seed', SEED_VERSAO);
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
    if (i < 0 && k === 'baliza') { m[k] = -1; return; }
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
    inst: String(r[m.inst]), integrantes: String(r[m.integrantes]), baliza: m.baliza < 0 ? '' : String(r[m.baliza]),
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

// Troca a tabela de pontuação (aba "Pontuação"). ind/rev: valores separados por vírgula; dobro=1 grava o revezamento como fórmula =B*2.
function salvarPontos_(p) {
  const num = t => String(t || '').split(',').filter(x => x.trim() !== '').map(Number);
  const ind = num(p.ind), dobro = p.dobro === '1', rev = dobro ? [] : num(p.rev);
  if (!ind.length || ind.length > 30 || ind.some(v => !isFinite(v) || v < 0)) return { ok: false, erro: 'pontos' };
  if (!dobro && (rev.length !== ind.length || rev.some(v => !isFinite(v) || v < 0))) return { ok: false, erro: 'pontos' };
  const sh = aba_(ABA.pontos), m = mapa_(sh, { pos: 'Posição', ind: 'Individual', rev: 'Revezamento' });
  const n = Math.max(sh.getLastRow() - 1, 0);
  const ncol = Math.max(m.pos, m.ind, m.rev) + 1;
  if (n) { const r = sh.getRange(2, 1, n, ncol); r.clearContent(); r.setValues(Array.from({ length: n }, () => new Array(ncol).fill(''))); }
  const linhas = ind.map((v, i) => { const l = new Array(ncol).fill(''); l[m.pos] = i + 1; l[m.ind] = v;
    l[m.rev] = dobro ? '=' + String.fromCharCode(65 + m.ind) + (i + 2) + '*2' : rev[i]; return l; });
  sh.getRange(2, 1, linhas.length, ncol).setValues(linhas);
  SpreadsheetApp.flush();
  atualizarRanking_();
  return { ok: true, pontos: lerPontos_() };
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
