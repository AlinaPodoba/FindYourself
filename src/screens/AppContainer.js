import React, { Component } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { connect } from 'react-redux';
import Home from './Home';
import Home2 from './Home2';

const Stack = createNativeStackNavigator();
class AppContainer extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Home"
            component={Home}
            options={{ title: 'Welcome' }}
          />
          <Stack.Screen name="Home2" component={Home2} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}
const mapStateToProps = state => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(AppContainer);
