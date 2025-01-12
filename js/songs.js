class song {
    constructor(id, title){
        this.id = id
        this.title = title
        this.sections = []
        this.patternBlocks = []
        this.structureBlocks = []
    }
}

class structuralSection {
    constructor(id){
        this.id = id
    }
}

class formalSection {
    constructor(id){
        this.id = id
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




class songsDataHandling {
    static songs = []

    static async load(){
        await this.#loadData()
        this.#loadHandlers()
        this.#setupSongs()
    }

    static async #loadData(){

        const tableConnection = new airTableConnector()
        this.songsData = await tableConnection.getAllRecordsFromTable('songs')
        console.log(this.songsData)
        this.formalSectionData = await tableConnection.getAllRecordsFromTable('formal_sections')
        //this.songsData = await d3.csv('data/songs.csv')
        //this.songStructures = await d3.csv('data/songStructures.csv')
        //this.songPatterns = await d3.csv('data/songPatterns.csv')
        return Promise.resolve()

    }

    static #loadHandlers(){
        this.sectionHandling = new songSectionHandling(this.formalSectionData)
        //this.blockHandling = new songBlockHandling (this.songPatterns, this.songStructures)
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

    static getSongByID(id){
        return this.songs.find(song => song.id === id)
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
        console.log(this.sectionData)
        return this.sectionData.filter(element => element.songID === songID)
    }

    #getSectionIDs(songID){
        const songSectionData = this.#getSectionDataForSong(songID)
        return [...new Set (songSectionData.map(element => element.sectionID))]
    }

    #createSongSection (sectionID){
        const sectionType = songSectionHandling.getSectionType(sectionID)
        switch(sectionType){
            case 'intro':
                return new intro (sectionID)

            case 'verse':
                return new verse (sectionID)

            case 'chorus':
                return new chorus (sectionID)

            case 'bridge':
                return new bridge (sectionID)

            case 'outro':
                return new outro (sectionID)  

            default:
                return new structuralSection (sectionID)
        }
    }

    static getSectionType(sectionID){
        for (let sectionType of ['intro','verse','chorus','bridge','outro']){
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



class intro extends structuralSection {
    constructor(id){
        super(id)
    }
}

class verse extends structuralSection {
    constructor(id){
        super(id)
    }
}

class chorus extends structuralSection {
    constructor(id){
        super(id)
    }
}

class bridge extends structuralSection {
    constructor(id){
        super(id)
    }
}

class outro extends structuralSection {
    constructor(id){
        super(id)
    }
}

class songBlockCanvas {
    static div = {}
    static svg = {}
    static blocks = []
    static width = 0
    static height = 600
    static left = 72
    static top = 160
    static position = 'absolute'
    static borderRadius = 20
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
        this.blockRendering.renderBlocks(song.structureBlocks)
    }

}

class songBlockCanvasRendering {
    createDiv(){
        return d3.select('body')
            .append('div')
            .attr('id', 'songBlockCanvasDiv')
            .style('position', songBlockCanvas.position)
            .style('top', songBlockCanvas.top + 'px')
            .style('left', songBlockCanvas.left + 'px')
            .style('height', songBlockCanvas.height + 'px')
            //.style('background-color', 'white')

    }

    createSVGCanvas(){
        return songBlockCanvas.div.append('svg')
            .attr('id', 'songBlockCanvasSVG')
            .attr('height', songBlockCanvas.height)
    }

    resize(delay, duration){
        songBlockCanvas.div.transition('tSizing').delay(delay).duration(duration)
            .style('width', songBlockCanvas.width + 'px')
            .style('height', songBlockCanvas.height + 'px')
    }
}

class songBlockPositioning {

    static calculateTranslate(d, i){
        const x = this.#getXPos(d)
        const y = this.#getYPos(d)
        return this.#getTranslateString(x, y)
    }

    static #getXPos(d){
        return blockDataHandling.getBlockNumberInGroup(d.id, d.sectionID) * 17
    }

    static #getYPos(d){
        return (d.sectionIndex * 40) + (d.constructor.name === 'melodyBlock' ? 0 : 17)
    }

    static #getTranslateString(x, y){
        return 'translate(' + x + ',' + y + ')'
    }
}

class songBlockStyling {
    static calculateFill(d){
        let variationFactor = this.#getVariationFactor(d)
        switch(variationFactor){
            case 0:
                return 'lightGrey'

            case 1:
                return 'pink'

            case 2:
                return 'purple'

            default:
                if(variationFactor < 0){
                    return 'lightYellow'
                } else {
                    return 'red'
                }
                
        }
    }

    static calculateStroke(d){
        const variationFactor = this.#getVariationFactor(d)
        if(variationFactor < 0){return 'lightGrey'}else{return this.calculateFill(d)}
    }

    static #getVariationFactor(d){
        if(d.constructor.name === 'melodyBlock'){
            return blockDataHandling.getMelodyBlockVariationLevel(d) 
        }

        if(d.constructor.name === 'progressionBlock'){
            return blockDataHandling.getProgressionBlockVariationLevel(d) 
        }
    }
}

class songBlockRendering {

    renderBlocks(data){
        console.log(data)
        const enterControl = new blockEnter
        const updateControl = new blockUpdate
        const exitControl = new blockExit
        
        songBlockCanvas.svg.selectAll('g')
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
            .attr('class', d => d.constructor.name)
            .attr('width', 14)
            .attr('height', 14)
            .attr('fill', d => songBlockStyling.calculateFill(d))
            .attr('stroke', d => songBlockStyling.calculateStroke(d))
            .attr('stroke-width', 1)


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