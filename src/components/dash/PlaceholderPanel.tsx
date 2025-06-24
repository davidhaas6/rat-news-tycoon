import { useGame } from '../../stores/useGame';

export default function PlaceholderPanel() {
  const cash = useGame(s => s.cash);
  return (
    <section className="rounded bg-stone-800 text-stone-100 p-4 border">
      <h2 className="text-lg font-bold">Header</h2>
      <p>Some details here</p>
      <button>
        Button
      </button>
    </section>
  );
}
