import { useState, useEffect } from 'react';
import { DeviceMotion } from 'expo-sensors';
import { useCameraPermissions } from 'expo-camera';

export const useDeviceMotion = (alpha: number) => {
  const [azimuth, setAzimuth] = useState(0);
  const [elevation, setElevation] = useState(0);
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    const requestMotionPermission = async () => {
      const { status } = await DeviceMotion.requestPermissionsAsync();
      if (permission && !permission?.granted) {
        alert('Permission to access device motion is required!');
        return;
      }

      let motionSubscription = DeviceMotion.addListener((data) => {
        if (data.rotation) {
          let { alpha: rotAlpha, beta, gamma } = data.rotation;

          let alphaDeg = (rotAlpha * 180) / Math.PI;
          if (alphaDeg < 0) alphaDeg += 360;

          let adjustedAzimuth = alphaDeg;
          let adjustedElevation = beta * (180 / Math.PI);

          setAzimuth((prev) => prev + alpha * (adjustedAzimuth - prev));
          setElevation((prev) => prev + alpha * (adjustedElevation - prev));
        }
      });

      DeviceMotion.setUpdateInterval(100);

      return () => {
        if (motionSubscription) {
          motionSubscription.remove();
        }
      };
    };

    requestMotionPermission();
  }, [alpha]);

  return { azimuth, elevation };
};
