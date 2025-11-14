import { useState } from 'react';
import { StyleSheet, Text, View, FlatList, Button, ScrollView } from 'react-native';
import { useDatabase } from '../../database/useDatabase';
import { useFocusEffect } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

// Define como é o formato de um item do histórico
interface VendaHistorico {
  id: number;
  produto_nome: string;
  quantidade: number;
  preco_total: number;
  data_venda: string;
}

// <<< NOVO >>> Define o formato do resumo de hoje
interface ResumoHoje {
  total: number;
  itemMaisVendido: string;
}

export default function TabRelatorios() {
  const [vendasRecentes, setVendasRecentes] = useState<VendaHistorico[]>([]);
  const [faturamentoTotal, setFaturamentoTotal] = useState(0);
  const [resumoHoje, setResumoHoje] = useState<ResumoHoje>({ total: 0, itemMaisVendido: 'Nenhum' });

  const { db } = useDatabase();

  // Função para carregar TODOS os dados do relatório
  async function carregarDadosRelatorio() {
    try {
      // 1. Carrega as últimas 10 vendas (para a lista "Vendas Recentes")
      const vendas = await db.getAllAsync<any>(
        'SELECT * FROM historico_vendas ORDER BY data_venda DESC LIMIT 10'
      );
      setVendasRecentes(vendas);

      // 2. Carrega o Faturamento Total (soma de tudo)
      const resultadoTotal = await db.getFirstAsync<any>(
        'SELECT SUM(preco_total) as total FROM historico_vendas'
      );
      setFaturamentoTotal(resultadoTotal?.total || 0);

      // 3. <<< NOVO >>> Carrega o total vendido HOJE
      // A data no SQLite precisa ser comparada com 'now', 'start of day'
      const resultadoTotalHoje = await db.getFirstAsync<any>(
        "SELECT SUM(preco_total) as total FROM historico_vendas WHERE DATE(data_venda) = DATE('now', 'localtime')"
      );

      // 4. <<< NOVO >>> Carrega o item mais vendido HOJE
      const resultadoItemHoje = await db.getFirstAsync<any>(
        `SELECT produto_nome, SUM(quantidade) as total_qtd 
         FROM historico_vendas 
         WHERE DATE(data_venda) = DATE('now', 'localtime')
         GROUP BY produto_nome 
         ORDER BY total_qtd DESC 
         LIMIT 1`
      );

      // 5. Atualiza o estado do Resumo de Hoje
      setResumoHoje({
        total: resultadoTotalHoje?.total || 0,
        itemMaisVendido: resultadoItemHoje?.produto_nome || 'Nenhuma venda hoje'
      });

    } catch (error) {
      console.error("Erro ao carregar relatórios:", error);
    }
  }

  // Hook para carregar o histórico sempre que a tela entrar em foco
  useFocusEffect(
    React.useCallback(() => {
      carregarDadosRelatorio();
    }, [])
  );
  
  // Função para formatar a data (deixa mais bonita)
  function formatarData(dataString: string) {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR');
  }

  // O ScrollView permite rolar a tela inteira
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Relatórios Gerenciais</Text>
      
      <Button title="Atualizar Dados" onPress={carregarDadosRelatorio} />

      {/* Card 1: Resumo de Hoje (NOVO) */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Resumo de Hoje</Text>
        <View style={styles.resumoLinha}>
          <Ionicons name="cash-outline" size={24} color="#007bff" />
          <Text style={styles.resumoTexto}>Total Vendido:</Text>
          <Text style={styles.resumoValor}>R$ {resumoHoje.total.toFixed(2)}</Text>
        </View>
        <View style={styles.resumoLinha}>
          <Ionicons name="star-outline" size={24} color="#ff8c00" />
          <Text style={styles.resumoTexto}>Item Mais Vendido:</Text>
          <Text style={styles.resumoValor}>{resumoHoje.itemMaisVendido}</Text>
        </View>
      </View>

      {/* Card 2: Faturamento Total */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Faturamento Total (Geral)</Text>
        <Text style={styles.faturamentoTotal}>R$ {faturamentoTotal.toFixed(2)}</Text>
        <Ionicons name="stats-chart" size={32} color="#2e7d32" style={styles.cardIcon} />
      </View>

      {/* Card 3: Histórico de Vendas Recentes */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Vendas Recentes</Text>
        
        <FlatList
          data={vendasRecentes}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false} // Desabilita a rolagem da lista (o ScrollView já rola)
          renderItem={({ item }) => (
            <View style={styles.itemLista}>
              <View>
                <Text style={styles.itemNome}>{item.produto_nome} (Qtd: {item.quantidade})</Text>
                <Text style={styles.itemData}>{formatarData(item.data_venda)}</Text>
              </View>
              <Text style={styles.itemPreco}>R$ {item.preco_total.toFixed(2)}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.listaVazia}>Nenhuma venda registrada ainda.</Text>}
        />
      </View>
      
    </ScrollView> // Fim do ScrollView
  );
}

// --- Estilos "Modernos e Bonitos" ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f0f2f5', // Um cinza bem claro para o fundo
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#ffffff', // Cards brancos
    borderRadius: 12, // Bordas arredondadas
    padding: 16,
    marginBottom: 16,
    elevation: 4, // Sombra (Android)
    shadowColor: '#000', // Sombra (iOS)
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600', // "Semibold"
    color: '#555',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  cardIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
    opacity: 0.3,
  },
  faturamentoTotal: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2e7d32', // Verde escuro
    marginBottom: 8,
  },
  // Estilos para o Card "Resumo de Hoje"
  resumoLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  resumoTexto: {
    fontSize: 16,
    marginLeft: 8,
    color: '#333',
  },
  resumoValor: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 'auto', // Joga o valor para a direita
    color: '#000',
  },
  // Estilos para a Lista de Vendas Recentes
  itemLista: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemNome: {
    fontSize: 16,
    fontWeight: '500', // "Medium"
  },
  itemData: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
  },
  itemPreco: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff', // Azul
  },
  listaVazia: {
    textAlign: 'center',
    marginTop: 20,
    paddingBottom: 20,
    fontSize: 16,
    color: '#666',
  }
});