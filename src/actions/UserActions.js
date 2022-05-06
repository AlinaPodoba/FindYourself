import { SET_USER } from './Types';

export const setUser = (user, navigation) => {
  return dispatch => {
    dispatch({ type: SET_USER, payload: user });
    if (user) {
      navigation.navigate('Home2');
    }
  };
};
