import {
	ActivityIndicator,
	SafeAreaView,
	StyleSheet,
	Text,
	View,
} from "react-native";

type LoadingScreenProps = {
	title: string;
	subtitle: string;
	indicatorColor?: string;
};

export default function LoadingScreen({
	title,
	subtitle,
	indicatorColor = "#2563eb",
}: LoadingScreenProps) {
	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.center}>
				<View style={styles.card}>
					<ActivityIndicator size="large" color={indicatorColor} />
					<Text style={styles.title}>{title}</Text>
					<Text style={styles.subtitle}>{subtitle}</Text>
				</View>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: "#f3f6fb",
	},
	center: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 24,
	},
	card: {
		width: "100%",
		maxWidth: 420,
		backgroundColor: "#ffffff",
		borderRadius: 24,
		padding: 24,
		alignItems: "center",
		shadowColor: "#0f172a",
		shadowOpacity: 0.08,
		shadowRadius: 16,
		shadowOffset: { width: 0, height: 10 },
		elevation: 5,
	},
	title: {
		marginTop: 16,
		fontSize: 24,
		fontWeight: "700",
		color: "#0f172a",
		textAlign: "center",
	},
	subtitle: {
		marginTop: 8,
		fontSize: 14,
		fontWeight: "500",
		color: "#475569",
		textAlign: "center",
		lineHeight: 20,
	},
});
