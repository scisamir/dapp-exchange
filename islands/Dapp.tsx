import { useContext, useState } from "preact/hooks";
import { AppState } from "./AppStateComponent.tsx";
import { Button } from "~/components/Button.tsx";
import { Input } from "~/components/Input.tsx";
import { getBalance } from "~/utils.ts";

export default function Dapp() {
    const { lucid, walletBalance } = useContext(AppState);

    const [sendADA, setSendADA] = useState<string>("");
    const [sendADAAddress, setSendADAAddress] = useState<string>("");
    const [waitingSendADA, setWaitingSendADA] = useState<boolean>(false);
    const [sendADATxHash, setSendADATxHash] = useState<string>("");

    const handleSendADA = async () => {
        setWaitingSendADA(true);

        try {
            const adaAmount = Number(sendADA) * 1000000;

            const tx = await lucid.value!.newTx()
                .payToAddress(sendADAAddress, { lovelace: BigInt(adaAmount) })
                .complete();

            const signedTx = await tx.sign().complete();

            const txHash = await signedTx.submit();

            const success = await lucid.value?.awaitTx(txHash);

            setTimeout(() => {
                setWaitingSendADA(false);

                if (success) {
                    setSendADATxHash(txHash);
                    getBalance(lucid, walletBalance);
                }
            }, 2000);
        } catch (err) {
            setWaitingSendADA(false);
            console.log(err);
        }
    }

    return (
        <>
            <p class="font-semibold float-right mr-3">Wallet balance: {walletBalance.value}</p>

            <div class="mt-6">
                <h2 class="mt-6 text-lg">Send ADA</h2>
                <Input
                    type="text"
                    name="sendADAAddress"
                    id="sendADAAddress"
                    value={sendADAAddress}
                    onInput={(e) => setSendADAAddress(e.currentTarget.value)}
                >
                    Address of Recepient:
                </Input>
                <Input
                    type="text"
                    name="sendADA"
                    id="sendADA"
                    value={sendADA}
                    class="mt-4"
                    onInput={(e) => setSendADA(e.currentTarget.value)}
                >
                    Amount of ADA:
                </Input>
                <Button
                    onClick={handleSendADA}
                    disabled={waitingSendADA}
                    class="mt-6"
                >
                    {waitingSendADA ? "Waiting for Tx..." : "Send"}
                </Button>

                {sendADATxHash && (
                    <>
                        <h3 class="mt-4 mb-2">Ada Sent!</h3>
                        <a
                            target="_blank"
                            class="mb-2 text-blue-500"
                            href={`https://preprod.cardanoscan.io/transaction/${sendADATxHash}`}
                        >
                            View on cardanoscan; {sendADATxHash}
                        </a>
                    </>
                )}
            </div>
        </>
    );
}