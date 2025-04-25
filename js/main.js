window.onload = async function(){
    await prepareData()
    loadSongList()
    //loadSongLayouts()
}

function loadSongList(){
    const songs = songsData.getAllSongs()
    const songList = new list('songs', songs)
    console.log(songList)
}

async function prepareData(){
    await songsData.load()
    await songSectionsData.load()
    return Promise.resolve()
}

function loadSongLayouts(){
    const songLayoutCanvas = new canvas('songLayout')
    //const sections = songSectionsData.getAllSections()
    const songs = songsData.getAllSongs()
    console.log(songs)
    
    //const multiLayout = new multiSongLayoutSetup(sections)
    //const data = multiLayout.getDataToRender()
    const rendering = new songListRendering
    rendering.renderList(songLayoutCanvas, songs)

    //renderSectionBlocks(songLayoutCanvas, sections)
}

class songListRendering{

    renderList(canvas, songs){
        const songPos = new songPositioning (songs)
        const enterFn = this.#enter

        canvas.selectAll('g.songTitle')
            .data(songs, d => d.id)
            .join(
                enter => enterFn(enter, songPos),
                update => update,
                exit => exit
            )
    }

    #enter(selection, songPos){
        const g = selection.append('g')
            .attr('class', 'songTitle')
            .attr('id', d => d.id)
            .attr('transform', (d, i) => songPos.getTranslate(i))

        g.append('text')
            .text(d => d.title)
            .style('fill', 'white') 
    }

}

class d3Helper {
    static getTranslateString(x, y){
        return "translate(" + x + "," + y + ")"
    }
} 

class songPositioning {
    #songs = []

    constructor (songs){
        this.#songs = songs
    } 

    getTranslate(i){
        const x = this.getPosX()
        const y = this.getPosY(i)
        return d3Helper.getTranslateString(x, y)
    }

    getPosX(){
        return 10
    }
    
    getPosY(i){
        const distanceFromSelected = i - songsData.getSelectedIndex()
        return distanceFromSelected * 16
    }


}

class canvas{
    constructor(id, container = d3.select('body'), dimensions){
        this.id = 'canvas' + id
        this.container = container
        this.createElement(dimensions.width, dimensions.height)
    }
    createElement(width, height){
        this.container.append('svg')
            .attr('id', this.id)
            .attr('width', width)
            .attr('height', height)
    }

    getElement(){
        return d3.select('#' + this.id)
    }

    resize(width, height){
        const elem = this.getElement()
        elem.attr('width', width)
            .attr('height', height)
    }


}

class div {
    constructor(id, container = d3.select('body')){
        this.id = 'div' + id
        this.container = container
        this.createElement(id)
    }

    createElement(){
        this.container.append('div').attr('id', this.id)
    }

    getElement(){
        return d3.select('#' + this.id)
    }

    resize(width, height, transition){
        const elem = this.getElement()
        elem.transition(transition)
            .style('width', width + 'px')
            .style('height', height + 'px')
    }

}



class songsData {

    static #songs = []

