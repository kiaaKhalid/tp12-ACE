package com.acme.cxf.api;

import com.acme.cxf.model.Person;
import jakarta.jws.WebMethod;
import jakarta.jws.WebParam;
import jakarta.jws.WebResult;
import jakarta.jws.WebService;

/**
 * Web Service interface for greeting and person management operations.
 * Defines the contract for SOAP-based web service methods.
 * 
 * @author KiAA Khalid
 * @version 2.0
 * @since December 2025
 */
@WebService(targetNamespace = "http://api.cxf.acme.com/")
public interface HelloService {

    /**
     * Generates a personalized greeting message for the specified individual.
     * If no name is provided, returns a default greeting.
     * 
     * @param userName the name of the person to greet (can be null)
     * @return a greeting message as a String
     */
    @WebMethod(operationName = "SayHello")
    @WebResult(name = "greeting")
    String sayHello(@WebParam(name = "name") String userName);

    /**
     * Searches and retrieves a person entity by their unique identifier.
     * This method simulates a database lookup operation.
     * 
     * @param personId the unique identifier of the person to find
     * @return a Person object containing the person's details
     */
    @WebMethod(operationName = "FindPerson")
    @WebResult(name = "person")
    Person findPersonById(@WebParam(name = "id") String personId);
}