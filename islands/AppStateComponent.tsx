import state, { type AppStateType } from "../state.ts";
import Welcome from "~/islands/Welcome.tsx";
import { createContext } from "preact";
import { useContext } from "preact/hooks";
import Dapp from "~/islands/Dapp.tsx";

export const AppState = createContext<AppStateType>({} as AppStateType);

export default function AppStateComponent() {
    return (
        <AppState.Provider value={state}>
            <h1 class="text-2xl">Welcome to DApp Exchange</h1>
            <Content />
        </AppState.Provider>
    );
}

function Content() {
    const { walletBalance } = useContext(AppState);

    return (
        <>
            {!walletBalance.value && <Welcome />}
            {!!walletBalance.value && <Dapp />}
        </>
    );
}