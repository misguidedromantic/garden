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
        return this.#displayManager ??= new DisplayManager()
    }
}

class DisplayManager {
    #displays = {}
    #content = {}
    #elementController = {}
    #currentDisplay = null

    constructor(){
        this.#displays = new Map
        this.#content = new ContentManager
        this.#elementController = new ElementController
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
        this.#styleDisplay()
        this.#createElements(this.#currentDisplay)
        this.#configureElements()
        this.#loadContent()
    }

    #configureObjects(id){
        const displayObject = this.#getDisplayObject(id)
        if(!this.#isLoaded(displayObject)){
            this.#currentDisplay = this.#getDisplayObject(id)
        }
    }

    #isLoaded(display){
        return display.constructor.name === this.currentDisplayType
    }

    #getDisplayObject(id){
        if(!this.#displays.has(id)){
            this.#displays.set(id, this.#createDisplayObject(id))    
        }
        return this.#displays.get(id)
    }

    #createDisplayObject(id){
        return new Display(id)
    }

    #styleDisplay(){
        d3.select('body')
            .style('background-color', this.#currentDisplay.backgroundColour)
    }

    #createElements(){
        const elemFactory = new ElementFactory()
        for(let i = 0; i < this.elementKeysArray.length; i++){
            const key = this.elementKeysArray[i]
            this.#currentDisplay.elements.set(key, elemFactory.createElement(key))
        }
    }

    #configureElements(){ 
        for(let i = 0; i < this.elementsArray.length; i++){
            const element = this.elementsArray[i]
            this.#elementController.applyDefaults(element)
        }
    }

    async #loadContent(){
        for(let i = 0; i < this.elementsArray.length; i++){
            const element = this.elementsArray[i]
            const data = this.#content.getContent(this.#currentDisplay)
            await this.#elementController.applyContent(element, data)
        }
    }
}

class Display {
    constructor(id){
        switch(id){
            case 'lifeLine':
                return new LifeLineDisplay()
            default:
                return this
        }
    }
}

class LifeLineDisplay {

    #instance = null
    
    constructor() {
        if(this.#instance !==null){
            return this.#instance
        }
        this.#instance = this
        this.elements = this.elementsMap
    }

    get elementsMap(){
        return new Map()
            .set('canvas', null)
            //.set('overlay', null)
     }

    get backgroundColour(){
        return '#F7F9FA'
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
            await new ContentDynamics().renderWeeksOfLife(this, canvas, this.data)
       
        }
    }

}

class ElementFactory {
    createElement(type) {
        const element = new Element(type)
        this.initializeDomElements(element)
        return element
    }

