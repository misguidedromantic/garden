window.onload = async function(){
    await prepareData()
    loadSongLayouts()
}

async function prepareData(){
    await songsData.load()
    await songSectionsData.load()
    return Promise.resolve()
}

function loadSongLayouts(){
    const songLayoutCanvas = new canvas('songLayout')
    const sections = songSectionsData.getAllSections()
    const multiLayout = new multiSongLayoutSetup(sections)
    const data = multiLayout.getDataToRender()
    const rendering = new songLayoutRendering()
    rendering.renderLayout(songLayoutCanvas, data)

    //renderSectionBlocks(songLayoutCanvas, sections)
}

class canvas{
    constructor(id, container = d3.select('body')){
        this.id = id
        this.container = container
        this.createElement(id)
        return this.getElement()
    }
    createElement(){
        this.container.append('svg').attr('id',this.id)
    }

    getElement(){
        return d3.select('#' + this.id)
    }
}


class songsData {

    static #songs = []

    static async load(){
        const songsData = await d3.csv('data/songs.csv')
        songsData.forEach(songDatum => {this.#songs.push(new song(songDatum.short_title))})
        return Promise.resolve()
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
        console.log(sideLengths)
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
    }

    getSectionCount(){
        return this.sectionIDs.length
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
    const classText = d3.select(this).attr('class')
    d3.selectAll('rect.' + classText).attr('fill', 'red')
    d3.selectAll('rect:not(.' + classText).attr('fill', 'grey')
}

function sectionRectOff(){
    const classText = d3.select(this).attr('class')
    d3.selectAll('rect.' + classText).attr('fill', 'grey')
}





