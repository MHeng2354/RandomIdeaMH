import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useContext } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { GameContext } from "../../context/GameContext";

export default function Home() {
	const router = useRouter();
	const { ancestors, collection } = useContext(GameContext);
	const canUseWonderMiss = ancestors >= 10;

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.backgroundLayer} />
			<View style={styles.heroCard}>
				<View style={styles.heroGlow} />
				<View style={styles.heroGlowSecondary} />
				<View style={styles.heroHeader}>
					<View>
						<Text style={styles.welcome}>Welcome back!</Text>
						<Text style={styles.subheading}>
							Your collection is shining brighter than ever.
						</Text>
					</View>
					<Ionicons name="sparkles" size={30} color="#ffd24d" />
				</View>
				<Text style={styles.subtitle}>
					Open packs, unlock shinies, and build the ultimate team.
				</Text>
				<View style={styles.heroBadge}>
					<Text style={styles.heroBadgeText}>
						Featured: Shiny pulls are on the rise
					</Text>
				</View>
				<View style={styles.statsRow}>
					<View style={styles.statBubble}>
						<Text style={styles.statLabel}>Ancestors</Text>
						<Text style={styles.statValue}>{ancestors}</Text>
					</View>
					<View style={styles.statBubble}>
						<Text style={styles.statLabel}>Collection</Text>
						<Text style={styles.statValue}>{collection.length}</Text>
					</View>
				</View>
			</View>

			<View style={styles.quickRow}>
				<View style={[styles.quickCard, styles.quickCardOrange]}>
					<Ionicons name="albums" size={22} color="#fff" />
					<Text style={styles.quickTitleLight}>Packs</Text>
					<Text style={styles.quickTextLight}>
						Open bundles, chase rares, and collect your favorites.
					</Text>
				</View>
				<View style={[styles.quickCard, styles.quickCardBlue]}>
					<Ionicons name="flash" size={22} color="#fff" />
					<Text style={styles.quickTitleLight}>WonderMiss</Text>
					<Text style={styles.quickTextLight}>
						Take a chance on high-volatility pulls with big rewards.
					</Text>
				</View>
			</View>

			<View style={styles.buttonRow}>
				<Pressable
					style={styles.actionButton}
					onPress={() => router.push("/pack")}
				>
					<Text style={styles.buttonText}>Browse Packs</Text>
				</Pressable>
				<Pressable
					style={styles.actionButton}
					onPress={() => router.push("/collection")}
				>
					<Text style={styles.buttonText}>View Collection</Text>
				</Pressable>
				<Pressable
					style={[
						styles.actionButton,
						!canUseWonderMiss && styles.disabledButton,
					]}
					onPress={() => router.push("/wondermiss")}
					disabled={!canUseWonderMiss}
				>
					<Text style={styles.buttonText}>Try WonderMiss</Text>
				</Pressable>
			</View>

			<View style={styles.summaryCard}>
				<Text style={styles.summaryTitle}>Today’s mission</Text>
				<Text style={styles.summaryText}>
					Open a shiny pack, grow your collection, and see if luck is on your
					side.
				</Text>
				<View style={styles.summaryPillRow}>
					<View style={styles.summaryPill}>
						<Text style={styles.summaryPillText}>+0.2% shiny boost</Text>
					</View>
					<View style={styles.summaryPill}>
						<Text style={styles.summaryPillText}>Top pulls highlighted</Text>
					</View>
				</View>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#ecf3ff",
		paddingHorizontal: 20,
		paddingTop: 50,
	},
	backgroundLayer: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		height: 260,
		backgroundColor: "#4051b5",
		borderBottomLeftRadius: 40,
		borderBottomRightRadius: 40,
	},
	heroCard: {
		marginTop: 10,
		backgroundColor: "#142452",
		borderRadius: 32,
		padding: 24,
		overflow: "hidden",
		shadowColor: "#000",
		shadowOpacity: 0.16,
		shadowRadius: 24,
		shadowOffset: { width: 0, height: 14 },
		marginBottom: 18,
	},
	heroGlow: {
		position: "absolute",
		top: -36,
		right: -36,
		width: 140,
		height: 140,
		borderRadius: 70,
		backgroundColor: "rgba(255, 209, 77, 0.16)",
	},
	heroGlowSecondary: {
		position: "absolute",
		top: 50,
		left: -40,
		width: 100,
		height: 100,
		borderRadius: 50,
		backgroundColor: "rgba(39, 168, 232, 0.14)",
	},
	heroHeader: {
		flexDirection: "row",
		alignItems: "flex-start",
		justifyContent: "space-between",
		marginBottom: 16,
	},
	welcome: {
		fontSize: 30,
		fontWeight: "800",
		color: "#fff",
	},
	subheading: {
		fontSize: 14,
		color: "#cbd7ff",
		marginTop: 8,
		lineHeight: 20,
	},
	subtitle: {
		fontSize: 15,
		color: "#b8c8ff",
		marginBottom: 20,
		lineHeight: 22,
	},
	heroBadge: {
		alignSelf: "flex-start",
		backgroundColor: "rgba(255, 255, 255, 0.12)",
		paddingVertical: 8,
		paddingHorizontal: 14,
		borderRadius: 999,
		marginBottom: 22,
	},
	heroBadgeText: {
		color: "#f7f7ff",
		fontSize: 12,
		fontWeight: "700",
	},
	statsRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		gap: 12,
	},
	statBubble: {
		flex: 1,
		backgroundColor: "rgba(255,255,255,0.12)",
		borderRadius: 22,
		paddingVertical: 18,
		paddingHorizontal: 16,
	},
	statLabel: {
		color: "#9bb6ff",
		fontSize: 12,
		marginBottom: 8,
	},
	statValue: {
		fontSize: 30,
		fontWeight: "800",
		color: "#fff",
	},
	quickRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		gap: 12,
		marginBottom: 20,
	},
	quickCard: {
		flex: 1,
		borderRadius: 22,
		padding: 18,
		shadowColor: "#000",
		shadowOpacity: 0.08,
		shadowRadius: 16,
		shadowOffset: { width: 0, height: 8 },
	},
	quickCardOrange: {
		backgroundColor: "#ff8a5d",
	},
	quickCardBlue: {
		backgroundColor: "#4d88ff",
	},
	quickTitleLight: {
		fontSize: 16,
		fontWeight: "800",
		color: "#fff",
		marginTop: 12,
		marginBottom: 8,
	},
	quickTextLight: {
		fontSize: 13,
		color: "rgba(255,255,255,0.92)",
		lineHeight: 20,
	},
	buttonRow: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-between",
		gap: 10,
		marginBottom: 18,
	},
	actionButton: {
		flex: 1,
		minWidth: 110,
		paddingVertical: 16,
		borderRadius: 18,
		backgroundColor: "#ff5a2a",
		alignItems: "center",
		justifyContent: "center",
	},
	disabledButton: {
		backgroundColor: "#9eabbf",
	},
	buttonText: {
		color: "#fff",
		fontSize: 14,
		fontWeight: "800",
	},
	summaryCard: {
		backgroundColor: "#fff",
		borderRadius: 24,
		padding: 20,
		shadowColor: "#000",
		shadowOpacity: 0.06,
		shadowRadius: 18,
		shadowOffset: { width: 0, height: 8 },
	},
	summaryTitle: {
		fontSize: 18,
		fontWeight: "800",
		color: "#142452",
		marginBottom: 10,
	},
	summaryText: {
		fontSize: 14,
		lineHeight: 20,
		color: "#546485",
		marginBottom: 16,
	},
	summaryPillRow: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 10,
	},
	summaryPill: {
		backgroundColor: "#f0f5ff",
		paddingVertical: 10,
		paddingHorizontal: 14,
		borderRadius: 16,
	},
	summaryPillText: {
		fontSize: 12,
		fontWeight: "700",
		color: "#4051b5",
	},
});
