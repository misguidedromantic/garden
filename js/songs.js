class songsDataHandling {
    static load(){
        this.#setSongs()
        //this.lyricsHandling = new lyricsHandler
        //const gab = this.getSong('good after bad')
        //this.setupSong(gab)
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
    
    static setupSong(song){
        song.lyrics = this.lyricsHandling.setupLyrics(song.title)
        const div = d3.select('body')
            .append('div')
            .attr('id','lyricsDiv')
            .style('position','absolute')
            .style('top','400px')
            .style('left','100px')
            
        const svg = div.append('svg')
        
        svg.append('text').text(song.lyrics[3])
        
    }
}


class lyricsHandler{
    
    async setupLyrics(songTitle){
        const lyricsFileName = songTitle + '- lyrics.txt'
        const lyricsText = await this.getLyricsFromFile(lyricsFileName)
        return this.setLines(lyricsText)
    }
    
    async getLyricsFromFile(fileName){
        const response = await fetch(fileName)
        return await response.text()
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
            this.isLineType(line, sectionType) ? result = sectionType
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

class lyric {
    constructor(text){
        this.text = text
    }

}

class lyricLine {
    constructor(text, i){
        this.text = text
        this.id = 'line' + i
    }


}

class songSection {
    constructor(id){
        this.id = id
        this.lines = []
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
