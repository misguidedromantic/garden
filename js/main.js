//model - notes
class Displays {
    get titles(){
        return [
            'NotesList',
            'SongsList'
        ]
    }
}

class Notes {

    #notes = null

    constructor(){
        this.#notes = new Map()
    }

    get titles(){
        return [
            'Statement of intent',
            'song genealogy',
            'Test note 1',
            'Test note 2'
        ]
    }

    get notes(){
        return Array.from(this.#notes.values())
    }

    async loadData(){
        const noteLoader = new NoteLoader(new HtmlConvertor())
        for(let i = 0; i < this.titles.length; i++){
            const title = this.titles[i]
            this.#notes.set(title, await noteLoader.load(new Note(title)))
        }
        return Promise.resolve(this.notes)
    }

    getNote (title){
        return this.#notes.get(title)
    }

}

class Note {
    constructor(title){
        this.id = title.replaceAll(' ','')
        this.title = title
        this.lines = []
        this.selected = false
    }
}

class HtmlConvertor {

    async getDoc(path){
        const parser = new DOMParser()
        const htmlString = await this.getHtmlString(path)
        return Promise.resolve(parser.parseFromString(htmlString, 'text/html'))
    }

    async getHtmlString(path){
        const response = await fetch(path)
        return response.text()
    }

}

class NoteLoader {
    constructor(htmlConverter){
        this.htmlConverter = htmlConverter
    }

    async load(note){
        const path = './docs/' + note.title + '.html'
        const doc = await this.htmlConverter.getDoc(path)
        this.setProperties(note, doc, this.addLine)
        return note
    }

    

    setProperties(note, doc, fnAddLine){
        const selection = d3.select(doc).selectAll('li, meta, p')
        d3.select(doc).selectAll('li, meta, p').each(function(){
            const elem = d3.select(this)
            const tag = elem.node().tagName.toLowerCase()
            switch(tag){
                case 'li':
                    fnAddLine(elem)
                    note.lines.push(new Bullet(elem.text()))
                    break;
                case 'p':
                    fnAddLine(elem)
                    const text = elem.text()
                    if(text.substring(0, 1) !== '#'){
                        note.lines.push(new Line(text))
                    }
                    break;
                case 'meta':
                    if(elem.attr('name') === 'created'){
                        note.creationDate = new Date(elem.attr('content'))
                    }
                    break; 
            }
        })
    }

    addLine(elem){
        const childElems = elem.selectChildren()

        if(childElems.size() > 0){
            const words = elem.text().split(' ')
            
            childElems.each(function(){
                const childElem = d3.select(this)
                const childTag = childElem.node().tagName.toLowerCase()
                switch(childTag){
                    case 'a':
                        //console.log(childElem.attr('href')) //if href starts with bear exclude
                        //console.log(childElem.text()) //identify substring of parent text
                        break;
                    case 'span':
                        //console.log(childElem.attr('class')) //exclude elements with class 'hashtag
                        break;
                }

                //console.log(this.tagName.toLowerCase())
            })
        }

    }
}

class Line {
    constructor(text){
        this.text = text
    }
}

class Bullet extends Line {}

//model - songs
class Songs {
    #songs = null

    async loadData(){
        const data = await d3.csv('./data/songs.csv')
        this.#songs = data.map(d => new Song (d))
        return Promise.resolve(this.songs)
    }

    get songs(){
        return this.#songs
    }
}

class Song {
    constructor(d){
        this.id = d.short_title
        this.title = d.title
        this.releaseId = d.release_id
        this.selected = false
    }

    get lyrics(){
        return [
            new Line("I'm a doll and nothing more"),
            new Line("deny all my rights"),
            new Line("adore me and I'll want to be in your bed tonight"),
            new Line("it takes so much to remain this high"),
            new Line("I keep on taking, still I need you to try"),
            new Line("cause when you're open I can feed off attention"),
            new Line("your eyes trained on mine (on mine)")
        ]   
    }
}

//view - element data structures
class Display {
    static #elements

