import Navbar from "./Navbar";
import RecentItineraries from "./RecentItineraries";
import SavedDestinations from "./SavedDestinations";
import MapActions from "./MapActions";
import "../../styles/themes.css";

export default function Home() {
  return (
    <>
      {/* Navbar */}
      <Navbar />

      {/* Main page content */}
      <div className="page p-6">
        {/* Greeting */}
        <div className="flex-between mb-10">
          <h1 className="text-4xl font-semibold">Hello Ann!</h1>
        </div>

        {/* Main Content */}
        <div className="grid-3">
          <RecentItineraries />

          <SavedDestinations />
            <MapActions />
        </div>
      </div>
    </>
  );
}
