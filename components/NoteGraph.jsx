import * as d3 from 'd3-force';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, View } from 'react-native';
import Svg, { Circle, G, Line, Text as SvgText } from 'react-native-svg';
import NoteEditorModal from './NoteEditorModal';

import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  runOnJS,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

export default function NoteGraph({ notes, relationships, onUpdateNote }) {
  const [nodes, setNodes] = useState(notes);
  const [links, setLinks] = useState(relationships);
  const [selectedNote, setSelectedNote] = useState(null);
  const [transformStr, setTransformStr] = useState('translate(0, 0) scale(1)');

  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const lastPanX = useSharedValue(0);
  const lastPanY = useSharedValue(0);
const initialScale = useSharedValue(1);

 const panGesture = Gesture.Pan()
  .onBegin((e) => {
    lastPanX.value = e.translationX;
    lastPanY.value = e.translationY;
  })
  .onUpdate((e) => {
    const dx = e.translationX - lastPanX.value;
    const dy = e.translationY - lastPanY.value;

    const safeScale = scale.value || 1;

    // Apply pan with dampening
    translateX.value += (dx / safeScale) * 0.5;
    translateY.value += (dy / safeScale) * 0.5;

    lastPanX.value = e.translationX;
    lastPanY.value = e.translationY;
  })
  .enabled(true);



  const pinchGesture = Gesture.Pinch()
  .onBegin(() => {
    initialScale.value = scale.value;
  })
  .onUpdate((e) => {
    // Multiply initial scale by current gesture scale delta
    const newScale = initialScale.value * e.scale;
    scale.value = Math.max(0.5, Math.min(newScale, 3));
  })
  .onEnd(() => {
    // Optionally smooth to the final scale
    scale.value = withTiming(scale.value);
  })
  .enabled(true);


  const composedGesture = Gesture.Simultaneous(panGesture, pinchGesture);

  useDerivedValue(() => {
    const s = Math.max(0.01, scale.value);
    const x = translateX.value;
    const y = translateY.value;
    if (isFinite(x) && isFinite(y) && isFinite(s)) {
      runOnJS(setTransformStr)(`translate(${x}, ${y}) scale(${s})`);
    }
  }, [scale, translateX, translateY]);

  const simulationRef = useRef(null);
  useEffect(() => {
    const sim = d3
      .forceSimulation(notes)
      .force('charge', d3.forceManyBody().strength(-120))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('link', d3.forceLink(relationships).id(d => d.id).distance(100))
      .on('tick', () => {
        setNodes([...sim.nodes()]);
        setLinks([...relationships]);
      });

    simulationRef.current = sim;
    return () => sim.stop();
  }, []);

  const handleNodePress = node => setSelectedNote(node);
  const handleSave = updatedText => {
    setNodes(nodes.map(n => n.id === selectedNote.id ? { ...n, label: updatedText, content: updatedText } : n));
    onUpdateNote?.(nodes);
    setSelectedNote(null);
  };

  return (
    <GestureDetector gesture={composedGesture}>
      <View style={{ flex: 1 }}>
        <Svg width={width} height={height} pointerEvents="none">
          <G transform={transformStr}>
            {links.map((l, i) => (
              <Line key={i} x1={l.source.x} y1={l.source.y} x2={l.target.x} y2={l.target.y} stroke="#aaa" strokeWidth="3" />
            ))}
            {nodes.map((n, i) => (
              <Circle key={i} cx={n.x} cy={n.y} r={20} fill="#4682b4" onPress={() => handleNodePress(n)} />
            ))}
            {nodes.map((n, i) => (
              <SvgText key={`label-${i}`} x={n.x} y={n.y + 35} fontSize="12" textAnchor="middle" fill="#fff">
                {n.label || 'Note'}
              </SvgText>
            ))}
          </G>
        </Svg>

        {selectedNote && (
          <NoteEditorModal note={selectedNote} onClose={() => setSelectedNote(null)} onSave={handleSave} />
        )}
      </View>
    </GestureDetector>
  );
}
