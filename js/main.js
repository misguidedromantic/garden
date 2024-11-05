let planWindow = {}


window.onload = function (){displayPlan('my digital garden')}

function displayNavigator(){
    const nHandler = new navHandler
    const destinations = nHandler.getDestinationTitles()
    const dispHandler = new displayHandler
    dispHandler.renderNavigator(destinations)

}


async function displayPlan(planName) {
    const plHandler = new planHandler
    const dispHandler = new displayHandler
    const planToDisplay = await plHandler.getPlanHTML(planName)
    dispHandler.renderDocWindow(planToDisplay)
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
