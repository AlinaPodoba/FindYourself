import { SET_USER } from './Types';

export const setUser = (user, navigation) => {
  if (user) {
    navigation.navigate('Home2');
  }
  return { type: SET_USER, payload: user };
};
