import {
	Poppins_400Regular,
	Poppins_500Medium,
	Poppins_600SemiBold,
	Poppins_700Bold,
	useFonts,
} from "@expo-google-fonts/poppins";
import { useContext, useMemo, useState } from "react";
import {
	FlatList,
	Image,
	Modal,
	Pressable,
	SafeAreaView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { GameContext } from "../../context/GameContext";
import { CardType } from "../../types/Card";

type RarityFilter = CardType["rarity"] | "all";

const RARITY_ORDER: CardType["rarity"][] = [
	"common",
	"uncommon",
	"rare",
	"ultraRare",
	"illustrationRare",
	"specialIllustrationRare",
	"hyperRare",
];

export default function Collection() {
	const { collection } = useContext(GameContext);
	const [selectedRarity, setSelectedRarity] = useState<RarityFilter>("all");
	const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
	const [modalVisible, setModalVisible] = useState(false);
	const [rarityPickerVisible, setRarityPickerVisible] = useState(false);
	const [collapsedRarities, setCollapsedRarities] = useState<
		Partial<Record<CardType["rarity"], boolean>>
	>({});

	type CardWithCount = CardType & { count: number };

	const groupedAndSortedCards = useMemo(() => {
		const grouped: Record<string, CardWithCount[]> = {};
		const cardCounts: Record<string, { card: CardType; count: number }> = {};

		collection.forEach((card) => {
			if (cardCounts[card.id]) {
				cardCounts[card.id].count++;
			} else {
				cardCounts[card.id] = { card, count: 1 };
			}
		});

		Object.values(cardCounts).forEach(({ card, count }) => {
			const cardWithCount: CardWithCount = { ...card, count };
			if (!grouped[card.rarity]) {
				grouped[card.rarity] = [];
			}
			grouped[card.rarity].push(cardWithCount);
		});

		Object.keys(grouped).forEach((rarity) => {
			grouped[rarity].sort((a, b) => a.name.localeCompare(b.name));
		});

		const filteredRarities =
			selectedRarity === "all" ? RARITY_ORDER : [selectedRarity];
		const sections = filteredRarities.map((rarity) => {
			const cards = grouped[rarity] ?? [];
			const totalCards = cards.reduce((sum, card) => sum + card.count, 0);
			return {
				rarity,
				title: rarity
					.replace(/([A-Z])/g, " $1")
					.replace(/^./, (str) => str.toUpperCase()),
				data: cards,
				totalCards,
			};
		});

		return sections;
	}, [collection, selectedRarity]);

	const handleCardPress = (card: CardType) => {
		setSelectedCard(card);
		setModalVisible(true);
	};

	const renderCard = ({ item }: { item: CardWithCount }) => (
		<Pressable style={styles.card} onPress={() => handleCardPress(item)}>
			<Image
				source={{ uri: item.image }}
				style={styles.image}
				resizeMode="cover"
			/>
			<View style={styles.cardInfo}>
				<Text style={styles.name} numberOfLines={2}>
					{item.name}
				</Text>
				<Text style={styles.rarity}>{formatRarityLabel(item.rarity)}</Text>
			</View>
			{item.count > 1 && (
				<View style={styles.countBadge}>
					<Text style={styles.countText}>x{item.count}</Text>
				</View>
			)}
		</Pressable>
	);

	const toggleRarityCollapse = (rarity: CardType["rarity"]) => {
		setCollapsedRarities((current) => ({
			...current,
			[rarity]: !current[rarity],
		}));
	};

	const formatRarityLabel = (rarity: RarityFilter) =>
		rarity === "all"
			? "All"
			: rarity
					.replace(/([A-Z])/g, " $1")
					.replace(/^./, (str) => str.toUpperCase());

	const filterOptions: RarityFilter[] = ["all", ...RARITY_ORDER];

	const selectRarity = (rarity: RarityFilter) => {
		setSelectedRarity(rarity);
		setRarityPickerVisible(false);
	};

	const renderSection = ({
		item,
	}: {
		item: {
			title: string;
			rarity: CardType["rarity"];
			data: CardWithCount[];
			totalCards: number;
		};
	}) => {
		const isCollapsed = collapsedRarities[item.rarity] ?? false;

		return (
			<View style={styles.section}>
				<Pressable
					style={styles.sectionHeader}
					onPress={() => toggleRarityCollapse(item.rarity)}
				>
					<View>
						<Text style={styles.sectionTitle}>{item.title}</Text>
						<Text style={styles.sectionMeta}>
							{item.data.length} unique / {item.totalCards} total
						</Text>
					</View>
					<Text style={styles.sectionToggle}>{isCollapsed ? "+" : "-"}</Text>
				</Pressable>

				{!isCollapsed ? (
					<FlatList
						data={item.data}
						keyExtractor={(card) => card.id}
						renderItem={renderCard}
						numColumns={3}
						columnWrapperStyle={styles.row}
						scrollEnabled={false}
						showsVerticalScrollIndicator={false}
						contentContainerStyle={styles.sectionList}
					/>
				) : null}
			</View>
		);
	};

	const [fontsLoaded] = useFonts({
		Poppins_400Regular,
		Poppins_500Medium,
		Poppins_600SemiBold,
		Poppins_700Bold,
	});

	if (!fontsLoaded) {
		return <SafeAreaView style={styles.loadingContainer} />;
	}

	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.container}>
				<View style={styles.headerCard}>
					<View>
						<Text style={styles.title}>Pokédex</Text>
						<Text style={styles.headerText}>
							Browse your collection and filter by rarity in one place.
						</Text>
					</View>
					<Pressable
						style={styles.filterButton}
						onPress={() => setRarityPickerVisible(true)}
					>
						<Text style={styles.filterButtonText}>
							Filter: {formatRarityLabel(selectedRarity)}
						</Text>
					</Pressable>
				</View>

				<FlatList
					data={groupedAndSortedCards}
					keyExtractor={(item) => item.title}
					renderItem={renderSection}
					contentContainerStyle={styles.list}
					showsVerticalScrollIndicator={false}
					ListEmptyComponent={
						<Text style={styles.empty}>No cards collected yet.</Text>
					}
				/>
			</View>

			<Modal
				visible={rarityPickerVisible}
				transparent
				animationType="fade"
				onRequestClose={() => setRarityPickerVisible(false)}
			>
				<TouchableOpacity
					style={styles.modalOverlay}
					activeOpacity={1}
					onPress={() => setRarityPickerVisible(false)}
				>
					<View style={styles.filterModalContent}>
						{filterOptions.map((rarity) => (
							<Pressable
								key={rarity}
								style={[
									styles.filterOption,
									selectedRarity === rarity && styles.filterOptionActive,
								]}
								onPress={() => selectRarity(rarity)}
							>
								<Text
									style={[
										styles.filterOptionText,
										selectedRarity === rarity && styles.filterOptionTextActive,
									]}
								>
									{formatRarityLabel(rarity)}
								</Text>
							</Pressable>
						))}
					</View>
				</TouchableOpacity>
			</Modal>

			<Modal
				visible={modalVisible}
				transparent
				animationType="fade"
				onRequestClose={() => setModalVisible(false)}
			>
				<TouchableOpacity
					style={styles.modalOverlay}
					activeOpacity={1}
					onPress={() => setModalVisible(false)}
				>
					<View style={styles.modalContent}>
						{selectedCard && (
							<Image
								source={{ uri: selectedCard.image }}
								style={styles.fullCardImage}
								resizeMode="contain"
							/>
						)}
					</View>
				</TouchableOpacity>
			</Modal>
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
	},
	container: {
		flex: 1,
		paddingTop: 24,
		paddingHorizontal: 16,
	},
	headerCard: {
		backgroundColor: "#ffffff",
		borderRadius: 28,
		padding: 20,
		marginBottom: 16,
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
	headerText: {
		marginTop: 8,
		fontSize: 14,
		lineHeight: 22,
		color: "#475569",
		fontFamily: FONT.regular,
	},
	filterButton: {
		marginTop: 16,
		backgroundColor: "#2563eb",
		borderRadius: 999,
		paddingVertical: 12,
		paddingHorizontal: 18,
		alignSelf: "flex-start",
	},
	filterButtonText: {
		color: "#ffffff",
		fontFamily: FONT.semiBold,
		fontSize: 14,
	},
	list: {
		paddingBottom: 24,
	},
	section: {
		marginBottom: 18,
	},
	sectionHeader: {
		backgroundColor: "#ffffff",
		borderRadius: 20,
		paddingVertical: 14,
		paddingHorizontal: 16,
		marginBottom: 12,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		shadowColor: "#0f172a",
		shadowOpacity: 0.06,
		shadowRadius: 12,
		shadowOffset: { width: 0, height: 8 },
		elevation: 4,
	},
	sectionTitle: {
		fontSize: 18,
		fontFamily: FONT.bold,
		color: "#0f172a",
	},
	sectionMeta: {
		marginTop: 4,
		fontSize: 12,
		fontFamily: FONT.regular,
		color: "#64748b",
	},
	sectionToggle: {
		fontSize: 22,
		color: "#0f172a",
		fontFamily: FONT.bold,
	},
	sectionList: {
		paddingBottom: 8,
	},
	row: {
		justifyContent: "space-between",
		marginBottom: 12,
	},
	card: {
		width: "31.5%",
		backgroundColor: "#ffffff",
		borderRadius: 22,
		padding: 8,
		alignItems: "center",
		position: "relative",
		shadowColor: "#0f172a",
		shadowOpacity: 0.08,
		shadowRadius: 12,
		shadowOffset: { width: 0, height: 8 },
		elevation: 5,
	},
	cardInfo: {
		alignItems: "center",
		paddingTop: 8,
	},
	image: {
		width: "100%",
		aspectRatio: 0.72,
		borderRadius: 16,
	},
	name: {
		fontSize: 12,
		fontFamily: FONT.semiBold,
		textAlign: "center",
		color: "#0f172a",
	},
	rarity: {
		marginTop: 4,
		fontSize: 12,
		color: "#475569",
		fontFamily: FONT.regular,
		textTransform: "capitalize",
	},
	countBadge: {
		position: "absolute",
		top: 8,
		right: 8,
		backgroundColor: "#0f172a",
		borderRadius: 999,
		paddingHorizontal: 7,
		paddingVertical: 3,
	},
	countText: {
		color: "#ffffff",
		fontSize: 10,
		fontFamily: FONT.bold,
	},
	collapsedText: {
		textAlign: "center",
		color: "#475569",
		fontSize: 13,
		fontFamily: FONT.regular,
		paddingVertical: 12,
	},
	empty: {
		textAlign: "center",
		marginTop: 40,
		fontSize: 16,
		color: "#475569",
		fontFamily: FONT.regular,
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(15, 23, 42, 0.8)",
		justifyContent: "center",
		alignItems: "center",
	},
	filterModalContent: {
		width: "88%",
		backgroundColor: "#ffffff",
		borderRadius: 24,
		padding: 18,
	},
	filterOption: {
		paddingVertical: 14,
		paddingHorizontal: 14,
		borderRadius: 16,
		marginBottom: 10,
		backgroundColor: "#eff6ff",
	},
	filterOptionActive: {
		backgroundColor: "#2563eb",
	},
	filterOptionText: {
		fontSize: 15,
		color: "#0f172a",
		fontFamily: FONT.semiBold,
	},
	filterOptionTextActive: {
		color: "#ffffff",
	},
	modalContent: {
		width: "88%",
		backgroundColor: "#ffffff",
		borderRadius: 28,
		padding: 16,
		alignItems: "center",
	},
	fullCardImage: {
		width: "100%",
		aspectRatio: 0.72,
		borderRadius: 20,
	},
});
