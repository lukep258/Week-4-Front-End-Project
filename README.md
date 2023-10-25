# Week-4-Front-End-Project
Front End Project


//potential request count per loop: 12601
//request rate: 4 request per 4.8s
//time required for full loop (initialization): 4.2 hrs




DATA STRUCTURES:


PLAYERSAMPLE objs of objs
playerSample{
    summonerId1:{
        summonerName: abc
        wins: 1
        losses: 1
        puuid: abc
        matches: [matchId1,matchId2,matchId3...] 
        }
    }
    summonerId2: {...}
    summonerId3: {...}
}

MATCHES is obj of objs
matches{
    matchId1:{
        participants: [
            0:{
                champion: aatrox,
                level: 1,
                position: top,
                goldEarned: 1,
                items: ['longsword','longsword','black cleaver']
                kills: 1,
                deaths: 1,
                damagedealttoChampions: 1,
                damagetakenfromChampions: 1,
                team: 1
                visionscore: 1
                ccImpact:1
                cs:1
                summonerspell1:1
                summonerspell2:1
                runes:[1,2,3]
            },
            1:{...},
            2:{...}
        ]
        gamestartTime: yyyymmddhhmm
        gameDuration: mmss
        winners: team#
    }
    matchId2:{...}
    matchId3:{...}
}

CHAMPIONHISTORY is obj of arr
championsHistory{
    aatrox: [matchId1,matchId2,matchId3...]
    ahri: [...]
    akali: [...]
}
*/





/*
todo list:
1. champion search/picker
2. most recent games on champions by challenger players (NA)
2b. win or loss
2c. k/d/a
3. display builds of the game
4. display runes/masteries of the game
5. display counter stats
x6. click game for more details
x7. filter by region
x8. filter by gamemode
*/

/*
"puuid": "g8RRvpV6rpK3g7R78cKhltViqeveroIZJ0APEkEx4gCtZ4PZzK3rldL28263LoWy3C6BqQxtURtYFg",
"gameName": "PizzaBoi",
"tagLine": "NA1",
"accountId": "rfqBYkylLqoJT4pIq2dKcvH84ITl87ohzwZr5gLwcwRGLQ"
"id": "YNYqEOTdbaZM2vXA4EPyuhY4Z-JO4wgshrWVu0OivqsGQg4"
*/