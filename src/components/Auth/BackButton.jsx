export default function BackButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="absolute top-8 left-8 text-sm underline hover:text-black"
    >
      ← Back
    </button>
  );
}
