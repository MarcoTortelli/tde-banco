import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { Botao, Campo, LinhaLista, Secao, Tela, Vazio } from '../src/components/ui';
import {
  atualizarCliente, criarCliente, excluirCliente, listarClientes,
} from '../src/services/clienteService';

const VAZIO = { codigo: null, nome: '', rg: '', telefone: '' };

export default function Clientes() {
  const [lista, setLista] = useState([]);
  const [form, setForm] = useState(VAZIO);

  const carregar = useCallback(async () => setLista(await listarClientes()), []);
  useFocusEffect(useCallback(() => { carregar(); }, [carregar]));

  const set = (campo) => (v) => setForm((f) => ({ ...f, [campo]: v }));

  async function salvar() {
    try {
      if (form.codigo) await atualizarCliente(form.codigo, form);
      else await criarCliente(form);
      setForm(VAZIO);
      await carregar();
    } catch (e) {
      Alert.alert('Erro', e.message);
    }
  }

  function excluir(c) {
    Alert.alert('Excluir', `Excluir o cliente "${c.Nome}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir', style: 'destructive',
        onPress: async () => {
          try {
            await excluirCliente(c.CodigoCliente);
            if (form.codigo === c.CodigoCliente) setForm(VAZIO);
            await carregar();
          } catch (e) { Alert.alert('Erro', e.message); }
        },
      },
    ]);
  }

  return (
    <Tela>
      <Secao titulo={form.codigo ? `Editando cliente #${form.codigo}` : 'Novo cliente'}>
        <Campo label="Nome (máx. 50)" value={form.nome} onChangeText={set('nome')} maxLength={50} />
        <Campo label="RG (somente números)" value={form.rg} onChangeText={set('rg')} keyboardType="number-pad" maxLength={10} />
        <Campo label="Telefone" value={form.telefone} onChangeText={set('telefone')} keyboardType="phone-pad" maxLength={14} placeholder="(54)99999-9999" />
        <Botao titulo={form.codigo ? 'Salvar alterações' : 'Cadastrar'} onPress={salvar} />
        {form.codigo && <Botao titulo="Cancelar edição" cor="#6b7280" onPress={() => setForm(VAZIO)} />}
      </Secao>

      <Secao titulo="Clientes cadastrados">
        {lista.length === 0 && <Vazio texto="Nenhum cliente cadastrado." />}
        {lista.map((c) => (
          <LinhaLista
            key={c.CodigoCliente}
            titulo={`#${c.CodigoCliente} · ${c.Nome}`}
            subtitulo={`RG ${c.RG} · ${c.Telefone}`}
            ativo={form.codigo === c.CodigoCliente}
            onPress={() => setForm({ codigo: c.CodigoCliente, nome: c.Nome, rg: String(c.RG), telefone: c.Telefone })}
            onExcluir={() => excluir(c)}
          />
        ))}
      </Secao>
    </Tela>
  );
}
