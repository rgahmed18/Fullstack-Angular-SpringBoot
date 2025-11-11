import { Injectable, NgZone } from '@angular/core';
import { Observable, of } from 'rxjs';

declare var google: any;

@Injectable({
  providedIn: 'root'
})
export class GooglePlacesService {
  // Morocco cities, neighborhoods, and common addresses for fallback
  private moroccanAddresses = [
    // Major Cities
    'Casablanca, Maroc',
    'Rabat, Maroc', 
    'Marrakech, Maroc',
    'Fès, Maroc',
    'Tanger, Maroc',
    'Agadir, Maroc',
    'Meknès, Maroc',
    'Oujda, Maroc',
    'Kenitra, Maroc',
    'Tétouan, Maroc',
    'Safi, Maroc',
    'Mohammedia, Maroc',
    'Khouribga, Maroc',
    'El Jadida, Maroc',
    'Béni Mellal, Maroc',
    'Nador, Maroc',
    'Salé, Maroc',
    'Temara, Maroc',
    'Larache, Maroc',
    'Ksar el-Kebir, Maroc',
    'Settat, Maroc',
    'Berrechid, Maroc',
    'Khemisset, Maroc',
    'Inezgane, Maroc',
    'Ouarzazate, Maroc',
    'Tiznit, Maroc',
    'Taroudant, Maroc',
    'Essaouira, Maroc',
    'Al Hoceima, Maroc',
    'Chefchaouen, Maroc',
    
    // Casablanca Neighborhoods
    'Maarif, Casablanca, Maroc',
    'Ain Diab, Casablanca, Maroc',
    'Anfa, Casablanca, Maroc',
    'Bourgogne, Casablanca, Maroc',
    'California, Casablanca, Maroc',
    'Centre Ville, Casablanca, Maroc',
    'Gauthier, Casablanca, Maroc',
    'Hay Hassani, Casablanca, Maroc',
    'Hay Mohammadi, Casablanca, Maroc',
    'Mers Sultan, Casablanca, Maroc',
    'Oulfa, Casablanca, Maroc',
    'Palmier, Casablanca, Maroc',
    'Racine, Casablanca, Maroc',
    'Sidi Bernoussi, Casablanca, Maroc',
    'Sidi Moumen, Casablanca, Maroc',
    'Twin Center, Casablanca, Maroc',
    'Val Fleuri, Casablanca, Maroc',
    'Ain Sebaa, Casablanca, Maroc',
    'Derb Ghallef, Casablanca, Maroc',
    'Hay Dakhla, Casablanca, Maroc',
    
    // Rabat Neighborhoods
    'Agdal, Rabat, Maroc',
    'Hassan, Rabat, Maroc',
    'Hay Riad, Rabat, Maroc',
    'Medina, Rabat, Maroc',
    'Ocean, Rabat, Maroc',
    'Souissi, Rabat, Maroc',
    'Yacoub El Mansour, Rabat, Maroc',
    'Aviation, Rabat, Maroc',
    'Diour Jamaa, Rabat, Maroc',
    'Hay Karima, Rabat, Maroc',
    'Les Orangers, Rabat, Maroc',
    'Ryad, Rabat, Maroc',
    'Takaddoum, Rabat, Maroc',
    'Youssoufia, Rabat, Maroc',
    
    // Marrakech Neighborhoods
    'Medina, Marrakech, Maroc',
    'Gueliz, Marrakech, Maroc',
    'Hivernage, Marrakech, Maroc',
    'Majorelle, Marrakech, Maroc',
    'Palmeraie, Marrakech, Maroc',
    'Semlalia, Marrakech, Maroc',
    'Targa, Marrakech, Maroc',
    'Daoudiate, Marrakech, Maroc',
    'Hay Essalam, Marrakech, Maroc',
    'M\'hamid, Marrakech, Maroc',
    'Sidi Ghanem, Marrakech, Maroc',
    'Amerchich, Marrakech, Maroc',
    
    // Common Landmarks and Areas
    'Aéroport Mohammed V, Casablanca, Maroc',
    'Gare Casa Port, Casablanca, Maroc',
    'Mall of Morocco, Casablanca, Maroc',
    'Morocco Mall, Casablanca, Maroc',
    'Université Hassan II, Casablanca, Maroc',
    'CHU Ibn Rochd, Casablanca, Maroc',
    'Corniche Ain Diab, Casablanca, Maroc',
    'Place Mohammed V, Casablanca, Maroc',
    'Boulevard Zerktouni, Casablanca, Maroc',
    'Avenue des FAR, Casablanca, Maroc',
    
    'Aéroport Rabat-Salé, Rabat, Maroc',
    'Gare Rabat Ville, Rabat, Maroc',
    'Université Mohammed V, Rabat, Maroc',
    'Palais Royal, Rabat, Maroc',
    'Tour Hassan, Rabat, Maroc',
    'Kasbah des Oudayas, Rabat, Maroc',
    'Avenue Mohammed V, Rabat, Maroc',
    'Mega Mall, Rabat, Maroc',
    
    'Aéroport Marrakech Menara, Marrakech, Maroc',
    'Gare Marrakech, Marrakech, Maroc',
    'Place Jemaa el-Fna, Marrakech, Maroc',
    'Jardin Majorelle, Marrakech, Maroc',
    'Palais de la Bahia, Marrakech, Maroc',
    'Koutoubia, Marrakech, Maroc',
    'Menara Mall, Marrakech, Maroc',
    'Al Mazar Mall, Marrakech, Maroc',
    
    // Industrial and Business Areas
    'Zone Industrielle Ain Sebaa, Casablanca, Maroc',
    'Zone Industrielle Sidi Bernoussi, Casablanca, Maroc',
    'Technopolis Rabat, Rabat, Maroc',
    'Zona Franca, Tanger, Maroc',
    'Port de Casablanca, Casablanca, Maroc',
    'Port de Tanger Med, Tanger, Maroc',
    'Aéroport Tanger Ibn Battouta, Tanger, Maroc',
    
    // Universities and Hospitals
    'Université Cadi Ayyad, Marrakech, Maroc',
    'Université Sidi Mohamed Ben Abdellah, Fès, Maroc',
    'Université Abdelmalek Essaadi, Tanger, Maroc',
    'CHU Hassan II, Fès, Maroc',
    'Hôpital Militaire, Rabat, Maroc',
    'Clinique Al Madina, Casablanca, Maroc'
  ];

