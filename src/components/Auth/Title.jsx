import palmIcon from "../../assets/palmtree.png";

export default function Title({ view, setView }) {
  const isAuthView = view !== "landing";

  return (
    <div
      className={`absolute left-1/2 transform -translate-x-1/2 text-center transition-all duration-700
      ${isAuthView ? "top-16" : "top-1/2 -translate-y-1/2"}`}
    >
      <img src={palmIcon} alt="Palm" className="mx-auto mb-4 w-8 h-8" />

      <h1 className="text-4xl font-light">Plan. Explore.</h1>
      <h1 className="text-4xl font-semibold">Enjoy.</h1>

      {view === "landing" && (
        <div className="mt-10 flex flex-col gap-4 w-64 mx-auto">
          <button
            onClick={() => setView("login")}
            className="border border-gray-800 py-2 hover:bg-gray-200"
          >
            LOGIN
          </button>
          <button
            onClick={() => setView("register")}
            className="border border-gray-800 py-2 hover:bg-gray-200"
          >
            REGISTER
          </button>
        </div>
      )}
    </div>
  );
}
