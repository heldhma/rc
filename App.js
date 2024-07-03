import React, { useState, useEffect } from 'react';
import { View, Text, TouchableNativeFeedback, TextInput, PermissionsAndroid, StyleSheet, ToastAndroid, Platform } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';

const GOOGLE_API_KEY = 'AIzaSyCijIcbd5cIEcrotzynzLZnfObCZUaYJzI';

const App = () => {
  const [region, setRegion] = useState({
    latitude: -8.047562, // Coordenadas iniciais para Recife, Brasil
    longitude: -34.877,
    latitudeDelta: 0.0123,
    longitudeDelta: 0.0023,
  });
  const [destination, setDestination] = useState('');
  const [historicPlaces, setHistoricPlaces] = useState([]);

  useEffect(() => {
    getHistoricPlaces();
    geolocation();
  }, []);

  const hasLocationPermission = async () => {
    if (Platform.OS === 'android' && Platform.Version <= 28) {
      return true;
    }
    const hasPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
    if (hasPermission) return true;
    const status = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
    if (status === PermissionsAndroid.RESULTS.GRANTED) return true;
    if (status === PermissionsAndroid.RESULTS.DENIED) {
      ToastAndroid.show(
        'Permissão de localização negada pelo usuário.',
        ToastAndroid.LONG
      );
    } else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      ToastAndroid.show(
        'Permissão de localização revogada pelo usuário.',
        ToastAndroid.LONG
      );
    }
    return false;
  };

  const geolocation = async () => {
    const hasPermission = await hasLocationPermission();
    if (hasPermission) {
      Geolocation.watchPosition(
        position => {
          setRegion({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            latitudeDelta: 0.0123,
            longitudeDelta: 0.0023,
          });
        },
        error => {
          console.log(error.code, error.message);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 100000 }
      );
    }
  };

  const getHistoricPlaces = async () => {
    try {
      const response = await fetch('https://api.jsonbin.io/v3/qs/668501c0e41b4d34e40c6fc5');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setHistoricPlaces(data.record); // Atualize esta linha se o JSON tiver uma estrutura diferente
    } catch (error) {
      console.error('Error fetching historic places data:', error);
      ToastAndroid.show(`Error fetching historic places data: ${error.message}`, ToastAndroid.LONG);
    }
  };

  const onRegionChange = region => {
    setRegion(region);
  };

  const filteredPlaces = historicPlaces.filter(place =>
    place.name.toLowerCase().includes(destination.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <MapView
        loadingEnabled
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        showsPointsOfInterest
        showsMyLocationButton
        region={region}
        onRegionChangeComplete={onRegionChange}
      >
        {filteredPlaces.map((place, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: place.latitude,
              longitude: place.longitude
            }}
            title={place.name}
            description={place.address}
          />
        ))}
      </MapView>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Pesquisar por um local"
          value={destination}
          onChangeText={setDestination}
        />
        <TouchableNativeFeedback onPress={() => geolocation()}>
          <View style={styles.geolocationButton}>
            <FontAwesome name="location-arrow" size={24} color="#fff" />
          </View>
        </TouchableNativeFeedback>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF'
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%'
  },
  searchContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 10
  },
  geolocationButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default App;
