export interface Vehicle {
  id: number;
  immatriculation: string;
  marque: string;
  modele: string;
  capacite: number;
  disponible: boolean;
  chauffeur?: {
    id: number;
    nom: string;
    prenom: string;
  };
}
