import { applyDoubleCborEncoding, Lucid, SpendingValidator } from "lucid/mod.ts";
import { Signal } from "@preact/signals";

import blueprint from "~/plutus.json" assert { type: "json" };

// Returns user wallet's balance
export const getBalance = async (lucid: Lucid | null, walletBalance: Signal<number>) => {
    try {
        const utxos = await lucid?.wallet.getUtxos();

        let lovelace = BigInt(0);
        for (let i = 0; i < utxos?.length!; i++) {
            lovelace += utxos![i].assets.lovelace;
        }

        const balance = Number(lovelace) / 1000000;
        walletBalance.value = balance;

        // remove
        console.log('In get balance:');
        console.log(walletBalance.value);
    } catch (err) {
        console.log(err);
    }
}


// Returns the staking validator
export type Validators = {
    lock: SpendingValidator;
}

export function readValidators(): Validators {
    const stake = blueprint.validators.find(v => v.title === "staking.vesting");

    if (!stake) {
        throw new Error("Stake validator not found");
    }

    return {
        lock: {
            type: "PlutusV2",
            script: applyDoubleCborEncoding(stake.compiledCode)
        },
    };
}