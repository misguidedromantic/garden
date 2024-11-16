let handlers = {}

let dispHandler = {} 

window.onload = function (){
    navigatorHandler.createNavigator()
    navigatorHandler.updateNavigator()
}

function displayPlansSubMenu(){
    const dataPlansHandler = new planHandler
    const dataNavHandler = new navHandler
    const destinations = dataNavHandler.getDestinationTitles()
    const selectedItem = destinations.filter(item => item.title === "plans")
    
    const data = [...selectedItem, ...dataPlansHandler.plans]

    dispHandler.renderNavigator(data)
    
}


async function displayPlan(title) {
    const planToDisplay = await planHandler.getPlanHTML(title)
    handlers.display.renderPlanWindow(planToDisplay)
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

function tweenTextRemovalAndColour(selection, duration) {
    const originalText = selection.text();
    const length = originalText.length;

    selection.transition()
      .duration(duration)
      .textTween(function() {
        return function(t) {
          const i = Math.floor((1 - t) * length);
          return originalText.slice(0, i);
        };
      })
      .on("end", function() {
        d3.select(this).text("");
      });

}
