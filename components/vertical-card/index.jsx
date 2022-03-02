import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { getWeather } from "@weather/misc";

const HEIGHT = 26;

export default function VerticalCard({ weather, date, high, low, rain: chanceOfRain, humidity: chanceOfHumidity }) {
	return (
		<View style={styles.main}>
			<Image
				source={getWeather(weather)}
				style={{
					marginTop: "auto",
					marginBottom: "auto",
					height: HEIGHT,
					width: 26,
				}}
			/>
			<Col title={date} value={high} other={low} emphasis={true} />
			<Col title={"Rain"} value={chanceOfRain} />
			<Col title={"Humidity"} value={chanceOfHumidity} />
		</View>
	);
}

const Col = ({ title, value, other = "", emphasis = false }) => (
	<View style={styles.cardContentColumn}>
		<Text style={[styles.text, emphasis ? styles.columnMainHeader : {}]}>{title}</Text>
		<View style={styles.row}>
			<Text style={[styles.text, styles.columnValue, other ? styles.columnValueEmphasis : {}]}>{value}</Text>
			{other ? <Text style={[styles.text, styles.columnValue, styles.columnValueLowEmphasis]}>{other}</Text> : <></>}
		</View>
	</View>
);

const styles = StyleSheet.create({
	main: {
		height: 72,
		backgroundColor: "#fff",
		borderRadius: 10,
		display: "flex",
		flexDirection: "row",
		paddingHorizontal: 20,
		paddingVertical: 16,
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 16,
	},
	text: {
		fontFamily: "Roboto_400Regular",
		color: "#CDCDCD",
	},
	cardContentColumn: {
		/* height: "100%", */
		// backgroundColor: "green",
		height: HEIGHT * 2,
	},
	row: {
		flexDirection: "row",
		justifyContent: "space-between",
		margin: 0,
		padding: 0,
	},
	columnValue: {
		fontWeight: "700",
		fontSize: 18,
		color: "#575960",
		height: "100%",
	},
	columnValueEmphasis: {
		color: "#266188",
		fontSize: 18,
		marginRight: 8,
	},
	columnValueLowEmphasis: {
		fontWeight: "400",
		color: "#B8B8B8",
		fontSize: 14,
	},
	columnMainHeader: {
		fontSize: 14,
		fontWeight: "500",
		color: "#555555",
	},
});