    static addElement(element){
        if(this.#elements === undefined){
            this.#elements = new Map()
        }
        this.#elements.set(element.constructor.name, element)
    }

    static getElement(key){
        if(this.#elements.get(key) === undefined){
            this.#elements.set(key, this.createElement(key))
        }
        return this.#elements.get(key)
    }

    static createElement(constructorName = 'Element'){

    }
}

class SongPreserve extends Display {
    get Layout (){
        return [
            {element: 'PersistentHeader', elementToLeft: null, elementAbove: null},
            {element: 'DisplayHeader', elementToLeft: null, elementAbove: 'PersistentHeader'},
            {element: 'Accordion', elementToLeft: null, elementAbove: 'DisplayHeader'}
        ]
    }

}

class NotesList extends Display {
    get Layout (){
        return [
            {element: 'PersistentHeader', elementToLeft: null, elementAbove: null},
            {element: 'DisplayHeader', elementToLeft: null, elementAbove: 'PersistentHeader'},
            {element: 'Accordion', elementToLeft: null, elementAbove: 'DisplayHeader'}
        ]
    }
}

class Colours {
    static get palette (){
        return {
            caption: '#6E7271',
            captionReverse: '#D8D4D5',
            main: '#384D48',
            mainReverse: '#F5F5F5',


        }
    } 

    static get main(){
        return '#384D48'
    }

    static get backgroundRaised (){
        return '#E2E2E2'
    }
}

class Grid {

    constructor() {
        this.cellSize = 16
        this.minCellsPerColumn = 4
        this.breakpoints = { mobile: 500, tablet: 1000 }
        this.columnMap = { mobile: 4, tablet: 8, desktop: 12 }
        this.gutterMap = { mobile: this.cellSize / 4, tablet: this.cellSize / 2, desktop: this.cellSize}
        this.marginMap = { mobile: this.cellSize, tablet: this.cellSize * 2, desktop: this.cellSize * 4}
        this.paddingMap = { mobile: this.cellSize / 4, tablet: this.cellSize / 2, desktop: this.cellSize}
    }

    get deviceType() {
        const width = window.innerWidth
        if (width < this.breakpoints.mobile) return 'mobile'
        if (width < this.breakpoints.tablet) return 'tablet'
        return 'desktop'
    }

    get availableWidth(){
        return window.innerWidth - this.margin * 2 - this.padding * 2 - this.cellSize
    }

    get columnCount() {
        return this.columnMap[this.deviceType]
    }

    get columnWidth() {
        return this.totalColumnWidth / this.columnCount
    }

    get gutterWidth() {
        return this.gutterMap[this.deviceType]
    }

    get margin(){
        return this.marginMap[this.deviceType]
    }

    get maxCellsPerRow(){
        return this.usableWidth / this.cellSize
    }

    get overHang(){
        return this.availableWidth % this.cellSize
    }

    get totalColumnWidth(){
        return this.usableWidth - this.totalGutterWidth    
    }

    get totalGutterWidth() {
        return this.gutterWidth * (this.columnCount - 1)
    }

    get usableWidth() {
        return this.availableWidth - this.overHang
    }

    get padding() {
        return this.paddingMap[this.deviceType]
    }

    get rowHeight(){
        return this.cellSize
    }
}

class Element {
    #gridCoordinates = {}
    #dimensions = {}


    constructor(data){
        this.data = data
        this.grid = new Grid()
        this.styling = new ElementStyling()
        this.setCoordinates()
        this.setDimensions()
        this.initializeDomElements()
        this.renderContent()
        this.resize()
    }

    get spacing(){
        return this.grid.cellSize
    }

