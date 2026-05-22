import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { colors, radius } from '@/theme';
import { clamp } from '@/utils/format';

interface ProgressBarProps {
  value: number; // 0..1
  color?: string;
  trackColor?: string;
  height?: number;
  animated?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  color = colors.primary,
  trackColor,
  height = 8,
  animated = true,
}) => {
  const progress = useSharedValue(animated ? 0 : clamp(value, 0, 1));

  useEffect(() => {
    const target = clamp(value, 0, 1);
    if (animated) {
      progress.value = withTiming(target, {
        duration: 700,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      progress.value = target;
    }
  }, [value, animated, progress]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View
      style={[
        styles.track,
        {
          height,
          borderRadius: height / 2,
          backgroundColor: trackColor ?? colors.surfaceAlt,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.fill,
          { backgroundColor: color, borderRadius: height / 2 },
          fillStyle,
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: radius.pill,
  },
  fill: {
    height: '100%',
  },
});
