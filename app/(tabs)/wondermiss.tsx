import {
	Poppins_400Regular,
	Poppins_600SemiBold,
	Poppins_700Bold,
	useFonts,
} from "@expo-google-fonts/poppins";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Image,
	Pressable,
	SafeAreaView,
	ScrollView,
	StyleSheet,
	Text,
	useWindowDimensions,
	View,
} from "react-native";
import LoadingScreen from "../../components/LoadingScreen";
import { GameContext } from "../../context/GameContext";
import { packs } from "../../data/packs";
import { CardType } from "../../types/Card";
import { fetchCardsBySet } from "../../utils/api";
import { generateWherePickCards } from "../../utils/wherePickLogic";
import { saveWherePickSession } from "../../utils/wherePickStorage";

export default function WonderMiss() {
	const router = useRouter();
	const { ancestors, spendAncestors } = useContext(GameContext);
	const [fontsLoaded] = useFonts({
		Poppins_400Regular,
		Poppins_600SemiBold,
		Poppins_700Bold,
	});
	const { width } = useWindowDimensions();
	const isCompact = width < 380;

	const [allCards, setAllCards] = useState<CardType[]>([]);
	const [wonderMissCards, setWonderMissCards] = useState<CardType[]>([]);
	const [isHighRareSession, setIsHighRareSession] = useState(false);
	const [loading, setLoading] = useState(true);
	const [starting, setStarting] = useState(false);

	useEffect(() => {
		loadCards();
	}, []);

	const loadCards = async () => {
		try {
			const results = await Promise.all(
				packs.map((pack) => fetchCardsBySet(pack.setId)),
			);
			const mergedCards = results.flat();
			const generated = generateWherePickCards(mergedCards);

			setAllCards(mergedCards);
			setWonderMissCards(generated.cards);
			setIsHighRareSession(generated.isHighRareSession);
		} catch {
			Alert.alert("Error", "Failed to load WonderMiss cards.");
		} finally {
			setLoading(false);
		}
	};

	const refreshSelection = () => {
		if (allCards.length === 0) return;
		const generated = generateWherePickCards(allCards);
		setWonderMissCards(generated.cards);
		setIsHighRareSession(generated.isHighRareSession);
	};

	const startWonderMiss = async () => {
		if (wonderMissCards.length !== 6) {
			Alert.alert("Error", "WonderMiss cards are not ready.");
			return;
		}

		const ok = spendAncestors(10);
		if (!ok) {
			Alert.alert(
				"Not Enough Ancestors",
				"You need 10 Ancestors for WonderMiss.",
			);
			return;
		}

		setStarting(true);
		await saveWherePickSession({
			cards: wonderMissCards,
			isHighRareSession,
		});
		setStarting(false);
		router.push("/wondermiss-play");
	};

	if (!fontsLoaded || loading) {
		return (
			<LoadingScreen
				title="WonderMiss"
				subtitle={!fontsLoaded ? "Loading fonts..." : "Loading cards..."}
			/>
		);
	}

	return (
		<SafeAreaView style={styles.safeArea}>
			<ScrollView
				contentContainerStyle={styles.container}
				showsVerticalScrollIndicator={false}
			>
				<View
					style={[
						styles.headerCard,
						isCompact && {
							flexDirection: "column",
							alignItems: "flex-start",
						},
					]}
				>
					<View>
						<Text style={styles.title}>WonderMiss</Text>
						<Text style={[styles.subtitle, isCompact && { maxWidth: "100%" }]}>
							A curated 6-card hunt built for fast reveals.
						</Text>
					</View>
					<View
						style={[
							styles.statusPill,
							isCompact && { alignSelf: "stretch", marginTop: 12 },
						]}
					>
						<Ionicons
							name="sparkles"
							size={16}
							color="#2563eb"
							style={styles.statusIcon}
						/>
						<View>
							<Text style={styles.statusText}>Ancestors {ancestors}</Text>
							<Text style={styles.statusSubtext}>Cost 10</Text>
						</View>
					</View>
				</View>

				<View style={styles.infoCard}>
					<Text style={styles.infoTitle}>Selection preview</Text>
					<Text style={styles.infoText}>
						{isHighRareSession
							? "Special high-rare session is active."
							: "Standard selection is active."}
					</Text>
					<View style={styles.infoTags}>
						<View style={styles.infoTag}>
							<Text style={styles.infoTagText}>
								{wonderMissCards.length} cards ready
							</Text>
						</View>
						<View style={styles.infoTag}>
							<Text style={styles.infoTagText}>Swipe-free reveal flow</Text>
						</View>
					</View>
				</View>

				<View style={styles.cardGrid}>
					{wonderMissCards.map((card, index) => (
						<View
							key={`${card.id}-${index}`}
							style={[styles.card, isCompact && { width: "48%" }]}
						>
							<Image
								source={{ uri: card.image }}
								style={styles.cardImage}
								resizeMode="cover"
							/>
							<View style={styles.cardDetails}>
								<Text style={styles.cardName} numberOfLines={1}>
									{card.name}
								</Text>
								<Text style={styles.rarity}>{formatRarity(card.rarity)}</Text>
							</View>
						</View>
					))}
				</View>

				<View
					style={[styles.buttonRow, isCompact && { flexDirection: "column" }]}
				>
					<Pressable
						style={[
							styles.actionButton,
							styles.startButton,
							isCompact && { alignSelf: "stretch" },
						]}
						onPress={startWonderMiss}
						disabled={starting}
					>
						{starting ? (
							<ActivityIndicator color="#ffffff" />
						) : (
							<Text style={styles.buttonText}>Start session</Text>
						)}
					</Pressable>

					<Pressable
						style={[
							styles.actionButton,
							styles.refreshButton,
							isCompact && { alignSelf: "stretch" },
						]}
						onPress={refreshSelection}
						disabled={starting}
					>
						<Text style={styles.buttonText}>Refresh</Text>
					</Pressable>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

function formatRarity(rarity: CardType["rarity"]) {
	const labels: Record<CardType["rarity"], string> = {
		common: "Common",
		uncommon: "Uncommon",
		rare: "Rare",
		ultraRare: "Ultra Rare",
		illustrationRare: "Illustration Rare",
		specialIllustrationRare: "Special Illustration Rare",
		hyperRare: "Hyper Rare",
	};

	return labels[rarity];
}

const FONT = {
	regular: "Poppins_400Regular",
	semiBold: "Poppins_600SemiBold",
	bold: "Poppins_700Bold",
};

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: "#f3f6fb",
	},
	center: {
		flex: 1,
		backgroundColor: "#f3f6fb",
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 22,
	},
	container: {
		paddingHorizontal: 18,
		paddingTop: 28,
		paddingBottom: 30,
	},
	headerCard: {
		backgroundColor: "#ffffff",
		borderRadius: 28,
		padding: 20,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		shadowColor: "#0f172a",
		shadowOpacity: 0.08,
		shadowRadius: 16,
		shadowOffset: { width: 0, height: 10 },
		elevation: 5,
	},
	title: {
		fontSize: 30,
		fontFamily: FONT.bold,
		color: "#0f172a",
	},
	subtitle: {
		marginTop: 8,
		fontSize: 14,
		color: "#475569",
		fontFamily: FONT.regular,
		maxWidth: 250,
	},
	statusPill: {
		backgroundColor: "#eff6ff",
		borderRadius: 20,
		paddingVertical: 12,
		paddingHorizontal: 16,
		alignItems: "center",
		flexDirection: "row",
	},
	statusIcon: {
		marginRight: 8,
	},
	statusText: {
		fontSize: 15,
		fontFamily: FONT.bold,
		color: "#0f172a",
	},
	statusSubtext: {
		marginTop: 2,
		fontSize: 12,
		color: "#2563eb",
		fontFamily: FONT.semiBold,
	},
	infoCard: {
		marginTop: 16,
		backgroundColor: "#0f172a",
		borderRadius: 24,
		padding: 18,
	},
	infoTitle: {
		fontSize: 18,
		fontFamily: FONT.bold,
		color: "#ffffff",
	},
	infoText: {
		marginTop: 8,
		fontSize: 14,
		lineHeight: 22,
		color: "#dbeafe",
		fontFamily: FONT.regular,
	},
	infoTags: {
		flexDirection: "row",
		gap: 10,
		marginTop: 14,
		flexWrap: "wrap",
	},
	infoTag: {
		backgroundColor: "rgba(255,255,255,0.09)",
		borderRadius: 999,
		paddingHorizontal: 12,
		paddingVertical: 8,
	},
	infoTagText: {
		fontSize: 12,
		color: "#ffffff",
		fontFamily: FONT.semiBold,
	},
	cardGrid: {
		marginTop: 18,
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-between",
	},
	card: {
		width: "31.5%",
		backgroundColor: "#ffffff",
		borderRadius: 22,
		padding: 8,
		marginBottom: 12,
		shadowColor: "#0f172a",
		shadowOpacity: 0.08,
		shadowRadius: 14,
		shadowOffset: { width: 0, height: 10 },
		elevation: 5,
	},
	cardImage: {
		width: "100%",
		aspectRatio: 0.72,
		borderRadius: 16,
	},
	cardDetails: {
		paddingTop: 8,
		alignItems: "center",
	},
	cardName: {
		fontSize: 12,
		fontFamily: FONT.semiBold,
		color: "#0f172a",
		textAlign: "center",
	},
	rarity: {
		marginTop: 4,
		fontSize: 11,
		color: "#475569",
		fontFamily: FONT.regular,
	},
	buttonRow: {
		marginTop: 18,
		flexDirection: "row",
		gap: 12,
	},
	actionButton: {
		flex: 1,
		paddingVertical: 14,
		borderRadius: 999,
		alignItems: "center",
		justifyContent: "center",
	},
	startButton: {
		backgroundColor: "#2563eb",
	},
	refreshButton: {
		backgroundColor: "#0f172a",
	},
	buttonText: {
		color: "#ffffff",
		fontSize: 15,
		fontFamily: FONT.bold,
	},
});
