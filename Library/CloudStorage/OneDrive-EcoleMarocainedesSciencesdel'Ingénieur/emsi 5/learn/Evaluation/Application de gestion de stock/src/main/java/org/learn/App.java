package org.learn;

import org.learn.classes.Produit;
import org.learn.service.ProduitService;

import java.util.List;

/**
 * Hello world!
 *
 */
public class App 
{
    public static void main( String[] args )
    {

        ProduitService ps = new ProduitService();

        // ... (votre code pour créer des produits, catégories, etc.) ...

        System.out.println("=========================================================");
        System.out.println("Test : Produits dont le prix est supérieur à 100 DH");
        System.out.println("=========================================================");

        // Appel de la méthode
        List<Produit> produitsChers = ps.findProduitsPrixSuperieur(100.0);

        if (produitsChers != null && !produitsChers.isEmpty()) {
            for (Produit p : produitsChers) {
                System.out.println(" - Référence: " + p.getReference() + " | Prix: " + p.getPrix() + " DH");
            }
        } else {
            System.out.println("Aucun produit trouvé avec un prix > 100 DH.");
        }
    }
}
