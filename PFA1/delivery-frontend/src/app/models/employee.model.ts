export interface Employee {
  id?: number;
  nom: string;
  prenom: string;
  telephone: string;
  user?: {
    id?: number;
    email: string;
    password?: string;
    role: string;
  };
  missions?: Array<{
    id?: number;
    // Add other mission fields as needed
  }>;
  notifications?: Array<{
    id?: number;
    // Add other notification fields as needed
  }>;
}
