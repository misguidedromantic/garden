const gRatio = 1.618

window.onload = async function(){
    orchestrator.setup()
    orchestrator.loadParterre('songs')
}


window.onresize = function (){
    orchestrator.handleResize()
}

class orchestrator {

    //static #parterres = {}
    static #content = {}
    static #displays = {}
    //static #controller = {}
    static #currentDisplayTitle = ''

    static setup(){
        this.#content = new contentManager
        this.#displays = new Map
        this.throttledResize = this.#throttle(this.reconfigureCurrentDisplay.bind(this), 200)
    }

    static async loadParterre(title){
        const controller = new parterreController
        const content = await this.#content.getParterreContent(title)
        const thisParterre = new parterre (title)
        this.#displays.set(title, thisParterre)
        thisParterre.backgroundDiv = controller.loadBackground(content.imageUrl, content.imageDimensions)
        thisParterre.titleCard = controller.loadTitle(title)
        this.#currentDisplayTitle = title   
    }

    static loadDisplay(title, type){
        this.#createDisplay(title, type)
        this.#configureDisplay(this.#displays.get(title))
        //this.#renderDisplay(title)
        //this.#currentDisplayTitle = title   
    }

    static #createDisplay(title, type){
        switch(type){
            case 'paterre':
                this.#displays.set(title, new parterre (title))
                break;
            case 'record':
                this.#displays.set(title, new recordDisplay (title))
                break;
            default:
                this.#displays.set(title, new display (title))
        }
    }
 
    static #configureDisplay(display){ 
        const controller = new displayController(display)     
        controller.configure(display)
    }

    static handleResize(){
        this.throttledResize()
    }

    static reconfigureCurrentDisplay(){
        const display = this.#displays.get(this.#currentDisplayTitle)
        

    }

    static #throttle(func, delay) {
        let timeoutId;
        let lastArgs;
        let lastThis;
      
        return function(...args) {
          lastArgs = args;
          lastThis = this;
      
          if (!timeoutId) {
            timeoutId = setTimeout(() => {
              func.apply(lastThis, lastArgs);
              timeoutId = null;
            }, delay);
          }
        };
      }


}

class parterreController {
    loadBackground(imageUrl, imageDimensions){

        const position = () => {return {left: -400,top: -600}}
        const dimensions = (imageDimensions) => {
            const width = window.innerWidth * gRatio
            const apsectRatio = imageDimensions.width / imageDimensions.height
            return {width: width, height: width * apsectRatio}
        }

        function applyPosition(div, position){
            div.style('position', 'fixed')
                .style('top', position.top + 'px')
                .style('left', position.left + 'px')
        }

        function applyDimensions(div, dimensions){
            div.style('width', dimensions.width + 'px')
                .style('height', dimensions.height + 'px')
                
        }

        function applyImage(div, src){
            div.append('img')
                .attr('src',  src)
                .style('height', '100%')
                .style('opacity', 0.38)
        }

        const div = d3.select('body').append('div')
        applyPosition(div, position())
        applyDimensions(div, dimensions(imageDimensions))
        applyImage(div, imageUrl)
        return div
    }

    loadTitle(titleText){

        const wordsArray = (text) => {
            return text.toUpperCase().split(' ')
        }

        const factory = new cardFactory
        const controller = new cardController
        const titleCard = factory.createCard('parterreTitle', 'title')
        controller.applyDefaultDimensions(titleCard)
        titleCard.words = wordsArray(titleText)
        controller.renderText(titleCard)
        controller.applyScaledDimensions(titleCard)
        controller.renderText(titleCard)
        return titleCard
    }
}

class contentManager {
    parterres(){
        return [
            new parterre ('blueprints'),
            new parterre ('records')
        ]
    }

    getImageDimensions(url){
        return new Promise((resolve, reject) => {
            const img = new Image();
    
            img.onload = () => {
              resolve({
                width: img.naturalWidth, // Original width of the image
                height: img.naturalHeight // Original height of the image
              });
            };
        
            img.onerror = (error) => {
              reject(new Error(`Failed to load image: ${error}`));
            };
        
            img.src = url;
          });

    }

    async getParterreContent(parterreTitle){
        if(parterreTitle === 'songs'){
            await songsData.load()
            const imageUrl = 'images/jp-esb-square.JPEG'
            return {
                imageUrl: imageUrl,
                imageDimensions: await this.getImageDimensions(imageUrl),
                songs: songsData.getAllSongs()
            }
        }
    }

    getCardContent(card, display){
        switch(card.constructor.name){
            case 'titleCard':
            case 'viewTitleCard':
                return this.titleWords(card, display)
            case 'canvasCard':
                return this.gardenBedContent(card.id)
        }
    }

    viewTitles(displayType){
        switch(displayType){
            case 'recordDisplay':
                return ['history', 'songs']
        } 
    }

