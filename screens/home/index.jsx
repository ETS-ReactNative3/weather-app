import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, Image, StyleSheet, FlatList, ScrollView, RefreshControl, Modal, Button } from "react-native";
import HourCard from "@weather/components/hour-card";
import VerticalCard from "@weather/components/vertical-card";
import { convertFarToCel, getLocation, getValueFor, getWeather, getWeatherForecast, save } from "@weather/misc";
import { format, isSameDay, isTomorrow } from "date-fns";
import Search from "./components/search";
import { getWeatherForTodayLatLon } from "@weather/misc/network";
import { country } from "@weather/misc/constants";
import Loader from "@weather/components/loader";

//const db = openDatabase("@weather/sqlite/cities.db");
const LOCATION = "location";

export default function Home() {
	const [location, setLocation] = useState(null);
	const [weatherForecast, setWeatherForecast] = useState(null);
	const [currentHourData, setCurrentHourData] = useState(null);
	const [shouldFetch, setShouldFetch] = useState(true); // should fetch if on load
	const [refreshing, setRefreshing] = useState(false);
	const [loading, setLoading] = useState(false);
	const [selected, setSelected] = useState(null);
	const [error, setErrorMsg] = useState("");

	const now = useRef(new Date());
	const flatlistRef = useRef(null);

	// Initial load of forecast
	useEffect(() => {
		const loadWeather = async () => {
			let _selected = selected;
			let _location = location;
			if (!_selected) {
				/** get cached location from device storage */
				_selected = await getValueFor(LOCATION);

				if (!_selected) {
					setSelected(_selected);
				}
			}

			/** Get current device location */
			if (!_location && !_selected) {
				_location = await getLocation();
				// get the name information for current location
				let weather = await getWeatherForTodayLatLon(_location?.coords?.latitude, _location?.coords?.longitude);

				// tranform data into the standard format accross app
				_location = {
					country: weather?.sys?.country,
					countryLong: country[weather?.sys?.country] || "",
					name: weather?.name,
					lat: _location?.coords?.latitude,
					lon: _location?.coords?.longitude,
				};
			}

			// only fetchh if we have a location
			if (_selected || _location) {
				// use the lat&lon coordinated to get weather forecast for today and next 6 days
				let forecast = await getWeatherForecast(_selected || _location);

				// the initial setup was complete
				setShouldFetch(false);
				if (forecast) {
					setWeatherForecast(forecast);

					// this data is used to represent temperature "right now"
					setCurrentHourData(forecast?.hourly[0]);
					now.current = new Date();

					/** set location, set selected and update cache */
					if (_location) {
						setLocation(_location);
						setSelected(_location);
						save(LOCATION, JSON.stringify(_location));
					}

					/**  set selected and update cache */
					if (_selected) {
						setSelected(_selected);
						save(LOCATION, JSON.stringify(_selected));
					}
				}
			}
		};

		if (shouldFetch) {
			loadWeather()
				.catch(e => {
					console.log(e);
					setErrorMsg(e.message);
				})

				.finally(() => setShouldFetch(false));
		}
	}, [shouldFetch, getWeatherForecast, location]);

	// pull down to refresh
	const onRefresh = useCallback(() => {
		if (!refreshing) {
			setRefreshing(true);
			getWeatherForecast(selected)
				.then(forecast => setWeatherForecast(forecast))
				.catch(error => setErrorMsg(error.message))
				.finally(() => setRefreshing(false));
		}
	}, [selected]);

	const SmallText = ({ text }) => <Text style={{ fontSize: 10, marginTop: "auto", marginBottom: "auto" }}>{text}</Text>;

	return (
		<>
			{shouldFetch ? (
				<Text>Loading...</Text>
			) : (
				<ScrollView
					style={styles.scrollStyle}
					refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
					keyboardShouldPersistTaps="always"
				>
					<View style={styles.main}>
						<View style={styles.headSection}>
							{currentHourData ? (
								<View style={[styles.headerContent]}>
									<Search
										callBack={async l => {
											setLoading(true);
											let forecast = await getWeatherForecast(l);

											// set the weather forecast for the week
											setWeatherForecast(forecast);
											// set current weather
											setCurrentHourData(forecast?.hourly[0]);
											now.current = new Date();
											setLoading(false);
										}}
										selected={selected}
										setSelected={e => {
											save(LOCATION, JSON.stringify(e));
											setSelected(e);
										}}
										term={selected?.name}
										locationCallback={async () => {
											setLoading(true);
											let _location = await getLocation();

											// get the name information
											let weather = await getWeatherForTodayLatLon(
												_location?.coords?.latitude,
												_location?.coords?.longitude
											);

											let currLocation = {
												country: weather?.sys?.country,
												countryLong: country[weather?.sys?.country] || "",
												name: weather?.name,
												lat: _location?.coords?.latitude,
												lon: _location?.coords?.longitude,
											};

											if (currLocation?.name + currLocation?.country !== selected?.name + selected?.country) {
												let forecast = await getWeatherForecast(currLocation);

												if (forecast) {
													setWeatherForecast(forecast);
													setCurrentHourData(forecast?.hourly[0]);
													now.current = new Date();

													/** Format location properly and set selected */

													setLocation(currLocation);
													setSelected(currLocation);
													// cache of location for offline access
													save(LOCATION, JSON.stringify(currLocation));
												}
											}
											setLoading(false);
										}}
									/>
									<View style={{ marginTop: 20, flex: 1, justifyContent: "center" }}>
										<View style={styles.paddingVertical}>
											<Text style={[styles.text, styles.currentDate, styles.secondaryTextHeaderColor]}>
												{format(now.current, "eee, MMM dd")}
											</Text>
										</View>
										<View style={[styles.row, { flex: 1, justifyContent: "center", alignItems: "center" }]}>
											<Image
												source={getWeather(currentHourData?.weather?.[0]?.main)}
												style={{
													height: 40,
													width: 40,
													resizeMode: "stretch",
													marginTop: "auto",
													marginBottom: "auto",
													marginRight: 24,
												}}
											/>
											<Text style={[styles.text, styles.currentTemerature]}>{`${convertFarToCel(
												currentHourData?.temp
											)}°c`}</Text>
										</View>
										<View style={[styles.row, styles.spaceBetween, styles.paddingVertical]}>
											<SmallText text="low" />

											<Text
												style={[
													styles.text,
													styles.currentMinMaxTemp,
													styles.secondaryText,
													styles.secondaryTextHeaderColor,
													{ marginRight: 24 },
												]}
											>{`${convertFarToCel(weatherForecast?.daily?.[0]?.temp?.min)}°c`}</Text>
											<SmallText text="high" />
											<Text
												style={[
													styles.text,
													styles.currentMinMaxTemp,
													styles.secondaryText,
													styles.secondaryTextHeaderColor,
												]}
											>{`${convertFarToCel(weatherForecast?.daily?.[0]?.temp?.max)}°c`}</Text>
										</View>
									</View>
								</View>
							) : null}
						</View>
						<View style={styles.forecast}>
							<View style={[styles.textMargin]}>
								<Text style={[styles.text, styles.textMargin, styles.header]}>Hourly</Text>
								{weatherForecast?.timezone ? (
									<FlatList
										nestedScrollEnabled
										data={weatherForecast?.hourly?.slice(0, Math.max(10, 24 - now.current.getHours()))}
										renderItem={({ item, index }) => {
											let time = new Date(0);
											time.setUTCSeconds(item.dt);

											return (
												<HourCard
													temperature={`${convertFarToCel(item.temp)}°c`}
													time={format(time, "hh:mm aaa")}
													weather={item.weather?.[0]?.main}
													current={index === 0}
												/>
											);
										}}
										horizontal={true}
										ref={flatlistRef}
										keyExtractor={(item, id) => `__key_${item?.time}__${id}__${item?.weather}`}
									/>
								) : (
									<Text style={{ marginLeft: "auto", marginRight: "auto" }}>No Forecast Availale</Text>
								)}
							</View>
							<View>
								<Text style={[styles.text, styles.textMarginTop, styles.textMargin, styles.header]}>Next 7 Days</Text>

								{weatherForecast?.timezone ? (
									weatherForecast?.daily?.slice(1)?.map((item, ind) => {
										const date = new Date(0);
										date.setUTCSeconds(item?.dt);
										let sameday = isSameDay(date, now.current);
										let isTom = isTomorrow(date);

										return (
											<VerticalCard
												key={`weath__${ind}`}
												weather={item?.weather?.[0]?.main}
												date={sameday ? "Today" : isTom ? "Tomorrow" : format(date, "eee, MMM dd")}
												high={`${convertFarToCel(item?.temp?.max)}°c`}
												low={`${convertFarToCel(item?.temp?.min)}°c`}
												rain={`${Math.round(item?.pop * 100).toFixed(0)}%`}
												humidity={`${Math.round(item?.humidity).toFixed(0)}%`}
											/>
										);
									})
								) : (
									<Text style={{ marginTop: "auto", marginBottom: "auto" }}>No Prediction Available</Text>
								)}
							</View>
						</View>
					</View>
				</ScrollView>
			)}

			<Loader active={loading} message={"Getting Forecast"} />
			{error ? (
				<Modal>
					<Text>{error}</Text>
					<Button title="close" onPress={() => setErrorMsg("")} />
				</Modal>
			) : null}
		</>
	);
}

