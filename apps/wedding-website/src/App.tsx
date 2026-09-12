import { Route, Routes } from "react-router-dom";
import HomePage from "@/pages/marketing/HomePage";
import AboutPage from "@/pages/marketing/AboutPage";
import ServicesPage from "@/pages/marketing/ServicesPage";
import JournalPage from "@/pages/marketing/JournalPage";
import JournalPostPage from "@/pages/marketing/JournalPostPage";
import ContactPage from "@/pages/marketing/ContactPage";
import CoupleSitePage from "@/pages/CoupleSitePage";

/** ovutor.com's own marketing site (Home/About/Services/Journal/Contact) lives at a handful of
 * reserved paths; everything else falls through to `/:slug`, which looks up a couple's own
 * published wedding site — same behavior the whole app used to have before the marketing site
 * existed. This means none of the five reserved words below can ever be issued as a couple's
 * site slug (ClientService's slug generation should steer clear of them). */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/journal" element={<JournalPage />} />
      <Route path="/journal/:postSlug" element={<JournalPostPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/:slug" element={<CoupleSitePage />} />
    </Routes>
  );
}
