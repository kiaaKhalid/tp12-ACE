package com.acme.cxf.impl;

import com.acme.cxf.api.HelloService;
import com.acme.cxf.model.Person;
import jakarta.jws.WebService;

/**
 * Implementation of the HelloService web service interface.
 * Provides concrete implementations for greeting and person lookup operations.
 * 
 * @author KiAA Khalid
 * @version 2.0
 * @since December 2025
 */
@WebService(
        serviceName = "HelloService",
        portName = "HelloServicePort",
        endpointInterface = "com.acme.cxf.api.HelloService",
        targetNamespace = "http://api.cxf.acme.com/"
)
public class HelloServiceImpl implements HelloService {

    private static final String DEFAULT_GREETING_NAME = "Guest";
    private static final String GREETING_PREFIX = "Hello and welcome, ";
    
    /**
     * Generates a personalized greeting message.
     * Returns a default greeting if the provided name is null or empty.
     * 
     * @param userName the name of the user requesting the greeting
     * @return a personalized greeting message
     */
    @Override
    public String sayHello(String userName) {
        String effectiveName = (userName == null || userName.trim().isEmpty()) 
            ? DEFAULT_GREETING_NAME 
            : userName.trim();
        
        return GREETING_PREFIX + effectiveName + "!";
    }

    /**
     * Retrieves a person by their unique identifier.
     * Currently returns a simulated result for demonstration purposes.
     * In a production environment, this would query a database.
     * 
     * @param personId the unique identifier of the person
     * @return a Person object with simulated data
     */
    @Override
    public Person findPersonById(String personId) {
        // Simulate database lookup with mock data
        String mockFullName = "Ada Lovelace";
        int mockAge = 36;
        
        return new Person(personId, mockFullName, mockAge);
    }
}