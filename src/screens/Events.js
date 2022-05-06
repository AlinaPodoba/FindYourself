import React, { Component } from 'react';
import {
  Button,
  Text,
  TouchableOpacity,
  View,
  BackHandler,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { connect } from 'react-redux';
import Geolocation from 'react-native-geolocation-service';
import { permission } from '../utils/permission';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'; // remove PROVIDER_GOOGLE import if not using Google Maps

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    height: 400,
    width: 400,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

const reference = database().ref('/users/');
class Events extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lat: 31.8,
      lng: 34.65,
      events: [],
      loading:false
    };
  }
  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    this.eventListener = database()
      .ref('/events')
      .once('value', snapshot => {
        this.intVal = [];
        console.log('User events: ', snapshot.val());
        snapshot.forEach(child => {
          this.intVal.push(child.val());
        });
        this.setState({ events: this.intVal });
      });
    permission.check().then(res => {
      if (res) {
        this.getCurrentLocation();
      } else {
        permission.getCoasreLocation(() => {
          this.getCurrentLocation();
        });
      }
    });
  }
  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
    // database().ref('/events').off('value', this.eventListener);
  }
  handleBackButton() {
    return true;
  }
  getCurrentLocation() {
    const { user, navigation } = this.props;
    // this.setState({ loading: true });
    Geolocation.getCurrentPosition(
      position => {
        console.log(position);
        const { latitude: lat, longitude: lng } = position.coords;
        database()
          .ref('/users/' + user.uid)
          .set({ lat, lng });
        this.setState({
          lat,
          lng,
          loading: false,
        });
      },
      error => {
        // See error code charts below.
        console.log(error.code, error.message);
        this.setState({ loading: false });

        // Alert.alert('location not found', '', [
        //   { text: 'ok', onPress: () => navigation.goBack() },
        // ]);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  }
  getLocationPermission() {}
  render() {
    const { navigation } = this.props;
    return (
      <View>
        <Button
          title="back to Home"
          onPress={() => {
            auth()
              .signOut()
              .then(() => console.log('User signed out!'));
            navigation.goBack();
          }}
        />
        <Text>location</Text>
        <Text>
          lat {this.state.lat} lng {this.state.lng}
        </Text>
        <Text> </Text>

        <Text> </Text>
        <View style={styles.container}>
          {this.state.loading && <ActivityIndicator />}
          {!this.state.loading && (
            <MapView
              provider={PROVIDER_GOOGLE} // remove if not using Google Maps
              style={styles.map}
              region={{
                latitude: this.state.lat,
                longitude: this.state.lng,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}>
              {this.state.events.map((x, i) => (
                <Marker
                  key={i}
                  coordinate={{
                    latitude: x.lat,
                    longitude: x.lng,
                  }}
                  title={x.name}
                  description={x.description}
                />
              ))}
            </MapView>
          )}
        </View>
        {this.state.events && (
          <ScrollView>
            <View>
              {this.state.events.map((x, i) => (
                <View key={i}>
                  <Text>{x.name}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        )}
      </View>
    );
  }
}

const mapStateToProps = state => ({
  user: state.user.user,
});
const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(Events);
