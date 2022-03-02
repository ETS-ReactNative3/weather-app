import React from "react";
import { View, StyleSheet, Image, Text } from "react-native";
import { getWeather } from "@weather/misc";

export default function HourCard({ weather, time, temperature, current }) {
	return (
		<View style={styles.card}>
			<Image
				source={getWeather(weather)}
				style={{
					marginLeft: "auto",
					marginRight: "auto",
					height: 30,
					width: 30,
					resizeMode: "contain",
					marginBottom: 4,
				}}
			/>
			<Text style={[styles.textCenter, styles.textTemperature, current ? styles.activeText : {}]}>{temperature}</Text>
			<Text style={[styles.textCenter, styles.text, current ? styles.activeText : {}, styles.time]}>{time}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		height: 122,
		width: 96,
		backgroundColor: "#FFFFFF",
		borderRadius: 10,
		paddingVertical: 20,
		paddingHorizontal: 12,
		marginRight: 16,
		alignItems: "center",
	},
	text: {
		color: "#A0A2A9",
		fontFamily: "Roboto_400Regular",
	},
	time: {
		fontSize: 14,
	},
	activeText: {
		// color: "#3083FF",
		color: "#466588",
	},
	textTemperature: {
		fontSize: 24,
		fontWeight: "600",
		color: "#696E79",
		fontFamily: "Roboto_700Bold",
	},
	textCenter: {
		textAlign: "center",
	},
});
