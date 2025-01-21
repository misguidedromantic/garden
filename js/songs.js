class song {
    constructor(id, title){
        this.id = id
        this.title = title
        this.structure = []
        this.form = []
    }

}

class formalSection {
    constructor(id, title, label){
        this.id = id
        this.title = title
        this.label = label
    }
}

class structuralSection {
    constructor(id, sectionData){
        this.id = id
        this.title = sectionData.title
        this.sequence = sectionData.sequence_in_song
        this.repeatNum = sectionData.repeat_number
        this.type = sectionData.type
        this.formalSectionID = sectionData.formal_section_basis[0]
        this.formVariations = sectionData.formal_section_variation_types
    }


}

class intro extends structuralSection {
    constructor(id, sectionData){
        super(id, sectionData)
    }
}

class verse extends structuralSection {
    constructor(id, sectionData){
        super(id, sectionData)
    }
}

class chorus extends structuralSection {
    constructor(id, sectionData){
        super(id, sectionData)
    }
}

class bridge extends structuralSection {
    constructor(id, sectionData){
        super(id, sectionData)
    }
}

class outro extends structuralSection {
    constructor(id, sectionData){
        super(id, sectionData)
    }
}

class songBlock {
    constructor(item, blockType){
        this.id = item.blockID + blockType
        this.songID = item.songID
    }
}

class melodyBlock extends songBlock {
    constructor(item){
        super(item, 'Melody')
        this.kickNote = new note (item.kickNote)
        this.peakNote = new note (item.peakNote)
        this.endNote = new note (item.endNote)
        this.patternBlockID = item.patternBlockID + 'Melody'
    }
}

class progressionBlock extends songBlock {
    constructor(item){
        super(item, 'Progression')
        this.patternBlockID = item.patternBlockID + 'Progression'
        this.chords = []
        this.setChords(item.chordNames, item.chordLengths)   
    }   

    setChords(chords, chordLengths){
        const chordNameValues = this.#getChordArray(chords)
        const chordLengthValues = this.#getChordArray(chordLengths)
        for(let i = 0; i < chordNameValues.length; i++){
            this.chords.push(new chord (chordNameValues[i], chordLengthValues[i]))
        }
    }

    #getChordArray(chords){
        try{return chords.split(';')}
        catch{return [chords]}
    }
}

class songsContentControl {

    constructor(){
        this.structuring = new songStructuring()
        this.blockControl = new songBlockControl()
    }

    update(data){
        if(this.#isSongsMenuLoaded(data.updatedItems)){
            let songToLoad = ''
            try{songToLoad = this.#getSongSelection(data.updatedItems)}
            catch {return}
            const thisSong = this.structuring.setupSong(songToLoad.title)
            this.blockControl.loadSong(thisSong)

        }
    }

    #isSongsMenuLoaded(items){
        return items.some(item => item.title === 'songs' && item.selected)
    }

    #getSongSelection(items){
        const filtered = items.filter(item => item.constructor.name === 'subMenuItem' && item.selected)
        if(filtered.length === 1){return filtered[0]}else{throw error}
    }


}

class songStructuring {

    constructor(){
        this.sectionHandling = new songSectionHandling(this.formalSectionData, this.structuralSectionData)
    }

    setupSong(songTitle){
        const thisSong = songsDataHandling.getSong(songTitle)
        thisSong.form = songsDataHandling.getFormalSections(thisSong.id)
        thisSong.structure = songsDataHandling.getStructuralSections(thisSong.id)
        return thisSong
    }
}


class songsDataHandling {
    static #source = 'airtable'
    static songsData = []
    static formalSectionData = []
    static structuralSectionData = []

    static async load(){
        this.#source === 'csv' ? await this.#loadFromCSV(new csvExtractLoadTransform) : await this.#loadFromAirtable(new airtableExtractor)
        console.log(this.songsData)
    }

