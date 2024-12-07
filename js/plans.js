class plansDataHandling {

    static load(){
        this.#setPlans()
    }

    static getPlan(name){
        return this.plans.find(item => item.name === name)
    }

    static getPlans(){
        return this.plans
    }

    static #setPlans(){
        this.plans = [
            new plan ('statement of intent', 'myDigitalGarden.html'),
            new plan ('wooden blocks', 'woodenBlocks.html')
        ]
    }

    static async getPlanHTML(planName){
        const thisPlan = this.getPlan(planName)
        const response = await fetch(thisPlan.fileName)
        const responseText = await response.text()
        const parser = new DOMParser()
        return parser.parseFromString(responseText, "text/html")
    }
}

class plan {
    constructor(name, fileName){
        this.name = name
        this.fileName = fileName
    }
}