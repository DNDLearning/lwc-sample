public with sharing class AccountDataService {
    
    @AuraEnabled(cacheable=true)
    public static List<Account> getAccountByType(string type) {
        string query = 'SELECT Id, Name, Type, Phone, Industry, BillingAddress, AnnualRevenue FROM Account ';
        if (string.isNotBlank(type)) {
            query += ' WHERE Type = :type '; //  WITH SECURITY_ENFORCED
        }
        query += ' ORDER BY Name';

        return Database.query(query);

        // return [SELECT Id, Name, Type, Phone, Industry, BillingAddress, AnnualRevenue
        //           FROM Account
        //          WHERE Type = :type WITH SECURITY_ENFORCED
        //          ORDER BY Name];
    }

}