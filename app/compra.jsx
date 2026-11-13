import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Text } from 'react-native';
import { Botao, brl, Campo, Chips, LinhaLista, Secao, Tela, Vazio } from '../src/components/ui';
import { listarClientes } from '../src/services/clienteService';
import { listarProdutos } from '../src/services/produtoService';
import {
  atualizarCompra, buscarCompra, criarCompra, excluirCompra, listarCompras,
} from '../src/services/compraService';
import {
  adicionarItem, atualizarItem, excluirItem, listarItens,
} from '../src/services/itemCompraService';
import { hojeBR, isoParaBR } from '../src/validators/validators';

const COMPRA_VAZIA = () => ({ codigo: null, codigoCliente: null, data: hojeBR() });
const ITEM_VAZIO = { codigo: null, codigoProduto: null, quantidade: '1' };

export default function Compra() {
  const [compras, setCompras] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [itens, setItens] = useState([]);
  const [compra, setCompra] = useState(COMPRA_VAZIA());
  const [total, setTotal] = useState(0);
  const [item, setItem] = useState(ITEM_VAZIO);

  const carregar = useCallback(async (codigoCompra) => {
    setCompras(await listarCompras());
    setClientes(await listarClientes());
    setProdutos(await listarProdutos());
    if (codigoCompra) {
      setItens(await listarItens(codigoCompra));
      const c = await buscarCompra(codigoCompra);
      setTotal(c ? c.ValorTotal : 0);
    } else {
      setItens([]);
      setTotal(0);
    }
  }, []);

  useFocusEffect(useCallback(() => { carregar(compra.codigo); }, [carregar, compra.codigo]));

  const erro = (e) => Alert.alert('Erro', e.message);

  function novaCompra() {
    setCompra(COMPRA_VAZIA());
    setItem(ITEM_VAZIO);
  }

  function selecionar(c) {
    setCompra({ codigo: c.CodigoCompra, codigoCliente: c.CodigoCliente, data: isoParaBR(c.DataCompra) });
    setItem(ITEM_VAZIO);
  }

  async function salvarCompra() {
    try {
      if (compra.codigo) {
        await atualizarCompra(compra.codigo, compra);
        await carregar(compra.codigo);
      } else {
        const id = await criarCompra(compra);
        setCompra((c) => ({ ...c, codigo: id }));
        await carregar(id);
      }
    } catch (e) { erro(e); }
  }

  function excluirCompraConfirmar(c) {
    Alert.alert('Excluir', `Excluir a compra #${c.CodigoCompra}? O estoque dos itens será devolvido.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir', style: 'destructive',
        onPress: async () => {
          try {
            await excluirCompra(c.CodigoCompra);
            if (compra.codigo === c.CodigoCompra) novaCompra();
            await carregar(compra.codigo === c.CodigoCompra ? null : compra.codigo);
          } catch (e) { erro(e); }
        },
      },
    ]);
  }

  async function salvarItem() {
    try {
      const dados = { codigoCompra: compra.codigo, codigoProduto: item.codigoProduto, quantidade: item.quantidade };
      if (item.codigo) await atualizarItem(item.codigo, dados);
      else await adicionarItem(dados);
      setItem(ITEM_VAZIO);
      await carregar(compra.codigo);
    } catch (e) { erro(e); }
  }

  function excluirItemConfirmar(i) {
    Alert.alert('Excluir', `Remover "${i.NomeProduto}" da compra?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover', style: 'destructive',
        onPress: async () => {
          try {
            await excluirItem(i.CodigoItem);
            if (item.codigo === i.CodigoItem) setItem(ITEM_VAZIO);
            await carregar(compra.codigo);
          } catch (e) { erro(e); }
        },
      },
    ]);
  }

  return (
    <Tela>
      <Secao titulo={compra.codigo ? `Compra #${compra.codigo}` : 'Nova compra'}>
        <Text style={{ marginBottom: 6 }}>Cliente</Text>
        <Chips
          opcoes={clientes.map((c) => ({ id: c.CodigoCliente, rotulo: c.Nome }))}
          valor={compra.codigoCliente}
          onChange={(id) => setCompra((c) => ({ ...c, codigoCliente: id }))}
        />
        <Campo label="Data (DD/MM/AAAA)" value={compra.data} onChangeText={(v) => setCompra((c) => ({ ...c, data: v }))} maxLength={10} keyboardType="number-pad" />
        <Botao titulo={compra.codigo ? 'Salvar compra' : 'Criar compra'} onPress={salvarCompra} />
        {compra.codigo && <Botao titulo="Nova compra" cor="#6b7280" onPress={novaCompra} />}
      </Secao>

      {compra.codigo && (
        <Secao titulo={`Itens · Total ${brl(total)}`}>
          <Text style={{ marginBottom: 6 }}>Produto</Text>
          <Chips
            opcoes={produtos.map((p) => ({ id: p.CodigoProduto, rotulo: `${p.NomeProduto} (${p.QtdEstoque})` }))}
            valor={item.codigoProduto}
            onChange={(id) => setItem((i) => ({ ...i, codigoProduto: id }))}
          />
          <Campo label="Quantidade" value={item.quantidade} onChangeText={(v) => setItem((i) => ({ ...i, quantidade: v }))} keyboardType="number-pad" />
          <Botao titulo={item.codigo ? 'Salvar item' : 'Adicionar item'} onPress={salvarItem} />
          {item.codigo && <Botao titulo="Cancelar edição" cor="#6b7280" onPress={() => setItem(ITEM_VAZIO)} />}

          {itens.length === 0 && <Vazio texto="Nenhum item nesta compra." />}
          {itens.map((i) => (
            <LinhaLista
              key={i.CodigoItem}
              titulo={`${i.NomeProduto} × ${i.Quantidade}`}
              subtitulo={`${brl(i.Preco)} un. · parcial ${brl(i.ValorParcial)}`}
              ativo={item.codigo === i.CodigoItem}
              onPress={() => setItem({ codigo: i.CodigoItem, codigoProduto: i.CodigoProduto, quantidade: String(i.Quantidade) })}
              onExcluir={() => excluirItemConfirmar(i)}
            />
          ))}
        </Secao>
      )}

      <Secao titulo="Compras realizadas">
        {compras.length === 0 && <Vazio texto="Nenhuma compra registrada." />}
        {compras.map((c) => (
          <LinhaLista
            key={c.CodigoCompra}
            titulo={`#${c.CodigoCompra} · ${c.NomeCliente}`}
            subtitulo={`${isoParaBR(c.DataCompra)} · ${brl(c.ValorTotal)}`}
            ativo={compra.codigo === c.CodigoCompra}
            onPress={() => selecionar(c)}
            onExcluir={() => excluirCompraConfirmar(c)}
          />
        ))}
      </Secao>
    </Tela>
  );
}
