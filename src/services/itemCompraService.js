import { getDb } from '../database/db';
import { validarItem, arredondar, ValidationError } from '../validators/validators';
import { recalcularTotal } from './compraService';

export async function listarItens(codigoCompra) {
  const db = await getDb();
  return db.getAllAsync(
    `SELECT i.*, p.NomeProduto, p.Preco
     FROM ItemCompra i JOIN Produto p ON p.CodigoProduto = i.CodigoProduto
     WHERE i.CodigoCompra = ? ORDER BY i.CodigoItem`,
    codigoCompra
  );
}

async function obterProduto(db, id) {
  const p = await db.getFirstAsync('SELECT * FROM Produto WHERE CodigoProduto = ?', id);
  if (!p) throw new ValidationError('Produto não encontrado.');
  return p;
}

function conferirEstoque(produto, quantidade) {
  if (produto.QtdEstoque < quantidade) {
    throw new ValidationError(
      `Estoque insuficiente para "${produto.NomeProduto}" (disponível: ${produto.QtdEstoque}).`
    );
  }
}

export async function adicionarItem(dados) {
  const v = validarItem(dados);
  const db = await getDb();
  let id;
  await db.withTransactionAsync(async () => {
    const compra = await db.getFirstAsync('SELECT 1 AS x FROM Compra WHERE CodigoCompra = ?', v.codigoCompra);
    if (!compra) throw new ValidationError('Compra não encontrada.');
    const produto = await obterProduto(db, v.codigoProduto);
    conferirEstoque(produto, v.quantidade);
    const r = await db.runAsync(
      'INSERT INTO ItemCompra (CodigoProduto, CodigoCompra, Quantidade, ValorParcial) VALUES (?, ?, ?, ?)',
      v.codigoProduto, v.codigoCompra, v.quantidade, arredondar(produto.Preco * v.quantidade)
    );
    id = r.lastInsertRowId;
    await db.runAsync(
      'UPDATE Produto SET QtdEstoque = QtdEstoque - ? WHERE CodigoProduto = ?',
      v.quantidade, v.codigoProduto
    );
    await recalcularTotal(db, v.codigoCompra);
  });
  return id;
}

export async function atualizarItem(codigoItem, dados) {
  const db = await getDb();
  const antigo = await db.getFirstAsync('SELECT * FROM ItemCompra WHERE CodigoItem = ?', codigoItem);
  if (!antigo) throw new ValidationError('Item não encontrado.');
  const v = validarItem({ ...dados, codigoCompra: antigo.CodigoCompra });

  await db.withTransactionAsync(async () => {
    // devolve o estoque do item antigo antes de conferir o novo
    await db.runAsync(
      'UPDATE Produto SET QtdEstoque = QtdEstoque + ? WHERE CodigoProduto = ?',
      antigo.Quantidade, antigo.CodigoProduto
    );
    const produto = await obterProduto(db, v.codigoProduto);
    conferirEstoque(produto, v.quantidade);
    await db.runAsync(
      'UPDATE ItemCompra SET CodigoProduto = ?, Quantidade = ?, ValorParcial = ? WHERE CodigoItem = ?',
      v.codigoProduto, v.quantidade, arredondar(produto.Preco * v.quantidade), codigoItem
    );
    await db.runAsync(
      'UPDATE Produto SET QtdEstoque = QtdEstoque - ? WHERE CodigoProduto = ?',
      v.quantidade, v.codigoProduto
    );
    await recalcularTotal(db, antigo.CodigoCompra);
  });
}

export async function excluirItem(codigoItem) {
  const db = await getDb();
  const item = await db.getFirstAsync('SELECT * FROM ItemCompra WHERE CodigoItem = ?', codigoItem);
  if (!item) throw new ValidationError('Item não encontrado.');
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      'UPDATE Produto SET QtdEstoque = QtdEstoque + ? WHERE CodigoProduto = ?',
      item.Quantidade, item.CodigoProduto
    );
    await db.runAsync('DELETE FROM ItemCompra WHERE CodigoItem = ?', codigoItem);
    await recalcularTotal(db, item.CodigoCompra);
  });
}
