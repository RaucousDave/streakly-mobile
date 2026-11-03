import { router } from 'expo-router';

import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import { StyleSheet, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <Screen scroll={false} contentStyle={styles.content}>
      <View style={styles.copy}>
        <Text variant="display">Off the page.</Text>
        <Text variant="body" color="textMuted">
          This entry is not in the ledger. Head back to today and pick up the streak there.
        </Text>
      </View>

      <Button label="Back to today" onPress={() => router.replace('/')} size="lg" fullWidth />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: 'center',
    flexGrow: 1,
    gap: Spacing.six,
  },
  copy: {
    gap: Spacing.three,
  },
});
