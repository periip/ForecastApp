import React, { useEffect, useState } from 'react';
import { GOOGLE_KEY, APP_ID } from 'react-native-dotenv'
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  StatusBar,
  TouchableOpacity,
  Image,
  ImageBackground,
  Modal,
  TextInput
} from 'react-native';

const conditions = ["thunderstorm", "drizzle", "rain", "snow", "mist", "clear", "clouds"]
const conditionBG = {
  snow: 'https://wallpaperaccess.com/full/2847818.png',
  clear: 'https://wallpaperaccess.com/full/2847899.jpg',
  clouds: 'https://wallpaperaccess.com/full/2847935.jpg',
  thunderstorm: 'https://i.pinimg.com/564x/e4/dd/5d/e4dd5dcf343600a6f2c6be61d1d94cb0.jpg',
  drizzle: 'https://images.hdqwalls.com/download/cityscape-80s-anime-4k-ou-1125x2436.jpg',
  rain: 'https://r1.ilikewallpaper.net/iphone-wallpapers/download/5358/Rainy-Night-Street-iphone-wallpaper-ilikewallpaper_com.jpg',
  mist: 'https://i.imgur.com/S48i5aV.jpeg'
}


export default function App() {
  const [hourly, setHourly] = useState([]);
  const [daily, setDaily] = useState([]);
  const [current, setCurrent] = useState([]);
  const [currentWeather, setCurrentWeather] = useState([""])
  const [currentWeatherIcon, setCurrentWeatherIcon] = useState("");
  const [displayed, setDisplayed] = useState([]);
  const [bg, setBg] = useState()
  const [isDaily, setIsDaily] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [pop, setPop] = useState("");
  const [inputCount, setInputCount] = useState(0);
  const [inputTown, onChangeTown] = useState();
  const [inputState, onChangeState] = useState();
  const [latitude, setLatitude] = useState(40.828411);
  const [longitude, setLongitude] = useState(-74.589912);
  const [location, setLocation] = useState('Randolph, NJ')
  
  const geolocation = `https://maps.googleapis.com/maps/api/geocode/json?address=${inputTown},+${inputState}&key=${GOOGLE_KEY}`

  const weatherData =
  `https://pro.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=minutely&appid=${APP_ID}&units=imperial`;

  const getWeatherFromApiAsync = async () => {
    try {
      const response = await fetch(weatherData);
      const result = await response.json();
      setCurrent(result.current);
      setCurrentWeather(result.current.weather)
      setCurrentWeatherIcon(result.current.weather[0].icon)
      setHourly(result.hourly);
      setDaily(result.daily);
      setPop(result.hourly[0].pop)
      setDisplayed(result.daily);
      updateBg(result.current.weather)
    } catch (error) {
      console.log(error)
    } 
  }
  
  const getGeolocation = async () => {
    try {
      const response = await fetch(geolocation);
      const data = await response.json();
      setLatitude(data.results[0].geometry.location.lat)
      setLongitude(data.results[0].geometry.location.lng)
      setLocation(data.results[0].address_components[0].short_name + ', ' + data.results[0].address_components[2].short_name)
    } catch (error) {
      console.log(error)
    } 
  }

  useEffect(() => {
    getWeatherFromApiAsync()
  }, [latitude, longitude]);

  useEffect(() => {
    if (inputTown !== undefined && inputState !== undefined) {
      getGeolocation()
    } 
  }, [inputCount])
    
  const updateBg = (tempCurrentWeather) => {
    let tempWeather = tempCurrentWeather[0].description.toLowerCase()

    for (let i = 0; i < conditions.length; i++) {
      if (tempWeather.includes(conditions[i])) {
        setBg(conditionBG[conditions[i]])
      }
    }
  }

  const toggleDisplay = () => {
    let check = isDaily;
    check = !check;
    setDisplayed(check ? daily : hourly);
    setIsDaily(check);
  }

  const isSameDate = (dt) => {
    let date = new Date(dt * 1000).toLocaleDateString("en-US") 
    let now = new Date().toLocaleDateString("en-US")
    return now == date
  }
  
  const unixToDate = (dt) => {
    let day = new Date(dt * 1000).toLocaleDateString("en-US", { weekday: 'long' })
    
    if (isSameDate(dt)) {
      return "Today"
    }

    return day
  }

  const unixToHour = (dt) => {
    let hour = unixToTime(dt) 
    let now = new Date().toLocaleTimeString("en-US")

    hour = hour.replace(hour.slice(-9, -3), "") 
    now = now.replace(now.slice(-9, -3), "")

    if (now == hour && isSameDate(dt)) { 
      return "Now"
    }

    return hour
  }
  
  const unixToTime = (dt) => {
    return new Date(dt * 1000).toLocaleTimeString("en-US")
  }

  const renderItem = ({ item }) => { //pass index here to use it
    if (isDaily) {
      return (
        <View style={styles.item}>
          <Text> {unixToDate(item.dt)} </Text>
          <Image
            style={styles.weatherIcon}
            source={{ uri: 'http://openweathermap.org/img/wn/' + item.weather[0].icon + '@2x.png' }}
          />
          <Text>{Math.round(item.temp.max) + '°/' + Math.round(item.temp.min)}°</Text>
          <Text>☂ {Math.round(item.pop * 100)}%</Text>
        </View>
      ) 
    } else {
      return (
        <View style={styles.item}>
          <Text> {unixToHour(item.dt)} </Text>
          <Image
            style={styles.weatherIcon}
            source={{ uri: 'http://openweathermap.org/img/wn/' + item.weather[0].icon + '@2x.png' }}
          />
          <Text>{Math.round(item.temp)}°</Text>
          <Text>☂ {Math.round(item.pop * 100)}%</Text>
        </View>
      )
    }
  }

  return (
    <View style={styles.container}>
      <ImageBackground source={{ uri: bg }} resizeMode="cover" style={styles.background}>
        <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
        >
          <View style={styles.container}>
            <View style={styles.modalView}>
              <View style={styles.modalClose}> 
                <TouchableOpacity
                onPress={() => setModalVisible(!modalVisible)}
                >
                  <Text> X </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.lineBreak}/>
              <View style={styles.modalRow}>
                <Text>Sunrise: {unixToTime(current.sunrise)}   </Text>
                <Text>Sunset: {unixToTime(current.sunset)}</Text>
              </View>
              <View style={styles.lineBreak}/>
              <Text>Pressure: {current.pressure} hPa</Text>
              <View style={styles.lineBreak}/>
              <Text>Humidity: {current.humidity}% </Text>
              <View style={styles.lineBreak}/>
              <Text>UV Index: {Math.round(current.uvi)} out of 10 </Text>
              <View style={styles.lineBreak}/>
              <Text>Visibility: {current.visibility}m </Text>
            </View>
          </View>
        </Modal>

        <View style={styles.searchContainer}>  
       
          <TextInput
          style={styles.inputTownBox}
          onChangeText={onChangeTown}
          value={inputTown}
          placeholder="Town"
          placeholderTextColor="white"
          />
          
          <TextInput
          style={styles.inputStateBox}
          onChangeText={onChangeState}
          value={inputState}
          placeholder="State"
          placeholderTextColor="white"/>

          <TouchableOpacity
          onPress={() => setInputCount(prev => prev + 1)}
          >
            <Text> 🔍 </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.currentContainer}>
          <View style={styles.leftCurrent}> 
            <Text style={styles.currentDataText}> {location} </Text>
            <Text style={styles.currentTempText}>{Math.round(current.temp)}°</Text>
            <Text style={styles.currentDataText}>{currentWeather[0].description}</Text>
          </View>
          
          <View style={styles.rightCurrent}>
            <Image
              style={styles.weatherIcon}
              source={{ uri: 'http://openweathermap.org/img/wn/' + currentWeatherIcon + '@2x.png' }}
            />
            <Text style={styles.currentDataText}>💨 {Math.round(current.wind_speed)} mph</Text>
            <Text style={styles.currentDataText}>☂ {Math.round(pop * 100)}%</Text>
            <TouchableOpacity 
            style={styles.button}
            onPress={() => setModalVisible(true)}>
              <Text style={styles.buttonText}>Other</Text>
            </TouchableOpacity>
          </View> 
        </View>

        <View style={styles.emptyContainer}></View>
        
        <View style={styles.timeButtonContainer}>
          <TouchableOpacity style={styles.button} onPress={() => toggleDisplay()}>
            <Text style={styles.buttonText}>{isDaily ? 'Show Hourly' : 'Show Daily'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tempList}>
          <FlatList
            data={displayed}
            keyExtractor={({ id }, index) => id}
            renderItem={renderItem}
            horizontal
          />
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  currentTempText: {
    fontSize: 100,
  },
  currentDataText: {
    fontSize: 15,
    paddingBottom: 10,
    fontWeight: 'bold'
  },
  tempList: {
    justifyContent: 'flex-end',
    height: '20%',
  },
  currentContainer: {
    flexDirection: 'row',
    height: '30%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 15,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,.4)',
    margin: 5
  },
  emptyContainer: {
    height: '20%'
  },
  leftCurrent: {
    alignItems: 'flex-start',
    width: '50%',
  },
  rightCurrent: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    width: '50%',
    height: '50%',
  },
  timeButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 15,
    color: 'white'
  },
  button: {
    borderRadius: 10,
    borderColor: 'white',
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,255,.6)',
    marginBottom: 5,
    width: '30%',
    alignItems: 'center',
    justifyContent: 'center',
    height: 25
  },
  item: {
    backgroundColor: 'rgba(255,255,255,.6)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'black',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginLeft: 10,
    width: 90,
  },
  weatherIcon: {
    width: 50,
    height: '50%'
  },
  background: {
    flex: 1,
    justifyContent: 'center',
  },
  modalView : {
    backgroundColor: 'skyblue',
    margin: 20,
    height: '30%',
    padding: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'black'
  },
  modalClose: {
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  modalRow: {
    flexDirection: 'row',
  },
  lineBreak: {
    borderBottomColor: 'black',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingTop: 10
  },
  searchContainer: {
    flexDirection: 'row',
    height: '20%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginRight: 3
  },
  inputTownBox: {
    height: 40,
    width: '43%',
    borderWidth: 1,
    padding: 10,
    marginRight: 5
  },
  inputStateBox: {
    height: 40,
    width: '43%',
    borderWidth: 1,
    padding: 10,
  }
});
