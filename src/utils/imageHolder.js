const images = {
  logo: require('../../assests/img/logo_1.png'),
  starFilled: require('../../assests/img/starFilled.png'),
  starEmpty: require('../../assests/img/starEmpty.png'),
};
export const getImage = name => {
  if (name in images) {
    return images[name];
  }
};
