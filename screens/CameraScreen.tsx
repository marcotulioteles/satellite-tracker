import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, Image, Dimensions } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { DeviceMotion } from "expo-sensors";

type Subscription = {
  remove: () => void;
};

const alpha = 0.1;

const { width, height } = Dimensions.get("window");

const radarWidth = 160;
const radarHeight = 160;
const satelliteWidth = 50;
const satelliteHeight = 50;
const arrowSize = 50;

const CameraScreen: React.FC = () => {
  const [smoothedAzimuth, setSmoothedAzimuth] = useState<number>(0);
  const [smoothedElevation, setSmoothedElevation] = useState<number>(0);
  const [permission] = useCameraPermissions();

  useEffect(() => {
    let motionSubscription: Subscription | null = null;
  
    motionSubscription = DeviceMotion.addListener((data) => {
      if (data.rotation) {
        // Convert radians to degrees
        let alphaDeg = (data.rotation.alpha * 180) / Math.PI;
        let betaDeg = (data.rotation.beta * 180) / Math.PI;

        // Normalize alpha to [0, 360]
        if (alphaDeg < 0) {
          alphaDeg += 360;
        }

        // Apply low-pass filter
        setSmoothedAzimuth((prev) => prev + alpha * (alphaDeg - prev));
        setSmoothedElevation((prev) => prev + alpha * (betaDeg - prev));
      }
    });

    DeviceMotion.setUpdateInterval(100);

    return () => {
      if (motionSubscription) {
        motionSubscription.remove();
      }
    }
  }, []);

  const getAzimuthAndElevation = () => {
    // let { alpha, beta, gamma } = orientationData;
    const { azimuth, elevation } = {
      azimuth: smoothedAzimuth,
      elevation: smoothedElevation
    }

    return { azimuth, elevation };
  };

  const { azimuth, elevation } = getAzimuthAndElevation();

  const satellitePosition = {
    azimuth: 120,
    elevation: 30
  }

  // Calculate differences
  let azimuthDiff = satellitePosition.azimuth - azimuth;
  let elevationDiff = satellitePosition.elevation - elevation;

  // Normalize differences to [-180, 180]
  if (azimuthDiff > 180) azimuthDiff -= 360;
  if (azimuthDiff < -180) azimuthDiff += 360;

  // Determine visibility and alignment
  const azimuthThreshold = 45;     // degrees
  const elevationThreshold = 30;   // degrees
  const alignmentThreshold = 15;    // degrees

  const isSatelliteVisible =
    Math.abs(azimuthDiff) <= azimuthThreshold &&
    Math.abs(elevationDiff) <= elevationThreshold;

  const isSatelliteAligned =
    Math.abs(azimuthDiff) <= alignmentThreshold &&
    Math.abs(elevationDiff) <= alignmentThreshold;

  // Calculate positions
  const radarX = (width - radarWidth) / 2;
  const radarY = (height - radarHeight) / 2;

  const satelliteInitialX = (width - satelliteWidth) / 2;
  const satelliteInitialY = (height - satelliteHeight) / 2;

  const satelliteTranslateX = (azimuthDiff / azimuthThreshold) * (width / 2);
  const satelliteTranslateY = (-elevationDiff / elevationThreshold) * (height / 2);

  const satelliteX = satelliteInitialX + satelliteTranslateX;
  const satelliteY = satelliteInitialY + satelliteTranslateY;

  // Define bounding rectangles
  const radarRect = {
    x: radarX,
    y: radarY,
    width: radarWidth,
    height: radarHeight,
  };

  const satelliteRect = {
    x: satelliteX,
    y: satelliteY,
    width: satelliteWidth,
    height: satelliteHeight,
  };

  // Function to check overlap
  const isOverlapping = (rect1: any, rect2: any) => {
    return !(
      rect1.x + rect1.width < rect2.x ||
      rect1.x > rect2.x + rect2.width ||
      rect1.y + rect1.height < rect2.y ||
      rect1.y > rect2.y + rect2.height
    );
  };

  // Check if the satellite overlaps the radar
  const satelliteOverlapsRadar = isOverlapping(radarRect, satelliteRect);

  // Set the radar tint color
  const radarTintColor = satelliteOverlapsRadar ? 'green' : 'white';

  // Set the message
  let message = '';
  if (satelliteOverlapsRadar) {
    message = 'Melhor posição encontrada!';
  } else if (isSatelliteVisible) {
    message = 'O satélite está próximo!';
  }

  if (!permission) {
    return <View />;
  }
  if (!permission?.granted) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing="back">
        {/* Radar Overlay */}
        <View
          style={[
            styles.radarContainer,
            {
              left: radarX,
              top: radarY,
            },
          ]}
        >
          <Image
            source={require('../assets/radar.png')}
            style={[
              styles.radar,
              { tintColor: radarTintColor },
            ]}
          />
          {message !== '' && (
            <Text style={styles.alignmentText}>{message}</Text>
          )}
        </View>

        {/* Display satellite image if visible */}
        {isSatelliteVisible && (
          <Image
            source={require('../assets/satellite.png')}
            style={[
              styles.satellite,
              {
                left: satelliteX,
                top: satelliteY,
              },
            ]}
          />
        )}

        {/* Guidance Arrows */}
        {!isSatelliteVisible && (
          <View style={styles.arrowContainer}>
            {azimuthDiff < -azimuthThreshold && (
              <Image
                source={require('../assets/arrow.png')}
                style={[styles.arrow, styles.arrowRight]}
              />
            )}
            {azimuthDiff > azimuthThreshold && (
              <Image
                source={require('../assets/arrow.png')}
                style={[styles.arrow, styles.arrowLeft]}
              />
            )}
            {elevationDiff < -elevationThreshold && (
              <Image
                source={require('../assets/arrow.png')}
                style={[styles.arrow, styles.arrowUp]}
              />
            )}
            {elevationDiff > elevationThreshold && (
              <Image
                source={require('../assets/arrow.png')}
                style={[styles.arrow, styles.arrowDown]}
              />
            )}
          </View>
        )}
      </CameraView>
    </View>
  );
};

export default CameraScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  radarContainer: {
    position: 'absolute',
    width: radarWidth,
    height: radarHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radar: {
    width: radarWidth,
    height: radarHeight,
    resizeMode: 'contain',
  },
  alignmentText: {
    color: 'white',
    textAlign: 'center',
    marginTop: 10,
  },
  satellite: {
    position: 'absolute',
    width: satelliteWidth,
    height: satelliteHeight,
    resizeMode: 'contain',
  },
  arrowContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    position: 'absolute',
    width: arrowSize,
    height: arrowSize,
    resizeMode: 'contain',
  },
  arrowUp: {
    left: (width - arrowSize) / 2,
    top: 10,
    transform: [{ rotate: '270deg' }]
  },
  arrowDown: {
    left: (width - arrowSize) / 2,
    bottom: 10,
    transform: [{ rotate: '90deg' }]
  },
  arrowLeft: {
    left: 10,
    top: (height - arrowSize) / 2,
    transform: [{ rotate: '180deg' }]
  },
  arrowRight: {
    right: 10,
    top: (height - arrowSize) / 2,
  },
});
