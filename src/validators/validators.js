export class ValidationError extends Error {
  constructor(erros) {
    const lista = Array.isArray(erros) ? erros : [String(erros)];
    super(lista.join('\n'));
    this.name = 'ValidationError';
    this.erros = lista;
  }
}

const texto = (v) => (v ?? '').toString().trim();
const numero = (v) => {
  const s = texto(v).replace(',', '.');
  return s === '' ? NaN : Number(s);
};
const pad = (n) => String(n).padStart(2, '0');

export const arredondar = (v) => Math.round(v * 100) / 100;

// ---------- Datas (tela usa DD/MM/AAAA, banco guarda AAAA-MM-DD) ----------
export function hojeBR() {
  const d = new Date();
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export function brParaISO(s) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto(s));
  if (!m) return null;
  const [, d, mo, y] = m;
  const dt = new Date(Number(y), Number(mo) - 1, Number(d));
  const ok =
    dt.getFullYear() === Number(y) && dt.getMonth() === Number(mo) - 1 && dt.getDate() === Number(d);
  return ok ? `${y}-${mo}-${d}` : null;
}

export function isoParaBR(iso) {
  const [y, m, d] = String(iso).split('-');
  return `${d}/${m}/${y}`;
}

// ---------- Validações ----------
export function validarCliente({ nome, rg, telefone }) {
  const erros = [];
  const n = texto(nome);
  const r = texto(rg);
  const t = texto(telefone);

  if (!n) erros.push('Nome é obrigatório.');
  else if (n.length > 50) erros.push('Nome deve ter no máximo 50 caracteres.');

  if (!r) erros.push('RG é obrigatório.');
  else if (!/^\d{1,10}$/.test(r)) erros.push('RG deve conter apenas números (máximo 10 dígitos).');

  if (!t) erros.push('Telefone é obrigatório.');
  else {
    if (t.length > 14) erros.push('Telefone deve ter no máximo 14 caracteres.');
    if (!/^[\d()\-\s+]+$/.test(t)) erros.push('Telefone contém caracteres inválidos.');
    const digitos = t.replace(/\D/g, '').length;
    if (digitos < 10 || digitos > 11) erros.push('Telefone deve ter 10 ou 11 dígitos (com DDD).');
  }

  if (erros.length) throw new ValidationError(erros);
  return { nome: n, rg: Number(r), telefone: t };
}

export function validarProduto({ nome, tipo, preco, estoque }) {
  const erros = [];
  const n = texto(nome);
  const t = texto(tipo);
  const p = numero(preco);
  const e = texto(estoque);

  if (!n) erros.push('Nome do produto é obrigatório.');
  else if (n.length > 50) erros.push('Nome do produto deve ter no máximo 50 caracteres.');

  if (!t) erros.push('Tipo é obrigatório.');
  else if (t.length > 50) erros.push('Tipo deve ter no máximo 50 caracteres.');

  if (!Number.isFinite(p)) erros.push('Preço inválido.');
  else if (p <= 0) erros.push('Preço deve ser maior que zero.');

  if (!/^\d+$/.test(e)) erros.push('Estoque deve ser um número inteiro maior ou igual a zero.');

  if (erros.length) throw new ValidationError(erros);
  return { nome: n, tipo: t, preco: arredondar(p), estoque: Number(e) };
}

export function validarCompra({ codigoCliente, data }) {
  const erros = [];
  const c = Number(codigoCliente);
  if (!Number.isInteger(c) || c <= 0) erros.push('Selecione um cliente.');
  const iso = brParaISO(data);
  if (!iso) erros.push('Data inválida. Use o formato DD/MM/AAAA.');
  if (erros.length) throw new ValidationError(erros);
  return { codigoCliente: c, dataISO: iso };
}

export function validarItem({ codigoCompra, codigoProduto, quantidade }) {
  const erros = [];
  const compra = Number(codigoCompra);
  const produto = Number(codigoProduto);
  const q = texto(quantidade);
  if (!Number.isInteger(compra) || compra <= 0) erros.push('Compra inválida.');
  if (!Number.isInteger(produto) || produto <= 0) erros.push('Selecione um produto.');
  if (!/^\d+$/.test(q) || Number(q) < 1) erros.push('Quantidade deve ser um inteiro maior que zero.');
  if (erros.length) throw new ValidationError(erros);
  return { codigoCompra: compra, codigoProduto: produto, quantidade: Number(q) };
}
