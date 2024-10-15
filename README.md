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
|`?`               |question mark           |fragezeichen       	 |Point d'interrogation         |punto interrogativo
|`???`             |three question marks    |drei fragezeichen  	 |Trois points d'interrogation  |tre punti interrogativi
|`!`               |exclamation mark        |ausrufezeichen     	 |Point d'exclamation           |punto esclamativo
|`!!!`             |three exclamation marks |drei Ausrufezeichen	 |Trois points d'exclamation    |tre punti esclamativi
|`-`               |dash                    |bindestrich        	 |Trait d'union                 |trattino
|`:`               |colon                   |doppelpunkt        	 |Deux points                   |due punti
|**●  commands**:        										 
|Delete-Word       | delete                 |Löschen            	 |Supprimer                     |cancella
|Delete-Sentence   | delete sentence        |Satz löschen       	 |Supprimer la phrase           |cancella frase
|Delete-Paragraph  | delete paragraph       |Absatz löschen     	 |Supprimer le paragraphe       |cancella paragrafo
|Delete-All        | delete all             |Alles löschen      	 |Tout supprimer                |cancella tutto
|New-Paragraph     | new paragraph          |Neuer Absatz       	 |Nouveau paragraphe            |nuovo paragrafo
|Undo              | undo                   |Rückgängig         	 |Annuler                       |annulla
|Send              | send                   |Senden             	 |Envoyer                       |invia
|Listen            | listen                 |Zuhören            	 |Écouter                       |ascolta
|EndVoiceInput     | end                    |Ende               	 |Fin                           |fine
|Pause             | pause                  |Pause              	 |Pause                         |pausa

¹) Voice commands are only available if the recognition language is one of the above, in all other cases en-US is used. 

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

The developer has disclosed that none of your data will be collected or used.  
This developer declares that your data
- will not be sold to third parties
- will not be used or transferred for purposes unrelated to the main functionality of the article
- will not be used or transferred to determine creditworthiness or for loan purposes

This explanation only applies to the script itself, not to the third-party services used

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


