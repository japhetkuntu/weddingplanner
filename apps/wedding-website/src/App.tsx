import { Route, Routes } from "react-router-dom";
import HomePage from "@/pages/marketing/HomePage";
import WhatWeDoPage from "@/pages/marketing/WhatWeDoPage";
import OurPlanningPackagesPage from "@/pages/marketing/OurPlanningPackagesPage";
import OurApproachPage from "@/pages/marketing/OurApproachPage";
import OurJournalPage from "@/pages/marketing/OurJournalPage";
import OurJournalPostPage from "@/pages/marketing/OurJournalPostPage";
import ConnectWithUsPage from "@/pages/marketing/ConnectWithUsPage";
import CoupleSitePage from "@/pages/CoupleSitePage";

/** ovutor.com's own marketing site (Home / What We Do / Our Planning Packages / Our Approach /
 * Our Journal / Connect with Us) lives at a handful of reserved paths; everything else falls
 * through to `/:slug`, which looks up a couple's own published wedding site — same behavior the
 * whole app used to have before the marketing site existed. This means none of the reserved path
 * segments below can ever be issued as a couple's site slug (ClientService's slug generation
 * should steer clear of them). */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/what-we-do" element={<WhatWeDoPage />} />
      <Route path="/our-planning-packages" element={<OurPlanningPackagesPage />} />
      <Route path="/our-approach" element={<OurApproachPage />} />
      <Route path="/our-journal" element={<OurJournalPage />} />
      <Route path="/our-journal/:postSlug" element={<OurJournalPostPage />} />
      <Route path="/connect-with-us" element={<ConnectWithUsPage />} />
      <Route path="/:slug" element={<CoupleSitePage />} />
    </Routes>
  );
}
