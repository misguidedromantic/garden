let personaDial = {}
let domainDial = {}
const arrivalPersona = 'misguided romantic'
const arrivalDomain = 'garden'

function setupNavMenu(){

    const dialCanvas = createSVGCanvas ('dials-SVGCanvas', divs.navMenu)
    setupDials(dialCanvas)

}

function setupDials(dialCanvas){

    const data = getDataForDials()
    
    
    function setupPersonaDial(){
        personaDial = new dial (dialCanvas, 'persona', data.persona)
        personaDial.alignRight()
    }
    
    function setupDomainDial(){
        domainDial = new dial (dialCanvas, 'domain', data.domain)
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

class navConcept {

    constructor(title, arrivalValue){
        this.title = title
        this.#markSelected(arrivalValue)
    }

    #markSelected(arrivalValue){
        if (this.title === arrivalValue){
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

