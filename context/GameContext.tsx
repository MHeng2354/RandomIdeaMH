import { createContext, ReactNode, useEffect, useState } from "react";
import { CardType } from "../types/Card";
import {
	loadCollection,
	loadUser,
	saveCollection,
	saveUser,
} from "../utils/storage";

export type UserProfile = {
	displayName: string;
	email: string;
	password: string;
};

type GameContextType = {
	ancestors: number;
	spendAncestors: (amount: number) => boolean;
	addAncestors: (amount: number) => void;
	collection: CardType[];
	addCards: (cards: CardType[]) => void;
	user: UserProfile | null;
	isLoggedIn: boolean;
	registerUser: (displayName: string, email: string, password: string) => void;
	loginUser: (email: string, password: string) => boolean;
	logoutUser: () => void;
};

export const GameContext = createContext({} as GameContextType);

export function GameProvider({ children }: { children: ReactNode }) {
	const [ancestors, setAncestors] = useState(50);
	const [collection, setCollection] = useState<CardType[]>([]);
	const [user, setUser] = useState<UserProfile | null>(null);

	useEffect(() => {
		loadCollection().then(setCollection);
		loadUser().then((storedUser) => {
			setUser((currentUser) => currentUser ?? storedUser);
		});
	}, []);

	useEffect(() => {
		saveCollection(collection);
	}, [collection]);

	useEffect(() => {
		saveUser(user);
	}, [user]);

	const spendAncestors = (amount: number) => {
		if (ancestors < amount) return false;
		setAncestors((prev) => prev - amount);
		return true;
	};

	const addAncestors = (amount: number) => {
		setAncestors((prev) => prev + amount);
	};

	const addCards = (cards: CardType[]) => {
		setCollection((prev) => [...prev, ...cards]);
	};

	const registerUser = (
		displayName: string,
		email: string,
		password: string,
	) => {
		setUser({ displayName, email, password });
	};

	const loginUser = (email: string, password: string) => {
		if (!user) return false;
		return user.email === email && user.password === password;
	};

	const logoutUser = () => {
		setUser(null);
	};

	return (
		<GameContext.Provider
			value={{
				ancestors,
				spendAncestors,
				addAncestors,
				collection,
				addCards,
				user,
				isLoggedIn: Boolean(user),
				registerUser,
				loginUser,
				logoutUser,
			}}
		>
			{children}
		</GameContext.Provider>
	);
}
