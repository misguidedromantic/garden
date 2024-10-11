function convertDivDimension(str){
    const index = str.indexOf("px");
    const number = parseInt(str.slice(0, index))
    console.log(str)
    console.log(number)
    return number
}

function createSVGCanvas(id, div){
    return div.append('svg')
    .attr('id', id)
    .attr('width', convertDivDimension(div.style('width')))
    .attr('height', convertDivDimension(div.style('height')))

}