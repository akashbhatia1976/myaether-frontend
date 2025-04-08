import 'dotenv/config';

const isDev = process.env.NODE_ENV !== "production";

export default {
  name: "MedicalApp",
  slug: "medicalapp",
  version: "1.0.0",
  extra: {
    API_BASE_URL:
      process.env.EXPO_PUBLIC_API_BASE_URL ||
      (isDev
        ? "http://localhost:3000"
        : "https://medical-server-7fmg.onrender.com"),
  },
};

