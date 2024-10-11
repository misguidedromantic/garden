let songs = []
const songTitles = [
  "good after bad",
  "it's not love",
  "toiling avoiding",
  "intention and the act",
  "ton of nothing",
  "emerson rush",
  "fresh eyes"
]

function setupSongs(){

  function formatTitleForFunctionCall(title){

    let words = title.split(" ")
    let cleanTitle = ""
    
    for (let i = 0; i < words.length; i++) { 
      let word = words[i]
      word = capitaliseFirstLetter(word)
      word = removeApostrophes(word)
      cleanTitle = cleanTitle + word
    }

    return cleanTitle

  }
  
  for (let i = 0; i < songTitles.length; i++) {
    const title = songTitles[i]
    const thisSong = new song (title)
    
    try{
      let functionName = "setup" + formatTitleForFunctionCall(title)
      window[functionName](thisSong)
    } catch {
      console.log('no setup function found for ' + title)
    }
    songs.push(thisSong)
  } 

  console.log(songs)

}

function setupGoodAfterBad (gab){
  gab.setLength(5,2)
  gab.addBarSet(155, "44")
  gab.album = 'misguided romantic'
} 

function setupEmersonRush(er){
  er.setLength(5,14)
  er.album = 'in the lights'
}
  

class song {
  
    constructor(title){
      this.title = title
      this.bars = []
    }
    
    addBarSet(number, timeSignature){
      
      for (let i = 0; i < number; i++) { 
        let thisBar = new bar (timeSignature)
        this.bars.push(thisBar)
      } 
      
    }
    
    setLength(min, sec){
      this.lengthInSeconds = (min * 60) + sec
    }
  }
  
  function getSongData(){
    return [
      new song("good after bad"),
      new song("it's not love"),
      new song("toiling avoiding")
    ]
  }
  
  class bar {
    
    constructor(timeSignature){
      this.setupTimeSignature(timeSignature) 
    }
    
    setupTimeSignature(timeSignature){
      this.timeSignatureNumerator = timeSignature[0]
      this.timeSignatureDenominator = timeSignature[1]
    }
  }
  
  function displaySong(song){
  
    function getRectWidth (d){
      let beatsPerSecond = song.bars.length / song.lengthInSeconds
      let secondsPerBar = d.timeSignatureNumerator / beatsPerSecond
      let widthInPixels = secondsPerBar
      return widthInPixels
    }
   
    svg.selectAll("rect")
      .data(song.bars)
      .join("rect")
      .attr("x", (d, i) => i * 10)
      .attr("y", 10)
      .attr("width", d => getRectWidth(d))
      .attr("height", 15)
      .attr("fill", "green")
      .attr("opacity", 1) 
      
      
      
  }
  