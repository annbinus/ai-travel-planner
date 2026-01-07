import palmIcon from "../../assets/palmtree.png";

export default function Title({ view }) {
  const isAuthView = view !== "landing";

  return (
    <div
      className={`absolute left-1/2 transform -translate-x-1/2 text-center transition-all duration-700
        ${isAuthView ? "top-16" : "top-28"}`} // <-- changed from top-1/2 to top-28
    >
      <img src={palmIcon} alt="Palm" className="mx-auto mb-4 w-8 h-8" />

      <h1 className="text-4xl font-light">Plan. Explore.</h1>
      <h1 className="text-4xl font-semibold">Enjoy.</h1>
    </div>
  );
}
