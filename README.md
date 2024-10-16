# Web Chat Speech Recognition

Adds a button for text input via speech recognition. Supports voice commands.  

Apps: [Telegram](https://web.telegram.org/), [ChatGPT](https://chatgpt.com/), 
[Gemini](https://gemini.google.com/app/), [Copilot](https://copilot.microsoft.com/)  
Languages: English, German, French, Italian   
Recognition languages: auto/selectable  

see also:  
[ChatGPT w/o registration](https://seoschmiede.at/en/aitools/chatgpt-tool/) (seoschmiede.at) (sorry! microphone access restricted)

[> Changelog](CHANGELOG.md)

---

## *Please do not publish or promote*
*This repository and its content are intended for limited testing only. 
Please avoid sharing URLs or information publicly to ensure smooth testing 
until the script has been officially authorized by the respective operators 
of the websites or services used.*

---

## Installation

I recommend using [Microsoft Edge](https://www.microsoft.com/edge) because it has better typesetting. [Google Chrome](https://www.google.com/chrome/) recognizes the same text, but does not use any punctuation.

Scriptmanager Tampermonkey: [Edge](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd), [Chrome](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)  
Userscript: [Download](https://github.com/K5X-miomic9/WebChatSpeechRecognition/raw/refs/heads/develop/src/WebChatSpeechRecognition.user.js)

1) Install the scriptmanager, if you don't have one yet
2) Click the [download link](https://github.com/K5X-miomic9/WebChatSpeechRecognition/raw/refs/heads/develop/src/WebChatSpeechRecognition.user.js)
3) The scriptmanager recognizes the userscript, click `Install` to continue

## Voice commands¹

|**Action**        | **English command**<br/>(en-US) | **German command**<br/>(de-DE) | **French command**<br/>(fr-FR) | **Italian command**<br/>(it-IT)
|------------------|------------------------|------------------------|-----------------------------|--------------------------|
|**●  replacements**: 
|`...`             |three dots              |drei punkte             |Trois points                  |tre puntini
|`.`               |dot                     |punkt              	 |Point                         |punto
|`,`               |comma                   |komma              	 |Virgule                       |virgola
|`?`               |question mark           |fragezeichen       	 |Point d'interrogation         |punto interrogativo
|`???`             |three question marks    |drei fragezeichen  	 |Trois points d'interrogation  |tre punti interrogativi
|`!`               |exclamation mark        |ausrufezeichen     	 |Point d'exclamation           |punto esclamativo
|`!!!`             |three exclamation marks |drei Ausrufezeichen	 |Trois points d'exclamation    |tre punti esclamativi
|`-`               |dash                    |bindestrich        	 |Trait d'union                 |trattino
|`:`               |colon                   |doppelpunkt        	 |Deux points                   |due punti
|**●  commands**:        										 
|Delete-Word       | delete                 |Löschen            	 |Supprimer                     |cancella
|Delete-Sentence   | delete sentence        |Satz löschen       	 |Supprimer la phrase           |cancella frase
|Delete-Paragraph  | delete paragraph       |Absatz löschen     	 |Supprimer le paragraphe       |cancella paragrafo
|Delete-All        | delete all             |Alles löschen      	 |Tout supprimer                |cancella tutto
|New-Paragraph     | new paragraph          |Neuer Absatz       	 |Nouveau paragraphe            |nuovo paragrafo
|Undo              | undo                   |Rückgängig         	 |Annuler                       |annulla
|Send              | send                   |Senden             	 |Envoyer                       |invia
|Listen            | listen                 |Zuhören            	 |Écouter                       |ascolta
|EndVoiceInput     | end                    |Ende               	 |Fin                           |fine
|Pause             | pause                  |Pause              	 |Pause                         |pausa
|NavigateTo        | navigate to*           |Navigiere zu*           |naviguer vers*                |Naviga verso*

¹) Voice commands are only available if the recognition language is one of the above, in all other cases en-US is used. 

To use voice commands correctly, make a short break from speaking and then speak the command.

Example speak: "Hello user <pause 1s> `New Paragraph`"

|`NavigateTo`<br/>**Destination**:        | **English command**<br/>(en-US) | **German command**<br/>(de-DE) | **French command**<br/>(fr-FR) | **Italian command**<br/>(it-IT)
|------------------|------------------------|------------------------|-----------------------------|--------------------------|
|https://web.telegram.org/     |telegram   |telegramm\|telegram |telegram     | telegram\|telegramma
|https://gemini.google.com/    |gemini     |gemini              |gemini       | gemini
|https://copilot.microsoft.com/|copilot    |copilot             |copilot      | copilot
|https://chatgpt.com/          |chatgpt    |chatgpt             |chatgpt      | chatgpt
|$GM_favorite1¹               |favorite 1 |favorit 1           |Favori 1     | Preferito 1
|$GM_favorite2¹               |favorite 2 |favorit 2           |Favori 2     | Preferito 2
|$GM_favorite3¹               |favorite 3 |favorit 3           |Favori 3     | Preferito 3

¹) Favorites are configured by using the scriptmanager menu ["Set favorite x"](#Set-favorite-X)

## Scriptmanager menu

- Microphone button color
- Speech recognition language
- Stop listening on blur or hidden
- Set favorite X

### Microphone button color
You can set the default microphone button color. 
Use one of the [web color names](https://htmlcolorcodes.com/color-names/) or the color code #RRGGBB.
You should not use yellow or red, as these colors are already used for the different states.

Default: `#009000` (a green tone)

### Speech recognition language
Default: `auto`

### Stop listening on blur or hidden
Default: `true`

### Set favorite X
This setting ist used for the "Navigate To" command 
To use this setting, navigate manually to you favorite page (or contact in telegram) and the click the 'Set favorite X' entry to save the curent url.

## Compatibility

Sites | Browsers | Scriptmanager
---     | ---        | ---
✅ web.telegram.org | ✅ Edge | ✅ Tampermonkey
✅ chatgpt.com      | ✅ Chome | ❔ Greasemonkey 
⚠️ seoschmiede.at   | ☑️ Safari | ❔ Violentmonkey
✅ gemini.google.com   | ❌ Firefox | ❔ Scriptish
⏳ copilot.microsoft.com | ❌ Opera| ❔ Greaselion 
|                  | ❔ Brave
|                   | ❔ Vivaldi

<details>
  <summary>More compatibility tables: </summary>

### Scriptmanager/Browser Cross-Compatibility

| **Script Manager** | **Edge** | **Chrome** | **Safari** | **Firefox** | **Opera** | **Brave** | **Vivaldi** |
|--------------------|----------|------------|------------|-------------|-----------|-----------|-------------|
| **Tampermonkey**    | ✅       | ✅         | ✅         | ✅          | ✅        | ✅        | ✅          |
| **Violentmonkey**   | ✅       | ✅         | ❌         | ✅          | ✅        | ✅        | ✅          |
| **Greasemonkey**    | ❌       | ❌         | ❌         | ✅          | ❌        | ❌        | ❌          |
| **Scriptish**       | ❌       | ❌         | ❌         | ✅          | ❌        | ❌        | ❌          |
| **Greaselion**      | ❌       | ❌         | ❌         | ❌          | ❌        | ❔        | ❌          |

### SpeechRecognition/Browser Compatibility

| **Script Manager**        | **Edge** | **Chrome** | **Safari** | **Firefox** | **Opera** | **Brave** | **Vivaldi** |
|--------------------       |----------|------------|------------|-------------|-----------|-----------|-------------|
| **SpeechRecognition-API¹** | ✅       | ✅         | ✅         | ❌          | ❌        | ❌        | ❌          |


¹) see https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition#browser_compatibility
</details>

### Overall Tests
|         | **Edge** | **Chrome** | **Safari** | **Firefox** | **Opera** | **Brave** | **Vivaldi**
---      | ---       | ---       | ---         | ---         | ---       | ---       | ---
ChatGPT  | ✅ TM     | ✅ TM    | 🕙          | -            | -| - | - 
Copilot  | ✅ TM     | ✅ TM    | 🕙          | -            | -| - | - 
Gemini   | ✅ TM     | ✅ TM    | 🕙          | -            | -| - | - 
Telegram | ✅ TM     | ✅ TM    | 🕙          | -            | - | - | - 

TM: Tampermonkey, GM: Greasemonkey, VM: Violentmonkey, S: Scriptish, GL:Greaselion

## Work in Progress

- Copilot

## Limitations

- Firefox,  does not appear to support the SpeechRecognition-API
- seoschmiede.at seems to restrict microphone access on some os/browsers  
- Safari is not tested by the developer themselves

## Data protection

This developer declares that your data
- will not be sold to third parties
- will not be used or transferred for purposes unrelated to the main functionality of the article
- will not be used or transferred to determine creditworthiness or for loan purposes

This explanation only applies to the software itself, not to the third-party services used.

This software uses speech data to provide a user-friendly voice control feature. The speech data is processed through the SpeechRecognition API integrated within the browser. Depending on the browser implementation, the data may be sent to external servers for processing. We do not have control over how this data is handled by the browser service provider. For more information on how the data is processed, please refer to your browser's privacy policy. You can disable the voice transer at any time.

## License

Copyright © 2024 by K5X. All rights reserved. 

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to use the Software, subject to the following conditions:

1. The software may not be modified, merged, published, distributed, sublicensed, sold, or used for any direct or indirect commercial purposes, including generating income, whether or not modifications have been made to the original code, without explicit permission from the copyright holder.
2. The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

This license is not a general permission that the software may be used on third party websites or services without prior agreement with the respective operators of these websites or services.


