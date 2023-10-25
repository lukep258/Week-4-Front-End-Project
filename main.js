const apiKey = 'RGAPI-cc9d0728-3379-4b6e-a3d6-398520ba9015'
const playerSample = {}
const matches = {}
const championHistory = {}

const init = () =>{
    const searchEvent = document.getElementById('searchButton')
    searchEvent.addEventListener('click',search)
    sampleGather()
}

const sampleGather = ()=>{
    fetch(`https://na1.api.riotgames.com/lol/league/v4/challengerleagues/by-queue/RANKED_SOLO_5x5?api_key=${apiKey}`)
    .then(response=>response.json())
    .then(data => {
        for(entry of data.entries){
            playerSample[entry.summonerId] = {
                'summonerName':entry.summonerName,
                'wins': entry.wins,
                'losses': entry.losses
            }
        }
        setTimeout(()=>{collectMatchDeet(0,0)},5000)
        collectLoop(0)
    })
}

const collectLoop=(samplePlace)=>{
    const playerinQuestion = Object.entries(playerSample)[samplePlace][0]
    collectonPlayer(playerinQuestion)

    samplePlace===(Object.entries(playerSample).length-1)?nextPlace=0:nextPlace=samplePlace+1;
    setTimeout(()=>{collectLoop(nextPlace)},5000)
}

const collectonPlayer=(summonerId)=>{
    fetch(`https://na1.api.riotgames.com/lol/summoner/v4/summoners/${summonerId}?api_key=${apiKey}`)
    .then(response=>response.json())
    .then(data=>{
        playerSample[summonerId].puuid = data.puuid
        playerSample[summonerId].profileIconId = data.profileIconId
        playerSample[summonerId].summonerLevel = data.summonerLevel
        collectMatchIds(data.puuid,summonerId)
    })
}

const collectMatchIds=(puuid,summonerId)=>{
    fetch(`https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?type=ranked&start=0&count=20&api_key=${apiKey}`)
    .then(response=>response.json())
    .then(data=>{
        playerSample[summonerId].matches=[]
        for(entry of data){
            matches[entry]={}
            playerSample[summonerId].matches.push(entry);
        }
        // console.log('matchids logged')
    })
}

const collectMatchDeet=(i,j)=>{
    const playerSampleArr=Object.entries(playerSample)
    const currentMatch = playerSampleArr[i][1].matches[j]
    // console.log(`${i}/${playerSampleArr.length}`)
    // console.log(`${j}/${playerSampleArr[i][1].matches.length}`)
    // console.log(currentMatch)

    fetch(`https://americas.api.riotgames.com/lol/match/v5/matches/${currentMatch}?api_key=${apiKey}`)
    .then(response=>response.json())
    .then(data=>{
        // console.log(data)
        // console.log('match')
        addMatchData(currentMatch,data)
        if(i===(playerSampleArr.length-1)&&j===(playerSampleArr[i][1].matches.length-1)){
            setTimeout(()=>{collectMatchDeet(0,0)},5000)
            // console.log('restarting match deets')
        }else if(j===(playerSampleArr[i][1].matches.length-1)){
            const index = i+1
            setTimeout(()=>{collectMatchDeet(index,0)},5000)
            // console.log('moving to the next player')
        }else{
            const jndex = j+1
            setTimeout(()=>{collectMatchDeet(i,jndex)},5000)
            // console.log('getting next match')
        }
    })
    fetch(`https://americas.api.riotgames.com/lol/match/v5/matches/${currentMatch}/timeline?api_key=${apiKey}`)
    .then(response=>response.json())
    .then(data=>{
        // console.log(data)
        // console.log('match timeline')
    })
    // console.log(playerSampleArr[i][1].matches[j])
}

const addMatchData = (matchRef,data)=>{
    const currentMatch = matches[matchRef]
    currentMatch.participant = [];
    currentMatch.gameStart = data.info.gameCreation
    currentMatch.gameDuration = data.info.gameDuration
    data.info.teams[0].win?currentMatch.winners=0:currentMatch.winners=1
    for(let l=0;l<data.info.participants.length;l++){
        const responsePlayer = data.info.participants[l]
        currentMatch.participant.push({
            summonerId: responsePlayer.summonerId,
            champion: responsePlayer.championName,
            level: responsePlayer.champLevel,
            position: responsePlayer.teamPosition,
            goldEarned: responsePlayer.goldEarned,
            ccImpact: responsePlayer.timeCCingOthers,
            damageDealt: responsePlayer.totalDamageDealtToChampions,
            damageTaken: responsePlayer.totalDamageTaken,
            visionScore: responsePlayer.visionScore,
            team: (responsePlayer.teamid/100)-1,
            kda: [responsePlayer.kills,responsePlayer.deaths,responsePlayer.assists],
            items: [responsePlayer.item0,responsePlayer.item1,responsePlayer.item2,responsePlayer.item3,responsePlayer.item4,responsePlayer.item5,responsePlayer.item6]
        })
        if(championHistory[responsePlayer.championName]){championHistory[responsePlayer.championName].push(currentMatch)
        }else{championHistory[responsePlayer.championName]=[currentMatch];console.log(responsePlayer.championName)}
    }

}

const search = ()=>{
    const searchInput = document.getElementById('searchInput').value
    console.log(championHistory[searchInput])
    
}

init()