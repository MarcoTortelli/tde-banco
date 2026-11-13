import * as SQLite from 'expo-sqlite';

let dbPromise = null;

/** Abre o banco (uma única vez) e cria as 4 tabelas se ainda não existirem. */
export function getDb() {
  if (!dbPromise) dbPromise = iniciar();
  return dbPromise;
}

async function iniciar() {
  const db = await SQLite.openDatabaseAsync('tde.db');
  await db.execAsync(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS Cliente (
      CodigoCliente INTEGER PRIMARY KEY AUTOINCREMENT,
      Nome          TEXT    NOT NULL,
      RG            INTEGER NOT NULL UNIQUE,
      Telefone      TEXT    NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Produto (
      CodigoProduto INTEGER PRIMARY KEY AUTOINCREMENT,
      NomeProduto   TEXT    NOT NULL,
      Tipo          TEXT    NOT NULL,
      Preco         REAL    NOT NULL,
      QtdEstoque    INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Compra (
      CodigoCompra  INTEGER PRIMARY KEY AUTOINCREMENT,
      DataCompra    TEXT    NOT NULL,
      ValorTotal    REAL    NOT NULL DEFAULT 0,
      CodigoCliente INTEGER NOT NULL,
      FOREIGN KEY (CodigoCliente) REFERENCES Cliente (CodigoCliente) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS ItemCompra (
      CodigoItem    INTEGER PRIMARY KEY AUTOINCREMENT,
      CodigoProduto INTEGER NOT NULL,
      CodigoCompra  INTEGER NOT NULL,
      Quantidade    INTEGER NOT NULL,
      ValorParcial  REAL    NOT NULL,
      FOREIGN KEY (CodigoProduto) REFERENCES Produto (CodigoProduto) ON DELETE RESTRICT,
      FOREIGN KEY (CodigoCompra)  REFERENCES Compra  (CodigoCompra)  ON DELETE CASCADE
    );
  `);
  return db;
}
