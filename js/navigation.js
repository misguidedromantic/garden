
wwindow.onload = function (){

    function createMenu(){

        const menuPosition = {x: "5px", y: "5px"}
        const menuDimensions = {width: (window.innerWidth - 10) + "px", height: "80px"}

        function createMenuDiv(){
            return d3.select('body')
                .append('div')
                .attr('id','menu')
                .style('position', 'absolute')
                .style('left', menuPosition.x)
                .style('top', menuPosition.y)
                .style('width', menuDimensions.width)
                .style('height', menuDimensions.height)
        }

        function createMenuSVG(){
            return menuDiv.append('svg')
                .attr('id', "menuCanvas")
                .attr('width', menuDimensions.width)
                .attr('height', menuDimensions.height)

        }

        const menuDiv = createMenuDiv()
        const menuSVG = createMenuSVG()

        function createCarosuel(id, data, SVGcontainer){

            let gCarosuel = SVGcontainer.append('g')
                .attr('class', 'carosuel')
                .attr('id', id)

            let gSlots = gCarosuel.selectAll('g.' + id)
                .data(data)
                .join('g')
                .attr("id", d => d.title)
                .attr("transform", (d, i) => {
                    let x = 0
                    let y = 15 * i
                    return getTranslateString(x, y)
                })
            
            gSlots.append('text')
                .text(d => d.title)
                .style('font-family', 'tahoma')
                .style('font-size', '14px')
                .attr('y', 14 / 2)


            return gCarosuel
        
        }

        function createPersonaCarosuel(){
            
            function getPersonaData(){
                return [
                    new persona ("aimless analyst"),
                    new persona ("misguided romantic"),
                    new persona ("james parry"),
                    new persona ("dynastic observer")
                ]
            }

            let personaData = getPersonaData()
            return createCarosuel('persona', personaData, menuSVG)
        }

        function createDomainCarosuel(){
            
            function getDomainData(){
                return [
                    new domain ("garden"),
                    new domain ("songs"),
                    new domain ("journeys")
                ]
            }

            let domainData = getDomainData()
            return createCarosuel('domain', domainData, menuSVG)
        }

        
        let personaCarosuel = createPersonaCarosuel()
        let domainCarosuel = createDomainCarosuel()

        function getCarosuelWidestPoint(carosuel){
            
            const widths = []        

            carosuel.selectAll('text').each(function(d, i) {
                const width = parseInt(Math.round(d3.select(this).node().getBBox().width))
                widths.push(width)
            });

            return d3.max(widths)
        }

        function setDomainCarosuelPosition(){
            let x = getCarosuelWidestPoint(personaCarosuel) + 3
            let y = 0

            domainCarosuel.attr('transform', getTranslateString(x, y))
        }

        function setPersonaCarosuelPosition(){

            let widestPoint = getCarosuelWidestPoint(personaCarosuel)

            personaCarosuel.selectAll('text')
                .attr('x', widestPoint)
                .attr("text-anchor", "end") // Right-align

        }
        
        setPersonaCarosuelPosition()
        setDomainCarosuelPosition()

    }
    
    createMenu()

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