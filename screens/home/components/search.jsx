import { openDatabase } from "@weather/misc";
import React, { useEffect, useRef, useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Modal, TouchableOpacity, Image } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import useDebounce from "../hooks/useDebounce";
import SearchIconBlack from "@weather/assets/magnify-black.png";

export default function Search({
	callBack = _ => {},
	selected,
	setSelected,
	locationCallback = () => {},
	term = null,
}) {
	const [error, setError] = useState("");
	const [searchTerm, setSearchTerm] = useState(null);
	const [fullScreen, setFullScreen] = useState(false);
	const [suggestions, setSuggestions] = useState([]);
	const [db, setDB] = useState(null);
	const debouncedSearchTerm = useDebounce(searchTerm, 80);
	const inputRef = useRef(null);

	const doSearch = db => {
		db?.transaction(
			tx => {
				let r = tx.executeSql(
					`select * from cities where name like ? limit 10;`,
					[`%${debouncedSearchTerm}%`],
					(_, { rows: { _array } }) => {
						setSuggestions(_array);
						return true;
					},
					(_, error) => {
						console.log("Query Error: ", error);
						setError("Query format error");
					}
				);
			},
			error => {
				setError("Error tyring to search term");
			}
		);
	};

	/** open database */
	useEffect(() => {
		if (!db) {
			(async () => {
				let _db = await openDatabase();
				setDB(_db);
			})();
		}
	}, [setDB]);

	/** debounce search to avoid contant querying */
	useEffect(() => {
		setError("");
		if (debouncedSearchTerm && db && fullScreen) {
			doSearch(db);
		} else {
			setSuggestions([]);
		}
	}, [debouncedSearchTerm, db]);

	/** set term initial value to prop value */
	useEffect(() => {
		if (term && term !== searchTerm) {
			setSearchTerm(term);
		}
	}, [term]);

	/** set searchterm on entering fullscreen mode */
	useEffect(() => {
		// setSearchTerm(term);
		if (fullScreen && db && !suggestions?.length) {
			doSearch(db);
		}
	}, [fullScreen]);

	return (
		<>
			{!fullScreen ? (
				<View style={[styles.searchbar]}>
					<Text
						onPress={e => {
							if (!fullScreen) setFullScreen(true);
						}}
						style={[styles.searchBox]}
					>
						{selected && typeof selected === "object"
							? `${selected?.name}, ${selected?.countryLong}`
							: selected
							? selected
							: "jamaica"}
					</Text>
					<TouchableOpacity
						style={[styles.searchButtonContainer]}
						onPress={() => {
							setFullScreen(true);
						}}
					>
						<Image source={SearchIconBlack} style={styles.searchButton} />
					</TouchableOpacity>
				</View>
			) : (
				<Modal
					style={[styles.main, fullScreen ? styles.fullscreen : {}]}
					onRequestClose={() => {
						setFullScreen(false);
					}}
					animationType={"slide"}
					onShow={() => {
						setTimeout(() => {
							inputRef.current.blur();
							inputRef.current.focus();
						}, 10);
					}}
				>
					<ScrollView keyboardShouldPersistTaps="always">
						<View style={[styles.searchbar]}>
							<TextInput
								onChangeText={e => {
									if (!fullScreen) setFullScreen(true);

									setSearchTerm(e);
									setSelected(null);
								}}
								autoFocus={true}
								style={[styles.searchBox]}
								value={searchTerm}
								placeholder={"city, town"}
								editable={!db === false}
								ref={inputRef}
							/>
							<TouchableOpacity
								style={[styles.searchButtonContainer]}
								onPress={() => {
									setFullScreen(false);
									callBack(debouncedSearchTerm);
									setSelected(debouncedSearchTerm);
								}}
							>
								<Image source={SearchIconBlack} style={styles.searchButton} />
							</TouchableOpacity>
						</View>
						{/* THis will use device location for weather */}
						<Button
							title="Use My Location"
							onPress={() => {
								setFullScreen(false);
								locationCallback();
								setSearchTerm("");
							}}
						/>
						{error ? <Text style={styles.error}>{error}</Text> : null}
						{/* the autosuggestion */}
						{suggestions?.map((suggestion, index) => {
							return (
								<Text
									key={`${suggestion?.name}_${index}`}
									style={[styles.result]}
									onPress={() => {
										setSearchTerm(suggestion?.name);
										setSelected(suggestion);
										callBack(suggestion);
										setFullScreen(false);
									}}
								>
									{" "}
									{suggestion?.name}, {suggestion?.countryLong}
								</Text>
							);
						})}
					</ScrollView>
				</Modal>
			)}
		</>
	);
}

const styles = StyleSheet.create({
	main: {
		margin: 32,
		height: 40,
		width: "auto",
	},
	error: {
		color: "#dc3545",
	},
	fullscreen: {
		position: "absolute",
		height: "100%",
		width: "100%",
		backgroundColor: "#fff",
	},
	result: {
		paddingHorizontal: 16,
		paddingVertical: 12,
		fontFamily: "Roboto_400Regular",
		fontSize: 14,
	},
	searchBox: {
		marginRight: 10,
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderBottomColor: "#eee",
	},
	searchButton: {
		height: 24,
		width: 24,
		margin: 0,
		padding: 0,
		marginTop: "auto",
		marginBottom: "auto",
	},
	searchButtonContainer: {
		width: 50,
		paddingHorizontal: 16,
	},
	searchbar: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 0,
		zIndex: 6,
		width: "100%",
	},
});