    static async #loadFromAirtable(extractor){
        this.songsData = await extractor.getAllRecordsFromTable('songs', 'songs')
        this.formalSectionData = await extractor.getAllRecordsFromTable('songs', 'formal_sections')
        this.structuralSectionData = await extractor.getAllRecordsFromTable('songs', 'structural_sections')
        return Promise.resolve()
    }

    static async #loadFromCSV(extractor){
        this.songsData = await extractor.getAllRecordsFromFile('data/songs.csv')
        this.formalSectionData = await extractor.getAllRecordsFromFile('data/formal_sections.csv')
        this.structuralSectionData = await extractor.getAllRecordsFromFile('data/structural_sections.csv')
        return Promise.resolve()
    }

    static getTitles(){
        const loader = this.#getLoader(this.songsData)
        return loader.getAllRecordsInField('title')
    }

    static #getLoader(table){
        return this.#source === 'airtable' ? new airtableExtractedDataLoader(table) : new csvExtractLoadTransform(table)
    }

    static getSong(songTitle){
        const loader = this.#getLoader(this.songsData)
        const songData = loader.getRecord('title', songTitle) 
        return new song (songData.id, songData.fields.title)
    }

    static getFormalSections(songID){
        const sectionsData = this.formalSectionData.filter(section => section.fields.song[0] === songID)
        const sections = []
        sectionsData.forEach(section => {
            sections.push(new formalSection (section.id, section.fields.title, section.fields.label))
        })
        return sections
    }

    static getStructuralSections(songID){
        const sectionsData = this.structuralSectionData.filter(section => section.fields.song[0] === songID)
        const sections = []
        sectionsData.forEach(section => {
            sections.push(this.#getStructuralSection(section))
        })
        return sections
    }

    static #getStructuralSection(sectionData){
        switch(sectionData.fields.type){
            case 'intro':
                return new intro (sectionData.id, sectionData.fields)

            case 'verse':
                return new verse (sectionData.id, sectionData.fields)

            case 'chorus':
                return new chorus (sectionData.id, sectionData.fields)

            case 'bridge':
                return new bridge (sectionData.id, sectionData.fields)

            case 'outro':
                return new outro (sectionData.id, sectionData.fields)  

            default:
                return new structuralSection (sectionData.id, sectionData.fields)
        }
    }













    static #setupSong(thisSong){
        this.sectionHandling.setupSections(thisSong)
        //this.blockHandling.setupBlocks(thisSong)
        return thisSong
    }



    static async #loadData(){
        const extractor = new airtableExtractor
        this.songsData = await extractor.getAllRecordsFromTable('songs')
        return Promise.resolve()
    }

    static #loadHandlers(){
        this.sectionHandling = new songSectionHandling(this.formalSectionData, this.structuralSectionData)
        //this.blockHandling = new songBlockHandling (this.songPatterns, this.songStructures)
    }

    static #setupSongs(){
        this.songsData.forEach(song => {
            const thisSong = this.#createSong(song.id, song.title)
            this.#setupSong(thisSong)
            this.songs.push(thisSong)
        })
        
    }

    static #createSong(id, title){
        return new song(id, title)
    }

    

    static filterForSong(data, songID){
        return data.filter(item => item.songID === songID)
    }

    static getSongs(){
        return this.songs
    }


    static getSongByID(id){
        return this.songs.find(song => song.id === id)
    }
}

class songSectionHandling {

    constructor(formalSectionData, structuralSectionData){
        this.formalSectionData = formalSectionData
        this.structuralSectionData = structuralSectionData
    }

    setupSections(song){
        this.#setupFormalSections(song)
        this.#setupStructuralSections(song)
    }

    #setupFormalSections(song){
        const sectionData = this.#getSectionDataForSong(this.formalSectionData, song.id)
        sectionData.forEach(sectionRecord => {
            const section = this.#createFormalSection(sectionRecord)
            song.form.push(section)
        })
    }

    #setupStructuralSections(song){
        const sectionData = this.#getSectionDataForSong(this.structuralSectionData, song.id)
        sectionData.forEach(sectionRecord => {
            const section = this.#createSongSection(sectionRecord)
            song.structure.push(section)
        })
        
    }

    #getSectionDataForSong(data, songID){
        const filtered = data.filter(element => element.song[0] === songID)
        return filtered.sort((a, b) => {
            if(a.label < b.label) return -1
            if(a.label > b.label) return 1
            return 0
        })
    }

    #createFormalSection(sectionData){
        return new formalSection (sectionData.id, sectionData.title, sectionData.label)
    }

    #createSongSection (sectionData){
        switch(sectionData.type){
            case 'intro':
                return new intro (sectionData)

            case 'verse':
                return new verse (sectionData)

            case 'chorus':
                return new chorus (sectionData)

            case 'bridge':
                return new bridge (sectionData)

            case 'outro':
                return new outro (sectionData)  

            default:
                return new structuralSection (sectionData)
        }
    }
}

