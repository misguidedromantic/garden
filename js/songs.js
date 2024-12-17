class songsDataHandling {
    static load(){
        this.#setSongs()
        this.lyricsHandling = new lyricsHandler
        const gab = this.getSong('good after bad')
        this.setupSong(gab)
        //this.lyricsHandling.setupLyrics(gab.title)
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

    static #setSongs(){
        this.songs = [
            new song ('ton of nothing'),
            new song ('intention and the act'),
            new song ('toiling avoiding'),
            new song ('good after bad')
        ]
    }
    
    static async setupSong(song){

        this.setupGoodAfterBad()
        
        song.lyrics = await this.lyricsHandling.setupLyrics('goodAfterBadLyrics.txt')

        const div = d3.select('body')
            .append('div')
            .attr('id','lyricsDiv')
            .style('position','absolute')
            .style('top','400px')
            .style('left','100px')
            
        const svg = div.append('svg')
        
        svg.append('text').text(song.lyrics[3].lines[0].text).attr('dy',20)
        
    }

    static setupGoodAfterBad(){

        const blockA = new songBlock ('A')
        blockA.subBlocks = [
            new songSubBlock('A', ['Eb4', 'Bb3'], [['EbMinor', 4],['BbMinor', 4]]),
            new songSubBlock('B', ['C4', 'Ab3'], [['AbMajor', 4],['DbMajor', 4]]),
            new songSubBlock('C', ['Db4', 'Bb3'], [['GbMajor', 2],['GbMajor/F', 2], ['EbMinor', 4]]),
            new songSubBlock('D', ['Gb3', 'Gb3'], [['EbMinor', 2],['BbMinor', 2], ['AbMajor', 4]]),
            new songSubBlock('E', ['F3', 'Bb3'], [['AbMajor', 4],['DbMajor', 4],['GbMajor', 8]])
        ]

    }

    static addMeasures(quantity, timeSignature){
        let measures = []
        for(let i = 0; quantity; i++){
            measures.push(new measure(timeSignature))
        }
        return measures
    }

    static addChord(chord){
        
    }
}

class songBuilder {

    constructor(){

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
    constructor(title){
        this.title = title
        this.lyrics = []
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

class songSubBlock {
    constructor(id, melodyShape, chordProgression){
        this.id = id
        this.setMelodyShape(melodyShape)
        this.setChordProgression(chordProgression)

    }

    setMelodyShape(melodyArray){
        this.shape = new melodyShape (melodyArray[0], melodyArray[1])
    }

    setChordProgression(progressionArray){
        this.progression = new chordProgression(progressionArray)
    }

}

class songBlock {
    constructor(id){
        this.id = id
    }

}

class chordProgression {
    constructor(progressionArray){
        this.chords = this.getChords(progressionArray)
    }

    getChords(progressionArray){
        let chords = []
        progressionArray.forEach(elem => {
            chords.push(new chord (elem[0], elem[1]))
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
