import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Svg, { Path } from 'react-native-svg';

class PramLogo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rotateAnim: new Animated.Value(0),
      bounceAnim: new Animated.Value(0)
    };
  }

  componentDidMount() {
    // Start wheel rotation animation if animated prop is true
    if (this.props.animated) {
      this.startAnimation();
    }
  }

  startAnimation() {
    // Create wheel rotation animation
    Animated.loop(
      Animated.timing(this.state.rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();

    // Create subtle bouncing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(this.state.bounceAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(this.state.bounceAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        })
      ])
    ).start();
  }

  render() {
    const { size = 100, color = '#623131', style, animated = false } = this.props;
    
    // Calculate animation values
    const spin = this.state.rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg']
    });
    
    const bounce = this.state.bounceAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -5]
    });

    const animatedStyle = animated ? {
      transform: [{ translateY: bounce }]
    } : {};

    return (
      <Animated.View style={[styles.container, style, animatedStyle]}>
        <View style={styles.svgContainer}>
          <Svg width={size} height={size} viewBox="0 0 300 300">
            {/* Pram body */}
            <Path
              d="M130,200 Q160,180 190,200 L220,200 Q240,200 240,180 L240,150 L130,150 L60,150 L60,200 Q60,220 80,220 L110,220 Q140,200 170,220 L200,220"
              stroke={color}
              strokeWidth="14"
              fill="none"
            />
            
            {/* Canopy */}
            <Path
              d="M240,150 Q270,140 280,100 Q285,70 260,50 Q235,30 210,60 Q195,80 180,120 L130,150"
              stroke={color}
              strokeWidth="14"
              fill="none"
            />
            
            {/* Handle */}
            <Path
              d="M60,150 L60,120 Q60,80 100,80"
              stroke={color}
              strokeWidth="14"
              fill="none"
            />
          </Svg>
        </View>
        
        {/* Left wheel */}
        <Animated.View 
          style={[
            styles.wheel, 
            { left: size * 0.2, bottom: size * 0.08 },
            animated && { transform: [{ rotate: spin }] }
          ]}
        >
          <View style={[styles.wheelOuter, { borderColor: color }]}>
            <View style={[styles.wheelInner, { backgroundColor: color }]} />
          </View>
        </Animated.View>
        
        {/* Right wheel */}
        <Animated.View 
          style={[
            styles.wheel, 
            { right: size * 0.2, bottom: size * 0.08 },
            animated && { transform: [{ rotate: spin }] }
          ]}
        >
          <View style={[styles.wheelOuter, { borderColor: color }]}>
            <View style={[styles.wheelInner, { backgroundColor: color }]} />
          </View>
        </Animated.View>
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  svgContainer: {
    position: 'relative',
  },
  wheel: {
    position: 'absolute',
    width: 26,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelOuter: {
    width: '100%',
    height: '100%',
    borderRadius: 13,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelInner: {
    width: '40%',
    height: '40%',
    borderRadius: 5,
  }
});

export default PramLogo;