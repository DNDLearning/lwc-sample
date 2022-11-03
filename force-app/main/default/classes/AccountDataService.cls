public with sharing class AccountDataService {
    
    @AuraEnabled
    public static List<Account> getAccountByType(string type) {
        return [SELECT Id, Name, Type, Phone, Industry, BillingAddress, AnnualRevenue
                  FROM Account
                 WHERE Type = :type WITH SECURITY_ENFORCED
                 ORDER BY Name];
    }

}
