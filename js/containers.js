class container {

    #element = {}

    constructor(id, parentContainer){
        this.id = id
        this.parentContainer = parentContainer
        this.createElement()
        return this.getElement()
    }

    createElement(){
        this.#element = this.parentContainer
            .append(this.constructor.name)
            .attr('id', this.id + this.constructor.name.toUpperCase())
    }

    getElement(){
        return this.#element
    }

    addEvent(eventType, func){
        this.#element.on(eventType, func)
    }

    resize(dimensions, delay = 0, duration = 0){
        const element = this.getElement()
        if(this.constructor.name === 'div'){
            element.transition('tSizingDIV').delay(delay).duration(duration)
                .style('width', dimensions.width + 'px')
                .style('height', dimensions.height + 'px')

        } else {
            element
                .attr('width', dimensions.width)
                .attr('height', dimensions.height)
        }
  
    }

}

class div extends container {

    constructor(id, parentContainer = d3.select('body')){
        super(id, parentContainer)
    }

    setPositionStyle(style){
        const element = this.getElement()
        element.style('position', style)
    }

    float(styles, delay = 0, duration = 0){
        const element = this.getElement()
        element.transition('tFloat')
            .delay(delay)
            .duration(duration)
                .style('background-color', styles.backgroundColour)
                .style('border-radius', styles.borderRadius + 'px')
                .style('box-shadow', styles.boxShadow)
    }

    move(position, delay = 0, duration = 0){
        this.navigator.div.transition('tMove')
            .ease(d3.easeSin)
            .delay(delay)
            .duration(duration)
            .style('left', position.left + "px")
            .style('top', position.top + "px")
    }

}

class svg extends container {
    constructor(id, parentContainer){
        super(id, parentContainer)
    }
}

