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

    selectItem(){
        
    }


}

class songListControl {

    static #songs = []
    static #songMenu = {}

    static load (){
        
        this.#songMenu = new menu ('songs', 'songs')
        this.#songMenu.setup()
        this.#songs = songsData.getAllSongs()
        this.#songMenu.update(this.#songs)
        //this.#list = new list('songs', this.#songs)
    }

    static selectSong (songID) {
        this.deselectAll()
        const thisSong = this.#songs.find(song => song.id === songID)
        thisSong.selected = true
        this.#songMenu.update(this.#songs)

    }

    static deselectAll(){
        this.#songs.forEach(song => song.selected === false)
    }

    static collapseToSelected(){

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
    //get list name
    //const clickedItem = d3.select(this)
    const clickedSongID = d3.select(this).attr('id')
    console.log(clickedSongID)
    songListControl.selectSong(clickedSongID)
    //load/unload relevant content
    //update list

}

class listItem {
    static fontSize = 16
    static padding = 4
}

class listItemSettings {

    




}



class listItemRendering {

    render(canvas, items){
        const positioning = new listItemPositioning (items)
        const enterFn = this.#enter
        const updateFn = this.#update

        canvas.selectAll('g.listItem')
            .data(items, d => d.id)
            .join(
                enter => enterFn(enter, positioning),
                update => updateFn(update, positioning),
                exit => exit
            )
    }

    #enter(selection, positioning){
        const g = selection.append('g')
            .attr('class', 'listItem')
            .attr('id', d => d.id)
            .attr('transform', (d, i) => positioning.getTranslate(d, i))
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

    #update(selection, positioning){

        const gT = d3.transition('g').duration(500)
        const textT = d3.transition('text').duration(500)

        const g = selection.transition(gT)
            .attr('transform', (d, i) => positioning.getTranslate(d, i))
            
        g.select('text').style('fill', d => {return d.selected ? 'white' : 'transparent'})


    }
}

class listItemPositioning {

    constructor(items){
        this.items = items
    }

    getTranslate(d, i){
        const x = this.getPosX()
        const y = this.getPosY(d, i)
        return d3Helper.getTranslateString(x, y)
    }

    getPosX(){
        return 10
    }
    
    getPosY(d, i){
        if(this.getSelectedItemIndex() === -1){
            return (i + 1) * listItem.fontSize * 2
        } else {
            return d.selected ? listItem.fontSize * 2 : -50
        }


        const distanceFromSelected = i - this.getSelectedItemIndex()
        return distanceFromSelected * listItem.fontSize * 2
    }

    getSelectedItemIndex(){
        return this.items.findIndex(item => item.selected === true)
    }

}

class listItemStyling {

    highlight(){
        
    }

}

