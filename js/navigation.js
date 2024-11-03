let mainNavigator = {}
let domains = []

class domain {

    constructor(title){
        this.title = title
    }

    setSubDomains(subDomains){
        this.subDomains = subDomains
    }
}


class container {

    constructor(id){
        this.id = id
    }

    createDiv(){
        this.div = d3.select('body')
            .append('div')
            .attr('id', this.id + "div")
            .style('position', 'fixed')
            .style('background-color', 'white')
            .style('border-radius', '20px')
            .style('box-shadow', '0 4px 8px rgba(0, 0, 0, 0.2)')
    }

    createSVG(){
        this.svg = this.div.append('svg')
            .attr('transform', getTranslateString(20, 20))
    }

    resize (width, height, delay, duration){
        this.width = width
        this.height = height

        this.div.transition("tSize").delay(delay).duration(duration)
            .style('width', width + 'px')
            .style('height', height + 'px')
    }

    reposition (left, top, delay, duration) {
        this.left = left
        this.top = top

        this.div.transition("tPosition").delay(delay).duration(duration)
            .style('left', left + 'px')
            .style('top', top + 'px')
    }

}

class navigator extends container {

    constructor(id, items){
        super(id)
        this.items = items
        this.width = window.innerWidth / 4
        this.height = items.length * 20 + 40
        this.left = (window.innerWidth / 2) - (this.width / 2)
        this.top = 50
        this.createDiv()
        this.createSVG()
        this.renderInitialPosition()
        this.renderInitialSize()
    }

    setSubItems(subItems){  
        this.subItems = subItems
    }

    renderInitialSize(){
        this.resize(this.width, this.height, 0, 0)
    }

    renderInitialPosition(){
        this.reposition(this.left, this.top, 0, 0)
    }

    renderItems(classText, data){

        function calculateTransformTranslate(d, i){
            const x = mainNavigator.width / 2
            let y = 20 * (i + 1)
            
            if(classText === 'item'){
                y = y + 20
            } else if (classText === 'subItem'){
                y = y + 40
            }

            return getTranslateString(x, y)
            
        }

        function calculateTextAnchor(){
            if(classText === 'item'){
                return 'middle'
            }
            else if(classText === 'subItem'){
                return 'left'
            }
        }
        
        function enterElements(){

            return function(enter){
                let groups = enter.append('g')
                    .attr("id", d => d.title)
                    .attr("class", classText)
                    .attr("transform", (d, i) => {return calculateTransformTranslate(d, i)})
                    .on("click", selectDomain)
                
                groups.append('text')
                    .text(d => d.title)
                    .style('font-family', 'tahoma')
                    .style('font-size', 14)
                    .style('text-anchor', calculateTextAnchor)
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

        this.svg.selectAll('g.' + classText)
            .data(data, d => d.title)
            .join(
                enterElements(),
                updateElements(),
                exitElements()
            )



    }

    renderSelectedItem(selection){
        
        const id = selection.attr('id')
        const filtered = this.items.filter(item => item.title === id)
        this.renderItems('item', filtered)
        this.renderItems('subItem', this.subItems)

        const width = (selection.select('text').node().getBBox().width + 40)
        const left = 50

        mainNavigator.resize(width, this.height, 300, 600)
        mainNavigator.reposition(left, this.top, 300, 600)

    }


}


function setupNavigator (){

    function getPlans(){
        return[
            {title: 'my digital garden'},
            {title: 'wooden blocks'},
            {title: 'misguided romantic map'},
            {title: 'emotional territory'}
        ]
    }

    domains.push(new domain('plans'))
    domains.push(new domain('concepts'))
    domains.push(new domain('home'))

    domains[1].selected = true
    mainNavigator = new navigator ('mainNavigator', domains)
    mainNavigator.setSubItems(getPlans())
    mainNavigator.renderItems('item', domains)
    
    //renderDomains(mainNavigator.svg, domains)    

}

function selectDomain(){   
    mainNavigator.renderSelectedItem(d3.select(this))
}


function renderDomains (svg, domains){

    const selectedIndex = 1 //domains.findIndex(item => item.selected === true);
    const middleIndex = domains.length / 2

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
        const x = mainNavigator.width / 2
        const y = 20 + 20 * (i + 1)
        return getTranslateString(x, y)
    }

    function enterElements(){

        return function(enter){
            let groups = enter.append('g')
                    .attr("id", d => d.title)
                    .attr("class", 'domainPointer')
                    .attr("transform", (d, i) => {return getTranslateString(mainNavigator.width / 2, 20 + 20 * (i + 1))})
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
