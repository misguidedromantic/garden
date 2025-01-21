class csvExtractLoadTransform {
    constructor(tableRecords){
        this.tableRecords = tableRecords
    }

    getAllRecordsFromFile(filePath){
        return d3.csv(filePath)
    }

    getAllRecordsInField(fieldName){
        return this.tableRecords.map(record => record[fieldName])
    }

    getRecord(fieldToSearch, valueToMatch){
        this.tableRecords.find(record => record[fieldToSearch] === valueToMatch)
    }
}

class airtableExtractor {

    async getAllRecordsFromTable(baseName, tableName){
        const base = await this.#getBase(baseName)
        const tableRecords = await this.#getTableRecords(base, tableName)
        const records = []
        tableRecords.forEach(sourceRecord => {
            let record = {}
            record['id'] = sourceRecord.id
            for (let field of Object.keys(sourceRecord.fields)){
                record[field] = sourceRecord.get(field)
            }
            records.push(record)
        });
        return records
    }

    async getAllRecordsInField(baseName, tableName, fieldName){
        const base = this.#getBase(baseName)
        const tableRecords = await this.#getTableRecords(base, tableName)
        return this.#getFieldRecords(tableRecords, fieldName)
    }

    #getBase(baseName){
        const apiKey = airTableKeys.getAPIKey()
        const baseID = airTableKeys.getBaseID(baseName)
        const Airtable = require('airtable');
        return new Airtable({apiKey: apiKey}).base(baseID);
    }

    #getTableRecords(base, tableName){
        const tableID = airTableKeys.getTableID(tableName)
        return base(tableID).select().all()
    }

    #getFieldRecords(tableRecords, fieldName){
        const records = []
        tableRecords.forEach(record => {
            records.push(record.get(fieldName))
        })
        return records
    }

}

class airtableExtractedDataLoader {

    constructor(tableRecords){
        this.tableRecords = tableRecords
    }

    getAllRecordsInField(fieldName){
        const records = []
        this.tableRecords.forEach(record => {
            records.push(record.get(fieldName))
        })
        return records
    }

    getRecord(fieldToSearch, valueToMatch){
        const record = this.tableRecords.find(record => record.fields[fieldToSearch] === valueToMatch)
        return {
            
        }
    }

}


class airTableKeys {

    static #apiKey = 'pat8L1hc6NTYd7xve.64354a6b091317657aea9590ff3230ee124637f42f4925ba3d10fad7c5091e8e'
    
    static getAPIKey(){
        return this.#apiKey
    }

    static getBaseID(baseName){
        switch(baseName){
            case 'songs':
                return 'appxWZ0eDYnp0RIgz'
        }
    }

    static getTableID(tableName){
        switch(tableName){
            case 'songs':
                return 'tblxv6NYFMpu3J46w'

            case 'formal_sections':
                return 'tblkgwxEtjdA8pcyn'

            case 'structural_sections':
                return 'tbldd6TRnyiZYC57Y'
        }
    }

}
