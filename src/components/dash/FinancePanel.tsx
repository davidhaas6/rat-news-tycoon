import { useGame } from '../../stores/useGame';

export default function FinancePanel() {
  const cash = useGame(s => s.cash);
  const writers = useGame(s => s.writers);
  const hire = useGame(s => s.hireWriter);
  const reset = useGame(s => s.reset)
  const writerCost = useGame(s => s.getHireWriterCost)()
  const readers = useGame(s => s.subscribers)

  const tick = useGame(s => s.tick) // lets the panel refresh with a new timestamp. figure out how to fix to avoid refreshes. could modularize the timestamp panel or smtn else
  const timestamp = useGame(s => s.getTimeStamp)

  return (
    <section className="rounded text-stone-100 p-4 border-4 h-full yellow-border">
      <h2 className="text-lg font-bold">Management</h2>
      <p>{timestamp()}</p>
      <p>{cash.toLocaleString()} Cheddar</p>
      <p>{writers} rat employees</p>
      <p>{readers} readers</p>
      <button
        className="mt-2 btn"
        disabled={cash < writerCost}
        onClick={() => hire()}
      >
        Hire Rat <br/><small>({writerCost} Cheddar)</small>
      </button>
      <button
        onClick={() => reset()}
      >
        Restart
      </button>
    </section>
  );
}
