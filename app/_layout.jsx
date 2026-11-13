import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { getDb } from '../src/database/db';

export default function Layout() {
  const [pronto, setPronto] = useState(false);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    getDb().then(() => setPronto(true)).catch((e) => setErro(e.message));
  }, []);

  if (erro) return <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}><Text>Erro ao abrir o banco: {erro}</Text></View>;
  if (!pronto) return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator size="large" /></View>;

  return (
    <Stack screenOptions={{ headerStyle: { backgroundColor: '#2563eb' }, headerTintColor: '#fff' }}>
      <Stack.Screen name="index" options={{ title: 'Menu Principal' }} />
      <Stack.Screen name="clientes" options={{ title: 'Cadastro de Clientes' }} />
      <Stack.Screen name="produtos" options={{ title: 'Cadastro de Produtos' }} />
      <Stack.Screen name="compra" options={{ title: 'Compra' }} />
    </Stack>
  );
}