class songBlockHandling {
    constructor(patternsData, structureData){
        this.patternsData = patternsData
        this.structureData = structureData
    }

    setupBlocks(song){
        this.#setupPatternBlocks(song)
        this.#setupSectionBlocks(song)
    }

    #setupPatternBlocks(song){
        const blockData = this.#getBlockDataForSong(song.id, this.patternsData)
        blockData.forEach(block => {
            song.patternBlocks.push(new melodyBlock(block))
            song.patternBlocks.push(new progressionBlock(block))
        })  
    }

    #setupSectionBlocks(song){
        for(let i = 0; i < song.sections.length; i++){
            const section = song.sections[i]
            this.#addBlocksInSection(song, section, i)
            
        }
    }

    #addBlocksInSection(song, section, sectionIndex){
        
        const sectionBlocks = this.#getBlockDataForSection(song, section.id)
        for(let i = 0; i < sectionBlocks.length; i++){
            const block = sectionBlocks[i]
            block.blockID = this.#getStructureBlockID(section, i)
            this.#addBlocks(block, song.structureBlocks, sectionIndex)
        }
    }

    #getStructureBlockID(section, blockIndex){
        const sectionType = section.constructor.name
        const sectionSeq = section.id.slice(sectionType.length)
        const sectionLetter = sectionType.slice(0,1)
        return sectionLetter + sectionSeq + 'b' + (blockIndex + 1)
    }


    #addBlocks(block, structureBlocks, sectionIndex){
        structureBlocks.push(this.#getMelodyBlock(block, sectionIndex))
        structureBlocks.push(this.#getProgressionBlock(block, sectionIndex))
    }

    #getMelodyBlock(data, sectionIndex){
        const block = new melodyBlock (data)
        block.sectionID = data.sectionID
        block.sectionIndex = sectionIndex
        return block
    }

    #getProgressionBlock(data, sectionIndex){
        const block = new progressionBlock (data)
        block.sectionID = data.sectionID
        block.sectionIndex = sectionIndex
        return block
    }

    #getBlockDataForSong(songID, dataSource){
        return dataSource.filter(element => element.songID === songID)
    }

    #getBlockDataForSection(song, sectionID){
        const songBlockData = this.#getBlockDataForSong(song.id, this.structureData)
        return songBlockData.filter(element => element.sectionID === sectionID)
    }
}

class blockDataHandling {

    static getGroupNumber(groupID){
        return groupID.slice(2)
    }

    static getBlockNumberInGroup(blockID, sectionID){
        const sectionRefLength = this.#getSectionReferenceLength(sectionID)
        const blockTypeIndex = this.#getBlockTypeIndex(blockID)
        return blockID.slice(sectionRefLength, blockTypeIndex)
    }

    static #getSectionReferenceLength(sectionID){
        const sectionType = songSectionHandling.getSectionType(sectionID)
        return sectionID.length - sectionType.length + 2
    }

    static #getBlockTypeIndex(blockID){
        const iMelody = blockID.indexOf('Melody') 
        const iProgression = blockID.indexOf('Progression')
        return iMelody > 0 ? iMelody : iProgression
    }

    static getMelodyBlockVariationLevel(actualBlock){
        const patternBlock = this.#getPatternBlock(actualBlock)
        let level = 0
        
        if(actualBlock.kickNote.id !== patternBlock.kickNote.id){
            actualBlock.kickNote.id !== '' ? level = level + 1 : level = level - 1
        }

        if(actualBlock.peakNote.id !== patternBlock.peakNote.id){
            actualBlock.peakNote.id !== '' ? level = level + 1 : level = level - 1 
        }

        if(actualBlock.endNote.id !== patternBlock.endNote.id){
            actualBlock.endNote.id !== '' ? level = level + 1 : level = level - 1
        }

        return level

    }

    static getProgressionBlockVariationLevel(actualBlock){
        const patternBlock = this.#getPatternBlock(actualBlock)
        let level = 0

        for(let i = 0; i < patternBlock.chords.length; i++){
            const thisPatternChord = patternBlock.chords[i]
            const thisActualChord = actualBlock.chords[i]

            if(thisPatternChord.name !== thisActualChord.name){
                level = level + 1
            }

            if(thisPatternChord.length !== thisActualChord.length){
                level = level + 1
            }

        }

        return level
    }

    static #getPatternBlock(actualBlock){
        const song = songsDataHandling.getSongByID(actualBlock.songID)
        return song.patternBlocks.find(block =>  block.id === actualBlock.patternBlockID)
    }

}

