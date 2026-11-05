import { createContext, useContext } from "react";
import type { Engine } from "../engine/Engine";

export const EngineContext = createContext<Engine | null>(null);
export const useEngine = () => useContext(EngineContext);
