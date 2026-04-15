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
    #elementController = {}
    #currentDisplay = null

    constructor(){
        this.#displays = new Map
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
            const content = this.getElementContent(element.constructor.name)
            await this.#elementController.applyContent(element, content)
        }
    }

    getElementContent(elementType){
        switch(elementType){
            case 'Canvas':
                return this.#currentDisplay.canvasData
            case 'Navigation':
                return this.#currentDisplay.navigationOptions
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
    #dataHandler = null
    
    constructor() {
        if(this.#instance !==null){
            return this.#instance
        }
        this.#instance = this
        this.#dataHandler = new DataHandler()
        this.elements = this.elementsMap
    }

    get elementsMap(){
        return new Map()
            .set('canvas', null)
            .set('navigation', null)
     }

    get backgroundColour(){
        return '#F7F9FA'
    }

    get selectedIncrement(){
        return 'weeks'
    }

    get birthDate(){
        return new Date(1985, 5, 6)
    }

    get navigationOptions(){
        return this.#dataHandler.lifeLineIncrementOptions
    }

    get canvasData(){
        return this.#dataHandler.lifeLineData(this.birthDate, this.selectedIncrement)
    }


}

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

class Element {
    constructor(type){
        switch (type) {
            case 'canvas':
                return new Canvas()
            case 'navigation':
                return new Navigation()
            default:
                return this
        }
    }
}

class Navigation {
    constructor() {
        this.div = null
        this.options = new Map
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

    applyContent(element, content){
        this.settings.setToContent(element, content)
        this.dynamics.renderContent(element, content, 0)
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
        if(element.constructor.name === 'Canvas'){
            this.setConstants(element, this.layout.elementConstants(element))
        }
        
        this.setDimensions(element, this.layout.getContentDimensions(element, data))
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

    elementConstants(element){
        return {
            cellSize: this.grid.cellSize,
            cellsPerRow: this.sizing.cellsPerRow(element.width)
        }
    }

    getContentDimensions(element, data){
        const {width, height} = this.sizing.toContent(element, data)
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

    get minColumnWidth(){

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

}

class ElementSizing {

    constructor(grid){
        this.grid = grid
    }

    default() {
        return {
            width: this.defaultWidth(),
            height: this.defaultHeight()
        }
    }

    defaultWidth(){
        return this.spanWidth(this.grid.columnCount)
    }

    defaultHeight(){
        return 4 * this.grid.cellSize
    }

    toContent(element, data){
        if(element.constructor.name === 'Canvas'){
            return {
                width: element.width, 
                height: this.contentHeight(element.width, data.length)
            }
        } else if (element.constructor.name === 'Navigation'){
            return {
                width: element.width, 
                height: 4 * this.grid.cellSize
            }
        }
    }

    cellsPerRow(elementWidth){
        return elementWidth / this.grid.cellSize
    }
    
    contentHeight(elementWidth, cellsRequired){
        const rowCount = Math.ceil(cellsRequired / this.cellsPerRow(elementWidth))
        return rowCount * this.grid.cellSize
    }

    spanWidth(columnCount){
        if(columnCount === this.grid.columnCount){
            return this.grid.usableWidth
        } else {
            return this.spanColumnWidth(columnCount) + this.spanGutterWidth(columnCount)
        }
    }

    spanGutterWidth(columnCount){
        return (columnCount - 1) * this.grid.gutterWidth
    }

    spanColumnWidth(columnCount){
        return columnCount * this.grid.columnWidth
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
                return { row: 5, column: 1}
            case 'Navigation':
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
        return totalColumnWidth + totalGutterWidth
    }

    top(row) {
        const totalRowHeight = (row - 1) * this.grid.cellSize
        const totalGutterHeight = (row - 1) * this.grid.gutterWidth
        return totalRowHeight + totalGutterHeight
    }

    calculateZIndex(element) {
        switch (element.constructor.name) {
            case 'Canvas':
                return 1
            case 'Navigation':
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
        if(element.constructor.name === 'Canvas'){
            this.contentDynamics.renderLifeLineCircles(element, data, transitionDuration)
        } else if (element.constructor.name === 'Navigation'){
            this.contentDynamics.renderNavigationOptions(element, data)
        }
        
    }

    resize(element, transitionDuration = 0) {
        switch (element.constructor.name) {
            case 'Canvas':
                this.renderSvgDimensions(element, transitionDuration)
            case 'Navigation':
                this.renderDivDimensions(element, transitionDuration)
        }
    }

    move(element, transitionDuration = 0) {
        this.renderDivPosition(element)
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

class Increment {
    constructor(type, status){
        switch(type){
            case 'weeks':
                return new Week(status)
            case 'months':
                return new Month(status)
            case 'years':
                return new Year(status)
        }
    }
}

class Week {
    constructor(status){
        this.status = status
    }
}

class Month {
    constructor(status){
        this.status = status
    }
}

class Year {
    constructor(status){
        this.status = status
    }
}

class DataHandler {

    get daysDenominator(){
        return 1000 * 60 * 60 * 24
    }

    get currentDate(){
        return new Date()
    }

    get lifeLineIncrementOptions(){
        return ['weeks', 'months', 'years']
    }

    lifeLineData(birthDate, increment){
        return [
            ...this.createArray('lived', birthDate, increment),
            ...this.createArray('current', birthDate, increment),
            ...this.createArray('expected', birthDate, increment)
        ]
    }

    createArray(status, birthDate, increment){
        const length = status === 'current' ? 1 : this[status](birthDate, increment)
        const obj = (increment, status) => {return new Increment(increment, status)}
        return Array.from({length: length}, () => (obj(increment, status)))

    }

    deathDate(birthDate){
        let deathDate = new Date()
        return deathDate.setFullYear(birthDate.getFullYear() + 80)
    }

    lived(birthDate, increment){
        return this[increment](this.currentDate - birthDate)
    }


    expected(birthDate, increment){
        return this[increment](this.deathDate(birthDate) - this.currentDate) - 1
    }

    days(timeDifference){
        return Math.floor(timeDifference / this.daysDenominator)
    }

    weeks(timeDifference){
        return Math.floor(this.days(timeDifference) / 7)
    }

    months(timeDifference){
        return Math.floor(this.weeks(timeDifference) / 52 * 12)
    }

    years(timeDifference){
        return Math.floor(this.days(timeDifference) / 365)
    }

}

class ContentDynamics {
    renderNavigationOptions(navigation, data){

        const getTranslate = (d, i) => {
            const x = i * 88
            const y = 16
            return 'translate(' + x + ',' + y + ')'
        }

        console.log(data)
        navigation.svg.selectAll('g')
            .data(data, d => d)
            .join(
                enter => {
                    const g = enter.append('g').attr('transform', (d, i) => getTranslate(d, i))
                    const text = g.append('text').text(d => d)
                    return g
                },
                update => update,
                exit => exit
            )
    }




    async renderLifeLineCircles(canvas, data, transitionDuration) {
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

window.onload = () => {
    orchestrator.loadDisplay('lifeLine')
}
