@isTest
public class TestAccountDataService {
    /**
     * Prepare account data;
     */
    static void createAccounts(Integer num) {
        List<Account> accounts = new List<Account>();
        for (Integer i = 1; i <= num; i++) {

            string type;
            Integer iType = Math.mod(i, 3);
            switch on iType {
                when 0 {
                    type = 'Customer - Direct';
                }
                when 1 {
                    type = 'Customer - Channel';
                }
                when 2 {
                    type = 'Other';
                }
            }

            accounts.add(new Account(
                Name = 'Name' + i,
                Type = type,
                AnnualRevenue = Math.random() * 1000000
            ));
        }

        insert accounts;
    }

    @isTest
    static void testGetAccountByType(){
        createAccounts(10);

        Test.startTest();
        List<Account> accounts = AccountDataService.getAccountByType('Other');
        Test.stopTest();

        System.assertEquals(3, accounts.size(), 'Account size Excepted.');

    }
}