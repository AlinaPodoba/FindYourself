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
    minHeight: 200,
    flex: 1,
    borderWidth: 1,
  },
  map: {
    position: 'relative',
    minHeight: 200,
    width: '100%',
  },
});

const reference = database().ref('/users/');
class BusinessScreen extends Component {
  constructor(props) {
    super(props);
    console.log(props);
    this.state = {
      lat: 31.8,
      lng: 34.65,
      events: [],
      loading: false,
      selectEvent: this.props.route.params.event,
      itemId: this.props.route.params.itemId,
      businessId: this.props.route.params.itemId.split('+')[0],
      feedbacks: [],
      menu: [],
      name: '',
      openningHours: '',
    };
  }
  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    this.eventListener = database()
      .ref('/Business/' + this.state.businessId + '/')
      .once('value', snapshot => {
        this.intVal = [];
        console.log('User events: ', snapshot.val());
        snapshot.forEach(child => {
          this.setState({ [child.key]: child.val() });
          console.log('User child: ', child.val());
        });
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

  render() {
    const { navigation } = this.props;
    const { selectEvent, name, openningHours, menu, feedbacks } = this.state;
    return (
      <View>
        <View>
          <Text
            style={{
              textDecorationLine: 'underline',
              color: '#000000',
              alignSelf: 'center',
            }}>
            {name}
          </Text>
          <Text>שעות פתיחה {openningHours}</Text>
          <Text style={{ fontWeight: '700' }}>פרטי האירוע</Text>
          <Text>קטגוריה {this.state.selectEvent.category}</Text>
          <Text>שעות הפעילות {this.state.selectEvent.time}</Text>
          <Text></Text>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('MenuScreen', { menu });
            }}>
            <Text>הקש לקבלת התפריט</Text>
          </TouchableOpacity>
          <Text>תגובות ודירוג</Text>
          {feedbacks && (
            <ScrollView>
              <View style={{ flex: 1 }}>
                {feedbacks.map((item, i) => (
                  <View
                    key={i}
                    style={{
                      borderWidth: 1,
                      padding: 10,
                      margin: 10,
                    }}>
                    <View
                      key={i}
                      style={{
                        justifyContent: 'space-between',
                        flexDirection: 'row',
                      }}>
                      <Text>{item.rate} stars</Text>
                      <Text>{item.comment}</Text>
                    </View>
                    <Text style={{ color: '#000000' }}>{item.name}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
        </View>
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
              <Marker
                coordinate={{
                  latitude: selectEvent.lat,
                  longitude: selectEvent.lng,
                }}
                title={selectEvent.name}
                description={selectEvent.description}
              />
            </MapView>
          )}
        </View>
      </View>
    );
  }
}

const mapStateToProps = state => ({
  user: state.user.user,
});
const mapDispatchToProps = {};

export const MenuScreen = ({ navigation, route }) => {
  const { menu } = route.params;
  return (
    <View>
      {menu && (
        <ScrollView style={{ borderWidth: 1 }}>
          <View style={{ flex: 1 }}>
            {menu.map((item, i) => (
              <View
                key={i}
                style={{
                  borderWidth: 1,
                  padding: 10,
                  margin: 10,
                  justifyContent: 'space-between',
                  flexDirection: 'row',
                }}>
                <Text style={{ color: '#000000' }}>{item.name}</Text>
                <Text>{item.price}$</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
};
export default connect(mapStateToProps, mapDispatchToProps)(BusinessScreen);
