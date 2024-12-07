class plansDataHandling {

    static load(){
        this.#setPlans()
        console.log(this.plans)
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
}

class plan {
    constructor(name, fileName){
        this.name = name
        this.fileName = fileName
    }
}