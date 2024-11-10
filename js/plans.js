
class planHandler {

    static getPlan(title){
        const plans = this.#getPlansData()
        return plans.find(item => item.title === title)
    }
    
    static getPlans(){
        const data = this.#getPlansData()
        return data.map(planData => new plan (planData))
    }

    static #getPlansData(){
        return [
            {title: 'my digital garden', filePath: 'myDigitalGarden.html'},
            {title: 'misguided romantic map', filePath: 'mgrMap.html'}
        ] 
    }
    
    static async getPlanHTML(planName){
        const thisPlan = this.getPlan(planName)
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