    canvases(displayType, displayTitle){
        switch(displayType){
            case 'parterre':
                return this.gardenBedTitles(displayTitle)
        } 
    }

    gardenBedTitles(parterreTitle){
        if(parterreTitle === 'jamesparrysongs'){
            return ['records', 'songs']
        }
    }

    async gardenBedContent(cardID){
        if(cardID === 'songsCanvas'){
            await songsData.load()
            return songsData.getAllSongs()
        }
        return null

    }

    titleWords(card, display){
        switch(card.constructor.name){
            case 'titleCard':
                return display.title.toUpperCase().split(' ')
            case 'viewTitleCard':
                    console.log(card)
                
        }
    }

    getViewTitleFromCardId(cardId){
        return cardId.charAt(9).toLowerCase() + cardId.slice(1)
    }
}

class displayController {

    #content = {}
    #config = {}
    
    constructor(display){  
        this.#content = new contentManager
        this.#config = new displayConfiguration(display)     
    }

    configure(display){
        this.#setBackground(display)
        this.#createCards(display)
        this.#configureCards(display)
    }

    #setBackground(){
        const background = this.#config.background()
        const width = window.innerWidth * gRatio
        const height = width * 16 / 9
        const top = -600
        const left = -400
        console.log(height)
        if(background !== null){
            d3.select('body')
                .append('div')
                .style('position', 'absolute')
                .style('top', top + 'px')
                .style('left', left + 'px')
                .style('width', width + 'px')
                //.style('height', height + 'px')
                .append('img')
                .attr('src',  background)
                .style('height', '100%')
                .style('opacity', 0.38)
        }
    }


    #createCards(display){
        const factory = new cardFactory
        const schema = this.#config.cardSchema()
        schema.forEach(entry => {
            display.cards.set(entry.id, factory.createCard(entry.id, entry.type))
        })
    }

    #configureCards(display){
        this.#config.arrangeCards(display.cards)
        //const words = this.#content.getWords(card, display)
    }

}

class displayConfiguration {

    #content = {}

    constructor(display){
        this.display = display
        this.#content = new contentManager
    }

    background(){
        if(this.display.id === 'jamesparrysongs'){
            return 'images/jp-esb-square.JPEG'
        } else {
            return null
        }
    }

    cardSchema(){
        const schema = [this.#title()]
        switch(this.display.constructor.name){
            case 'parterre':
                return [...schema, ...this.#canvases()]
            case 'recordDisplay':
                return [...schema, ...this.#viewTitles()]
            default:
                return null    
        }
    }

    arrangeCards(cards){
        const layout = new layoutManager (cards)
        const controller = new cardController
        this.applyDefaultLayout(cards, controller, layout)
        this.applyContentScaledLayout(cards, controller, layout)
    }

    applyDefaultLayout(cards, controller, layout){
        for (const card of cards.values()) {
            controller.applyDefaultDimensions(card)
            controller.applyPosition(card, layout.adjacentCards(card))
        }
    }

    async applyContentScaledLayout(cards, controller, layout){
        for (const card of cards.values()) {
            console.log(card)
            const content = await this.#content.getCardContent(card, this.display)
            controller.applyContent(card, content)
            controller.applyPosition(card, layout.adjacentCards(card))
        }
    }

    #schemaEntry(cardId, cardType){
        return {id: cardId, type: cardType}
    }

    #title(){
        return this.#schemaEntry('displayTitle', 'title')
    }
    #viewTitles(){
        const viewTitles = this.#content.viewTitles(this.display.constructor.name)
        return viewTitles.map(viewTitle => this.#schemaEntry(viewTitle, 'viewTitle'))
    }

    #canvases(){
        const canvasIds = this.#content.canvases(this.display.constructor.name, this.display.title)
        return canvasIds.map(canvasId => this.#schemaEntry(canvasId + 'Canvas', 'canvas'))
    }
}

class layoutManager {
    constructor(cards){
        this.cards = cards
    }

    adjacentCards(card){
        return {
            left: this.#cardToLeft(card),
            above: this.#cardAbove(card)
        }
    }

    #cardToLeft(card){
        switch(card.constructor.name){
            default:
                return null
            case 'canvasCard':
                const canvasArray = Array.from(this.cards.values()).filter(card => card.constructor.name === 'canvasCard')
                const i = canvasArray.findIndex(canvasCard => canvasCard.id === card.id)
                return i > 0 ? canvasArray[i - 1] : null
        }
    }

    #cardAbove(card){
        switch(card.constructor.name){
            case 'titleCard':
                return null
            case 'viewTitleCard':
            case 'canvasCard':
                return this.cards.get('displayTitle')
        }
    }
}



class cardRendering {
    updateDivDimensions(div, dimensions){
        div.style('width', dimensions.width + 'px')
        div.style('height', dimensions.height + 'px')
    }

    updateDivPosition(div, coordinates){
        div.style('left', coordinates.left + 'px')
        div.style('top', coordinates.top + 'px')
    }
}

