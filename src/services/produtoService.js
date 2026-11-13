import { getDb } from '../database/db';
import { validarProduto, ValidationError } from '../validators/validators';

export async function listarProdutos() {
  const db = await getDb();
  return db.getAllAsync('SELECT * FROM Produto ORDER BY NomeProduto');
}

export async function buscarProduto(id) {
  const db = await getDb();
  return db.getFirstAsync('SELECT * FROM Produto WHERE CodigoProduto = ?', id);
}

export async function criarProduto(dados) {
  const v = validarProduto(dados);
  const db = await getDb();
  const r = await db.runAsync(
    'INSERT INTO Produto (NomeProduto, Tipo, Preco, QtdEstoque) VALUES (?, ?, ?, ?)',
    v.nome, v.tipo, v.preco, v.estoque
  );
  return r.lastInsertRowId;
}

export async function atualizarProduto(id, dados) {
  const v = validarProduto(dados);
  const db = await getDb();
  if (!(await buscarProduto(id))) throw new ValidationError('Produto não encontrado.');
  await db.runAsync(
    'UPDATE Produto SET NomeProduto = ?, Tipo = ?, Preco = ?, QtdEstoque = ? WHERE CodigoProduto = ?',
    v.nome, v.tipo, v.preco, v.estoque, id
  );
}

export async function excluirProduto(id) {
  const db = await getDb();
  if (!(await buscarProduto(id))) throw new ValidationError('Produto não encontrado.');
  const item = await db.getFirstAsync('SELECT 1 AS x FROM ItemCompra WHERE CodigoProduto = ?', id);
  if (item) throw new ValidationError('Não é possível excluir: o produto já foi vendido em alguma compra.');
  await db.runAsync('DELETE FROM Produto WHERE CodigoProduto = ?', id);
}
