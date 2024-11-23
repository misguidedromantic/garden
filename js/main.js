window.onload = function(){
    const div = createDiv()
    const svg = createSVG(div)
    const data = getDestinations()
    renderDestinations(svg, data)


}

function createDiv (){
    return d3.select('body')
        .append('div')
        .attr('id', 'navigatorDiv')
}

function createSVG (div){
    return div.append('svg')
        .attr('id', 'navigatorSVG')
}

function getDestinations(){
    return [
        'plans',
        'concepts'
    ]
}

function renderDestinations(svg, data){

    
    svg.selectAll('g')
        .data(data, d => d)
        .join(
            enter => {
                const groups = enter.append('g')
                    .attr('class', 'destination')
                    .attr('id', d => d)
                    .attr('transform', (d, i) => listHandler.calculateTranslate(i))
                    .on('click', listHandler.clickItem)
                
                
                
                groups.append('text').text(d => d)
            },
            update => update,
            exit => exit
        )
}

class listHandler {

    static calculateTranslate(i){
        const x = list.x
        const y = list.yGap * i + list.yGap
        return 'translate(' + x + ',' + y + ')'
    }

    static clickItem(){
        const item = d3.select(this).attr('id')
        console.log(item)
    }


}

class list {

    static x = 0
    static yGap = 20

}