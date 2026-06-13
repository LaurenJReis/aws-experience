import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, RefreshControl, Alert, Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getVeiculo, getStatusFabricacao, updateVeiculo } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { useToast } from '../../context/ToastContext';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import { COLORS } from '../../constants';

const STEPS = ['AGUARDANDO', 'MONTAGEM_ESTRUTURAL', 'INSTALACAO_MOTOR', 'PINTURA', 'ACABAMENTO_INTERNO', 'INSPECAO_FINAL', 'LIBERACAO_TRANSPORTE', 'ENTREGUE'];

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

const STEP_DESC = {
  AGUARDANDO: 'Veículo na fila de produção.',
  MONTAGEM_ESTRUTURAL: 'Montagem da estrutura do veículo.',
  INSTALACAO_MOTOR: 'Instalação do motor e componentes.',
  PINTURA: 'Pintura e acabamento externo.',
  ACABAMENTO_INTERNO: 'Acabamento interno e eletrônica.',
  INSPECAO_FINAL: 'Inspeção e testes de qualidade.',
  LIBERACAO_TRANSPORTE: 'Veículo liberado para transporte.',
  ENTREGUE: 'Veículo entregue ao cliente.',
};

export default function DetalheVeiculoScreen({ route, navigation }) {
  const { veiculoId } = route.params;
  const [veiculo, setVeiculo] = useState(null);
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
      const [veicRes, fabRes] = await Promise.all([
        getVeiculo(veiculoId),
        getStatusFabricacao(veiculoId),
      ]);
      setVeiculo(veicRes.data);
      setStatusFab(fabRes.data || []);
    } catch {
      setVeiculo(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [veiculoId]);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  useEffect(() => {
    if (lastNotification) fetchData();
  }, [lastNotification]);

  function formatDate(dateStr) {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('pt-BR');
  }

  async function handleConfirmarEntrega() {
    const confirmar = Platform.OS === 'web'
      ? window.confirm('Confirmar que o veículo foi entregue ao cliente?')
      : await new Promise(resolve => Alert.alert(
          'Confirmar Entrega',
          'O veículo chegou na concessionária e será entregue ao cliente?',
          [{ text: 'Cancelar', onPress: () => resolve(false) }, { text: 'Confirmar', onPress: () => resolve(true) }]
        ));
    if (!confirmar) return;
    setConfirming(true);
    try {
      await updateVeiculo(veiculoId, { statusVeiculo: 'ENTREGUE' });
      show({ type: 'success', text1: 'Entrega confirmada!', text2: 'O cliente será notificado.' });
      await fetchData();
    } catch (err) {
      show({ type: 'error', text1: 'Erro', text2: err.userMessage || 'Não foi possível confirmar a entrega.' });
    } finally { setConfirming(false); }
  }

  const latestStatus = veiculo?.statusVeiculo || null;
  const currentStepIndex = STEPS.indexOf(latestStatus);
  const progresso = currentStepIndex >= 0 ? (currentStepIndex + 1) / STEPS.length : 0;
  const jaEntregue = latestStatus === 'ENTREGUE';
  const podeConfirmarEntrega = veiculo && !jaEntregue;

  if (loading) {
    return (
      <View style={styles.screen}>
        <Header title="Detalhe do Veículo" navigation={navigation} showBack />
        <View style={styles.center}><ActivityIndicator size="large" color={COLORS.red} /></View>
      </View>
    );
  }

  if (!veiculo) {
    return (
      <View style={styles.screen}>
        <Header title="Detalhe do Veículo" navigation={navigation} showBack />
        <View style={styles.center}><Text style={styles.errorText}>Veículo não encontrado.</Text></View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Header title={veiculo.produto?.modelo || `Veículo #${veiculo.id}`} navigation={navigation} showBack />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} colors={[COLORS.red]} />}
      >
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="car-sport-outline" size={48} color={COLORS.red} />
          </View>
          <Text style={styles.heroTitle}>{veiculo.produto?.modelo || '—'}</Text>
          <Text style={styles.heroSub}>{[veiculo.produto?.ano, veiculo.produto?.cor].filter(Boolean).join(' · ')}</Text>
          {latestStatus && (
            <View style={styles.heroBadge}><StatusBadge status={latestStatus} /></View>
          )}
        </View>

        {latestStatus && (
          <Card style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Progresso de Fabricação</Text>
              <Text style={styles.progressPct}>{Math.round(progresso * 100)}%</Text>
            </View>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${progresso * 100}%` }]} />
            </View>
            <Text style={styles.progressSub}>
              Etapa {currentStepIndex + 1} de {STEPS.length} — {STEP_LABELS[latestStatus]}
            </Text>
          </Card>
        )}

        <Card>
          <Text style={styles.sectionTitle}>Dados do Veículo</Text>
          <Row label="Modelo" value={veiculo.produto?.modelo || '—'} />
          <Row label="Versão" value={veiculo.produto?.versao || '—'} />
          <Row label="Ano" value={veiculo.produto?.ano || '—'} />
          <Row label="Cor" value={veiculo.produto?.cor || '—'} />
          <Row label="Chassi" value={veiculo.chassi || '—'} />
        </Card>

        {podeConfirmarEntrega && (
          <Card>
            <Text style={styles.sectionTitle}>Ação do Vendedor</Text>
            <Text style={styles.entregaInfo}>
              Quando o veículo chegar na concessionária, confirme a entrega ao cliente.
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
          <Text style={styles.sectionTitle}>Linha do Tempo</Text>
          {statusFab.length === 0 ? (
            <View style={styles.emptyTimeline}>
              <Ionicons name="time-outline" size={32} color={COLORS.lightGray} />
              <Text style={styles.emptyTimelineText}>Aguardando atualização automática.</Text>
            </View>
          ) : (
            <View style={styles.timeline}>
              {STEPS.map((step, index) => {
                const isDone = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const isLast = index === STEPS.length - 1;
                const record = statusFab.find((s) => s.status === step);
                return (
                  <View key={step} style={styles.timelineItem}>
                    <View style={styles.timelineLeft}>
                      <View style={[styles.dot, isDone && styles.dotDone, isCurrent && styles.dotCurrent]}>
                        {isDone && !isCurrent && <Ionicons name="checkmark" size={12} color={COLORS.white} />}
                        {isCurrent && <View style={styles.dotInner} />}
                      </View>
                      {!isLast && <View style={[styles.line, isDone && !isCurrent && styles.lineDone]} />}
                    </View>
                    <View style={[styles.timelineContent, isLast && { paddingBottom: 0 }]}>
                      <View style={styles.timelineHeader}>
                        <Text style={[styles.stepLabel, isDone && styles.stepLabelDone]}>
                          {STEP_LABELS[step]}
                        </Text>
                        {record?.dataStatus && <Text style={styles.stepDate}>{formatDate(record.dataStatus)}</Text>}
                      </View>
                      <Text style={[styles.stepDesc, isDone && styles.stepDescDone]}>
                        {STEP_DESC[step]}
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

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.screenBg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: 16 },
  errorText: { color: COLORS.mediumGray, fontSize: 15 },
  hero: {
    alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 10,
    padding: 24, marginBottom: 12, elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3,
  },
  heroIcon: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFF0F0',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  heroTitle: { fontSize: 20, fontWeight: '700', color: COLORS.dark },
  heroSub: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  heroBadge: { marginTop: 12 },
  progressCard: { marginBottom: 12 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  progressLabel: { fontSize: 13, fontWeight: '700', color: COLORS.dark },
  progressPct: { fontSize: 18, fontWeight: '900', color: COLORS.red },
  progressBg: { height: 8, backgroundColor: COLORS.ultraLight, borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: 8, backgroundColor: COLORS.red, borderRadius: 4 },
  progressSub: { fontSize: 12, color: COLORS.textLight },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.red, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: COLORS.ultraLight },
  rowLabel: { fontSize: 13, color: COLORS.textSecondary },
  rowValue: { fontSize: 13, color: COLORS.dark, fontWeight: '500' },
  emptyTimeline: { alignItems: 'center', paddingVertical: 20, gap: 8 },
  emptyTimelineText: { fontSize: 13, color: COLORS.textLight },
  timeline: { paddingTop: 4 },
  timelineItem: { flexDirection: 'row' },
  timelineLeft: { alignItems: 'center', width: 32, marginRight: 14 },
  dot: {
    width: 26, height: 26, borderRadius: 13, backgroundColor: COLORS.ultraLight,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.border,
  },
  dotDone: { backgroundColor: COLORS.dark, borderColor: COLORS.dark },
  dotCurrent: { backgroundColor: COLORS.red, borderColor: COLORS.red },
  dotInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.white },
  line: { width: 2, flex: 1, minHeight: 16, backgroundColor: COLORS.border, marginVertical: 3 },
  lineDone: { backgroundColor: COLORS.dark },
  timelineContent: { flex: 1, paddingBottom: 20 },
  timelineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
  stepLabel: { fontSize: 14, fontWeight: '700', color: COLORS.lightGray },
  stepLabelDone: { color: COLORS.dark },
  stepDate: { fontSize: 11, color: COLORS.textLight },
  stepDesc: { fontSize: 12, color: COLORS.lightGray, lineHeight: 17 },
  stepDescDone: { color: COLORS.textSecondary },
  entregaInfo: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 12, lineHeight: 19 },
  btnEntrega: { backgroundColor: '#2E7D32' },
  entregueBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, gap: 8 },
  entregueIcon: { fontSize: 20, color: '#2E7D32', fontWeight: '700' },
  entregueText: { fontSize: 15, fontWeight: '700', color: '#2E7D32' },
});
