class songConceptModelData {
    static #concepts = []
    static #relations = []

    static load (){
        const conceptData = this.#getConceptData()
        const relationData = this.#getRelationData()
        this.prepare(conceptData, relationData)
    }

    static prepare(conceptData, relationData){
        relationData.forEach(relation => {

            const firstTerm = this.getFirstTerm(conceptData, relation)
            const newConcept = new concept (firstTerm)



            //this.findTerms(conceptData, relation)
        })
    }


    static findTerms(terms, relationText){

        //const firstTerm = this.getFirstTerm(terms, relationText)
        //const secondTerm = this.getSecondTerm(terms, relationText)


    }

    static getFirstTerm(terms, relationText){
        for (const term of terms){
            if(relationText.indexOf(term, 0) === 0){
                return term
            }
        }
    }

    static getSecondTerm(terms, relationText){
        for (const term of terms){
            const checkPos = relationText.length - term.length
            if(relationText.indexOf(term, checkPos) === checkPos){
                return term
            }
        }
    }










    static #getConceptData (){
        return [
            'section',
            'structural section',
            'formal section',
            'verse',
            'chorus',
            'intro',
            'outro'
        ]
    }

    static #getRelationData (){
        return [
            'structural section is a kind of section',
            'formal section is a kind of section',
            'verse is a kind of structural section',
            'chorus is a kind of structural section',
            'intro is a kind of structural section',
            'outro is a kind of structural section',
            'A is a kind of formal section',
            'B is a kind of formal section',
            'C is a kind of formal section',
            'structural section is positioned in stack', //?
        ]
    }

}

class concept {
    constructor(term){
        this.term = term
    }
}

class recordsData {
    static #titles = []

    static async load(){
        const data = await d3.csv('data/records.csv')
        data.forEach(d => {
            const thisRecord = new record(d.short_title, d.title, d.record_type)
            this.#titles.push(thisRecord)
        })

        return Promise.resolve()
    } 


    static getTitles (){
        return this.#titles
    }

    static getRecord(title){
        return new record (title)
    }

    static getRecordMap(record){

        return new Map([
            ['history', this.getRecordHistory(record)]
            ['songs', this.getRecordSongs(record)]
        ])
    }
    
    static getRecordHistory(record){
        switch(record.title){
            case 'misguided romantic':
                record.addEvent('released', null)
                record.addEvent('mastered', '2025-10-20')
                record.addEvent('mixed', '2025-09-29')
                record.addEvent('tracked', '2025-07-13')
                return record.history
        }
    }


    static getRecordSongs(record){
        switch(record.title){
            case 'misguided romantic':
                record.addSong()
                return 
        }
    }
}

class record {
    constructor(shortTitle, title, recordType){
        this.id = shortTitle
        this.title = title
        this.type = recordType
        this.history = new Map()
        this.songs = new Map()
    }

    addEvent(event, stringDate){
        let date = undefined
        if(stringDate !== null){
            date = new Date(stringDate.slice(0,4),stringDate.slice(5,7),stringDate.slice(8))
        } else {
            date = stringDate
        }
        
        this.history.set(event, date)
    }

    addSong(song){
        this.songs.set(song)
    }

}

class song {
    constructor(id, title){
        this.id = id
        this.title = title
        this.sectionArchetypes = []
        this.sectionInstances = []
        this.history = []
    }

    addSectionArchetype(archetype){
        this.sectionArchetypes.push(archetype)
    }

    addSectionInstance(instance){
        this.sectionInstances.push(instance)
    }

    addSongwritingEvent(event){
        this.history.push(event)
    }

    addKeyDate(event, year, month){
        month = month - 1
        const eventDate = new Date (year, month)
        this.history.push({event: event, date: eventDate})
    }

    getArchetype(archetypeID){
        return this.sectionArchetypes.find(obj => obj.id = archetypeID)
    }

}

class songsData {

