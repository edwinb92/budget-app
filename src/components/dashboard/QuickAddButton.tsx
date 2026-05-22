import React from 'react';
import { StyleSheet } from 'react-native';
import { Plus } from 'lucide-react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { colors, radius, shadows } from '@/theme';

interface QuickAddButtonProps {
  onPress?: () => void;
}

export const QuickAddButton: React.FC<QuickAddButtonProps> = ({ onPress }) => {
  const scale = useSharedValue(1);

  const tap = Gesture.Tap()
    .maxDuration(600)
    .onBegin(() => {
      scale.value = withSpring(0.92, { damping: 18, stiffness: 320 });
    })
    .onFinalize((_, success) => {
      scale.value = withSpring(1, { damping: 14, stiffness: 240 });
      if (success && onPress) {
        runOnJS(onPress)();
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={tap}>
      <Animated.View style={[styles.fab, shadows.floating, animatedStyle]}>
        <Plus size={26} color={colors.onPrimary} strokeWidth={2.8} />
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  fab: {
    width: 60,
    height: 60,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
