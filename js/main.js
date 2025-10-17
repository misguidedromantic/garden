const gRatio = 1.618

window.onload = async function(){



/*     songsData.loadSongwritingArtefacts()

    function createGoodAfterBad(){
        const artefacts = songsData.getAllSongwritingArtefacts()
        const gab = new song('gab', 'Good After Bad')
        gab.addSongwritingEvent(new songwritingEvent(gab, 'structure', artefacts[3]))

        function createSectionArchetypes(gab){
            function setupVerse(songID){
                const verse = new songSectionArchetype(songID + 'Verse', 'verse')
                gab.addSongwritingEvent(new songwritingEvent(verse, 'melody', artefacts[0])),
                gab.addSongwritingEvent(new songwritingEvent(verse, 'chords', artefacts[0]))
                return verse
            }
    
            function setupChorus(songID){
                const chorus = new songSectionArchetype(songID + 'Chorus', 'chorus')
                gab.addSongwritingEvent(new songwritingEvent(chorus, 'melody', artefacts[2])),
                gab.addSongwritingEvent(new songwritingEvent(chorus, 'chords', artefacts[2]))
                return chorus
            }
            
            gab.addSectionArchetype(setupVerse(gab.id))
            gab.addSectionArchetype(setupChorus(gab.id))
        }
    
        function createSectionInstances(gab){
            gab.addSectionInstance(new songSectionInstance(gab.id, 'Intro', 'Verse', 1))
            gab.addSectionInstance(new songSectionInstance(gab.id, 'Verse1', 'Verse', 2))
            gab.addSectionInstance(new songSectionInstance(gab.id, 'Chorus1', 'Chorus', 3))
            gab.addSectionInstance(new songSectionInstance(gab.id, 'Verse1', 'Verse', 4))
            gab.addSectionInstance(new songSectionInstance(gab.id, 'Chorus2', 'Chorus', 5))
            gab.addSectionInstance(new songSectionInstance(gab.id, 'Chorus3', 'Chorus', 6))
            gab.addSectionInstance(new songSectionInstance(gab.id, 'Outro', 'Chorus', 7))
        }

        createSectionArchetypes(gab)
        createSectionInstances(gab)
        return gab
    }

    function getHistories(song){
        return song.sectionArchetypes.flatMap(outerObject => 
            outerObject.history.map(innerObject => ({
                sectionID: outerObject.id,
                historyEvent: innerObject.event,
                historyDate: innerObject.date
            })))

    }


    const goodAfterBad = createGoodAfterBad()
    const histories = getHistories(goodAfterBad)
    displays.loadSongHistoryDisplay(goodAfterBad, histories) */

    loadPageTitle()

}

