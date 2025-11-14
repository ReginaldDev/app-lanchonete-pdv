import { Stack } from 'expo-router';
import { useDatabase } from '../database/useDatabase'; // 1. Importamos nosso hook
import { Text } from 'react-native';

export default function RootLayout() {
  
  // 2. Usamos o hook aqui. Isso vai rodar o código do useEffect
  const { isDbLoading } = useDatabase(); 

  // 3. Enquanto o DB carrega, mostramos uma tela de "Carregando..."
  if (isDbLoading) {
    return <Text style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>Carregando banco de dados...</Text>;
  }

  // 4. Quando o DB estiver pronto, mostramos o app (as abas)
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
    </Stack>
  );
}