/**
 * Encomendas — envio de email e controlo de stock
 * Sábio Crescimento / Group Multifund
 *
 * O email é enviado por esta conta Google. A aplicação nunca tem acesso a
 * credenciais de correio: limita-se a pedir a este script que envie, e o
 * destinatário está fixo aqui, do lado do servidor.
 *
 * O stock vive também aqui, nas propriedades do script, para que todos os
 * telemóveis vejam o mesmo número. Cada encomenda enviada abate as
 * quantidades; às segundas-feiras repõe-se com o ficheiro do armazém
 * (função reporStock, no fim deste ficheiro, ou pela ação "repor" da app).
 *
 * ── Instalação (uma vez) ─────────────────────────────────────────────
 *  1. script.google.com → Novo projeto → colar este código
 *  2. Definições do projeto → Propriedades do script → propriedade TOKEN
 *     com o código gerado na página "gerador"
 *  3. Implementar → Nova implementação → tipo "Aplicação Web"
 *       Executar como .......: Eu (logistica@groupmultifund.pt)
 *       Quem tem acesso .....: Qualquer pessoa
 *  4. Autorizar quando pedido e copiar o URL da aplicação web
 * ─────────────────────────────────────────────────────────────────────
 */

// ═══════════ CONFIGURAÇÃO ═══════════
// O token não fica escrito aqui: está em Propriedades do script → TOKEN
const DESTINO     = 'logistica@sulfrio.pt';   // fornecedor — fixo, a app não o pode alterar
const CC          = '';                       // cópia interna (opcional)
const NOME        = 'Logística — Group Multifund';
const RESPONDER_A = 'logistica@groupmultifund.pt';
// ════════════════════════════════════

const P = PropertiesService.getScriptProperties();

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) return resposta({ ok: false, erro: 'pedido vazio' });

    const d = JSON.parse(e.postData.contents);
    if (!tokenValido(d.token)) return resposta({ ok: false, erro: 'nao autorizado' });

    // ---- consultar o stock ----
    if (d.accao === 'stock') return resposta({ ok: true, stock: lerStock() });

    // ---- repor o stock a partir do ficheiro do armazém ----
    if (d.accao === 'repor') {
      if (!d.stock || !d.stock.itens || !d.stock.itens.length) {
        return resposta({ ok: false, erro: 'stock vazio' });
      }
      gravarStock({ atualizado: d.stock.atualizado || '', itens: d.stock.itens });
      try { registar_(eventoReposicao_()); } catch (errReg) {}
      return resposta({ ok: true, stock: lerStock() });
    }

    // ---- teste de ligação: envia para a própria caixa, nunca para o fornecedor ----
    if (d.teste) {
      MailApp.sendEmail({
        to: RESPONDER_A, name: NOME,
        subject: 'Teste — app de encomendas',
        body: 'Se recebeu este email, a ligação da aplicação ao script está correta.'
      });
      return resposta({ ok: true, teste: true });
    }

    // ---- enviar encomenda ----
    if (!d.assunto || !d.texto) return resposta({ ok: false, erro: 'pedido incompleto' });
    if (d.texto.length > 100000) return resposta({ ok: false, erro: 'mensagem demasiado grande' });

    const opcoes = {
      to: DESTINO,
      subject: String(d.assunto).slice(0, 200),
      body: d.texto,
      name: NOME,
      replyTo: RESPONDER_A
    };
    if (CC) opcoes.cc = CC;
    if (d.html) opcoes.htmlBody = d.html;

    MailApp.sendEmail(opcoes);

    const stock = abater(d.linhas);   // só depois de o email seguir
    // regista a encomenda para o dashboard; nunca pode estragar uma encomenda que ja seguiu
    try { registar_(eventoEncomenda_(d)); } catch (errReg) {}
    return resposta({ ok: true, referencia: d.referencia || '', stock: stock });

  } catch (err) {
    return resposta({ ok: false, erro: String(err) });
  }
}

