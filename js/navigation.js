let mainNavigator = {}

class navHandler {
    constructor(){
        this.destinations = []
        this.#loadDestinations
    }

    #loadDestinations(){
        const data = getDestinationData()
        this.destinations = data.map(destData => new destination (destData))
    }

    getDestinationTitles(){
        return this.destinations.map(function(dest) {return dest['title']})
    }
}

class destination {
    constructor(data){
        this.title = data.title
    }
}

function getDestinationData(){
    return [
        {title: 'plans'},
        {title: 'concepts'}
    ]
}

    




class oldContainer {

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
            //.style('overflow-y', 'auto')
            .style('z-index', getDivCount() + 1)
            //.style('scrollbar-width', 'none')

    }

    createSVG(){
        this.svg = this.div.append('svg').attr('id', this.id + 'svg')
        //.attr('height', 200).attr('width', 200)
    }

    resize (width, height, delay, duration){
        this.div.transition("tSize").delay(delay).duration(duration)
            .style('width', width + 'px')
            .style('height', height + 'px')
    }

    reposition (left, top, delay, duration) {
        this.div.transition("tPosition").delay(delay).duration(duration)
            .style('left', left + 'px')
            .style('top', top + 'px')
    }

    renderSize(delay, duration){
        this.div.transition("tSize").delay(delay).duration(duration)
            .style('width', this.width + 'px')
            .style('height', this.height + 'px')
    }

    renderPosition(delay, duration){
        this.div.transition("tPosition").delay(delay).duration(duration)
            .style('left', this.left + 'px')
            .style('top', this.top + 'px')
    }

    seepInToBackgound(){
        this.div.transition("tSeep").delay(0).duration(800)
            .style('background-color', 'lightyellow')
            .style('border-radius', '0px')
            .style('box-shadow', '0 0 0 rgba(0, 0, 0, 0)')

    }

}

class subList extends oldContainer {

    constructor(id, parentDiv){
        super(id)
        this.parentContainer = parentDiv
    }

}

class navigator extends oldContainer {

    constructor(id){
        super(id)
        this.width = window.innerWidth / 4
        this.height = 60
        this.left = (window.innerWidth / 2) - (this.width / 2)
        this.top = 50
        this.createDiv()
        this.createSVG()
    }

    fitToItems(delay, duration){
        this.height = this.getData().length * 20 + 40
        this.renderSize(delay, duration)
        this.renderPosition(delay, duration)
    }


    getItemGs(){
        return this.svg.selectAll('g.item')   
    }

    getData(){
        return this.getItemGs().data()
    }

    renderItems(classText, data){

        const gap = 20
        let x = this.width / 2



        function calculateTransformTranslate(d, i){

            if(!d.header){
                x = gap
            }
            const y = gap * (i + 1) + gap
            return getTranslateString(x, y)
            
        }

        function enterElements(){

            return function(enter){
                let groups = enter.append('g')
                    .attr("id", d => d.title)
                    .attr("class", classText)
                    .attr("transform", (d, i) => {return calculateTransformTranslate(d, i)})
                    .on("click", selectItem)
                
                groups.append('text')
                    .text(d => d.title)
                    .style('font-family', 'tahoma')
                    .style('font-size', 14)
                    .style('text-anchor', d => {
                        if(d.header){return 'middle'}
                        else{return 'left'}
                        })
                    .attr('fill', 'white')
                    .attr('dy', '-.4em')
                    .transition('tEnterText')
                    .delay((d, i) => {return i * 150})
                    .duration(400)
                    .attr('fill', 'black')
            }
        }

        function updateElements(){

            return function(update){
    
                if(update.empty()){
                    return
                }
    
                let text = update.select('text')
                let width = text.node().getBBox().width
    
                update.transition('tUpdateG')
                    .delay(0)
                    .duration(400)
                        .attr("transform", (d, i) => {return getTranslateString(width / 2 + 22.5, gap * (i + 1) + gap)})

                text.transition('tUpdateText')
                    .duration(400)
                        .attr('font-weight', d => {
                            if(d.header){return 600}
                            else {return 300}
                        })

            }
        }
    
        function exitElements(){
    
            return function(exit){
                
                exit.selectAll('text').each(function(){
                    let text = d3.select(this)
                    text.transition('tExitText')
                        .duration(100)
                        .style('fill', 'grey')
                        .on("end", function() {
                            tweenTextRemovalAndColour(text, 200)
                        })
                    
                })
    
                exit.transition('tExitG').delay(400).remove()
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

}


function renderMainNavigator(items = getViews(), delay = 0, duration = 0){

    try {
        mainNavigator.renderItems('item', items)
    }

    catch{
        setupMainNavigator(items)
    }

    finally{
        mainNavigator.fitToItems(delay, duration)
    }

}


function setupMainNavigator (items){
    mainNavigator = new navigator ('mainNavigator')
    mainNavigator.renderItems('item', items)
}



function selectItem(){   
    const id = d3.select(this).attr('id')
    let data = mainNavigator.getData().filter(item => item.title === id)
    if(data[0].constructor.name === 'view'){
        data = [...data, ...getPlans()]
        mainNavigator.top = 50
        mainNavigator.left = 15
        renderMainNavigator(data, 0, 400)
        mainNavigator.seepInToBackgound()
    } else {

        loadPlan('myDigitalGarden')
    }

    
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
