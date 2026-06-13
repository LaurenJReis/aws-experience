import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, RefreshControl, Alert, Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useToast } from '../../context/ToastContext';
import { getPedido, getVeiculos, getStatusFabricacao, updateVeiculo } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import Header from '../../components/Header';
import StatusBadge from '../../components/StatusBadge';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { COLORS } from '../../constants';

const FAB_STEPS = ['AGUARDANDO', 'MONTAGEM_ESTRUTURAL', 'INSTALACAO_MOTOR', 'PINTURA', 'ACABAMENTO_INTERNO', 'INSPECAO_FINAL', 'LIBERACAO_TRANSPORTE', 'ENTREGUE'];

const STATUS_LABELS = {
  PENDENTE: 'Pendente', CONFIRMADO: 'Confirmado', EM_PRODUCAO: 'Em Produção',
  PRONTO: 'Pronto', ENTREGUE: 'Entregue', CANCELADO: 'Cancelado',
  AGUARDANDO: 'Aguardando', MONTAGEM_ESTRUTURAL: 'Montagem Estrutural',
  INSTALACAO_MOTOR: 'Instalação Motor', PINTURA: 'Pintura',
  ACABAMENTO_INTERNO: 'Acabamento Interno', INSPECAO_FINAL: 'Inspeção Final',
  LIBERACAO_TRANSPORTE: 'Liberação Transporte',
};

