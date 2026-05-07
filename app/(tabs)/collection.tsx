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

type SortOption = "name" | "rarity";

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
	const [sortBy, setSortBy] = useState<SortOption>("name");
	const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
	const [modalVisible, setModalVisible] = useState(false);

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

		// Sort within each group
		Object.keys(grouped).forEach((rarity) => {
			grouped[rarity].sort((a, b) => {
				if (sortBy === "name") {
					return a.name.localeCompare(b.name);
				}
				return 0; // Keep original order for rarity sort
			});
		});

		// Create sections
		const sections = RARITY_ORDER.filter((rarity) => grouped[rarity]).map(
			(rarity) => {
				const totalCards = grouped[rarity].reduce(
					(sum, card) => sum + card.count,
					0,
				);
				return {
					title: rarity
						.replace(/([A-Z])/g, " $1")
						.replace(/^./, (str) => str.toUpperCase()),
					data: grouped[rarity],
					totalCards,
				};
			},
		);

		return sections;
	}, [collection, sortBy]);

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

	const renderSection = ({
		item,
	}: {
		item: { title: string; data: CardWithCount[]; totalCards: number };
	}) => (
		<View key={item.title} style={styles.section}>
			<View style={styles.sectionHeader}>
				<Text style={styles.sectionTitle}>
					{item.title} ({item.data.length} unique, {item.totalCards} total)
				</Text>
			</View>
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
		</View>
	);

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Pokédex</Text>

			<View style={styles.sortContainer}>
				<TouchableOpacity
					style={[
						styles.sortButton,
						sortBy === "name" && styles.sortButtonActive,
					]}
					onPress={() => setSortBy("name")}
				>
					<Text
						style={[
							styles.sortButtonText,
							sortBy === "name" && styles.sortButtonTextActive,
						]}
					>
						Sort by Name
					</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={[
						styles.sortButton,
						sortBy === "rarity" && styles.sortButtonActive,
					]}
					onPress={() => setSortBy("rarity")}
				>
					<Text
						style={[
							styles.sortButtonText,
							sortBy === "rarity" && styles.sortButtonTextActive,
						]}
					>
						Sort by Rarity
					</Text>
				</TouchableOpacity>
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
		paddingTop: 20,
		paddingHorizontal: 12,
		backgroundColor: "#fff",
	},
	title: {
		fontSize: 26,
		fontWeight: "bold",
		textAlign: "center",
		marginBottom: 16,
	},
	sortContainer: {
		flexDirection: "row",
		justifyContent: "center",
		marginBottom: 16,
		gap: 8,
	},
	sortButton: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 20,
		backgroundColor: "#f0f0f0",
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
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#333",
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
