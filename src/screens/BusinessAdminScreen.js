import React, { Component, useState } from 'react';
import {
  Button,
  Text,
  TouchableOpacity,
  View,
  BackHandler,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { connect } from 'react-redux';
import Geolocation from 'react-native-geolocation-service';
import { permission } from '../utils/permission';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'; // remove PROVIDER_GOOGLE import if not using Google Maps

const styles = StyleSheet.create({
  container: {
    minHeight: 200,
    flex: 1,
    borderWidth: 1,
  },
  map: {
    position: 'relative',
    minHeight: 200,
    width: '100%',
  },
});

const reference = database().ref('/users/');
class BusinessAdminScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lat: 31.8,
      lng: 34.65,
      events: [],
      loading: false,
      businessId: this.props.route.params.businessId,
      feedbacks: [],
      menu: [],
      name: '',
      openningHours: '',
      isAddMenu: false,
    };
  }
  addItem() {
    console.log('ADD ITEM');
    this.setState({ isAddMenu: !this.state.isAddMenu });
  }
  componentDidMount() {
    this.setState({ events: [] });
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

    database()
      .ref('/categories')
      .once('value')
      .then(snapshot => {
        this.intVal = [];
        // console.log('User categories: ', snapshot.val());
        snapshot.forEach(child => {
          this.intVal.push(child.val());
        });
        this.events = [];
        this.intVal.forEach(x => {
          database()
            .ref('/events/' + x + '/' + this.state.businessId)
            .once('value', snapshot => {
              // console.log(
              //   'User events type for businessId: ',
              //   x,
              //   snapshot.val(),
              // );
              snapshot.forEach(child => {
                let item = { ...child.val(), catrgory: x, id: child.key };
                // console.log('User events : ', item);

                this.events.push(item);
              });
              this.setState({ events: [...this.events] });
            });
        });
      });

    this.eventListener = database()
      .ref('/Business/' + this.state.businessId + '/')
      .once('value', snapshot => {
        this.intVal = [];
        // console.log('User events: ', snapshot.val());
        snapshot.forEach(child => {
          this.setState({ [child.key]: child.val() });
          // console.log('User child: ', child.val());
        });
      });
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
  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
    // database().ref('/events').off('value', this.eventListener);
  }
  handleBackButton() {
    return true;
  }
  getCurrentLocation() {
    const { user, navigation } = this.props;
    // this.setState({ loading: true });
    Geolocation.getCurrentPosition(
      position => {
        // console.log(position);
        const { latitude: lat, longitude: lng } = position.coords;
        database()
          .ref('/users/' + user.uid)
          .set({ lat, lng });
        this.setState({
          lat,
          lng,
          loading: false,
        });
      },
      error => {
        // See error code charts below.
        console.log(error.code, error.message);
        this.setState({ loading: false });

        // Alert.alert('location not found', '', [
        //   { text: 'ok', onPress: () => navigation.goBack() },
        // ]);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  }

  render() {
    const { navigation } = this.props;
    const { name, openningHours, menu, feedbacks, events } = this.state;
    return (
      <ScrollView>
        <View>
          <Text
            style={{
              textDecorationLine: 'underline',
              color: '#000000',
              alignSelf: 'center',
            }}>
            {name}
          </Text>
          <Text>שעות פתיחה {openningHours}</Text>
          <Text style={{ fontWeight: '700' }}>פרטי האירועים</Text>
          {events && (
            <ScrollView>
              <View style={{ flex: 1 }}>
                {events.map((item, i) => (
                  <View
                    key={i}
                    style={{
                      borderWidth: 1,
                      padding: 10,
                      margin: 10,
                    }}>
                    <Text style={{ color: '#000000' }}>{item.catrgory}</Text>
                    <View
                      key={i}
                      style={{
                        justifyContent: 'space-between',
                        flexDirection: 'row',
                      }}>
                      <Text>{item.name}</Text>
                      <Text>{item.time}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
          <Text></Text>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('MenuScreenEdit', {
                menu,
                businessId: this.state.businessId,
              });
            }}>
            <Text>הקש לקבלת התפריט</Text>
          </TouchableOpacity>
          <Text>תגובות ודירוג</Text>
          {feedbacks && (
            <ScrollView>
              <View style={{ flex: 1 }}>
                {feedbacks.map((item, i) => (
                  <View
                    key={i}
                    style={{
                      borderWidth: 1,
                      padding: 10,
                      margin: 10,
                    }}>
                    <View
                      key={i}
                      style={{
                        justifyContent: 'space-between',
                        flexDirection: 'row',
                      }}>
                      <Text>{item.rate} stars</Text>
                      <Text>{item.comment}</Text>
                    </View>
                    <Text style={{ color: '#000000' }}>{item.name}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
        </View>
      </ScrollView>
    );
  }
}

const mapStateToProps = state => ({
  user: state.user.user,
});
const mapDispatchToProps = {};

export const MenuScreenEdit = ({ navigation, route }) => {
  const { businessId } = route.params;

  const [menu, updateMenu] = useState(route.params.menu);
  const [method, action] = useState('add');
  const [id, setId] = useState(0);
  const [itemsAddShow, addItem] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  navigation.setOptions({
    headerRight: () => (
      <TouchableOpacity
        onPress={() => {
          addItem(!itemsAddShow);
          setId(menu.length);
          action('add');
          setName('');
          setPrice('');
        }}>
        {itemsAddShow ? <Text>ניקוי</Text> : <Text>הוספה</Text>}
      </TouchableOpacity>
    ),
  });
  return (
    <View>
      {itemsAddShow && (
        <View style={{ paddingBottom: 20 }}>
          {method === 'add' ? <Text>הוספת מוצר</Text> : <Text>עריכת מוצר</Text>}
          <View>
            <View
              style={{
                justifyContent: 'flex-end',
                flexDirection: 'row',
                alignItems: 'flex-end',
              }}>
              <TextInput
                value={name}
                onChangeText={name => setName(name)}
                style={{
                  flex: 1,
                  borderBottomWidth: 1,
                  padding: 0,
                  maxWidth: 200,
                }}
              />
              <Text>שם</Text>
            </View>
            <View
              style={{
                justifyContent: 'flex-end',
                flexDirection: 'row',
                alignItems: 'flex-end',
              }}>
              <TextInput
                value={price}
                onChangeText={price => setPrice(price)}
                style={{
                  flex: 1,
                  borderBottomWidth: 1,
                  padding: 0,
                  maxWidth: 200,
                }}
              />
              <Text>מחיר</Text>
            </View>
            <TouchableOpacity
            style={{borderWidth:1,borderRadius:20,color: '#fff',alignSelf:'flex-start',backgroundColor:'#44f',paddingHorizontal:20,paddingVertical:5,marginTop:15}}
              onPress={() => {
                database()
                  .ref('/Business/' + businessId + '/menu/' + id)
                  .set({ name, price: Number(price).toFixed(2) }, () => {
                    addItem(false);
                    database()
                      .ref('/Business/' + businessId + '/')
                      .once('value', snapshot => {
                        // console.log('User events: ', snapshot.val());
                        snapshot.forEach(child => {
                          if (child.key === 'menu') {
                            updateMenu(child.val());
                          }
                        });
                      });
                  });
              }}>
              {method === 'add' ? <Text style={{color:'#fff',textAlign:'left'}}>הוסף</Text> : <Text style={{color:'#fff',textAlign:'left'}}>ערוך</Text>}
            </TouchableOpacity>
          </View>
        </View>
      )}
      {menu && (
        <View>
          <ScrollView style={{ borderWidth: 1, paddingBottom: 100 }}>
            <View style={{ flex: 1 }}>
              {menu.map((item, i) => (
                <TouchableOpacity
                  onPress={() => {
                    addItem(true);
                    action('edit');
                    setName(item.name);
                    setPrice(Number(item.price).toFixed(2));
                    setId(i);
                  }}
                  key={i}
                  style={{
                    borderWidth: 1,
                    padding: 10,
                    margin: 10,
                    justifyContent: 'space-between',
                    flexDirection: 'row',
                  }}>
                  <View style={{ flexDirection: 'row' }}>
                    <Text style={{ color: '#4499ff' }}>ערוך</Text>
                    <Text>{item.price}$</Text>
                  </View>
                  <Text style={{ color: '#000000' }}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
};
export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(BusinessAdminScreen);
