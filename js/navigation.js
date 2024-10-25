let navigator = {}
let domains = []

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
    navigator.height = 150
    navigator.left = (window.innerWidth / 2) - (navigator.width / 2)
    navigator.top = 50

    const div = d3.select('body')
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


    const svg = div.append('svg').attr('transform', getTranslateString(20, 20))

    domains[1].selected = true

    addDomains(svg, domains)

}


function addDomains (svg, domains){

    const selectedIndex = domains.findIndex(item => item.selected === true);

    function getDistanceFromSelected(d, i){

        const gap = 20

        if (i > selectedIndex){
            return (i - selectedIndex) * gap
        } else if(i < selectedIndex){
            return (selectedIndex - i) * - gap
        } else {
            return 0
        }
    }

    function calculatePosition(d, i){
        const x = navigator.width / 2
        const y = navigator.height / 2 + getDistanceFromSelected(d, i)
        return getTranslateString(x, y)
    }

    function enterElements(){

        return function(enter){
            let groups = enter.append('g')
                    .attr("id", d => d.title)
                    .attr("class", 'domainPointer')
                    .attr("transform", (d, i) => {return calculatePosition(d, i)})
                
                groups.append('text')
                    .text(d => d.title)
                    .style('font-family', 'tahoma')
                    .style('font-size', 14)
                    .style('text-anchor', 'middle')
                    .style('text-align', 'middle')
                    .attr('fill', 'black')
                    .attr('y', 14 / 2)
        }
    }

    function updateElements(){}

    function exitElements(){}

    svg.selectAll('g')
            .data(domains, d => d.title)
            .join(
                enterElements(),
                updateElements(),
                exitElements()
            )


}


