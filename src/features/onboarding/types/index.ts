export interface OnboardingFormData {
  // Step 1: About You
  howYouHeardAboutUs: string;
  howYouHeardAboutUsOther: string;
  role: string;
  workType: string[];
  // Step 2: Your Company
  companySize: string;
  salesReps: string;
  teamMembers: Array<{ email: string; role: string }>;
}
