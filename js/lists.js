class list {

    constructor(name, items){
        this.name = name
        this.items = items
        this.setup()
        this.update()
    }

    setup(){
        this.setupDiv()
        this.setupCanvas()
        this.rendering = new listItemRendering()
    }

    setupDiv(){
        this.div = new div (this.name)
        const dimensions = this.getDivDimensions()
        this.div.resize(dimensions.width, dimensions.height)
    }

    setupCanvas(){
        const divElement = this.div.getElement()
        const dimensions = this.getCanvasDimensions()
        this.canvas = new canvas (this.name, divElement, dimensions)
    }

    getCanvasDimensions(){
        return {
            width: '100%',
            height: this.items.length * listItem.fontSize * 2 - listItem.padding
        }
    }

    getDivDimensions(){
        return {
            width: window.innerWidth / 2,
            height: this.calculateDivHeight()
        }
    }

    calculateDivHeight(){
        const scaledWindowHeight = window.innerHeight * 0.618
        const itemCount = Math.floor(scaledWindowHeight / (listItem.fontSize * 2))
        return itemCount * listItem.fontSize * 2 + listItem.padding * 3
    }


    update(items = this.items){
        this.rendering.render(this.canvas.getElement(), items)
    }


    getSelectedItemIndex(){
        return this.items.findIndex(item => item.selected === true)
    }


}

function onItemHover(){
    const elem = d3.select(this)
    const rect = elem.selectAll('rect.bar')
    const text = elem.selectAll('text')
    
    rect.attr('fill', 'pink')
        .attr('opacity', 1)

    text.style('fill', 'pink')
}

function onItemOut(){
    const elem = d3.select(this)
    const rect = elem.selectAll('rect.bar')
    const text = elem.selectAll('text')

    rect.attr('fill', 'white')
        .attr('opacity', 0.4)

    text.style('fill', 'white')
}

function onItemClick(){


}

class listItem {
    static fontSize = 16
    static padding = 4
}



class listItemRendering {

    render(canvas, items){
        const positioning = new listItemPositioning (items)
        const enterFn = this.#enter

        canvas.selectAll('g.songTitle')
            .data(items, d => d.id)
            .join(
                enter => enterFn(enter, positioning),
                update => update,
                exit => exit
            )
    }

    #enter(selection, positioning){
        const g = selection.append('g')
            .attr('class', 'songTitle')
            .attr('id', d => d.id)
            .attr('transform', (d, i) => positioning.getTranslate(i))
            .on('mouseover', onItemHover)
            .on('mouseout', onItemOut)
            .on('click', onItemClick)

        g.append('text')
            .text(d => d.title)
            .style('fill', 'white')
            .style('font-size', listItem.fontSize) 
            .attr('dx', listItem.padding * 2)
            .attr('dy', listItem.fontSize + listItem.padding / 2)

        g.append('rect')
            .attr('class', 'container')
            .attr('width', 300)
            .attr('height', listItem.fontSize * 2 - listItem.padding)
            .attr('fill', 'white')
            .attr('opacity', 0)

        g.append('rect')
            .attr('class', 'bar')
            .attr('width', 4) // 218 about right, but need to make this dynamic
            .attr('height', listItem.fontSize * 2 - listItem.padding)
            .attr('fill', 'white')
            .attr('opacity', 0.4)

    }
}

class listItemPositioning {

    constructor(items){
        this.items = items
    }

    getTranslate(i){
        const x = this.getPosX()
        const y = this.getPosY(i)
        return d3Helper.getTranslateString(x, y)
    }

    getPosX(){
        return 10
    }
    
    getPosY(i){
        const distanceFromSelected = i - this.getSelectedItemIndex()
        return distanceFromSelected * listItem.fontSize * 2
    }

    getSelectedItemIndex(){
        return this.items.findIndex(item => item.selected === true)
    }

}

