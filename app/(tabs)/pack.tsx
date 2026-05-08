import {
	Poppins_400Regular,
	Poppins_600SemiBold,
	Poppins_700Bold,
	useFonts,
} from "@expo-google-fonts/poppins";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Image,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import Card from "../../components/Card";
import CardRevealSwiper from "../../components/CardRevealSwiper";
import { GameContext } from "../../context/GameContext";
import { packs } from "../../data/packs";
import { CardType, PackType } from "../../types/Card";
import { fetchCardsBySet } from "../../utils/api";
import {
	loadLastPulledPack,
	saveLastPulledPack,
} from "../../utils/packStorage";
import { openPack } from "../../utils/pullLogic";

type CardCache = Record<string, CardType[]>;

export default function Pack() {
	const { ancestors, spendAncestors, addAncestors, addCards } =
		useContext(GameContext);

	const scrollRef = useRef<ScrollView | null>(null);

	const [fontsLoaded] = useFonts({
		Poppins_400Regular,
		Poppins_600SemiBold,
		Poppins_700Bold,
	});

	const [selectedPack, setSelectedPack] = useState<PackType | null>(null);
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [lastPackId, setLastPackId] = useState<string | null>(null);
	const [pulledCards, setPulledCards] = useState<CardType[]>([]);
	const [cardCache, setCardCache] = useState<CardCache>({});
	const [loadingPacks, setLoadingPacks] = useState(true);
	const [openingPack, setOpeningPack] = useState(false);
	const [showReveal, setShowReveal] = useState(false);
	const [showResult, setShowResult] = useState(false);
	const [godPackChance, setGodPackChance] = useState(0.05);
	const [isGodPack, setIsGodPack] = useState(false);

	const displayPacks = useMemo(() => {
		if (!lastPackId) return packs;

		const lastPack = packs.find((pack) => pack.id === lastPackId);
		const otherPacks = packs.filter((pack) => pack.id !== lastPackId);

		return lastPack ? [lastPack, ...otherPacks] : packs;
	}, [lastPackId]);

	useEffect(() => {
		async function init() {
			try {
				const savedPackId = await loadLastPulledPack();
				const savedPack = packs.find((pack) => pack.id === savedPackId);
				const defaultPack = savedPack ?? packs[0];

				setLastPackId(savedPack?.id ?? null);
				setSelectedPack(defaultPack);

				const results = await Promise.all(
					packs.map(async (pack) => {
						const cards = await fetchCardsBySet(pack.setId, pack.isShinyPack);
						return [pack.id, cards] as const;
					}),
				);

				const nextCache: CardCache = {};

				results.forEach(([packId, cards]) => {
					nextCache[packId] = cards;
				});

				setCardCache(nextCache);
			} catch {
				Alert.alert("Error", "Failed to load Pokémon packs.");
			} finally {
				setLoadingPacks(false);
			}
		}

		init();
	}, []);

	useEffect(() => {
		if (!selectedPack && displayPacks.length > 0) {
			setSelectedPack(displayPacks[0]);
			setSelectedIndex(0);
		}
	}, [displayPacks, selectedPack]);

	useEffect(() => {
		if (showReveal || showResult) {
			setTimeout(() => {
				scrollRef.current?.scrollToEnd({ animated: true });
			}, 100);
		}
	}, [showReveal, showResult, pulledCards]);

	const handleSelectPackByIndex = (nextIndex: number) => {
		if (openingPack) return;

		const fixedIndex = (nextIndex + displayPacks.length) % displayPacks.length;

		setSelectedIndex(fixedIndex);
		setSelectedPack(displayPacks[fixedIndex]);
		setPulledCards([]);
		setShowReveal(false);
		setShowResult(false);
		setIsGodPack(false);
	};

	const handlePreviousPack = () => {
		handleSelectPackByIndex(selectedIndex - 1);
	};

	const handleNextPack = () => {
		handleSelectPackByIndex(selectedIndex + 1);
	};

	const calculateAncestorReward = (cards: CardType[]) => {
		return cards.reduce((total, card) => {
			if (card.rarity === "common" || card.rarity === "uncommon") {
				return total + 1;
			}

			if (card.rarity === "rare" || card.rarity === "ultraRare") {
				return total + 3;
			}

			if (
				card.rarity === "illustrationRare" ||
				card.rarity === "specialIllustrationRare" ||
				card.rarity === "hyperRare"
			) {
				return total + 5;
			}

			return total;
		}, 0);
	};

	const handleOpenPack = async () => {
		if (!selectedPack) {
			Alert.alert("Choose Pack", "Please choose a pack first.");
			return;
		}

		if (showReveal) {
			Alert.alert("Finish Reveal", "Please finish revealing all cards first.");
			return;
		}

		const cards = cardCache[selectedPack.id];

		if (!cards || cards.length === 0) {
			Alert.alert("No Cards", "Cards for this pack are not ready yet.");
			return;
		}

		const ok = spendAncestors(selectedPack.price);

		if (!ok) {
			Alert.alert(
				"Not Enough Ancestors",
				`You need ${selectedPack.price} Ancestors.`,
			);
			return;
		}

		setOpeningPack(true);
		setShowReveal(false);
		setShowResult(false);
		setPulledCards([]);
		setIsGodPack(false);

		const result = openPack(
			cards,
			godPackChance,
			selectedPack?.isShinyPack ?? false,
		);
		const rewardAncestors = calculateAncestorReward(result.cards);

		setPulledCards(result.cards);
		addCards(result.cards);
		addAncestors(rewardAncestors);
		setIsGodPack(result.isGodPack);
		setLastPackId(selectedPack.id);
		await saveLastPulledPack(selectedPack.id);

		if (result.isGodPack) {
			setGodPackChance(0.05);
		} else {
			setGodPackChance((prev) => Math.min(prev + 0.001, 1));
		}

		setOpeningPack(false);
		setShowReveal(true);
	};

	const handleRevealFinish = () => {
		setShowReveal(false);
		setShowResult(true);
	};

	const ancestorText = String(ancestors);
	const selectedCardsReady = selectedPack
		? !!cardCache[selectedPack.id]?.length
		: false;

	if (!fontsLoaded || loadingPacks) {
		return (
			<View style={styles.center}>
				<ActivityIndicator size="large" />
				<Text style={styles.loadingText}>Loading No Lag Packs...</Text>
			</View>
		);
	}

	return (
		<ScrollView ref={scrollRef} contentContainerStyle={styles.container}>
			<Text style={styles.title}>Pull Pokémon Pack</Text>

			<View style={styles.statusBox}>
				<Text style={styles.statusText}>Ancestors: {ancestorText}</Text>
				<Text style={styles.godPackChance}>
					God Pack Chance: {(godPackChance * 100).toFixed(1)}%
				</Text>
			</View>

			{selectedPack && (
				<View style={styles.packMenu}>
					<Text style={styles.menuTitle}>Select Pack</Text>

					{selectedPack.id === lastPackId && (
						<Text style={styles.lastPackText}>Last Pulled Pack</Text>
					)}

					<View style={styles.packNavigator}>
						<Pressable
							style={styles.navButton}
							onPress={handlePreviousPack}
							disabled={openingPack || showReveal}
						>
							<Text style={styles.navButtonText}>‹</Text>
						</Pressable>

						<View style={styles.currentPackCard}>
							<Image
								source={selectedPack.image}
								style={styles.bigPackImage}
								resizeMode="cover"
							/>

							<Text style={styles.packName}>{selectedPack.name}</Text>
							{selectedPack.isShinyPack && (
								<Text style={styles.shinyTag}>Shiny Pack</Text>
							)}
							<Text style={styles.packCounter}>
								Pack {selectedIndex + 1} of {displayPacks.length}
							</Text>

							<Text style={styles.packPrice}>
								{selectedCardsReady
									? `${selectedPack.price} Ancestors`
									: "Loading Cards..."}
							</Text>
						</View>

						<Pressable
							style={styles.navButton}
							onPress={handleNextPack}
							disabled={openingPack || showReveal}
						>
							<Text style={styles.navButtonText}>›</Text>
						</Pressable>
					</View>

					<View style={styles.dotRow}>
						{displayPacks.map((pack, index) => (
							<Pressable
								key={pack.id}
								style={[
									styles.dot,
									selectedIndex === index && styles.activeDot,
								]}
								onPress={() => handleSelectPackByIndex(index)}
								disabled={openingPack || showReveal}
							/>
						))}
					</View>

					<Pressable
						style={[
							styles.openButton,
							(openingPack || !selectedCardsReady || showReveal) &&
								styles.disabledButton,
						]}
						onPress={handleOpenPack}
						disabled={openingPack || !selectedCardsReady || showReveal}
					>
						{openingPack ? (
							<ActivityIndicator color="#fff" />
						) : (
							<Text style={styles.openButtonText}>
								{selectedCardsReady
									? `Open ${selectedPack.name}`
									: "Loading Pack..."}
							</Text>
						)}
					</Pressable>
				</View>
			)}

			{showReveal && pulledCards.length > 0 && (
				<CardRevealSwiper
					cards={pulledCards}
					isGodPack={isGodPack}
					onFinish={handleRevealFinish}
				/>
			)}

			{showResult && (
				<View style={styles.resultSection}>
					<Text style={[styles.resultTitle, isGodPack && styles.godPackTitle]}>
						{isGodPack ? "GOD PACK!" : "Pull Result"}
					</Text>

					<View style={styles.cardGrid}>
						{pulledCards.map((card, index) => (
							<Card key={`${card.id}-${index}`} card={card} />
						))}
					</View>

					<Text style={styles.savedText}>Saved into Pokédex</Text>

					<Pressable
						style={[
							styles.pullAgainButton,
							openingPack && styles.disabledButton,
						]}
						onPress={handleOpenPack}
						disabled={openingPack}
					>
						{openingPack ? (
							<ActivityIndicator color="#fff" />
						) : (
							<Text style={styles.pullAgainButtonText}>Pull Again</Text>
						)}
					</Pressable>
				</View>
			)}
		</ScrollView>
	);
}

