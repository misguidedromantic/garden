window.onload = async function(){
    await prepareData()
    displays.loadSongsDisplay()
    //loadSongLayouts()
}

function loadSongLayouts(){
    songLayoutDisplay.setup()
    songLayoutDisplay.load()
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

class displays {

    static #songDisplay = {}

    static loadSongsDisplay (){
        this.#songDisplay = new songDisplay
        this.#songDisplay.setup()
        this.#songDisplay.loadMenu()
    }

}

class songDisplay {

    #menuControl = {}
    #windowControl = {}

    setup(){        
        this.setupWindow()
        this.setupMenu()
    }

    setupWindow(id = this.constructor.name + 'Window'){
        this.#windowControl = new windowControl
        this.#windowControl.createDiv(id)
        this.#windowControl.createSVG(id)
    }

    setupMenu(){
        this.#menuControl = new menuControl
        this.#menuControl.create('songs')
        this.#menuControl.setItems(songsData.getAllSongs())
    }

    loadMenu(){
        const dimensions = this.#menuControl.getDimensionsExpanded()
        console.log(dimensions)
        this.#windowControl.resize(dimensions)
        this.#menuControl.update(this.#windowControl.svg)
    }
}

class windowControl {
    
    div = {}
    svg = {}
    divWidth = 0
    divHeight = 0
    svgWidth = 0
    svgHeight = 0

    createDiv(id, container = d3.select('body')){
        this.div = container.append('div').attr('id', id + 'Div')
    }
    
    createSVG(id, container = this.div){
        this.svg = container.append('svg').attr('id', id + 'Svg')
    }

    resize(dimensions){
        this.resizeDiv(dimensions.width, dimensions.divHeight)
        this.resizeSVG(dimensions.width, dimensions.svgHeight)
    }


    resizeDiv(width, height){
        this.div.style('width', width + "px").style('height', height + "px")
    }

    resizeSVG(width, height){
        this.svg.attr('width', width).attr('height', height)
    }

}

class menuControl {

    #menu = {}
    #itemRendering = {}
    
    create(menuName){
        this.#menu = new menu (menuName)
        this.#itemRendering = new menuItemRendering
    }

    setItems(items){
        this.#menu.items = items
    }

    getDimensionsExpanded(){
        return {
            divHeight: this.#getMaxWindowHeight(),
            svgHeight: this.#getAllItemsHeight(),
            width: this.#menu.maxWidth
        }
    }

    #getAllItemsHeight(){
        return this.#calculateHeightForItems(this.#menu.items.length)
    }

    #getMaxWindowHeight(){
        const allItemsHeight = this.#getAllItemsHeight()
        return allItemsHeight < this.#menu.maxHeight ? allItemsHeight : this.#menu.maxHeight
    }

    #calculateHeightForItems(itemCount){
        return (itemCount + 1) * menuItem.fontSize * 2 + menuItem.padding * 3
    }

    update(svg){
        this.#itemRendering.render(svg, this.#menu.items)
    }
}


class songLayoutDisplay {

    static #menu = {}
    static #windowSettings = {}
    static #layoutViewer = {}
    static #menuItemRendering = {}

    static setup(){
        this.#setupWindow()
        


    }

    static #setupWindow(){
        this.div = new div ('songLayout')
        this.svg = new svg ('songLayout', this.div.getElement())
        this.#windowSettings = new layoutWindowSettings (this.div, this.svg)
    }

    static #setupMenu(){
        this.#menu = new menu ('songs')
        this.#menuItemRendering = new menuItemRendering
    }

    static load (){
        this.#menu.items = songsData.getAllSongs()
        this.#menuItemRendering.render(this.svg, this.#menu.items)
        this.#windowSettings.setDimensionsToExpandedMenu(this.#menu.items.length)
        this.div.resize()
        this.svg.resize()
    }

    static loadLayout(songID){
        const sections = songSectionsData.getSongSections(songID)
        const structuring = new songStructuring (sections)
        const stacks = structuring.createStacks()
        renderSectionBlocks(this.svg.getElement(), sections)
    }
}

class layoutWindowRendering {

    createWindow(){

    }

}

class windowSettings {

    constructor(div, svg){
        this.div = div
        this.svg = svg
        this.#setBounds()
    }

    setDimensionsToExpandedMenu(itemCount){
        this.setToMenuExpandedHeight(itemCount)
        this.setToMenuWidth()
    }

    setToMenuWidth(){
        this.div.width = this.maxMenuWidth
        this.svg.width = '100%'
    }

    setToMenuExpandedHeight(itemCount){
        this.div.height = this.#getExpandedMenuHeight(itemCount)
        this.svg.height = this.#getExpandedMenuHeight(itemCount)
    }

    #setBounds(){
        this.minHeight = this.#getHeightForItemCount(2)
        this.maxHeight = window.innerHeight * 0.618
        this.maxMenuWidth = window.innerWidth / 2
    }

    #getExpandedMenuHeight(itemCount){
        const allItemsHeight = this.#getHeightForItemCount(itemCount)
        return allItemsHeight < this.maxHeight ? allItemsHeight : this.maxHeight
    }

    #getHeightForItemCount(itemCount){
        return itemCount * menuItem.fontSize * 2 + menuItem.padding * 3
    }

}



