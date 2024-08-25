import { Lucid } from "lucid/mod.ts";
import { Signal } from "@preact/signals";

export const getBalance = async (lucid: Signal<Lucid | null>, walletBalance: Signal<number>) => {
    try {
        const utxos = await lucid?.value?.wallet.getUtxos();

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