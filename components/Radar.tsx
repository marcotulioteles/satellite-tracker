import React from 'react';
import { View, Image, Text } from 'react-native';
import { RADAR_WIDTH, RADAR_HEIGHT } from '../constants/satellite-tracker.const';

interface RadarProps {
  radarX: number;
  radarY: number;
  radarTintColor: string;
  message: string;
}

const Radar: React.FC<RadarProps> = ({ radarX, radarY, radarTintColor, message }) => {
  return (
    <View
      style={{
        position: 'absolute',
        left: radarX,
        top: radarY,
        width: RADAR_WIDTH,
        height: RADAR_HEIGHT,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Image
        source={require('../assets/radar.png')}
        style={{
          width: RADAR_WIDTH,
          height: RADAR_HEIGHT,
          tintColor: radarTintColor,
          resizeMode: 'contain',
        }}
      />
      {message && <Text style={{ color: 'white', marginTop: 10 }}>{message}</Text>}
    </View>
  );
};

export default Radar;
