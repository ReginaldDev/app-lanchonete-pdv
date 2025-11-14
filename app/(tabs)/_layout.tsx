import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; // Usaremos ícones!

export default function TabLayout() {
  return (
    <Tabs>
      {/* Aba 1: Vendas */}
      <Tabs.Screen
        name="index" // Nome do arquivo: vendas.tsx
        options={{
          title: 'Registrar Venda', // Nome que aparece no app
          tabBarIcon: ({ color }) => (
            <Ionicons name="cash-outline" size={28} color={color} />
          ),
        }}
      />

      {/* Aba 2: Produtos */}
      <Tabs.Screen
        name="produtos" // Nome do arquivo: produtos.tsx
        options={{
          title: 'Produtos e Estoque', // Nome que aparece no app
          tabBarIcon: ({ color }) => (
            <Ionicons name="archive-outline" size={28} color={color} />
          ),
        }}
      />
      
      {/* <<< NOVA ABA AQUI >>> */}
      {/* Aba 3: Relatórios */}
      <Tabs.Screen
        name="relatorios" // Nome do arquivo: relatorios.tsx
        options={{
          title: 'Relatórios', // Nome que aparece no app
          tabBarIcon: ({ color }) => (
            <Ionicons name="bar-chart-outline" size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}