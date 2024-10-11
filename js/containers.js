let divs = {}

function setupDivs (){

    //create navigation div
    divs.navMenu = d3.select('body')
        .append('div')
        .attr('id', "navMenu")
        .style('position', 'absolute')
        .style('left', '5px')
        .style('top', '5px')
        .style('width', '160px')
        .style('height', '80px')

  
    divs.songMap = d3.select('body')
        .append('div')
        .attr('id', "songMapDiv")
        .style('position', 'absolute')
        .style('left', '5px')
        .style('top', '165px')
        .style('width', (window.innerWidth - 10) + "px")
        .style('height', (window.innerHeight - 165) + "px")

}


function createSVGCanvas(id, div){

    function convertDivDimension(str){
        const index = str.indexOf("px")
        return parseInt(str.slice(0, index))
    }

    return div.append('svg')
        .attr('id', id)
        .attr('width', convertDivDimension(div.style('width')))
        .attr('height', convertDivDimension(div.style('height')))
}