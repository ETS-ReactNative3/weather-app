import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, View, Text, Animated } from "react-native";
import { ActivityIndicator } from "react-native";

/**
 * Loading Overlay Component
 * @param {Object} props
 * @param {Boolean} props.active
 * @param {String=} props.message
 */
const Loader = ({ active, message }) => {
	const loadingOpacity = useState(new Animated.Value(0))[0];

	useEffect(() => {
		fadeAnimation();
	}, []);

	const fadeAnimation = () => {
		Animated.sequence([
			Animated.timing(loadingOpacity, {
				toValue: 1,
				duration: 1000,
				useNativeDriver: true,
			}),
			Animated.timing(loadingOpacity, {
				toValue: 0,
				duration: 1000,
				useNativeDriver: true,
			}),
		]).start(() => fadeAnimation());
	};

	if (active) {
		return (
			<View style={styles.container}>
				<ActivityIndicator size={60} style={styles.spinner} color="#266188" />
				<Animated.Text style={{ ...styles.title, opacity: loadingOpacity }}>Loading ...</Animated.Text>
				<Text style={styles.message}>{message ? `${message}` : ""}</Text>
			</View>
		);
	} else {
		return <></>;
	}
};
export default Loader;

const styles = StyleSheet.create({
	container: {
		position: "absolute",
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		display: "flex",
		flex: 1,
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		zIndex: 999,
		elevation: 8,
		backgroundColor: "#fff",
		opacity: 0.8,
	},
	spinner: {
		marginBottom: 8,
	},
	title: {
		color: "#266188",
		fontSize: 32,
	},
	message: {
		color: "#266188",
		fontSize: 24,
	},
});
