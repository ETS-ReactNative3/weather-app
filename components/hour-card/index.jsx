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
			<Text style={[styles.textCenter, styles.text, current ? styles.activeText : {}]}>{time}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		height: 112,
		width: 84,
		backgroundColor: "#FFFFFF",
		borderRadius: 10,
		paddingVertical: 16,
		paddingHorizontal: 8,
		marginRight: 16,
	},
	text: {
		color: "#A0A2A9",
		fontFamily: "Roboto_400Regular",
	},
	activeText: {
		// color: "#3083FF",
		color: "#466588",
	},
	textTemperature: {
		fontSize: 18,
		fontWeight: "700",
		color: "#696E79",
		fontFamily: "Roboto_700Bold",
	},
	textCenter: {
		textAlign: "center",
	},
});
