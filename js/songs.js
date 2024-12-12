class songsDataHandling {
    static load(){
        this.#setSongs()
        //this.#setupItentionAndTheAct()
        this.#loadTXTFile()
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

    static #setupItentionAndTheAct(){

        const title = 'intention and the act'
    
        const stanza = [
            'you carry callous thoughts',
            'and moral stones to talk with',
            'judge post haste',
            'and with careless aim',
            'so you send them spinning at my face'
        ]
    
        stanza.forEach(line => songsDataHandling.addLyric(title, line))
    
    }

    static async #loadTXTFile(fileName = 'good after bad - lyrics.txt'){
        const response = await fetch(fileName)
        const text = await response.text()
        const splitLines = text => text.split(/\r?\n/).filter(line => line !== '')
        const lines = splitLines(text)



        function getLineType(line){

            try{
                if(line.includes('verse')){
                    return 'verse'
                }
    
                if(line.includes('chorus')){
                    return 'chorus'
                }
    
                if(line.includes('outro')){
                    return 'outro'
                }

            }

            catch{
                return ''
            }
            

        }

        

        
        const sections = []

        function getCurrentSection(){
            const upperBound = sections.length - 1
            return sections[upperBound]
        }

        function getSection(line){

            const lineType = getLineType(line)
    


            switch(lineType){

                case undefined:
                    return


                case 'verse':
                    return new verse (line)

                case 'chorus':
                    return new chorus (line)

                case 'outro':
                    return new outro (line)

                default:
                    return getCurrentSection()
            }

            
        }

        let lineCount = 0

        lines.forEach(line => {

            const currentSection = getCurrentSection()
            const thisSection = getSection(line)

            switch(currentSection){
                case thisSection:
                    lineCount = lineCount + 1
                    thisSection.lines.push(new lyricLine(line, lineCount))
                    break;

                case 'break':
                    break;

                default:
                    sections.push(thisSection)
            
            }

        })

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
