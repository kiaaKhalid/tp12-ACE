package com.acme.cxf;

import com.acme.cxf.impl.HelloServiceImpl;
import com.acme.cxf.security.UTPasswordCallback;
import org.apache.cxf.endpoint.Server;
import org.apache.cxf.jaxws.JaxWsServerFactoryBean;
import org.apache.cxf.ws.security.wss4j.WSS4JInInterceptor;
import java.util.HashMap;
import java.util.Map;

/**
 * Launcher class for the secured SOAP web service with WS-Security.
 * Implements UsernameToken authentication for secure access.
 * 
 * @author KiAA Khalid
 * @version 2.0
 * @since December 2025
 */
public class SecureServer {
    
    /** Default port for the secured web service */
    private static final int SECURE_PORT = 8080;
    
    /** Secured service endpoint path */
    private static final String SECURE_PATH = "/services/hello-secure";
    
    /** Complete secured service URL */
    private static final String SECURE_SERVICE_URL = "http://localhost:" + SECURE_PORT + SECURE_PATH;
    
    /** Default username for authentication */
    private static final String AUTH_USERNAME = "student";
    
    /** Default password for authentication */
    private static final String AUTH_PASSWORD = "secret123";

    /**
     * Main entry point for launching the secured web service.
     * Configures WS-Security with UsernameToken authentication.
     * 
     * @param commandLineArgs command-line arguments (not used)
     */
    public static void main(String[] commandLineArgs) {
        System.out.println("==========================================");
        System.out.println("  Secured SOAP Web Service Launcher");
        System.out.println("  Developer: KiAA Khalid");
        System.out.println("==========================================");

        // Configure security properties for incoming requests
        Map<String, Object> securityProperties = configureSecurityProperties();
        
        // Create the WS-Security interceptor
        WSS4JInInterceptor securityInterceptor = new WSS4JInInterceptor(securityProperties);

        // Configure and create the server factory
        JaxWsServerFactoryBean serverFactory = new JaxWsServerFactoryBean();
        serverFactory.setServiceClass(HelloServiceImpl.class);
        serverFactory.setAddress(SECURE_SERVICE_URL);

        Server securedServer = serverFactory.create();

        // Attach the security interceptor to the endpoint
        securedServer.getEndpoint().getInInterceptors().add(securityInterceptor);

        System.out.println("\n✓ Secured server started successfully");
        System.out.println("✓ Security: WS-Security UsernameToken (PlainText)");
        System.out.println("✓ Service URL: " + SECURE_SERVICE_URL);
        System.out.println("✓ WSDL available at: " + SECURE_SERVICE_URL + "?wsdl");
        System.out.println("✓ Valid credentials: " + AUTH_USERNAME + " / " + AUTH_PASSWORD);
        System.out.println("\nPress Ctrl+C to stop the server...\n");
    }

    /**
     * Configures the security properties for WS-Security authentication.
     * Sets up UsernameToken validation with password callback.
     * 
     * @return a map containing security configuration properties
     */
    private static Map<String, Object> configureSecurityProperties() {
        Map<String, Object> securityConfig = new HashMap<>();
        
        // Specify the required security action
        securityConfig.put("action", "UsernameToken");
        
        // Password type: plain text
        securityConfig.put("passwordType", "PasswordText");
        
        // Configure user credentials repository
        Map<String, String> userCredentials = new HashMap<>();
        userCredentials.put(AUTH_USERNAME, AUTH_PASSWORD);
        
        // Set the password callback handler
        securityConfig.put("passwordCallbackRef", new UTPasswordCallback(userCredentials));
        
        return securityConfig;
    }
}