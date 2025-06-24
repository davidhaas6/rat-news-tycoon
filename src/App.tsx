import './App.css'

import FinancePanel from './components/dash/FinancePanel';
import PlaceholderPanel from './components/dash/PlaceholderPanel';
import Screen from './components/Screen';
import { useGameLoop } from './hooks/useGameLoop';

export default function App() {
  useGameLoop();
  return (
    <main className="w-[90vw] h-[100vh] grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* <div className="w-full table"></div> */}
      <PlaceholderPanel />
      <FinancePanel />
      <Screen />
      <PlaceholderPanel />
      <PlaceholderPanel />
      <PlaceholderPanel />
      <div className="bg-red-500 text-white p-4">
  If Tailwind is working, this box should have a red background, white text, and padding.
</div>

    </main>
  );
}