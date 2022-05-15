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
  Image,
  Modal,
} from 'react-native';
import { connect } from 'react-redux';
import Geolocation from 'react-native-geolocation-service';
import { Picker } from '@react-native-picker/picker';
import { permission } from '../utils/permission';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'; // remove PROVIDER_GOOGLE import if not using Google Maps
import RNDateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';

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
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
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
      categories: [],
      selectedCategory: '',
      addEventModelShow: false,
      loading: false,
      businessId: this.props.route.params.businessId,
      feedbacks: [],
      menu: [],
      name: '',
      openningHours: '',
      isAddMenu: false,
      datePickerShow: false,
      timePickerShow: false,
      time: new Date().getTime(),
    };
  }
  addItem() {
    console.log('ADD ITEM');
    this.setState({ isAddMenu: !this.state.isAddMenu });
  }
  componentDidMount() {
    this.setState({ events: [] });
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

    this.fetchEvents();

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
  fetchEvents() {
    database()
      .ref('/categories')
      .once('value')
      .then(snapshot => {
        this.intVal = [];
        // console.log('User categories: ', snapshot.val());
        snapshot.forEach(child => {
          this.intVal.push(child.val());
        });
        this.setState({ categories: [...this.intVal] });
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
  }
  AddEventModel() {
    let name = '';
    let timePariod = '';

    return (
      <Modal
        visible={this.state.addEventModelShow}
        animationType="slide"
        transparent={true}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <TouchableOpacity
              style={{ alignSelf: 'flex-end' }}
              onPress={() => this.setState({ addEventModelShow: false })}>
              <Text style={{ fontWeight: 'bold' }}>X</Text>
            </TouchableOpacity>
            <Text>הוספת ארוע</Text>
            <Text>בחר קטגוריה</Text>
            <Picker
              style={{ width: 200 }}
              mode="dropdown"
              selectedValue={this.state.selectedCategory}
              onValueChange={(itemValue, itemIndex) =>
                this.setState({ selectedCategory: itemValue })
              }>
              {this.state.categories.map((item, i) => {
                return <Picker.Item key={i} label={item} value={item} />;
              })}
            </Picker>

            <View
              style={{
                justifyContent: 'flex-end',
                flexDirection: 'row',
                alignItems: 'flex-end',
              }}>
              <TextInput
                onChangeText={text => (name = text)}
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
                flexDirection: 'row',
                justifyContent: 'flex-end',
                alignItems: 'center',
              }}>
              <TouchableOpacity
                style={{
                  marginVertical: 10,
                  width: 200,

                  alignItems: 'center',
                }}
                onPress={() => this.setState({ timePickerShow: true })}>
                <Text style={{ borderWidth: 1, borderRadius: 7, padding: 5 }}>
                  {moment(this.state.time).format('DD/MM/YYYY')}
                </Text>
              </TouchableOpacity>
              {this.state.timePickerShow && (
                <RNDateTimePicker
                  minimumDate={new Date()}
                  value={new Date(this.state.time)}
                  onChange={value =>
                    this.setState({
                      time: value.nativeEvent.timestamp,
                      timePickerShow: false,
                    })
                  }
                />
              )}
              <Text>תאריך</Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                alignItems: 'center',
              }}>
              <TouchableOpacity
                style={{
                  marginVertical: 10,
                  width: 200,

                  alignItems: 'center',
                }}
                onPress={() => this.setState({ datePickerShow: true })}>
                <Text style={{ borderWidth: 1, borderRadius: 7, padding: 5 }}>
                  {moment(this.state.time).format('HH:mm')}
                </Text>
              </TouchableOpacity>
              {this.state.datePickerShow && (
                <RNDateTimePicker
                  mode="time"
                  minimumDate={new Date()}
                  value={new Date(this.state.time)}
                  onChange={value =>
                    this.setState({
                      time: value.nativeEvent.timestamp,
                      datePickerShow: false,
                    })
                  }
                />
              )}
              <Text>שעה</Text>
            </View>
            <View
              style={{
                justifyContent: 'flex-end',
                flexDirection: 'row',
                alignItems: 'flex-end',
              }}>
              <TextInput
                onChangeText={text => (timePariod = text)}
                style={{
                  flex: 1,
                  borderBottomWidth: 1,
                  padding: 0,
                  maxWidth: 200,
                }}
              />
              <Text>משך</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                database()
                  .ref(
                    '/events/' +
                      this.state.selectedCategory +
                      '/' +
                      this.state.businessId +
                      '/',
                  )
                  .push(
                    {
                      name,
                      time:
                        moment(this.state.time).format('HH:mm') +
                        '-' +
                        moment(
                          this.state.time + timePariod * 60 * 60 * 1000,
                        ).format('HH:mm'),
                      lat: this.state.lat,
                      lng: this.state.lng,
                      provider: this.state.name,
                      startTime: this.state.time,
                      endTime: this.state.time + timePariod * 60 * 60 * 1000,
                    },
                    () => {
                      this.setState({
                        addEventModelShow: false,
                        time: new Date().getTime(),
                      });
                      this.fetchEvents();
                    },
                  );
              }}
              style={{
                borderWidth: 1,
                borderRadius: 20,
                color: '#fff',
                alignSelf: 'flex-start',
                backgroundColor: '#44f',
                paddingHorizontal: 20,
                paddingVertical: 5,
                marginTop: 15,
              }}>
              <Text style={{ color: '#fff', textAlign: 'left' }}>הוסף</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
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
          {this.AddEventModel()}
          <Text
            style={{
              textDecorationLine: 'underline',
              color: '#000000',
              alignSelf: 'center',
            }}>
            {name}
          </Text>
          <Text>שעות פתיחה {openningHours}</Text>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <TouchableOpacity
              onPress={() => this.setState({ addEventModelShow: true })}
              style={{
                borderWidth: 1,
                borderRadius: 20,
                color: '#fff',
                alignSelf: 'flex-start',
                backgroundColor: '#44f',
                paddingHorizontal: 20,
                paddingVertical: 5,
                marginTop: 15,
              }}>
              <Text style={{ color: '#fff', textAlign: 'left' }}>הוסף</Text>
            </TouchableOpacity>
            <Text style={{ textAlignVertical: 'center', fontWeight: '700' }}>
              פרטי האירועים
            </Text>
          </View>
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
              style={{
                borderWidth: 1,
                borderRadius: 20,
                color: '#fff',
                alignSelf: 'flex-start',
                backgroundColor: '#44f',
                paddingHorizontal: 20,
                paddingVertical: 5,
                marginTop: 15,
              }}
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
              {method === 'add' ? (
                <Text style={{ color: '#fff', textAlign: 'left' }}>הוסף</Text>
              ) : (
                <Text style={{ color: '#fff', textAlign: 'left' }}>ערוך</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
      {menu && (
        <View>
          <ScrollView style={{ paddingBottom: 100 }}>
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
                    <Image
                      style={{ tintColor: '#4499ff', width: 20, height: 20 }}
                      resizeMode="center"
                      source={require('../../assests/img/baseline_edit_black_24dp.png')}
                    />

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
