import React, { Component } from 'react';
import {
  Button,
  Text,
  TouchableOpacity,
  View,
  BackHandler,
} from 'react-native';
import { connect } from 'react-redux';
import Geolocation from 'react-native-geolocation-service';
import { permission } from '../utils/permission';
import auth from '@react-native-firebase/auth';

class Home2 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      let: 0,
      lng: 0,
    };
  }
  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

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
  }
  handleBackButton() {
    return true;
  }
  getCurrentLocation() {
    Geolocation.getCurrentPosition(
      position => {
        console.log(position);
        this.setState({
          let: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      error => {
        // See error code charts below.
        console.log(error.code, error.message);
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
          let {this.state.let} lng {this.state.lng}
        </Text>
        <Text> </Text>
        {this.props.user && (
          <Text>
            email {this.props.user.email}
            user {JSON.stringify(this.props.user)}
          </Text>
        )}
      </View>
    );
  }
}

const mapStateToProps = state => ({
  user: state.user.user,
});
const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(Home2);
