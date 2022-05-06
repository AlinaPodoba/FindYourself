import database from '@react-native-firebase/database';
import { SET_USER } from './Types';

export const setUser = (user, navigation) => {
  return dispatch => {
    dispatch({ type: SET_USER, payload: user });
    if (user) {
      database()
        .ref('/managers')
        .once('value')
        .then(snapshot => {
          console.log('User data: ', snapshot.val());
          if (snapshot.val() && snapshot.val().includes(user.email)) {
            navigation.navigate('Home2');
            return;
          }
          navigation.navigate('UserCategory');
        });
    }
  };
};
