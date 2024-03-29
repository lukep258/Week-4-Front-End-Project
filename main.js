const apiKey = 'RGAPI-7d0ea369-bf9e-423b-9525-01fbc83d8a96'
const playerSample = {}
const matches = {}
const championHistory = {}
const summSpellLib = {}
const runeLib = {}
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

    summSpellFill()
    runeFill()
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
            playerSample[summonerId].matches.push(entry);
        }
    })
}

const collectMatchDeet=(i,j)=>{
    const playerSampleArr=Object.entries(playerSample)
    const currentMatch = playerSampleArr[i][1].matches[j]

    fetch(`https://americas.api.riotgames.com/lol/match/v5/matches/${currentMatch}?api_key=${apiKey}`)
    .then(response=>response.json())
    .then(data=>{
        addMatchData(currentMatch,data)
        if(i===(playerSampleArr.length-1)&&j===(playerSampleArr[i][1].matches.length-1)){
            setTimeout(()=>{collectMatchDeet(0,0)},5000)
        }else if(j===(playerSampleArr[i][1].matches.length-1)){
            const index = i+1
            setTimeout(()=>{collectMatchDeet(index,0)},5000)
        }else{
            const jndex = j+1
            setTimeout(()=>{collectMatchDeet(i,jndex)},5000)
        }
    })
    // fetch(`https://americas.api.riotgames.com/lol/match/v5/matches/${currentMatch}/timeline?api_key=${apiKey}`)
    // .then(response=>response.json())
    // .then(data=>{
    // })
}

const addMatchData = (matchRef,data)=>{
    matches[matchRef] = []
    const currentMatch = matches[matchRef]

    currentMatch.participant = [];
    currentMatch.gameStart = data.info.gameCreation
    currentMatch.gameDuration = data.info.gameDuration
    currentMatch.laners = {TOP:[],MIDDLE:[],BOTTOM:[],UTILITY:[],JUNGLE:[]}
    data.info.teams[0].win?currentMatch.winners=0:currentMatch.winners=1

    for(let l=0;l<data.info.participants.length;l++){
        const responsePlayer = data.info.participants[l]
        const championName = responsePlayer.championName.toLowerCase()
        currentMatch.participant.push({
            summonerName: responsePlayer.summonerName,
            ogChampName: responsePlayer.championName,
            champion: championName,
            level: responsePlayer.champLevel,
            position: responsePlayer.teamPosition,
            goldEarned: responsePlayer.goldEarned,
            ccImpact: responsePlayer.timeCCingOthers,
            damageDealt: responsePlayer.totalDamageDealtToChampions,
            damageTaken: responsePlayer.totalDamageTaken,
            visionScore: responsePlayer.visionScore,
            team: (responsePlayer.teamId/100)-1,
            items: [],
            kda: [responsePlayer.kills,responsePlayer.deaths,responsePlayer.assists],
            summonerSpells: [responsePlayer.summoner1Id,responsePlayer.summoner2Id],
            runes: [responsePlayer.perks.styles[0].selections[0].perk,responsePlayer.perks.styles[0].selections[1].perk,responsePlayer.perks.styles[0].selections[2].perk,responsePlayer.perks.styles[0].selections[3].perk,responsePlayer.perks.styles[1].selections[0].perk,responsePlayer.perks.styles[1].selections[1].perk,responsePlayer.perks.statPerks.offense,responsePlayer.perks.statPerks.flex,responsePlayer.perks.statPerks.defense]
        })
        for(let i=0;i<7;i++){
            if(responsePlayer[`item${i}`]){
                currentMatch.participant[l].items.push(responsePlayer[`item${i}`])
            }else{
                currentMatch.participant[l].items.push(0)
            }
        }
        if(championHistory[championName]){
            championHistory[championName][matchRef] = l
        }else{
            championHistory[championName]={}
            championHistory[championName][matchRef] = l
        }
        currentMatch.laners[responsePlayer.teamPosition].push(responsePlayer.championName)
        console.log(championName+Object.entries(championHistory[championName]).length)
    }
}

const search = (homeorfollow)=>{
    const searchElem = document.getElementById(homeorfollow)
    const searchInput = searchElem.value.toLowerCase()
    searchElem.value = ''
    if(championHistory[searchInput]){
        displaySearch(searchInput)
    }else{
        displaySearch('Invalid input')
    }

}

