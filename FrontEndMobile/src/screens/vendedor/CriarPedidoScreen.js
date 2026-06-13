import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { COLORS } from '../../constants';
import { useAuth } from '../../context/AuthContext';
import {
  createPessoaFisica, createPessoaJuridica,
  createVeiculo, createPedido, createItemPedido, createStatusFabricacao,
  createProduto,
} from '../../services/api';

const ETAPAS = ['cliente', 'veiculo'];
const ETAPA_LABELS = ['Cliente', 'Veículo'];

function maskCPF(value) {
  return value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function maskCNPJ(value) {
  return value
    .replace(/\D/g, '')
    .slice(0, 14)
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

export default function CriarPedidoScreen({ navigation }) {
  const { user } = useAuth();
  const [etapa, setEtapa] = useState('cliente');

  const [tipoDoc, setTipoDoc] = useState('CPF');
  const [formCliente, setFormCliente] = useState({
    nome: '',
    email: '',
    senhaHash: '',
    documento: '',
    razaoSocial: '',
    dataNascimento: '',
  });
  const [errosCliente, setErrosCliente] = useState({});
  const [salvandoCliente, setSalvandoCliente] = useState(false);
  const [clienteCriado, setClienteCriado] = useState(null);

  const [formVeiculo, setFormVeiculo] = useState({
    modelo: '',
    cor: '',
    versao: '',
    ano: '',
  });
  const [errosVeiculo, setErrosVeiculo] = useState({});
  const [saving, setSaving] = useState(false);

  function setFieldCliente(field, value) {
    setFormCliente(prev => ({ ...prev, [field]: value }));
    if (errosCliente[field]) setErrosCliente(prev => ({ ...prev, [field]: null }));
  }

  function setFieldVeiculo(field, value) {
    setFormVeiculo(prev => ({ ...prev, [field]: value }));
    if (errosVeiculo[field]) setErrosVeiculo(prev => ({ ...prev, [field]: null }));
  }

  function validarCliente() {
    const e = {};
    if (!formCliente.nome.trim()) e.nome = 'Informe o nome';
    if (!formCliente.email.trim()) e.email = 'Informe o e-mail';
    if (!formCliente.senhaHash || formCliente.senhaHash.length < 6) e.senhaHash = 'Mínimo 6 caracteres';
    if (!formCliente.documento.trim()) e.documento = `Informe o ${tipoDoc}`;
    if (tipoDoc === 'CNPJ' && !formCliente.razaoSocial.trim()) e.razaoSocial = 'Informe a razão social';
    if (!formCliente.dataNascimento.trim()) e.dataNascimento = 'Informe a data';
    setErrosCliente(e);
    return Object.keys(e).length === 0;
  }

  function validarVeiculo() {
    const e = {};
    if (!formVeiculo.modelo.trim()) e.modelo = 'Informe o modelo';
    if (!formVeiculo.ano.trim()) e.ano = 'Informe o ano';
    setErrosVeiculo(e);
    return Object.keys(e).length === 0;
  }

  function showAlert(title, msg) {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n${msg}`);
    } else {
      Alert.alert(title, msg);
    }
  }

  async function handleAvancarParaVeiculo() {
    if (!validarCliente()) return;
    setSalvandoCliente(true);
    try {
      let payload;
      let res;
      const docLimpo = formCliente.documento.replace(/\D/g, '');
      if (tipoDoc === 'CPF') {
        payload = {
          nome: formCliente.nome,
          email: formCliente.email,
          senhaHash: formCliente.senhaHash,
          cpf: docLimpo,
          dataNascimento: formCliente.dataNascimento,
          role: 'CLIENTE',
        };
        res = await createPessoaFisica(payload);
      } else {
        payload = {
          nome: formCliente.nome,
          email: formCliente.email,
          senhaHash: formCliente.senhaHash,
          cnpj: docLimpo,
          razaoSocial: formCliente.razaoSocial,
          dataNascimento: formCliente.dataNascimento,
          role: 'CLIENTE',
        };
        res = await createPessoaJuridica(payload);
      }
      setClienteCriado(res.data);
      setEtapa('veiculo');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.userMessage || 'Verifique os dados e tente novamente.';
      showAlert('Erro ao cadastrar cliente', msg);
    } finally {
      setSalvandoCliente(false);
    }
  }

  async function handleCriarPedido() {
    if (!validarVeiculo()) return;
    if (!clienteCriado?.id) {
      showAlert('Erro', 'Cliente não foi criado. Volte e tente novamente.');
      return;
    }
    setSaving(true);
    try {
      // 1. Criar produto com dados do veículo
      const produtoRes = await createProduto({
        modelo: formVeiculo.modelo,
        versao: formVeiculo.versao || null,
        cor: formVeiculo.cor || null,
        ano: parseInt(formVeiculo.ano),
      });
      const produto = produtoRes.data;
      const idProduto = produto.idProduto || produto.id;

      // 2. Criar pedido
      const pedidoRes = await createPedido({
        idCliente: clienteCriado.id,
        idVendedor: user?.id,
        dataPedido: new Date().toISOString(),
        valorTotal: 0,
      });
      const pedido = pedidoRes.data;

      // 3. Criar item do pedido
      await createItemPedido({
        idPedido: pedido.id,
        idProduto: idProduto,
        quantidade: 1,
      });

      // 4. Criar veículo vinculado ao pedido
      await createVeiculo({
        idProduto: idProduto,
        chassi: Date.now() % 100000,
        statusVeiculo: 'AGUARDANDO',
        idPedido: pedido.id,
      });

      showAlert('Pedido criado!', `Pedido #${pedido.id} criado com sucesso.\nO cliente ${formCliente.nome} já pode acompanhar pelo app.`);
      navigation.goBack();
    } catch (err) {
      showAlert('Erro ao criar pedido', err.userMessage || err.response?.data?.mensagem || 'Tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header title="Novo Pedido" navigation={navigation} showBack />

      <View style={styles.steps}>
        {ETAPAS.map((s, i) => {
          const isActive = etapa === s;
          const isDone = ETAPAS.indexOf(etapa) > i;
          return (
            <React.Fragment key={s}>
              <View style={styles.stepItem}>
                <View style={[styles.stepDot, isActive && styles.stepDotActive, isDone && styles.stepDotDone]}>
                  {isDone
                    ? <Ionicons name="checkmark" size={12} color={COLORS.white} />
                    : <Text style={styles.stepNum}>{i + 1}</Text>
                  }
                </View>
                <Text style={[styles.stepLabel, isActive && styles.stepLabelActive]}>
                  {ETAPA_LABELS[i]}
                </Text>
              </View>
              {i < ETAPAS.length - 1 && (
                <View style={[styles.stepLine, isDone && styles.stepLineDone]} />
              )}
            </React.Fragment>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {etapa === 'cliente' && (
          <View>
            <Text style={styles.etapaTitle}>Dados do Cliente</Text>

            <View style={styles.tipoRow}>
              {['CPF', 'CNPJ'].map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.tipoBtn, tipoDoc === t && styles.tipoBtnActive]}
                  onPress={() => {
                    setTipoDoc(t);
                    setFieldCliente('documento', '');
                  }}
                >
                  <Text style={[styles.tipoBtnText, tipoDoc === t && styles.tipoBtnTextActive]}>
                    {t === 'CPF' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Input
              label="Nome *"
              value={formCliente.nome}
              onChangeText={v => setFieldCliente('nome', v)}
              placeholder="Nome completo"
              autoCapitalize="words"
              error={errosCliente.nome}
            />

            {tipoDoc === 'CNPJ' && (
              <Input
                label="Razão Social *"
                value={formCliente.razaoSocial}
                onChangeText={v => setFieldCliente('razaoSocial', v)}
                placeholder="Empresa Ltda."
                autoCapitalize="words"
                error={errosCliente.razaoSocial}
              />
            )}

            <Input
              label="E-mail *"
              value={formCliente.email}
              onChangeText={v => setFieldCliente('email', v)}
              placeholder="cliente@email.com"
              keyboardType="email-address"
              error={errosCliente.email}
            />

            <Input
              label="Senha *"
              value={formCliente.senhaHash}
              onChangeText={v => setFieldCliente('senhaHash', v)}
              placeholder="Mínimo 6 caracteres"
              secureTextEntry
              error={errosCliente.senhaHash}
            />

            <Input
              label={`${tipoDoc} *`}
              value={formCliente.documento}
              onChangeText={v => setFieldCliente('documento', tipoDoc === 'CPF' ? maskCPF(v) : maskCNPJ(v))}
              placeholder={tipoDoc === 'CPF' ? '000.000.000-00' : '00.000.000/0000-00'}
              keyboardType="numeric"
              error={errosCliente.documento}
            />

            <Input
              label={tipoDoc === 'CPF' ? 'Data de Nascimento *' : 'Data de Abertura *'}
              value={formCliente.dataNascimento}
              onChangeText={v => setFieldCliente('dataNascimento', v)}
              placeholder="AAAA-MM-DD"
              keyboardType="numeric"
              error={errosCliente.dataNascimento}
            />

            <Button
              title="Próximo: Veículo"
              onPress={handleAvancarParaVeiculo}
              loading={salvandoCliente}
              style={styles.nextBtn}
            />
          </View>
        )}

        {etapa === 'veiculo' && (
          <View>
            <Text style={styles.etapaTitle}>Dados do Veículo</Text>

            {clienteCriado && (
              <View style={styles.clienteInfo}>
                <Ionicons name="checkmark-circle" size={16} color="#28a745" />
                <Text style={styles.clienteInfoText}>
                  Cliente: {clienteCriado.nome || formCliente.nome} ({formCliente.email})
                </Text>
              </View>
            )}

            <Input
              label="Modelo *"
              value={formVeiculo.modelo}
              onChangeText={v => setFieldVeiculo('modelo', v)}
              placeholder="Ex: Corolla"
              autoCapitalize="words"
              error={errosVeiculo.modelo}
            />

            <Input
              label="Versão"
              value={formVeiculo.versao}
              onChangeText={v => setFieldVeiculo('versao', v)}
              placeholder="Ex: XEI"
              autoCapitalize="characters"
            />

            <Input
              label="Cor"
              value={formVeiculo.cor}
              onChangeText={v => setFieldVeiculo('cor', v)}
              placeholder="Ex: Prata"
              autoCapitalize="words"
            />

            <Input
              label="Ano *"
              value={formVeiculo.ano}
              onChangeText={v => setFieldVeiculo('ano', v)}
              placeholder="Ex: 2024"
              keyboardType="numeric"
              error={errosVeiculo.ano}
            />

            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={16} color="#17A2B8" />
              <Text style={styles.infoText}>
                O veículo será registrado com status inicial "Aguardando" e o pedido ficará disponível na área do cliente.
              </Text>
            </View>

            <View style={styles.btnRow}>
              <Button
                title="Voltar"
                variant="outline"
                onPress={() => setEtapa('cliente')}
                style={styles.btnHalf}
              />
              <Button
                title="Criar Pedido"
                onPress={handleCriarPedido}
                loading={saving}
                style={styles.btnHalf}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, backgroundColor: COLORS.screenBg, flexGrow: 1 },

  steps: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.white, paddingVertical: 14, paddingHorizontal: 32,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  stepItem: { alignItems: 'center', gap: 4 },
  stepDot: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: COLORS.lightGray, alignItems: 'center', justifyContent: 'center',
  },
  stepDotActive: { backgroundColor: COLORS.red },
  stepDotDone: { backgroundColor: COLORS.dark },
  stepNum: { fontSize: 12, fontWeight: '700', color: COLORS.white },
  stepLabel: { fontSize: 11, color: COLORS.textLight, fontWeight: '600' },
  stepLabelActive: { color: COLORS.red },
  stepLine: { flex: 1, height: 2, backgroundColor: COLORS.border, marginHorizontal: 10, marginBottom: 14 },
  stepLineDone: { backgroundColor: COLORS.dark },

  etapaTitle: { fontSize: 16, fontWeight: '700', color: COLORS.dark, marginBottom: 16 },

  tipoRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  tipoBtn: {
    flex: 1, paddingVertical: 11, borderRadius: 6,
    borderWidth: 1.5, borderColor: COLORS.border,
    alignItems: 'center', backgroundColor: COLORS.white,
  },
  tipoBtnActive: { backgroundColor: COLORS.red, borderColor: COLORS.red },
  tipoBtnText: { fontSize: 13, fontWeight: '600', color: COLORS.dark },
  tipoBtnTextActive: { color: COLORS.white },

  nextBtn: { marginTop: 8 },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  btnHalf: { flex: 1 },

  clienteInfo: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#e8f5e9', borderRadius: 8, padding: 12, marginBottom: 16,
  },
  clienteInfoText: { flex: 1, fontSize: 13, color: '#2e7d32', fontWeight: '600' },

  infoBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: '#E8F7FA', borderRadius: 8, padding: 12, marginBottom: 8,
  },
  infoText: { flex: 1, fontSize: 12, color: '#17A2B8', lineHeight: 18 },
});