class lyricsHandler{
    
    async setupLyrics(songTitle){
        const lyricsFileName = songTitle// + '- lyrics.txt'
        const lyricsText = await this.getLyricsFromFile(lyricsFileName)
        return this.setLines(lyricsText)
    }
    
    async getLyricsFromFile(fileName){
        const response = await fetch(fileName)
        return response.text()
    }
    
    getLineSplit(lyricsText){
        return lyricsText.split(/\r?\n/).filter(line => line !== '')
    }
    
    setLines(lyricsText){
        const lines = this.getLineSplit(lyricsText)
        let sections = []
        let section = undefined
        let lineCount = 0
        lines.forEach(line => {
            const sectionMarker = this.isSectionMarker(line)
            if(sectionMarker !== ''){
                section = this.createSection(sectionMarker, line)    
                sections.push(section)
            } else {
                this.addLine(line, section, lineCount)
                lineCount = lineCount + 1
            }
        })
        return sections
    }
    
    createSection(type, line){
        switch(type){
            case 'verse':
                return new verse (line)

            case 'chorus':
                return new chorus (line)

            case 'outro':
                return new outro (line)
        }
    }
    
    
    addLine(line, section, lineCount){
        section.lines.push(new lyricLine(line, lineCount))   
    }

    
    isLineType(line, typeToCheck){
        return line.includes(typeToCheck)
    }
    
    isSectionMarker(line){
        const sectionTypes = ['intro','verse','chorus','bridge','outro']
        let result = ''
        sectionTypes.forEach(sectionType => {
            this.isLineType(line, sectionType) ? result = sectionType : result
        })

        return result
    }
}

class melodyShape {
    constructor(peakNoteDescriptor, endNoteDescriptor){
        this.peakNote = new note (peakNoteDescriptor)
        this.endNote = new note (endNoteDescriptor)
    }

}

class chordProgression {
    constructor(progressionArray){
        this.chords = this.getChords(progressionArray)
    }

    getChords(progressionArray){
        let chords = []
        progressionArray.forEach(item => {
            chords.push(new chord (item.chordName, item.chordLengthInBeats))
        })
        return chords
    }
}

class measure {
    constructor(timeSignature){
        this.timeSignature = timeSignature
    }
}

class chord {
    constructor(name, lengthInBeats){
        this.name = name
        this.length = lengthInBeats
    }
}

class beat {
    constructor(chord, position){
        this.chord = chord
        this.position = position
    }
}

class note {
    constructor(pitchDescriptor){
        this.id = pitchDescriptor
        this.pitch = this.getPitch(pitchDescriptor)
    }

    getPitch(str){
        const letter = this.getLetter(str)
        const accidental = this.getAccidental(str)
        const octave = this.getOctave(str)
        return new pitch (letter, accidental, octave)
    }

    getLetter(str){
        return str.substring(0, 1)
    }

    getAccidental(str){
        switch(str.substring(1, 2)){
            case 'b':
                return 'flat'

            case '#':
                return 'sharp'

            default:
                return 'natural'
        }
    }

    getOctave(str){
        return isNaN(str.substring(1,2)) ? str.substring(2, 3) : str.substring(1, 2)
    }


}

class pitch {
    constructor(letter, accidental, octave){
        this.letter = letter
        this.accidental = accidental
        this.octave = octave
    }

    
}

class timeSignature{
    constructor(numerator, denominator){
        this.id = numerator + '/' + denominator
    }
}

class lyric {
    constructor(text){
        this.text = text
    }

}

class lyricLine {
    constructor(text, i){
        this.text = text
        this.id = 'line' + (i + 1)
    }


}





