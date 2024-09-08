import { Blockfrost, Lucid, type WalletApi } from "lucid/mod.ts";
import { useContext, useEffect, useState } from "preact/hooks";
import { Button } from "../components/Button.tsx";
import { AppState } from "./AppStateComponent.tsx";
import { getBalance } from "~/utils.ts";

export default function Welcome() {
    const { lucidSignal, walletBalance } = useContext(AppState);

    const [userWallet, setUserWallet] = useState<WalletApi | null>(null);

    const setUpLucid = async (e: Event) => {
        e.preventDefault();

        const blockfrostID = "preprod4XNNKV7AtEG8EjLc0kDwdIVoIVLx1x3F";

        const newLucid = await Lucid.new(
            new Blockfrost(
                "https://cardano-preprod.blockfrost.io/api/v0",
                blockfrostID
            ),
            "Preprod"
        );

        lucidSignal.value = newLucid;

        // log to be removed
        console.log("Lucid.value:");
        console.log(lucidSignal.value);
    };

    const lucid = lucidSignal.value;

    useEffect(() => {
        if (lucid) {
            window.cardano.eternl.enable().then((wallet) => {
                lucid.selectWallet(wallet);
                setUserWallet(wallet);
            });
        }
    }, [lucid]);

    useEffect(() => {
        if (userWallet) {
            getBalance(lucid, walletBalance);
        }
    }, [userWallet]);

    return (
        <>
            <div class="mt-10 grid grid-cols-1 gap-y-8">
                <Button onClick={setUpLucid}>Connect Wallet</Button>
            </div>
        </>
    );
}