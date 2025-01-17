class airTableConnector {

    constructor(){
        this.base = this.#getBase('songs')
    }

    async getAllRecordsFromTable(tableName){
        const tableID = airTableKeys.getTableID(tableName)
        const tableRecords = await this.base(tableID).select().all()
        const records = []
        tableRecords.forEach(record => {
            const recordData = this.#getRecordData(record)
            records.push(recordData)
        })
        return records
    }

    #getRecordData(record){
        const fieldNames = Object.keys(record.fields)
        let recordData = {id: record.id}
        fieldNames.forEach(fieldName => {
            recordData[fieldName] = record.fields[fieldName]
        })
        return recordData
    }

    #getBase(baseName){
        const apiKey = airTableKeys.getAPIKey()
        const baseID = airTableKeys.getBaseID(baseName)
        const Airtable = require('airtable');
        return new Airtable({apiKey: apiKey}).base(baseID);
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
