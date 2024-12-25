class song {
    constructor(id, title){
        this.id = id
        this.title = title
        this.sections = []
        this.patternBlocks = []
    }
}

class songSection {
    constructor(id){
        this.id = id
        this.blocks = []
    }
}


class songsDataHandling {
    static songs = []

    static async load(){
        await this.#loadData()
        this.#loadHandlers()
        this.#setupSongs()
    }

    static async #loadData(){
        this.songsData = await d3.csv('data/songs.csv')
        this.songStructures = await d3.csv('data/songStructures.csv')
        this.songPatterns = await d3.csv('data/songPatterns.csv')
        return Promise.resolve()
    }

    static #loadHandlers(){
        this.sectionHandling = new songSectionHandling(this.songStructures)
        this.blockHandling = new songBlockHandling (this.songPatterns, this.songStructures)
    }

    static #setupSongs(){
        this.songsData.forEach(song => {
            const thisSong = this.#createSong(song)
            this.#setupSong(thisSong)
            this.songs.push(thisSong)
        })
    }

    static #createSong(songData){
        return new song(songData.songID, songData.songTitle)
    }

    static #setupSong(thisSong){
        this.sectionHandling.setupSections(thisSong)
        this.blockHandling.setupBlocks(thisSong)
        return thisSong
    }



    static filterForSong(data, songID){
        return data.filter(item => item.songID === songID)
    }

    static getSongs(){
        return this.songs
    }

    static getSong(title){
        return this.songs.find(song => song.title === title)
    }
 

}

class songSectionHandling {

    constructor(sectionData){
        this.sectionData = sectionData
    }

    setupSections(song){
        const sectionIDs = this.#getSectionIDs(song.id)
        sectionIDs.forEach(sectionID => {
            const thisSection = this.#createSongSection(sectionID)
            song.sections.push(thisSection)
        })
    }

    #getSectionDataForSong(songID){
        return this.sectionData.filter(element => element.songID === songID)
    }

    #getSectionIDs(songID){
        const songSectionData = this.#getSectionDataForSong(songID)
        return [...new Set (songSectionData.map(element => element.sectionID))]
    }

    #createSongSection (sectionID){
        const sectionType = this.#getSectionType(sectionID)
        switch(sectionType){
            case 'verse':
                return new verse (sectionID)

            case 'chorus':
                return new chorus (sectionID)

            case 'outro':
                return new outro (sectionID)  

            default:
                return new songSection (sectionID)

        }
        
    }

    #getSectionType(sectionID){
        for (let sectionType of ['verse','chorus','outro']){
            if(sectionID.includes(sectionType)){
                return sectionType
            }
        }
    }


}

class songBlockHandling {
    constructor(patternsData, structureData){
        this.patternsData = patternsData
        this.structureData = structureData
    }

    setupBlocks(song){
        console.log(song)
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
        song.sections.forEach(section => {
            const sectionBlocks = this.#getBlockDataForSection(song, section.id)
            sectionBlocks.forEach(block => {
                section.blocks.push(new melodyBlock(block))
                section.blocks.push(new progressionBlock (block))
            })
        })
    }

    #getBlockDataForSong(songID, dataSource){
        return dataSource.filter(element => element.songID === songID)
    }

    #getBlockDataForSection(song, sectionID){
        const songBlockData = this.#getBlockDataForSong(song.id, this.structureData)
        return songBlockData.filter(element => element.sectionID === sectionID)
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
        const sectionTypes = ['verse','chorus','outro']
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



class intro extends songSection {
    constructor(id){
        super(id)
    }
}

class verse extends songSection {
    constructor(id){
        super(id)
    }
}

class chorus extends songSection {
    constructor(id){
        super(id)
    }
}

class outro extends songSection {
    constructor(id){
        super(id)
    }
}