    static #songs = []
    static #artefacts = []
    static #sections = []

    static getSongsForRecord(recordTitle){
        
    }

    static async load(){
        const songsData = await d3.csv('data/songs.csv')
        songsData.forEach(songDatum => {
            const thisSong = new song(songDatum.short_title)
            thisSong.title = songDatum.title
            this.#songs.push(thisSong)
        })

        return Promise.resolve()
    }

    static loadSongwritingArtefacts(){
        this.#artefacts = [
            new songwritingArtefact('2015-01-15','voice memo', 'Bed tonight verse melody variation'),
            new songwritingArtefact('2017-09-12', 'note', 'Bed tonight ramble #1'),
            new songwritingArtefact('2017-04-25', 'voice memo', 'Chorus Idea Bed Tonight'),
            new songwritingArtefact('2018-10-02', 'lead chart', 'good after bad - chart - chords')
        ]
    }

    static loadSongSections(song){
        this.#sections = [
            new songSectionInstance(song.id, 'Intro', 'Verse', 1),
            new songSectionInstance(song.id, 'Verse1', 'Verse', 2),
            new songSectionInstance(song.id, 'Chorus1', 'Chorus', 3),
            new songSectionInstance(song.id, 'Verse1', 'Verse', 4),
            new songSectionInstance(song.id, 'Chorus2', 'Chorus', 5),
            new songSectionInstance(song.id, 'Chorus3', 'Chorus', 6),
            new songSectionInstance(song.id, 'Outro', 'Chorus', 7)
        ]
    }

    static getAllSongwritingArtefacts(){
        return this.#artefacts
    }

    static getAllSections(){

        
    }

    static getAllSongs(){
        return this.#songs
    }

    static getSelectedIndex(){
        return this.#songs.findIndex(song => song.selected === true)
    }

    static getSectionCount(songID){
        return songSectionsData.getSongSections(songID).length
    }

    static getSongIndex(songID){
        return this.#songs.findIndex(song => song.id === songID)
    }

    static getSongIDByIndex(songIndex){
        try{return this.#songs[songIndex].id}
        catch{return undefined}
    }

    static getRandomSongID(){
        return this.#songs[Math.floor(Math.random() * this.#songs.length)]
    }

    static getSong(songID){
        return this.#songs.find(song => song.id === songID)
    }

    static getAllSongTitles(){
        return this.#songs.map(song => song.title)
    }

}

class songSectionsData{

    static #sections = []
    static #form = []
    static #stacks = []

    static async load(){
        const data = await this.#extract()
        this.#setup(data)
        return Promise.resolve()
    }

    static async #extract(){
        return {
            formalSections: await d3.csv('data/formal_sections.csv'),
            structuralSections: await d3.csv('data/structural_sections.csv')
        }
    }

    static #setup(data){
        const sectionSetup = new songSectionSetup(data)
        this.#form = sectionSetup.createFormalSections()
        this.#sections = sectionSetup.createStructuralSections()
    }

    static getAllSections(){
        const structuring = new songStructuring(this.#sections)
        //this.#stacks = structuring.createStacks()
        //console.log(this.#stacks)
        return this.#sections
    }

    static getSongSections(songID){
        return this.#sections.filter(section => section.songID === songID)
    }

    static getFormalSectionType(formalSectionID){
        const section = this.getFormalSection(formalSectionID)
        return section.type
    }
        
    static getFormalSection(formalSectionID){
        return this.#form.find(section => section.id === formalSectionID)
    }

    static getSectionIndexInSong(thisSection){
        const songSections = this.getSongSections(thisSection.songID)
        return songSections.findIndex(section => section.id === thisSection.id)
    }

    static getTallestStack(songID){
        const songStacks = this.#stacks.filter(stack => stack.songID === songID)
        try{return songStacks.reduce((largest, current) => current.length > largest.length ? current : largest)}
        catch{return 0}
    }




}