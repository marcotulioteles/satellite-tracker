import React from 'react';
import { Image } from 'react-native';
import { SATELLITE_HEIGHT, SATELLITE_WIDTH } from '../constants/satellite-tracker.const';

interface SatelliteProps {
  satelliteX: number;
  satelliteY: number;
  isVisible: boolean;
}

const Satellite: React.FC<SatelliteProps> = ({ satelliteX, satelliteY, isVisible }) => {
  if (!isVisible) return null;

  return (
    <Image
      source={require('../assets/satellite.png')}
      style={{
        position: 'absolute',
        left: satelliteX,
        top: satelliteY,
        width: SATELLITE_WIDTH,
        height: SATELLITE_HEIGHT,
        resizeMode: 'contain',
      }}
    />
  );
};

export default Satellite;
