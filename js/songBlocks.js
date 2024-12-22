

class songBlock {
    constructor(id, groupID){
        this.id = id
        this.groupID = groupID
    }
}

class melodyBlock extends songBlock {
    constructor(item){
        super(item.blockID + 'Melody', item.blockGroupID)
        this.peakNote = new note (item.peakNote)
        this.endNote = new note (item.endNote)
    }
}

class progressionBlock extends songBlock {
    constructor(item, progressionArray){
        super(item.blockID + 'Progression', item.blockGroupID)
        this.chords = []
        this.setChords(progressionArray)   
    }   

    setChords(progressionArray){
        progressionArray.forEach(item => {
            this.chords.push(new chord (item.chordName, item.chordLengthInBeats))
        })
    }
}

class blockDataHandling {

    static getGroupNumber(groupID){
        return groupID.slice(2)
    }

    static getBlockNumberInGroup(blockID){
        const blockTypeIndex = this.#getBlockTypeIndex(blockID)
        return blockID.slice(1,2)
    }

    static #getBlockTypeIndex(blockID){
        const iMelody = blockID.indexOf('Melody') 
        const iProgression = blockID.indexOf('Progression')
        return iMelody > 0 ? iMelody : iProgression
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