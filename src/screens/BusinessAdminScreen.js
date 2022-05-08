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
class BusinessAdminScreen extends Component {
  constructor(props) {
    super(props);
    console.log(props);
    this.state = {
      lat: 31.8,
      lng: 34.65,
      events: [],
      loading: false,
      businessId: this.props.route.params.businessId,
      feedbacks: [],
      menu: [],
      name: '',
      openningHours: '',
    };
  }
  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

    database()
      .ref('/categories')
      .once('value')
      .then(snapshot => {
        this.intVal = [];
        console.log('User categories: ', snapshot.val());
        snapshot.forEach(child => {
          this.intVal.push(child.val());
        });
        this.events = [];
        this.intVal.forEach(x => {
          database()
            .ref('/events/' + x + '/' + this.state.businessId)
            .once('value', snapshot => {
              console.log('User events for businessId: ', snapshot.val());
              snapshot.forEach(child => {
                let item = { ...child.val(), catrgory: x,id:child.key };
                console.log('User events for businessId: ', item);

                this.events.push(item);
              });
              this.setState({ events: this.events });
            });
        });
      });

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
    const { name, openningHours, menu, feedbacks, events } = this.state;
    console.log('events',events);
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
          <Text style={{ fontWeight: '700' }}>פרטי האירועים</Text>
          {events && (
            <ScrollView>
              <View style={{ flex: 1 }}>
                {events.map((item, i) => (
                  <View
                    key={i}
                    style={{
                      borderWidth: 1,
                      padding: 10,
                      margin: 10,
                    }}>
                    <Text style={{ color: '#000000' }}>{item.catrgory}</Text>
                    <View
                      key={i}
                      style={{
                        justifyContent: 'space-between',
                        flexDirection: 'row',
                      }}>
                      <Text>{item.name}</Text>
                      <Text>{item.time}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
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
export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(BusinessAdminScreen);
