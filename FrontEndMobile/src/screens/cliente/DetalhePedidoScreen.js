import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getMeusPedidos, getVeiculos, getStatusFabricacao } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { useToast } from '../../context/ToastContext';
import Header from '../../components/Header';
import StatusBadge from '../../components/StatusBadge';
import Card from '../../components/Card';
import { COLORS } from '../../constants';

const FABRICACAO_STEPS = ['AGUARDANDO', 'MONTAGEM_ESTRUTURAL', 'INSTALACAO_MOTOR', 'PINTURA', 'ACABAMENTO_INTERNO', 'INSPECAO_FINAL', 'LIBERACAO_TRANSPORTE', 'ENTREGUE'];

const STEP_LABELS = {
  AGUARDANDO: 'Aguardando',
  MONTAGEM_ESTRUTURAL: 'Montagem Estrutural',
  INSTALACAO_MOTOR: 'Instalação do Motor',
  PINTURA: 'Pintura',
  ACABAMENTO_INTERNO: 'Acabamento Interno',
  INSPECAO_FINAL: 'Inspeção Final',
  LIBERACAO_TRANSPORTE: 'Liberação Transporte',
  ENTREGUE: 'Entregue',
};

export default function DetalhePedidoScreen({ route, navigation }) {
  const { pedidoId } = route.params;
  const [pedido, setPedido] = useState(null);
  const [statusFab, setStatusFab] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { lastNotification } = useNotification();
  const { show: showToast } = useToast();
  const prevStatusRef = useRef(null);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      // Buscar pedido pela lista de meus-pedidos (acessível ao cliente)
      const pedRes = await getMeusPedidos();
      const pedidos = pedRes.data?.content || pedRes.data || [];
      const ped = pedidos.find(p => p.id === pedidoId);
      if (!ped) { setPedido(null); return; }

      // Buscar veículo vinculado ao pedido
      try {
        const veicRes = await getVeiculos();
        const veiculos = veicRes.data?.content || veicRes.data || [];
        const veiculoPedido = veiculos.find(v => v.idPedido === pedidoId);
        if (veiculoPedido) ped.veiculo = veiculoPedido;
      } catch {}

      setPedido(ped);

      // Buscar status fabricação
      if (ped.veiculo?.id) {
        try {
          const fabRes = await getStatusFabricacao(ped.veiculo.id);
          setStatusFab(fabRes.data || []);
        } catch { setStatusFab([]); }
      }
    } catch {
      setPedido(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [pedidoId]);

  useFocusEffect(useCallback(() => {
    fetchData();
    const interval = setInterval(() => fetchData(true), 5000);
    return () => clearInterval(interval);
  }, [fetchData]));

  useEffect(() => {
    if (lastNotification) fetchData();
  }, [lastNotification]);

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  }

  function formatCurrency(value) {
    if (value == null) return '—';
    return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  const latestStatus = pedido?.veiculo?.statusVeiculo || (statusFab.length > 0 ? statusFab[statusFab.length - 1]?.status : null);
  const currentStepIndex = FABRICACAO_STEPS.indexOf(latestStatus);

  useEffect(() => {
    if (latestStatus && prevStatusRef.current && latestStatus !== prevStatusRef.current) {
      showToast({
        type: 'success',
        text1: 'Etapa atualizada!',
        text2: `${STEP_LABELS[prevStatusRef.current] || prevStatusRef.current} → ${STEP_LABELS[latestStatus] || latestStatus}`,
      });
    }
    prevStatusRef.current = latestStatus;
  }, [latestStatus]);

  if (loading) {
    return (
      <View style={styles.screen}>
        <Header title="Detalhe do Pedido" navigation={navigation} showBack />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.red} />
        </View>
      </View>
    );
  }

  if (!pedido) {
    return (
      <View style={styles.screen}>
        <Header title="Detalhe do Pedido" navigation={navigation} showBack />
        <View style={styles.center}>
          <Text style={styles.errorText}>Pedido não encontrado.</Text>
        </View>
      </View>
    );
  }

  const veiculo = pedido.veiculo;
  const produto = pedido.itens?.[0]?.produto || veiculo?.produto;

  return (
    <View style={styles.screen}>
      <Header title={`Pedido #${pedido.id}`} navigation={navigation} showBack />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} colors={[COLORS.red]} />
        }
      >
        <Card>
          <Text style={styles.sectionTitle}>Resumo do Pedido</Text>
          <Row label="Número" value={`#${pedido.id}`} />
          <Row label="Data" value={formatDate(pedido.dataPedido)} />
          {pedido.vendedor?.nome && <Row label="Vendedor" value={pedido.vendedor.nome} />}
          <View style={styles.statusRow}>
            <Text style={styles.rowLabel}>Status</Text>
            <StatusBadge status={pedido.status || 'PENDENTE'} />
          </View>
        </Card>

        {produto && (
          <Card>
            <Text style={styles.sectionTitle}>Veículo</Text>
            <Row label="Modelo" value={produto.modelo || '—'} />
            <Row label="Versão" value={produto.versao || '—'} />
            <Row label="Ano" value={produto.ano || '—'} />
            <Row label="Cor" value={produto.cor || '—'} />
            {veiculo?.chassi && <Row label="Chassi" value={veiculo.chassi} />}
            {veiculo?.statusVeiculo && (
              <View style={styles.statusRow}>
                <Text style={styles.rowLabel}>Fabricação</Text>
                <StatusBadge status={veiculo.statusVeiculo} />
              </View>
            )}
          </Card>
        )}

        <Card>
          <Text style={styles.sectionTitle}>Acompanhamento de Fabricação</Text>
          {!latestStatus ? (
            <Text style={styles.noStatus}>Nenhum status de fabricação registrado ainda.</Text>
          ) : (
            <View style={styles.timeline}>
              {FABRICACAO_STEPS.map((step, index) => {
                const isDone = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const isLast = index === FABRICACAO_STEPS.length - 1;
                return (
                  <View key={step} style={styles.timelineItem}>
                    <View style={styles.timelineLeft}>
                      <View style={[styles.dot, isDone && styles.dotDone, isCurrent && styles.dotCurrent]}>
                        {isDone && (
                          <Ionicons
                            name={isCurrent ? 'ellipse' : 'checkmark'}
                            size={isCurrent ? 8 : 12}
                            color={COLORS.white}
                          />
                        )}
                      </View>
                      {!isLast && <View style={[styles.line, isDone && styles.lineDone]} />}
                    </View>
                    <View style={styles.timelineContent}>
                      <Text style={[styles.stepLabel, isDone && styles.stepLabelDone]}>
                        {STEP_LABELS[step]}
                      </Text>
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
  sectionTitle: {
    fontSize: 13, fontWeight: '700', color: COLORS.red,
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: COLORS.ultraLight },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  rowLabel: { fontSize: 13, color: COLORS.textSecondary },
  rowValue: { fontSize: 13, color: COLORS.dark, fontWeight: '500', maxWidth: '60%', textAlign: 'right' },
  rowValueBold: { fontWeight: '700', fontSize: 15 },
  noStatus: { color: COLORS.textLight, fontSize: 13, textAlign: 'center', paddingVertical: 12 },
  timeline: { paddingTop: 4 },
  timelineItem: { flexDirection: 'row', marginBottom: 0 },
  timelineLeft: { alignItems: 'center', width: 28, marginRight: 12 },
  dot: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: COLORS.border,
  },
  dotDone: { backgroundColor: COLORS.dark, borderColor: COLORS.dark },
  dotCurrent: { backgroundColor: COLORS.red, borderColor: COLORS.red },
  line: { width: 2, flex: 1, minHeight: 20, backgroundColor: COLORS.border, marginVertical: 2 },
  lineDone: { backgroundColor: COLORS.dark },
  timelineContent: { flex: 1, paddingBottom: 16 },
  stepLabel: { fontSize: 14, fontWeight: '600', color: COLORS.lightGray },
  stepLabelDone: { color: COLORS.dark },
  stepDate: { fontSize: 11, color: COLORS.textLight, marginTop: 2 },
  stepObs: { fontSize: 12, color: COLORS.textSecondary, marginTop: 3, fontStyle: 'italic' },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  itemBorder: { borderTopWidth: 1, borderTopColor: COLORS.ultraLight },
  itemIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#FFF0F0', alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  itemName: { fontSize: 14, fontWeight: '600', color: COLORS.dark },
  itemSub: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  itemTotal: { fontSize: 14, fontWeight: '700', color: COLORS.dark },
});
