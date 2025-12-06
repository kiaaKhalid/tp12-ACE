package com.acme.cxf.client;

import com.acme.cxf.api.HelloService;
import com.acme.cxf.model.Person;
import javax.xml.namespace.QName;
import jakarta.xml.ws.Service;
import java.net.URL;

/**
 * Client application for consuming the HelloService SOAP web service.
 * Demonstrates how to invoke remote web service methods.
 * 
 * @author KiAA Khalid
 * @version 2.0
 * @since December 2025
 */
public class ClientDemo {
    
    /** Target namespace for the web service */
    private static final String SERVICE_NAMESPACE = "http://api.cxf.acme.com/";
    
    /** Service name as defined in WSDL */
    private static final String SERVICE_NAME = "HelloService";
    
    /** WSDL location URL */
    private static final String WSDL_LOCATION = "http://localhost:8080/services/hello?wsdl";
    
    /** Test person ID for demonstration */
    private static final String TEST_PERSON_ID = "P-777";
    
    /** Test client name for demonstration */
    private static final String TEST_CLIENT_NAME = "KiAA Khalid";

    /**
     * Main entry point for the web service client.
     * Connects to the service and invokes its operations.
     * 
     * @param programArgs command-line arguments (not used)
     * @throws Exception if any error occurs during service invocation
     */
    public static void main(String[] programArgs) throws Exception {
        System.out.println("==========================================");
        System.out.println("  SOAP Web Service Client");
        System.out.println("  Developer: KiAA Khalid");
        System.out.println("==========================================\n");

        // Create service proxy
        HelloService serviceProxy = createServiceProxy();
        
        // Execute test operations
        testGreetingOperation(serviceProxy);
        testPersonLookupOperation(serviceProxy);
        
        System.out.println("\n==========================================");
        System.out.println("  All operations completed successfully!");
        System.out.println("==========================================");
    }

    /**
     * Creates and configures a proxy for the HelloService web service.
     * 
     * @return a HelloService proxy instance
     * @throws Exception if service creation fails
     */
    private static HelloService createServiceProxy() throws Exception {
        System.out.println("→ Connecting to WSDL: " + WSDL_LOCATION);
        
        URL wsdlUrl = new URL(WSDL_LOCATION);
        QName serviceQName = new QName(SERVICE_NAMESPACE, SERVICE_NAME);

        Service webService = Service.create(wsdlUrl, serviceQName);
        HelloService proxy = webService.getPort(HelloService.class);
        
        System.out.println("✓ Service proxy created successfully\n");
        
        return proxy;
    }

    /**
     * Tests the greeting operation of the web service.
     * 
     * @param serviceProxy the service proxy to use
     */
    private static void testGreetingOperation(HelloService serviceProxy) {
        System.out.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        System.out.println("  TEST 1: Greeting Operation");
        System.out.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        System.out.println("→ Invoking sayHello(\"" + TEST_CLIENT_NAME + "\")...");
        
        String greetingResponse = serviceProxy.sayHello(TEST_CLIENT_NAME);
        
        System.out.println("✓ Response received: " + greetingResponse);
        System.out.println();
    }

    /**
     * Tests the person lookup operation of the web service.
     * 
     * @param serviceProxy the service proxy to use
     */
    private static void testPersonLookupOperation(HelloService serviceProxy) {
        System.out.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        System.out.println("  TEST 2: Person Lookup Operation");
        System.out.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        System.out.println("→ Invoking findPersonById(\"" + TEST_PERSON_ID + "\")...");
        
        Person foundPerson = serviceProxy.findPersonById(TEST_PERSON_ID);
        
        System.out.println("✓ Person found!");
        System.out.println("  • ID: " + foundPerson.getId());
        System.out.println("  • Name: " + foundPerson.getName());
        System.out.println("  • Age: " + foundPerson.getAge() + " years");
        System.out.println();
    }
}