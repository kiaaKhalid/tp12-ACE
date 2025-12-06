package com.acme.cxf.security;

import org.apache.wss4j.common.ext.WSPasswordCallback;
import javax.security.auth.callback.*;
import java.io.IOException;
import java.util.Map;

/**
 * Custom callback handler for UsernameToken authentication in WS-Security.
 * Validates user credentials against a predefined map of users and passwords.
 * 
 * @author KiAA Khalid
 * @version 2.0
 * @since December 2025
 */
public class UTPasswordCallback implements CallbackHandler {

    /** Map storing username-password pairs for authentication */
    private final Map<String, String> credentialsRepository;

    /**
     * Constructs a new password callback handler with the specified user credentials.
     * 
     * @param credentialsRepository a map containing username as key and password as value
     */
    public UTPasswordCallback(Map<String, String> credentialsRepository) {
        this.credentialsRepository = credentialsRepository;
    }

    /**
     * Handles callback requests to validate user credentials.
     * Processes WSPasswordCallback instances and sets passwords for valid users.
     * 
     * @param callbackArray array of callback objects to process
     * @throws IOException if an I/O error occurs during callback handling
     * @throws UnsupportedCallbackException if the callback type is not supported
     */
    @Override
    public void handle(Callback[] callbackArray) throws IOException, UnsupportedCallbackException {
        for (Callback currentCallback : callbackArray) {
            if (currentCallback instanceof WSPasswordCallback passwordCallback) {
                
                String requestedUsername = passwordCallback.getIdentifier();
                String storedPassword = credentialsRepository.get(requestedUsername);

                if (storedPassword != null) {
                    passwordCallback.setPassword(storedPassword);
                    return; // Password successfully set for valid user
                } else {
                    // User not found in credentials repository
                    throw new UnsupportedCallbackException(
                        currentCallback, 
                        "Unknown user: " + requestedUsername
                    );
                }
            }
        }
    }
}