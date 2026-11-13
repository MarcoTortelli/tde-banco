import { getDb } from '../database/db';
import { validarCliente, ValidationError } from '../validators/validators';

export async function listarClientes() {
  const db = await getDb();
  return db.getAllAsync('SELECT * FROM Cliente ORDER BY Nome');
}

export async function buscarCliente(id) {
  const db = await getDb();
  return db.getFirstAsync('SELECT * FROM Cliente WHERE CodigoCliente = ?', id);
}

export async function criarCliente(dados) {
  const v = validarCliente(dados);
  const db = await getDb();
  const igual = await db.getFirstAsync('SELECT 1 AS x FROM Cliente WHERE RG = ?', v.rg);
  if (igual) throw new ValidationError('Já existe um cliente com este RG.');
  const r = await db.runAsync(
    'INSERT INTO Cliente (Nome, RG, Telefone) VALUES (?, ?, ?)',
    v.nome, v.rg, v.telefone
  );
  return r.lastInsertRowId;
}

export async function atualizarCliente(id, dados) {
  const v = validarCliente(dados);
  const db = await getDb();
  if (!(await buscarCliente(id))) throw new ValidationError('Cliente não encontrado.');
  const igual = await db.getFirstAsync(
    'SELECT 1 AS x FROM Cliente WHERE RG = ? AND CodigoCliente <> ?', v.rg, id
  );
  if (igual) throw new ValidationError('Já existe outro cliente com este RG.');
  await db.runAsync(
    'UPDATE Cliente SET Nome = ?, RG = ?, Telefone = ? WHERE CodigoCliente = ?',
    v.nome, v.rg, v.telefone, id
  );
}

export async function excluirCliente(id) {
  const db = await getDb();
  if (!(await buscarCliente(id))) throw new ValidationError('Cliente não encontrado.');
  const compra = await db.getFirstAsync('SELECT 1 AS x FROM Compra WHERE CodigoCliente = ?', id);
  if (compra) throw new ValidationError('Não é possível excluir: o cliente possui compras. Exclua as compras primeiro.');
  await db.runAsync('DELETE FROM Cliente WHERE CodigoCliente = ?', id);
}
