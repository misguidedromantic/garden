let menu = {}
let planWindow = {}
let plans = []


window.onload = function (){renderMainNavigator()}

function createMenu(){

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

    function createItemPlans(){

        const plansG = menu.svg.append('g')
            .attr('class', 'menuItemG')
            .attr('id', 'menuItemPlans')

        plansG.append('text')
            .text('StatementOfIntent')
            .style('font-family', 'tahoma')
            .style('font-size', '16')
            .attr('fill', 'black')
            .attr('y', 14)

        plansG.on('click', function(event, d) {
            const itemText = d3.select(this).select('text').text()
            console.log(itemText)
            loadPlan(itemText)
        })

        return plansG


    }

    menu.div = createMenuDiv()
    menu.svg = createSVGCanvas('menuSVG', menu.div)
    menu.items = []
    menu.items.push(createItemPlans())
    
}

function createPlanWindow(){

    function createPlanDiv(){
        return d3.select('body')
            .append('div')
            .attr('id', "planDiv")
            .style('position', 'absolute')
            .style('left', '2000px')
            .style('top', '160px')
            .style('width', '800px')
            .style('height', '800px')
            .style('padding', '10px')
            .attr('font-family', 'arial')
            .style('z-index', '1')
    }

    planWindow.div = createPlanDiv()


}


async function loadPlan(planName) {

    const planFile = await getPlanFile(planName)
    const header = d3.select(planFile.body).select('h1')
    const paras = d3.select(planFile.body).selectAll('p')

    try{
        planWindow.div.append('h1').html(header.html())
    }

    catch{
        createPlanWindow()
        planWindow.div.append('h1').html(header.html())
    }
    
    
    paras.each(function(){
        const p = d3.select(this)

        let pContent = true
 
        p.selectAll('span').each(function(){
            const spanHTML = d3.select(this).html()
            
            if(spanHTML === ''){
                pContent = false
            }  
        })

        if (pContent === true){
            planWindow.div.append('p').html(p.html())
        }
        
    })

    selectPlanWindow() 
}

function selectPlanWindow() {

    document.getElementById("planDiv").style.backgroundColor = 'white'

    //slide into view
    planWindow.div
        .transition()
        .duration(1000)
        .style('left', '15px')
        .style('background-color', '#F5F5DC')

}


async function getPlanFile(fileName){
    const response = await fetch(fileName + '.html')
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

function insertString(mainString, insertString, position) {
    return mainString.slice(0, position) + insertString + mainString.slice(position);
  }


  function getTranslateString(x, y){
    return 'translate(' + x + ',' + y + ')'
}


function getDivCount(){
    return d3.selectAll('div').size()
}
