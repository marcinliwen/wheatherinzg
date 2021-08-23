import React , {useState, useEffect} from 'react';
import './App.css';
import locationImg from "./images/location.png"
import imgw_logo from "./images/imgw_logo.png"
import openWeather from "./images/openWeather_logo.png"

const LOCATION = 'Zielona Góra';
const weatherApi ={
  key : "37402c5d1707b8228464b358ee9b8998",
  base: "https://api.openweathermap.org/data/2.5/",
  icon: "http://openweathermap.org/img/wn/"
}

const airConditionApi = "https://api.gios.gov.pl/pjp-api/rest/aqindex/getIndex/387";

const airApi = {
  token : "930aff57c768491c4aac0803587f463fe2f01c9e",
  url_base : "https://api.waqi.info/feed/",
  location: 'zielona gora'
}

function App() {
  const [query, setQuery] = useState(LOCATION);
  const [weather, setWether] = useState([]);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [airCondition, setAirCondotion] = useState([]);


  const search = evt =>{
    if(evt.key === "Enter"){
      const locationName = evt.target.value
      Promise.all([
        fetch(`${weatherApi.base}weather?q=${locationName}&appid=${weatherApi.key}&lang=PL&units=metric`).then(res => res.json()),
        fetch(`https://danepubliczne.imgw.pl/api/data/synop/station/${locationName}`).then(res => res.json())
      ])
      .then (data => {
        setWether(data);
        //setQuery('Zielona Góra');
        console.log(data);
      })
      .catch((err) => {
        console.log(err);
      });
    }
  }

  const getWeatherData =()=>{
      const locationName = LOCATION
      Promise.all([
        fetch(`${weatherApi.base}weather?q=${locationName}&appid=${weatherApi.key}&lang=PL&units=metric`).then(res => res.json()),
        fetch(`https://danepubliczne.imgw.pl/api/data/synop/station/zielonagora`).then(res => res.json())
      ])
      .then (data => {
        setWether(data);
        //setQuery('Zielona Góra');
        console.log(data);
      }).then(()=>{
        manageContent('content_0', 'tab_0');
      })
      .catch((err) => {
        console.log(err);
      });
  }

  const dateBuilder = (d) =>{
    let months = ["Styczeń", "Luty", "Marzec", "Kwiecień","Maj","Czerwiec", "Lipiec", "Sierpień", "Wrzesień","Październik","Listopad","Grudzień"];
    let days = ["Niedziela","Poniedziałek","Wtorek","Środa","Czwartek","Piątek","Sobota"];

    let day = days[d.getDay()];
    let date = d.getDate();
    let month = months[d.getMonth()];
    let year = d.getFullYear();

    return `${day}, ${date} ${month}, ${year}`;
  }

  const currentLocation = evt =>{
    navigator.geolocation.getCurrentPosition(function(position) {
      console.log(position)
      console.log("Latitude is :", position.coords.latitude);
      console.log("Longitude is :", position.coords.longitude);
      if(latitude !== position.coords.latitude && longitude !== position.coords.longitude){
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude)
      }else{
        fetchFromLocation(latitude, longitude);
      } 
    });
  }
  
  useEffect(()=>{
    console.log(latitude,longitude )
    if( latitude && longitude){
      //fetchFromLocation(latitude, longitude);
    }
  getWeatherData();
  getAircondition();
  },[])

  const fetchFromLocation =(lat, lon)=>{

      Promise.all([
        fetch(`${weatherApi.base}weather?lat=${lat}&lon=${lon}&appid=${weatherApi.key}&lang=PL&units=metric`).then(res => res.json()),
        fetch('https://danepubliczne.imgw.pl/api/data/synop/station/zielonagora').then(res => res.json())
      ])
      .then (data => {
        setWether(data);
        setQuery('Zielona Góra');
        console.log(data);
      })
      .catch((err) => {
        console.log(err);
      });
  }
  //console.log(weather[0])

  function manageContent(content_id, tab_id){
    var sections = document.querySelectorAll('section');
    var tabs = document.querySelectorAll('.menu-box button')
    sections.forEach(element => {
      element.style.display="none";
    });
    console.log(tabs);
    document.getElementById(content_id).style.display = "block";
    tabs.forEach(element=>{
      if(element.classList.contains('active')){
        element.classList.remove('active');
      }
    })
    document.getElementById(tab_id).classList.add('active')
  }

  function getAircondition(){
    
    fetch(`${airApi.url_base}${airApi.location}/?token=${airApi.token}`)
    .then(response => response.json())
    .then(data => {
      console.log(data);
      setAirCondotion(data);
    });

    //console.log(airCondition.data.aqi);
  }

  return (
    <div className={(typeof weather[0] != "undefined") ? ((weather[0].clouds.all > 50) ? 'app cloudy' : 'app') : 'app'}>
      <main>
        <header>
          <div className="search-box">
            <input 
              className="search-bar"
              type="text"
              placeholder="Miasto..."
              onChange={e => setQuery(e.target.value)}
              value={query}
              onKeyPress={search}
            />
            <button onClick={currentLocation}><img src={locationImg}/></button>
          </div>
        </header>
        {(typeof weather[0] != "undefined") ? (
          <section id="content_0">
          <div>
            <div className="location-box">
              <div className="location-name">{weather[0].name}</div>
            </div>
          </div>
          <div>
            <div className="date-box">
              <div className="date-now">{dateBuilder(new Date())}</div>
            </div>
          </div>
          {(typeof airCondition.data != "undefined") ?
          <div className="air-condition"><span>jakość powietrza:</span> <span className={`air-quantity ${airCondition.data.aqi < 50 ?'good' : 'bad'}`}>{airCondition.data.aqi < 50 ?'Bardzo dobra' : 'Zła'}</span></div>
          :""}
          <div>
            <div className="weather-box">
              <div className="weather-temp"> {Math.round(weather[0].main.temp)}°C</div>
              <div className="weather-sky">{weather[0].weather[0].description}</div>
              <div className="weather-item"><span>ciśnienie</span> {weather[0].main.pressure} hPa</div>
              <div className="weather-item"><span>zachurzenie</span> {weather[0].clouds.all} %</div>
              <div className="weather-item"><span>wilgotność</span>  {Math.round(weather[0].main.humidity)} %</div>
              <div className="weather-item"><span>wiatr</span> {weather[0].wind.speed} km/h</div>
            </div>
          </div>
        </section>
        ):('')}
        {(typeof weather[1] != "undefined") ? (
          <section id="content_1" >
          <div>
            <div className="location-box">
              <div className="location-name">{weather[1].stacja}</div>
            </div>
          </div>
          <div>
            <div className="date-box">
              <div className="date-now">{dateBuilder(new Date())}</div>
            </div>
          </div>
          {(typeof airCondition.data != "undefined") ?
          <div className="air-condition"><span>jakość powietrza:</span> <span className={`air-quantity ${airCondition.data.aqi < 50 ?'good' : 'bad'}`}>{airCondition.data.aqi < 50 ?'Bardzo dobra' : 'Zła'}</span></div>
          :""}
          <div>
            <div className="weather-box">
              <div className="weather-temp">{Math.round(weather[1].temperatura)}°C</div>
              <div className="weather-item" style={{marginTop: "51px"}}><span>ciśnienie</span> {weather[1].cisnienie} hPa</div>
              <div className="weather-item"><span>opady</span> {weather[1].suma_opadu} mm/dzień</div>
              <div className="weather-item"><span>wilgotność</span>  {Math.round(weather[1].wilgotnosc_wzgledna)} %</div>
              <div className="weather-item"><span>wiatr</span> {weather[1].predkosc_wiatru} km/h</div>
            </div>
          </div>
        </section>
        ):('')}
        <div className="menu-box">
          <button onClick={()=>manageContent("content_0", "tab_0")} id="tab_0"><img width="80px" src={openWeather} /></button>
          <button onClick={()=>manageContent("content_1", "tab_1")} id="tab_1"><img width="36px" src={imgw_logo} /></button>
        </div>
      </main>
    </div>
  );
}

export default App;
