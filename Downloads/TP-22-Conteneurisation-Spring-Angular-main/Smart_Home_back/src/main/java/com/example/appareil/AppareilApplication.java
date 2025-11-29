package com.example.appareil;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Classe principale de l'application Smart Home.
 * Cette application permet la gestion des appareils connectés dans une maison intelligente.
 * 
 * @author SmartHome Development Team
 * @version 2.0.0
 * @since 2024-01-15
 */
@SpringBootApplication
public class AppareilApplication {

    /**
     * Point d'entrée principal de l'application Spring Boot.
     * Initialise le contexte Spring et démarre le serveur embarqué.
     * 
     * @param applicationArguments les arguments passés en ligne de commande
     */
    public static void main(String[] applicationArguments) {
        SpringApplication.run(AppareilApplication.class, applicationArguments);
    }

}
