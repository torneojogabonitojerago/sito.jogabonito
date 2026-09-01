export type RegistrationStatus = 'pending' | 'approved' | 'rejected';

export interface TeamRegistration {
  id: string;
  teamName: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  playersCount: number | null;
  notes: string;
  status: RegistrationStatus;
  createdAt: string;
}

export interface RegistrationInput {
  teamName: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  playersCount: number | null;
  notes: string;
}
