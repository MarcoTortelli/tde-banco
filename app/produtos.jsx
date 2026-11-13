import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { Botao, brl, Campo, LinhaLista, Secao, Tela, Vazio } from '../src/components/ui';
import {
  atualizarProduto, criarProduto, excluirProduto, listarProdutos,
} from '../src/services/produtoService';

const VAZIO = { codigo: null, nome: '', tipo: '', preco: '', estoque: '' };

export default function Produtos() {
  const [lista, setLista] = useState([]);
  const [form, setForm] = useState(VAZIO);

  const carregar = useCallback(async () => setLista(await listarProdutos()), []);
  useFocusEffect(useCallback(() => { carregar(); }, [carregar]));

  const set = (campo) => (v) => setForm((f) => ({ ...f, [campo]: v }));

  async function salvar() {
    try {
      if (form.codigo) await atualizarProduto(form.codigo, form);
      else await criarProduto(form);
      setForm(VAZIO);
      await carregar();
    } catch (e) {
      Alert.alert('Erro', e.message);
    }
  }

  function excluir(p) {
    Alert.alert('Excluir', `Excluir o produto "${p.NomeProduto}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir', style: 'destructive',
        onPress: async () => {
          try {
            await excluirProduto(p.CodigoProduto);
            if (form.codigo === p.CodigoProduto) setForm(VAZIO);
            await carregar();
          } catch (e) { Alert.alert('Erro', e.message); }
        },
      },
    ]);
  }

  return (
    <Tela>
      <Secao titulo={form.codigo ? `Editando produto #${form.codigo}` : 'Novo produto'}>
        <Campo label="Nome (máx. 50)" value={form.nome} onChangeText={set('nome')} maxLength={50} />
        <Campo label="Tipo (máx. 50)" value={form.tipo} onChangeText={set('tipo')} maxLength={50} />
        <Campo label="Preço (R$)" value={form.preco} onChangeText={set('preco')} keyboardType="decimal-pad" placeholder="0,00" />
        <Campo label="Quantidade em estoque" value={form.estoque} onChangeText={set('estoque')} keyboardType="number-pad" />
        <Botao titulo={form.codigo ? 'Salvar alterações' : 'Cadastrar'} onPress={salvar} />
        {form.codigo && <Botao titulo="Cancelar edição" cor="#6b7280" onPress={() => setForm(VAZIO)} />}
      </Secao>

      <Secao titulo="Produtos cadastrados">
        {lista.length === 0 && <Vazio texto="Nenhum produto cadastrado." />}
        {lista.map((p) => (
          <LinhaLista
            key={p.CodigoProduto}
            titulo={`#${p.CodigoProduto} · ${p.NomeProduto}`}
            subtitulo={`${p.Tipo} · ${brl(p.Preco)} · estoque: ${p.QtdEstoque}`}
            ativo={form.codigo === p.CodigoProduto}
            onPress={() => setForm({
              codigo: p.CodigoProduto, nome: p.NomeProduto, tipo: p.Tipo,
              preco: String(p.Preco).replace('.', ','), estoque: String(p.QtdEstoque),
            })}
            onExcluir={() => excluir(p)}
          />
        ))}
      </Secao>
    </Tela>
  );
}