/** Permite confirmar no browser que o script está no ar. */
function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.o === 'stock') return leituraDashboard_(p);   // porta so de leitura do dashboard
  return resposta({ ok: true, servico: 'encomendas', restantes: MailApp.getRemainingDailyQuota() });
}

function tokenValido(recebido) {
  const guardado = P.getProperty('TOKEN');
  return !!guardado && !!recebido && recebido === guardado;
}

// ═══════════════════════ STOCK ═══════════════════════

function lerStock() {
  const bruto = P.getProperty('STOCK');
  if (!bruto) return { atualizado: '', itens: [] };
  try { return JSON.parse(bruto); } catch (err) { return { atualizado: '', itens: [] }; }
}

function gravarStock(s) {
  P.setProperty('STOCK', JSON.stringify(s));
}

/**
 * Abate as quantidades encomendadas. linhas: [{artigo, qtd}, ...]
 * Linhas sem artigo (produtos escritos à mão) são ignoradas.
 */
function abater(linhas) {
  if (!linhas || !linhas.length) return lerStock();

  const lock = LockService.getScriptLock();
  try { lock.waitLock(10000); } catch (err) { return lerStock(); }

  try {
    const s = lerStock();
    const porArtigo = {};
    s.itens.forEach(function (i) { porArtigo[String(i.artigo)] = i; });

    linhas.forEach(function (l) {
      const item = porArtigo[String(l.artigo)];
      const q = Number(l.qtd);
      if (item && q > 0) item.stock = Math.round((Number(item.stock) - q) * 1000) / 1000;
    });

    s.movimentado = new Date().toISOString().slice(0, 16).replace('T', ' ');
    gravarStock(s);
    return s;
  } finally {
    lock.releaseLock();
  }
}

/**
 * ═══ ATUALIZAÇÃO SEMANAL DO STOCK ═══
 * Substituir a lista abaixo pelos valores do ficheiro do armazém e correr
 * esta função uma vez (menu "Executar"). Não é preciso reimplementar nada:
 * os telemóveis apanham os valores novos na abertura seguinte.
 */
function reporStock() {
  gravarStock({
    atualizado: '2026-09-18',
    itens: [
      { artigo: '500', descricao: 'Choco Mongo 2 Cx', produto: 'Choco Mongo', tamanho: '2 Cx', stock: 66 },
      { artigo: '318', descricao: 'Choco Mongo 3 Cx', produto: 'Choco Mongo', tamanho: '3 Cx', stock: 450 },
      { artigo: '319', descricao: 'Choco Mongo 4 Cx', produto: 'Choco Mongo', tamanho: '4 Cx', stock: 695 }
    ]
  });
  try { registar_(eventoReposicao_()); } catch (errReg) {}
  Logger.log('Stock reposto: ' + P.getProperty('STOCK'));
}

/** Mostra o stock atual no registo de execução. */
function verStock() {
  Logger.log(P.getProperty('STOCK'));
}

// ═══════════════════════ auxiliares ═══════════════════════

