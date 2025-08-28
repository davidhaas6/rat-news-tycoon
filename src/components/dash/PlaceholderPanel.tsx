import { useGame } from '../../stores/useGame';

export default function PlaceholderPanel(props: {text?: string}) {
  const cash = useGame(s => s.cash);
  return (
    <section className="rounded text-stone-100 p-4 border-4 h-full yellow-border">
      <h2 className="text-lg font-bold">Header</h2>
      <p>{props.text ?? "Placeholder text"}</p>
      <button>
        Button
      </button>
    </section>
  );
}