    get left(){
        return (this.#gridCoordinates.column - 1) * this.grid.columnWidth
    }

    get top(){
        return (this.#gridCoordinates.row - 1) * this.grid.rowHeight
    }

    get width(){
        return this.#dimensions.width
    }

    get height(){
        return this.#dimensions.height
    }

    get backgroundColour(){
        return this.styling.backgroundColour
    }

    get margin (){
        return this.grid.margin
    }

    get padding (){
        return this.grid.padding
    }


    setCoordinates(row = 1, column = 1){
        this.#gridCoordinates = {row: row, column: column}
    }

    setDimensions(){
        this.#dimensions = {width: this.calculateWidth(), height: this.calculateHeight()}
    }

    calculateWidth(){
        return this.grid.usableWidth
    }

    calculateHeight(){
        return window.innerHeight - 8 * this.grid.cellSize
    }

    initializeDomElements() {
        this.div = this.addDiv()
        this.svg = this.addSvg()
    }

    addDiv(parentContainer = d3.select('body')) {
        return parentContainer.append('div')
            .attr('class', this.constructor.name.toLowerCase())
            .style('position', 'relative')
            .style('margin', this.margin + 'px')
            .style('left', this.left + 'px')
            .style('top', this.top + 'px')
            .style('padding', this.padding + 'px')
            .style('width', this.width + 'px')
            .style('height', this.height + 'px')
            .style('overflow', 'hidden')
            .style('border-radius', this.styling.borderRadius + 'px')
            .style('box-shadow', this.styling.boxShadow)
            .style('background-color', this.backgroundColour)
    }

    addSvg(parentContainer = this.div) {
        return parentContainer.append('svg')
            .attr('class', this.constructor.name.toLowerCase())
            .attr('width', this.width)
            .attr('height', this.height)
            
    }

    resize(transitionDuration = 0){
        this.setDimensions()
        this.resizeDiv(transitionDuration)
        if(this.svg !== undefined){
            this.resizeSVG(transitionDuration)
        }
    }

    resizeDiv(transitionDuration){
        this.div.transition('tResizeDiv')
            .duration(transitionDuration)
            .ease(d3.easeCubicIn)
                .style('width', this.width + 'px')
                .style('height', this.height + 'px')
    }

    resizeSVG(transitionDuration){
        this.svg.transition('tResizeSvg')
            .duration(transitionDuration)
            .ease(d3.easeCubicIn)
                .attr('width', this.width)
                .attr('height', this.height)
    }


}

class VisualisationCanvas extends Element {

    calculateHeight(){
        return this.svg.selectAll('g').data().length * this.grid.cellSize + this.grid.cellSize
    }

}

class NavigationTab extends Element {

    calculateWidth(){
        return this.optionWidth * 4
    }

    calculateHeight(){
        return this.grid.cellSize * 2
    }

    get optionWidth (){
        return this.getMaxOptionWidth() + this.grid.cellSize
    }

    getMaxOptionWidth(){
        let max = 0
        this.svg.selectAll('g').each(function(){
            const thisWidth = Math.ceil(d3.select(this).select('text').node().getBBox().width)
            max = thisWidth > max ? thisWidth : max
        })
        return max
    }
    
}

class Accordion extends Element {
    //margin: top right bottom left
    get margin(){
        return '0px ' + this.grid.margin + 'px ' + this.grid.margin + 'px ' + this.grid.margin
    }

    get backgroundColour(){
        return '#E2E2E2'
    }

    get expandedItemOffset(){
        return this.data.some(item => item.selected) * 200
    }

    get selectedItem(){
        return this.data.find(item => item.selected)
    }

    get selecteItemIndex(){
        return this.data.findIndex(item => item.selected)
    }

    calculateHeight(){
        return this.data.length * this.grid.cellSize * 2.5 + this.expandedItemOffset
    }

    select(item){
        item.selected = true
    }
    
    deselect(item){
        item.selected = false
    }

    update(clickedItem, transitionDuration){
        this.toggleSelection(clickedItem)
        this.renderContent(transitionDuration)
        this.resize(transitionDuration)

        //logic to make this dynamic
        loadNote(this.selectedItem)
    }

    toggleSelection(clickedItem){
        switch(this.selectedItem){
            case clickedItem:
                this.deselect(clickedItem)
                break;
            default:
                this.deselect(this.selectedItem)
            case undefined:
                this.select(clickedItem)
        } 
    }

    renderContent(transitionDuration = 0){
        const accordion = this
        accordion.svg.selectAll('g')
            .data(accordion.data, d => d.id)
            .join(
                enter => accordion.enterItems(enter, accordion),
                update => accordion.updateItems(update, accordion, 350),
                exit => exit
            )
    }

    enterItems(selection, accordion){

        let g = null

        const createSvgGroups = () => {
            g = selection.append('g').attr('id', d => d.id)
        }

        const positionGroups = () => {
            g.attr('transform', (d, i) => {
                const {x, y} = { x: 0, y: i * accordion.grid.cellSize * 2.5}
                return 'translate(' + x + ',' + y + ')'
            })
        }

        const attachEventHandlers = () => {
            g.on('mouseover', function(){
                const item = d3.select(this)
                item.select('rect.item').attr('fill', '#6E7271')
                item.select('text.main').attr('fill', '#F5F5F5')
                item.select('text.caption').attr('fill', '#D8D4D5')
            })
            .on('mouseout', function(){
                const item = d3.select(this)
                item.select('rect.item').attr('fill', 'transparent')
                item.select('text.main').attr('fill', '#384D48')
                item.select('text.caption').attr('fill', '#6E7271')
            })
            .on('click', function(event, d){
                accordion.update(d, 350)}
            )
        }

        const renderGraphics = () => {
            
            const itemBackgroundRectangles = () => {
                g.append('rect')
                    .attr('class', 'item')
                    .attr('width', accordion.width)
                    .attr('height', accordion.grid.cellSize * 2.5 - 2)
                    .attr('y', 1.5)
                    .attr('fill', 'transparent')
            }

            const itemDividerRectangles = () => {
                g.append('rect')
                    .attr('class', 'divider')
                    .attr('width', (d, i) => {return i > 0 && i !== accordion.data.length ? accordion.width : 0})
                    .attr('height', 1)
                    .attr('fill', '#D8D4D5')
            }

            itemBackgroundRectangles()
            itemDividerRectangles()
        }

        const renderText = () => {
            
            const itemMainText = () => {
                g.append('text')
                    .attr('class', 'main')
                    .text(d => d.title.toLowerCase())
                    .attr('x', accordion.grid.cellSize * 6)
                    .attr('dy', accordion.grid.cellSize * 1.5 + 1.5)
                    .attr('fill', '#384D48')
                    .style('font-size', '14px')
                    .style('user-select', 'none')
            }

            const itemCaptionText = () => {
                g.append('text')
                    .attr('class', 'caption')
                    .text((d, i) => {
                        const digits = (i + 1) > 9 ? '0' + (i + 1) : '00' + (i + 1)
                        const targetObjectClass = d.constructor.name
                        return targetObjectClass.toUpperCase() + ' ' + digits
                    })
                    .attr('dx', 4)
                    .attr('dy', accordion.grid.cellSize * 1.5 + 1.5)
                    .attr('fill', '#6E7271')
                    .style('font-size', '12px')
                    .style('user-select', 'none')
            }

            itemMainText()
            itemCaptionText()
        }

        createSvgGroups()
        positionGroups()
        attachEventHandlers()
        renderGraphics()
        renderText()
    }

    updateItems(selection, accordion, transitionDuration){
        
        const expandedItemIndex = accordion.selecteItemIndex
        const t = d3.transition('tUpdateItems').duration(transitionDuration).ease(d3.easeCubicIn)

        const coordinates = (thisItemIndex) => {
            const offset = () => {
                const expandedAbove = () => {
                    return expandedItemIndex !== -1 && 
                        thisItemIndex > expandedItemIndex
                }

                return expandedAbove() ? 200 : 0
            }

            const defaultY = () => {
                return thisItemIndex * accordion.grid.cellSize * 2.5
            }

            return {x: 0, y: defaultY() + offset()}
        }
        
        const translate = (i) => {
            const {x, y} = coordinates(i)
            return 'translate(' + x + ',' + y + ')'
        }

        selection.transition(t).attr('transform', (d, i) => {
            return translate(i)
        })
    }
}

class DisplayHeader extends Element {
    get margin(){
        const {top, right, bottom, left} = {
            top: this.grid.margin + 'px ',
            right: this.grid.margin + 'px ',
            bottom: '0px ',
            left: this.grid.margin
        }
        return top + right + bottom + left
    }

    get padding(){
        const {top, right, bottom, left} = {
            top: this.grid.padding + 'px ',
            right: this.grid.padding * 1.5 + 'px ',
            bottom: this.grid.padding * 1 + 'px ',
            left: this.grid.padding  * 1.5
        }

        return top + right + bottom + left
    }

    get renderedWidth(){
        try{return Math.ceil(this.boundingRect.width)}
        catch{return null}
    }

    get renderedHeight(){
        try{return Math.ceil(this.boundingRect.height)}
        catch{return null}
    }

    get boundingRect(){
        return this.div.select('span').node().getBoundingClientRect()
    }

    renderContent(){
        const p = this.div.append('p')
            .style('margin', '0px')
            .style('height', this.height + 'px')

        p.append('span')
            .text(this.data.title)
            .style('color', Colours.main) //#8AA1B1
            .style('font-size', '18px')
            .style('font-weight', '200')
            .style('font-family', 'Helvetica, sans-serif')
        
    }

    calculateHeight(){
        return this.renderedHeight ?? this.grid.cellSize * 2
    }

    calculateWidth(){
        return this.renderedWidth ?? this.grid.cellSize * 20
    }

    initializeDomElements() {
        this.div = this.addDiv()
    }
}

class DocumentContainer extends Element {
    initializeDomElements() {
        this.div = this.addDiv()
    }
}

class ElementStyling {

    get defaults (){
        return {
            backgroundColour: this.backgroundColour,
            borderRadius: this.borderRadius,
            boxShadow: this.boxShadow
        }
    }


    get backgroundColour () {
        return '#F5F5F5'
    }

    get borderRadius () {
        return 6
    }

    get boxShadow () {
        return this.boxShadowLayers.join(', ')
    }

    get boxShadowLayers(){
        return [
            '0px -0.4px 0.5px hsl(' + this.shadowColour + ' / 0.36)',
            '0px -1.3px 1.5px -0.8px hsl(' + this.shadowColour + ' / 0.36)',
            '0px -3.4px 3.8px -1.7px hsl(' + this.shadowColour + ' / 0.36)',
            '0px -8.2px 9.2px -2.5px hsl(' + this.shadowColour + ' / 0.36)'
        ]
    }

    get shadowColour () {
        return '0deg 0% 60%'
    }
}

//controller
function loadNote(note){
    const documentContainer = Display.getElement('DocumentContainer')

}

async function loadNotestList(){
    const notesData = () => {return new Notes().loadData()}
    const headerText = {title: 'notes'}
    Display.addElement(new DisplayHeader(headerText))
    Display.addElement(new Accordion(await notesData()))
}

async function loadSongsList(){
    const songsData = () => {return new Songs().loadData()}
    const headerText = {title: 'jamesparrysongs '}
    new DisplayHeader(headerText)
    new Accordion(await songsData())
}

class Orchestrator {
    

    static loadDisplay(title){
        
    }
}

window.onload = () => {
    //loadSongsList()
    loadNotestList()
}
