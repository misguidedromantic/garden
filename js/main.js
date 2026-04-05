const gRatio = 1.618


window.onload = async function(){
    const llDisplay = new lifeLineDisplay
    setParameters(llDisplay)
    createElements(llDisplay)
    configureLifeLineDisplay(llDisplay)
}


function setParameters(display){
    display.title = 'Lifeline'
}

function createElements(display){
    display.elements.set('canvas', createCanvas())
    display.elements.set('overlay', createOverlay())
}


function createCanvas(){
    const thisCanvas = new canvas
    thisCanvas.div = addDiv(d3.select('body'))
    thisCanvas.svg = thisCanvas.div.append('svg')
    return thisCanvas
}

function createOverlay(){
    const thisOverlay = new overlay
    thisOverlay.div = addDiv(d3.select('body'))
    return thisOverlay
}

function addDiv(parentContainer){
    return parentContainer.append('div')
}

function configureLifeLineDisplay(display){
    const elementsArray = Array.from(display.elements.values())
    const controller = new elementController
    
    elementsArray.forEach(element => {
        const dimensions = elementSizing.defaultDimensions(element, display)
        //const coordinates = elementPositioning.defaultCoordinates(element, display)
        controller.resizeElement(element, dimensions)
    
    })
}

class lifeLineDisplay {
    static #instance = null
    static elements = {} 

    constructor(){
        if(lifeLineDisplay.#instance){
            return lifeLineDisplay.#instance
        }
        lifeLineDisplay.#instance = this
        this.elements = new Map()
    }

    static getInstance(){
        if(!lifeLineDisplay.#instance){
            lifeLineDisplay.#instance = new lifeLineDisplay()
        }
        return lifeLineDisplay.#instance
    }

    getElementDefaultWidth(element){
        switch(element.constructor.name){
            case 'canvas':
                return display.columnCount()
            case 'overlay':
                return display.columnCount()
            default:
                return 1
        }
    }

    getElementDefaultGirdPosition(element, deviceColumnCount = display.columnCount()){
        switch(element.constructor.name){
            case 'canvas':
                return {row: 1, column: 1}
            case 'overlay':
                return {row: 1, column: 1}
            default:
                return {row: 1, column: 1}
        }
    }

    getElementDefaultZIndex(element){
        switch(element.constructor.name){
            case 'canvas':
                return 1
            case 'overlay':
                return 2
            default:
                return 3
        }
    }
}


class display {
    static gutterSize = 15

    static columnWidth(columnCount, gutterSize){
        const totalGutterWidth = gutterSize * (columnCount - 1)
        const availableWidth = window.innerWidth - totalGutterWidth
        return availableWidth / columnCount
    }

    static columnCount(){
        const deviceType = this.deviceType()
        switch(deviceType){
            case 'mobile':
                return 4
            case 'tablet':
                return 8
            case 'desktop':
                return 12
        }
    }

    static gutterWidth(){
        const deviceType = this.deviceType()
        switch(deviceType){
            case 'mobile':
                return 5
            case 'tablet':
                return 10
            case 'desktop':
                return 15
        }
    }

    
    static deviceType(){
        const width = window.innerWidth
        if(width < 500){
            return 'mobile'
        } else if (width < 1000){
            return 'tablet'
        } else {
            return 'desktop'
        }
    }

}

class overlay {

}

class canvas {

}

class elementFactory {
    static createElement(type){

    }

    static createObject(type){
        switch(type){
            case 'canvas':
                return new canvas
            case 'overlay':
                return new overlay
            default:
                return null
        }
    }

    static createDomElements(element){
        switch(element.constructor.name){
            case 'canvas':
                element.div = addDiv(d3.select('body'))
                element.svg = element.div.append('svg')
                break
            case 'overlay':
                element.div = addDiv(d3.select('body'))
                break
            default:
                break
        }
    }

    static addDiv(parentContainer = d3.select('body')){
        return parentContainer.append('div')
    }

    static addSvg(parentContainer){
        return parentContainer.append('svg')
    }
}

class elementController {
    resizeElement(element, newDimensions, transitionDuration = 0){
        this.updateObjectParameters(element, newDimensions)
        this.updateDimensionsOnDom(element, transitionDuration)
    }

    updateObjectParameters(element, newDimensions){
        element.width = newDimensions.width
        element.height = newDimensions.height
    }

    updateDimensionsOnDom(element, transitionDuration){
        switch(element.constructor.name){
            case 'canvas':
                this.resizeDiv(element, transitionDuration)
                this.resizeSvg(element, transitionDuration)
                break
            case 'overlay':
                this.resizeDiv(element, transitionDuration)
                break
            default:
                break
        }
    }

    resizeDiv(element, transitionDuration){
        element.div.transition()
            .duration(transitionDuration)
            .style('width', element.width + 'px')
            .style('height', element.height + 'px')
    }

    resizeSvg(element, transitionDuration){
        element.svg.transition()
            .duration(transitionDuration)
            .attr('width', element.width)
            .attr('height', element.height)
    }
}


class elementSizing {
    static defaultDimensions(element, thisDisplay){
        const widthInColumns = thisDisplay.getElementDefaultWidth(element)
        const gutterWidth = display.gutterWidth()
        return this.calculateElementDimensions(widthInColumns, gutterWidth)
    }


    static calculateElementDimensions(widthInColumns, gutterWidth){
        const columnWidth = display.columnWidth(display.columnCount(), gutterWidth)
        const elementWidth = (widthInColumns * columnWidth) + ((widthInColumns - 1) * gutterWidth)
        const elementHeight = elementWidth / gRatio
        return {width: Math.floor(elementWidth), height: Math.floor(elementHeight)}
    }
 
}

class elementPositioning {
    static defaultCoordinates(element){
        const elementDefaultGridPosition = lifeLineDisplay.getElementDefaultGirdPosition(element, deviceColumnCount)
        return this.calculateElementPosition(element, deviceColumnCount, gutterSize)
    }

    static calculateElementPosition(element, columnWidth, gutterSize){
        const elementLeft = ((element.defaultGridPosition.column - 1) * columnWidth) + ((element.defaultGridPosition.column - 1) * gutterSize)
        const elementTop = ((element.defaultGridPosition.row - 1) * columnWidth) + ((element.defaultGridPosition.row - 1) * gutterSize)
        return {left: elementLeft, top: elementTop}
    }
}