import React, { Component } from 'react';
import { Button, Text, TouchableOpacity, View, TextInput } from 'react-native';
import { connect } from 'react-redux';
import { countDown, countUp } from '../actions';
import auth from '@react-native-firebase/auth';
import { setUser } from '../actions/UserActions';

class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      error: null,
    };
    this.subscriber = null;
  }
  onAuthStateChanged(user) {
    this.props.setUser(user, this.props.navigation);
  }
  componentDidMount() {
    this.subscriber = auth().onAuthStateChanged(
      this.onAuthStateChanged.bind(this),
    );
  }
  componentWillUnmount() {
    if (this.subscriber) {
      this.subscriber();
    }
  }
  makeRegister() {
    this.setState({ error: null });

    auth()
      .createUserWithEmailAndPassword(this.state.email, this.state.password)
      .then(() => {
        console.log('User account created & signed in!');
      })
      .catch(error => {
        if (error.code === 'auth/email-already-in-use') {
          console.log('That email address is already in use!');
        }

        if (error.code === 'auth/invalid-email') {
          console.log('That email address is invalid!');
        }

        console.error(error);
      });
  }
  render() {
    const { navigation } = this.props;
    return (
      <View>
        <View
          style={{ flexDirection: 'row', margin: 10, alignItems: 'center' }}>
          <Text style={{ minWidth: 75 }}>Email</Text>
          <TextInput
            placeholder="my@email.com"
            keyboardType="email-address"
            style={{ borderBottomWidth: 1, flex: 1 }}
            value={this.state.email}
            onChangeText={email => this.setState({ email })}
          />
        </View>
        <View
          style={{ flexDirection: 'row', margin: 10, alignItems: 'center' }}>
          <Text style={{ minWidth: 75 }}>Password</Text>
          <TextInput
            placeholder="Super secret password"
            secureTextEntry={true}
            style={{ borderBottomWidth: 1, flex: 1 }}
            value={this.state.password}
            onChangeText={password => this.setState({ password })}
          />
        </View>
        {this.state.error && (
          <Text style={{ color: '#ff4444' }}>{this.state.error}</Text>
        )}
        <TouchableOpacity
          style={[
            {
              margin: 10,
              borderWidth: 1,
              borderRadius: 10,
              padding: 10,
              alignItems: 'center',
            },
            { backgroundColor: '#fff' },
          ]}
          onPress={() => this.makeRegister()}>
          <Text>Register</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const mapStateToProps = state => ({
  user: state.user.user,
});
const mapDispatchToProps = {
  setUser,
};

export default connect(mapStateToProps, mapDispatchToProps)(Register);
