import { Lucid } from "lucid/mod.ts";
import { Signal, signal, computed } from "@preact/signals";

export type AppStateType = {
    lucid: Signal<Lucid | null>;
    walletBalance: Signal<number>;
}

function createAppState(): AppStateType {
    const lucid = signal<Lucid | null>(null);
    const walletBalance = signal<number>(0);

    return { lucid, walletBalance };
}

export default createAppState();