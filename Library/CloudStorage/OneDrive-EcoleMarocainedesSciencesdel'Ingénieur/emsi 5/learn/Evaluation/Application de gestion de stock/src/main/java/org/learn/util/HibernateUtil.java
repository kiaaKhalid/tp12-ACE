package org.learn.util;


import org.hibernate.SessionFactory;
import org.hibernate.boot.registry.StandardServiceRegistryBuilder;
import org.hibernate.cfg.Configuration;
import org.hibernate.service.ServiceRegistry;

public class HibernateUtil {

    // L'unique instance de SessionFactory, créée une seule fois.
    private static final SessionFactory sessionFactory;

    /**
     * Bloc d'initialisation statique.
     * Ce code est exécuté une seule fois, au chargement de la classe par la JVM.
     * C'est ici que nous créons la SessionFactory.
     */
    static {
        try {
            // 1. Créer une nouvelle instance de Configuration
            Configuration configuration = new Configuration();

            // 2. Charger le fichier de configuration (hibernate.cfg.xml)
            // S'il est à la racine de src/main/resources, configure() suffit.
            configuration.configure();

            // 3. Construire le ServiceRegistry à partir de la configuration
            // C'est la manière moderne (depuis Hibernate 4.3+) de passer la config
            ServiceRegistry serviceRegistry = new StandardServiceRegistryBuilder()
                    .applySettings(configuration.getProperties()).build();

            // 4. Construire la SessionFactory à partir du ServiceRegistry
            sessionFactory = configuration.buildSessionFactory(serviceRegistry);

        } catch (Throwable ex) {
            // En cas d'échec (ex: DB non dispo, fichier config erroné)
            System.err.println("La création initiale de la SessionFactory a échoué. " + ex);
            throw new ExceptionInInitializerError(ex);
        }
    }

    /**
     * Méthode publique statique pour récupérer l'unique instance de SessionFactory.
     * * @return L'instance de SessionFactory
     */
    public static SessionFactory getSessionFactory() {
        return sessionFactory;
    }

    /**
     * Constructeur privé pour empêcher l'instanciation
     * (car c'est une classe utilitaire Singleton).
     */
    private HibernateUtil() {
    }
}
