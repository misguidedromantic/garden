class songBlockCanvas {
    static div = {}
    static svg = {}
    static blocks = []
    static width = 0
    static height = 0
    static left = 0
    static top = 160
    static position = 'absolute'
    static borderRadius = 20
}

class songBlockControl {
    constructor(){
        this.canvasRendering = new songBlockCanvasRendering
        this.blockRendering = new songBlockRendering
    }

    createSongBlockCanvas(){
        songBlockCanvas.div = this.canvasRendering.createDiv()
        songBlockCanvas.svg = this.canvasRendering.createSVGCanvas()
    }

    loadSong(song){
        this.blockRendering.renderBlocks(song.blocks)
    }

}

class songBlockCanvasRendering {
    createDiv(){
        return d3.select('body')
            .append('div')
            .attr('id', 'songBlockCanvasDiv')
            .style('position', songBlockCanvas.position)
            .style('top', songBlockCanvas.top + 'px')

    }

    createSVGCanvas(){
        return songBlockCanvas.div.append('svg')
            .attr('id', 'songBlockCanvasSVG')
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
        return blockDataHandling.getBlockNumberInGroup(d.id) * 11
    }

    static #getYPos(d){
        const groupNum = blockDataHandling.getGroupNumber(d.groupID)
        return (groupNum * 27) + (d.constructor.name === 'melodyBlock' ? 0 : 11)
    }

    static #getTranslateString(x, y){
        return 'translate(' + x + ',' + y + ')'
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
            .attr('width', 10)
            .attr('height', '10')
            .attr('fill', 'blue')


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

