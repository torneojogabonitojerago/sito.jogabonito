import type { FormFieldType } from '@/data/tournament';

export type RegistrationStatus = 'pending' | 'approved' | 'rejected';

export interface RegistrationAnswer {
  label: string;
  value: string;
  type?: FormFieldType;
}

export interface TeamRegistration {
  id: string;
  /** modulo da cui arriva (null per le iscrizioni fatte col vecchio form fisso) */
  formId: string | null;
  /** primo campo compilato, di solito il nome della squadra */
  title: string;
  answers: RegistrationAnswer[];
  status: RegistrationStatus;
  createdAt: string;
}

export interface RegistrationInput {
  formId: string;
  title: string;
  answers: RegistrationAnswer[];
}
