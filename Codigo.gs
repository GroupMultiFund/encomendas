/**
 * Encomendas — envio de email a partir da conta Google
 * Sábio Crescimento / Group Multifund
 *
 * O email é enviado por esta conta Google. A aplicação nunca tem acesso a
 * credenciais de correio: limita-se a pedir a este script que envie, e o
 * destinatário está fixo aqui, do lado do servidor.
 *
 * ── Instalação (uma vez) ─────────────────────────────────────────────
 *  1. script.google.com → Novo projeto → colar este código
 *  2. Substituir TOKEN pelo código gerado na página "gerador"
 *  3. Implementar → Nova implementação → tipo "Aplicação Web"
 *       Executar como .......: Eu (logistica@groupmultifund.pt)
 *       Quem tem acesso .....: Qualquer pessoa
 *  4. Autorizar quando pedido e copiar o URL da aplicação web
 *  5. Colar o URL e o token no gerador do cofre
 * ─────────────────────────────────────────────────────────────────────
 */

// ═══════════ CONFIGURAÇÃO ═══════════
const TOKEN    = 'COLE-AQUI-O-TOKEN';        // tem de ser igual ao do cofre da aplicação
const DESTINO  = 'logistica@sulfrio.pt';     // fornecedor — fixo, a app não o pode alterar
const CC       = '';                         // cópia interna (opcional)
const NOME     = 'Logística — Group Multifund';
const RESPONDER_A = 'logistica@groupmultifund.pt';
const FOLHA_REGISTO = '';                    // opcional: ID de uma folha de cálculo para registar as encomendas
// ════════════════════════════════════

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) return resposta({ ok: false, erro: 'pedido vazio' });

    const d = JSON.parse(e.postData.contents);

    if (!d.token || d.token !== TOKEN)   return resposta({ ok: false, erro: 'nao autorizado' });

    // teste de ligação: envia para a própria caixa, nunca para o fornecedor
    if (d.teste) {
      MailApp.sendEmail({
        to: RESPONDER_A, name: NOME,
        subject: 'Teste — app de encomendas',
        body: 'Se recebeu este email, a ligação da aplicação ao script está correta.'
      });
      return resposta({ ok: true, teste: true });
    }

    if (!d.assunto || !d.texto)          return resposta({ ok: false, erro: 'pedido incompleto' });
    if (d.texto.length > 100000)         return resposta({ ok: false, erro: 'mensagem demasiado grande' });

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
    registar(d);

    return resposta({ ok: true, referencia: d.referencia || '' });

  } catch (err) {
    return resposta({ ok: false, erro: String(err) });
  }
}

/** Permite confirmar no browser que o script está no ar. */
function doGet() {
  return resposta({ ok: true, servico: 'encomendas', restantes: MailApp.getRemainingDailyQuota() });
}

/** Registo opcional das encomendas numa folha de cálculo. */
function registar(d) {
  if (!FOLHA_REGISTO) return;
  try {
    const folha = SpreadsheetApp.openById(FOLHA_REGISTO).getSheets()[0];
    folha.appendRow([new Date(), d.referencia || '', d.assunto || '', d.texto || '']);
  } catch (err) {
    // um problema no registo nunca deve impedir o envio da encomenda
  }
}

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