function loadPageTitle(text){
    
    
    function create(){
        const factory = new cardFactory
        return factory.createCard('mgrTitle', 'titleCard')
    }

    function configureCard(){

        console.log(window.innerWidth)
        

        const width = window.innerWidth / gRatio * window.devicePixelRatio
        const height = width * 9 / 16 * window.devicePixelRatio
        card.canvas.attr('width', width +'px').attr('height', height + 'px')


        //card.div.style('width', width + 'px')
        //card.canvas.style('width', width + 'px')

    }

    function configureText(text){
        const lines = text.split(' ')

    }

    

    function getConfiguredContext(canvas, lines){

            function addLines(ctx, lines){
                let y = 15
                let lineHeight = 35
        
                for (let i = 0; i < lines.length; i++) {
                    ctx.fillText(lines[i], 50, y + (i * lineHeight));
                }
            }

            const ctx = canvas.getContext('2d')
            ctx.font = '36px Arial';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';

            addLines(ctx, lines)

            return ctx
    }

    function getImg(imgPath){
        const img = new Image();
        img.src = imgPath
        return img
    }

    function render(canvas, img, ctx){
        
        img.onload = () => {
            ctx.globalCompositeOperation = 'source-in';
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
    }

    const card = create()

    configureCard(card)

    const canvas = card.canvas.node()
    const lines = ['MISGUIDED', 'ROMANTIC']
    const imgPath = 'images/pexels-francesco-ungaro-2325447.jpg'
    const img = getImg(imgPath)
    const ctx = getConfiguredContext(canvas, lines)
    const metrics = ctx.measureText('MISGUIDED')
    console.log(metrics.width)


    console.log(canvas.width)

    render(canvas, img, ctx)

}

function createImageText(canvas){
            const ctx = canvas.getContext('2d')
            ctx.textAlign = 'left'

            const img = new Image();
            img.src = 'images/pexels-francesco-ungaro-2325447.jpg';  // Replace with your image path

            img.onload = () => {
                ctx.font = '30px Arial';
                //ctx.textAlign = 'left';
                ctx.textBaseline = 'middle';
                ctx.fillText('MISGUIDED', 15, 15);
                ctx.fillText('ROMANTIC', 15, 45)

                // Set compositing operation to clip the image to the text
                ctx.globalCompositeOperation = 'source-in';

                console.log(canvas.height)

                // Draw the image, which will now be clipped by the text
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            };
        }

class card {

    stdCanvas = false
    svgCanvas = true
    backgroundColour = 'transparent'

    constructor(id){
        this.id = id
    }

}

class titleCard extends card {

    stdCanvas = true
    svgCanvas = false
    //backgroundColour = 'transparent'


    constructor(id){
        super(id)
    }
}

class cardFactory {

    createCard(id, type = undefined){
        const card = this.#createObject(id, type)
        this.#createDomElements(card)
        return card
    }

    #createObject(id, type){
        switch(type){
            case 'titleCard':
                return new titleCard(id)
            default:
                return new card(id)
        }
    }

    #createDomElements(card){
        this.#addDiv(card)
        
        if(card.stdCanvas){
            this.#addCanvas(card)
        }

        if(card.svgCanvas){
            this.#addSvg(card)
        }
    }

    #addDiv(card){
        card.div = d3.select('body')
            .append('div')
            .attr('id', card.id + 'Div')
            .style('position', 'absolute')
            .style('width', '80%')
            //.style('border-radius', '10px')
            .style('background-color', card.backgroundColour)
            //.style('box-shadow', '0px 0px 0px rgba(0, 0, 0, 0)')
    }

    #addCanvas(card){
        card.canvas = card.div.append('canvas')
            .attr('id', card.id + 'Canvas')

    }

    #addSvg(card){
        card.svg = card.div.append('svg')
            .attr('id', card.id + 'Svg')
    }

}




class song {
    constructor(id, title){
        this.id = id
        this.title = title
        this.sectionArchetypes = []
        this.sectionInstances = []
        this.history = []
    }

    addSectionArchetype(archetype){
        this.sectionArchetypes.push(archetype)
    }

    addSectionInstance(instance){
        this.sectionInstances.push(instance)
    }

    addSongwritingEvent(event){
        this.history.push(event)
    }

    addKeyDate(event, year, month){
        month = month - 1
        const eventDate = new Date (year, month)
        this.history.push({event: event, date: eventDate})
    }

    getArchetype(archetypeID){
        return this.sectionArchetypes.find(obj => obj.id = archetypeID)
    }

}


class songSectionArchetype {
    constructor(id, type, parentID = null){
        this.id = id
        this.type = type
        this.parentID = parentID
        this.history = []
    }

    addKeyDate(event, year, month){

        month = month - 1
        const eventDate = new Date (year, month)
        this.history.push({event: event, date: eventDate})
    }

    getConceptionDate(){
        const entry = this.history.find(entry => entry.event === 'conception')
        console.log(entry)
    }
}

class songwritingEvent {
    constructor(structuralElement, musicalElement, sourceArtefact){

    }
}

class songwritingArtefact {
    constructor(dateString, type, title){
        this.date = getDate(dateString)
        this.type = type
        this.title = title
        this.events = []
    }

    addSongwritingEvent(event){
        this.events.push(event)
    }

}

function getDate(string){
    const arr = string.split("-")
    return new Date (arr[0], arr[1], arr[2])
}

class songSectionInstance {
    constructor(songID, sectionType, archetypeType, sequenceNumber){
        this.id = songID + sectionType
        this.type = sectionType
        this.archetypeID = songID + archetypeType
        this.sequenceNumber = sequenceNumber
    }

}



async function prepareData(){
    await songsData.load()
    await songSectionsData.load()
    //songConceptModelData.load()
    return Promise.resolve()
}

function loadDisplay(displayName){

}

class displays {

    static #songsHistoryDisplay = {}

    static loadSongHistoryDisplay(song, histories){
        this.#songsHistoryDisplay = new songHistoryDisplay(song)
        this.#songsHistoryDisplay.renderArchetypeHistories(histories)
        //this.#songsHistoryDisplay.renderHistory(song)
    }

}
class songHistoryDisplay {

    #windowControl = {}
    static timeSpan = {}
    static xScale = {}

    constructor(song){        
        this.setupWindow()
        this.setScale(song)
    }

    setupWindow(id = this.constructor.name + 'Window'){
        this.#windowControl = new windowControl
        this.#windowControl.createDiv(id)
        this.#windowControl.createSVG(id)
    }

