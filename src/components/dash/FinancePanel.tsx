import { useGame } from '../../stores/useGame';

export default function FinancePanel() {
  const cash = useGame(s => s.cash);
  const writers = useGame(s => s.writers);
  const hire = useGame(s => s.hireWriter);
  const reset = useGame(s => s.reset)
  const writerCost = useGame(s => s.getHireWriterCost)()
  const subscribers = useGame(s => s.subscribers)
  const totalViews = useGame(s => s.getTotalViews)
  const revenue = useGame(s => s.getMonthlyRevenue)
  const costs = useGame(s => s.getMonthlyCost)

  const tick = useGame(s => s.tick) // lets the panel refresh with a new timestamp. figure out how to fix to avoid refreshes. could modularize the timestamp panel or smtn else
  const timestamp = useGame(s => s.getTimeStamp)

  return (
    <section className="rounded-lg p-4 bg-stone-800 text-stone-100 border-4 yellow-border shadow-md flex flex-col h-full">
      <header className="mb-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-bold">Management</h2>
        </div>
      </header>

      <ul className="space-y-2 flex-1">
        <li className="flex justify-between items-baseline">
          <span className="text-sm text-stone-300">Cash</span>
          <span className="font-semibold text-right">{Math.round(cash).toLocaleString()} Cheddar</span>
        </li>

        <li className="flex justify-between items-baseline">
          <span className="text-sm text-stone-300">Employees</span>
          <span className="font-semibold">{writers} rats</span>
        </li>

        <li className="flex justify-between items-baseline">
          <span className="text-sm text-stone-300">Views</span>
          <span className="font-semibold">{Math.round(totalViews()).toLocaleString()}</span>
        </li>

        <li className="flex justify-between items-baseline">
          <span className="text-sm text-stone-300">Subscribers</span>
          <span className="font-semibold">{subscribers}</span>
        </li>

        <li className="flex justify-between items-baseline">
          <span className="text-sm text-stone-300">Income</span>
          <span className="font-semibold">{Math.round(revenue()).toLocaleString()} Cheddar</span>
        </li>

        <li className="flex justify-between items-baseline">
          <span className="text-sm text-stone-300">Cost</span>
          <span className="font-semibold">{Math.round(costs()).toLocaleString()} Cheddar</span>
        </li>
      </ul>

      <footer className="mt-4 flex gap-3">
        <button
          className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition ${cash < writerCost ? 'opacity-60 cursor-not-allowed' : 'bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500'}`}
          disabled={cash < writerCost}
          onClick={() => hire()}
          aria-disabled={cash < writerCost}
        >
          <div>Hire Rat</div>
          <div className="text-xs font-normal">({writerCost} Cheddar)</div>
        </button>

        <button
          className="rounded px-3 py-2 text-sm border border-stone-700 text-stone-200 hover:border-stone-500"
          onClick={() => reset()}
        >
          Restart
        </button>
      </footer>
    </section>
  );
}
