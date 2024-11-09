let dispHandler = {} 

window.onload = function (){
    displayNavigator()
    //displayPlan('my digital garden')
}

function displayNavigator(){
    const dataHandler = new navHandler
    const destinations = dataHandler.getDestinationTitles()
    dispHandler = new displayHandler
    dispHandler.renderNavigator(destinations)
}

function displayPlansSubMenu(){
    const dataPlansHandler = new planHandler
    const dataNavHandler = new navHandler
    const destinations = dataNavHandler.getDestinationTitles()
    const selectedItem = destinations.filter(item => item.title === "plans")
    
    const data = [...selectedItem, ...dataPlansHandler.plans]

    dispHandler.renderNavigator(data)
    
}


async function displayPlan(planName) {
    const plHandler = new planHandler
    const planToDisplay = await plHandler.getPlanHTML(planName)
    dispHandler.renderPlanWindow(planToDisplay)
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
