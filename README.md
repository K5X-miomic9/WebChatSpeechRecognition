# Web Chat Speech Recognition

Adds a button for text input via speech recognition. Supports voice commands.  

Apps: [Telegram](https://web.telegram.org/), [ChatGPT](https://chatgpt.com/), 
[Gemini](https://gemini.google.com/app/), [Copilot](https://copilot.microsoft.com/)  
Display languages: English, German  
Voice commands: English, German 
Recognition languages: auto/selectable  

see also:  
[ChatGPT w/o registration](https://seoschmiede.at/en/aitools/chatgpt-tool/) (seoschmiede.at) (sorry! microphone access restricted)

## Installation

Scriptmanager Tampermonkey: [Edge](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd?hl=de), [Chome](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)  
Userscript: [Download](https://github.com/K5X-miomic9/WebChatSpeechRecognition/raw/refs/heads/develop/src/WebChatSpeechRecognition.user.js)

1) Install the scriptmanager, if you don't have one yet
2) Click the [download link](https://github.com/K5X-miomic9/WebChatSpeechRecognition/raw/refs/heads/develop/src/WebChatSpeechRecognition.user.js)
3) The scriptmanager recognizes the userscript, click `Install` to continue

## Voice commands

**Action** | **English command** | **German command**
--------|---------|--------
|**●  replacements**: 
`...`             |three dots              |drei punkte        
`.`               |dot                     |punkt              
`,`               |comma                   |komma              
`?`               |question mark           |fragezeichen       
`???`             |three question marks    |drei fragezeichen  
`!`               |exclamation mark        |ausrufezeichen     
`!!!`             |three exclamation marks |drei Ausrufezeichen
|`-`               |dash                    |bindestrich        
|`:`               |colon                   |doppelpunkt        
|**●  commands**:        
Delete-Word     | delete                  |Löschen            
Delete-Sentence | delete sentence         |Satz löschen       
Delete-Paragraph| delete paragraph        |Absatz löschen     
Delete-All      | delete all              |Alles löschen      
New-Paragraph   | new paragraph           |Neuer Absatz       
Undo            | undo                    |Rückgängig         
Send            | send                    |Senden             
Listen          | listen                  |Zuhören            
EndVoiceInput   | end                     |Ende               
Pause           | pause                   |Pause              

## Compatibility

Sites | Browsers | Scriptmanager
---     | ---        |
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
---      | ---       |           |             |             |||
ChatGPT  | ✅ TM     | ✅ TM    | 🕙          | -            | -| - | - 
Copilot  | ⏳ TM     | ⏳ TM    | 🕙          | -           | -| - | - 
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
of this software and associated documentation files (the "Software"), to use, copy, modify, merge, publish, and distribute copies of the Software, subject to the following conditions:

1. The software may not be sublicensed, sold, or used for any direct or indirect commercial purposes, including generating income, whether or not modifications have been made to the original code, without explicit permission from the copyright holder.
2. The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

This license is not a general permission that the software may be used on third party websites or services without prior agreement with the respective operators of these websites or services.