const displayHome=()=>{
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
    followBody.style.display = 'flex'
    followHeader.style.display = 'flex'
    homeBody.style.display = 'none'
    homeHeader.style.display = 'none'

    const newList = document.createElement('ul')
    followBody.removeChild(document.getElementById('buildList'))
    followBody.append(newList)
    newList.setAttribute('id','buildList')

    sortMatchesbyTime(searchInput)
    buildlistItems(searchInput)
}
const buildlistItems=(searchInput)=>{
    const ulist = document.getElementById('buildList')
    const totalAgainst = {}
    const winsAgainst = {}
    const counters = {}
    let champWins = 0;
    if(searchInput==='wukong'){
        searchInput='monkeyking'
    }
    for(matchid in championHistory[searchInput]){
        const participantData = matches[matchid].participant[championHistory[searchInput][matchid]]
        const litem = document.createElement('li')
        ulist.appendChild(litem)

        const ptime = document.createElement('p')
        litem.append(ptime)
        ptime.setAttribute('class','listTime')
        ptime.textContent = timeAgo(matches[matchid].gameStart)

        const championIcon = document.createElement('div')
        const searchedChamp = document.getElementById('searchedChamp')
        let champImgName = ''
        let enemyLaner = ''
        matches[matchid].laners[participantData.position][0].toLowerCase()===searchInput?enemyLaner=matches[matchid].laners[participantData.position][1]:enemyLaner=matches[matchid].laners[participantData.position][0]
        litem.append(championIcon)
        searchInput==='fiddlesticks'?champImgName='Fiddlesticks':champImgName=matches[matchid].participant[championHistory[searchInput][matchid]].ogChampName
        if(enemyLaner==='FiddleSticks'){enemyLaner='Fiddlesticks'}
        totalAgainst[enemyLaner]?totalAgainst[enemyLaner]++:totalAgainst[enemyLaner]=1;
        if(participantData.team===matches[matchid].winners){
            champWins++
            winsAgainst[enemyLaner]?winsAgainst[enemyLaner]++:winsAgainst[enemyLaner]=1
            championIcon.style.border = '0.5px solid green'
        }else{
            counters[enemyLaner]?counters[enemyLaner]++:counters[enemyLaner]=1
            championIcon.style.border = '0.5px solid red'
        }
        championIcon.setAttribute('class','champIcon')
        championIcon.style.backgroundImage = `url(http://ddragon.leagueoflegends.com/cdn/13.21.1/img/champion/${champImgName}.png)`
        searchedChamp.setAttribute('src',`http://ddragon.leagueoflegends.com/cdn/13.21.1/img/champion/${champImgName}.png`)

        const listName = document.createElement('p')
        litem.append(listName)
        listName.setAttribute('class','listPlayer')
        listName.textContent = participantData.summonerName

        const kdaPost = document.createElement('p')
        litem.append(kdaPost)
        kdaPost.setAttribute('class','listKDA')
        kdaPost.textContent = participantData.kda.join('/')

        const enemyIcon = document.createElement('div')
        litem.append(enemyIcon)
        enemyIcon.setAttribute('class','enemyChamp')
        enemyIcon.style.backgroundImage = `url(http://ddragon.leagueoflegends.com/cdn/13.21.1/img/champion/${enemyLaner}.png)`

        const primaryRune = document.createElement('div')
        let runeDir = ''
        if(runeLib[participantData.runes[0]][1]==='LethalTempo'){
            runeDir = `${runeLib[participantData.runes[0]][0]}/${runeLib[participantData.runes[0]][1]}/${runeLib[participantData.runes[0]][1]}Temp`
        }
        else if(runeLib[participantData.runes[0]][1]==='Aftershock'){
            runeDir = `${runeLib[participantData.runes[0]][0]}/Veteran${runeLib[participantData.runes[0]][1]}/Veteran${runeLib[participantData.runes[0]][1]}`
        }
        else{
            runeDir = `${runeLib[participantData.runes[0]][0]}/${runeLib[participantData.runes[0]][1]}/${runeLib[participantData.runes[0]][1]}`
        }
        litem.append(primaryRune)
        primaryRune.setAttribute('class','rune')
        primaryRune.style.backgroundImage = `url(https://ddragon.canisback.com/img/perk-images/Styles/${runeDir}.png)`

        for(let i=1;i<7;i++){
            const itemID = participantData.items[i]
            const item = document.createElement('div')
            litem.append(item)
            item.setAttribute('class',`item${i}`)
            if(itemID){
                item.style.backgroundImage = `url(http://ddragon.leagueoflegends.com/cdn/13.21.1/img/item/${itemID}.png)`
            }
        }

        const summonerIcon1 = document.createElement('div')
        const spellId1 = summSpellLib[participantData.summonerSpells[0]]
        litem.append(summonerIcon1)
        summonerIcon1.setAttribute('class','summoner1')
        summonerIcon1.style.backgroundImage = `url(http://ddragon.leagueoflegends.com/cdn/13.21.1/img/spell/${spellId1}.png)`

        const summonerIcon2 = document.createElement('div')
        const spellId2 = summSpellLib[participantData.summonerSpells[1]]
        litem.append(summonerIcon2)
        summonerIcon2.setAttribute('class','summoner2')
        summonerIcon2.style.backgroundImage = `url(http://ddragon.leagueoflegends.com/cdn/13.21.1/img/spell/${spellId2}.png)`
    }
    for(enemyChamp in winsAgainst){
        winsAgainst[enemyChamp]===1?delete winsAgainst[enemyChamp]:winsAgainst[enemyChamp]=Math.floor(winsAgainst[enemyChamp]*100/totalAgainst[enemyChamp])
    }
    for(enemyChamp in counters){
        counters[enemyChamp]===1?delete counters[enemyChamp]:counters[enemyChamp]=Math.floor(counters[enemyChamp]*100/totalAgainst[enemyChamp])
    }

    const gamesPlayed = document.getElementById('gamesPlayed')
    const winRate = document.getElementById('winRate')
    const gameNum = Object.entries(championHistory[searchInput]).length
    gamesPlayed.textContent = `${gameNum} Total Games`
    winRate.textContent = `${Math.floor(champWins*100/gameNum)}% winrate`

    
    const winList = []
    const counterList = []
    for(enemyChamp in winsAgainst){
        winList.push(enemyChamp)
        let index = winList.length-1
        while(index>0&&winsAgainst[winList[index]]>winsAgainst[winList[index-1]]){
            const temp = winList[index]
            winList[index]=winList[index-1]
            winList[index-1]=temp;
            index--
        }
    }
    for(enemyChamp in counters){
        counterList.push(enemyChamp)
        let index = counterList.length-1
        while(index>0&&counters[counterList[index]]>counters[counterList[index-1]]){
            const temp = counterList[index]
            counterList[index]=counterList[index-1]
            counterList[index-1]=temp;
            index--
        }
    }
    
    const counterRemoval = document.getElementsByClassName('playAgainst')[0]
    const playIntoRemoval = document.getElementsByClassName('playAgainst')[1]
    const allCounters = document.getElementById('counters')
    const allPlayInto = document.getElementById('winsAgainst')
    allCounters.removeChild(counterRemoval)
    allPlayInto.removeChild(playIntoRemoval)
    const counterContainer = document.createElement('div')
    const playAgainst = document.createElement('div')
    allCounters.appendChild(playAgainst)
    allPlayInto.appendChild(counterContainer)
    counterContainer.setAttribute('class','playAgainst')
    playAgainst.setAttribute('class','playAgainst')
    for(let i=0;i<3;i++){
        const indvCounterContainer = document.createElement('div')
        counterContainer.appendChild(indvCounterContainer)
        indvCounterContainer.setAttribute('class','indvContainer')

        const counterPick = document.createElement('div')
        const counterChance = document.createElement('p')
        indvCounterContainer.appendChild(counterChance)
        indvCounterContainer.appendChild(counterPick)
        counterPick.setAttribute('class','counterImage')
        counterChance.setAttribute('class','counterChance')
        if(counterList[i]==='FiddleSticks'){
            counterList[i] = 'Fiddlesticks'
        }
        counterPick.style.backgroundImage = `url(http://ddragon.leagueoflegends.com/cdn/13.21.1/img/champion/${counterList[i]}.png)`
        counterChance.textContent = `${counters[counterList[i]]}%`

        const indvPlayContainer = document.createElement('div')
        playAgainst.appendChild(indvPlayContainer)
        indvPlayContainer.setAttribute('class','indvContainer')

        const playPick = document.createElement('div')
        const playChance = document.createElement('p')
        indvPlayContainer.appendChild(playPick)
        indvPlayContainer.appendChild(playChance)
        playPick.setAttribute('class','counterImage')
        playChance.setAttribute('class','counterChance')
        playPick.style.backgroundImage = `url(http://ddragon.leagueoflegends.com/cdn/13.21.1/img/champion/${winList[i]}.png)`
        playChance.textContent = `${winsAgainst[winList[i]]}%`
    }
}
const timeAgo=(gameTime)=>{
    let timeDiff = new Date()[Symbol.toPrimitive]('number')
    timeDiff = (timeDiff-gameTime)/1000
    if(timeDiff<60){return `${timeDiff}s ago`}
    else if(timeDiff<3600){return `${Math.floor(timeDiff/60)}m ago`}
    else if(timeDiff<86400){return `${Math.floor(timeDiff/3600)}h ago`}
    else{return `${Math.floor(timeDiff/86400)}d ago`}
}
const sortMatchesbyTime=(champion)=>{
    const unsortedTime = []
    let matchHistoryCopy = {}
    for(matchid in championHistory[champion]){
        unsortedTime.push(matchid)
        let index=unsortedTime.length-1
        while(index>0&&matches[unsortedTime[index-1]].gameStart<matches[matchid].gameStart){
            let temp = unsortedTime[index-1]
            unsortedTime[index-1]=matchid
            unsortedTime[index]=temp
            index--
        }
    }
    for(matchid of unsortedTime){
        matchHistoryCopy[matchid] = championHistory[champion][matchid]
    }
    championHistory[champion]=matchHistoryCopy
}
const summSpellFill=()=>{
    fetch('https://ddragon.leagueoflegends.com/cdn/13.21.1/data/en_US/summoner.json')
    .then(response=>response.json())
    .then(data=>{
        for(spell in data.data){
            summSpellLib[data.data[spell].key.toString()] = spell
        }
    })
}
const runeFill=()=>{
    fetch('https://ddragon.canisback.com/13.12.1/data/en_US/runesReforged.json')
    .then(response=>response.json())
    .then(data=>{
        for(tree of data){
            for(slot of tree.slots){
                for(rune of slot.runes){
                    runeLib[rune.id]=[tree.key,rune.key]
                }
            }
        }
    })
}

init()
