import React, { Component } from 'react';
import {
  Button,
  Text,
  TouchableOpacity,
  View,
  BackHandler,
  ScrollView,
} from 'react-native';
import { connect } from 'react-redux';
import Geolocation from 'react-native-geolocation-service';
import { permission } from '../utils/permission';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';

const reference = database().ref('/users/');
class UserCargory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lat: 0,
      lng: 0,
      categories: [],
    };
  }
  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    // database()
    //   .ref('/managers')
    //   .once('value')
    //   .then(snapshot => {
    //     console.log('User data: ', snapshot.val());
    //     if (
    //       this.props.user &&
    //       snapshot.val() &&
    //       snapshot.val().includes(this.props.user.email)
    //     ) {
    //       this.setState({ isManager: true });
    //     }
    //   });
    database()
      .ref('/categories')
      .once('value')
      .then(snapshot => {
        this.intVal = [];
        console.log('User categories: ', snapshot.val());
        snapshot.forEach(child => {
          this.intVal.push(child.val());
        });
        this.setState({ categories: this.intVal });
      });
  }
  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
    // database().ref('/events').off('value', this.eventListener);
  }
  handleBackButton() {
    return true;
  }

  render() {
    const { navigation } = this.props;
    return (
      <View>
        <Button
          title="logout"
          onPress={() => {
            auth()
              .signOut()
              .then(() => console.log('User signed out!'));
            navigation.goBack();
          }}
        />
        <Text>Find Yourself</Text>

        <Text> </Text>

        <Button
          title="go to event map"
          onPress={() => {
            navigation.navigate('Events');
          }}
        />

        {this.state.categories && (
          <ScrollView>
            <View>
              {this.state.categories.map((x, i) => (
                <View
                  key={i}
                  style={{ borderWidth: 1 }}
                  onPress={() => {
                    navigation.navigate('Events', { x });
                  }}>
                  <Text>{x}</Text>
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

export default connect(mapStateToProps, mapDispatchToProps)(UserCargory);
