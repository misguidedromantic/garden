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
}

//view
    //(preserve) digital garden what and why
class Display {
    #elements

    constructor(){
        this.#elements = new Map()
            .set('VisualisationCanvas', new VisualisationCanvas())
            .set('NavigationTab', new NavigationTab())
    }

    get elements(){
        return this.#elements.values()
    }

    getElement(key){
        return this.#elements.get(key)
    }

    setElementLayout(){
        this.getElement('NavigationTab').setCoordinates(1, 1)
        this.getElement('VisualisationCanvas').setCoordinates(3, 1)
    }

    setElementSizes(){
        this.getElement('NavigationTab').setDimensions()
        this.getElement('VisualisationCanvas').setDimensions()
    }

    positionElements(){
        this.elements.forEach(element => {
            element.div
                .style('left', element.left + 'px')
                .style('top', element.top + 'px')
        });
    }

    sizeElements(){
        this.elements.forEach(element => {
            console.log(element.width)
            console.log(element.height)
            element.div
                .style('width', element.width + 'px')
                .style('height', element.height + 'px')

            element.svg
                .attr('width', element.width)
                .attr('height', element.height)
        });
    }

}

class NotesList {

}

class Grid {

    constructor() {
        this.cellSize = 16
        this.minCellsPerColumn = 4
        this.breakpoints = { mobile: 500, tablet: 1000 }
        this.columnMap = { mobile: 4, tablet: 8, desktop: 12 }
        this.gutterMap = { mobile: this.cellSize / 4, tablet: this.cellSize / 2, desktop: this.cellSize}
        this.marginMap = { mobile: this.cellSize, tablet: this.cellSize * 2, desktop: this.cellSize * 4}
        this.paddingMap = { mobile: this.cellSize / 4, tablet: this.cellSize / 2, desktop: this.cellSize / 2}
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

    constructor(){
        this.grid = new Grid()
        this.maxSpan = {rows: Infinity, columns: this.grid.columnCount}
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

    get elementList(){
        return [
            new DomElement('div', this),
            new DomElement('svg', this)
        ]
    }

    setCoordinates(row, column){
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

async function loadDisplay(){
    const display = createDisplay()
    renderDisplayElements(display)
    display.setElementLayout()
    display.positionElements()
    const content = await getSongs()
    renderContent(display, content)
    display.setElementSizes()
    display.sizeElements()
    renderContent(display, content)
}


function getSongs(){
    const songsModel = new Songs()
    return songsModel.loadData()
}

function createDisplay(){
    return new Display()
}

function loadNotestList(){
    const notes = new Notes()
    notes.loadNotes()
}


window.onload = () => {
    loadNotestList()
}
