import Constants from "expo-constants";

const axios = require("axios").default.create({
	baseURL: "https://api.openweathermap.org/data/2.5/",
});
console.log("CHoppIeSr", process.env);
const ONE_CALL = `onecall?appid=${Constants.manifest.extra.appkey}`;
const WEATHER = `weather?appid=${Constants.manifest.extra.appkey}`;

async function getWeatherForLocation(lat, lon) {
	let response = await axios.get(ONE_CALL, { params: { lat, lon, units: "imperial" } });
	return response.data;
}

async function getWeatherForToday(location) {
	let response = await axios.get(WEATHER, { params: { q: location } });
	return response.data;
}

async function getWeatherForTodayLatLon(lat, lon) {
	let response = await axios.get(WEATHER, { params: { lat, lon } });
	return response.data;
}

export { getWeatherForLocation, getWeatherForToday, getWeatherForTodayLatLon };
