import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export const brl = (v) =>
  Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function Tela({ children }) {
  return (
    <ScrollView style={s.tela} contentContainerStyle={{ padding: 16, paddingBottom: 48 }} keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  );
}

export function Secao({ titulo, children }) {
  return (
    <View style={s.secao}>
      <Text style={s.secaoTitulo}>{titulo}</Text>
      {children}
    </View>
  );
}

export function Campo({ label, ...props }) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={s.label}>{label}</Text>
      <TextInput style={s.input} placeholderTextColor="#9ca3af" {...props} />
    </View>
  );
}

export function Botao({ titulo, onPress, cor = '#2563eb', style }) {
  return (
    <TouchableOpacity style={[s.botao, { backgroundColor: cor }, style]} onPress={onPress}>
      <Text style={s.botaoTexto}>{titulo}</Text>
    </TouchableOpacity>
  );
}

/** Seleção de uma opção entre várias (substitui o Picker). opcoes: [{ id, rotulo }] */
export function Chips({ opcoes, valor, onChange }) {
  if (opcoes.length === 0) return <Text style={s.vazio}>Nenhuma opção cadastrada.</Text>;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
      {opcoes.map((o) => (
        <TouchableOpacity
          key={o.id}
          onPress={() => onChange(o.id)}
          style={[s.chip, valor === o.id && s.chipAtivo]}
        >
          <Text style={[s.chipTexto, valor === o.id && { color: '#fff' }]}>{o.rotulo}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

export function LinhaLista({ titulo, subtitulo, ativo, onPress, onExcluir }) {
  return (
    <TouchableOpacity style={[s.linha, ativo && s.linhaAtiva]} onPress={onPress}>
      <View style={{ flex: 1 }}>
        <Text style={s.linhaTitulo}>{titulo}</Text>
        {!!subtitulo && <Text style={s.linhaSub}>{subtitulo}</Text>}
      </View>
      <TouchableOpacity onPress={onExcluir} style={s.lixo}>
        <Text style={{ color: '#fff', fontWeight: '700' }}>Excluir</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export function Vazio({ texto }) {
  return <Text style={s.vazio}>{texto}</Text>;
}

const s = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#f3f4f6' },
  secao: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 16 },
  secaoTitulo: { fontSize: 17, fontWeight: '700', marginBottom: 12, color: '#111827' },
  label: { fontSize: 13, color: '#374151', marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 15, backgroundColor: '#fff', color: '#111827' },
  botao: { paddingVertical: 11, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  botaoTexto: { color: '#fff', fontWeight: '700', fontSize: 15 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16, backgroundColor: '#e5e7eb', marginRight: 8 },
  chipAtivo: { backgroundColor: '#2563eb' },
  chipTexto: { color: '#111827', fontSize: 14 },
  linha: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  linhaAtiva: { backgroundColor: '#eff6ff' },
  linhaTitulo: { fontSize: 15, fontWeight: '600', color: '#111827' },
  linhaSub: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  lixo: { backgroundColor: '#dc2626', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, marginLeft: 8 },
  vazio: { color: '#6b7280', fontStyle: 'italic', marginBottom: 8 },
});
