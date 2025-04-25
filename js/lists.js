class list {

    constructor(name, items){
        this.name = name
        this.items = items
        this.setup()
        this.update()
    }

    setup(){
        this.div = this.createDiv()
        this.canvas = this.createCanvas()
        this.setDimensions()
        this.rendering = new listItemRendering()
    }

    createDiv(){
        return new div (this.name)
    }

    createCanvas(){
        return new canvas (this.name, this.div.getElement())
    }

    setDimensions(){
        const width = window.innerWidth / 2
        const height = this.items.length * listItem.fontSize * 2
        this.div.resize(width, height)
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

