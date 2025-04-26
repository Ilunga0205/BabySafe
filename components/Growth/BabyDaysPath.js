import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  Dimensions, 
  Animated,
  StyleSheet 
} from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Defs, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const NODE_SIZE = width / 5; // Slightly larger nodes
const PATH_WIDTH = 20; // Wider path for more visibility
const MILESTONE_SIZE = NODE_SIZE * 1.3; // Special milestone nodes
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function BabyDaysPath({ 
  month, 
  journalEntries, 
  onDayPress, 
  colors,
  navigation 
}) {
  const [pathLayout, setPathLayout] = useState([]);
  const [animatedValue] = useState(new Animated.Value(0));
  const [nodeAnimations, setNodeAnimations] = useState([]);
  const scrollViewRef = useRef(null);
  
  // Generate path layout for the month
  useEffect(() => {
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    
    // Create path nodes with positions (improved Candy Crush style winding path)
    const nodes = [];
    const columns = 3; // Fewer columns for a more winding path
    let row = 0;
    let direction = 1; // 1 = right, -1 = left
    
    // Define milestones (special days in the month)
    const milestones = [1, 7, 14, 21, 28]; // First day, end of weeks
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(month.getFullYear(), month.getMonth(), day);
      const dateStr = dateObj.toISOString().split('T')[0];
      const hasEntry = !!journalEntries[dateStr];
      const isMilestone = milestones.includes(day);
      
      // Calculate position in the winding path
      const col = direction > 0 ? (day - 1) % columns : columns - 1 - ((day - 1) % columns);
      
      // Move to next row when reaching end of current row
      if (day > 1 && (day - 1) % columns === 0) {
        row++;
        direction *= -1; // Change direction for each row
      }
      
      // Add some random variation to make path more interesting
      const jitterX = Math.sin(day * 0.5) * 10;
      const jitterY = Math.cos(day * 0.7) * 5;
      
      // Position calculation (zigzag pattern with more space between rows)
      const nodeSize = isMilestone ? MILESTONE_SIZE : NODE_SIZE;
      const xPos = 25 + col * (NODE_SIZE + 20) + jitterX;
      const yPos = 30 + row * (NODE_SIZE + 50) + jitterY;
      
      // Previous day to check if this one should be unlocked
      const prevDay = new Date(dateObj);
      prevDay.setDate(day - 1);
      const prevDayStr = prevDay.toISOString().split('T')[0];
      
      nodes.push({
        day,
        dateStr,
        hasEntry,
        entry: journalEntries[dateStr],
        position: { x: xPos, y: yPos },
        completed: hasEntry,
        isMilestone,
        nodeSize,
        unlocked: day === 1 || !!journalEntries[prevDayStr],
        isToday: day === new Date().getDate() && 
                 month.getMonth() === new Date().getMonth() && 
                 month.getFullYear() === new Date().getFullYear()
      });
    }
    
    setPathLayout(nodes);
    
    // Create animation values for each node
    const animations = nodes.map(() => new Animated.Value(0));
    setNodeAnimations(animations);
    
    // Run sequential animation for nodes appearing
    Animated.stagger(70, 
      animations.map(anim => 
        Animated.spring(anim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true
        })
      )
    ).start();
    
    // Animate the connecting path
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false
    }).start();
    
  }, [month, journalEntries]);
  
  // Generate SVG path between nodes with improved curves
  const generateConnectingPath = () => {
    if (pathLayout.length < 2) return null;
    
    let pathD = `M ${pathLayout[0].position.x + pathLayout[0].nodeSize/2} ${pathLayout[0].position.y + pathLayout[0].nodeSize/2}`;
    
    for (let i = 1; i < pathLayout.length; i++) {
      const prev = pathLayout[i-1];
      const curr = pathLayout[i];
      const prevPos = prev.position;
      const currPos = curr.position;
      
      // Use quadratic curves for smoother path
      const midX = (prevPos.x + currPos.x) / 2;
      const midY = (prevPos.y + currPos.y) / 2;
      
      // Add control points for more natural curves
      if (Math.abs(prevPos.y - currPos.y) > 10) {
        // For diagonal movements, create S-shaped curves
        const cpX1 = prevPos.x + (currPos.x - prevPos.x) * 0.25;
        const cpY1 = prevPos.y + (currPos.y - prevPos.y) * 0.75;
        const cpX2 = prevPos.x + (currPos.x - prevPos.x) * 0.75;
        const cpY2 = prevPos.y + (currPos.y - prevPos.y) * 0.25;
        
        pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${currPos.x + curr.nodeSize/2} ${currPos.y + curr.nodeSize/2}`;
      } else {
        // For horizontal movements, create gentle curves
        const cpY = midY + (Math.random() > 0.5 ? 15 : -15);
        pathD += ` Q ${midX} ${cpY}, ${currPos.x + curr.nodeSize/2} ${currPos.y + curr.nodeSize/2}`;
      }
    }
    
    return pathD;
  };

  // Road markers for the path (decorative elements)
  const generateRoadMarkers = () => {
    if (pathLayout.length < 3) return null;
    
    const markers = [];
    for (let i = 1; i < pathLayout.length - 1; i++) {
      if (i % 3 !== 0) continue; // Only add markers occasionally
      
      const prev = pathLayout[i-1].position;
      const curr = pathLayout[i].position;
      const next = pathLayout[i+1].position;
      
      // Calculate middle points between nodes
      const midX1 = (prev.x + curr.x) / 2;
      const midY1 = (prev.y + curr.y) / 2;
      const midX2 = (curr.x + next.x) / 2;
      const midY2 = (curr.y + next.y) / 2;
      
      // Small road marker lines
      markers.push(
        <Path
          key={`marker-${i}`}
          d={`M ${midX1} ${midY1} L ${midX2} ${midY2}`}
          stroke="#FFFFFF"
          strokeWidth={4}
          strokeDasharray="5,12"
          strokeLinecap="round"
          opacity={0.7}
        />
      );
    }
    return markers;
  };

  // Render day node with enhanced design
  const renderDayNode = (node, index) => {
    const { day, hasEntry, unlocked, position, isToday, isMilestone, nodeSize } = node;
    
    // Scale animation for each node
    const scale = nodeAnimations[index] ? nodeAnimations[index].interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1]
    }) : 1;
    
    const rotation = nodeAnimations[index] ? nodeAnimations[index].interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', isMilestone ? '360deg' : '0deg']
    }) : '0deg';
    
    const nodeStyles = [
      styles.dayNode,
      {
        left: position.x,
        top: position.y,
        width: nodeSize,
        height: nodeSize,
        transform: [{ scale }, { rotate: rotation }]
      }
    ];
    
    // Different node styles based on state
    let nodeContent;
    
    if (hasEntry) {
      // Day with entry - More decorative completed node
      nodeContent = (
        <LinearGradient
          colors={isMilestone ? ['#FFD700', colors.primary] : ['#9C6644', colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.dayNodeInner, styles.completedNode]}
        >
          <View style={styles.innerCircle}>
            <Text style={[styles.dayText, isMilestone && styles.milestoneText]}>{day}</Text>
            {node.entry?.entryTypes?.includes('photo') && (
              <View style={styles.entryIndicator}>
                <MaterialIcons name="photo" size={14} color="#FFF" />
              </View>
            )}
            {node.entry?.entryTypes?.includes('milestone') && (
              <View style={[styles.entryIndicator, { backgroundColor: '#FFD700' }]}>
                <MaterialIcons name="star" size={12} color="#FFF" />
              </View>
            )}
          </View>
        </LinearGradient>
      );
    } else if (isToday) {
      // Today's node - Pulsing effect
      nodeContent = (
        <LinearGradient
          colors={['#7A5C61', '#9C6644']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.dayNodeInner, styles.todayNode]}
        >
          <View style={styles.pulsingCircle}>
            <Text style={styles.dayText}>{day}</Text>
            <FontAwesome5 name="baby" size={14} color="#FFFFFF" style={{ marginTop: 4 }} />
          </View>
        </LinearGradient>
      );
    } else if (unlocked) {
      // Unlocked but no entry - Inviting button
      nodeContent = (
        <LinearGradient
          colors={['#FFFFFF', '#F8F8F8']}
          style={[styles.dayNodeInner, styles.unlockedNode]}
        >
          <View style={styles.innerCircleUnlocked}>
            <Text style={styles.dayTextUnlocked}>{day}</Text>
            <MaterialIcons name="add-circle-outline" size={16} color="#9C6644" style={{ marginTop: 2 }} />
          </View>
        </LinearGradient>
      );
    } else {
      // Locked node - Clearly locked
      nodeContent = (
        <LinearGradient
          colors={['#E0E0E0', '#CCCCCC']}
          style={[styles.dayNodeInner, styles.lockedNode]}
        >
          <View style={styles.innerCircleLocked}>
            <Text style={styles.dayTextLocked}>{day}</Text>
            <MaterialIcons name="lock" size={16} color="#888" style={{ marginTop: 2 }} />
          </View>
        </LinearGradient>
      );
    }
    
    // Handle node press with haptic feedback
    const handlePress = () => {
      if (!unlocked) return;
      
      // Add haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Call the provided onDayPress function to open AddEntryModal
      onDayPress(node);
    };
    
    return (
      <Animated.View key={`day-${day}`} style={nodeStyles}>
        <TouchableOpacity
          onPress={handlePress}
          disabled={!unlocked}
          style={styles.nodeTouchable}
          activeOpacity={0.7}
        >
          {nodeContent}
        </TouchableOpacity>
        
        {/* Node shadow for depth */}
        <View style={[
          styles.nodeShadow,
          {
            width: nodeSize,
            height: nodeSize / 4,
            borderRadius: nodeSize / 2,
            top: nodeSize - 5
          }
        ]} />
        
        {/* Day label */}
        {(hasEntry || isToday || (unlocked && isMilestone)) && (
          <View style={styles.dayLabel}>
            <Text style={styles.dayLabelText}>
              Day {day}
            </Text>
          </View>
        )}
      </Animated.View>
    );
  };
  
  // Calculate total height needed for the path
  const getPathHeight = () => {
    if (pathLayout.length === 0) return 500;
    const lastNode = pathLayout[pathLayout.length - 1];
    return lastNode.position.y + lastNode.nodeSize + 150; // Add padding at bottom
  };
  
  // Get path stroke dasharray for animation
  const getStrokeDashArray = () => {
    // Calculate total path length (approximation)
    let totalLength = 0;
    
    for (let i = 1; i < pathLayout.length; i++) {
      const prev = pathLayout[i-1].position;
      const curr = pathLayout[i].position;
      
      // Calculate distance between points
      const dx = curr.x - prev.x;
      const dy = curr.y - prev.y;
      totalLength += Math.sqrt(dx*dx + dy*dy) * 1.5; // Adjust for curves
    }
    
    // Use animated value for dash offset animation
    const dashOffset = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [totalLength, 0]
    });
    
    return {
      strokeDasharray: [totalLength],
      strokeDashoffset: dashOffset
    };
  };

  // Scroll to today's node if it exists
  useEffect(() => {
    if (pathLayout.length > 0 && scrollViewRef.current) {
      const todayNode = pathLayout.find(node => node.isToday);
      if (todayNode) {
        // Add a slight delay to ensure rendering is complete
        setTimeout(() => {
          scrollViewRef.current.scrollTo({
            y: Math.max(0, todayNode.position.y - 200),
            animated: true
          });
        }, 1000);
      }
    }
  }, [pathLayout]);

  return (
    <ScrollView 
      ref={scrollViewRef}
      style={styles.container}
      contentContainerStyle={[
        styles.contentContainer,
        { height: getPathHeight() }
      ]}
    >
      {/* Background decorations */}
      <View style={styles.backgroundDecorations}>
        <Image
          source={require('../../assets/picture1.png')}
          style={styles.decoration1}
          resizeMode="contain"
        />
        <Image
          source={require('../../assets/picture1.png')}
          style={styles.decoration2}
          resizeMode="contain"
        />
        
        {/* Additional baby-themed decorations */}
        <View style={[styles.cloudDecoration, { top: '15%', left: '10%' }]}>
          <Svg height="60" width="100">
            <Path
              d="M10,30 Q25,10 40,30 T70,30 Q85,10 90,30 Q100,50 80,50 L20,50 Q0,50 10,30"
              fill="#F0F4FF"
              opacity={0.6}
            />
          </Svg>
        </View>
        
        <View style={[styles.cloudDecoration, { top: '35%', right: '5%' }]}>
          <Svg height="50" width="80">
            <Path
              d="M10,25 Q20,10 30,25 T50,25 Q65,10 70,25 Q80,40 65,40 L15,40 Q0,40 10,25"
              fill="#F0F4FF"
              opacity={0.6}
            />
          </Svg>
        </View>
        
        <View style={[styles.cloudDecoration, { top: '55%', left: '15%' }]}>
          <Svg height="40" width="70">
            <Path
              d="M10,20 Q20,5 30,20 T50,20 Q60,5 65,20 Q70,35 55,35 L15,35 Q0,35 10,20"
              fill="#F0F4FF"
              opacity={0.6}
            />
          </Svg>
        </View>
        
        {/* Stars decoration */}
        {[...Array(15)].map((_, i) => (
          <View 
            key={`star-${i}`} 
            style={[
              styles.starDecoration, 
              { 
                top: `${10 + Math.random() * 80}%`, 
                left: `${Math.random() * 90}%`,
                opacity: 0.2 + Math.random() * 0.3,
                transform: [{ scale: 0.5 + Math.random() * 0.5 }]
              }
            ]}
          >
            <Svg height="20" width="20">
              <Path
                d="M10,0 L12,7 L19,7 L14,12 L16,19 L10,15 L4,19 L6,12 L1,7 L8,7 Z"
                fill="#FFD700"
              />
            </Svg>
          </View>
        ))}
      </View>
      
      {/* Path SVG - Enhanced with better styling */}
      <View style={styles.pathContainer}>
        <Svg height="100%" width="100%">
          <Defs>
            <SvgLinearGradient id="roadGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#B0B0B0" stopOpacity="1" />
              <Stop offset="1" stopColor="#E0E0E0" stopOpacity="1" />
            </SvgLinearGradient>
            <SvgLinearGradient id="pathGradient" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={colors.primary} stopOpacity="1" />
              <Stop offset="1" stopColor="#9C6644" stopOpacity="1" />
            </SvgLinearGradient>
          </Defs>
          
          {/* Shadow effect for path */}
          <Path
            d={generateConnectingPath()}
            stroke="#00000030"
            strokeWidth={PATH_WIDTH + 5}
            fill="none"
            strokeLinecap="round"
            translateY={3}
            translateX={3}
          />
          
          {/* Background path (road) */}
          <Path
            d={generateConnectingPath()}
            stroke="url(#roadGradient)"
            strokeWidth={PATH_WIDTH}
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Road markers */}
          {generateRoadMarkers()}
          
          {/* Animated colored path */}
          <AnimatedPath
            d={generateConnectingPath()}
            stroke="url(#pathGradient)"
            strokeWidth={PATH_WIDTH - 6}
            fill="none"
            strokeLinecap="round"
            {...getStrokeDashArray()}
          />
          
          {/* Start circle with animation */}
          {pathLayout.length > 0 && (
            <>
              {/* Outer glow */}
              <AnimatedCircle
                cx={pathLayout[0].position.x + pathLayout[0].nodeSize/2}
                cy={pathLayout[0].position.y + pathLayout[0].nodeSize/2}
                r={PATH_WIDTH/2 + 10}
                fill="rgba(156, 102, 68, 0.3)"
                opacity={animatedValue}
              />
              
              {/* Start point */}
              <Circle
                cx={pathLayout[0].position.x + pathLayout[0].nodeSize/2}
                cy={pathLayout[0].position.y + pathLayout[0].nodeSize/2}
                r={PATH_WIDTH/2 + 4}
                fill={colors.primary}
              />
              
              {/* Inner circle */}
              <Circle
                cx={pathLayout[0].position.x + pathLayout[0].nodeSize/2}
                cy={pathLayout[0].position.y + pathLayout[0].nodeSize/2}
                r={PATH_WIDTH/2 - 2}
                fill="#FFFFFF"
              />
            </>
          )}
          
          {/* End point */}
          {pathLayout.length > 0 && (
            <Circle
              cx={pathLayout[pathLayout.length-1].position.x + pathLayout[pathLayout.length-1].nodeSize/2}
              cy={pathLayout[pathLayout.length-1].position.y + pathLayout[pathLayout.length-1].nodeSize/2}
              r={PATH_WIDTH/2 + 2}
              fill="#FFD700"
              stroke={colors.primary}
              strokeWidth={3}
            />
          )}
        </Svg>
      </View>
      
      {/* Day nodes */}
      {pathLayout.map((node, index) => renderDayNode(node, index))}
      
      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>Baby's Journey</Text>
        
        <View style={styles.instructionRow}>
          <View style={styles.instructionItem}>
            <View style={[styles.sampleNode, styles.completedNode]}>
              <MaterialIcons name="check" size={14} color="#FFF" />
            </View>
            <Text style={styles.instructionText}>Entry Added</Text>
          </View>
          
          <View style={styles.instructionItem}>
            <View style={[styles.sampleNode, styles.todayNode]}>
              <Text style={styles.sampleDayText}>T</Text>
            </View>
            <Text style={styles.instructionText}>Today</Text>
          </View>
          
          <View style={styles.instructionItem}>
            <View style={[styles.sampleNode, styles.unlockedNode]}>
              <Text style={styles.sampleDayTextUnlocked}>+</Text>
            </View>
            <Text style={styles.instructionText}>Available</Text>
          </View>
        </View>
      </View>
      
      {/* Month title */}
      <View style={styles.monthTitleContainer}>
        <LinearGradient
          colors={[colors.primary, '#9C6644']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.monthTitleGradient}
        >
          <Text style={styles.monthTitle}>
            {month.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </Text>
        </LinearGradient>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFCFC',
  },
  contentContainer: {
    position: 'relative',
    paddingBottom: 80,
  },
  backgroundDecorations: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  decoration1: {
    position: 'absolute',
    width: 100,
    height: 100,
    opacity: 0.1,
    top: '20%',
    right: '10%',
  },
  decoration2: {
    position: 'absolute',
    width: 120,
    height: 120,
    opacity: 0.1,
    top: '50%',
    left: '7%',
  },
  cloudDecoration: {
    position: 'absolute',
    zIndex: 1,
  },
  starDecoration: {
    position: 'absolute',
    zIndex: 1,
  },
  pathContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
  },
  dayNode: {
    position: 'absolute',
    zIndex: 3,
  },
  nodeTouchable: {
    width: '100%',
    height: '100%',
  },
  dayNodeInner: {
    width: '100%',
    height: '100%',
    borderRadius: NODE_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  innerCircle: {
    width: '85%',
    height: '85%',
    borderRadius: NODE_SIZE / 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  innerCircleUnlocked: {
    width: '85%',
    height: '85%',
    borderRadius: NODE_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#9C6644',
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  innerCircleLocked: {
    width: '85%',
    height: '85%',
    borderRadius: NODE_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BBBBBB',
    backgroundColor: 'rgba(240,240,240,0.9)',
  },
  completedNode: {
    borderWidth: 3,
    borderColor: '#FFF',
  },
  todayNode: {
    borderWidth: 3,
    borderColor: '#FFF',
    borderStyle: 'solid',
  },
  pulsingCircle: {
    width: '85%',
    height: '85%',
    borderRadius: NODE_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  unlockedNode: {
    borderColor: '#9C6644',
    borderWidth: 2,
    borderStyle: 'solid',
  },
  lockedNode: {
    borderColor: '#CCCCCC',
    borderWidth: 1,
  },
  nodeShadow: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.1)',
    alignSelf: 'center',
    zIndex: 2,
  },
  dayText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  milestoneText: {
    fontSize: 22,
    color: '#FFFFFF',
  },
  dayTextUnlocked: {
    color: '#9C6644',
    fontSize: 18,
    fontWeight: '600',
  },
  dayTextLocked: {
    color: '#999',
    fontSize: 16,
    fontWeight: '400',
  },
  dayLabel: {
    position: 'absolute',
    bottom: -20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    zIndex: 4,
  },
  dayLabelText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '500',
  },
  entryIndicator: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  instructionsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 15,
    right: 15,
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
    zIndex: 4,
  },
  instructionsTitle: {
    textAlign: 'center', 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#9C6644',
    marginBottom: 8,
  },
  instructionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  sampleNode: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  sampleDayText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  sampleDayTextUnlocked: {
    color: '#9C6644',
    fontSize: 14,
    fontWeight: '700',
  },
  instructionText: {
    fontSize: 12,
    color: '#555',
    fontWeight: '500',
  },
  monthTitleContainer: {
    position: 'absolute',
    top: 10,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 5,
  },
  monthTitleGradient: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  monthTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  }
});