function loadRecordDisplay(title){

    const factory = new cardFactory

    function createTitleCard(){
        return factory.createCard(title.replaceAll(' ','') + 'Title','title') 
    }

    function createMenuCard(){
        return factory.createCard(title.replaceAll(' ','') + 'Menu','menu')
    }

    function configureMenuCard(card){
        card.top = 5
        card.left = 5
        card.items = ['start','history','songs','end']
        card.width = Math.round(window.innerWidth / gRatio)
        card.height = 41
        card.borderTop = '1px solid grey'
        card.borderBottom = '1px solid grey'
    }

    function configureTitleCard(card, cardAbove){
        card.top = cardAbove.top + cardAbove.height + 15
        card.left = 0
        card.words = title.toUpperCase().split(' ')
        card.width = Math.round(window.innerWidth / gRatio)
        card.height = Math.round(card.width * 9 / 16)
    }

    function renderDimensions(card){
        card.div.style('width', card.width + 'px')
        card.div.style('height', card.height + 'px')
    }

    function renderPosition(card){
        card.div.style('left', card.left + 'px')
        card.div.style('top', card.top + 'px')
    }

    function renderBorder(card){
        card.div.style('border-bottom', card.borderBottom)
        card.div.style('border-top', card.borderTop)
    }

    function renderMenuItems(card){
        card.svg.selectAll('g')
            .data(card.items, d => d)
            .join(
                enter => {
                    enter.append('circle')
                        .attr('id', d => d)
                        .attr('fill', 'yellow')
                        .attr('fill-opacity', 0.62)
                        .attr('r', card.height / 2 / gRatio)
                        .attr('cx',  (d, i) => i * card.height / 2 * gRatio + card.height / 2)
                        .attr('cy', card.height / 2)
                        .on('mouseover', (event, d) => {
                            const circle = d3.select('#' + d)
                            circle.attr('fill-opacity', 1)
                        })
                        .on('mouseout', (event, d) => {
                            const circle = d3.select('#' + d)
                            circle.attr('fill-opacity', 0.62)
                        })
                        
/*                     g.append('text')
                        .text(d => d)
                        .attr('fill', 'yellow')
                        .attr('font-size', card.height * 0.9)
                        .attr('dy', card.height / 2)
                        .attr('dominant-baseline', 'middle') */
                }

            )
    }

    function renderTitleCard(card){
        const sizing = new titleCardSizing
        sizing.fitTitleText(card)
    }

    const menuCard = createMenuCard()
    const titleCard = createTitleCard()
    
    configureMenuCard(menuCard)
    configureTitleCard(titleCard, menuCard)

    renderDimensions(menuCard)
    renderDimensions(titleCard)
    renderPosition(menuCard)
    renderPosition(titleCard)

    renderBorder(menuCard)
    renderMenuItems(menuCard)

    renderTitleCard(titleCard)



}

class dataHandler {
    static map = {}

    static getRecordsMap(){
        const records = new Map()
        const titles = recordsData.getTitles()
        titles.forEach(title => {
            
            
            records.set(title, recordsData.getRecordMap(title))
        })
        return records
    }
    
}

class titleCardSizing {

    fitTitleText(card){
        this.renderText(card)
        const scale = this.getScaleFactor(card)
        card.fontSize = card.fontSize * scale
        card.height = card.fontSize * 2 + 30
        this.renderSizeChange(card)
        this.renderText(card)
    }

    renderSizeChange(card){
        card.div.style('width', card.width + 'px').style('height', card.height + 'px')
        card.svg.attr('width', card.width).attr('height', card.height)
    }

    renderText(card){
        card.svg.selectAll('text')
            .data(card.words)
            .join(
                enter => enter.append('text')
                    .text(d => d)
                    .attr('id', d => d)
                    .style('fill', 'white')
                    .style('font-size', card.fontSize)
                    .attr('y', (d, i) => i * card.fontSize + card.fontSize),
                update => update.style('font-size', card.fontSize)
                    .attr('y', (d, i) => i * card.fontSize + card.fontSize),
                exit => exit
            )
    }

    getScaleFactor(card){
        const textDimensions = this.getTextDimensions(card)
        return Math.min(
                card.width / textDimensions.width, 
                card.height / textDimensions.height
            ) * 0.9
    }

    getTextDimensions(card){
        const textElems = card.svg.selectAll('text')
        let widestWidth = 0
        let height = 0
        
        textElems.each(d => {
            const elem = d3.select('#' + d)
            const bbox = elem.node().getBBox()
            if(bbox.width > widestWidth){
                widestWidth = bbox.width
                height = bbox.height
            }
        })

        return {
            height: height,
            width: widestWidth
        }

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
        return remainder * 15
    }

    getPosY(i){
        const quotient = arithmetic.getQuotient(i, this.#width)
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
    svg.selectAll('rect')
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





