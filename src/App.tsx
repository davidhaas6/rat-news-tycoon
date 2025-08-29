import './App.css'

import FinancePanel from './components/dash/FinancePanel';
import PlaceholderPanel from './components/dash/PlaceholderPanel';
import Screen from './components/dash/Screen';
import { useGameLoop } from './hooks/useGameLoop';

export default function App() {
  useGameLoop();
  return (
    <main className="grid grid-cols-1 md:grid-cols-5 grid-rows-[auto_1fr_auto] gap-2 w-screen h-dvh overflow-hidden">
      <div className="col-span-full"><PlaceholderPanel text='top panel' /></div>

      {/* middle row → re-orders on small screens */}
      <div className="order-2 md:order-none"><FinancePanel /></div>
      <div className="order-1 md:order-none md:col-span-3"><Screen /></div>
      <div className="order-3 md:order-none"><PlaceholderPanel text='right panel' /></div>

      {/* <div className="order-4 col-span-full"><PlaceholderPanel text='Bottom' /></div> */}
    </main>

  );
}