    setScale(song){
        songHistoryDisplay.xScale = {
            min: 15,
            max: 250
        }
        this.setTimeSpan(this.getSectionArray(song))
    }

    renderHistory(song){

        const svg = d3.select('#songHistoryDisplayWindowSvg')
        const data = this.getSectionArray(song)
        this.setTimeSpan(data)
        
        const func = {
            getPosX: this.getPosX,
            getPosY: this.getPosY,
            scalePoint: this.scalePoint
        }

        console.log(data)

        svg.selectAll('rect')
            .data(data, d => d.id)
            .join(
                enter => enter.append('rect')
                    .attr('id', d => d.id)
                    .attr('height', 12)
                    .attr('width', 12)
                    .attr('fill', 'grey')
                    .attr('x', d => func.getPosX(d, func.scalePoint))
                    .attr('y', d => func.getPosY(d)),
                update => update,
                exit => exit
            )
    }

    renderArchetypeHistories(historyData){
        
        const svg = d3.select('#songHistoryDisplayWindowSvg')
        const func = {
            getPosX: this.getPosX,
            getPosY: this.getPosY,
            scalePoint: this.scalePoint
        }

        console.log(historyData)
        
        svg.selectAll('rect')
            .data(historyData, d => d.id)
            .join(
                enter => enter.append('rect')
                    .attr('id', d => d.id)
                    .attr('height', 12)
                    .attr('width', 12)
                    .attr('fill', 'grey')
                    .attr('x', d => func.scalePoint(d.historyDate.getTime()))
                    .attr('y', 30),
                update => update,
                exit => exit
            )



    }

    getPosX(d, scaleFunc){
        
        
        if(d.constructor.name === 'songSectionArchetype'){
            const conception = d.history.find(obj => obj.event === 'conception')
            return scaleFunc(conception.date.getTime())
        }

        else{
            return songHistoryDisplay.xScale.max + 15
        }
    }

    getPosY(d){
        let multiplier = 0
        if(d.constructor.name === 'songSectionArchetype'){
            switch(d.type){
                case 'verse':
                    multiplier = 1
                    break;
                
                case 'chorus':
                    multiplier = 2
                    break;
            }
        } else {
            multiplier = d.sequenceNumber
        }
        
        return multiplier * 15
    }

    getSectionArray(song){
        return [...song.sectionArchetypes, ...song.sectionInstances]
    }

    getArchetypeHistories(song){
        const histories = song.sectionArchetypes.map(obj => obj.history)
        
    }

    setTimeSpan(sections){
        const events = this.getSectionHistorySerials(sections)
        songHistoryDisplay.timeSpan = {
            min: Math.min(...events),
            max: Math.max(...events)
        }
    }

    getSectionHistorySerials(sections){
        const events = new Set()
        
        sections.forEach(section => {
            if(section.constructor.name === 'songSectionArchetype'){
                section.history.forEach(historyEvent => {
                    events.add(historyEvent.date.getTime())
                })
            }
        })

        return events
    }

    scalePoint(value){
        const inMin = songHistoryDisplay.timeSpan.min
        const inMax = songHistoryDisplay.timeSpan.max
        const outMin = songHistoryDisplay.xScale.min
        const outMax = songHistoryDisplay.xScale.max
        const scaledValue = (value - inMin) * (outMax -outMin) / (inMax - inMin) + outMin
        return scaledValue
    }
}



class songsDisplay {

    #menuControl = {}
    #windowControl = {}
    #historyControl = {}

    setup(){        
        this.setupWindow()
        //this.setupMenu()
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
        this.#windowControl.resize(dimensions)
        this.#menuControl.update(this.#windowControl.svg)
    }

    loadSongLayout(songID){
        const sections = songSectionsData.getSongSections(songID)
        const structuring = new songStructuring (sections)
        structuring.createStacks()
        renderSectionBlocks(this.#windowControl.svg, sections)
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
    
    items = []

    #menu = {}
    #itemRendering = {}
    
    
    create(menuName){
        this.#menu = new menu (menuName)
        this.#itemRendering = new menuItemRendering
    }

    setItems(items){
        this.#menu.items = items
    }

    selectItem(clickedItemID){
        const clickedItem = this.#menu.items.find(item => item.id = clickedItemID)
        clickedItem.selected = true
        
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
        console.log(this.#songs)
        this.deselectAll()
        const thisSong = this.#songs.find(song => song.id === songID)
        console.log(thisSong)
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

    //songListControl.selectSong(clickedSongID)

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





