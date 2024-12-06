function getPlans(){
    return [
        new plan ('statement of intent'),
        new plan ('wooden blocks')
    ]

}

class plan {
    constructor(name){
        this.name = name
    }
}