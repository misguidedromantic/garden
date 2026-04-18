//model - notes
class Notes {

    #notes

    constructor(){
        this.#notes = new Map()
    }

    async loadNotes(){
        const noteLoader = new NoteLoader(new HtmlConvertor())
        for(let i = 0; i < this.titles.length; i++){
            const title = this.titles[i]
            this.#notes.set(title, await noteLoader.load(new Note(title)))
        }

        console.log(this.#notes)
    }

    get titles(){
        return [
            'Statement of intent',
            'song genealogy'
        ]
    }

    get allNotes(){
        return[
            new Note('Statement of intent')
        ]
    }
}

class Note {
    constructor(title){
        this.title = title
        this.lines = []
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
        console.log(childElems.size())
        if(childElems.size() > 0){
            const words = elem.text().split(' ')
            console.log(words)
            childElems.each(function(){
                const childElem = d3.select(this)
                const childTag = childElem.node().tagName.toLowerCase()
                switch(childTag){
                    case 'a':
                        console.log(childElem.attr('href')) //if href starts with bear exclude
                        console.log(childElem.text()) //identify substring of parent text
                        break;
                    case 'span':
                        console.log(childElem.attr('class')) //exclude elements with class 'hashtag
                        break;
                }

                console.log(this.tagName.toLowerCase())
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
    createElementsMap(){
        return new Map()
            .set('Accordion', new Accordion())
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

class DomElement {
    constructor(type, uiElem){
        this.type = type
        this.id = type + uiElem.constructor.name
    }
}

class Element {
    #gridCoordinates = {}
    #dimensions = {}


    constructor(data, layout){
        this.data = data
        this.layout = layout
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
        this.resizeDiv()
        if(this.svg !== undefined){
            this.resizeSVG()
        }
    }

    resizeDiv(transitionDuration){
        this.div.transition('tResizeDiv')
            .duration(transitionDuration)
            .ease(d3.easeBounceOut)
                .style('width', this.width + 'px')
                .style('height', this.height + 'px')
    }

    resizeSVG(transitionDuration){
        this.svg.transition('tResizeSvg')
            .duration(transitionDuration)
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
        const self = this
        self.svg.selectAll('g')
            .data(this.data, d => d.id)
            .join(
                enter => {
                    const g = enter.append('g')
                        .attr('id', d => d.id)
                        .attr('transform', (d, i) => {
                            const {x, y} = { x: 0, y: i * self.grid.cellSize * 2.5}
                            return 'translate(' + x + ',' + y + ')'
                        })
                        .on('mouseover', function(){
                            d3.select(this)
                                .select('rect.item')
                                .attr('fill', '#6E7271')

                            d3.select(this)
                                .select('text.main')
                                .attr('fill', '#F5F5F5')

                            d3.select(this)
                                .select('text.caption')
                                .attr('fill', '#D8D4D5')
                        })
                        .on('mouseout', function(){
                            d3.select(this)
                                .select('rect.item')
                                .attr('fill', 'transparent')

                            d3.select(this)
                                .select('text.main')
                                .attr('fill', '#384D48')

                            d3.select(this)
                                .select('text.caption')
                                .attr('fill', '#6E7271')
                        })
                        .on('click', function(event, d){   
                            self.update(d, 1000)
                        })

                    g.append('rect')
                        .attr('class', 'item')
                        .attr('width', self.width)
                        .attr('height', self.grid.cellSize * 2.5 - 2)
                        .attr('y', 1.5)
                        .attr('fill', 'transparent')
                        

                    g.append('rect')
                        .attr('class', 'divider')
                        .attr('width', (d, i) => {return i > 0 && i !== self.data.length ? self.width : 0})
                        .attr('height', 1)
                        .attr('fill', '#D8D4D5')

                    g.append('text')
                        .attr('class', 'main')
                        .text(d => d.title)
                        .attr('x', self.grid.cellSize * 6)
                        .attr('dy', self.grid.cellSize * 1.5 + 1.5)
                        .attr('fill', '#384D48')
                        .style('font-size', '14px')
                        .style('user-select', 'none')

                    g.append('text')
                        .attr('class', 'caption')
                        .text((d, i) => {
                            const digits = (i + 1) > 9 ? '0' + (i + 1) : '00' + (i + 1)
                            return 'SONG ' + digits
                        })
                        .attr('dx', 4)
                        .attr('dy', self.grid.cellSize * 1.5 + 1.5)
                        .attr('fill', '#6E7271')
                        .style('font-size', '12px')
                        .style('user-select', 'none')
                },
                update => {
                    update.transition().duration(transitionDuration).attr('transform', (d, i) => {
                            const iSelected = self.data.findIndex(item => item.selected)
                            const yOffset = iSelected > -1 && i > iSelected ? 200 : 0
                            const {x, y} = { x: 0, y: i * self.grid.cellSize * 2.5 + yOffset}
                            return 'translate(' + x + ',' + y + ')'
                        })
                }

            )
    }

}

class DisplayHeader extends Element {
    get margin(){
        return this.grid.margin + 'px ' + this.grid.margin + 'px ' + '0px ' + this.grid.margin
    }

    get padding(){
        const {top, right, bottom, left} = {
            top: this.grid.padding / 2 + 'px ',
            right: this.grid.padding + 'px ',
            bottom: this.grid.padding * 1.5 + 'px ',
            left: this.grid.padding
        }
        return top + right + bottom + left
    }

    renderContent(){
        const p = this.div.append('p')
            .style('margin', '0px')
            .style('height', this.height + 'px')
            .style('line-height', '1.25')

        p.append('span')
            .text(this.data.title)
            .style('color', '#4281a4') //#8AA1B1
            .style('font-size', '20px')
            .style('font-weight', '200')
            .style('font-family', 'Helvetica, sans-serif')
        
        p.append('span')
            .text(this.data.displayType)
            .style('color', '#48a9a6') //#9ac2c9'
            .style('font-size', '14px')
            .style('font-weight', '500')
            .style('font-family', 'Work Sans, sans-serif')
    }

    calculateHeight(){
        return this.grid.cellSize * 2
    }

    calculateWidth(){
        
        return this.getRenderedWidth() ?? this.grid.cellSize * 20
    }

    getRenderedWidth(){

        try{
            let totalWidth = 0
            let widestWidth = 0
            this.div.select('p').selectAll('span').each(function(d){
                const spanWidth = Math.ceil(d3.select(this).node().getBoundingClientRect().width)
                widestWidth = spanWidth > widestWidth ? spanWidth : widestWidth
                totalWidth = totalWidth + spanWidth
            })
            return widestWidth
        }
        catch{return null}
        
    }

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

//view - element controllers
class ElementFactory {
    createElement(type) {
        const element = new Element(type)
        this.initializeDomElements(element)
        return element
    }

    initializeDomElements(element) {
        element.div = this.addDiv(element)
        element.svg = this.addSvg(element)
    }

    addDiv(element, parentContainer = d3.select('body')) {
        return parentContainer.append('div')
            .attr('class', element.constructor.name.toLowerCase())
    }

    addSvg(element) {
        return element.div.append('svg')
            .attr('class', element.constructor.name.toLowerCase())
    }
}


function renderDisplayElements(display){
    d3.select('body')
        .selectAll('div')
        .data(display.elements)
        .join(
            enter => {
                enter.each(function(d){
                    const id = d.constructor.name
                    const viewElem = display.getElement(id)
                    viewElem.div = d3.select(this).append('div').attr('id', id).style('position', 'absolute')
                    viewElem.svg = viewElem.div.append('svg').attr('id', id)
                })
            },
            update => update,
            exit => exit
        )
}

function renderContent(display, content){
    renderNavContent(display.getElement('NavigationTab'), content)
    renderCanvasContent(display.getElement('VisualisationCanvas'), content)
}

function renderCanvasContent(element, content){
    element.svg.selectAll('g')
        .data(content, d => d.id)
        .join(enter => {
            const g = enter.append('g').attr('id', d => d.id)
            
            g.append('text')
                .text(d => d.title)
                .attr('y', (d, i) => i * element.spacing)
                .attr('dx', element.spacing)
                .attr('dy', element.spacing)
        }
    )
}

function renderNavContent(element, content){
    const navOptions = [...new Set (content.map(d => d.releaseId))]
    element.svg.selectAll('g')
        .data(navOptions, d => d)
        .join(enter => {
            const g = enter.append('g').attr('id', d => d)
            
            g.append('text')
                .text(d => d)
                .attr('x', (d, i) => i * 120)
                .attr('dx', element.spacing)
                .attr('dy', element.spacing)
        },
        update => update.select('text').attr('x', (d, i) => i * element.optionWidth),
        exit => exit
    )
}

//controller
function testNotesModel(){
    const notesModel = new NotesModel
    console.log(notesModel.allNotes[0])
}


function createDisplay(){
    return new Display()
}

function loadNotestList(){
    const notes = new Notes()
    notes.loadNotes()
}

async function loadSongsList(){
    const songsData = () => {return new Songs().loadData()}
    const headerText = {displayType: 'DIGITAL PRESERVE', title: 'jamesparrysongs '}
    new DisplayHeader(headerText, new SongPreserve())
    new Accordion(await songsData(), new SongPreserve())
}

window.onload = () => {
    loadSongsList()
}
