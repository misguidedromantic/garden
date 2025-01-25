class songBlockCanvas {
    static div = {}
    static svg = {}
    static blocks = []
    static width = 300
    static height = 300
    static left = 72
    static top = 120
    static position = 'absolute'
    static borderRadius = 20
}

class songBlockControl {
    constructor(){
        this.canvasRendering = new songBlockCanvasRendering
        this.blockRendering = new songBlockRendering
        this.createSongBlockCanvas()
    }

    createSongBlockCanvas(){
        songBlockCanvas.div = this.canvasRendering.createDiv()
        songBlockCanvas.svg = this.canvasRendering.createSVGCanvas()
    }

    loadSong(song){
        this.blockRendering.renderBlocks(song.structure)
    }

}

class songBlockCanvasRendering {
    createDiv(){
        return d3.select('body')
            .append('div')
            .attr('id', 'songBlockCanvasDiv')
            .style('position', songBlockCanvas.position)
            .style('top', songBlockCanvas.top + 'px')
            .style('left', songBlockCanvas.left + 'px')
            .style('height', songBlockCanvas.height + 'px')
            .style('z-index', displays.getZIndex('songBlockCanvasDiv'))
            //.style('border-top', '1px solid black')
            //.style('background-color', 'white')
    }

    createSVGCanvas(){
        return songBlockCanvas.div.append('svg')
            .attr('id', 'songBlockCanvasSVG')
            .attr('height', songBlockCanvas.height)
    }

    resize(delay, duration){
        songBlockCanvas.div.transition('tSizing').delay(delay).duration(duration)
            .style('width', songBlockCanvas.width + 'px')
            .style('height', songBlockCanvas.height + 'px')
    }
}


class songBlockPositioning {

    static calculateTranslate(d, i){
        const x = this.#getXPos(d)
        const y = this.#getYPos(d)
        return this.#getTranslateString(x, y)
    }

    static #getXPos(d){
        return 17
    }

    static #getYPos(d){
        return d.sequence * 17
    }

    static #getTranslateString(x, y){
        return 'translate(' + x + ',' + y + ')'
    }
}

class songBlockStyling {
    static calculateFill(d){
        const varCount = this.#getFormVariationCount(d)
        switch(varCount){
            case 0:
                return 'lightGrey'

            case 1:
                return 'pink'

            case 2:
                return 'purple'

            default:
                return 'red'
        }
    }

    static #getFormVariationCount(d){
        try{
            return d.formVariations.length
        }
        catch{
            return 0
        }
    }

    static calculateStroke(d){
        const variationFactor = this.#getVariationFactor(d)
        if(variationFactor < 0){return 'lightGrey'}else{return this.calculateFill(d)}
    }

    static #getVariationFactor(d){
        if(d.constructor.name === 'melodyBlock'){
            return blockDataHandling.getMelodyBlockVariationLevel(d) 
        }

        if(d.constructor.name === 'progressionBlock'){
            return blockDataHandling.getProgressionBlockVariationLevel(d) 
        }
    }
}

class songBlockRendering {

    renderBlocks(data){
        const enterControl = new blockEnter
        const updateControl = new blockUpdate
        const exitControl = new blockExit
        
        songBlockCanvas.svg.selectAll('g')
            .data(data, d => d.title)
            .join(
                enter => enterControl.enterBlocks(enter),
                update => updateControl.updateBlocks(update),
                exit => exitControl.exitBlocks(exit)
            )
    }
}

class blockEnter {

    enterBlocks(selection){
        const groups = this.enterGroups(selection)
        const rectangles = this.enterRects(groups)
    }

    enterGroups(selection){
        return selection.append('g')
            .attr('id', d => d.title)
            .attr('transform', (d, i) => songBlockPositioning.calculateTranslate(d, i))
    }

    enterRects(groups){

        groups.append('rect')
            .attr('class', d => d.constructor.name)
            .attr('width', 14)
            .attr('height', 14)
            .attr('fill', d => songBlockStyling.calculateFill(d))
            .attr('stroke', d => songBlockStyling.calculateStroke(d))
            .attr('stroke-width', 1)


        return groups
    }


}


class blockUpdate {

    updateBlocks(selection){
        const groups = this.updateGroups(selection)
        const rectangles = this.updateRects(groups)
    }

    updateGroups(selection){
        return selection.transition()
            .duration(400)
            .attr('transform', (d, i) => {
                return menuItemPositioning.calculateTranslate(d, i)
            })
    }

    updateRects(groups){
        return groups.select('rect')
            .attr('font-weight', d => d.selected ? 'bold' : 'normal')
            .attr('fill', d => d.selected && d.constructor.name === 'menuItem' && menu.state === 'subSelect' ? 'grey' : 'black')
    }

}

class blockExit {
    exitBlocks(selection){
        selection.remove()
        return selection
    }
}