  constructor(private ngZone: NgZone) {
  }

  getPlacePredictions(input: string): Observable<any[]> {
    return new Observable(observer => {
      if (!input.trim()) {
        observer.next([]);
        observer.complete();
        return;
      }

      // Simple fallback: filter Morocco addresses based on input
      const filteredAddresses = this.moroccanAddresses
        .filter(address => address.toLowerCase().includes(input.toLowerCase()))
        .slice(0, 8) // Increased to 8 suggestions for better variety
        .map((address, index) => ({
          place_id: `morocco_${index}_${Date.now()}`,
          description: address,
          structured_formatting: {
            main_text: address.split(',')[0],
            secondary_text: address.includes(',') ? address.split(',').slice(1).join(',').trim() : 'Maroc'
          }
        }));

      this.ngZone.run(() => {
        observer.next(filteredAddresses);
        observer.complete();
      });
    });
  }

  getPlaceDetails(placeId: string): Observable<any> {
    return new Observable(observer => {
      // Simple fallback for place details - just return the address name
      const addressName = this.moroccanAddresses.find((address: string) => 
        placeId.includes('morocco_')
      ) || 'Casablanca, Maroc';

      this.ngZone.run(() => {
        const placeData = {
          name: addressName.split(',')[0],
          formatted_address: addressName,
          geometry: {
            location: { lat: 33.5731, lng: -7.5898 } // Default to Casablanca coordinates
          }
        };
        observer.next(placeData);
        observer.complete();
      });
    });
  }
}
