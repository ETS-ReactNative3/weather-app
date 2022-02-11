// weather icons
import weatherSun from "@weather/assets/sunny.png";
import weatherCloudy from "@weather/assets/sunny-with-clouds.png";
import weatherRain from "@weather/assets/rainy.png";
import weatherStorm from "@weather/assets/rainy-storm.png";

// weather backgrounds
import weatherBgCloudy from "@weather/assets/bg/cloudy.jpg";
import weatherBgRaining from "@weather/assets/bg/cloudy.jpg";
import weatherBgSunny from "@weather/assets/bg/cloudy.jpg";
import { getWeatherForLocation, getWeatherForToday } from "@weather/misc/network";
import * as SQLite from "expo-sqlite";
import * as FileSystem from "expo-file-system";
import * as SecureStore from "expo-secure-store";
import * as Location from "expo-location";
import { Asset } from "expo-asset";

// Get the icon for specified weather
const getWeather = weather => {
	let src = weatherSun;
	let _weather = weather?.toLowerCase();
	let theme = {};

	if (_weather?.includes("clear") || _weather?.includes("sun")) {
		src = weatherSun;
	} else if (_weather?.includes("clouds")) {
		src = weatherCloudy;
	} else if (_weather?.includes("storm")) {
		src = weatherStorm;
	} else if (_weather?.includes("rain")) {
		src = weatherRain;
		// if (_weather?.includes("light")) {
		// 	src = weatherCloudySun;
		// }
	} else if (_weather?.includes("")) {
	}
	return src;
};

// Get the background image for specified weather
const getWeatherBG = weather => {
	let src = weatherBgSunny;
	let _weather = weather?.toLowerCase();

	if (_weather?.includes("clear")) {
		src = weatherBgSunny;
	} else if (_weather?.includes("clouds")) {
		src = weatherBgCloudy;
	} else if (_weather?.includes("storm")) {
		src = weatherBgRaining;
	} else if (_weather?.includes("rain")) {
		src = weatherBgRaining;
		// if (_weather?.includes("light")) {
		// 	src = weatherCloudySun;
		// }
	} else if (_weather?.includes("")) {
	}
	return src;
};

/** deg Farenheight to deg Celsius */
const convertFarToCel = far => Math.round((far - 32) * (5 / 9)).toFixed(0);

// open user device database
async function openDatabase() {
	if (!(await FileSystem.getInfoAsync(FileSystem.documentDirectory + "SQLite")).exists) {
		await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + "SQLite");
	}
	// await FileSystem.deleteAsync(FileSystem.documentDirectory + "SQLite/cities.db");
	// await FileSystem.deleteAsync(FileSystem.documentDirectory + "SQLite/cities.db-journal");
	const newName = "sec-cities.db";
	if (!(await FileSystem.getInfoAsync(FileSystem.documentDirectory + `SQLite/${newName}`)).exists) {
		let dbURL = require("../sqlite/cities.db");
		// @ts-ignore
		await FileSystem.downloadAsync(Asset.fromModule(dbURL).uri, FileSystem.documentDirectory + `SQLite/${newName}`);
		// console.log("THis is it:", await FileSystem.readDirectoryAsync(FileSystem.documentDirectory + "SQLite"));
	}
	return SQLite.openDatabase(newName);
}

// get useer loccation
const getLocation = async () => {
	let { status } = await Location.requestPermissionsAsync();
	if (status !== "granted") {
		// setErrorMsg("Permission to access location was denied");
		return;
	}

	/** as per bug comment https://github.com/expo/expo/issues/9377#issuecomment-786640726 */
	let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });

	return location;
};

// get the actual weather forecast
const getWeatherForecast = async (location = null) => {
	let lat, lon;

	if (!location || typeof location === "string") {
		let weather = await getWeatherForToday(location || "jamaica");
		lat = weather.coord.lat;
		lon = weather.coord.lon;
	} else {
		lat = location?.lat;
		lon = location?.lon;
	}

	if (lat && lon) {
		let forecast = await getWeatherForLocation(lat, lon);

		return forecast;
	}

	return null;
};

// Save to local storage
async function save(key, value) {
	await SecureStore.setItemAsync(key, value);
}

// fetch from local storage
async function getValueFor(key) {
	let result = await SecureStore.getItemAsync(key);

	return JSON.parse(result);
}

export { getWeather, getWeatherBG, convertFarToCel, openDatabase, save, getValueFor, getLocation, getWeatherForecast };
