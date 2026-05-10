//model - data
class DataHandler {

}


//model - notes


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

    select(title){
        this.getNote(title).selected = true
    }

}

class Note {
    constructor(title){
        this.id = title.replaceAll(' ','')
        this.title = title
        this.lines = undefined
        this.selected = false
        this.creationDate = undefined
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
        this.setProperties(note, doc)
        return note
    }

    setProperties(note, doc){

        const getCreationDate = () => {
            
            const selection = d3.select(doc).selectAll('meta').filter(function(){
                return d3.select(this).attr('name') === 'created'
            })

            return new Date(selection.attr('content'))
        }

        const getLines = () => {
            const lines = []
            
            const getLine = (elem) => {
                const tag = elem.node().tagName.toLowerCase()  
                
    
                switch(tag){
                    case 'h1':
                    case 'h2':
                    case 'h3':
                    case 'h4':
                    case 'h5':
                    case 'h6':
                        return new Heading(elem, tag)
                    case 'li':
                        return new Bullet(elem)
                    case 'p':
                        return new P(elem)
                    default:
                        throw new Error('incompatible elem type')
                }
            }

            const selection = d3.select(doc)
                .select('body')
                .selectAll('h1, h2, h3, h4, h5, h6, li, p')

            selection.each(function(){
                try{lines.push(getLine(d3.select(this)))}
                catch{return}
            })
        
            return lines
        }

        note.creationDate = getCreationDate()
        note.lines = getLines()
    
    }
}


class A {
    constructor(a){
        try{
            this.url = a.attr('href')
            this.text = a.text()
        }
        catch{
            return null
        }
        
    }
}

class P {
    constructor(p){
        if(this.isHashtag(p.text())){
            throw new Error ('hash')
        }
        this.text = p.text()
        this.link = this.getA(p)
    }

    isHashtag(text){
        return text.substring(0, 1) === '#'
    }

    getA(p){
        return new A(p.selectAll('a'))
    }
}

class Bullet {
    constructor(li){
        this.text = li.text()
    }

}

class Heading {
    constructor(h, tag){
        this.text = h.text()
        this.level = tag.substring(1)
    }
}

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
    #active = false
    data = null

    constructor(data){
        this.data = data
        //this.title = title
        //this.elements = new Map()
        //this.grid = new Grid()
    }

    get isActive(){
        return this.#active
    }

    activate(){
        this.loadElements()
        this.#active = true
    }

}

class ListDisplay extends Display {

    #header
    #accordion

    get accordion (){
        if(this.#accordion === undefined){
            return new Accordion(this.data, this)
        }
    }

    get header (){
        if(this.#header === undefined){
            return new DisplayHeader(this.headerText, this)
        }
    }

    get layout(){
        return {
            DisplayHeader: {column: 1, row: 1},
            Accordion: {column: 1, row: 2}
        }
    }

    loadElements(){
        this.header.load()
        this.accordion.load()
    }

}

class NotesList extends ListDisplay {
    
