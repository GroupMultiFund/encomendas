# Encomendas — Sábio Crescimento / Group Multifund

Aplicação web para fazer encomendas a fornecedor a partir do telemóvel.
Campos por linha: **nome do produto**, **tamanho** e **quantidade**.
O email sai de `logistica@groupmultifund.pt` para o fornecedor.

## Ficheiros

| Ficheiro | Para que serve |
|---|---|
| `index.html` | A aplicação |
| `gerador.html` | Cifra a ligação de envio com a password (usar uma vez) |
| `Codigo.gs` | Script Google que envia os emails |
| `sw.js` | Faz a app funcionar sem rede e atualizar-se sozinha |
| `manifest.webmanifest`, `icon-*.png` | Ícone e instalação no ecrã principal |

## Como está protegido

- **Login com utilizador e password** no arranque.
- O endereço do script de envio e o seu token **não existem em claro** nesta página: estão
  cifrados com AES-GCM 256, com chave derivada do utilizador e password por PBKDF2-SHA256
  (310 000 iterações). Sem as credenciais corretas o bloco é indecifrável.
- O **destinatário está fixo no script**, do lado do servidor. A aplicação não o pode alterar,
  por isso ninguém consegue usar esta página para enviar correio para outro lado.
- O histórico e as sugestões guardados no telemóvel também ficam **cifrados** com a mesma chave.

A password nunca é guardada em lado nenhum — nem no ficheiro, nem no telemóvel, nem no servidor.
Se a perder, gera-se um cofre novo.

## Atualizar a aplicação

Basta substituir os ficheiros neste repositório. Os telemóveis apanham a versão nova na abertura
seguinte e mostram o aviso "Nova versão disponível".