const styles = StyleSheet.create({
	scrollStyle: { width: "100%", flex: 1 },
	main: {
		backgroundColor: "#F3F3F3",
		height: "100%",
		width: "100%",
	},
	forecast: {
		padding: 16,
	},
	verticalScroll: {
		flexDirection: "row",
	},
	headSection: {
		height: 268,
		width: "100%",
		overflow: "hidden",
		position: "relative",
		backgroundColor: "#fff",
		borderBottomLeftRadius: 30,
		borderBottomRightRadius: 30,

		elevation: 5,
		shadowOpacity: 0.26,
		shadowRadius: 0.3 * 5,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
	},
	header: {
		fontSize: 20,
		marginTop: 16,
		marginBottom: 12,
		fontWeight: "600",
	},
	headerImage: {
		resizeMode: "stretch",
		height: "100%",
		width: "100%",
	},
	headerBottom: {
		position: "absolute",
		zIndex: 5,
		bottom: -25,
		left: -20,
		// transform: [{ rotate: "-4deg" }],
	},
	headerContent: {
		flex: 1,
		maxWidth: 500,
		position: "absolute",
		zIndex: 2,
		top: 0,
		height: "100%",
		width: "100%",
		padding: 16,
		paddingTop: 0,
		justifyContent: "center",
		alignItems: "center",
	},
	centerAlign: {
		marginHorizontal: "auto",
		marginVertical: "auto",
	},
	text: {
		fontFamily: "Roboto_400Regular",
		fontSize: 14,
	},
	textMargin: {
		marginBottom: 8,
	},
	textMarginTop: {
		marginTop: 16,
	},
	row: {
		flexDirection: "row",
	},
	spaceBetween: {
		justifyContent: "space-between",
	},
	paddingVertical: { paddingVertical: 16 },
	currentTemerature: {
		fontSize: 50,
		fontWeight: "700",
		// color: "#303030",
		color: "#466588",
	},
	currTempRow: {},
	currentConditions: {
		fontWeight: "700",
		color: "#303030",
		fontSize: 16,
	},
	secondaryTextHeaderColor: {
		color: "#696E79",
		// color: "#fff",
		// color: "#303030",
		// color: "blue",
		// color: "#d3d3d3",
		// color: "#6f6f74",
	},
	secondaryText: {
		fontSize: 20,
	},
	currentDate: {
		fontSize: 16,
		textAlign: "center",
	},
	currentMinMaxTemp: {
		// color: "#696E79",
		fontSize: 16,
		fontFamily: "Roboto_700Normal",
		fontWeight: "700",
		// fontWeight: "bold"
		/* 
		textShadowColor: "#000",
		textShadowRadius: 12,
		textShadowOffset: {
			width: 0.8,
			height: 0.8,
		}, */
	},
	currentTemperatureDark: {
		color: "#fff",
	},
});
