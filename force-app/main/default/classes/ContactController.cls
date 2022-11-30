public with sharing class ContactController {
    

    @AuraEnabled (cacheable=true)
    public static List<Contact> getContactList(){
        return [
        SELECT 
        ID,
        Name,
        FirstName,
        LastName,
        Email,
        Phone,
        Picture__c
        FROM Contact 
        ORDER BY  Name
    //     WHERE Picture__c!=Null
    //     WITH SECURITY_ENFORCED
    //    LIMIT 100
        ];
    }

    @AuraEnabled(cacheable=true)
    public static List<Contact> findContacts(String searchText) {
        String key = '%' + searchText + '%';
        return [
            SELECT Id, Name, Title, Phone, Email, Picture__c
            FROM Contact
            WHERE Name LIKE :key //AND Picture__c != null
            WITH SECURITY_ENFORCED
            // LIMIT 10
        ];
    }
}
