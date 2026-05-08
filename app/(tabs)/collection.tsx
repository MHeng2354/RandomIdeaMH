import { useContext, useMemo, useState } from "react";
import {
	FlatList,
	Image,
	Modal,
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

		// Count duplicates by id
		const cardCounts: Record<string, { card: CardType; count: number }> = {};
		collection.forEach((card) => {
			if (cardCounts[card.id]) {
				cardCounts[card.id].count++;
			} else {
				cardCounts[card.id] = { card, count: 1 };
			}
		});

		// Group by rarity
		Object.values(cardCounts).forEach(({ card, count }) => {
			const cardWithCount: CardWithCount = { ...card, count };
			if (!grouped[card.rarity]) {
				grouped[card.rarity] = [];
			}
			grouped[card.rarity].push(cardWithCount);
		});

		// Sort within each group by name
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
		<TouchableOpacity style={styles.card} onPress={() => handleCardPress(item)}>
			<Image
				source={{ uri: item.image }}
				style={styles.image}
				resizeMode="cover"
			/>
			<Text style={styles.name} numberOfLines={2}>
				{item.name}
			</Text>
			<Text style={styles.rarity}>{item.rarity}</Text>
			{item.count > 1 && (
				<View style={styles.countBadge}>
					<Text style={styles.countText}>×{item.count}</Text>
				</View>
			)}
		</TouchableOpacity>
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
			<View key={item.title} style={styles.section}>
				<TouchableOpacity
					style={styles.sectionHeader}
					onPress={() => toggleRarityCollapse(item.rarity)}
				>
					<Text style={styles.sectionTitle}>
						{item.title} ({item.data.length} unique, {item.totalCards} total)
					</Text>
					<Text style={styles.sectionToggle}>{isCollapsed ? "+" : "–"}</Text>
				</TouchableOpacity>
				{!isCollapsed ? (
					<FlatList
						data={item.data}
						keyExtractor={(card) => card.id}
						renderItem={renderCard}
						numColumns={3}
						columnWrapperStyle={styles.row}
						scrollEnabled={false}
						showsVerticalScrollIndicator={false}
						contentContainerStyle={
							item.data.length === 0 ? styles.emptySection : undefined
						}
						ListEmptyComponent={
							<Text style={styles.empty}>No cards in this rarity.</Text>
						}
					/>
				) : (
					<Text style={styles.collapsedText}>
						Tap to expand this rarity group.
					</Text>
				)}
			</View>
		);
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Pokédex</Text>

			<View style={styles.sortContainer}>
				<TouchableOpacity
					style={[styles.sortButton, styles.filterButton]}
					onPress={() => setRarityPickerVisible(true)}
				>
					<Text style={[styles.sortButtonText, styles.sortButtonTextActive]}>
						Filter: {formatRarityLabel(selectedRarity)}
					</Text>
				</TouchableOpacity>
			</View>

			<Modal
				visible={rarityPickerVisible}
				transparent={true}
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
							<TouchableOpacity
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
							</TouchableOpacity>
						))}
					</View>
				</TouchableOpacity>
			</Modal>

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

			<Modal
				visible={modalVisible}
				transparent={true}
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
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: 45,
		paddingHorizontal: 12,
		backgroundColor: "#fff",
	},
	title: {
		fontSize: 30,
		fontWeight: "bold",
		textAlign: "center",
		marginBottom: 16,
	},
	sortContainer: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 16,
	},
	sortButton: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 20,
		backgroundColor: "#2c9cff",
	},
	filterButton: {
		minWidth: 180,
		alignItems: "center",
	},
	filterModalContent: {
		width: "90%",
		backgroundColor: "#fff",
		borderRadius: 12,
		padding: 16,
	},
	filterOption: {
		paddingVertical: 14,
		paddingHorizontal: 12,
		borderRadius: 10,
		marginBottom: 10,
		backgroundColor: "#f5f5f5",
	},
	filterOptionActive: {
		backgroundColor: "#0dade3",
	},
	filterOptionText: {
		fontSize: 16,
		color: "#333",
	},
	filterOptionTextActive: {
		color: "#fff",
		fontWeight: "bold",
	},
	sortButtonActive: {
		backgroundColor: "#e3350d",
	},
	sortButtonText: {
		fontSize: 14,
		color: "#666",
	},
	sortButtonTextActive: {
		color: "#fff",
	},
	list: {
		paddingBottom: 24,
	},
	row: {
		justifyContent: "space-between",
		marginBottom: 12,
	},
	card: {
		width: "31.5%",
		backgroundColor: "#f6f6f6",
		borderRadius: 12,
		padding: 8,
		alignItems: "center",
		position: "relative",
	},
	image: {
		width: "100%",
		aspectRatio: 0.72,
		borderRadius: 8,
		marginBottom: 8,
	},
	name: {
		fontSize: 12,
		fontWeight: "600",
		textAlign: "center",
		minHeight: 32,
	},
	rarity: {
		marginTop: 4,
		fontSize: 11,
		color: "#666",
		textTransform: "capitalize",
	},
	countBadge: {
		position: "absolute",
		top: 4,
		right: 4,
		backgroundColor: "#e3350d",
		borderRadius: 10,
		paddingHorizontal: 6,
		paddingVertical: 2,
		minWidth: 20,
		alignItems: "center",
		justifyContent: "center",
	},
	countText: {
		color: "#fff",
		fontSize: 10,
		fontWeight: "bold",
	},
	section: {
		marginBottom: 16,
	},
	sectionHeader: {
		backgroundColor: "#f9f9f9",
		paddingVertical: 8,
		paddingHorizontal: 12,
		marginBottom: 8,
		borderRadius: 8,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#333",
		flex: 1,
	},
	sectionToggle: {
		fontSize: 22,
		fontWeight: "700",
		color: "#333",
		marginLeft: 12,
	},
	collapsedText: {
		textAlign: "center",
		color: "#666",
		fontSize: 14,
		paddingVertical: 12,
	},
	emptySection: {
		paddingBottom: 0,
	},
	empty: {
		textAlign: "center",
		marginTop: 40,
		fontSize: 16,
		color: "#666",
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.8)",
		justifyContent: "center",
		alignItems: "center",
	},
	modalContent: {
		width: "90%",
		maxWidth: 400,
		backgroundColor: "#fff",
		borderRadius: 12,
		padding: 20,
		alignItems: "center",
	},
	fullCardImage: {
		width: "100%",
		aspectRatio: 0.72,
	},
});