class songListControl {

    static #songs = []
    static #songMenu = {}

    static load (div, svg){
        this.#songMenu = new menu ('songs', 'songs')
        this.#songMenu.setup(div, svg)
        this.#songs = songsData.getAllSongs()
        this.#songMenu.update(this.#songs)
    }

    static selectSong (songID) {
        this.deselectAll()
        const thisSong = this.#songs.find(song => song.id === songID)
        thisSong.selected = true
        this.#songMenu.update(this.#songs)
        songLayoutsDisplay.loadLayout(songID)
    }

    static deselectAll(){
        this.#songs.forEach(song => song.selected === false)
    }

}

function onItemHover(){
    const elem = d3.select(this)
    const rect = elem.selectAll('rect.bar')
    const text = elem.selectAll('text')
    
    rect.attr('fill', 'pink')
        .attr('opacity', 1)

    text.style('fill', 'pink')
}

function onItemOut(){
    const elem = d3.select(this)
    const rect = elem.selectAll('rect.bar')
    const text = elem.selectAll('text')

    rect.attr('fill', 'white')
        .attr('opacity', 0.4)

    text.style('fill', 'white')
}

function onItemClick(){
    const clickedSongID = d3.select(this).attr('id')
    songListControl.selectSong(clickedSongID)

}

class listItem {
    static fontSize = 16
    static padding = 4
}


class menuItemRendering {

    #svg = {}

    render(svg, items){
        const positioning = new listItemPositioning (items)
        const enterFn = this.#enter
        const updateFn = this.#update

        svg.selectAll('g.listItem')
            .data(items, d => d.id)
            .join(
                enter => enterFn(enter, positioning),
                update => updateFn(update, positioning),
                exit => exit
            )
    }

    #enter(selection, positioning){
        const g = selection.append('g')
            .attr('class', 'listItem')
            .attr('id', d => d.id)
            .attr('transform', (d, i) => positioning.getTranslate(d, i))
            .on('mouseover', onItemHover)
            .on('mouseout', onItemOut)
            .on('click', onItemClick)

        g.append('text')
            .text(d => d.title)
            .style('fill', 'white')
            .style('font-size', listItem.fontSize) 
            .attr('dx', listItem.padding * 2)
            .attr('dy', listItem.fontSize + listItem.padding / 2)

        g.append('rect')
            .attr('class', 'container')
            .attr('width', 300)
            .attr('height', listItem.fontSize * 2 - listItem.padding)
            .attr('fill', 'white')
            .attr('opacity', 0)

        g.append('rect')
            .attr('class', 'bar')
            .attr('width', 4) // 218 about right, but need to make this dynamic
            .attr('height', listItem.fontSize * 2 - listItem.padding)
            .attr('fill', 'white')
            .attr('opacity', 0.4)

    }

    #update(selection, positioning){

        const gT = d3.transition('g').duration(500)
        const textT = d3.transition('text').duration(500)

        const g = selection.transition(gT)
            .attr('transform', (d, i) => positioning.getTranslate(d, i))
            
        g.select('text').style('fill', d => {return d.selected ? 'white' : 'transparent'})


    }
}

class listItemPositioning {

    constructor(items){
        this.items = items
    }

    getTranslate(d, i){
        const x = this.getPosX()
        const y = this.getPosY(d, i)
        return d3Helper.getTranslateString(x, y)
    }

    getPosX(){
        return 10
    }
    
    getPosY(d, i){
        if(this.getSelectedItemIndex() === -1){
            return (i + 1) * listItem.fontSize * 2
        } else {
            return d.selected ? listItem.fontSize * 2 : -50
        }


        const distanceFromSelected = i - this.getSelectedItemIndex()
        return distanceFromSelected * listItem.fontSize * 2
    }

    getSelectedItemIndex(){
        return this.items.findIndex(item => item.selected === true)
    }

}

class menu {
    items = []
    maxHeight = 0
    maxWidth = 0

    constructor(id){
        this.id = id
        this.setMaxDimensions()
    }

    setMaxDimensions(){
        this.maxHeight = window.innerHeight * 0.618
        this.maxWidth = window.innerWidth / 2
    }
}

class menuItem {
    static fontSize = 16
    static padding = 4

    constructor(label, action){
        this.label = label
        this.action = action
    }


}



class navigation {
    static #displays = []

    static loadSongLayouts(){

    }
}

class d3Helper {
    static getTranslateString(x, y){
        return "translate(" + x + "," + y + ")"
    }
} 

class svg{

    width = 0
    height = 0
    

    constructor(id, container = d3.select('body')){
        this.id = 'svg' + id
        this.container = container
        this.createElement()
    }
    createElement(width = 10, height = 10){
        this.container.append('svg')
            .attr('id', this.id)
            //.attr('width', width)
            //.attr('height', height)
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

    width = 0
    height = 0
    top = 0
    left = 0
    
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
    renderLayout(svg, data){

        const classGrid = new songSectionGrid (data)

        svg.selectAll('rect')
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

    renderSongTitle(svg, song){
        svg.selectAll('text#songTitle')
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


function renderSectionBlocks (svg, data){
    svg.selectAll('rect.section')
        .data(data)
        .join('rect')
        .attr('class','section')
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





