import './App.css'

import FinancePanel from './components/dash/FinancePanel';
import PlaceholderPanel from './components/dash/PlaceholderPanel';
import Header from './components/Header';
import Screen from './components/dash/Screen';
import { useGameLoop } from './hooks/useGameLoop';
import RightStatusPanel from './components/RightStatusPanel';

export default function App() {
  useGameLoop();
  return (
    <main className="grid grid-cols-1 gap-4 md:grid-cols-5 grid-rows-[auto_1fr_auto] w-screen h-dvh overflow-y-auto bg-stone-700 text-stone-100">
      <div className="col-span-full"><Header /></div>

      {/* middle row → re-orders on small screens */}
      <div className="order-2 md:order-none"><FinancePanel /></div>
      <div className="order-1 md:order-none md:col-span-3"><Screen /></div>
      <div className="order-3 md:order-none"><RightStatusPanel/></div>

      {/* <div className="order-4 col-span-full"><PlaceholderPanel text='Bottom' /></div> */}
    </main>

  );
}
