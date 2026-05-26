import {
	Poppins_400Regular,
	Poppins_500Medium,
	Poppins_600SemiBold,
	Poppins_700Bold,
	useFonts,
} from "@expo-google-fonts/poppins";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useContext, useEffect, useRef, useState } from "react";
import {
	ActivityIndicator,
	Pressable,
	SafeAreaView,
	ScrollView,
	StyleSheet,
	Text,
	useWindowDimensions,
	View,
} from "react-native";
import { GameContext } from "../../context/GameContext";
import {
	loadGodModeEnabled,
	saveGodModeEnabled,
} from "../../utils/packStorage";

export default function HomeScreen() {
	const router = useRouter();
	const { ancestors, collection } = useContext(GameContext);

	const [godModeEnabled, setGodModeEnabled] = useState(false);
	const [hasLoadedGodMode, setHasLoadedGodMode] = useState(false);
	const godModeEnabledRef = useRef(godModeEnabled);
	const hasUserToggledGodModeRef = useRef(false);

	const [fontsLoaded] = useFonts({
		Poppins_400Regular,
		Poppins_500Medium,
		Poppins_600SemiBold,
		Poppins_700Bold,
	});
	const { width } = useWindowDimensions();
	const isCompact = width < 380;

	useEffect(() => {
		godModeEnabledRef.current = godModeEnabled;
	}, [godModeEnabled]);

	useEffect(() => {
		let active = true;

		void loadGodModeEnabled().then((enabled) => {
			if (!active) {
				return;
			}

			if (!hasUserToggledGodModeRef.current) {
				setGodModeEnabled(enabled);
			}

			setHasLoadedGodMode(true);

			if (hasUserToggledGodModeRef.current) {
				void saveGodModeEnabled(godModeEnabledRef.current);
			}
		});

		return () => {
			active = false;
		};
	}, []);

	useEffect(() => {
		if (!hasLoadedGodMode) {
			return;
		}

		void saveGodModeEnabled(godModeEnabled);
	}, [godModeEnabled, hasLoadedGodMode]);

	const toggleGodMode = () => {
		hasUserToggledGodModeRef.current = true;
		setGodModeEnabled((prev) => !prev);
	};

	if (!fontsLoaded) {
		return (
			<SafeAreaView style={styles.loadingContainer}>
				<ActivityIndicator size="large" color="#2563eb" />
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.safeArea}>
			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={styles.container}
			>
				<View
					style={[
						styles.headerRow,
						isCompact && { flexDirection: "column", alignItems: "flex-start" },
					]}
				>
					<View>
						<Text style={[styles.pageTitle, isCompact && { fontSize: 26 }]}>
							Pokémon TCG Budget
						</Text>
						<Text
							style={[styles.pageSubtitle, isCompact && { maxWidth: "100%" }]}
						>
							Build your collection with sleek pulls and smart browsing.
						</Text>
					</View>
					<View style={[styles.headerBadge, isCompact && { marginTop: 12 }]}>
						<Ionicons name="sparkles" size={24} color="#f59e0b" />
					</View>
				</View>

				<View style={styles.heroCard}>
					<View style={styles.heroGlow} />
					<View
						style={[
							styles.heroTop,
							isCompact && { flexDirection: "column", alignItems: "stretch" },
						]}
					>
						<View
							style={[
								styles.heroTextBox,
								isCompact && { paddingRight: 0, paddingBottom: 12 },
							]}
						>
							<Text style={styles.heroEyebrow}>New season</Text>
							<Text style={[styles.heroTitle, isCompact && { fontSize: 22 }]}>
								Welcome back, collector.
							</Text>
							<Text style={styles.heroDescription}>
								Open packs, reveal rare cards, and keep your Pokédex fresh in
								one modern flow.
							</Text>
						</View>
						<View style={styles.heroIconCard}>
							<Ionicons name="planet" size={28} color="#ffffff" />
						</View>
					</View>

					<View
						style={[styles.statsRow, isCompact && { flexDirection: "column" }]}
					>
						<View style={styles.statCard}>
							<Text style={styles.statLabel}>Ancestors</Text>
							<Text style={styles.statValue}>{ancestors}</Text>
						</View>
						<View style={styles.statCard}>
							<Text style={styles.statLabel}>Collection</Text>
							<Text style={styles.statValue}>{collection.length}</Text>
						</View>
					</View>
				</View>

				<View
					style={[styles.featureRow, isCompact && { flexDirection: "column" }]}
				>
					<Pressable
						style={[
							styles.featureCard,
							styles.packCard,
							isCompact && { minHeight: 150 },
						]}
						onPress={() => router.push("/(tabs)/pack")}
					>
						<Ionicons name="albums-outline" size={24} color="#ffffff" />
						<Text style={styles.featureCardTitle}>Open packs</Text>
						<Text style={styles.featureCardText}>
							Swipe through packs, reveal cards, and track your pull rewards.
						</Text>
					</Pressable>

					<Pressable
						style={[
							styles.featureCard,
							styles.wonderCard,
							isCompact && { minHeight: 150 },
						]}
						onPress={() => router.push("/(tabs)/wondermiss")}
					>
						<Ionicons name="sparkles-outline" size={24} color="#ffffff" />
						<Text style={styles.featureCardTitle}>WonderMiss</Text>
						<Text style={styles.featureCardText}>
							Play a high-energy selection flow with fast card reveals.
						</Text>
					</Pressable>
				</View>

				<View style={styles.actionGrid}>
					<Pressable
						style={styles.actionButton}
						onPress={() => router.push("/(tabs)/pack")}
					>
						<Text style={styles.actionButtonText}>Browse packs</Text>
					</Pressable>

					<Pressable
						style={styles.actionButton}
						onPress={() => router.push("/(tabs)/collection")}
					>
						<Text style={styles.actionButtonText}>Open Pokédex</Text>
					</Pressable>

					<Pressable
						style={styles.actionButton}
						onPress={() => router.push("/(tabs)/wondermiss")}
					>
						<Text style={styles.actionButtonText}>Try WonderMiss</Text>
					</Pressable>

					<Pressable
						style={({ pressed }) => [
							styles.actionButton,
							godModeEnabled && styles.godModeActiveButton,
							pressed && styles.actionButtonPressed,
						]}
						onPress={toggleGodMode}
					>
						<Text
							style={
								godModeEnabled
									? styles.godModeActiveText
									: styles.actionButtonText
							}
						>
							{godModeEnabled ? "GOD Mode: ON" : "GOD Mode: OFF"}
						</Text>
					</Pressable>
				</View>

				<View style={styles.missionCard}>
					<Text style={styles.missionTitle}>Today's mission</Text>
					<Text style={styles.missionText}>
						Refresh your collection, chase a shiny pull, and keep your run
						going.
					</Text>
					<View style={styles.missionTagRow}>
						<View style={styles.missionTag}>
							<Text style={styles.missionTagText}>Fresh pulls</Text>
						</View>
						<View style={styles.missionTag}>
							<Text style={styles.missionTagText}>Rare highlights</Text>
						</View>
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

const FONT = {
	regular: "Poppins_400Regular",
	medium: "Poppins_500Medium",
	semiBold: "Poppins_600SemiBold",
	bold: "Poppins_700Bold",
};

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: "#f3f6fb",
	},
	loadingContainer: {
		flex: 1,
		backgroundColor: "#f3f6fb",
		alignItems: "center",
		justifyContent: "center",
	},
	container: {
		paddingHorizontal: 20,
		paddingTop: 28,
		paddingBottom: 32,
	},
	headerRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 18,
	},
	headerBadge: {
		width: 46,
		height: 46,
		borderRadius: 20,
		backgroundColor: "#ffffff",
		alignItems: "center",
		justifyContent: "center",
		shadowColor: "#0f172a",
		shadowOpacity: 0.08,
		shadowRadius: 14,
		shadowOffset: { width: 0, height: 10 },
		elevation: 4,
	},
	pageTitle: {
		fontSize: 30,
		color: "#0f172a",
		fontFamily: FONT.bold,
	},
	pageSubtitle: {
		marginTop: 6,
		fontSize: 14,
		color: "#475569",
		fontFamily: FONT.regular,
		maxWidth: 300,
	},
	heroCard: {
		backgroundColor: "#0f172a",
		borderRadius: 28,
		padding: 22,
		overflow: "hidden",
		shadowColor: "#0f172a",
		shadowOpacity: 0.15,
		shadowRadius: 18,
		shadowOffset: { width: 0, height: 12 },
		elevation: 8,
	},
	heroGlow: {
		position: "absolute",
		top: -18,
		right: -18,
		width: 120,
		height: 120,
		borderRadius: 60,
		backgroundColor: "rgba(59,130,246,0.24)",
	},
	heroTop: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	heroTextBox: {
		flex: 1,
		paddingRight: 12,
	},
	heroEyebrow: {
		fontSize: 12,
		color: "#93c5fd",
		fontFamily: FONT.semiBold,
		letterSpacing: 0.7,
		textTransform: "uppercase",
	},
	heroTitle: {
		fontSize: 26,
		lineHeight: 34,
		color: "#ffffff",
		fontFamily: FONT.bold,
		marginTop: 8,
	},
	heroDescription: {
		marginTop: 12,
		fontSize: 14,
		lineHeight: 22,
		color: "#dbeafe",
		fontFamily: FONT.regular,
	},
	heroIconCard: {
		width: 60,
		height: 60,
		borderRadius: 24,
		backgroundColor: "rgba(255,255,255,0.1)",
		alignItems: "center",
		justifyContent: "center",
	},
	statsRow: {
		flexDirection: "row",
		gap: 12,
		marginTop: 22,
	},
	statCard: {
		flex: 1,
		backgroundColor: "rgba(255,255,255,0.08)",
		borderRadius: 20,
		paddingVertical: 16,
		paddingHorizontal: 18,
	},
	statLabel: {
		fontSize: 12,
		color: "#cbd5e1",
		fontFamily: FONT.regular,
	},
	statValue: {
		marginTop: 8,
		fontSize: 28,
		color: "#ffffff",
		fontFamily: FONT.bold,
	},
	featureRow: {
		flexDirection: "row",
		gap: 14,
		marginTop: 20,
	},
	featureCard: {
		flex: 1,
		minHeight: 170,
		borderRadius: 24,
		padding: 18,
		justifyContent: "space-between",
		shadowColor: "#0f172a",
		shadowOpacity: 0.1,
		shadowRadius: 16,
		shadowOffset: { width: 0, height: 10 },
		elevation: 7,
	},
	packCard: {
		backgroundColor: "#2563eb",
	},
	wonderCard: {
		backgroundColor: "#0f766e",
	},
	featureCardTitle: {
		marginTop: 14,
		fontSize: 18,
		color: "#ffffff",
		fontFamily: FONT.bold,
	},
	featureCardText: {
		marginTop: 8,
		fontSize: 14,
		lineHeight: 22,
		color: "rgba(255,255,255,0.92)",
		fontFamily: FONT.regular,
	},
	actionGrid: {
		marginTop: 18,
		gap: 12,
	},
	actionButton: {
		backgroundColor: "#ffffff",
		borderRadius: 18,
		paddingVertical: 14,
		paddingHorizontal: 18,
		minHeight: 52,
		borderWidth: 1.5,
		borderColor: "rgb(255, 255, 255)",
		justifyContent: "center",
		shadowColor: "#0f172a",
		shadowOpacity: 0.08,
		shadowRadius: 14,
		elevation: 4,
	},
	actionButtonPressed: {
		opacity: 0.86,
		transform: [{ scale: 0.985 }],
	},
	actionButtonText: {
		fontSize: 15,
		color: "#0f172a",
		fontFamily: FONT.semiBold,
		textAlign: "center",
	},
	godModeActiveButton: {
		backgroundColor: "#fef3c7",
		borderWidth: 1.5,
		borderColor: "#f59e0b",
		shadowColor: "#f59e0b",
		shadowOpacity: 0.24,
		shadowRadius: 14,
		elevation: 4,
	},
	godModeActiveText: {
		fontSize: 15,
		color: "#92400e",
		fontFamily: FONT.bold,
		textAlign: "center",
	},
	missionCard: {
		marginTop: 20,
		backgroundColor: "#ffffff",
		borderRadius: 24,
		padding: 20,
		shadowColor: "#0f172a",
		shadowOpacity: 0.08,
		shadowRadius: 16,
		shadowOffset: { width: 0, height: 10 },
		elevation: 5,
	},
	missionTitle: {
		fontSize: 18,
		fontFamily: FONT.bold,
		color: "#0f172a",
	},
	missionText: {
		marginTop: 10,
		fontSize: 14,
		lineHeight: 22,
		color: "#475569",
		fontFamily: FONT.regular,
	},
	missionTagRow: {
		flexDirection: "row",
		gap: 10,
		marginTop: 14,
		flexWrap: "wrap",
	},
	missionTag: {
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 999,
		backgroundColor: "#e0f2fe",
	},
	missionTagText: {
		fontSize: 12,
		color: "#0f172a",
		fontFamily: FONT.semiBold,
	},
});
