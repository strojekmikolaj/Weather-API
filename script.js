const weatherApp = {
  weatherInfo: document.querySelector('#weather'),
  loader: document.querySelector('.loader'),

  getWeatherLocation() {
    document.querySelector('#submit').addEventListener('click', this.getLocalFromInput.bind(this));
  },

  getLocalFromInput() {
   
    const city = document.querySelector('#city');
    console.log(city.value)
    if (city.value.trim().length === 0) {
      alert('Please enter city name.');
      return;
    }
    this.loader.className += ' visible';
    this.weather(city.value, true);
    this.backgroundImage(city.value);
    city.value = '';
  },

  backgroundImage(city) {
    fetch(`https://api.unsplash.com/search/photos/?query=${city}&client_id=2TAHz5XRgXmpYDrNta4X_RUqGzMDey3U8Fpn5ZMqPj4`)
      .then((response) => response.json())
      .then((response) => {
        const randIdx = Math.floor(Math.random() * response.results.length);
        const img = new Image();
        img.onload = () => {
          const background = document.querySelector('body');
          background.style.backgroundImage = `url(${response.results[randIdx].urls.full})`;
          this.loader.className = 'loader hidden';
        };
        img.src = response.results[randIdx].urls.full;
      });
  },

  weatherOnLoad() {
    let weatherStorage = localStorage.getItem('cities');
    weatherStorage = JSON.parse(weatherStorage);

    if (weatherStorage == null) {
      return;
    }
    weatherStorage.forEach((el) => {
      this.weather(el, false);
    });
  },

  createHTMLElement(innerText, city, selector = 'p'){
    const element = document.createElement(selector);
    element.innerHTML = innerText;
    element.dataset.city = city;
    return element;
  },

  weather(city, checkExist) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=dba3cbbbe22de845daba54e9ad2c2c0b&units=metric`)
      .then((response) => response.json())
      .then((response) => {
        let weatherStorage = localStorage.getItem('cities');
        weatherStorage = JSON.parse(weatherStorage);

        if (checkExist) {
          if (weatherStorage == null) {
            weatherStorage = [response.name];
          } else {
            if (weatherStorage.indexOf(response.name) !== -1) {
              return;
            }
            weatherStorage.push(response.name);
          }
        }

        weatherStorage = JSON.stringify(weatherStorage);
        localStorage.setItem('cities', weatherStorage);

        this.weatherInfo.style.display = 'grid';
        
        const li = document.createElement('li');
        li.dataset.active = false;

        li.appendChild(this.createHTMLElement(response.name, response.name, 'h1'));

        const iconWrapper = this.createHTMLElement('', response.name);
        const icon = document.createElement('img');
        icon.src = `http://openweathermap.org/img/wn/${response.weather[0].icon}.png`;
        iconWrapper.appendChild(icon);
        li.appendChild(iconWrapper);

        li.appendChild(this.createHTMLElement(`Todays temperature is ${Math.floor(response.main.temp)} degree Celcius.`, response.name));
        li.appendChild(this.createHTMLElement(`Todays minimal temperature is ${Math.floor(response.main.temp_min)} degree Celcius.`, response.name));
        li.appendChild(this.createHTMLElement(`Todays maximum temperature is ${Math.floor(response.main.temp_max)} degree Celcius.`, response.name));

        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = 'X';
        deleteButton.dataset.city = response.name;
        deleteButton.addEventListener('click', this.deleteEntry.bind(this));
        li.appendChild(deleteButton);

        this.weatherInfo.appendChild(li);

        li.addEventListener('click', this.setActiveLocation.bind(this));
      });
  },

  setActiveLocation(e) {
    this.loader.className += ' visible';
    e.target.parentNode.dataset.active = true;
    const elements = document.querySelectorAll('li');
    for (const item of elements) {
      if (item.dataset.active === 'true' && item !== e.target.parentNode) {
        item.dataset.active = false;
      }
    }
    this.backgroundImage(e.target.dataset.city);
  },

  deleteEntry(e) {
    e.stopPropagation();
    let weatherStorage = localStorage.getItem('cities');
    weatherStorage = JSON.parse(weatherStorage);

    const { city } = e.target.dataset;
    weatherStorage = weatherStorage.filter((el) => el !== city);

    weatherStorage = JSON.stringify(weatherStorage);
    localStorage.setItem('cities', weatherStorage);

    e.target.closest('li').remove();

    if (this.weatherInfo.innerHTML === '') {
      this.weatherInfo.style.display = 'none';
    }
  },
};

weatherApp.weatherOnLoad();
weatherApp.getWeatherLocation();
