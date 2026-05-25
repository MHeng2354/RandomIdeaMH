import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabLayout() {
	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarActiveTintColor: "#2563eb",
				tabBarInactiveTintColor: "#94a3b8",
				tabBarStyle: {
					backgroundColor: "#ffffff",
					borderTopWidth: 1,
					borderTopColor: "rgba(37, 99, 235, 0.12)",
					height: 72,
					paddingBottom: 8,
					paddingTop: 8,
					shadowColor: "#0f172a",
					shadowOpacity: 0.08,
					shadowRadius: 14,
					shadowOffset: { width: 0, height: -8 },
					elevation: 8,
				},
				tabBarLabelStyle: {
					fontSize: 12,
					fontWeight: "700",
				},
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Home",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="home" size={size} color={color} />
					),
				}}
			/>

			<Tabs.Screen
				name="pack"
				options={{
					title: "Packs",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="albums" size={size} color={color} />
					),
				}}
			/>

			<Tabs.Screen
				name="wondermiss"
				options={{
					title: "WonderMiss",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="sparkles" size={size} color={color} />
					),
				}}
			/>

			<Tabs.Screen
				name="collection"
				options={{
					title: "Pokédex",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="grid" size={size} color={color} />
					),
				}}
			/>

			<Tabs.Screen
				name="profile"
				options={{
					title: "Profile",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="person-circle" size={size} color={color} />
					),
				}}
			/>
		</Tabs>
	);
}
