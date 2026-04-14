const GOLDEN_RATIO = 1.618

class orchestrator {

    static #instance = null
    static {if(this.#instance == null){this.#instance = new this}}

    static loadDisplay(id){
        this.#instance.displayManager.load(id)
    }

    #displayManager

    constructor(){this.#displayManager = null}

    get displayManager(){
        return this.#displayManager ??= new displayManager()
    }
}

class displayManager {
    #grid = {}
    #styling = {}
    #displays = {}
    #layout = {}
    #currentDisplay = null

    constructor(){
        this.#displays = new Map
        this.#grid = new Grid
        this.#layout = new LayoutManager(this.#grid)
    }

    get currentDisplayType(){
        try{return this.#currentDisplay.constructor.name}
        catch{return undefined}
    }

    get elementsArray(){
        return Array.from(this.#currentDisplay.elements.values())
    }

    get elementKeysArray(){
        return Array.from(this.#currentDisplay.elements.keys())
    }


    load(id){
        this.#configureObjects(id)
        this.#createElements(this.#currentDisplay)
        console.log(this.#currentDisplay.elements)
        this.#configureElements()
    }

    #configureObjects(id){
        const displayObject = this.getDisplayObject(id)
        if(!this.#isLoaded(displayObject)){
            this.#currentDisplay = this.getDisplayObject(id)
        }
    }

    #isLoaded(display){
        return display.constructor.name === this.currentDisplayType

    }

    getDisplayObject(id){
        if(!this.#displays.has(id)){
            this.#displays.set(id, this.#createDisplayObject(id))    
        }
        return this.#displays.get(id)
    }

    #createDisplayObject(id){
        switch(id){
            case 'lifeLine':
                return new lifeLineDisplay()
            default:
                return null
        }
    }

    #setStlyes(){
        const styling = new DisplayStyling(this.#currentDisplay)
        styling.setBackground()
        styling.setElementStyles()
    }

    #createElements(){
        const styling = new DisplayStyling(this.#currentDisplay)
        const elemFactory = new ElementFactory(this.#layout, styling)
        for(let i = 0; i < this.elementKeysArray.length; i++){
            const key = this.elementKeysArray[i]
            this.#currentDisplay.elements.set(key, elemFactory.createElement(key))
        }
    }

    #configureElements(){
        const controller = new ElementController()
        for(let i = 0; i < this.elementsArray.length; i++){
            const element = this.elementsArray[i]
            controller.move(element, 0)
            controller.resize(element, 0)
            controller.style(element, 0)
        }
    }

    #arrangeElements() {
        //this.#layout.sizeElements(this.elementsArray)

    }
}

class elementSizing {

    constructor(grid){
        this.grid = grid
    }

    default() {
        return {
            width: this.defaultWidth(),
            height: this.defaultWidth()
        }
    }

    padding(element){
        return this.grid.padding
    }

    toContent(contentHeight, columnCount = this.grid.columnCount){
        return {
            width: this.spanWidth(columnCount), 
            height: contentHeight
        }
    }
    
    defaultWidth(){
        return this.spanWidth(this.grid.columnCount)
    }

    defaultHeight(){
        return Math.ceil(this.defaultWidth() / GOLDEN_RATIO)
    }

    spanWidth(columnCount){
        const withoutGutters = columnCount * this.grid.columnWidth
        const totalGutterWidth = (columnCount - 1) * this.grid.gutterWidth
        return withoutGutters + totalGutterWidth
    }


}


class lifeLineDisplay {
    
    constructor() {
        this.elements = this.elementsMap

/*         this.grid = new Grid()
        this.elementFactory = new ElementFactory(this.grid)
        this.layout = new LayoutManager(this.grid)
        this.elements = new Map()
        this.contentManager = new contentManager()
        this.resizeTimeout = null
        this.initialize() */
    }

    get elementsMap(){
        return new Map()
            .set('canvas', null)
            //.set('overlay', null)
     }

    get backgroundColour(){
        return '#F7F9FA'
    }



    get rowCount() {
        return Math.ceil(this.totalCells / this.cellsPerRow)
    }

    get cellsPerRow() {
        const canvasWidth = parseInt(this.elements.get('canvas').svg.attr('width'), 10) || 0
        return Math.max(1, Math.floor(canvasWidth / this.cellSize))
    }

    get totalCells() {
        return this.data.length
    }

    async initialize() {

        this.createElements()
        await this.arrangeElements()
        await this.populateContent()
        this.attachResizeHandler()
    }

    createElements() {
        this.elements.set('canvas', this.elementFactory.createElement('canvas'))
        //this.elements.set('overlay', this.elementFactory.createElement('overlay'))
    }

    async arrangeElements() {
        const elementsArray = Array.from(this.elements.values())
        await this.layout.sizeElements(elementsArray)
        await this.layout.positionElements(elementsArray)
    }

    async populateContent() {
        await this.contentManager.loadContent(this)
        await this.layout.fitElementsToContent(this)
    }

    attachResizeHandler() {
        window.addEventListener('resize', () => {
            clearTimeout(this.resizeTimeout)
            this.resizeTimeout = setTimeout(() => {
                if (this.data && this.data.length) {
                    this.resizeDisplay().catch(error => console.error('Resize error', error))
                }
            }, 120)
        })
    }

    async resizeDisplay() {
        const elementsArray = Array.from(this.elements.values())
        await this.layout.sizeElements(elementsArray)
        await this.layout.positionElements(elementsArray)
        await this.layout.fitElementsToContent(this)

        const canvas = this.elements.get('canvas')
        if (canvas) {
            await new contentRendering().renderWeeksOfLife(this, canvas, this.data)
       
        }
    }

}

class contentManager {
    constructor(){
        this.dataHandler = new dataHandler()
        this.contentRendering = new contentRendering()
    }

    async loadContent(display){
        display.data = this.dataHandler.weeksOfLife(new Date(1990, 0, 1), new Date())
        const elementsArray = Array.from(display.elements.values())
        for (let i = 0; i < elementsArray.length; i++) {
            const element = elementsArray[i]          
            if(element.constructor.name === 'Canvas' && display.constructor.name === 'lifeLineDisplay'){
                await this.contentRendering.renderWeeksOfLife(display, element, display.data)
            }   
        }
        return Promise.resolve()
    }
}

class dataHandler {
    weeksOfLife(birthDate, currentDate) {
        const weeksLived = Math.floor((currentDate - birthDate) / (1000 * 60 * 60 * 24 * 7))
        const totalWeeks = 80 * 52 // Assuming an average lifespan of 80 years
        const data = []
        for (let i = 0; i < totalWeeks; i++) {
            if (i < weeksLived) {
                data.push({ status: 'lived' })
            } else if (i === weeksLived) {
                data.push({ status: 'current' })
            } else {
                data.push({ status: 'expected' })
            }
        }
        return data
    }
}

class Grid {

    constructor() {
        this.cellSize = 16
        this.breakpoints = { mobile: 500, tablet: 1000 }
        this.columnMap = { mobile: 4, tablet: 8, desktop: 12 }
        this.gutterMap = { mobile: this.cellSize / 4, tablet: this.cellSize / 2, desktop: this.cellSize}
    }

    get deviceType() {
        const width = window.innerWidth
        if (width < this.breakpoints.mobile) return 'mobile'
        if (width < this.breakpoints.tablet) return 'tablet'
        return 'desktop'
    }

    get columnCount() {
        return this.columnMap[this.deviceType]
    }

    get gutterCount() {
        return this.columnCount - 1
    }

    get gutterWidth() {
        return this.gutterMap[this.deviceType]
    }

    get totalGutterWidth() {
        return this.gutterWidth * (this.columnCount - 1)
    }

    get usableWidth() {
        const widthWithoutGutters = window.innerWidth - this.totalGutterWidth - this.cellSize * 2 - this.cellSize / 2
        return widthWithoutGutters - this.margin * 2 - this.padding * 2
    }

    get columnWidth() {
        return this.usableWidth / this.columnCount
    }

    get marginWidth() {
        return (this.usableWidth % this.columnCount) / 2
    }

    get margin(){
        return (this.gutterWidth * 3) + this.overHang / 2
    }

    get padding() {
        return this.gutterWidth / 2
    }

    get overHang(){
        return window.innerWidth % this.cellSize
    }

    get rowHeight() {
        return Math.floor(this.columnWidth / GOLDEN_RATIO)
    }

    get rowCount() {
        return Math.ceil(this.totalCells / this.cellsPerRow)
    }

    get cellsPerRow() {
        const canvasWidth = parseInt(this.elements.get('canvas').svg.attr('width'), 10) || 0
        return Math.max(1, Math.floor(canvasWidth / this.cellSize))
    }

    get totalCells() {
        return this.data.length
    }
}

class DisplayStyling {
    #display
    constructor(display){
        this.#display = display
    }

    setBackground(){
        d3.select('body')
            .style('background-color', this.#display.backgroundColour)
    }

    setElementStyles(element){
        const elementStyling = new ElementStyling
        element.borderRadius = elementStyling.borderRadius
        element.backgroundColour = elementStyling.backgroundColour
        element.boxShadow = elementStyling.boxShadow
    }


}

class ElementStyling {

    get backgroundColour () {
        return '#F5F5F5'
    }

    get borderRadius () {
        return 6
    }

    get boxShadowLayers(){
        return [
            '0px -0.4px 0.5px hsl(' + this.shadowColour + ' / 0.36)',
            '0px -1.3px 1.5px -0.8px hsl(' + this.shadowColour + ' / 0.36)',
            '0px -3.4px 3.8px -1.7px hsl(' + this.shadowColour + ' / 0.36)',
            '0px -8.2px 9.2px -2.5px hsl(' + this.shadowColour + ' / 0.36)'
        ]
    }

    get boxShadow () {
        return this.boxShadowLayers.join(', ')
    }

    get shadowColour () {
        return '0deg 0% 60%'
    }
}

class Overlay {
    constructor() {
        this.div = null
    }
}

class Canvas {
    constructor() {
        this.div = null
        this.svg = null
    }
}



class ElementFactory {
    constructor(layout, styling) {
        this.layout = layout
        this.styling = styling
    }

    createElement(type) {
        const element = this.createObject(type)
        this.applyElementSettings(element)
        this.initializeDomElements(element)
        return element
    }

    applyElementSettings(element){
        this.layout.setElementDimensions(element)
        this.layout.setElementPosition(element)
        this.styling.setBackground()
        this.styling.setElementStyles(element)
    }

    createObject(type) {
        switch (type) {
            case 'canvas':
                return new Canvas()
            case 'overlay':
                return new Overlay()
            default:
                return null
        }
    }

    initializeDomElements(element) {
        switch (element.constructor.name) {
            case 'Canvas':
                element.div = this.addDiv(element)
                element.svg = this.addSvg(element)
                break
            case 'Overlay':
                //element.div = this.addDiv(element)
                break
            default:
                break
        }
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



class elementPositioning {

    constructor(grid){
        this.grid = grid
    }

    default(element) {
        const {row, column} = this.defaultCoordinates(element)
        return this.calculatePosition({row, column})
    }

    defaultCoordinates(element) {
        switch (element.constructor.name) {
            case 'Canvas':
            case 'Overlay':
                return { row: 1, column: 1 }
            default:
                return { row: 1, column: 1 }
        }
    }

    margin(element){
        return this.grid.margin
    }

    calculatePosition(gridCoords) {
        return {
            left: this.left(gridCoords.column),
            top: this.top(gridCoords.row)
        }
    }

    left(column) {
        const totalColumnWidth = (column - 1) * this.grid.columnWidth
        const totalGutterWidth = (column - 1) * this.grid.gutterWidth
        return this.grid.margin + totalColumnWidth + totalGutterWidth
    }

    top(row) {
        const totalRowHeight = (row - 1) * this.grid.rowHeight
        const totalGutterHeight = (row - 1) * this.grid.gutterWidth
        return this.grid.margin + totalRowHeight + totalGutterHeight
    }

    calculateZIndex(element) {
        switch (element.constructor.name) {
            case 'Canvas':
                return 1
            case 'Overlay':
                return 2
            default:
                return 0
        }
    }
}

class LayoutManager {
    constructor(grid) {
        this.grid = grid
        this.sizing = new elementSizing(grid)
        this.positioning = new elementPositioning(grid)
    }

    async fitElementsToContent(display) {
        const elementsArray = Array.from(display.elements.values())
        
        for (let i = 0; i < elementsArray.length; i++) {
            const element = elementsArray[i]
            if(element.constructor.name === 'Canvas' && display.constructor.name === 'lifeLineDisplay'){
                const contentHeight = display.rowCount * display.cellSize
                const {width, height} = this.sizing.toContent(contentHeight)
                const controller = new ElementController(element)
                await controller.resize(width, height)
            }
        }
    }


    async positionElements(elements) {
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i]
            const {left, top} = this.positioning.default(element)
            const controller = new ElementController(element)
            controller.move(left, top)
        }
    }

    sizeElements(elements) {
         for (let i = 0; i < elements.length; i++) {
            const element = elements[i]
            this.setDimensions(element)
            this.applyDimensions(element)        
        }
    }

    setElementDimensions(element){
        const {width, height} = this.sizing.default(element)
        element.padding = this.sizing.padding(element)
        element.width = width
        element.height = height
    }

    setElementPosition(element){
        const {left, top} = this.positioning.default(element)
        element.margin = this.positioning.margin(element)
        element.left = left
        element.top = top
    }

    applyDimensions(element){
        const controller = new ElementController(element)
        controller.resize(element)
    }

    stackElements(elements) {
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i]
            const zIndex = this.positioning.calculateZIndex(element)
            const controller = new ElementController(element)
            controller.applyZIndex(zIndex)
        }
    }

    scaledRowSpan(element, columnCount) {
        switch (element.constructor.name) {
            case 'Canvas':
                return Math.ceil(columnCount / GOLDEN_RATIO)
            case 'Overlay':
                return 1
            default:
                return 1
        }
    }
}


class ElementController {
    constructor() {
        this.transitionDuration = 500
    }

    

    stack(zIndex) {
        this.applyZIndex(zIndex)
     }
    
    applyZIndex(zIndex) {
        this.element.div.style('z-index', zIndex)
    }

    resize(element, transitionDuration = this.transitionDuration) {
        this.transitionDuration = transitionDuration
        switch (element.constructor.name) {
            case 'Canvas':
                this.renderSvgDimensions(element)
            case 'Overlay':
                this.renderDivDimensions(element)
            default:
                return Promise.resolve()

        }
    }

    renderDivDimensions(element) {
        element.div.style('width', element.width + 'px')
            .style('height', element.height + 'px')
            .style('padding', element.padding + 'px')
    }

    renderSvgDimensions(element) {
        element.svg.attr('width', element.width)
            .attr('height', element.height)  
    }

    move(element, transitionDuration = this.transitionDuration) {
        this.transitionDuration = transitionDuration
        this.renderDivPosition(element)
        if(element.constructor.name === 'Canvas'){
            this.renderSVGPosition(element)
        }
    }

    renderDivPosition(element) {
        element.div.style('position', 'absolute')
            .style('margin', element.margin + 'px')
            .style('left', element.left + 'px')
            .transition('tMove')
            .duration(750)
                .ease(d3.easeCircleOut)
                .style('top', element.top + 'px')
                
    }

    renderSVGPosition(element){
        element.div.attr('left', element.left)
            .attr('top', element.top)
    }

    style(element, transitionDuration = this.transitionDuration){
        this.transitionDuration = transitionDuration
        element.div
            //.style('box-shadow', 'none')
            .style('opacity', 0)
            .style('background-color', element.backgroundColour)
            .style('border-radius', element.borderRadius + 'px')
            .style('box-shadow', element.boxShadow)
            .transition('tStyle')
            .ease(d3.easeCircleOut)
            .duration(500)
                .style('opacity', 1)
    }
}

class contentRendering {
    async renderWeeksOfLife(display, canvas, data) {
        const transitions = []
        canvas.svg.selectAll('circle')
            .data(data)
            .join(
                enter => {
                    const circles = this.enter(enter, display.cellSize, display.cellsPerRow)
                    transitions.push(circles.transition().duration(0))
                },
                update => {
                    const circles = this.update(update, display)
                    transitions.push(circles.transition().duration(0))
                },
                exit => {
                    const circles = this.exit(exit)
                    transitions.push(circles.transition().duration(0))
                }
            )

        return Promise.all(transitions.map(t => t.end()))

    }

    enter(selection, cellSize, cellsPerRow){
        return selection.append('circle')
            .attr('cx', (d, i) => (i % cellsPerRow) * cellSize + cellSize / 2)
            .attr('cy', (d, i) => Math.floor(i / cellsPerRow) * cellSize + cellSize / 2)
            .attr('r', cellSize / 2 - 1)
            .attr('fill', d => this.getStatusColor(d.status))
    }

    update(selection, display){
        return selection
            .attr('cx', (d, i) => (i % display.cellsPerRow) * display.cellSize + display.cellSize / 2)
            .attr('cy', (d, i) => Math.floor(i / display.cellsPerRow) * display.cellSize + display.cellSize / 2)
            .attr('r', display.cellSize / 2 - 1)
            .attr('fill', d => this.getStatusColor(d.status))
    }

    exit(selection){
        return selection.remove()
    }

    getStatusColor(status) {
        switch (status) {
            case 'lived':
                return '#7c9881'
            case 'expected':
                return '#c6d6cc'
            case 'current':
                return '#FFC000'
            default:
                return 'red'
        }
    }


}

class noteHandler {

    static async loadNote(title){ 
        const note = this.#createObject(title)
        const response = await this.#loadData(note.path)
        const text = await response.text()
        this.#addLines(note, text)
    }

    static #createObject(title){
        return new note (title)
    }

    static #loadData(path){
        return fetch(path)
    }

