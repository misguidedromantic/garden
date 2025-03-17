window.onload = async function(){
    await prepareData()
    loadSongLayouts()
}

async function prepareData(){
    await songsDataInterface.initialise()
    await songStructureDataInterface.initialise()
    return Promise.resolve()
}

function loadSongLayouts(){
    const songLayoutCanvas = new canvas('songLayout')
    const sections = songStructureDataInterface.getAllSections()
    renderSectionBlocks(songLayoutCanvas, sections)
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


class songsDataInterface {

    static #songs = []

    static async initialise(){
        const songsData = await this.#extract()
        this.#load(songsData)
        return Promise.resolve()
    }

    static getSectionCount(songID){
        return songStructureDataInterface.getSongSections(songID).length
    }

    static #extract(){
        return d3.csv('data/songs.csv')
    }

    static #load(songsData){
        const setup = new songsSetup(songsData)
        this.#songs = setup.createSongs()
    }

    static getSongIndex(songID){
        return this.#songs.findIndex(song => song.id === songID)
    }
}

class songsSetup {
    constructor(songsData){
        this.songsData = songsData
    }
    
    createSongs(){
        const songs = []
        this.songsData.forEach(songDatum => {
            const thisSong = new song(songDatum.short_title)
            songs.push(thisSong)
        })
        return songs
    }
}


class songStructureDataInterface{

    static #sections = []
    static #form = []

    static async initialise(){
        const data = await this.#extract()
        this.#load(data)
        this.#transform()
        return Promise.resolve()
    }

    static async #extract(){
        return {
            formalSections: await d3.csv('data/formal_sections.csv'),
            structuralSections: await d3.csv('data/structural_sections.csv')
        }
    }

    static #load(data){
        const sectionSetup = new songSectionSetup(data)
        this.#form = sectionSetup.createFormalSections()
        this.#sections = sectionSetup.createStructuralSections()
    }

    static #transform(){
        const structuring = new songStructuring(this.#sections)
        structuring.createStacks()
    }

    static getAllSections(){
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
        return songStructureDataInterface.getFormalSectionType(section.formalSectionID)
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

    getSections(){
        return this.#sections
    }

    #getSectionLevel(section){
        const formalSection = songStructureDataInterface.getFormalSection(section.formalSectionID)
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
        const letterNumber = this.getLetterNumber() 
        const songIndex = songsDataInterface.getSongIndex(this.songID) 
        return letterNumber + songIndex
    }

    getLetterNumber(){
        const charCode = this.type.toLowerCase().charCodeAt(0) - 96;
        return charCode > 0 && charCode < 27 ? charCode : 0
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



