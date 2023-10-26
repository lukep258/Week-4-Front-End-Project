const apiKey = 'RGAPI-086e97e6-61d6-4b71-b94e-7ef50b3e5bba'
const playerSample = {}
const matches = {}
const championHistory = {}
const clock = new Date()

const init = () =>{
    const homeSearch = document.getElementById('homeInput')
    const followSearch = document.getElementById('followupInput')
    const homeButton = document.getElementsByTagName('h1')[1]
    homeSearch.addEventListener('keypress',(event)=>{
        if(event.key === 'Enter'){
            search('homeInput')
        }
    })
    followSearch.addEventListener('keypress',(event)=>{
        if(event.key === 'Enter'){
            search('followupInput')
        }
    })
    homeButton.addEventListener('click',displayHome)

    // displaySearch(homeBody,homeHeader,followBody,followHeader,'olaf')

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
        const championName = responsePlayer.championName.toLowerCase()
        currentMatch.participant.push({
            summonerName: responsePlayer.summonerName,
            champion: championName,
            level: responsePlayer.champLevel,
            position: responsePlayer.teamPosition,
            goldEarned: responsePlayer.goldEarned,
            ccImpact: responsePlayer.timeCCingOthers,
            damageDealt: responsePlayer.totalDamageDealtToChampions,
            damageTaken: responsePlayer.totalDamageTaken,
            visionScore: responsePlayer.visionScore,
            team: (responsePlayer.teamId/100)-1,
            kda: [responsePlayer.kills,responsePlayer.deaths,responsePlayer.assists],
            items: [responsePlayer.item0,responsePlayer.item1,responsePlayer.item2,responsePlayer.item3,responsePlayer.item4,responsePlayer.item5,responsePlayer.item6],
            summonerSpells: [responsePlayer.summoner1Id,responsePlayer.summoner2Id],
            runes: [responsePlayer.perks.styles[0].selections[0].perk,responsePlayer.perks.styles[0].selections[1].perk,responsePlayer.perks.styles[0].selections[2].perk,responsePlayer.perks.styles[0].selections[3].perk,responsePlayer.perks.styles[1].selections[0].perk,responsePlayer.perks.styles[1].selections[1].perk,responsePlayer.perks.statPerks.offense,responsePlayer.perks.statPerks.flex,responsePlayer.perks.statPerks.defense]
        })
        if(championHistory[championName]){
            championHistory[championName][matchRef] = l
        }else{
            championHistory[championName]={}
            championHistory[championName][matchRef] = l
        }
        console.log(championName)
    }
}

const search = (homeorfollow)=>{
    const searchInput = document.getElementById(homeorfollow).value.toLowerCase()
    if(championHistory[searchInput]){
        displaySearch(searchInput)
    }else{
        displaySearch('Invalid input')
    }

}

const displayHome=()=>{
    console.log('hello')
    const homeBody = document.getElementById('homeBody')
    const homeHeader = document.getElementById('header')
    const followBody = document.getElementById('resultBody')
    const followHeader = document.getElementById('resultHeader')

    followBody.style.display = 'none'
    followHeader.style.display = 'none'
    homeBody.style.display = 'block'
    homeHeader.style.display = 'flex'
}
const displaySearch=(searchInput)=>{
    const championh3 = document.getElementsByTagName('h3')[0]
    const homeBody = document.getElementById('homeBody')
    const homeHeader = document.getElementById('header')
    const followBody = document.getElementById('resultBody')
    const followHeader = document.getElementById('resultHeader')
    
    championh3.textContent = `${searchInput.split('')[0].toUpperCase()}${searchInput.split('').splice(1,searchInput.length).join('')}`
    followBody.style.display = 'block'
    followHeader.style.display = 'flex'
    homeBody.style.display = 'none'
    homeHeader.style.display = 'none'

    buildlistItems(searchInput)
    
}
const buildlistItems=(searchInput)=>{
    const ulist = document.getElementsByTagName('ul')[0]
    for(matchid in championHistory[searchInput]){
        const participantData = matches[matchid].participant[championHistory[searchInput][matchid]]
        const litem = document.createElement('li')
        ulist.appendChild(litem)

        const ptime = document.createElement('p')
        litem.append(ptime)
        ptime.setAttribute('class','listTime')
        ptime.textContent = timeAgo(matches[matchid].gameStart)

        const championIcon = document.createElement('div')
        litem.append(championIcon)
        championIcon.setAttribute('class','champIcon')

        const listName = document.createElement('p')
        litem.append(listName)
        listName.setAttribute('class','listPlayer')
        console.log(participantData.summonerName)
        listName.textContent = participantData.summonerName

        const kdaPost = document.createElement('p')
        litem.append(kdaPost)
        kdaPost.setAttribute('class','listKDA')
        kdaPost.textContent = participantData.kda.join('/')

        const primaryRune = document.createElement('div')
        litem.append(primaryRune)
        primaryRune.setAttribute('class','rune')
        // primaryRune.style.backgroundImage = ??

        for(let i=1;i<8;i++){
            const itemID = participantData.items[i]
            const item = document.createElement('div')
            litem.append(item)
            item.setAttribute('class',`item${i}`)
            // item.style.backgroundImage = ??
        }

        const summonerIcon1 = document.createElement('div')
        litem.append(summonerIcon1)
        summonerIcon1.setAttribute('class','summoner1')
        // summonerIcon1.style.backgroundImage = ??

        const summonerIcon2 = document.createElement('div')
        litem.append(summonerIcon2)
        summonerIcon2.setAttribute('class','summoner2')
        // summonerIcon2.style.backgroundImage = ??
    }
}
const timeAgo=(gameTime)=>{
    const timeDiff = new Date()[Symbol.toPrimitive]('number')
    timeDiff = math.floor((timeDiff-gameTime)/1000)
    if(timeDiff<60){return `${timeDiff}s ago`}
    else if(timeDiff<360){return `${Math.floor(timeDiff/60)}min ago`}
    else if(timeDiff<21600){return `${Math.floor(timeDiff/360)}hr ago`}
    else{return `${Math.floor(timeDiff/21600)}d ago`}
}

init()