    static #addLines(note, text){
        const lines = text.split('\n')
        for (let i = 0; i < lines.length; i++){
            try{note.lines.push(new line(lines[i]))}
            catch{return}
        }
    }
}

class note {
    constructor(title){
        this.title = title
        this.lines = []
    }

    get path(){
        return './docs/' + this.title + '.txt'
    }

}

class line {
    constructor(text){
        switch(text.substring(0,2)){
            case '# ':
                return new title (text.substring(2))
            case '* ':
                return new bulletPoint (text.substring(2))
            default:
                if(!this.isAlphaNumeric(text.substring(0))){
                    throw new Error ('invalid line type')
                }
        }
        this.text = text
    }

    isAlphaNumeric(firstChar){
        const code = firstChar.charCodeAt(0) 
        return (code > 47 && code < 58) || // numeric (0-9)
         (code > 64 && code < 91) || // upper alpha (A-Z)
         (code > 96 && code < 123);  // lower alpha (a-z)
    }
}

class title extends line{ 
    constructor(text){
        super(text)
    }
}

class bulletPoint extends line {
    constructor(text){
        super(text)
    }
}

/**
 * Application initialization
 */
window.addEventListener('DOMContentLoaded', () => {
    orchestrator.loadDisplay('lifeLine')
    //noteHandler.loadNote('backlog')
    //new lifeLineDisplay
})