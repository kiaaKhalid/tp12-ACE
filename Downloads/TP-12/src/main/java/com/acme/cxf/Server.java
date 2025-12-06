package com.acme.cxf;

import com.acme.cxf.impl.HelloServiceImpl;
import org.apache.cxf.jaxws.JaxWsServerFactoryBean;

/**
 * Launcher class for the standard (non-secured) SOAP web service.
 * Starts an HTTP server and publishes the HelloService endpoint.
 * 
 * @author KiAA Khalid
 * @version 2.0
 * @since December 2025
 */
public class Server {
    
    /** Default port for the web service */
    private static final int SERVICE_PORT = 8080;
    
    /** Service endpoint path */
    private static final String SERVICE_PATH = "/services/hello";
    
    /** Complete service URL */
    private static final String SERVICE_URL = "http://localhost:" + SERVICE_PORT + SERVICE_PATH;

    /**
     * Main entry point for launching the standard web service.
     * Configures and starts the CXF server without security.
     * 
     * @param arguments command-line arguments (not used)
     */
    public static void main(String[] arguments) {
        System.out.println("==========================================");
        System.out.println("  Standard SOAP Web Service Launcher");
        System.out.println("  Developer: KiAA Khalid");
        System.out.println("==========================================");
        
        JaxWsServerFactoryBean serverFactory = new JaxWsServerFactoryBean();
        serverFactory.setServiceClass(HelloServiceImpl.class);
        serverFactory.setAddress(SERVICE_URL);

        serverFactory.create();

        System.out.println("\n✓ Server started successfully (non-secured mode)");
        System.out.println("✓ Service URL: " + SERVICE_URL);
        System.out.println("✓ WSDL available at: " + SERVICE_URL + "?wsdl");
        System.out.println("\nPress Ctrl+C to stop the server...\n");
    }
}