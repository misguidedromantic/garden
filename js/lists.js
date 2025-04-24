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
        const height = this.items.length * 16
        this.div.resize(width, height)
    }

    update(items = this.items){
        this.rendering.render(this.canvas.getElement(), this.items)
    }


    getSelectedItemIndex(){
        return this.items.findIndex(item => item.selected === true)
    }


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

        g.append('text')
            .text(d => d.title)
            .style('fill', 'white') 
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
        return distanceFromSelected * 16
    }

    getSelectedItemIndex(){
        return this.items.findIndex(item => item.selected === true)
    }

}

