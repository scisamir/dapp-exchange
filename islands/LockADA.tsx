import { useState, useContext, useEffect } from "preact/hooks";
import { AppState } from "~/islands/AppStateComponent.tsx";
import { Input } from "~/components/Input.tsx";
import { Button } from "~/components/Button.tsx";
import { Data, UTxO } from "lucid/mod.ts";
import { getBalance } from "~/utils.ts";

type lockDurationType = {
    time: number;
    title: string;  
}[];

const lockDurations: lockDurationType = [
    {
        time: 3 * 60 * 1000,
        title: "Test (3 mins)"
    },
    {
        time: 3 * 60 * 60 * 1000,
        title: "3 hours"
    },
    {
        time: 3 * 24 * 60 * 60 * 1000,
        title: "3 days"
    },
    {
        time: 3 * 7 * 24 * 60 * 60 * 1000,
        title: "3 weeks"
    },
    {
        time: 12 * 7 * 24 * 60 * 60 * 1000,
        title: "3 months (12 wks)"
    },
];

const Datum = Data.Object({
    lock_until: Data.Integer(),
    locker: Data.Bytes(),
});

type Datum = Data.Static<typeof Datum>;

export default function LockADA() {
    const { lucidSignal, validators, walletBalance } = useContext(AppState);
    const lucid = lucidSignal.value;

    const [lockAdaAmount, setLockAdaAmount] = useState<string>("");
    const [lockDuration, setLockDuration] = useState<string>("");
    const [utxoLockList, setUtxoLockList] = useState<UTxO[] | undefined>([]);
    const [locking, setLocking] = useState<boolean>(false);
    const [unlocking, setUnlocking] = useState<string | null>(null);
    const [lockTxHash, setLockTxHash] = useState<string | undefined>(undefined);
    const [unlockTxHash, setUnlockTxHash] = useState<string | undefined>(undefined);

    type lockTxDetailsType = {
        txHash: string | undefined;
        datum: string;
    }
    const [lockTxDetails, setLockTxDetails] = useState<lockTxDetailsType>({ txHash: "", datum: "" });

    const lockDurationOptions = lockDurations.map(duration => (
        <option id={duration.title} value={duration.time}>{duration.title}</option>
    ));

    const handleLock = async () => {
        setLocking(true);

        try {
            const lockerHash = lucid!.utils.getAddressDetails(await lucid!.wallet.address())
                .paymentCredential!.hash;

            const lockUntil = Number(lockDuration) + new Date().getTime();

            const datum = Data.to<Datum>(
                {
                    lock_until: BigInt(lockUntil),
                    locker: lockerHash,
                },
                Datum
            );

            const contractAddress = lucid!.utils.validatorToAddress(validators.lock);
            const lovelace = BigInt(Number(lockAdaAmount));

            console.log(`\nlockAdaAmount: ${lockAdaAmount}\n toNumber: ${Number(lockAdaAmount)}\n toBigInt/lovelace: ${lovelace}\n`);

            const tx = await lucid?.newTx()
                .payToContract(contractAddress, { inline: datum }, { lovelace })
                .complete();

            const signedTx = await tx?.sign().complete();
            const txHash = await signedTx?.submit();

            await lucid?.awaitTx(txHash!);

            console.log(`${lockAdaAmount} tADA locked into the contract`);
            setLockTxDetails(prevState => ({ ...prevState, txHash, datum }));
            setLockTxHash(txHash);

            setLocking(false);
        } catch (err) {
            setLocking(false);
            console.log(err);
        }
    }

    const upDateLockList = async () => {
        const lockerHash = lucid!.utils.getAddressDetails(await lucid!.wallet.address())
            .paymentCredential!.hash;

        const scriptAddress = lucid!.utils.validatorToAddress(validators.lock);
        const scriptUtxos = await lucid?.utxosAt(scriptAddress);

        const utxos = scriptUtxos?.filter(utxo => {
            try {
                const datum = Data.from<Datum>(
                    utxo.datum!,
                    Datum
                );
                return datum.locker === lockerHash;
            } catch {
                return false;
            }
        });

        setUtxoLockList(utxos);
    };

    useEffect(() => {
        upDateLockList();
        getBalance(lucid, walletBalance);
    }, [lockTxHash, unlocking]);

    const handleUnlock = async (txHashForUnlock: string) => {
        setUnlocking(txHashForUnlock);

        try {
            const lockerHash = lucid!.utils.getAddressDetails(await lucid!.wallet.address())
                .paymentCredential!.hash;

            const scriptAddress = lucid!.utils.validatorToAddress(validators.lock);
            const scriptUtxos = await lucid?.utxosAt(scriptAddress);

            const utxos = scriptUtxos?.filter(utxo => {
                try {
                    const datum = Data.from<Datum>(
                        utxo.datum!,
                        Datum
                    );
                    return datum.locker === lockerHash && utxo.txHash === txHashForUnlock;
                } catch {
                    return false;
                }
            });

            const redeemer = Data.void();

            let validFrom = Date.now() - 100000;
            let validTo = Date.now() - 500000;

            validFrom = validFrom - (validFrom % 1000);
            validTo = validTo - (validTo % 1000);

            const tx = await lucid?.newTx()
                .collectFrom(utxos!, redeemer)
                .addSigner(await lucid.wallet.address())
                .validFrom(validFrom)
                .attachSpendingValidator(validators.lock)
                .complete();

            const signedTx = await tx?.sign().complete();
            const txHash = await signedTx?.submit();

            await lucid?.awaitTx(txHash!);

            setUnlockTxHash(txHash);

            // remove
            console.log(`${lockAdaAmount} tADA unlocked!`);

            setUnlocking(null);
        } catch (err) {
            setUnlocking(null);
            console.log(err);
        }
    };

    return (
        <>
            <h2 class="mt-6 text-lg">Lock ADA</h2>

            <Input
                type="text"
                name="lockAdaAmount"
                id="lockAdaAmount"
                value={lockAdaAmount}
                onInput={e => setLockAdaAmount(e.currentTarget.value)}
            >
                Ada Amount to Lock
            </Input>

            <label
                htmlFor="lockDuration"
                class="block mt-4 mb-3 text-sm font-medium text-gray-700"
            >Lock Duration</label>
            <select
                id="lockDuration"
                value={lockDuration}
                onChange={e => setLockDuration(e.currentTarget.value)}
                class="bg-gray-50 my-4 block border rounded-md h-8"
            >
                <option value=""></option>
                {lockDurationOptions}
            </select>

            <Button
                class="my-4"
                onClick={handleLock}
                disabled={locking}
            >
                {locking ? "Locking..." : "Lock"}
            </Button>

            {lockTxDetails.txHash &&
                <div class="mb-8 mt-4">
                    <p>ADA locked!; Transaction hash: <a
                        target="_blank"
                        class="text-blue-400"
                        href={`https://preprod.cardanoscan.io/transaction/${lockTxDetails.txHash}`}
                    >{lockTxDetails.txHash}</a></p>
                    <p>Datum: {lockTxDetails.datum}</p>
                </div>
            }

            {!!utxoLockList?.length &&
                (<>
                    <h2 class="mt-4 text-lg">List of Locked ADA</h2>
                    {unlockTxHash && 
                        <p>ADA Unlocked!; Transaction hash: <a
                            target="_blank"
                            class="text-blue-400 my-3"
                            href={`https://preprod.cardanoscan.io/transaction/${unlockTxHash}`}
                        >{unlockTxHash}</a></p>
                    }
                    <div class="mt-2">
                        {utxoLockList.map(utxo => {
                            const datum = Data.from<Datum>(
                                utxo.datum!,
                                Datum
                            );

                            let timeLeftMins = (Number(datum?.lock_until) - new Date().getTime()) / (1000 * 60);
                            timeLeftMins = timeLeftMins >= 0 ? timeLeftMins : 0
                            timeLeftMins = Number(timeLeftMins.toFixed(3));

                            return (
                                <p key={utxo.txHash} class="flex flex-row gap-5 mt-2 justify-around align-middle">
                                    <div>Amount locked: {Number(utxo.assets.lovelace) / 1000000} tADA</div>
                                    <div>Time left: {timeLeftMins} mins</div>
                                    <div>
                                        <Button
                                            onClick={() => handleUnlock(utxo.txHash)}
                                            id={utxo.txHash}
                                            disabled={!!timeLeftMins || unlocking === utxo.txHash}
                                        >
                                            {unlocking === utxo.txHash ? "Unlocking..." : "Unlock"}
                                        </Button>
                                    </div>
                                </p>
                        )})}
                    </div>
                </>)
            }
        </>
    );
}