// Imports (sem mudanças)
import { useState } from 'react';
import { StyleSheet, Text, View, Button, FlatList, Alert, TouchableOpacity } from 'react-native';
import { useDatabase } from '../../database/useDatabase'; // Nosso hook de DB
import { useFocusEffect } from 'expo-router'; // Para recarregar os dados
import React from 'react';
import { Ionicons } from '@expo/vector-icons'; // Para ícones

// Interfaces (sem mudanças)
interface Produto {
  id: number;
  nome: string;
  preco: number;
  estoque: number;
}
interface ItemCarrinho extends Produto {
  quantidade: number;
}

export default function TabVendas() {
  // States e hook useDatabase (sem mudanças)
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]); 
  const { db } = useDatabase();

  // Funções carregarProdutosDisponiveis, useFocusEffect, adicionarAoCarrinho, 
  // handleAumentarQtd, handleDiminuirQtd, totalCarrinho (TODAS SEM MUDANÇAS)
  
  async function carregarProdutosDisponiveis() {
    try {
      const produtosDB = await db.getAllAsync<any>(
        'SELECT * FROM produtos WHERE estoque > 0'
      );
      setProdutos(produtosDB);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    }
  }

  useFocusEffect(
    React.useCallback(() => {
      carregarProdutosDisponiveis();
      setCarrinho([]); 
    }, [])
  );

  function adicionarAoCarrinho(produto: Produto) {
    const itemExistente = carrinho.find((item) => item.id === produto.id);
    if (itemExistente) {
      handleAumentarQtd(itemExistente.id);
    } else {
      setCarrinho([...carrinho, { ...produto, quantidade: 1 }]);
    }
  }

  function handleAumentarQtd(id: number) {
    const item = carrinho.find((item) => item.id === id);
    if (!item) return; 
    if (item.quantidade >= item.estoque) {
      Alert.alert("Estoque insuficiente", `Você só tem ${item.estoque} unidades de ${item.nome} no estoque.`);
      return;
    }
    setCarrinho(
      carrinho.map((item) =>
        item.id === id ? { ...item, quantidade: item.quantidade + 1 } : item
      )
    );
  }

  function handleDiminuirQtd(id: number) {
    const item = carrinho.find((item) => item.id === id);
    if (!item) return; 
    if (item.quantidade === 1) {
      setCarrinho(carrinho.filter((item) => item.id !== id));
    } else {
      setCarrinho(
        carrinho.map((item) =>
          item.id === id ? { ...item, quantidade: item.quantidade - 1 } : item
        )
      );
    }
  }

  const totalCarrinho = carrinho.reduce(
    (total, item) => total + item.preco * item.quantidade,
    0
  );

  // =========================================================
  // <<< MODIFICAÇÃO IMPORTANTE AQUI >>>
  // =========================================================
  async function handleFinalizarVenda() {
    
    // Pega a data e hora atual em formato de texto (string)
    const dataVendaAtual = new Date().toISOString(); 

    try {
      // 1. Prepara as atualizações de estoque (igual antes)
      const promessasDeEstoque = carrinho.map((item) => {
        const novoEstoque = item.estoque - item.quantidade;
        return db.runAsync(
          'UPDATE produtos SET estoque = ? WHERE id = ?',
          novoEstoque,
          item.id
        );
      });

      // 2. <<< NOVO >>> Prepara os registros no histórico
      const promessasDeHistorico = carrinho.map((item) => {
        return db.runAsync(
          'INSERT INTO historico_vendas (produto_nome, quantidade, preco_total, data_venda) VALUES (?, ?, ?, ?)',
          item.nome,
          item.quantidade,
          item.preco * item.quantidade,
          dataVendaAtual // Salva a mesma data para todos os itens da venda
        );
      });

      // 3. Executa TODAS as promessas (Estoque e Histórico)
      await Promise.all([
        ...promessasDeEstoque,
        ...promessasDeHistorico
      ]);

      // 4. Se deu tudo certo (igual antes)
      Alert.alert("Sucesso!", "Venda finalizada e estoque atualizado.");
      setCarrinho([]); 
      carregarProdutosDisponiveis(); 

    } catch (error) {
      console.error("Erro ao finalizar a venda:", error);
      Alert.alert("Erro", "Não foi possível finalizar a venda. Tente novamente.");
    }
  }
  // =========================================================
  // <<< FIM DA MODIFICAÇÃO >>>
  // =========================================================


  // JSX (return) - Sem nenhuma mudança
  return (
    <View style={styles.container}>
      
      {/* Seção 1: Produtos Disponíveis */}
      <View style={styles.secao}>
        <Text style={styles.title}>Produtos Disponíveis</Text>
        <FlatList
          data={produtos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.itemProduto} 
              onPress={() => adicionarAoCarrinho(item)}
            >
              <Text style={styles.itemTexto}>{item.nome}</Text>
              <Text style={styles.itemTexto}>R$ {item.preco.toFixed(2)}</Text>
              <Text style={styles.itemTexto}>Estoque: {item.estoque}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Seção 2: Carrinho / Venda Atual */}
      <View style={styles.secao}>
        <Text style={styles.title}>Carrinho</Text>
        <FlatList
          data={carrinho}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.itemCarrinho}>
              <View style={styles.itemInfoCarrinho}>
                <Text style={styles.itemNome}>{item.nome}</Text>
                <Text style={styles.itemTexto}>
                  Total: R$ {(item.preco * item.quantidade).toFixed(2)}
                </Text>
              </View>
              
              <View style={styles.itemQtdControle}>
                <TouchableOpacity onPress={() => handleDiminuirQtd(item.id)} style={styles.botaoQtd}>
                  <Ionicons name="remove-circle" size={26} color="#dc3545" />
                </TouchableOpacity>
                <Text style={styles.itemQtdTexto}>{item.quantidade}</Text>
                <TouchableOpacity onPress={() => handleAumentarQtd(item.id)} style={styles.botaoQtd}>
                  <Ionicons name="add-circle" size={26} color="#007bff" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListFooterComponent={
            <Text style={styles.totalCarrinho}>
              Total da Venda: R$ {totalCarrinho.toFixed(2)}
            </Text>
          }
        />
        <Button 
          title="Finalizar Venda" 
          onPress={handleFinalizarVenda} 
          disabled={carrinho.length === 0} 
        />
      </View>
    </View>
  );
}

// Estilos (sem mudanças)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5ff', 
  },
  secao: {
    flex: 1, 
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  itemProduto: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    elevation: 2,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  itemCarrinho: {
    backgroundColor: '#fff', 
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
  },
  itemInfoCarrinho: {
    flex: 1, 
  },
  itemNome: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemQtdControle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  botaoQtd: {
    padding: 4, 
  },
  itemQtdTexto: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 12, 
  },
  itemTexto: {
    fontSize: 16,
  },
  totalCarrinho: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'right',
    marginTop: 10,
    padding: 10,
  },
});