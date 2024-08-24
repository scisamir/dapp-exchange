import { Blockfrost, Lucid, fromHex } from "lucid/mod.ts";
import { useContext, useEffect, useState } from "preact/hooks";
import { Button } from "../components/Button.tsx";
import { AppState } from "./AppStateComponent.tsx";

export default function Welcome() {
    const { lucid } = useContext(AppState);

    const [userWallet, setUserWallet] = useState<any>(null);
    const [walletBalance, setWalletBalance] = useState<any>(null);

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

        lucid.value = newLucid;

        console.log("Lucid.value:");
        console.log(lucid.value);
    };

    useEffect(() => {
        if (lucid.value) {
            window.cardano.eternl.enable().then((wallet) => {
                lucid.value.selectWallet(wallet);
                setUserWallet(wallet);
            });
        }
    }, [lucid.value]);

    const getBalance = async () => {
        try {
            const utxos = await lucid.value.wallet.getUtxos();

            let lovelace = BigInt(0);
            for (let i in utxos) {
                lovelace += utxos[i].assets.lovelace;
            }

            let balance = Number(lovelace) / 1000000;
            setWalletBalance(balance);
        } catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        if (userWallet) {
            getBalance();
        }
    }, [userWallet]);

    return (
        <>
            <div class="mt-10 grid grid-cols-1 gap-y-8">
                <Button onClick={setUpLucid}>Connect Wallet</Button>
                {userWallet && <p class="font-md text-bold">Balance: {walletBalance}  ADA</p>}
            </div>
        </>
    );
}