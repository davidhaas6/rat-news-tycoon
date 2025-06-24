import './App.css'

import FinancePanel from './components/dash/FinancePanel';
import PlaceholderPanel from './components/dash/PlaceholderPanel';
import Screen from './components/Screen';
import { useGameLoop } from './hooks/useGameLoop';

export default function App() {
  useGameLoop();
  return (
    <main className="grid grid-rows-[auto_1fr_auto] grid-cols-5 gap-2 w-screen h-dvh overflow-hidden">
      {/* <div className="w-full table"></div> */}

      <div className="col-span-5"><PlaceholderPanel /></div>

      <FinancePanel />
      <div className="col-span-3"><Screen /></div>
      <PlaceholderPanel />

      <div className="col-span-5"><PlaceholderPanel /></div>

    </main>
  );
}