import { Lucid } from "lucid/mod.ts";
import { Signal, signal, computed } from "@preact/signals";

export type AppStateType = {
    lucid: Signal<Lucid | null>;
}

function createAppState(): AppStateType {
    const lucid = signal<Lucid>(null);

    return { lucid };
}

export default createAppState();