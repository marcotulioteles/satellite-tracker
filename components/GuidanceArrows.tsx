import { View, Image, StyleSheet } from "react-native";
import { ARROW_SIZE, AZIMUTH_THRESHOLD, ELEVATION_THRESHOLD } from '../constants/satellite-tracker.const';

interface GuidanceArrowsProps {
    isSatelliteVisible: boolean,
    azimuthDiff: number,
    elevationDiff: number,
    screenWidth: number,
    screenHeight: number
}

const GuidanceArrows: React.FC<GuidanceArrowsProps> = ({ 
    isSatelliteVisible,
    azimuthDiff,
    elevationDiff,
    screenHeight,
    screenWidth
}) => {
    if (isSatelliteVisible) return null

    return (
        <View style={styles.arrowContainer}>
            {azimuthDiff < -AZIMUTH_THRESHOLD && (
              <Image
                source={require('../assets/arrow.png')}
                style={[styles.arrow, {
                    right: 10,
                    top: (screenHeight - ARROW_SIZE) / 2,
                  }]}
              />
            )}
            {azimuthDiff > AZIMUTH_THRESHOLD && (
              <Image
                source={require('../assets/arrow.png')}
                style={[styles.arrow, {
                    left: 10,
                    top: (screenHeight - ARROW_SIZE) / 2,
                    transform: [{ rotate: '180deg' }]
                  }]}
              />
            )}
            {elevationDiff < -ELEVATION_THRESHOLD && (
              <Image
                source={require('../assets/arrow.png')}
                style={[styles.arrow, {
                    left: (screenWidth - ARROW_SIZE) / 2,
                    top: 10,
                    transform: [{ rotate: '270deg' }]
                  }]}
              />
            )}
            {elevationDiff > ELEVATION_THRESHOLD && (
              <Image
                source={require('../assets/arrow.png')}
                style={[styles.arrow, {
                    left: (screenWidth - ARROW_SIZE) / 2,
                    bottom: 10,
                    transform: [{ rotate: '90deg' }]
                  }]}
              />
            )}
          </View>
    )
}

export default GuidanceArrows;

const styles = StyleSheet.create({
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
    width: ARROW_SIZE,
    height: ARROW_SIZE,
    resizeMode: 'contain',
  }
})