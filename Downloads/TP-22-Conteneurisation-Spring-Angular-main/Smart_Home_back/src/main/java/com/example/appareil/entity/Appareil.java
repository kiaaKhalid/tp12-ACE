package com.example.appareil.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Entité représentant un appareil connecté dans le système Smart Home.
 * Cette classe mappe la table 'appareil' dans la base de données.
 * 
 * <p>Un appareil possède les caractéristiques suivantes:</p>
 * <ul>
 *   <li>Un identifiant unique généré automatiquement</li>
 *   <li>Un libellé descriptif</li>
 *   <li>Une description détaillée</li>
 *   <li>Un état de fonctionnement (actif/inactif)</li>
 *   <li>Une image représentative</li>
 *   <li>Une catégorie d'appartenance</li>
 * </ul>
 * 
 * @author SmartHome Development Team
 * @version 2.0.0
 * @see Categorie
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Appareil {

    /**
     * Identifiant unique de l'appareil.
     * Généré automatiquement par la stratégie IDENTITY.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long identifiant;

    /**
     * Libellé ou nom de l'appareil.
     * Exemple: "Lampe salon", "Thermostat cuisine"
     */
    private String nomAppareil;

    /**
     * Description détaillée de l'appareil.
     * Contient les informations complémentaires sur l'appareil.
     */
    private String descriptionAppareil;

    /**
     * État de fonctionnement de l'appareil.
     * {@code true} si l'appareil est allumé, {@code false} sinon.
     */
    private boolean statutActif;

    /**
     * Image de l'appareil encodée en Base64.
     * Stockée en format LONGTEXT pour supporter les grandes images.
     */
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String imageBase64;

    /**
     * Catégorie à laquelle appartient l'appareil.
     * Relation Many-to-One avec l'entité Categorie.
     */
    @ManyToOne
    private Categorie categorieAppareil;

    /**
     * Récupère l'identifiant de l'appareil.
     * @return l'identifiant unique de l'appareil
     */
    public long getId() {
        return identifiant;
    }

    /**
     * Récupère le libellé de l'appareil.
     * @return le nom de l'appareil
     */
    public String getLabel() {
        return nomAppareil;
    }

    /**
     * Récupère la description de l'appareil.
     * @return la description détaillée
     */
    public String getDescription() {
        return descriptionAppareil;
    }

    /**
     * Vérifie si l'appareil est actif.
     * @return {@code true} si actif, {@code false} sinon
     */
    public boolean isState() {
        return statutActif;
    }

    /**
     * Définit l'état de l'appareil.
     * @param nouveauStatut le nouveau statut à appliquer
     */
    public void setState(boolean nouveauStatut) {
        this.statutActif = nouveauStatut;
    }

    /**
     * Récupère l'image de l'appareil.
     * @return l'image encodée en Base64
     */
    public String getPhoto() {
        return imageBase64;
    }

    /**
     * Récupère la catégorie de l'appareil.
     * @return la catégorie associée
     */
    public Categorie getCategorie() {
        return categorieAppareil;
    }

    /**
     * Définit la catégorie de l'appareil.
     * @param nouvelleCat la nouvelle catégorie à associer
     */
    public void setCategorie(Categorie nouvelleCat) {
        this.categorieAppareil = nouvelleCat;
    }

}
