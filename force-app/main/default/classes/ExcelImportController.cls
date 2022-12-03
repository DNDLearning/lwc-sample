public with sharing class ExcelImportController {

	private static final String COLUMN_NAME_ACCOUNT_NAME = 'Account Name';
	private static final String COLUMN_NAME_ACCOUNT_NUMBER = 'Account Number';
	private static final String COLUMN_NAME_ACCOUNT_SOURCE = 'Account Source';
	private static final String COLUMN_NAME_INDUSTRY = 'Industry';


    @AuraEnabled(cacheable=false)
    public static ResultWrapper uploadExcelData(String excelBody,String excelHeadStr) {
    	//用于返回结果是成功还是失败，失败的话，返回失败信息

    	ResultWrapper result = new ResultWrapper();
        result.errorList = new List<ErrorWrapper>();
    	//excel内容 format 解析
    	List<ExcelWrapper> excelWrapperList = new List<ExcelWrapper>();
    	//format excel header
    	excelHeadStr = excelHeadStr.replaceAll('\'', '"');
        Object excelHeadObj = JSON.deserializeUntyped(excelHeadStr);
        Map<String, Object> excelHeadMap = (Map<String, Object>)excelHeadObj;
        //format excel body
        List<Map<String,String>> excelBodyList = (List<Map<String,String>>)JSON.deserialize(excelBody, List<Map<String,String>>.class);
        List<Map<String,String>> excelBodyListFinal = new List<Map<String,String>>();

        //首先验证是否附件有内容
        if(excelBodyList.isEmpty()) {
            result.isSuccess = false;
            ErrorWrapper errorItem = generateErrorMessage(null,null,'NO_ROWS');
            result.errorList.add(errorItem);
            return result;
        }
        //然后验证附件是否遵循模板的列
        Map<String, String> excelBodyValidityMap = excelBodyList.get(0);
        Boolean isFormattedColumn = true;
        // if(excelBodyValidityMap.size() != excelHeadMap.size()) {
        //     isFormattedColumn = false;
        // }
        for(String excelBodyColumn : excelBodyValidityMap.keySet()) {
            if(!excelHeadMap.containsKey(excelBodyColumn)) {
                isFormattedColumn = false;
            }
        }
        if(!isFormattedColumn) {
            result.isSuccess = false;
            ErrorWrapper errorItem = generateErrorMessage(null,null,'FORMAT_ERROR');
            result.errorList.add(errorItem);
            return result;
        }
        for(Integer i=0;i<excelBodyList.size();i++){
            Map<String,String> excelBodyMap = excelBodyList.get(i);
            Map<String,String> excelBodyMapFinal = new Map<String,String>();
            for(String head : excelHeadMap.keySet()){
                String cellStr = excelBodyMap.get(head);
                excelBodyMapFinal.put(String.valueOf(excelHeadMap.get(head)), cellStr);
            }
            excelBodyListFinal.add(excelBodyMapFinal);
        }
        //将excel内容转换成正常 list，用于友好展示
        Set<String> accountCodeSet = new Set<String>();
        Map<String, Account> availableAccountMap = new Map<String, Account>();
        Set<String> productCodeSet = new Set<String>();
        Map<String, Product2> availableProductMap = new Map<String, Product2>();
        Map<String, Integer> upsertKey2SizeMap = new Map<String, Integer>();
        Integer index = 1;

        for(Map<String,String> mapItem : excelBodyListFinal) {
        	ExcelWrapper excelWrapperItem = new ExcelWrapper();

        	excelWrapperItem.rowNumber = String.valueOf(index);
        	if(mapItem.containsKey('accountName')) {
        		excelWrapperItem.accountName = (String)mapItem.get('accountName');
        	}
        	if(mapItem.containsKey('accountNumber')) {
        		excelWrapperItem.accountNumber = (String)mapItem.get('accountNumber');
        	}
        	if(mapItem.containsKey('accountSource')) {
        		excelWrapperItem.accountSource = (String)mapItem.get('accountSource');
        	}
        	if(mapItem.containsKey('industry')) {
        		excelWrapperItem.industry = (String)mapItem.get('industry');
        	}

            String upsertKey = excelWrapperItem.accountName + '_' + excelWrapperItem.accountNumber + '_' + excelWrapperItem.accountSource + '_' + excelWrapperItem.industry;
            if(upsertKey2SizeMap.containsKey(upsertKey)) {
                Integer size = upsertKey2SizeMap.get(upsertKey);
                size += 1;
                upsertKey2SizeMap.put(upsertKey, size);
            } else {
                upsertKey2SizeMap.put(upsertKey, 1);
            }
        	excelWrapperList.add(excelWrapperItem);
        	index++;
        }


        for(ExcelWrapper excelItem : excelWrapperList) {
        	

        	if(String.isBlank(excelItem.accountName)) {
        		ErrorWrapper errorItem = generateErrorMessage(String.valueOf(result.errorList.size()),excelItem.rowNumber,'Account Name 必填！');
                errorItem.columnName = COLUMN_NAME_ACCOUNT_NAME;
				result.errorList.add(errorItem);
        	}

        	if(String.isBlank(excelItem.accountNumber)) {
        		ErrorWrapper errorItem = generateErrorMessage(String.valueOf(result.errorList.size()),excelItem.rowNumber,'Account Number 必填！');
                errorItem.columnName = COLUMN_NAME_ACCOUNT_NUMBER;
				result.errorList.add(errorItem);
        	}

        	if(String.isBlank(excelItem.accountSource)) {
        		ErrorWrapper errorItem = generateErrorMessage(String.valueOf(result.errorList.size()),excelItem.rowNumber,'Account Source 必填！');
                errorItem.columnName = COLUMN_NAME_ACCOUNT_SOURCE;
				result.errorList.add(errorItem);
        	}

        	if(String.isBlank(excelItem.industry)) {
        		ErrorWrapper errorItem = generateErrorMessage(String.valueOf(result.errorList.size()),excelItem.rowNumber,'Industry 必填！');
                errorItem.columnName = COLUMN_NAME_INDUSTRY;
				result.errorList.add(errorItem);
        	}

            String upsertKey = excelItem.accountName + '_' + excelItem.accountNumber + '_' + excelItem.accountSource + '_' + excelItem.industry;
            if(upsertKey2SizeMap.containsKey(upsertKey)) {
                Integer size = upsertKey2SizeMap.get(upsertKey);
                if(size > 1) {
                    ErrorWrapper errorItem = generateErrorMessage(String.valueOf(result.errorList.size()),excelItem.rowNumber,'不能重复数据');
                    errorItem.columnName = COLUMN_NAME_ACCOUNT_NAME;
                    result.errorList.add(errorItem);
                }
            }

        }
        result.isSuccess = true;
        if(!result.errorList.isEmpty()) {
        	result.isSuccess = false;
        } else {
            //数据验证通过，操作到数据库
        	Savepoint sp = Database.setSavepoint();
        	try {
                List<Account> accountList = new List<Account>();
                for(ExcelWrapper ewItem : excelWrapperList) {
                    Account accountItem = new Account();
                    accountItem.Name = ewItem.accountName;
                    accountItem.AccountNumber = ewItem.accountNumber;
                    accountItem.AccountSource = ewItem.accountSource;
                    accountItem.Industry = ewItem.industry;
                    accountItem.Upsert_Id__c = accountItem.Name +'_' + accountItem.AccountNumber + '_' + accountItem.AccountSource + '_' + accountItem.Industry;
                    accountList.add(accountItem);
                }

                if(!accountList.isEmpty()) {
                    upsert accountList Upsert_Id__c;
                }


                //设置返回类型的data modal
                Integer dataIndex = 0;
                result.dataList = new List<DataWrapper>();
                for(ExcelWrapper ewItem : excelWrapperList) {
                    DataWrapper dataWrapperItem = new DataWrapper();
                    dataWrapperItem.rowNumber = String.valueOf(dataIndex);
                    dataWrapperItem.accountName = ewItem.accountName;
                    dataWrapperItem.accountNumber = ewItem.accountNumber;
                    dataWrapperItem.accountSource = ewItem.accountSource;
                    dataWrapperItem.industry = ewItem.industry;
                    result.dataList.add(dataWrapperItem);
                    dataIndex++;
                }
        	} catch(Exception e) {
        		Database.rollback(sp);
        		result.isSuccess = false;
                system.debug(e.getMessage());
                system.debug(e.getLineNumber());
        		result.errorList.add(generateErrorMessage('1','','更新数据库失败，请联系管理员' + e.getMessage()));
        	}
        }
    	return result;
    }

    @AuraEnabled
    public static String getDocumentId() {
    	String result = '';
    	List<Document> documentList = [SELECT Id
    									FROM Document
    									WHERE DeveloperName = 'account_template'];
    	if(!documentList.isEmpty()) {
    		result = URL.getSalesforceBaseUrl().toExternalForm() + '/servlet/servlet.FileDownload?file=' + documentList.get(0).Id;
    	}
    	return result;
    }



    private static ErrorWrapper generateErrorMessage(String index, String rowNumber, String errorMessage) {
    	ErrorWrapper errorItem = new ErrorWrapper();
		errorItem.index = index;
		errorItem.errorRowNumber = rowNumber;
		errorItem.errorMessage = errorMessage;
		return errorItem;
    }

    /**
    * 用于上传数据返回的结果集的结构
    */
	public class ResultWrapper {
		//是否上传成功标识符
		@AuraEnabled
		public Boolean isSuccess;
		//如果失败情况下，error列表
		@AuraEnabled
		public List<ErrorWrapper> errorList;
		@AuraEnabled
		public String message;
	}

	/**
	* Error 列表展示的列的结构
	**/
	public class ErrorWrapper {
		@AuraEnabled
		public String index;
		@AuraEnabled
		public String columnName;
		@AuraEnabled
		public String errorRowNumber;
		@AuraEnabled
		public String errorMessage;
	}

	//excel bean
	public class ExcelWrapper {
		public String rowNumber;
		public String accountName;
		public String accountNumber;
		public String accountSource;
		public String industry;
	}

	/**
	* 成功情况下，前端列表展示的列的结构
	**/
	public class DataWrapper {
		@AuraEnabled
		public String rowNumber;
		@AuraEnabled
		public String accountName;
		@AuraEnabled
		public String accountNumber;
		@AuraEnabled
		public String accountSource;
		@AuraEnabled
		public String industry;
	}

}