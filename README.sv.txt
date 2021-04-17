En avancerad schemläggare för veckovisa och månadsvisa (kommande) händelser med fast eller solstyrd tid (solupgång, solnedgång, gryning, skymning, mitt på dagen osv).

Avancerade funktioner:

* Slumpmässiga schemahändelser. Exempel: trigga på slumpmässig tid mellan 21:00 och 22:30.
* Villkorliga händelser (trigga bara om före eller efter viss tid). Exempel: Trigga vid soluppgång, men bara om det är innan 06:00.
* Först av/sist av (trigga första eller sista av två tider). Exempel: Trigga den första av soluppgång och 07:00.
* Alla funktioner ovan kan kombineras som man önskar. 

Tanken är att slippa ha massor med komplicerade flows om du har komplicerade regler för när olika saker ska ske (eventuellt med olika regler olika veckodagar). Skapa istället schema i denna app och lägg till triggers (kallas schemahändelser) som sätts till fast tid eller solhändelser. För att styra vad som ska ske används taggar som får de värden som anges vid varje händelse. När schemat är klart skapar du ett flow som triggas av appen. Taggen som sätts av appen kan användas för att bestämma om något ska startas/stoppas, tändas/släckas eller dimmas (eller annat). Se community-sidan för mer info.