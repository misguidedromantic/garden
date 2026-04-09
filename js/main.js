const GOLDEN_RATIO = 1.618

class LifelineDisplay {
    cellSize = 16
    
    constructor() {
        this.grid = new Grid()
        this.elementFactory = new ElementFactory(this.grid)
        this.layout = new LayoutManager(this.grid)
        this.elements = new Map()
        this.initialize()
    }

    get rowCount() {
        return Math.ceil(this.totalCells / this.cellsPerRow)
    }

    get cellsPerRow() {
        const canvasWidth = this.elements.get('canvas').svg.attr('width')
        console.log(`Calculating cells per row with canvas width: ${canvasWidth}px and cell size: ${this.cellSize}px`)
        return Math.floor(canvasWidth / this.cellSize)
    }

    get totalCells() {
        return this.data.length
    }

    async initialize() {
        this.createElements()
        await this.arrangeElements()
        this.populateContent()
    }

    createElements() {
        this.elements.set('canvas', this.elementFactory.createElement('canvas'))
        this.elements.set('overlay', this.elementFactory.createElement('overlay'))
    }

    async arrangeElements() {
        const elementsArray = Array.from(this.elements.values())
        await this.layout.sizeElements(elementsArray)
        await this.layout.positionElements(elementsArray)
    }

    async populateContent() {
        const content = new contentManager()
        await content.loadContent(this)
        this.layout.fitElementsToContent(this)
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
            
            if(element.constructor.name === 'Canvas' && display.constructor.name === 'LifelineDisplay'){
                await this.contentRendering.renderWeeksOfLife(display, element, display.data)
                console.log('circles rendered')
            }
            
            console.log('content loaded for element: ' + element.constructor.name)
            
        }

        console.log('All content loaded')
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
        this.breakpoints = { mobile: 500, tablet: 1000 }
        this.columnMap = { mobile: 4, tablet: 8, desktop: 12 }
        this.gutterMap = { mobile: 5, tablet: 10, desktop: 15 }
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

    get gutterWidth() {
        return this.gutterMap[this.deviceType]
    }

    get totalGutterWidth() {
        return this.gutterWidth * (this.columnCount - 1)
    }

    get usableWidth() {
        return window.innerWidth - this.totalGutterWidth
    }

    get columnWidth() {
        return Math.floor(this.usableWidth / this.columnCount)
    }

    get marginWidth() {
        return (this.usableWidth % this.columnCount) / 2
    }

    get rowHeight() {
        return Math.floor(this.columnWidth / GOLDEN_RATIO)
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
    constructor(displayConfig) {
        this.displayConfig = displayConfig
    }

    createElement(type) {
        const element = this.createObject(type)
        this.initializeDomElements(element)
        return element
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
                element.div = this.addDiv(element)
                break
            default:
                break
        }
    }

    addDiv(element, parentContainer = d3.select('body')) {
        return parentContainer.append('div')
            .attr('class', element.constructor.name.toLowerCase())
            .style('position', 'absolute')
    }

    addSvg(element) {
        return element.div.append('svg')
            .attr('class', element.constructor.name.toLowerCase())
    }
}



class elementSizing {

    constructor(grid){
        this.grid = grid
    }

    default(element) {
        const {columnSpan, rowSpan} = this.defaultSpans(element)
        return this.calculateDimensions(columnSpan, rowSpan)
    }

    defaultColumnSpan(element){
        switch (element.constructor.name) {
            case 'Canvas':
                return this.grid.columnCount
            case 'Overlay':
                return 1
            default:
                return 1
        }
    }

    calculateWidth(){
        
    }

    defaultSpans(element) {
        switch (element.constructor.name) {
            case 'Canvas':
                return { columnSpan: this.grid.columnCount, rowSpan: Math.ceil(this.grid.columnCount / GOLDEN_RATIO) }
            case 'Overlay':
                return { columnSpan: 1, rowSpan: 1 }
            default:
                return { columnSpan: 1, rowSpan: 1 }
        }
    }

    toContentHeight(contentHeight){
        const width = this.width(this.grid.columnCount)
        return {width: width, height: contentHeight}
    }

    calculateDimensions(columnSpan, rowSpan){
        return {
            width: this.width(columnSpan),
            height: this.height(rowSpan)
        }
    }

    width(columnSpan){
        const withoutGutters = columnSpan * this.grid.columnWidth
        const totalGutterWidth = (columnSpan - 1) * this.grid.gutterWidth
        return withoutGutters + totalGutterWidth
    }

