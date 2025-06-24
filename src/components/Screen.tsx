import { useGame } from '../stores/useGame';

export default function Screen() {
  const n_writers = useGame(s => s.writers);
  return (
    <section className="rounded min-w-[320px] w-full bg-stone-800 text-stone-100 p-4 border">
      <h2 className="text-lg font-bold">Game screen</h2>
      <p>beep-boop</p>
      <button>
        Button
      </button>
    </section>
  );
}
