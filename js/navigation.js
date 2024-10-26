let navigator = {}
let domains = []
let div = {}
let svg = {}

class domain {

    constructor(title){
        this.title = title
    }



}

function setupNavigator (){

 
    domains.push(new domain('plans'))
    domains.push(new domain('concepts'))
    domains.push(new domain('home'))


    navigator.width = window.innerWidth / 4
    navigator.height = domains.length * 20 + 40
    navigator.left = (window.innerWidth / 2) - (navigator.width / 2)
    navigator.top = 50

    div = d3.select('body')
        .append('div')
        .attr('id', "navigatorDiv")
        .style('position', 'fixed')
        .style('left', navigator.left + 'px')
        .style('top', navigator.top + 'px')
        .style('width', navigator.width + 'px')
        .style('height', navigator.height + 'px')
        .style('background-color', 'white')
        .style('border-radius', '20px')
        .style('box-shadow', '0 4px 8px rgba(0, 0, 0, 0.2)')

    svg = div.append('svg').attr('transform', getTranslateString(20, 20))

    domains[1].selected = true

    renderDomains(svg, domains)

}

function selectDomain(){
    let selected = d3.select(this)
    let id = selected.attr('id')
    filtered = domains.filter(item => item.title === id)
    renderDomains(svg, filtered)

    width = selected.select('text').node().getBBox().width

    div.transition().delay(300).duration(600)
        .style('left', '50px')
        .style('width', width + 40 + 'px')
        .style('height', '150px')

}


function renderDomains (svg, domains){

    const selectedIndex = 1 //domains.findIndex(item => item.selected === true);
    const middleIndex = domains.length / 2
    console.log(middleIndex)


/*     function getDistanceFromSelected(d, i){

        const gap = 20

        if (i > selectedIndex){
            return (i - selectedIndex) * gap
        } else if(i < selectedIndex){
            return (selectedIndex - i) * - gap
        } else {
            return 0
        }
    } */


    function calculatePosition(d, i){
        const x = navigator.width / 2
        const y = 20 + 20 * (i + 1)
        return getTranslateString(x, y)
    }

    function enterElements(){

        return function(enter){
            let groups = enter.append('g')
                    .attr("id", d => d.title)
                    .attr("class", 'domainPointer')
                    .attr("transform", (d, i) => {return getTranslateString(navigator.width / 2, 20 + 20 * (i + 1))})
                    .on("click", selectDomain)
                
                groups.append('text')
                    .text(d => d.title)
                    .style('font-family', 'tahoma')
                    .style('font-size', 14)
                    .style('text-anchor', 'middle')
                    .attr('fill', 'black')
                    .attr('y', - (14 / 2))
        }
    }

    function updateElements(){

        return function(update){

            if(update.empty()){
                return
            }

            let text = update.select('text')
            let width = text.node().getBBox().width

            update.transition()
                .delay(300)
                .duration(600)
                    .attr("transform", (d, i) => {return getTranslateString(width / 2 + 20, 20 + 20 * (i + 1))})

/*             text.transition()
                .delay(300)
                .duration(600)
                .attrTween("x", function() {
                    var start = d3.select(this).attr("x");
                    var end = width / 2
                    return d3.interpolateNumber(start, end);
          }); */

        }
    }

    function exitElements(){

        return function(exit){
            
            exit.selectAll('text').each(function(){
                let text = d3.select(this)
                text.transition()
                    .duration(100)
                    .style('fill', 'grey')
                    .on("end", function() {
                        tweenTextRemovalAndColour(text, 200)
                    })
                
            })

            exit.transition().delay(400).remove()
        }

    }

    svg.selectAll('g')
            .data(domains, d => d.title)
            .join(
                enterElements(),
                updateElements(),
                exitElements()
            )
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
