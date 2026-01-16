import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Hero from "./components/Hero";
import Auth from "./components/Auth/Auth";
import Home from "./components/Home/Home";
import ItineraryPage from "./components/Home/ItineraryPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Auth />} />
        <Route path="/home" element={<Home />} />
        <Route path="/itinerary/:itineraryId" element={<ItineraryPage />} />
      </Routes>
    </Router>
  );
}

export default App;
