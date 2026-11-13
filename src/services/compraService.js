import { getDb } from '../database/db';
import { validarCompra, ValidationError } from '../validators/validators';

export async function listarCompras() {
  const db = await getDb();
  return db.getAllAsync(`
    SELECT c.*, cl.Nome AS NomeCliente
    FROM Compra c JOIN Cliente cl ON cl.CodigoCliente = c.CodigoCliente
    ORDER BY c.DataCompra DESC, c.CodigoCompra DESC`);
}

export async function buscarCompra(id) {
  const db = await getDb();
  return db.getFirstAsync('SELECT * FROM Compra WHERE CodigoCompra = ?', id);
}

/** Valor Total = soma dos Valores Parciais dos itens. Chamado sempre que os itens mudam. */
export async function recalcularTotal(db, codigoCompra) {
  await db.runAsync(
    `UPDATE Compra SET ValorTotal = COALESCE(
       (SELECT ROUND(SUM(ValorParcial), 2) FROM ItemCompra WHERE CodigoCompra = ?), 0)
     WHERE CodigoCompra = ?`,
    codigoCompra, codigoCompra
  );
}

async function garantirCliente(db, id) {
  const c = await db.getFirstAsync('SELECT 1 AS x FROM Cliente WHERE CodigoCliente = ?', id);
  if (!c) throw new ValidationError('Cliente não encontrado.');
}

export async function criarCompra(dados) {
  const v = validarCompra(dados);
  const db = await getDb();
  await garantirCliente(db, v.codigoCliente);
  const r = await db.runAsync(
    'INSERT INTO Compra (DataCompra, ValorTotal, CodigoCliente) VALUES (?, 0, ?)',
    v.dataISO, v.codigoCliente
  );
  return r.lastInsertRowId;
}

export async function atualizarCompra(id, dados) {
  const v = validarCompra(dados);
  const db = await getDb();
  if (!(await buscarCompra(id))) throw new ValidationError('Compra não encontrada.');
  await garantirCliente(db, v.codigoCliente);
  await db.runAsync(
    'UPDATE Compra SET DataCompra = ?, CodigoCliente = ? WHERE CodigoCompra = ?',
    v.dataISO, v.codigoCliente, id
  );
}

/** Exclui a compra devolvendo ao estoque o que foi vendido; os itens saem por cascata. */
export async function excluirCompra(id) {
  const db = await getDb();
  if (!(await buscarCompra(id))) throw new ValidationError('Compra não encontrada.');
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `UPDATE Produto SET QtdEstoque = QtdEstoque + COALESCE(
         (SELECT SUM(Quantidade) FROM ItemCompra
          WHERE ItemCompra.CodigoProduto = Produto.CodigoProduto AND ItemCompra.CodigoCompra = ?), 0)
       WHERE CodigoProduto IN (SELECT CodigoProduto FROM ItemCompra WHERE CodigoCompra = ?)`,
      id, id
    );
    await db.runAsync('DELETE FROM Compra WHERE CodigoCompra = ?', id);
  });
}
