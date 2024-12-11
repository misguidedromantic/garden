class plansDataHandling {

    static load(){
        this.#setPlans()
    }

    static getPlan(title){
        return this.plans.find(item => item.title === title)
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

    static async getPlanHTML(planTitle){
        const thisPlan = this.getPlan(planTitle)
        const response = await fetch(thisPlan.fileName)
        const responseText = await response.text()
        const parser = new DOMParser()
        return parser.parseFromString(responseText, "text/html")
    }
}

class plan {
    constructor(title, fileName){
        this.title = title
        this.fileName = fileName
    }
}