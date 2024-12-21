class songsDataHandling {
    static songs = []

    static async load(){
        const songsData = await d3.csv('songs.csv')
        const shapesData = await d3.csv('melodyShapes.csv')
        const progressionsData = await d3.csv('chordProgressions.csv')
        const builder = new songBuilder(shapesData, progressionsData)
        songsData.forEach(d => {this.songs.push(builder.addSong(d))})
    }

    static getSongShapes(song, shapes){
        try{return shapes.find(shape => shape[0] === song.id)[1]}
        catch{return []}
    }

    static getSongProgressions(song, progressions){
        try{return progressions.find(progression => progression[0] === song.id)[1]}
        catch{return []}
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

class songBlockCanvas {
    static div = {}
    static svg = {}
    static blocks = []
    static width = 0
    static height = 0
    static left = 0
    static top = 400
    static position = 'absolute'
    static borderRadius = 20
}

class songBlockPositioning {

    static calculateTranslate(d, i){
        const x = 40
        const y = i * 30 + 40
        return this.#getTranslateString(x, y)
    }

    static #getTranslateString(x, y){
        return 'translate(' + x + ',' + y + ')'
    }
}

class songBlockControl {
    constructor(){
        this.canvasRendering = new songBlockCanvasRendering
        this.blockRendering = new songBlockRendering
    }

    createSongBlockCanvas(){
        songBlockCanvas.div = this.canvasRendering.createDiv()
        songBlockCanvas.svg = this.canvasRendering.createSVGCanvas()
    }

    loadSong(song){
        this.blockRendering.renderBlocks(song.blocks)
    }

}


class songBlockCanvasRendering {
    createDiv(){
        return d3.select('body')
            .append('div')
            .attr('id', 'songBlockCanvasDiv')
            .style('position', songBlockCanvas.position)
            .style('top', songBlockCanvas.top + 'px')

    }

    createSVGCanvas(){
        return songBlockCanvas.div.append('svg')
            .attr('id', 'songBlockCanvasSVG')
    }

    resize(delay, duration){
        songBlockCanvas.div.transition('tSizing').delay(delay).duration(duration)
            .style('width', songBlockCanvas.width + 'px')
            .style('height', songBlockCanvas.height + 'px')
    }
}

class songBlockRendering {

    renderBlocks(data){

        console.log(data)

        const enterControl = new blockEnter
        const updateControl = new blockUpdate
        const exitControl = new blockExit
        
        const groups = songBlockCanvas.svg.selectAll('g')
            .data(data, d => d.title)
            .join(
                enter => enterControl.enterBlocks(enter),
                update => updateControl.updateBlocks(update),
                exit => exitControl.exitBlocks(exit)
            )
    }


}

class blockEnter {

    enterBlocks(selection){
        const groups = this.enterGroups(selection)
        const rectangles = this.enterRects(groups)
    }

    enterGroups(selection){
        return selection.append('g')
            .attr('id', d => d.title)
            .attr('transform', (d, i) => songBlockPositioning.calculateTranslate(d, i))
    }

    enterRects(groups){

        groups.append('rect')
            .attr('class', 'melodyRect')
            .attr('width', '10')
            .attr('height', '10')
            .attr('fill', 'blue')


        groups.append('rect')
            .attr('class', 'progressionRect')
            .attr('y', '11')
            .attr('width', '10')
            .attr('height', '10')
            .attr('fill', 'blue')

        return groups
    }


}

class blockUpdate {

    updateBlocks(selection){
        const groups = this.updateGroups(selection)
        const rectangles = this.updateRects(groups)
    }

    updateGroups(selection){
        return selection.transition()
            .duration(400)
            .attr('transform', (d, i) => {
                return menuItemPositioning.calculateTranslate(d, i)
            })
    }

    updateRects(groups){
        return groups.select('rect')
            .attr('font-weight', d => d.selected ? 'bold' : 'normal')
            .attr('fill', d => d.selected && d.constructor.name === 'menuItem' && menu.state === 'subSelect' ? 'grey' : 'black')
    }

}

class blockExit {
    exitBlocks(selection){
        selection.remove()
        return selection
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
        const blockSet = this.getBlocks(songShapes)
        blockSet.forEach(id => {
            const thisBlock = new songBlock(id)
            this.addSubBlocks(thisBlock, songShapes, songProgressions)
            thisSong.blocks.push(thisBlock)
        }) 
    }

    addSubBlocks(thisBlock, songShapes, songProgressions){
        const blockShapes = this.filterForBlock(songShapes, thisBlock.id)
        const blockProgressions = this.filterForBlock(songProgressions, thisBlock.id)
        const subBlockSet = this.getSubBlocks(blockShapes)
        let subBlockArray = []

        subBlockSet.forEach(id => {
            const thisSubBlock = new songSubBlock (id)
            this.setupSubBlock(thisSubBlock, blockShapes, blockProgressions)
            thisBlock.subBlocks.push(thisSubBlock)
        })

    }

    setupSubBlock(thisSubBlock, blockShapes, blockProgressions){
        const subBlockShape = this.filterForSubBlock(blockShapes, thisSubBlock.id)
        const subBlockProgression = this.filterForSubBlock(blockProgressions, thisSubBlock.id)
        thisSubBlock.melodyShape = new melodyShape(subBlockShape.peakNote, subBlockShape.endNote)
        thisSubBlock.progression = new chordProgression(subBlockProgression)
    }

}

class blockBuilder {

    constructor(shapesData, progressionsData){
        this.shapesData = shapesData
        this.progressionsData = progressionsData
    }

    addBlock(blockID){
        console.log(blockID)
        const thisBlock = new songBlock (blockID)
        thisBlock.subBlocks = this.getSubBlocks(blockID)
        console.log(thisBlock)
    }

    getSubBlocks(blockID){
        const filteredMap = this.shapesData.filter(item => item.blockID === blockID).map(item => item.subBlockID)
        return [...new Set (filteredMap)]
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

class songSubBlock {
    constructor(id){
        this.id = id
    }

}

class songBlock {
    constructor(id){
        this.id = id
        this.subBlocks = []
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
