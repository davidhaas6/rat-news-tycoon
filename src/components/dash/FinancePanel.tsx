import { useGame } from '../../stores/useGame';

export default function FinancePanel() {
  const cash = useGame(s => s.cash);
  const writers = useGame(s => s.writers);
  const hire = useGame(s => s.hireWriter);
  const tick = useGame(s => s.tick)
  const reset = useGame(s => s.reset)

  return (
    <section className="rounded bg-stone-800 text-stone-100 p-4 border">
      <h2 className="text-lg font-bold">Finance</h2>
      <p>Cash: ${cash.toLocaleString()}</p>
      <p>Tick: {tick.toLocaleString()}</p>
      <button
        className="mt-2 btn"
        disabled={cash < 1000}
        onClick={() => hire(1000)}
      >
        Hire writer ($1 000)
      </button>
      <p className="text-sm opacity-70 mt-1">Writers: {writers}</p>
      <button
        onClick={() => reset()}
      >
        Restart
      </button>
    </section>
  );
}
