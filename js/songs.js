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
        song.lyrics = await this.lyricsHandling.setupLyrics('goodAfterBadLyrics.txt')

        console.log(song.lyrics)
        console.log(song.lyrics[3].lines[0].text)

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
        const blocks = [
            
        ]
        
        
        
        
        const thisBlock = new songBlock ('AA')
        const fourFour = new timeSignature(4, 4)

       

        const thisMeasure = new measure(fourFour)

        const EbMinor = new chord ('EbMinor')

        thisBlock.measures = [
            new measure (fourFour),
            new measure (fourFour),
            new measure (fourFour),
            new measure (fourFour)
        ]

        this.blocks.measures[0].beats = [
            new beat (EbMinor, 1),
            new beat (EbMinor, 2),
            new beat (EbMinor, 3),
            new beat (EbMinor, 4)
        ]

        

        
        //thisBlock.measures = this.addMeasures(4, fourFour)

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

class songBlock {
    constructor(id){
        this.id = id
        this.melody = {}
        this.lyrics = {}
        this.chords = {}
    }
}

class measure {
    constructor(timeSignature){
        this.timeSignature = timeSignature
    }
}

class chord {
    constructor(id){
        this.id = id
    }
}

class beat {
    constructor(chord, position){
        this.chord = chord
        this.position = position
    }
}

class note {
    constructor(pitch, accidental){

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
