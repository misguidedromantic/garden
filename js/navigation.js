let personaDial = {}
let domainDial = {}

window.onload = function (){setupPage()}

function setupPage(){
    createNavigationDials()
}

function createNavigationDials(){

    const data = getDataForDials()
    const dialSVG = createDialContainer()

    function setupPersonaDial(){
        personaDial = new dial (dialSVG, 'persona', data.persona)
        personaDial.alignRight()
    }
    
    function setupDomainDial(){
        domainDial = new dial (dialSVG, 'domain', data.domain)
        domainDial.setPosition(personaDial.getWidestPoint() + 5, 0)
    }

    setupPersonaDial()
    setupDomainDial()
    
}


function getDataForDials(){

    function getPersonaData(){
        return [
            new persona ("aimless analyst"),
            new persona ("misguided romantic"),
            new persona ("james parry"),
            new persona ("dynastic observer")
        ]
    }

    function getDomainData(){
        return [
            new domain ("garden"),
            new domain ("songs"),
            new domain ("journeys")
        ]
    }

    return {
        persona: getPersonaData(),
        domain: getDomainData()
    }

}

function createDialContainer(){

    const dialDiv = d3.select('body')
        .append('div')
        .attr('id', "dials-HTMLContainer")
        .style('position', 'absolute')
        .style('left', "5px")
        .style('top', "5px")
        .style('width', (window.innerWidth - 10) + "px")
        .style('height', "80px")

    
    return createSVGCanvas ('dials-SVGCanvas', dialDiv)

}

class persona {

    constructor(title){
        this.title = title
        this.selected = false
    }

}

class domain {

    constructor(title){
        this.title = title
        this.selected = false
    }

}

function getTranslateString(x, y){
    return 'translate(' + x + ',' + y + ')'
}

