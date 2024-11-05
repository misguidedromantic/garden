
class planHandler {
    
    constructor() {
        this.plans = []
        this.#loadPlans()
    }

    #loadPlans(){
        const data = getPlansData()
        this.plans = data.map(planData => new plan (planData))
    }


    async getPlanHTML(planTitle){
        const thisPlan = this.plans.find(item => item.title === planTitle)
        const response = await fetch(thisPlan.filePath)
        const responseText = await response.text()
        const parser = new DOMParser()
        return parser.parseFromString(responseText, "text/html")
    }
}

class plan {
    constructor(data){
        this.title = data.title
        this.filePath = data.filePath  
    }
}

function getPlansData(){
    return [
        {title: 'my digital garden', filePath: 'myDigitalGarden.html'},
        {title: 'misguided romantic map', filePath: 'mgrMap.html'}
    ]   
}

