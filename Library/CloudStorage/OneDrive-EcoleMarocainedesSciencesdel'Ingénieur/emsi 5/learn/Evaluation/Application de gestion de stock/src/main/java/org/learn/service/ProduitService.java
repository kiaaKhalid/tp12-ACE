package org.learn.service;


import java.util.Date;
import java.util.List;
import org.learn.classes.Categorie;
import org.learn.classes.Commande;
import org.learn.classes.LigneCommande;
import org.learn.classes.Produit;
import org.learn.dao.IDao;
import org.learn.util.HibernateUtil;
import org.hibernate.HibernateException;
import org.hibernate.Session;
import org.hibernate.Transaction;
import org.hibernate.query.Query;

public class ProduitService implements IDao<Produit> {

    @Override
    public boolean create(Produit o) {
        Session session = null;
        Transaction tx = null;
        try {
            session = HibernateUtil.getSessionFactory().openSession();
            tx = session.beginTransaction();
            session.save(o);
            tx.commit();
            return true;
        } catch (HibernateException e) {
            if (tx != null) tx.rollback();
            e.printStackTrace(); return false;
        } finally {
            if (session != null) session.close();
        }
    }

    @Override
    public boolean delete(Produit o) {
        Session session = null;
        Transaction tx = null;
        try {
            session = HibernateUtil.getSessionFactory().openSession();
            tx = session.beginTransaction();
            session.delete(o);
            tx.commit();
            return true;
        } catch (HibernateException e) {
            if (tx != null) tx.rollback();
            e.printStackTrace(); return false;
        } finally {
            if (session != null) session.close();
        }
    }

    @Override
    public boolean update(Produit o) {
        Session session = null;
        Transaction tx = null;
        try {
            session = HibernateUtil.getSessionFactory().openSession();
            tx = session.beginTransaction();
            session.update(o);
            tx.commit();
            return true;
        } catch (HibernateException e) {
            if (tx != null) tx.rollback();
            e.printStackTrace(); return false;
        } finally {
            if (session != null) session.close();
        }
    }

    @Override
    public Produit findById(int id) {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            return session.get(Produit.class, id);
        } catch (HibernateException e) {
            e.printStackTrace();
            return null;
        }
    }

    @Override
    public List<Produit> findAll() {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Query<Produit> query = session.createQuery("FROM Produit", Produit.class);
            return query.list();
        } catch (HibernateException e) {
            e.printStackTrace();
            return null;
        }
    }

    // =========================================================================
    // MÉTHODES SPÉCIFIQUES DEMANDÉES DANS L'EXERCICE
    // =========================================================================

    /**
     * Affiche la liste des produits par catégorie.
     */
    public List<Produit> findProduitsParCategorie(Categorie c) {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            // Utilisation d'une requête HQL (Hibernate Query Language)
            Query<Produit> query = session.createQuery("FROM Produit p WHERE p.categorie = :cat", Produit.class);
            query.setParameter("cat", c);
            return query.list();
        } catch (HibernateException e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * Affiche les produits commandés entre deux dates.
     */
    public List<Produit> findProduitsEntreDeuxDates(Date dateDebut, Date dateFin) {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            // Requête HQL avec des jointures
            String hql = "SELECT DISTINCT p " +
                    "FROM Produit p " +
                    "JOIN p.ligneCommandes lc " +
                    "JOIN lc.commande c " +
                    "WHERE c.date BETWEEN :dateDebut AND :dateFin";

            Query<Produit> query = session.createQuery(hql, Produit.class);
            query.setParameter("dateDebut", dateDebut);
            query.setParameter("dateFin", dateFin);
            return query.list();
        } catch (HibernateException e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * Affiche les produits commandés dans une commande donnée, en respectant le format.
     */
    public void afficherProduitsPourCommande(Commande c) {
        // On doit s'assurer que la collection "ligneCommandes" est chargée.
        // La façon la plus sûre est de re-charger la commande dans une nouvelle session
        // pour éviter une LazyInitializationException si 'c' vient d'une session fermée.

        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Commande commandeFraiche = session.get(Commande.class, c.getId());

            if (commandeFraiche == null) {
                System.out.println("Commande introuvable.");
                return;
            }

            // Formatage de la date (simple)
            java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("dd MMMM yyyy");

            // Affichage de l'en-tête
            System.out.println("-------------------------------------------------");
            System.out.println("Commande : " + commandeFraiche.getId() + "\t Date : " + sdf.format(commandeFraiche.getDate()));
            System.out.println("Liste des produits :");
            System.out.println("Référence\tPrix\t\tQuantité");
            System.out.println("-------------------------------------------------");

            // Boucle sur les lignes de commande
            List<LigneCommande> lignes = commandeFraiche.getLigneCommandes();
            if(lignes.isEmpty()){
                System.out.println(" (Aucun produit dans cette commande)");
            } else {
                for (LigneCommande lc : lignes) {
                    Produit p = lc.getProduit(); // Hibernate va chercher le produit associé
                    System.out.println(p.getReference() + "\t\t" + p.getPrix() + " DH\t" + lc.getQuantite());
                }
            }
            System.out.println("-------------------------------------------------");

        } catch (HibernateException e) {
            e.printStackTrace();
        }
    }

    public List<Produit> findProduitsPrixSuperieur(double prixMin) {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {

            // Appel de la @NamedQuery définie dans l'entité Produit
            Query<Produit> query = session.createNamedQuery("Produit.findAbovePrice", Produit.class);

            // Définir le paramètre
            query.setParameter("prixMin", prixMin);

            return query.list();

        } catch (HibernateException e) {
            e.printStackTrace();
            return null;
        }
    }
}
