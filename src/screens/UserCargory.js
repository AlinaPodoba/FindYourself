import React, { Component } from 'react';
import {
  Button,
  Text,
  TouchableOpacity,
  View,
  BackHandler,
  ScrollView,
  StyleSheet,
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

    this.props.navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            auth()
              .signOut()
              .then(() => console.log('User signed out!'));
            this.props.navigation.goBack();
          }}>
          <Text>יציאה</Text>
        </TouchableOpacity>
      ),
    });
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
    const groups = this.state.categories
      .map((e, i) => {
        return i % 2 === 0 ? this.state.categories.slice(i, i + 2) : null;
      })
      .filter(e => {
        return e;
      });
    return (
      <View>
        <Text>Find Yourself</Text>
        <Text> </Text>

        {this.state.categories && (
          <ScrollView>
            <View style={styles.categoriesHolder}>
              {groups.map((x, i) => (
                <View key={i} style={{ flexDirection: 'row' }}>
                  <TouchableOpacity
                    style={styles.categoryStyle}
                    onPress={() => {
                      navigation.navigate('Events', { category: x[0] });
                    }}>
                    <Text style={{ alignSelf: 'center' }}>{x[0]}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.categoryStyle,
                      { borderWidth: x[1] ? 1 : 0 },
                    ]}
                    onPress={() => {
                      navigation.navigate('Events', { category: x[1] });
                    }}>
                    <Text>{x[1]}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ScrollView>
        )}
      </View>
    );
  }
}
const styles = StyleSheet.create({
  categoryStyle: {
    borderWidth: 1,
    flex: 1,
    margin: 20,
    padding: 20,
    minHeight: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoriesHolder: { flex: 1, paddingBottom: 100 },
});
const mapStateToProps = state => ({
  user: state.user.user,
});
const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(UserCargory);
