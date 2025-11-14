import { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, FlatList, Alert, TouchableOpacity } from 'react-native';
import { useDatabase } from '../../database/useDatabase'; // Importamos nosso hook
import { useFocusEffect } from 'expo-router'; // Para recarregar os dados
import React from 'react';
import { Ionicons } from '@expo/vector-icons'; // Para ícones

// Define como é o formato de um Produto
interface Produto {
  id: number;
  nome: string;
  preco: number;
  estoque: number;
}

export default function TabProdutos() {
  // 1. Estados para o formulário
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [estoque, setEstoque] = useState('');

  // <<< NOVO >>> Estado para guardar qual produto está sendo editado
  const [produtoEmEdicao, setProdutoEmEdicao] = useState<Produto | null>(null);

  // 2. Estado para a lista de produtos
  const [produtos, setProdutos] = useState<Produto[]>([]);
  
  // 3. Pega o banco de dados do nosso hook
  const { db } = useDatabase();

  // 4. Função para carregar os produtos do banco
  async function carregarProdutos() {
    try {
      const todosOsProdutos = await db.getAllAsync<any>('SELECT * FROM produtos');
      setProdutos(todosOsProdutos);
    } catch (error) {
      console.error(error);
    }
  }

  // 5. <<< MODIFICADO >>> Função unificada para Adicionar ou Editar
  async function handleSubmit() {
    // Validação simples
    if (!nome || !preco || !estoque) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    try {
      const precoFloat = parseFloat(preco.replace(',', '.')); 
      const estoqueInt = parseInt(estoque, 10); 

      if (isNaN(precoFloat) || isNaN(estoqueInt)) {
        Alert.alert('Erro', 'Preço e Estoque devem ser números válidos.');
        return;
      }

      if (produtoEmEdicao) {
        // <<< LÓGICA DE UPDATE (EDIÇÃO) >>>
        await db.runAsync(
          'UPDATE produtos SET nome = ?, preco = ?, estoque = ? WHERE id = ?',
          nome,
          precoFloat,
          estoqueInt,
          produtoEmEdicao.id
        );
        Alert.alert('Sucesso', 'Produto atualizado!');
        setProdutoEmEdicao(null); // Volta para o modo "Adicionar"

      } else {
        // <<< LÓGICA DE INSERT (CRIAÇÃO) >>>
        await db.runAsync(
          'INSERT INTO produtos (nome, preco, estoque) VALUES (?, ?, ?)',
          nome,
          precoFloat,
          estoqueInt
        );
        Alert.alert('Sucesso', 'Produto cadastrado!');
      }

      // Limpa os campos e recarrega a lista
      limparFormulario();
      carregarProdutos();

    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível salvar o produto.');
    }
  }

  // 6. Hook para carregar os produtos sempre que a tela entrar em foco
  useFocusEffect(
    React.useCallback(() => {
      carregarProdutos();
    }, [])
  );

  // <<< NOVO >>> 7. Função para preparar a edição
  function handleEditar(produto: Produto) {
    setNome(produto.nome);
    setPreco(produto.preco.toString()); // Converte número para string para o input
    setEstoque(produto.estoque.toString());
    setProdutoEmEdicao(produto); // Define que estamos em "modo de edição"
  }

  // <<< NOVO >>> 8. Função para deletar um produto
  function handleDeletar(id: number) {
    Alert.alert('Confirmar Exclusão', 'Tem certeza que deseja excluir este produto?', [
      // Botão 1: Cancelar
      { text: 'Cancelar', style: 'cancel' },
      // Botão 2: Excluir
      { 
        text: 'Excluir', 
        style: 'destructive',
        onPress: async () => {
          try {
            await db.runAsync('DELETE FROM produtos WHERE id = ?', id);
            Alert.alert('Sucesso', 'Produto excluído.');
            carregarProdutos(); // Recarrega a lista
          } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Não foi possível excluir o produto.');
          }
        } 
      }
    ]);
  }

  // <<< NOVO >>> 9. Função para limpar o formulário e sair do modo de edição
  function limparFormulario() {
    setNome('');
    setPreco('');
    setEstoque('');
    setProdutoEmEdicao(null); // Sai do modo de edição
  }


  return (
    <View style={styles.container}>
      {/* Se o produtoEmEdicao não for nulo, mostra o título "Editando" */}
      <Text style={styles.title}>
        {produtoEmEdicao ? `Editando: ${produtoEmEdicao.nome}` : 'Cadastro de Produtos'}
      </Text>

      {/* Formulário de Novo Produto */}
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nome do Produto (ex: X-Salada)"
          value={nome}
          onChangeText={setNome}
        />
        <TextInput
          style={styles.input}
          placeholder="Preço (ex: 15.50)"
          value={preco}
          onChangeText={setPreco}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Estoque Inicial (ex: 20)"
          value={estoque}
          onChangeText={setEstoque}
          keyboardType="numeric"
        />
        {/* O botão agora muda de texto e cor! */}
        <Button 
          title={produtoEmEdicao ? "Salvar Edição" : "Adicionar Produto"} 
          onPress={handleSubmit} 
          color={produtoEmEdicao ? "#ff8c00" : "#007bff"} // Laranja para editar, azul para adicionar
        />

        {/* <<< NOVO >>> Botão de Cancelar Edição (só aparece se estiver editando) */}
        {produtoEmEdicao && (
          <View style={{marginTop: 8}}>
            <Button 
              title="Cancelar Edição" 
              onPress={limparFormulario}
              color="#dc3545" // Vermelho
            />
          </View>
        )}
      </View>

      <Text style={styles.title}>Produtos em Estoque</Text>

      {/* Lista de Produtos */}
      <FlatList
        data={produtos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.itemLista}>
            {/* Informações do Produto */}
            <View style={styles.itemInfo}>
              <Text style={styles.itemNome}>{item.nome}</Text>
              <Text style={styles.itemTexto}>R$ {item.preco.toFixed(2)} | Estoque: {item.estoque}</Text>
            </View>
            
            {/* <<< NOVOS >>> Botões de Ação */}
            <View style={styles.itemBotoes}>
              <TouchableOpacity onPress={() => handleEditar(item)} style={styles.botaoAcao}>
                <Ionicons name="pencil" size={22} color="#ff8c00" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeletar(item.id)} style={styles.botaoAcao}>
                <Ionicons name="trash" size={22} color="#dc3545" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2, // Sombra no Android
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  itemLista: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 1,
  },
  itemInfo: {
    flex: 1, // Faz com que o texto ocupe o espaço disponível
  },
  itemNome: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemTexto: {
    fontSize: 16,
    color: '#333'
  },
  itemBotoes: {
    flexDirection: 'row',
  },
  botaoAcao: {
    marginLeft: 16, // Espaçamento entre os ícones
    padding: 4,
  }
});