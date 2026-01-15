import palmIcon from "../../assets/palmtree.png";

export default function Title({ view }) {
  const isAuthView = view !== "landing";

  return (
    <div className="auth-title" style={{ top: isAuthView ? '4rem' : '7rem' }}>
      <img src={palmIcon} alt="Palm" className="auth-image" />

      <h1 className="auth-title-large" style={{ fontWeight: 300 }}>Plan. Explore.</h1>
      <h1 className="auth-title-large" style={{ fontWeight: 700 }}>Enjoy.</h1>
    </div>
  );
}
