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
	PanResponder,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	useWindowDimensions,
	View,
} from "react-native";
import Card from "../../components/Card";
import CardRevealSwiper from "../../components/CardRevealSwiper";
import LoadingScreen from "../../components/LoadingScreen";
import { GameContext } from "../../context/GameContext";
import { packs } from "../../data/packs";
import { CardType, PackType } from "../../types/Card";
import { fetchCardsBySet } from "../../utils/api";
import {
	loadGodModeEnabled,
	loadGodPackPullCount,
	loadLastPulledPack,
	saveGodModeEnabled,
	saveGodPackPullCount,
	saveLastPulledPack,
} from "../../utils/packStorage";
import { openPack } from "../../utils/pullLogic";

type CardCache = Record<string, CardType[]>;

const GOD_PACK_BASE_CHANCE = 0.05;
const GOD_PACK_STEP = 0.05;
const GOD_PACK_GUARANTEE_PULL = 50;

function getGodPackChanceFromPulls(pullCount: number) {
	if (pullCount >= GOD_PACK_GUARANTEE_PULL - 1) {
		return 1;
	}

	const stages = Math.floor(pullCount / 10);
	return Math.min(GOD_PACK_BASE_CHANCE + stages * GOD_PACK_STEP, 1);
}

function getPackOrdinalLabel(position: number) {
	const suffix =
		position % 10 === 1 && position % 100 !== 11
			? "st"
			: position % 10 === 2 && position % 100 !== 12
				? "nd"
				: position % 10 === 3 && position % 100 !== 13
					? "rd"
					: "th";

	return `${position}${suffix} pack`;
}