    get headerText(){
        return 'notes'
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
    
    static get captionText(){
        return '#6E7271'
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

    spanWidth(columnCount){
        return columnCount * this.columnWidth
    }

    offsetWidth(columnCount){
        return this.spanWidth(columnCount) + this.gutterWidth
    }

}

class Element {
    #gridCoordinates = {}
    #dimensions = {}

    constructor(data, parent = null){
        this.parent = parent
        this.data = data
        this.grid = new Grid()
/*         this.setCoordinates()
        this.setDimensions()
        this.initializeDomElements()
        this.renderContent()
        this.resize() */
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
        return this.grid.usableWidth //this.#dimensions.width
    }

    get height(){
        return window.innerHeight - 8 * this.grid.cellSize //this.#dimensions.height
    }

    get backgroundColour(){
        return '#F5F5F5'
    }

    get margin (){
        return this.grid.margin
    }

    get padding (){
        return this.grid.padding
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

    get position(){
        return 'relative'
    }

    get parentElement(){
        return this.parent.div ? this.parent.div : d3.select('body')
    }

    get zIndex(){
        return 0
    }

    load(){
        this.initializeDomElements()
        this.renderContent()
        this.resize()
    }


    setCoordinates(row = 1, column = 1){
        this.#gridCoordinates = {row: row, column: column}
    }

    setDimensions(width = this.calculateWidth(), height = this.calculateHeight()){
        this.#dimensions = {width: width, height: height}
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

    addDiv() {
        return this.parentElement.append('div')
            .attr('class', this.constructor.name.toLowerCase())
            .style('position', this.position)
            .style('margin', this.margin + 'px')
            .style('left', this.left + 'px')
            .style('top', this.top + 'px')
            .style('padding', this.padding + 'px')
            .style('width', this.width + 'px')
            .style('height', this.height + 'px')
            .style('overflow', 'hidden')
            .style('border-radius', this.borderRadius + 'px')
            .style('box-shadow', this.boxShadow)
            .style('background-color', this.backgroundColour)
    }

    addSvg() {
        return this.div.append('svg')
            .attr('class', this.constructor.name.toLowerCase())
            .attr('width', this.width)
            .attr('height', this.height)
            
    }

    move(transitionDuration = 0){
        this.div.transition('tMoveDiv')
            .duration(transitionDuration)
                .style('left', this.left + 'px')
                .style('top', this.top + 'px')
    }

    async resize(transitionDuration = 0, width = this.calculateWidth(), height = this.calculateHeight()){
        this.setDimensions(width, height)
        await this.resizeDiv(transitionDuration)
        if(this.svg !== undefined){
            await this.resizeSVG(transitionDuration)
        }
        return Promise.resolve()

    }

    resizeDiv(transitionDuration){
        return this.div.transition('tResizeDiv')
            .duration(transitionDuration)
            .ease(d3.easeCubicIn)
                .style('width', this.width + 'px')
                .style('height', this.height + 'px')
    }

    resizeSVG(transitionDuration){
        return this.svg.transition('tResizeSvg')
            .duration(transitionDuration)
            .ease(d3.easeCubicIn)
                .attr('width', this.width)
                .attr('height', this.height)
    }

    recolour(t){
         return this.div.transition(t)
            .style('background-color', this.backgroundColour)
        .end()

    }

    renderContent(){}


}

class VisualisationCanvas extends Element {

    get height(){
        return this.svg.selectAll('g').data().length * this.grid.cellSize + this.grid.cellSize
    }

}

class NavigationTab extends Element {

    get width (){
        return this.optionWidth * 4
    }

    get height (){
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
        return this.selectedItem ? AccordionItem.heightExpanded - AccordionItem.dividerHeight : 0
    }

    get selectedItem(){
        return this.data.find(item => item.selected)
    }

    get selecteItemIndex(){
        return this.data.findIndex(item => item.selected)
    }

    get selectedItemYCoordinate(){
        return this.getItemYCoordinate(this.selecteItemIndex)
    }

    get height(){
        return this.data.length * AccordionItem.heightCollapsed + this.expandedItemOffset
    }

    getItemYCoordinate(index){
        return index * AccordionItem.heightCollapsed
    }

    select(item){
        item.selected = true
    }
    
    deselect(item){
        item.selected = false
    }

    async update(clickedItem, transitionDuration){
        this.toggleSelection(clickedItem)
        const g = this.svg.select('g#' + clickedItem.id)

        let height = 0

        const renderedLines = g.selectAll('g')
            .data(clickedItem.lines)
            .join('text')
            .text(d => d.text)
            .attr('x', AccordionItem.textMainPositionX)
            .attr('y', (d, i) => {return i * (AccordionItem.fontHeight + 2) + AccordionItem.heightCollapsed * 1.5})
            .attr('fill', 'transparent')
            .style('font-size', (AccordionItem.fontHeight - 2) + 'px')

        renderedLines.each(function(){
            const BBox = d3.select(this).node().getBBox()
            height = height + BBox.height
        })

        this.renderContent(350)
        this.resize(350, AccordionItem.width, height)

        renderedLines.text('').attr('fill', 'black')

        console.log(renderedLines.data()[3].text.length)

        const prevTextLen = (i) => {

            return i > 0 ? renderedLines.data()[i -1].text.length : 0 
        }

        renderedLines.each(function(d, i){
            d3.select(this)
                .transition()
                .delay(150 + 150 * i)
                .duration(150)
                .tween('text', AccordionItem.typeWriterTween(d.text))
        })  
                

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

    setItemConfiguration(){
        AccordionItem.cellSize = this.grid.cellSize
        AccordionItem.accordionWidth = this.width
        AccordionItem.columnWidth = this.grid.columnWidth
        AccordionItem.gutterWidth = this.grid.gutterWidth
    }

    renderContent(transitionDuration = 0){
        const accordion = this
        this.setItemConfiguration()

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
                const {x, y} = { x: 0, y: i * AccordionItem.heightCollapsed}
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
                accordion.update(d, 350)
            })
        }

        const renderGraphics = () => {
            
            const itemBackgroundRectangles = () => {
                g.append('rect')
                    .attr('class', 'item')
                    .attr('width', AccordionItem.rectWidth)
                    .attr('height', AccordionItem.rectHeightCollapsed)
                    .attr('y', AccordionItem.rectOffsetY)
                    .attr('fill', 'transparent')
            }

            const itemDividerRectangles = () => {
                g.append('rect')
                    .attr('class', 'divider')
                    .attr('width', (d, i) => {return i > 0 ? AccordionItem.dividerWidth : 0})
                    .attr('height', AccordionItem.dividerHeight)
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
                    .attr('x', AccordionItem.textMainPositionX) //column 2
                    .attr('dy', AccordionItem.textOffsetY)
                    .attr('fill', '#384D48')
                    .style('font-size', AccordionItem.fontHeight + 'px')
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
                    .attr('dy', AccordionItem.textOffsetY)
                    .attr('fill', '#6E7271')
                    .style('font-size', (AccordionItem.fontHeight - 2) + 'px')
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
                return thisItemIndex * AccordionItem.heightCollapsed
            }

            return {x: 0, y: defaultY() + offset()}
        }
        
        const translate = (i) => {
            const {x, y} = coordinates(i)
            return 'translate(' + x + ',' + y + ')'
        }

        const renderPreviewText = () => {
            const g = selection.filter(d => d.selected)

            g.each(function(d){
                for(let i = 0; i < d.lines.length; i++){
                    const line = d.lines[i]
                    g.append('text')
                        .text(line.text)
                        .attr('x', AccordionItem.textMainPositionX)
                        .attr('y', AccordionItem.heightCollapsed + AccordionItem.fontHeight * i)
                        .attr('dy', AccordionItem.textOffsetY)
                        .style('font-size', '12px')
                        .style('user-select', 'none')
                }
            })
        }

    
        selection.transition(t).attr('transform', (d, i) => {
            return translate(i)
        })


        //renderPreviewText()

        
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

    get height(){
        return this.renderedHeight ?? this.grid.cellSize * 2
    }

    get width(){
        return this.renderedWidth ?? this.grid.cellSize * 20
    }

    renderContent(){
        const p = this.div.append('p')
            .style('margin', '0px')
            .style('height', this.height + 'px')

        p.append('span')
            .text(this.data)
            .style('color', Colours.main) //#8AA1B1
            .style('font-size', '18px')
            .style('font-weight', '200')
            .style('font-family', 'Helvetica, sans-serif')
        
    }

    initializeDomElements() {
        this.div = this.addDiv()
    }
}

class DocumentContainer extends Element {

    expanded = false

    unload(){
        this.div.remove()
    }

    load(){
        this.renderContent()
        return this.expand()
    }

    renderContent(){

        const lists = []

        const renderLine = (line, i) => {

            const getCurrentList = () => {
                if(lists[0] === undefined){
                    lists.push(this.div.append('ul'))
                }
                return lists[0]
            }

            const addUrl = () => {
                

            }

            switch(line.constructor.name){
                case 'Heading':
                    this.div.append('h' + line.level)
                        .text(line.text)
                    break;

                case 'Line':
                    if(line.link !== null){
                        const text = line.text.replace(line.link.text, '')
        
                        
                    }

                    this.div.append('p')
                        .text(text)
                        .append('a')
                            .attr('href', line.link.url)
                            .text(line.link.text)

                    break;

                case 'Bullet':
                    const list = getCurrentList()
                    list.append('li')
                        .text(line.text)

            }
        }

        for(let i = 0; i < this.data.length; i++){
            const line = this.data[i]
            renderLine(line, i)

        }

        console.log(lists)
    }


    expand(){
        this.expanded = true
        return this.resize(350)
    }

    get zIndex (){
        return 1
    }

    get backgroundColour (){
        return 'white'
    }

    get borderRadius () {
        return 0
    }

    get boxShadow () {
        return 'none'
    }

    get left(){
        return this.grid.offsetWidth(1) + 16
    }

    get top(){
        return this.parent.selectedItemYCoordinate + AccordionItem.heightCollapsed + 19
    }

    get position(){
        return 'absolute'
    }

    get margin (){
        return 0
    }

    get padding(){
        return 16
    }

    get height(){
        try{console.log(this.div.attr('scrollHeight'))
            return this.div.attr('scrollHeight')
        }
        catch{return this.expanded ? AccordionItem.heightExpanded - 6 : 0}
        
    }

    get width(){
        return this.grid.usableWidth - this.grid.offsetWidth(1) - 32
    }

    initializeDomElements() {
        this.div = this.addDiv()
    }

}

class AccordionItem {
    static goldenRatio = 1.618
    static cellSize = 0
    static accordionWidth = 0
    static columnWidth = 0
    static gutterWidth = 0

    static get dividerHeight(){
        return 1
    }

    static get dividerWidth(){
        return this.accordionWidth
    }

    static get heightCollapsed(){
        return this.cellSize * 2.5
    }

    static get heightExpanded(){
        return 200 
    }

    static get fontHeight(){
        const gRatioConjugate = this.goldenRatio - 1
        const complimentaryRatio = 1 - gRatioConjugate
        return Math.floor(this.rectHeightCollapsed * complimentaryRatio)
    }

    static get rectHeightCollapsed(){
        return this.heightCollapsed - this.dividerHeight 
    }

    static get rectHeightExpanded(){
        return this.heightExpanded - this.dividerHeight 
    }

    static get rectOffsetY(){
        return this.dividerHeight
    }

    static get rectWidth(){
        return this.accordionWidth
    }

    static get textCaptionWidth(){
        return this.columnWidth 
    }

    static get textMainPositionX(){
        return this.textCaptionWidth + this.gutterWidth
    }

    static get textOffsetY(){
        return this.fontHeight / 2 + this.rectHeightCollapsed / 2 - this.dividerHeight 
    }

    static typeWriterTween(finalText) {
        return function() {
            // Get the length of the string
            const len = finalText.length;
            // Define an interpolator from 0 to total length
            const i = d3.interpolateRound(0, len);

            return function(t) {
                // Set textContent to a slice of the final text based on t
                this.textContent = finalText.slice(0, i(t));
            };
        };
    }
}

//controller

class Displays {

    static #notesList

    static async notesList(){
        if(this.#notesList === undefined){
            this.#notesList = new NotesList(await new Notes().loadData())
        }
        return Promise.resolve(this.#notesList)
    }
}



class Orchestrator {
    static async activateDisplay(displayName){
        const display = await Displays[displayName]()
        display.activate()
    }

    static #displays = new Map()

    static get currentDisplay(){
        return this.displaysArray.find(display => display.isActive)
    }

    static get displaysArray(){
        return Array.from(this.#displays.values())
    }

    static get currentDisplayTitle(){
        return this.currentDisplay.title
    }

    static displayObject(displayTitle){
       switch(displayTitle){
            case 'notes':
            case 'jamesparrysongs':
                return new ListDisplay(displayTitle)
        }
    }

    static data(displayName){
        switch(displayName){
            case 'notesList':    
            case 'notes':
                return new Notes().loadData()
            case 'jamesparrysongs':
                return new Songs().loadData()
        }
    }

    static async loadDisplay(displayTitle) {

        const display = this.getDisplay(displayTitle)
        display.elements.set('header', new DisplayHeader(displayTitle, display))
        display.elements.set('list', new Accordion(await this.data(displayTitle), display))
        display.activate()
    }


    static getDisplay (title){
        if(!this.#displays.has(title)){
            this.#displays.set(title, this.displayObject(title))
        } 
        return this.#displays.get(title)
    }




}

function loadNote(note){
    const docContainer = Orchestrator.currentDisplay.elements.get('docContainer')
    docContainer.update()   
    
}

window.onload = () => {
    Orchestrator.activateDisplay('notesList')
    //Orchestrator.loadDisplay('notes')
    //loadSongsList()
    //loadNotestList()
}
