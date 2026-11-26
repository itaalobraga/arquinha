import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '../theme';
import { ExitGestureDiagram } from './ExitGestureDiagram';

const LOCK_STEPS =
  Platform.OS === 'ios'
    ? ['Em Ajustes › Acessibilidade, ative o Acesso Guiado.', 'Com o Arquinha aberto, clique 3 vezes no botão lateral.']
    : ['Em Configurações › Segurança, ative a Fixação de app.', 'Abra os apps recentes e fixe o Arquinha.'];

type Props = {
  visible: boolean;
  onClose: () => void;
  onCredits: () => void;
};

export function ParentsSheet({ visible, onClose, onCredits }: Props) {
  const insets = useSafeAreaInsets();
  // No iOS a folha (pageSheet) já fica abaixo da barra de status; no Android ocupa a tela toda.
  const top = Platform.OS === 'android' ? insets.top + 12 : 20;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.container, { paddingTop: top }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Para os pais</Text>
          <Pressable onPress={onClose} hitSlop={12} accessibilityRole="button">
            <Text style={styles.close}>Fechar</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Para sair da brincadeira</Text>
            <ExitGestureDiagram />
            <Text style={styles.body}>
              Segure os dois cantos de cima da tela ao mesmo tempo. Um anel vai enchendo; em 2 segundos você volta
              para cá.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Para travar o celular</Text>
            <Text style={styles.body}>
              Nenhum app consegue bloquear o botão de início sozinho. O próprio sistema faz isso:
            </Text>
            {LOCK_STEPS.map((step, i) => (
              <View key={step} style={styles.step}>
                <Text style={styles.stepNumber}>{i + 1}</Text>
                <Text style={[styles.body, styles.stepText]}>{step}</Text>
              </View>
            ))}
          </View>

          <Pressable onPress={onCredits} style={styles.creditsRow} accessibilityRole="button">
            <Text style={styles.creditsText}>Créditos dos sons</Text>
            <Text style={styles.creditsChevron}>›</Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  title: { fontFamily: fonts.bold, fontSize: 28, color: colors.ink },
  close: { fontFamily: fonts.medium, fontSize: 17, color: colors.accent },
  content: { paddingHorizontal: 20, gap: 14 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.line,
  },
  cardTitle: { fontFamily: fonts.semibold, fontSize: 19, color: colors.ink },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 23, color: colors.inkSoft },
  step: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  stepNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    overflow: 'hidden',
    textAlign: 'center',
    lineHeight: 26,
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.surface,
    backgroundColor: colors.accent,
  },
  stepText: { flex: 1 },
  creditsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  creditsText: { fontFamily: fonts.medium, fontSize: 16, color: colors.inkSoft },
  creditsChevron: { fontFamily: fonts.medium, fontSize: 22, color: colors.inkSoft },
});