    initializeDomElements(element) {
        switch (element.constructor.name) {
            case 'Canvas':
                element.div = this.addDiv(element)
                element.svg = this.addSvg(element)
                break
            case 'Overlay':
                element.div = this.addDiv(element)
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

class Element {
    constructor(type){
        switch (type) {
            case 'canvas':
                return new Canvas()
            case 'overlay':
                return new Overlay()
            default:
                return this
        }
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
        this.cellSize = 16
    }
}

class ElementController {
    constructor() {
        this.settings = new ElementSettings()
        this.dynamics = new ElementDynamics()
    }
    
    applyDefaults(element){
        this.settings.setDefaults(element)
        this.dynamics.move(element, 0)
        this.dynamics.resize(element, 0)
        this.dynamics.style(element, 0)
    }

    applyContent(element, data){
        this.settings.setToContent(element, data)
        this.dynamics.renderContent(element, data, 0)
        this.dynamics.resize(element, 500)
    }


    stack(zIndex) {
        this.applyZIndex(zIndex)
     }
    
    applyZIndex(zIndex) {
        this.element.div.style('z-index', zIndex)
    }


}

class ElementSettings {
    constructor(){
        this.styling = new ElementStyling()
        this.layout = new LayoutManager()
    }

    setDefaults(element){
        this.setCoordinates(element, this.layout.getDefaultPosition(element))
        this.setDimensions(element, this.layout.getDefaultDimensions(element))
        this.setStyles(element, this.styling.defaults)
    }

    setToContent(element, data){
        this.setConstants(element, this.layout.elementConstants(element.width))
        this.setDimensions(element, this.layout.getContentDimensions(element, data.length))
    }

    setConstants(element, constants){
        const {cellSize, cellsPerRow} = constants
        element.cellSize = cellSize
        element.cellsPerRow = cellsPerRow
    }

    setCoordinates(element, coordinates){
        const {top, left, margin} = coordinates
        element.margin = margin
        element.left = left
        element.top = top
    }

    setDimensions(element, dimensions){
        const {width, height, padding} = dimensions
        element.padding = padding
        element.width = width
        element.height = height
    }

    setStyles(element, styles){
        const {backgroundColour, borderRadius, boxShadow} = styles
        element.backgroundColour = backgroundColour
        element.borderRadius = borderRadius
        element.boxShadow = boxShadow
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

class LayoutManager {
    constructor() {
        this.grid = new Grid
        this.sizing = new ElementSizing(this.grid)
        this.positioning = new ElementPositioning(this.grid)
    }

    elementConstants(elementWidth){
        return {
            cellSize: this.grid.cellSize,
            cellsPerRow: Math.floor(elementWidth / this.grid.cellSize)
        }
    }

    getContentDimensions(element, cellsRequired){
        const {width, height} = this.sizing.toContent(element, cellsRequired)
        return {width: width, height: height, padding: this.grid.padding}
    }

    getDefaultDimensions(element){
        const {width, height} = this.sizing.default(element)
        return {width: width, height: height, padding: this.grid.padding}
    }

    getDefaultPosition(element){
        const {left, top} = this.positioning.default(element)
        const margin = this.positioning.margin(element)
        return {left: left, top: top, margin: margin}
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
        return (this.usableWidth - this.totalGutterWidth) / this.columnCount
    }

    get gutterWidth() {
        return this.gutterMap[this.deviceType]
    }

    get margin(){
        return this.marginMap[this.deviceType]
    }

    get minColumnWidth(){

    }

    get overHang(){
        return this.availableWidth % this.cellSize
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

    //FIX
    get rowHeight() {
        return Math.floor(this.columnWidth / GOLDEN_RATIO)
    }

}

class ElementSizing {

    constructor(grid){
        this.grid = grid
    }

    default() {
        return {
            width: this.defaultWidth(),
            height: this.defaultWidth()
        }
    }

    defaultWidth(){
        
        return this.spanWidth(this.grid.columnCount)
    }

    defaultHeight(){
        return Math.ceil(this.defaultWidth() / GOLDEN_RATIO)
    }

    toContent(element, cellsRequired){
        return {
            width: this.contentWidth(element), 
            height: this.contentHeight(cellsRequired, element.cellsPerRow, element.cellSize)
        }
    }

    contentWidth(element){
        return element.cellsPerRow * element.cellSize
    }
    

    contentHeight(cellCount, cellsPerRow, cellSize){
        const rowCount = Math.ceil(cellCount / cellsPerRow)
        return rowCount * cellSize
    }

    spanWidth(columnCount){
        const withoutGutters = columnCount * this.grid.columnWidth
        const totalGutterWidth = (columnCount - 1) * this.grid.gutterWidth
        return withoutGutters + totalGutterWidth + this.grid.padding * 2
    }



}

class ElementPositioning {

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

class ElementDynamics {

    constructor(){
        this.contentDynamics = new ContentDynamics()
    }

    renderContent(element, data, transitionDuration = 0){
        this.contentDynamics.renderWeeksOfLife(element, data, transitionDuration)
    }

    resize(element, transitionDuration = 0) {
        switch (element.constructor.name) {
            case 'Canvas':
                this.renderSvgDimensions(element, transitionDuration)
            case 'Overlay':
                this.renderDivDimensions(element, transitionDuration)
        }
    }

    move(element, transitionDuration = 0) {
        this.renderDivPosition(element)
        if(element.constructor.name === 'Canvas'){
            //this.renderSVGPosition(element)
        }
    }

    style(element, transitionDuration = 0){
        this.renderDivStyling(element)
    }

    renderDivPosition(element, transitionDuration) {
        element.div.style('position', 'absolute')
            .style('margin', element.margin + 'px')
            .style('left', 0 + 'px')
            .transition('tMove')
            .duration(transitionDuration)
                .ease(d3.easeCircleOut)
                .style('top', element.top + 'px')
                
    }

    renderSVGPosition(element, transitionDuration){
        element.div.attr('left', element.left)
            .attr('top', element.top)
    }

    renderDivDimensions(element, transitionDuration) {
        element.div.transition('tSizeDiv')
            .duration(transitionDuration)
                .style('width', element.width + 'px')
                .style('height', element.height + 'px')
                .style('padding', element.padding + 'px')
    }

    renderSvgDimensions(element, transitionDuration) {
        element.svg.transition('tSizeSvg')
            .duration(transitionDuration)
                .attr('width', element.width)
                .attr('height', element.height)  
    }

    renderDivStyling(element, transitionDuration){
        element.div
            .style('opacity', 0)
            .style('overflow', 'hidden')
            .style('background-color', element.backgroundColour)
            .style('border-radius', element.borderRadius + 'px')
            .style('box-shadow', element.boxShadow)
            .transition('tStyle')
            .ease(d3.easeCircleOut)
            .duration(transitionDuration)
                .style('opacity', 1)
    }

    

}

class ContentManager {
    constructor(){
        this.dataHandler = new DataHandler()
        this.dynamics = new ContentDynamics()
    }

    getContent(display){
        if(display.constructor.name === 'LifeLineDisplay'){
            return this.dataHandler.weeksOfLife(new Date(1990, 0, 1), new Date())
        }
    }



}

class DataHandler {
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


class ContentDynamics {
    async renderWeeksOfLife(canvas, data, transitionDuration) {
        const transitions = []
        canvas.svg.selectAll('circle')
            .data(data)
            .join(
                enter => {
                    const circles = this.enter(enter, canvas.cellSize, canvas.cellsPerRow)
                    const tEnter = circles.transition('tCircles')
                        .duration(transitionDuration)
                        .delay((d, i) => i * 0.38)
                            .attr('opacity', 1)
                    
                    transitions.push(tEnter)
                },
                update => {
                    const circles = this.update(update, canvas.cellSize, canvas.cellsPerRow)
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
            .attr('opacity', 0)
    }

    update(selection, cellSize, cellsPerRow){
        return selection
            .attr('cx', (d, i) => (i % cellsPerRow) * cellSize + cellSize / 2)
            .attr('cy', (d, i) => Math.floor(i / cellsPerRow) * cellSize + cellSize / 2)
            .attr('r', cellSize / 2 - 1)
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