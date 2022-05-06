import React, { Component } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { connect } from 'react-redux';
import Home from './Home';
import Home2 from './Home2';
import Register from './Register';
import Login from './Login';
import Events from './Events';
import UserCargory from './UserCargory';

const Stack = createNativeStackNavigator();
class AppContainer extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen
            name="Home"
            component={Home}
            options={{ title: 'Welcome' }}
          />
          <Stack.Screen name="Events" component={Events} />
          <Stack.Screen
            name="UserCategory"
            component={UserCargory}
            options={{
              title: 'Select your catrgory',
              headerBackVisible: false,
            }}
          />
          <Stack.Screen
            name="Home2"
            component={Home2}
            options={{ headerBackVisible: false }}
          />
          <Stack.Screen name="Register" component={Register} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}
const mapStateToProps = state => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(AppContainer);
