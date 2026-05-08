import { createContext, ReactNode, useEffect, useState } from "react";
import { CardType } from "../types/Card";
import { loadCollection, saveCollection } from "../utils/storage";

type GameContextType = {
  ancestors: number;
  spendAncestors: (amount: number) => boolean;
  addAncestors: (amount: number) => void;
  collection: CardType[];
  addCards: (cards: CardType[]) => void;
};

export const GameContext = createContext({} as GameContextType);

export function GameProvider({ children }: { children: ReactNode }) {
  const [ancestors, setAncestors] = useState(50);
  const [collection, setCollection] = useState<CardType[]>([]);

  useEffect(() => {
    loadCollection().then(setCollection);
  }, []);

  useEffect(() => {
    saveCollection(collection);
  }, [collection]);

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

  return (
    <GameContext.Provider
      value={{
        ancestors,
        spendAncestors,
        addAncestors,
        collection,
        addCards,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}