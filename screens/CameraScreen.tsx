import React, { useState } from 'react';
import { View, Dimensions } from 'react-native';
import { CameraView } from 'expo-camera';
import { useDeviceMotion } from '../hooks/useDeviceMotion';
import Radar from '../components/Radar';
import Satellite from '../components/Satellite';
import { isOverlapping, normalizeDifference } from '../utils/satellite-tracker.utils';
import { 
  RADAR_WIDTH,
  RADAR_HEIGHT,
  SATELLITE_WIDTH,
  SATELLITE_HEIGHT,
  AZIMUTH_THRESHOLD,
  ELEVATION_THRESHOLD,
  ALIGNMENT_THRESHOLD,
  ALPHA_SMOOTHING_FACTOR
} from '../constants/satellite-tracker.const';
import GuidanceArrows from '../components/GuidanceArrows';

const FOUND_SATELLITE_MESSAGE = 'Melhor posição encontrada!';
const SATELLITE_IS_CLOSE_MESSAGE = 'O satélite está próximo!';

const CameraScreen: React.FC = () => {
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  const [screenHeight, setScreenHeight] = useState(Dimensions.get('window').height);

  const { azimuth, elevation } = useDeviceMotion(ALPHA_SMOOTHING_FACTOR);

  // Satellite's azimuth and elevation
  const SATELLITE_POSITION_MOCK_DATA = {
    azimuth: 120,
    elevation: 30,
  };

  let azimuthDiff = normalizeDifference(SATELLITE_POSITION_MOCK_DATA.azimuth - azimuth);
  let elevationDiff = normalizeDifference(SATELLITE_POSITION_MOCK_DATA.elevation - elevation);

  const radarX = (screenWidth - RADAR_WIDTH) / 2;
  const radarY = (screenHeight - RADAR_HEIGHT) / 2;

  const isSatelliteVisible =
  Math.abs(azimuthDiff) <= AZIMUTH_THRESHOLD &&
  Math.abs(elevationDiff) <= ELEVATION_THRESHOLD;

  const isSatelliteAligned =
    Math.abs(azimuthDiff) <= ALIGNMENT_THRESHOLD &&
    Math.abs(elevationDiff) <= ALIGNMENT_THRESHOLD;

  const satelliteInitialX = (screenWidth - SATELLITE_WIDTH) / 2;
  const satelliteInitialY = (screenHeight - SATELLITE_HEIGHT) / 2;

  const satelliteTranslateX = (azimuthDiff / AZIMUTH_THRESHOLD) * (screenWidth / 2);
  const satelliteTranslateY = (elevationDiff / ELEVATION_THRESHOLD) * (screenHeight / 2);

  const satelliteX = satelliteInitialX + satelliteTranslateX;
  const satelliteY = satelliteInitialY + satelliteTranslateY;

  const radarRect = { x: radarX, y: radarY, width: RADAR_WIDTH, height: RADAR_HEIGHT };
  const satelliteRect = { x: satelliteX, y: satelliteY, width: SATELLITE_WIDTH, height: SATELLITE_HEIGHT };

  const satelliteOverlapsRadar = isOverlapping(radarRect, satelliteRect);
  const radarTintColor = satelliteOverlapsRadar ? 'green' : 'white';

  let message = '';
  if (satelliteOverlapsRadar) message = FOUND_SATELLITE_MESSAGE;
  else if (isSatelliteVisible) message = SATELLITE_IS_CLOSE_MESSAGE;
  
  return (
    <View style={{ flex: 1 }}>
      <CameraView style={{ flex: 1 }}>
        <Radar radarX={radarX} radarY={radarY} radarTintColor={radarTintColor} message={message} />
        <Satellite satelliteX={satelliteX} satelliteY={satelliteY} isVisible={isSatelliteVisible} />
        <GuidanceArrows 
          azimuthDiff={azimuthDiff} 
          elevationDiff={elevationDiff} 
          isSatelliteVisible={isSatelliteVisible} 
          screenHeight={screenHeight} 
          screenWidth={screenWidth} 
        />
      </CameraView>
    </View>
  );
};

export default CameraScreen;
