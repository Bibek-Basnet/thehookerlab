export type OnlineRegistration = {
  role: string;
  level: string;
  experience: string;
  focusAreas: string[];
  goal?: string;
  name: string;
  email: string;
  phone?: string;
  location: string;
  privacyAccepted: true;
  acceptedAt: string;
  source: "online-programme";
};

/* The backend team provides this endpoint. Override it per environment
   with NEXT_PUBLIC_REGISTRATION_ENDPOINT in .env.local. */
const ENDPOINT =
  process.env.NEXT_PUBLIC_REGISTRATION_ENDPOINT ?? "/api/online-registrations";

export async function submitRegistration(
  data: OnlineRegistration
): Promise<void> {
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Registration failed with status ${response.status}`);
  }
}