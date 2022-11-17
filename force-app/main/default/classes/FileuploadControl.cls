public with sharing class FileuploadControl {
    @AuraEnabled(cacheable=true)
    public static List<ContentDocumentLink> fetchFiles(string recordId) {
        //https://developer.salesforce.com/docs/atlas.ja-jp.240.0.object_reference.meta/object_reference/sforce_api_objects_contentversion.htm?search_text=contentdocumentlink
        //ContentDocumentLink に対する条件なしでは、クエリを実行することはできません。
        //ContentDocumentId で条件検索している場合は、ContentDocument 項目で条件検索することはできません。
        //LinkedEntityId で条件検索している場合は、ContentDocument 項目でのみ条件検索を実行できます。
        //関連オブジェクト項目で条件検索することはできません。
        return [
            SELECT ContentDocumentId, ContentDocument.Title FROM ContentDocumentLink WHERE LinkedEntityId = :recordId
        ];


        // List<ContentDocumentLink> links = [
        //     SELECT ContentDocumentId
        //       FROM ContentDocumentLink 
        //      WHERE LinkedEntityId = :recordId
        //     ];

        // Map<Id, ContentDocumentLink> documentIds = new Map<Id, ContentDocumentLink>(links);

        // return [SELECT Title 
        //           FROM ContentVersion
        //          WHERE ContentDocumentId in :documentIds.keySet()
        // ];
    }

    @AuraEnabled(cacheable=true)
    public static Map<Id, String> getFileList(String recordId){
        List<ContentDocumentLink> fileLinks = [
            SELECT ContentDocumentId FROM ContentDocumentLink WHERE LinkedEntityId = :recordId
        ];

        List<Id> fileIds = new List<Id>();
        for (ContentDocumentLink docLink : fileLinks) {
            fileIds.add(docLink.ContentDocumentId);
        }

        List<ContentVersion> docs = [
            SELECT ContentDocumentId, FileExtension, Title
              FROM ContentVersion WHERE ContentDocumentId in :fileIds
        ];

        Map<Id, String> mapIdTitle = new Map<Id, String>();
        for (ContentVersion doc : docs) {
            mapIdTitle.put(doc.ContentDocumentId, doc.Title);
        }
        return mapIdTitle;
    }

    @AuraEnabled
    public static String readFileFromRecord(String recordId) {
        ContentDocumentLink docLink = [
            SELECT Id, ContentDocumentId, ContentDocument.Description, ContentDocument.Title, LinkedEntityId
              FROM ContentDocumentLink
             WHERE LinkedEntityId = :recordId
             LIMIT 1
        ];

        ContentVersion doc = [
            SELECT VersionData FROM ContentVersion
             WHERE ContentDocumentId = :docLink.ContentDocumentId AND IsLatest = true
             LIMIT 1
        ];

        return EncodingUtil.base64Encode(doc.VersionData);
    }

    @AuraEnabled
    public static List<Account> importAccount(string docId){
        System.debug('docId ==> ' + docId);
        // read content from ContentVersion
        ContentVersion cv = [
            SELECT Title, VersionData, FileExtension 
              FROM ContentVersion 
             WHERE ContentDocumentId = :docId
               AND IsLatest = true
             LIMIT 1
        ];

        // split using line feed
        List<String> lines = cv.VersionData.toString().split('\n');


        List<Account> accList = new List<Account>();
        // loop line and create account object -- skip header
        for (Integer i = 1; i < lines.size(); i++) {
            String line = lines.get(i);
            System.debug('line ==> ' + line);
            List<String> columns = line.split(',');

            Account acc = new Account( 
                Name = columns[0],
                AccountSource = columns[1],
                Site = columns[2],
                Type = columns[3],
                Website = columns[4]
            );
            accList.add(acc);
        }

        // insert account
        if (accList.size() > 0) {
            insert accList;
        }

        // query account and return
        return accList;
    }
    
}