    height(rowSpan){
        const withoutGutters = rowSpan * this.grid.rowHeight
        const totalGutterWidth = (rowSpan - 1) * this.grid.gutterWidth
        return withoutGutters + totalGutterWidth
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

    calculatePosition(gridCoords) {
        return {
            left: this.left(gridCoords.column),
            top: this.top(gridCoords.row)
        }
    }

    left(column) {
        const marginWidth = this.grid.marginWidth
        const totalColumnWidth = (column - 1) * this.grid.columnWidth
        const totalGutterWidth = (column - 1) * this.grid.gutterWidth
        return marginWidth + totalColumnWidth + totalGutterWidth
    }

    top(row) {
        const marginWidth = this.grid.marginWidth
        const totalRowHeight = (row - 1) * this.grid.rowHeight
        const totalGutterHeight = (row - 1) * this.grid.gutterWidth
        return marginWidth + totalRowHeight + totalGutterHeight
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
            if(element.constructor.name === 'Canvas' && display.constructor.name === 'LifelineDisplay'){
                const contentHeight = display.rowCount * display.cellSize + display.cellSize / 2
                console.log(contentHeight)
                const {width, height} = this.sizing.toContentHeight(contentHeight)
                console.log(width, height)
                const controller = new ElementController(element)
                console.log(`Resizing canvas to width: ${width}px, height: ${height}px to fit content`)
                await controller.resize(width, height)
            }
        }
    }


    async positionElements(elements) {
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i]
            const {left, top} = this.positioning.default(element)
            const controller = new ElementController(element)
            await controller.move(left, top)
        }
    }

    async sizeElements(elements) {
         for (let i = 0; i < elements.length; i++) {
            const element = elements[i]
            const {width, height} = this.sizing.default(element)
            console.log(`Sizing ${element.constructor.name} to width: ${width}px, height: ${height}px`)
            const controller = new ElementController(element)
            await controller.resize(width, height)
        }
    }

    async stackElements(elements) {
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i]
            const zIndex = this.positioning.calculateZIndex(element)
            const controller = new ElementController(element)
            controller.applyZIndex(zIndex)
        }
    }

    scaledRowSpan(element, columnSpan) {
        switch (element.constructor.name) {
            case 'Canvas':
                return Math.ceil(columnSpan / GOLDEN_RATIO)
            case 'Overlay':
                return 1
            default:
                return 1
        }
    }
}


class ElementController {
    constructor(element) {
        this.element = element
        this.transitionDuration = 500
    }

    stack(zIndex) {
        this.applyZIndex(zIndex)
     }
    
    applyZIndex(zIndex) {
        this.element.div.style('z-index', zIndex)
    }

    resize(width, height, transitionDuration = this.transitionDuration) {
        this.transitionDuration = transitionDuration
        switch (this.element.constructor.name) {
            case 'Canvas':
                return this.renderSvgDimensions(width, height)
            case 'Overlay':
                return this.renderDivDimensions(width, height)
            default:
                return Promise.resolve()

        }
    }

    renderDivDimensions(width, height) {
        return this.element.div.transition()
            .duration(this.transitionDuration)
            .style('width', width + 'px')
            .style('height', height + 'px')
            .end()
    }

    renderSvgDimensions(width, height) {
        return this.element.svg.transition()
            .duration(this.transitionDuration)
            .attr('width', width)
            .attr('height', height)
            .end()      
    }

    move(left, top, transitionDuration = this.transitionDuration) {
        this.transitionDuration = transitionDuration
        this.renderDivPosition(left, top)
    }

    renderDivPosition(left, top) {
        this.element.div.transition()
            .duration(this.transitionDuration)
            .style('left', left + 'px')
            .style('top', top + 'px')
    }
}

class contentRendering {
    async renderWeeksOfLife(display, canvas, data) {
        console.log(`Rendering weeks of life with cell size: ${display.cellSize}px, cells per row: ${display.cellsPerRow}`)
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
        return selection.selectAll('circle')
            .attr('cx', (d, i) => (i % display.cellsPerRow) * display.cellSize + display.cellSize / 2)
            .attr('cy', (d, i) => Math.floor(i / display.cellsPerRow) * display.cellSize + display.cellSize / 2)
            .attr('r', display.cellSize / 2 - 1)
            .attr('fill', d => this.getStatusColor(d.status))
    }

    exit(selection){
        return selection.selectAll('circle').remove()
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

/**
 * Application initialization
 */
window.addEventListener('DOMContentLoaded', () => {
    new LifelineDisplay()
})