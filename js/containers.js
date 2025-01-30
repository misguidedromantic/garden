function createDiv(id, position, parent = d3.select('body')){
    return parent
        .append('div')
        .attr('id', id + 'Div')
        .style('position', position)
        //.style('z-index', displays.getZIndex('navigator'))
}

function createSVGCanvas(id, div){
    return div.append('svg')
        .attr('id', id + 'SVG')
        //.on('mouseover', events.onMenuMouseOver)
        //.on('mouseout', events.onMenuMouseOut)
}

class container {
    constructor(id, parentContainer){
        this.id = id
        this.parentContainer = parentContainer
        this.createElement()
    }

    createElement(){
        this.element = this.parentContainer
            .append(this.constructor.name)
            .attr('id', this.id + this.constructor.name.toUpperCase())
    }

    addEvent(eventType, func){
        this.element.on(eventType, func)
    }
}

class div extends container {
    constructor(id, positionStyle, parentContainer = d3.select('body')){
        super(id, parentContainer)
        this.setPositionStyle(positionStyle)
    }

    setPositionStyle(style){
        this.element.style('position', style)
    }
}
class svg extends container {
    constructor(id, parentContainer){
        super(id, parentContainer)
    }

}
