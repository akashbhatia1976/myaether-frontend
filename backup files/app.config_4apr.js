import 'dotenv/config';

export default {
  name: "MedicalApp",
  slug: "medicalapp",
  version: "1.0.0",
  extra: {
    API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
  },
};


