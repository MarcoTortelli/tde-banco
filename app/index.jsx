import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { Botao } from '../src/components/ui';

export default function Menu() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#f3f4f6' }}>
      <Text style={{ fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 28 }}>TDE – Banco de Dados</Text>
      <Botao titulo="Cadastro de Clientes" onPress={() => router.push('/clientes')} />
      <Botao titulo="Cadastro de Produtos" onPress={() => router.push('/produtos')} />
      <Botao titulo="Compra" onPress={() => router.push('/compra')} />
    </View>
  );
}