export default function GerenciarPedidoScreen({ route, navigation }) {
  const { pedidoId } = route.params;
  const [pedido, setPedido] = useState(null);
  const [statusFab, setStatusFab] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const { lastNotification } = useNotification();
  const { show } = useToast();

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const pedRes = await getPedido(pedidoId);
      const ped = pedRes.data;
      try {
        const veicRes = await getVeiculos();
        const lista = veicRes.data?.content || veicRes.data || [];
        const veiculoPedido = lista.find(v => v.idPedido === pedidoId);
        if (veiculoPedido) ped.veiculo = veiculoPedido;
      } catch {}
      setPedido(ped);
      if (ped.veiculo?.id) {
        try {
          const fabRes = await getStatusFabricacao(ped.veiculo.id);
          setStatusFab(fabRes.data || []);
        } catch { setStatusFab([]); }
      }
    } catch { setPedido(null); }
    finally { setLoading(false); setRefreshing(false); }
  }, [pedidoId]);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  useEffect(() => {
    if (lastNotification) fetchData();
  }, [lastNotification]);

  async function handleConfirmarEntrega() {
    const confirmar = Platform.OS === 'web'
      ? window.confirm('Confirmar que o veículo foi entregue ao cliente?')
      : await new Promise(resolve => Alert.alert(
          'Confirmar Entrega',
          'O veículo chegou na concessionária e será entregue ao cliente?',
          [{ text: 'Cancelar', onPress: () => resolve(false) }, { text: 'Confirmar', onPress: () => resolve(true) }]
        ));
    if (!confirmar) return;

    const veiculoId = pedido?.veiculo?.id;
    if (!veiculoId) return;

    setConfirming(true);
    try {
      await updateVeiculo(veiculoId, { statusVeiculo: 'ENTREGUE' });
      show({ type: 'success', text1: 'Entrega confirmada!', text2: 'O cliente será notificado.' });
      await fetchData();
    } catch (err) {
      show({ type: 'error', text1: 'Erro', text2: err.userMessage || 'Não foi possível confirmar a entrega.' });
    } finally { setConfirming(false); }
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  }

  function formatCurrency(value) {
    if (value == null) return '—';
    return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  if (loading) {
    return (
      <View style={styles.screen}>
        <Header title="Gerenciar Pedido" navigation={navigation} showBack />
        <View style={styles.center}><ActivityIndicator size="large" color={COLORS.red} /></View>
      </View>
    );
  }

  if (!pedido) {
    return (
      <View style={styles.screen}>
        <Header title="Gerenciar Pedido" navigation={navigation} showBack />
        <View style={styles.center}><Text style={styles.errorText}>Pedido não encontrado.</Text></View>
      </View>
    );
  }

  const veiculo = pedido.veiculo || null;
  const cliente = pedido.cliente?.nome || '—';
  const latestStatus = veiculo?.statusVeiculo || null;
  const currentStepIndex = FAB_STEPS.indexOf(latestStatus);

  console.log('=== DEBUG GERENCIAR PEDIDO ===');
  console.log('veiculo:', veiculo);
  console.log('statusVeiculo:', latestStatus);
  console.log('statusFab:', statusFab);
  console.log('podeConfirmarEntrega:', latestStatus === 'LIBERACAO_TRANSPORTE');

  // Botão aparece quando o veículo existe e ainda não foi entregue
  const jaEntregue = latestStatus === 'ENTREGUE';
  const podeConfirmarEntrega = veiculo && !jaEntregue;

  return (
    <View style={styles.screen}>
      <Header title={`Pedido #${pedido.id}`} navigation={navigation} showBack />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} colors={[COLORS.red]} />}
      >
        <Card>
          <Text style={styles.sectionTitle}>Resumo</Text>
          <Row label="Cliente" value={cliente} />
          <Row label="Data" value={formatDate(pedido.dataPedido || pedido.createdAt)} />
          <Row label="Total" value={formatCurrency(pedido.valorTotal)} bold />
          <View style={styles.statusRow}>
            <Text style={styles.rowLabel}>Status Pedido</Text>
            <StatusBadge status={pedido.status} />
          </View>
        </Card>

        {veiculo && (
          <Card>
            <Text style={styles.sectionTitle}>Veículo</Text>
            <Row label="Modelo" value={veiculo.produto?.modelo || '—'} />
            <Row label="Versão" value={veiculo.produto?.versao || '—'} />
            <Row label="Ano" value={veiculo.produto?.ano || '—'} />
            <Row label="Cor" value={veiculo.produto?.cor || '—'} />
            <Row label="Chassi" value={veiculo.chassi || '—'} />
            <View style={styles.statusRow}>
              <Text style={styles.rowLabel}>Fabricação</Text>
              <StatusBadge status={latestStatus || 'AGUARDANDO'} />
            </View>
          </Card>
        )}

        {/* Botão de confirmar entrega */}
        {podeConfirmarEntrega && (
          <Card>
            <Text style={styles.sectionTitle}>Ação do Vendedor</Text>
            <Text style={styles.entregaInfo}>
              O veículo chegou na concessionária. Confirme a entrega ao cliente.
            </Text>
            <Button
              title="✓ Confirmar Entrega"
              onPress={handleConfirmarEntrega}
              loading={confirming}
              style={styles.btnEntrega}
            />
          </Card>
        )}

        {jaEntregue && (
          <Card>
            <View style={styles.entregueBox}>
              <Text style={styles.entregueIcon}>✓</Text>
              <Text style={styles.entregueText}>Veículo entregue ao cliente</Text>
            </View>
          </Card>
        )}

        <Card>
          <Text style={styles.sectionTitle}>Linha do Tempo — Fabricação</Text>
          {statusFab.length === 0 ? (
            <Text style={styles.noStatus}>Nenhum status registrado. Aguardando atualização automática.</Text>
          ) : (
            <View style={styles.timeline}>
              {FAB_STEPS.map((step, index) => {
                const isDone = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const isLast = index === FAB_STEPS.length - 1;
                const record = statusFab.find(s => s.status === step);
                return (
                  <View key={step} style={styles.timelineItem}>
                    <View style={styles.timelineLeft}>
                      <View style={[styles.dot, isDone && styles.dotDone, isCurrent && styles.dotCurrent]} />
                      {!isLast && <View style={[styles.line, isDone && !isCurrent && styles.lineDone]} />}
                    </View>
                    <View style={[styles.timelineContent, isLast && { paddingBottom: 0 }]}>
                      <Text style={[styles.stepLabel, isDone && styles.stepLabelDone]}>
                        {STATUS_LABELS[step]}
                      </Text>
                      {record?.dataStatus && (
                        <Text style={styles.stepDate}>{formatDate(record.dataStatus)}</Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </Card>
      </ScrollView>
    </View>
  );
}

function Row({ label, value, bold }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, bold && styles.rowValueBold]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.screenBg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: 16 },
  errorText: { color: COLORS.mediumGray, fontSize: 15 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.red, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: COLORS.ultraLight },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  rowLabel: { fontSize: 13, color: COLORS.textSecondary },
  rowValue: { fontSize: 13, color: COLORS.dark, fontWeight: '500', maxWidth: '60%', textAlign: 'right' },
  rowValueBold: { fontWeight: '700', fontSize: 15 },
  noStatus: { color: COLORS.textLight, fontSize: 13, textAlign: 'center', paddingVertical: 12 },
  entregaInfo: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 12, lineHeight: 19 },
  btnEntrega: { backgroundColor: '#2E7D32' },
  entregueBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, gap: 8 },
  entregueIcon: { fontSize: 20, color: '#2E7D32', fontWeight: '700' },
  entregueText: { fontSize: 15, fontWeight: '700', color: '#2E7D32' },
  timeline: { paddingTop: 4 },
  timelineItem: { flexDirection: 'row' },
  timelineLeft: { alignItems: 'center', width: 28, marginRight: 12 },
  dot: { width: 22, height: 22, borderRadius: 11, backgroundColor: COLORS.lightGray, borderWidth: 2, borderColor: COLORS.border },
  dotDone: { backgroundColor: COLORS.dark, borderColor: COLORS.dark },
  dotCurrent: { backgroundColor: COLORS.red, borderColor: COLORS.red },
  line: { width: 2, flex: 1, minHeight: 18, backgroundColor: COLORS.border, marginVertical: 2 },
  lineDone: { backgroundColor: COLORS.dark },
  timelineContent: { flex: 1, paddingBottom: 16 },
  stepLabel: { fontSize: 14, fontWeight: '600', color: COLORS.lightGray },
  stepLabelDone: { color: COLORS.dark },
  stepDate: { fontSize: 11, color: COLORS.textLight, marginTop: 2 },
});