    static async load(){
        const songsData = await d3.csv('data/songs.csv')
        songsData.forEach(songDatum => {
            const thisSong = new song(songDatum.short_title)
            thisSong.title = songDatum.title
            this.#songs.push(thisSong)
        })

        return Promise.resolve()
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

class songSectionSetup {
    constructor(data){
        this.formData = data.formalSections
        this.sectionData = data.structuralSections
    }

    createStructuralSections(){
        const sections = []
        this.sectionData.forEach(section => {
            const thisSection = this.createStructuralSection(section)
            sections.push(thisSection)
        })
        return sections
    }

    createStructuralSection(section){
        const thisSection = new songSection(section.title, section.type)
        thisSection.setReferences(section.song_id, section.formal_section_id)
        thisSection.setPositionInSong(section.sequence_in_song)
        return thisSection
    }


    createFormalSections(){
        const formalSections = []
        this.formData.forEach(section => {
            const thisSection = this.createFormalSection(section)
            formalSections.push(thisSection)
        })
        return formalSections
    }

    createFormalSection(section){
        const thisSection = new formalSection(section.title)
        thisSection.songID = section.song_id
        thisSection.type = section.type
        return thisSection
    }

}

class songLayoutSetup {
    #sections = []

    constructor(sections){
        this.#sections = sections
    }

    getDataToRender(){
         
    }
}

class multiSongLayoutSetup {

    #sections = []

    constructor(sections){
        this.#sections = sections
    }

    getDataToRender(){
        return this.getSuffledSections()
    }

    getSuffledSections(sections = this.#sections){
        for (let i = sections.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [sections[i], sections[j]] = [sections[j], sections[i]];
        }
        return sections;
    }

    

}

class songSectionGrid {
    #sections =[]
    #height = 0
    #width = 0


    constructor(sections){
        this.#sections = sections
        this.#setDimensions()
    }

    getPosX(i){ 
        const remainder = arithmetic.getRemainder(i, this.#width)
        //console.log(remainder)
        return remainder * 15
    }

    getPosY(i){
        const quotient = arithmetic.getQuotient(i, this.#width)
        console.log(quotient)
        return quotient * 15
    }

    #setDimensions(){
        const sideLengths = this.#getGridDimensions(this.#sections.length)
        this.#width = sideLengths.long
        this.#height = sideLengths.short
        
    }

    #getGridDimensions(sectionCount){
        return {
            short: Math.round(Math.sqrt(sectionCount / 1.618)),
            long: Math.round(Math.sqrt(sectionCount * 1.618))
        }

    }
}

class songLayoutRendering {
    renderLayout(canvas, data){

        const classGrid = new songSectionGrid (data)

        canvas.selectAll('rect')
            .data(data)
            .join('rect')
            .attr('id', d => d.id)
            .attr('class', d => d.songID)
            .attr('height', 12)
            .attr('width', 12)
            .attr('fill', 'grey')
            .attr('x', (d, i) => classGrid.getPosX(i))
            .attr('y', (d, i) => classGrid.getPosY(i))
            .on('mouseover', sectionRectHover)
            .on('mouseout', sectionRectOff)
    }

    renderSongTitle(canvas, song){
        canvas.selectAll('text#songTitle')
            .data(song)
            .join(
                enter => enter.append('text')
                    .attr('id', 'songTitle')
                    .attr('fill', 'purple')
                    .attr('x', 100)
                    .attr('y', 100)
                    .text(d => d.title),
                update => update.text(d => d.title),
                exit => exit.attr('fill', 'black')
            )
    }
}

class songStructuring {
    constructor(sections){
        this.sections = sections
        this.stacks = []
    }

    createStacks(){
        let stack = {}
        for(let i = 0; i < this.sections.length; i++){
            if(this.newStackRequired(this.sections, i)){
                stack = new songSectionStack(this.stacks.length)
                this.stacks.push(stack)
            }
            stack.addSection(this.sections[i])
        }

        return this.stacks
    }



    newStackRequired(sections, i){
        return this.isStackable(sections[i], sections[i - 1]) ? false : true
    }


    getSubSequence(sections, i){
        if(i === sections.length - 1){
            return [sections[i]]
        } else {
            return [sections[i],sections[i + 1]]
        }
    }



    isStackable(thisSection, previousSection){
        const pairDescription = this.getSectionPairDescription(thisSection, previousSection)

       switch(pairDescription){
            case 'intro-verse':
                return this.isFormMatched(thisSection, previousSection) === false
            case 'chorus-bridge':
                return this.isFormMatched(thisSection, previousSection) === false && this.getFormalSectionType(thisSection) !== ''
            case 'verse-chorus':
                return true
            default:
                return false
        } 
    }


    getSectionPairDescription(thisSection, previousSection){
        try{return previousSection.type + "-" + thisSection.type}
        catch{return thisSection.type}
        
    }

    
    isFormMatched(thisSection, thatSection){
        return this.getFormalSectionType(thisSection) === this.getFormalSectionType(thatSection)
    }

    getFormalSectionType(section){
        return songSectionsData.getFormalSectionType(section.formalSectionID)
    }
    
}

class songSectionStack {

    #sections = []

    constructor(stackIndex){
        this.stackIndex = stackIndex
    }

    addSection(section){
        section.levelInStack = this.#getSectionLevel(section)
        section.stackOrdinal = this.stackIndex
        this.#sections.push(section)
    }

    getSectionCount(){
        return this.#sections.length
    }

    #getSectionLevel(section){
        const formalSection = songSectionsData.getFormalSection(section.formalSectionID)
        const songIndex = songsData.getSongIndex(this.songID)
        return formalSection.getLevel()
    }

    




}

class song {
    constructor(id){
        this.id = id
        this.selected = false
    }

    getSectionCount(){
        return this.sectionIDs.length
    }

    toggleSelection(){
        this.selected = true
    }
}

class songSection {
    constructor(id, type){
        this.id = id
        this.type = type
    }

    setReferences(songID, formalSectionID){
        this.songID = songID
        this.formalSectionID = formalSectionID
    }

    setPositionInSong(ordinal){
        this.ordinal = ordinal
    }

}



class formalSection {
    constructor(title){
        this.id = title
    }

    getLevel(){
        const charCode = this.getCharacterCode() 
        return charCode > 0 && charCode < 27 ? charCode : 0
    }

    getCharacterCode(){
        return this.type.toLowerCase().charCodeAt(0) - 96;
    }


}


function renderSectionBlocks (canvas, data){
    canvas.selectAll('rect')
        .data(data)
        .join('rect')
        .attr('id', d => d.id)
        .attr('height', 12)
        .attr('width', 12)
        .attr('fill', 'grey')
        .attr('x', d => d.stackOrdinal * 15 + 15)
        .attr('y', d => d.levelInStack * -15 + 150)
}


class arithmetic {
    static getQuotient(dividend, divisor){
        return Math.floor(dividend / divisor)
    }
    
    static getRemainder(dividend, divisor){
        const quotient = this.getQuotient(dividend, divisor)
        return dividend - (divisor * quotient)
    }

}

function sectionRectHover(){
    const rendering = new songLayoutRendering()
    const classText = d3.select(this).attr('class')
    d3.selectAll('rect.' + classText).attr('fill', 'red')
    d3.selectAll('rect:not(.' + classText).attr('fill', 'grey')
    const svg = d3.select('#songLayout')
    const song = songsData.getSong(classText)
    rendering.renderSongTitle(svg,[song])

}

function sectionRectOff(){
    const classText = d3.select(this).attr('class')
    d3.selectAll('rect.' + classText).attr('fill', 'grey')
}





