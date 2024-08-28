document.querySelector("body form").addEventListener("submit", async (e) => {
    let city = document.querySelector("#city"), res = "";
    e.preventDefault();
    try {
      res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city.value}&units=metric&appid=4216104a9c50bfc97ddb77e6a7d3af2b`);
      dispData(await res.json());
    } catch {
      document.querySelector("#error").style.display = "block";
    }
  });
  let dispData = (weather) => {
    if (weather.cod == 400 || weather.cod == 404) {
      document.querySelector("#error").style.display = "block";
      document.querySelector("#city-name").textContent = "";
      document.querySelector("#temp").textContent = "";
      document.querySelector("#humid").textContent = "";
      document.querySelector("#icon").innerHTML = "";
    } else {
      document.querySelector("#error").style.display = "";
      document.querySelector("#city-name").textContent = `${weather.name}`;
      document.querySelector("#temp").textContent = `${weather.main.temp}C`;
      document.querySelector("#humid").textContent = `${weather.main.humidity}%`;
      document.querySelector("#icon").innerHTML = `<img src="https://openweathermap.org/img/wn/${weather.weather[0].icon}.png"></img>`;
    }
  };