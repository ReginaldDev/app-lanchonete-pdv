import { useEffect, useState } from 'react';
import * as SQLite from 'expo-sqlite';

// Abre ou cria o banco de dados
const db = SQLite.openDatabaseSync('lanchonete.db');

export const useDatabase = () => {
  const [isDbLoading, setIsDbLoading] = useState(true);

  useEffect(() => {
    async function setupDatabase() {
      try {
        await db.execAsync('PRAGMA foreign_keys = ON;');

        // 1. Cria a tabela de Produtos
        await db.runAsync(`
          CREATE TABLE IF NOT EXISTS produtos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            preco REAL NOT NULL,
            estoque INTEGER NOT NULL
          );
        `);
        
        // <<< NOVO CÓDIGO AQUI >>>
        // 2. Cria a tabela de Histórico de Vendas
        await db.runAsync(`
          CREATE TABLE IF NOT EXISTS historico_vendas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            produto_nome TEXT NOT NULL,
            quantidade INTEGER NOT NULL,
            preco_total REAL NOT NULL,
            data_venda TEXT NOT NULL 
          );
        `);
        // <<< FIM DO NOVO CÓDIGO >>>

        // Adiciona produtos de exemplo (não mudou)
        const result = await db.getFirstAsync('SELECT COUNT(*) as count FROM produtos');
        if (result && result.count === 0) {
          await db.runAsync(
            "INSERT INTO produtos (nome, preco, estoque) VALUES (?, ?, ?), (?, ?, ?)",
            'X-Salada', 15.50, 20,         
            'Refrigerante Lata', 6.00, 50 
          );
          console.log("Produtos de exemplo inseridos!");
        }

        console.log("Banco de dados inicializado com sucesso!");
        setIsDbLoading(false);

      } catch (error) {
        console.error("Erro ao inicializar o banco de dados:", error);
        setIsDbLoading(false);
      }
    }

    setupDatabase();
  }, []); 

  return { isDbLoading, db };
};