import React, { Component } from 'react';
import { Button, Text, TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';
import { countDown, countUp } from '../actions';
import Geolocation from 'react-native-geolocation-service';
import { permission } from '../utils/permission';

class Home2 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      let: 0,
      lng: 0,
    };
  }
  componentDidMount() {
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
        <Button title="back to Home" onPress={() => navigation.goBack()} />
        <Text>location</Text>
        <Text>
          let {this.state.let} lng {this.state.lng}
        </Text>
        <ShowCounter
          number="1"
          counter={this.props.counter}
          counterUp={this.props.countUp}
          counterDown={this.props.countDown}
        />
      </View>
    );
  }
}
const ShowCounter = ({ counter, counterUp, counterDown, number }) => {
  return (
    <View>
      <Text>
        Hello from Counter{number} {counter}
      </Text>

      <TouchableOpacity
        style={[
          { margin: 10, borderWidth: 1, borderRadius: 10, padding: 10 },
          { backgroundColor: '#fff' },
        ]}
        onPress={() => counterUp()}>
        <Text>Count Up</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          { margin: 10, borderWidth: 1, borderRadius: 10, padding: 10 },
          { backgroundColor: '#fff' },
        ]}
        onPress={() => counterDown()}>
        <Text>Count Down</Text>
      </TouchableOpacity>
    </View>
  );
};

const mapStateToProps = state => ({
  counter: state.counters.count1,
});
const mapDispatchToProps = {
  countUp,
  countDown,
};

export default connect(mapStateToProps, mapDispatchToProps)(Home2);
