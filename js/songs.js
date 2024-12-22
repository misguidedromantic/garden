class songsDataHandling {
    static songs = []

    static async load(){
        const songsData = await d3.csv('data/songs.csv')
        const shapesData = await d3.csv('data/melodyShapes.csv')
        const progressionsData = await d3.csv('data/chordProgressions.csv')
        const builder = new songBuilder(shapesData, progressionsData)
        songsData.forEach(d => {this.songs.push(builder.addSong(d))})
    }

    static getSongs(){
        return this.songs
    }

    static getSong(title){
        return this.songs.find(song => song.title === title)
    }

    static addLyric(songTitle, text){
        const thisSong = this.getSong(songTitle)
        thisSong.lyrics.push(new lyric(text))
    }

    static addLyricLine(section, line){
        section.lines.push(line)
    }

    static addMeasures(quantity, timeSignature){
        let measures = []
        for(let i = 0; quantity; i++){
            measures.push(new measure(timeSignature))
        }
        return measures
    }

}

class songBuilder {

    constructor(shapesData, progressionsData){
        this.shapesData = shapesData
        this.progressionsData = progressionsData
        
    }

    addSong(songData){
        const thisSong = new song(songData.songID, songData.songTitle)
        this.addBlocks(thisSong)
        return thisSong
    }

    getBlocks(songShapes){
        return [...new Set (songShapes.map(item => item.blockID))]
    }

    getSubBlocks(blockShapes){
        return [...new Set (blockShapes.map(item => item.subBlockID))]
    }

    filterForSong(data, songID){
        return data.filter(item => item.songID === songID)
    }

    filterForBlock(data, blockID){
        return data.filter(item => item.blockID === blockID)
    }

    filterForSubBlock(data, subBlockID){
        const filtered = data.filter(item => item.subBlockID === subBlockID)
        return filtered.length === 1 ? filtered[0] : filtered
    }
 
    addBlocks(thisSong){
        const songShapes = this.filterForSong(this.shapesData, thisSong.id)
        const songProgressions = this.filterForSong(this.progressionsData, thisSong.id)
        songShapes.forEach(item => {
            thisSong.blocks.push(this.getMelodyBlock(item))
            thisSong.blocks.push(this.getProgressionBlock(item, songProgressions))
        })
    }

    getMelodyBlock(item){
        return new melodyBlock (item)
    }

    getProgressionBlock(item, songProgressions){
        const progressionArray = this.getProgressionArray(item.blockID, songProgressions)
        return new progressionBlock (item, progressionArray)
    }

    getProgressionArray(blockID, songProgressions){
        return songProgressions.filter(item => item.blockID === blockID)
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

class song {
    constructor(id, title){
        this.id = id
        this.title = title
        this.lyrics = []
        this.blocks = []
    }
}

class songSection {
    constructor(id){
        this.id = id
        this.lines = []
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
