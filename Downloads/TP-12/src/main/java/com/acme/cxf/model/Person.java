package com.acme.cxf.model;

import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;

/**
 * Represents a person entity in the system.
 * This class is used for XML serialization/deserialization in SOAP operations.
 * 
 * @author KiAA Khalid
 * @version 2.0
 * @since December 2025
 */
@XmlRootElement(name = "Person")
public class Person {
    
    /** Unique identifier for the person */
    private String personIdentifier;
    
    /** Full name of the person */
    private String fullName;
    
    /** Age in years */
    private int yearsOld;

    /**
     * Default no-argument constructor.
     * Required by JAXB for XML deserialization.
     */
    public Person() {
        // No-args constructor for JAXB
    }

    /**
     * Constructs a new Person with specified attributes.
     * 
     * @param personIdentifier the unique identifier for this person
     * @param fullName the full name of the person
     * @param yearsOld the age of the person in years
     */
    public Person(String personIdentifier, String fullName, int yearsOld) {
        this.personIdentifier = personIdentifier;
        this.fullName = fullName;
        this.yearsOld = yearsOld;
    }

    /**
     * Retrieves the person's unique identifier.
     * 
     * @return the person identifier as a String
     */
    @XmlElement
    public String getId() {
        return personIdentifier;
    }

    /**
     * Sets the person's unique identifier.
     * 
     * @param personIdentifier the identifier to set
     */
    public void setId(String personIdentifier) {
        this.personIdentifier = personIdentifier;
    }

    /**
     * Retrieves the person's full name.
     * 
     * @return the full name as a String
     */
    @XmlElement
    public String getName() {
        return fullName;
    }

    /**
     * Sets the person's full name.
     * 
     * @param fullName the full name to set
     */
    public void setName(String fullName) {
        this.fullName = fullName;
    }

    /**
     * Retrieves the person's age in years.
     * 
     * @return the age as an integer
     */
    @XmlElement
    public int getAge() {
        return yearsOld;
    }

    /**
     * Sets the person's age in years.
     * 
     * @param yearsOld the age to set
     */
    public void setAge(int yearsOld) {
        this.yearsOld = yearsOld;
    }
    
    /**
     * Returns a string representation of the Person object.
     * 
     * @return formatted string with person details
     */
    @Override
    public String toString() {
        return String.format("Person[id=%s, name=%s, age=%d]", 
            personIdentifier, fullName, yearsOld);
    }
}