function resposta(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Correr uma vez no editor para confirmar que o envio funciona. */
function testarEnvio() {
  MailApp.sendEmail({
    to: RESPONDER_A,
    subject: 'Teste — script de encomendas',
    body: 'Se recebeu este email, o script está a funcionar.',
    name: NOME
  });
}

// ═══════════════ REGISTO E LEITURA PELO DASHBOARD (01-10-2026) ═══════════════
/* Cada encomenda enviada e cada reposicao ficam registadas por mes nas
   propriedades do script (REG_aaaa-mm, e REG_aaaa-mm_2, _3... quando uma enche:
   cada propriedade aguenta cerca de 9 KB). Nao precisa de folha de calculo nem
   de autorizacoes novas. O dashboard le o stock e estes movimentos pela porta
   ?o=stock, com um codigo proprio (CODIGO_DASHBOARD) que so serve para ler:
   quem o tiver nao consegue enviar encomendas, isso continua a exigir o TOKEN. */

function agora_() {
  return Utilities.formatDate(new Date(), 'Europe/Lisbon', 'yyyy-MM-dd HH:mm');
}

function eventoEncomenda_(d) {
  const m = String(d.assunto || '').match(/(\d{2})\/(\d{2})\/(\d{4})/);
  const texto = String(d.texto || '');
  const i = texto.indexOf('OBSERVAÇÕES\n');
  const obs = i < 0 ? '' : texto.slice(i + 12).split('\n\n')[0].replace(/\s+/g, ' ').trim().slice(0, 80);
  const l = (d.linhas || [])
    .filter(function (x) { return x && x.artigo && Number(x.qtd) > 0; })
    .map(function (x) { return [String(x.artigo), Number(x.qtd)]; });
  return { t: agora_(), tipo: 'enc', ref: String(d.referencia || ''),
           para: m ? m[3] + '-' + m[2] + '-' + m[1] : '', obs: obs, l: l };
}

function eventoReposicao_() {
  const s = lerStock();
  return { t: agora_(), tipo: 'rep', ref: String(s.atualizado || ''),
           s: (s.itens || []).map(function (x) { return [String(x.artigo), Number(x.stock)]; }) };
}

function registar_(ev) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const mes = ev.t.slice(0, 7);
    for (let n = 1; n < 50; n++) {
      const chave = 'REG_' + mes + (n > 1 ? '_' + n : '');
      const bruto = P.getProperty(chave);
      const lista = bruto ? JSON.parse(bruto) : [];
      lista.push(ev);
      const txt = JSON.stringify(lista);
      if (txt.length < 8500 || lista.length === 1) { P.setProperty(chave, txt); return; }
    }
  } finally {
    lock.releaseLock();
  }
}

/** Movimentos dos ultimos meses, por ordem de data. */
function movimentos_(meses) {
  const hoje = new Date();
  const desde = Utilities.formatDate(new Date(hoje.getFullYear(), hoje.getMonth() - (meses - 1), 1), 'Europe/Lisbon', 'yyyy-MM');
  const todas = P.getProperties();
  let out = [];
  Object.keys(todas)
    .filter(function (k) { return k.indexOf('REG_') === 0 && k.slice(4, 11) >= desde; })
    .sort()
    .forEach(function (k) { try { out = out.concat(JSON.parse(todas[k])); } catch (err) {} });
  out.sort(function (a, b) { return a.t < b.t ? -1 : (a.t > b.t ? 1 : 0); });
  return out;
}

/* ?o=stock&codigo=XXXX[&cb=nome]  ->  stock actual e movimentos dos ultimos 3 meses.
   JSONP quando vem cb, porque o dashboard vive noutro dominio. */
function leituraDashboard_(p) {
  const guardado = P.getProperty('CODIGO_DASHBOARD');
  let saida;
  if (!guardado) saida = { ok: false, erro: 'porta por configurar' };
  else if (String(p.codigo || '') !== guardado) saida = { ok: false, erro: 'codigo' };
  else saida = { ok: true, stock: lerStock(), movimentos: movimentos_(3), lido: agora_() };
  const cb = String(p.cb || '');
  if (/^[A-Za-z_$][\w$]{0,60}$/.test(cb)) {
    return ContentService.createTextOutput(cb + '(' + JSON.stringify(saida) + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return resposta(saida);
}

/** Correr UMA vez no editor: cria o codigo so de leitura do dashboard e mostra-o no registo. */
function criarCodigoDashboard() {
  const v = Utilities.getUuid().replace(/-/g, '').toUpperCase().slice(0, 12);
  P.setProperty('CODIGO_DASHBOARD', v);
  Logger.log('Codigo do DASHBOARD: ' + v);
}
