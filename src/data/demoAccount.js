import { blankProfile } from "../services/profile";

// Public sample credentials for the local prototype, not a real account.
export const DEMO_EMAIL = "demo@msbahub.example";
export const DEMO_PASSWORD = "Marshall2027!";
export const createDemoProfile = () => ({
  ...blankProfile(),
  name: "Alex Morgan",
  email: DEMO_EMAIL,
  experience: "1–3 years of experience",
  skills: ["Python", "SQL"],
  interests: ["AI & technology"],
  roles: ["Data analyst"],
  industries: ["Technology", "Consulting"],
  learning: ["LLMs & generative AI"],
  hours: 6,
  topics: ["AI & machine learning"],
  types: ["Workshops", "Networking mixers"],
  formats: ["In person", "Online"],
  availability: ["Mon evening", "Wed evening", "Sat morning"],
});
