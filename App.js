import {
	useFonts,
	Roboto_100Thin,
	Roboto_300Light,
	Roboto_400Regular,
	Roboto_500Medium,
	Roboto_700Bold,
	Roboto_900Black,
} from "@expo-google-fonts/roboto";
import AppLoading from "expo-app-loading";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { StyleSheet, View } from "react-native";
import Home from "./screens/home";

function App() {
	return (
		<View style={styles.container}>
			<StatusBar translucent={false} style="dark" backgroundColor="#fff" />
			<Home />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
		alignItems: "center",
		justifyContent: "center",
	},
});

export default function AppWrapper() {
	const [fontsLoaded] = useFonts({
		Roboto_100Thin,
		Roboto_300Light,
		Roboto_400Regular,
		Roboto_500Medium,
		Roboto_700Bold,
		Roboto_900Black,
	});

	if (!fontsLoaded) return <AppLoading />;

	return <App />;
}
