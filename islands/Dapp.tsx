import { useContext, useState } from "preact/hooks"
import { AppState } from "~/islands/AppStateComponent.tsx";
import SendADA from "~/islands/SendADA.tsx";
import LockADA from "~/islands/LockADA.tsx";
import { JSX } from "preact/jsx-runtime";

const pages: { [key: string]: JSX.Element } = {
    send: <SendADA />,
    lock: <LockADA />,
    gift: <p>Coming soon!</p>,
    trade: <p>Coming soon!</p>
};

export default function Dapp() {
    const { walletBalance } = useContext(AppState);

    const [currentPage, setCurrentPage] = useState<string>("send");

    const handleDappNavigation = (page: string) => {
        setCurrentPage(page);
    }

    return (
        <>
            <p class="font-semibold float-right mr-3">Wallet balance: {walletBalance.value}</p>
            <nav class="mt-14 mb-2">
                <ul class="flex flex-row justify-around p-4 border border-gray-400 rounded-md">
                    <li
                        class={`p-2 text-lg font-bold border rounded-lg cursor-pointer ${currentPage === "send" ? "bg-blue-600 text-white" : "bg-blue-200 text-gray-600"}`}
                        onClick={() => handleDappNavigation("send")}
                    >Send</li>
                    <li
                        class={`p-2 text-lg font-bold border rounded-lg cursor-pointer ${currentPage === "lock" ? "bg-blue-600 text-white" : "bg-blue-200 text-gray-600"}`}
                        onClick={() => handleDappNavigation("lock")}
                    >Lock</li>
                    <li
                        class={`p-2 text-lg font-bold border rounded-lg cursor-pointer ${currentPage === "gift" ? "bg-blue-600 text-white" : "bg-blue-200 text-gray-600"}`}
                        onClick={() => handleDappNavigation("gift")}
                    >Gift Card</li>
                    <li
                        class={`p-2 text-lg font-bold border rounded-lg cursor-pointer ${currentPage === "trade" ? "bg-blue-600 text-white" : "bg-blue-200 text-gray-600"}`}
                        onClick={() => handleDappNavigation("trade")}
                    >Trade</li>
                </ul>
            </nav>
            {pages[currentPage]}
        </>
    );
}