import { Lucid } from "lucid/mod.ts";
import { Signal, signal } from "@preact/signals";
import { Validators, readValidators } from "~/utils.ts";

export type AppStateType = {
    lucidSignal: Signal<Lucid | null>;
    walletBalance: Signal<number>;
    validators: Validators;
}

function createAppState(): AppStateType {
    const lucidSignal = signal<Lucid | null>(null);
    const walletBalance = signal<number>(0);

    const validators = readValidators();

    return { lucidSignal, walletBalance, validators };
}

export default createAppState();