export default function Pack() {
	const { ancestors, spendAncestors, addAncestors, addCards } =
		useContext(GameContext);

	const scrollRef = useRef<ScrollView | null>(null);

	const [fontsLoaded] = useFonts({
		Poppins_400Regular,
		Poppins_600SemiBold,
		Poppins_700Bold,
	});
	const { width } = useWindowDimensions();
	const isCompact = width < 380;

	const [selectedPack, setSelectedPack] = useState<PackType | null>(null);
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [lastPackId, setLastPackId] = useState<string | null>(null);
	const [pulledCards, setPulledCards] = useState<CardType[]>([]);
	const [savedCards, setSavedCards] = useState<CardType[]>([]);
	const [cardCache, setCardCache] = useState<CardCache>({});
	const [loadingPacks, setLoadingPacks] = useState(true);
	const [openingPack, setOpeningPack] = useState(false);
	const [showReveal, setShowReveal] = useState(false);
	const [showResult, setShowResult] = useState(false);
	const [queuedPackResults, setQueuedPackResults] = useState<
		Array<ReturnType<typeof openPack>>
	>([]);
	const [currentRevealIndex, setCurrentRevealIndex] = useState(0);
	const [godPackPullCount, setGodPackPullCount] = useState(0);
	const [hasLoadedGodPackPullCount, setHasLoadedGodPackPullCount] =
		useState(false);
	const [godModeEnabled, setGodModeEnabled] = useState(false);
	const [hasLoadedGodMode, setHasLoadedGodMode] = useState(false);
	const [openMode, setOpenMode] = useState<1 | 5>(1);
	const [isGodPack, setIsGodPack] = useState(false);
	const [currentRevealIsGodPack, setCurrentRevealIsGodPack] = useState(false);

	useEffect(() => {
		let active = true;

		void loadGodPackPullCount().then((savedPullCount) => {
			if (active) {
				setGodPackPullCount(savedPullCount);
				setHasLoadedGodPackPullCount(true);
			}
		});

		return () => {
			active = false;
		};
	}, []);

	useEffect(() => {
		if (!hasLoadedGodPackPullCount) {
			return;
		}

		void saveGodPackPullCount(godPackPullCount);
	}, [godPackPullCount, hasLoadedGodPackPullCount]);

	useEffect(() => {
		let active = true;

		void loadGodModeEnabled().then((enabled) => {
			if (active) {
				setGodModeEnabled(enabled);
				setHasLoadedGodMode(true);
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

	const godPackChance = getGodPackChanceFromPulls(godPackPullCount);
	const effectiveGodPackChance = godModeEnabled ? 0.5 : godPackChance;

	const displayPacks = useMemo(() => {
		if (!lastPackId) return packs;

		const lastPack = packs.find((pack) => pack.id === lastPackId);
		const otherPacks = packs.filter((pack) => pack.id !== lastPackId);

		return lastPack ? [lastPack, ...otherPacks] : packs;
	}, [lastPackId]);

	const loadPackCards = async (packId: string) => {
		const pack = packs.find((item) => item.id === packId);

		if (!pack) {
			return;
		}

		const cards = await fetchCardsBySet(pack.setId);

		setCardCache((prev) => ({
			...prev,
			[packId]: cards,
		}));
	};

	useEffect(() => {
		let active = true;

		async function init() {
			try {
				const savedPackId = await loadLastPulledPack();
				const savedPack = packs.find((pack) => pack.id === savedPackId);
				const defaultPack = savedPack ?? packs[0];

				setLastPackId(savedPack?.id ?? null);
				setSelectedPack(defaultPack);
				setSelectedIndex(0);

				if (active) {
					await loadPackCards(defaultPack.id);
				}
			} catch {
				if (active) {
					Alert.alert("Error", "Failed to load Pokémon packs.");
				}
			} finally {
				if (active) {
					setLoadingPacks(false);
				}
			}
		}

		void init();

		return () => {
			active = false;
		};
	}, []);

	useEffect(() => {
		if (!selectedPack) {
			return;
		}

		if (cardCache[selectedPack.id]) {
			setLoadingPacks(false);
			return;
		}

		let active = true;
		setLoadingPacks(true);

		void loadPackCards(selectedPack.id)
			.then(() => {
				if (active) {
					setLoadingPacks(false);
				}
			})
			.catch(() => {
				if (active) {
					setLoadingPacks(false);
				}
			});

		return () => {
			active = false;
		};
	}, [selectedPack, cardCache]);

	useEffect(() => {
		if (loadingPacks) {
			return;
		}

		const missingPacks = packs.filter((pack) => !cardCache[pack.id]);

		if (missingPacks.length === 0) {
			return;
		}

		void Promise.all(
			missingPacks.map(async (pack) => {
				try {
					await loadPackCards(pack.id);
				} catch {
					// Ignore background prefetch failures.
				}
			}),
		);
	}, [loadingPacks, cardCache]);

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
		setSavedCards([]);
		setQueuedPackResults([]);
		setCurrentRevealIndex(0);
		setShowReveal(false);
		setShowResult(false);
		setIsGodPack(false);
		setCurrentRevealIsGodPack(false);
	};

	const handlePreviousPack = () => {
		handleSelectPackByIndex(selectedIndex - 1);
	};

	const handleNextPack = () => {
		handleSelectPackByIndex(selectedIndex + 1);
	};

	const packPanResponder = useRef(
		PanResponder.create({
			onMoveShouldSetPanResponder: (_, gesture) => {
				return (
					Math.abs(gesture.dx) > Math.abs(gesture.dy) &&
					Math.abs(gesture.dx) > 12
				);
			},
			onPanResponderRelease: (_, gesture) => {
				if (Math.abs(gesture.dx) < 70) {
					return;
				}

				if (gesture.dx < 0) {
					handleNextPack();
					return;
				}

				handlePreviousPack();
			},
		}),
	).current;

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

		const totalCost = selectedPack.price * openMode;
		const ok = spendAncestors(totalCost);

		if (!ok) {
			Alert.alert("Not Enough Ancestors", `You need ${totalCost} Ancestors.`);
			return;
		}

		setOpeningPack(true);
		setShowReveal(false);
		setShowResult(false);
		setPulledCards([]);
		setSavedCards([]);
		setQueuedPackResults([]);
		setCurrentRevealIndex(0);
		setIsGodPack(false);
		setCurrentRevealIsGodPack(false);

		const batchResults = [] as Array<ReturnType<typeof openPack>>;
		let nextPullCount = godPackPullCount;
		let nextChance = getGodPackChanceFromPulls(nextPullCount);

		for (let index = 0; index < openMode; index += 1) {
			const isGuaranteedPull =
				!godModeEnabled && nextPullCount >= GOD_PACK_GUARANTEE_PULL - 1;
			const currentChance = godModeEnabled
				? 0.5
				: isGuaranteedPull
					? 1
					: nextChance;
			const result = openPack(cards, currentChance);

			batchResults.push(result);

			if (!godModeEnabled) {
				nextPullCount = result.isGodPack ? 0 : nextPullCount + 1;
				nextChance = getGodPackChanceFromPulls(nextPullCount);
			}
		}

		const flattenedCards = batchResults.flatMap((result) => result.cards);
		const rewardAncestors = batchResults.reduce(
			(sum, result) => sum + calculateAncestorReward(result.cards),
			0,
		);
		const hasGodPack = batchResults.some((result) => result.isGodPack);

		setQueuedPackResults(batchResults);
		setSavedCards(flattenedCards);
		addCards(flattenedCards);
		addAncestors(rewardAncestors);
		setIsGodPack(hasGodPack);
		setCurrentRevealIsGodPack(batchResults[0]?.isGodPack ?? false);
		setLastPackId(selectedPack.id);
		await saveLastPulledPack(selectedPack.id);

		if (!godModeEnabled) {
			setGodPackPullCount(nextPullCount);
		}

		setOpeningPack(false);
		setCurrentRevealIndex(0);
		setPulledCards(batchResults[0].cards);
		setShowReveal(true);
	};

	const handleRevealFinish = () => {
		const nextIndex = currentRevealIndex + 1;

		if (nextIndex < queuedPackResults.length) {
			const nextResult = queuedPackResults[nextIndex];
			setCurrentRevealIndex(nextIndex);
			setPulledCards(nextResult.cards);
			setCurrentRevealIsGodPack(nextResult.isGodPack);
			return;
		}

		setCurrentRevealIndex(0);
		setQueuedPackResults([]);
		setCurrentRevealIsGodPack(false);
		setShowReveal(false);
		setShowResult(true);
		setTimeout(() => {
			scrollRef.current?.scrollToEnd({ animated: true });
		}, 150);
	};

	const ancestorText = String(ancestors);
	const selectedCardsReady = selectedPack
		? !!cardCache[selectedPack.id]?.length
		: false;
	const totalPackCost = selectedPack ? selectedPack.price * openMode : 0;
	const chanceLabel = godModeEnabled
		? "50.0% (GOD Mode)"
		: `${(effectiveGodPackChance * 100).toFixed(1)}%`;
	const currentRevealLabel = getPackOrdinalLabel(currentRevealIndex + 1);

	const handleSkipReveal = () => {
		setCurrentRevealIndex(0);
		setQueuedPackResults([]);
		setCurrentRevealIsGodPack(false);
		setShowReveal(false);
		setShowResult(true);
		setTimeout(() => {
			scrollRef.current?.scrollToEnd({ animated: true });
		}, 150);
	};

	if (!fontsLoaded || loadingPacks) {
		return (
			<LoadingScreen
				title="Pull Pokémon Pack"
				subtitle={!fontsLoaded ? "Loading fonts..." : "Loading cards..."}
			/>
		);
	}

	return (
		<ScrollView
			ref={scrollRef}
			contentContainerStyle={styles.container}
			scrollEnabled={!showReveal}
		>
			<Text style={[styles.title, isCompact && styles.compactTitle]}>
				Pull Pokémon Pack
			</Text>

			<View style={[styles.statusBox, isCompact && styles.compactStatusBox]}>
				<Text style={styles.statusText}>Ancestors: {ancestorText}</Text>
				<Text style={styles.godPackChance}>God Pack Chance: {chanceLabel}</Text>
				<Text style={styles.counterText}>
					Pulls since godpack: {godPackPullCount} / 50
				</Text>
			</View>

			{selectedPack && (
				<View style={styles.packMenu}>
					<Text style={styles.menuTitle}>Select Pack</Text>

					{selectedPack.id === lastPackId && (
						<Text style={styles.lastPackText}>Last Pulled Pack</Text>
					)}

					<View
						style={[
							styles.packNavigator,
							isCompact && styles.packNavigatorCompact,
						]}
					>
						{isCompact ? (
							<View style={styles.packControlsRow}>
								<Pressable
									style={styles.navButton}
									onPress={handlePreviousPack}
									disabled={openingPack || showReveal}
								>
									<Text style={styles.navButtonText}>‹</Text>
								</Pressable>

								<Pressable
									style={styles.navButton}
									onPress={handleNextPack}
									disabled={openingPack || showReveal}
								>
									<Text style={styles.navButtonText}>›</Text>
								</Pressable>
							</View>
						) : (
							<Pressable
								style={styles.navButton}
								onPress={handlePreviousPack}
								disabled={openingPack || showReveal}
							>
								<Text style={styles.navButtonText}>‹</Text>
							</Pressable>
						)}

						<View
							style={[
								styles.currentPackCard,
								isCompact && styles.currentPackCardCompact,
							]}
							{...packPanResponder.panHandlers}
						>
							<Image
								source={selectedPack.image}
								style={[
									styles.bigPackImage,
									isCompact && styles.bigPackImageCompact,
								]}
								resizeMode="cover"
							/>

							<Text style={styles.packName}>{selectedPack.name}</Text>
							<Text style={styles.packCounter}>
								Pack {selectedIndex + 1} of {displayPacks.length}
							</Text>

							<Text style={styles.packPrice}>
								{selectedCardsReady
									? `${selectedPack.price} Ancestors`
									: "Loading Cards..."}
							</Text>
						</View>

						{!isCompact && (
							<Pressable
								style={styles.navButton}
								onPress={handleNextPack}
								disabled={openingPack || showReveal}
							>
								<Text style={styles.navButtonText}>›</Text>
							</Pressable>
						)}
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

					<View style={styles.openModeRow}>
						<Pressable
							style={[
								styles.openModeButton,
								openMode === 1 && styles.openModeButtonActive,
							]}
							onPress={() => setOpenMode(1)}
							disabled={openingPack}
						>
							<Text
								style={
									openMode === 1
										? styles.openModeButtonTextActive
										: styles.openModeButtonText
								}
							>
								1 Pack
							</Text>
						</Pressable>

						<Pressable
							style={[
								styles.openModeButton,
								openMode === 5 && styles.openModeButtonActive,
							]}
							onPress={() => setOpenMode(5)}
							disabled={openingPack}
						>
							<Text
								style={
									openMode === 5
										? styles.openModeButtonTextActive
										: styles.openModeButtonText
								}
							>
								5 Packs
							</Text>
						</Pressable>
					</View>

					<Pressable
						style={[
							styles.openButton,
							isCompact && styles.fullWidthButton,
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
									? `Open ${openMode === 1 ? `${openMode} Pack` : `${openMode} Packs`}`
									: "Loading Pack..."}
							</Text>
						)}
					</Pressable>
				</View>
			)}

			{showReveal && pulledCards.length > 0 && (
				<CardRevealSwiper
					cards={pulledCards}
					isGodPack={currentRevealIsGodPack}
					packLabel={currentRevealLabel}
					onFinish={handleRevealFinish}
					onSkip={handleSkipReveal}
				/>
			)}

			{showResult && (
				<View style={styles.resultSection}>
					<Text style={[styles.resultTitle, isGodPack && styles.godPackTitle]}>
						{isGodPack ? "GOD PACK!" : "Pull Result"}
					</Text>

					<View style={styles.cardGrid}>
						{savedCards.map((card, index) => (
							<Card key={`${card.id}-${index}`} card={card} />
						))}
					</View>

					<Text style={styles.savedText}>Saved into Pokédex</Text>

					<Pressable
						style={[
							styles.pullAgainButton,
							isCompact && styles.fullWidthButton,
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

const ACCENT_FONT_FAMILY = Platform.select({
	android: "sans-serif",
	ios: "System",
	default: "sans-serif",
});

const styles = StyleSheet.create({
	container: {
		padding: 20,
		paddingTop: 44,
		paddingBottom: 52,
		alignItems: "center",
		backgroundColor: "#f3f6fb",
	},
	title: {
		fontSize: 30,
		fontFamily: ACCENT_FONT_FAMILY,
		fontWeight: "700",
		marginBottom: 14,
		color: "#0f172a",
		letterSpacing: 0.3,
	},
	compactTitle: {
		fontSize: 24,
	},
	statusBox: {
		width: "100%",
		backgroundColor: "#ffffff",
		borderRadius: 24,
		paddingVertical: 16,
		paddingHorizontal: 18,
		marginBottom: 18,
		alignItems: "center",
		shadowColor: "#0f172a",
		shadowOpacity: 0.08,
		shadowRadius: 10,
		shadowOffset: { width: 0, height: 8 },
		elevation: 4,
		borderWidth: 1,
		borderColor: "rgba(59,130,246,0.1)",
	},
	compactStatusBox: {
		alignItems: "flex-start",
	},
	statusText: {
		fontSize: 18,
		fontFamily: FONT.semiBold,
		marginBottom: 6,
		color: "#111827",
	},
	godPackChance: {
		fontSize: 15,
		color: "#b8860b",
		fontFamily: FONT.bold,
	},
	counterText: {
		fontSize: 15,
		color: "#0f172a",
		fontFamily: FONT.semiBold,
		marginTop: 4,
	},
	packMenu: {
		width: "100%",
		alignItems: "center",
		backgroundColor: "#ffffff",
		borderRadius: 28,
		padding: 18,
		shadowColor: "#0f172a",
		shadowOpacity: 0.1,
		shadowRadius: 16,
		shadowOffset: { width: 0, height: 12 },
		elevation: 8,
		borderWidth: 1,
		borderColor: "rgba(59,130,246,0.08)",
	},
	menuTitle: {
		fontSize: 20,
		fontFamily: FONT.bold,
		marginBottom: 6,
		color: "#0f172a",
	},
	lastPackText: {
		backgroundColor: "#0f73ff",
		color: "#fff",
		paddingHorizontal: 12,
		paddingVertical: 5,
		borderRadius: 999,
		fontSize: 12,
		fontFamily: FONT.bold,
		marginBottom: 12,
		letterSpacing: 0.3,
	},
	packNavigator: {
		width: "100%",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	packNavigatorCompact: {
		flexDirection: "column",
		gap: 12,
	},
	packControlsRow: {
		width: "100%",
		flexDirection: "row",
		justifyContent: "space-between",
	},
	navButton: {
		width: 48,
		height: 48,
		borderRadius: 24,
		backgroundColor: "#0f73ff",
		alignItems: "center",
		justifyContent: "center",
		shadowColor: "#0f73ff",
		shadowOpacity: 0.22,
		shadowRadius: 12,
		shadowOffset: { width: 0, height: 8 },
		elevation: 6,
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
		backgroundColor: "#ffffff",
		borderRadius: 24,
		padding: 16,
		borderWidth: 1,
		borderColor: "rgba(245,158,11,0.4)",
		shadowColor: "#0f172a",
		shadowOpacity: 0.12,
		shadowRadius: 14,
		shadowOffset: { width: 0, height: 10 },
		elevation: 8,
	},
	currentPackCardCompact: {
		width: "100%",
	},
	bigPackImage: {
		width: 170,
		height: 238,
		borderRadius: 20,
		marginBottom: 14,
		backgroundColor: "#eef3ff",
	},
	bigPackImageCompact: {
		width: "100%",
		maxWidth: 220,
		aspectRatio: 170 / 238,
		height: undefined,
		alignSelf: "center",
	},
	packName: {
		fontSize: 18,
		fontFamily: FONT.bold,
		textAlign: "center",
		color: "#111827",
	},
	packCounter: {
		marginTop: 6,
		fontSize: 13,
		color: "#64748b",
		fontFamily: FONT.regular,
	},
	packPrice: {
		marginTop: 6,
		fontSize: 14,
		color: "#0f172a",
		fontFamily: FONT.semiBold,
	},
	dotRow: {
		flexDirection: "row",
		gap: 8,
		marginTop: 18,
		marginBottom: 18,
	},
	dot: {
		width: 10,
		height: 10,
		borderRadius: 99,
		backgroundColor: "#cbd5e1",
	},
	activeDot: {
		width: 26,
		backgroundColor: "#0f73ff",
	},
	openModeRow: {
		width: "100%",
		flexDirection: "row",
		justifyContent: "center",
		gap: 12,
		marginBottom: 16,
	},
	openModeButton: {
		flex: 1,
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderRadius: 999,
		backgroundColor: "#e2e8f0",
		alignItems: "center",
	},
	openModeButtonActive: {
		backgroundColor: "#0f73ff",
	},
	openModeButtonText: {
		fontSize: 14,
		fontFamily: FONT.bold,
		color: "#0f172a",
	},
	openModeButtonTextActive: {
		fontSize: 14,
		fontFamily: FONT.bold,
		color: "#ffffff",
	},
	openButton: {
		minWidth: 240,
		backgroundColor: "#0f73ff",
		paddingVertical: 15,
		paddingHorizontal: 30,
		borderRadius: 999,
		alignItems: "center",
		shadowColor: "#0f73ff",
		shadowOpacity: 0.24,
		shadowRadius: 14,
		shadowOffset: { width: 0, height: 8 },
		elevation: 8,
	},
	fullWidthButton: {
		alignSelf: "stretch",
		minWidth: 0,
		width: "100%",
	},
	disabledButton: {
		opacity: 0.55,
	},
	openButtonText: {
		color: "#ffffff",
		fontSize: 16,
		fontFamily: FONT.bold,
		letterSpacing: 0.3,
	},
	resultSection: {
		marginTop: 30,
		width: "100%",
		alignItems: "center",
		paddingVertical: 18,
		paddingHorizontal: 12,
		borderRadius: 28,
		backgroundColor: "#ffffff",
		shadowColor: "#0f172a",
		shadowOpacity: 0.08,
		shadowRadius: 14,
		shadowOffset: { width: 0, height: 10 },
		elevation: 6,
	},
	resultTitle: {
		fontSize: 24,
		fontFamily: FONT.bold,
		marginBottom: 16,
		color: "#0f172a",
	},
	godPackTitle: {
		color: "#b8860b",
		fontSize: 30,
	},
	cardGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "center",
		gap: 2,
	},
	savedText: {
		marginTop: 18,
		fontSize: 15,
		color: "#0f9f6e",
		fontFamily: ACCENT_FONT_FAMILY,
	},
	pullAgainButton: {
		marginTop: 18,
		minWidth: 230,
		backgroundColor: "#0f73ff",
		paddingVertical: 14,
		paddingHorizontal: 30,
		borderRadius: 999,
		alignItems: "center",
		shadowColor: "#0f73ff",
		shadowOpacity: 0.22,
		shadowRadius: 12,
		shadowOffset: { width: 0, height: 8 },
		elevation: 7,
	},
	pullAgainButtonText: {
		color: "#ffffff",
		fontSize: 16,
		fontFamily: FONT.bold,
		letterSpacing: 0.2,
	},
});
