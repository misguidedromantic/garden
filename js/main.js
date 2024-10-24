window.onload = function (){createMenu()}

async function createMenu(){

    function createMenuDiv(){
        return d3.select('body')
            .append('div')
            .attr('id', "menuDiv")
            .style('position', 'absolute')
            .style('left', '5px')
            .style('top', '5px')
            .style('width', '800px')
            .style('height', '160px')
    }

    function createPlanDiv(){
        return d3.select('body')
            .append('div')
            .attr('id', "planDiv")
            .style('position', 'absolute')
            .style('left', '5px')
            .style('top', '160px')
            .style('width', '800px')
            .style('height', '800px')
    }

    const menuDiv = createMenuDiv()
    const planDiv = createPlanDiv()
    const menuSVG = createSVGCanvas('menuSVG', menuDiv)
    const plansG = menuSVG.append('g').attr('class', 'menuItemG')
    
    plansG.append('text')
        .text('StatementOfIntent')
        .style('font-family', 'tahoma')
        .style('font-size', '16')
        .attr('fill', 'black')
        .attr('y', 14 / 2)

    const statementFile = await getStatementFile()
    console.log(statementFile)

    const paras = statementFile.querySelector('.p2')
    const d3Paras = d3.select(statementFile.body).select('.p2')
    
    planDiv.append('p').text('test')


    console.log(d3Paras)  

}

async function getStatementFile(){
    const response = await fetch('statementOfIntent.html')
    const responseText = await response.text()
    const parser = new DOMParser()
    return parser.parseFromString(responseText, "text/html")
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