const FONT = {
	regular: "Poppins_400Regular",
	semiBold: "Poppins_600SemiBold",
	bold: "Poppins_700Bold",
};

const styles = StyleSheet.create({
	container: {
		padding: 20,
		paddingTop: 45,
		paddingBottom: 50,
		alignItems: "center",
		backgroundColor: "#fff",
	},
	center: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#fff",
	},
	loadingText: {
		marginTop: 10,
		fontSize: 16,
		fontFamily: FONT.regular,
	},
	title: {
		fontSize: 28,
		fontFamily: FONT.bold,
		marginBottom: 12,
	},
	statusBox: {
		width: "100%",
		backgroundColor: "#f7f7f7",
		borderRadius: 18,
		paddingVertical: 12,
		paddingHorizontal: 16,
		marginBottom: 18,
		alignItems: "center",
	},
	statusText: {
		fontSize: 17,
		fontFamily: FONT.semiBold,
		marginBottom: 4,
	},
	godPackChance: {
		fontSize: 15,
		color: "#b8860b",
		fontFamily: FONT.bold,
	},
	packMenu: {
		width: "100%",
		alignItems: "center",
		backgroundColor: "#f7f7f7",
		borderRadius: 24,
		padding: 18,
	},
	menuTitle: {
		fontSize: 20,
		fontFamily: FONT.bold,
		marginBottom: 6,
	},
	lastPackText: {
		backgroundColor: "#e3350d",
		color: "#fff",
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 999,
		fontSize: 12,
		fontFamily: FONT.bold,
		marginBottom: 12,
	},
	packNavigator: {
		width: "100%",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	navButton: {
		width: 44,
		height: 44,
		borderRadius: 22,
		backgroundColor: "#3761a8",
		alignItems: "center",
		justifyContent: "center",
	},
	navButtonText: {
		color: "#fff",
		fontSize: 34,
		fontFamily: FONT.bold,
		marginTop: -4,
	},
	currentPackCard: {
		width: "68%",
		alignItems: "center",
		backgroundColor: "#fff",
		borderRadius: 22,
		padding: 16,
		borderWidth: 2,
		borderColor: "#ffcc00",
	},
	bigPackImage: {
		width: 170,
		height: 238,
		borderRadius: 16,
		marginBottom: 14,
	},
	packName: {
		fontSize: 18,
		fontFamily: FONT.bold,
		textAlign: "center",
	},
	shinyTag: {
		marginTop: 6,
		alignSelf: "center",
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 999,
		backgroundColor: "#ffd24d",
		color: "#663f00",
		fontSize: 12,
		fontFamily: FONT.semiBold,
	},
	packCounter: {
		marginTop: 6,
		fontSize: 13,
		color: "#666",
		fontFamily: FONT.regular,
	},
	packPrice: {
		marginTop: 6,
		fontSize: 14,
		color: "#555",
		fontFamily: FONT.semiBold,
	},
	dotRow: {
		flexDirection: "row",
		gap: 8,
		marginTop: 16,
		marginBottom: 18,
	},
	dot: {
		width: 9,
		height: 9,
		borderRadius: 99,
		backgroundColor: "#cfcfcf",
	},
	activeDot: {
		width: 24,
		backgroundColor: "#3761a8",
	},
	openButton: {
		minWidth: 230,
		backgroundColor: "#e3350d",
		paddingVertical: 14,
		paddingHorizontal: 28,
		borderRadius: 999,
		alignItems: "center",
	},
	disabledButton: {
		opacity: 0.6,
	},
	openButtonText: {
		color: "white",
		fontSize: 16,
		fontFamily: FONT.bold,
	},
	resultSection: {
		marginTop: 30,
		width: "100%",
		alignItems: "center",
	},
	resultTitle: {
		fontSize: 24,
		fontFamily: FONT.bold,
		marginBottom: 16,
	},
	godPackTitle: {
		color: "#b8860b",
		fontSize: 30,
	},
	cardGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "center",
	},
	savedText: {
		marginTop: 16,
		fontSize: 16,
		color: "green",
		fontFamily: FONT.bold,
	},
	pullAgainButton: {
		marginTop: 18,
		minWidth: 210,
		backgroundColor: "#3761a8",
		paddingVertical: 14,
		paddingHorizontal: 28,
		borderRadius: 999,
		alignItems: "center",
	},
	pullAgainButtonText: {
		color: "white",
		fontSize: 16,
		fontFamily: FONT.bold,
	},
});
