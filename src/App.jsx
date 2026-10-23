import Homepage from "./pages/Homepage/Homepage";
import StudentProfileOnboarding from "./pages/StudentProfile/StudentProfileOnboarding";

export default function App() {
  if (window.location.pathname === "/onboarding") {
    return <StudentProfileOnboarding />;
  }
  return <Homepage />;
}

