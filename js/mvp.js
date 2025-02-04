window.onload = async function(){
    const songs = await loadSongsData()
    displayFactory.createDisplay('songMilestones')
    const songsMilestones = songMilestoneHandling.prepareDataForDisplay(songs)
    displayOrchestration.load('songMilestones', songsMilestones)
}



async function loadSongsData (){
    const extractor = new csvExtractLoadTransform
    const songsData = await extractor.getAllRecordsFromFile('data/songs.csv')
    const milestonesData = await extractor.getAllRecordsFromFile('data/milestones.csv')
    return setupSongs(songsData, milestonesData)
}


function loadSongsMilestonesDisplay(){

    const display = new displaySetup ('timelines')

    //setup displays
    //render
    //const filtered = songs.filter(song => song.milestones !== undefined)
    //renderSongMilestones(svg, filtered)

}

function setupDisplay(){
    const div = createDiv('songsMilestones', 'absolute')
    const svg = createSVGCanvas ('songsMilestones', div)

}

function setupSongs(songsData, milestonesData){
    let songs = []
    songsData.forEach(d => {
        const thisSong = new song(d.short_title, d.title)
        thisSong.milestones = milestonesData.filter(milestone => milestone.song_id === d.short_title)
        songs.push(thisSong)

    })
    return songs
}

function renderSongMilestones(svg, songs){
    const groups = svg.selectAll('g')
        .data(songs, songs.id)
        .join('g')
        .attr('id', d => d.id)
        .attr('transform', (d,i) => getTranslateString(10, i * 50 + 40))
        .append('text')
        .text(d => d.title)

    songs.forEach(song => {
        const thisG = d3.select('g#' + song.id)
        thisG.selectAll('rect')
            .data(song.milestones)
            .join('rect')
            .attr('id', d => d.id)
            .attr('height', 10)
            .attr('width', 10)
            .attr('x', d => {
                const dateObject = new Date(d.date)
                const year = dateObject.getFullYear()
                const month = dateObject.getMonth()
                const day = dateObject.getDate()
                return (year - 2000) * 12 + month
                


            })
    })

}

function getTranslateString(x, y){
    return 'translate(' + x + ',' + y + ')'
}

