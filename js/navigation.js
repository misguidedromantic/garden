let personaDial = {}
let domainDial = {}
const arrivalPersona = 'misguided romantic'
const arrivalDomain = 'garden'


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

class navConcept {

    constructor(title, arrivalValue){
        this.title = title
        this.#markSelected(arrivalValue)
    }

    #markSelected(arrivalValue){
        if (title === arrivalValue){
            this.selected = true
        } else {
            this.selected = false
        }
    }

}

class persona extends navConcept {

    constructor(title){
        super(title, arrivalPersona)
    }
    

}

class domain extends navConcept {

    constructor(title){
        super(title, arrivalDomain)
    }

}

function getTranslateString(x, y){
    return 'translate(' + x + ',' + y + ')'
}

