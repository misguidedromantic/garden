window.onload = async function(){
    await songsDataHandling.load()
    new canvas ('songMaps')
}



class canvas {
    constructor(id){
        this.id = id
        this.createDiv()
        this.createSVG()
    }


    createDiv(){
        this.div = d3.select('body')
            .append('div')
            .attr('id', this.id + 'Div')
    }

    createSVG(){
        return this.div.append('svg')
            .attr('id', this.id + 'Svg')
    }
}



