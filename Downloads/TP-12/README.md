# SOAP Web Services with Apache CXF

## Project Overview
Enterprise-grade SOAP Web Services implementation using Apache CXF framework.

**Developer:** KiAA Khalid  
**Version:** 2.0-SNAPSHOT  
**Last Updated:** December 2025

## Features
- ✅ Standard SOAP Web Service implementation
- ✅ Secured Web Service with WS-Security (UsernameToken)
- ✅ RESTful client implementation
- ✅ Complete Javadoc documentation
- ✅ Maven-based project structure

## Technologies
- Java 17
- Apache CXF 4.0.3
- Jakarta XML Binding (JAXB)
- WS-Security (WSS4J)
- Maven

## How to Run

### Start the Standard Server
```bash
mvn compile exec:java -Dexec.mainClass="com.khalid.webservices.launcher.StandardWebServiceLauncher"
```

### Start the Secured Server
```bash
mvn compile exec:java -Dexec.mainClass="com.khalid.webservices.launcher.SecuredWebServiceLauncher"
```

### Run the Client
```bash
mvn compile exec:java -Dexec.mainClass="com.khalid.webservices.consumer.WebServiceConsumer"
```

## Author
Developed with ❤️ by **KiAA Khalid**

## License
Educational Project - 2025
