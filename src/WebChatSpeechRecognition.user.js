// ==UserScript==
// @name         Web Chat Speech Recognition Button
// @namespace    http://tampermonkey.net/
// @version      1.81
// @description  Adds a speech recognition button to Telegram Web, ChatGPT
// @author       K5X
// @copyright    Copyright © 2024 by K5X. All rights reserved.
// @license      See full license below
// @match        https://web.telegram.org/*
// @match        https://chatgpt.com/*
// @match        https://seoschmiede.at/aitools/chatgpt-tool/
// @match        https://seoschmiede.at/en/aitools/chatgpt-tool/
// @grant        GM_registerMenuCommand
// @grant        GM_getValue
// @grant        GM_setValue
// @downloadURL  https://raw.githubusercontent.com/K5X-miomic9/WebChatSpeechRecognition/refs/heads/main/WebChatSpeechRecognition.user.js
// @updateURL    https://raw.githubusercontent.com/K5X-miomic9/WebChatSpeechRecognition/refs/heads/main/WebChatSpeechRecognition.user.js
// ==/UserScript==

(function () {
    'use strict';
    const version = '1.81'; console.log(`Script version ${version}`);
    const defaultButtonColor = '#009000';
    const defaultRecognitionLanguage = 'auto';

    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        console.warn('Speech Recognition API is not supported in this browser.');
	    return;
    }

    var microphonePermissionGranted = null;
    navigator.mediaDevices.getUserMedia({ audio: true })
	    .then(() => {
            console.log('Microphone access allowed');
            microphonePermissionGranted = true;
	    })
	    .catch(() => {
            console.warn('Microphone access denied. Speech recognition not possible!');
            microphonePermissionGranted = false;
        });

    const gm = {
        available: typeof GM_registerMenuCommand === 'function',
        registerMenuCommand: GM_registerMenuCommand || function (a, b) { },
        setValue: GM_setValue || function (a, b) { },
        getValue: GM_getValue || function (a, b) { return b; },
        setColor: function() {
	        const color = prompt('Color of the microphone button: \n(#RRGGBB or web name)', gm.getValue('buttonColor', defaultButtonColor));
	        if (color) {
		        gm.setValue('buttonColor', color);
                console.log(`Color saved: ${color}`);
                location.reload();
	        }
        },
        setLanguage: function () {
	        const lang = prompt('Speech recognition langauge: \n(en, de, auto)', gm.getValue('recognitionLanguage', defaultRecognitionLanguage));
	        if (lang) {
		        gm.setValue('recognitionLanguage', lang);
                console.log(`Language saved: ${lang}`);
                location.reload();
	        }
        }
    }
    var buttonColor = gm.getValue ('buttonColor', defaultButtonColor);
    console.log(`settings: current color: ${buttonColor}`);
    var recognitionLanguage = gm.getValue('recognitionLanguage', defaultRecognitionLanguage);
    console.log(`settings: recognition language: ${recognitionLanguage}`);

    gm.registerMenuCommand(`Microphone button color: ${buttonColor}`, gm.setColor);
    gm.registerMenuCommand(`Speech recognition language: ${recognitionLanguage}`, gm.setLanguage);

    const languages = ['en-US', 'de-DE']; 

    /**
    * @typedef {Object} Definition
    * @property {string} inputFieldSelector - selector for the input element
    * @property {string} inputFieldPlaceholderSelector - selector for the input element placeholder
    * @property {function} getInputFieldPlaceholderText
    * @property {string} buttonContainerSelector - selector for the container
    * @property {string} buttonNeighborSelector - selector for the neighbor
    * @property {string} buttonSelector - selector for the new button
    * @property {string} buttonHTML - HTML for the button
    * @property {function} getEmojiHTML - function to get emoji HTML
    * @property {string} sendButtonSelector - selector for the send button
    */

    /** current definition, updated in app.onAppIdChanged @type {Definition} */
    var def = null; 

    /** all definitions @type {{[key: string]: Definition}} */
    const definitions = {
        "chatgpt": {
            inputFieldSelector: '#prompt-textarea',
            inputFieldPlaceholderSelector: '#prompt-textarea p',
            getInputFieldPlaceholderText: () => document.querySelector('#prompt-textarea p').getAttribute('data-placeholder'),
            buttonSelector: '#speechRecognitionButton',
            buttonHTML: `
                <style>
                    .speechRecognitionButton {
                        color: ${buttonColor}; /* Defines the default color */
                    }
                </style>
                <div class="-ml-2.5 flex">
                    <button id="speechRecognitionButton" class="speechRecognitionButton" style="border: none; background: none; cursor: pointer; padding: 0 0 8px 0; display: flex; justify-content: center; align-items: center;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C7.582 2 4 5.582 4 10V14C4 18.418 7.582 22 12 22C16.418 22 20 18.418 20 14V10C20 5.582 16.418 2 12 2ZM12 20C8.686 20 6 17.314 6 14V10C6 6.686 8.686 4 12 4C15.314 4 18 6.686 18 10V14C18 17.314 15.314 20 12 20ZM12 6C10.895 6 10 6.895 10 8V14C10 15.105 10.895 16 12 16C13.105 16 14 15.105 14 14V8C14 6.895 13.105 6 12 6Z" fill="currentColor"></path>
                        </svg>
                    </button>
                </div>`,
            buttonContainerSelector: () => document.querySelector('button[data-testid="send-button"]').parentElement.parentElement,
            buttonNeighborSelector: () => document.querySelector('button[data-testid="send-button"]').parentElement.parentElement.lastElementChild.previousElementSibling,
            getEmojiHTML:([id, alt])=>`${alt}`,
            sendButtonSelector: 'button[data-testid="send-button"]'
        },
        "telegram-a": {
            inputFieldSelector: '#editable-message-text',
            inputFieldPlaceholderSelector: '#editable-message-text ~ .placeholder-text',
            getInputFieldPlaceholderText: () => querySelector('#editable-message-text ~ .placeholder-text').innerText,
            buttonSelector: '#speechRecognitionButton',
            buttonHTML: `
                <style>
                    .speechRecognitionButton {
                        color: ${buttonColor}; /* Defines the default color */
                        outline: none !important;
                    }
                </style>               
                <button id="speechRecognitionButton" class="default translucent speechRecognitionButton" style="border: none; background: none; cursor: pointer; padding: 0; display: flex; justify-content: center; align-items: center;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C7.582 2 4 5.582 4 10V14C4 18.418 7.582 22 12 22C16.418 22 20 18.418 20 14V10C20 5.582 16.418 2 12 2ZM12 20C8.686 20 6 17.314 6 14V10C6 6.686 8.686 4 12 4C15.314 4 18 6.686 18 10V14C18 17.314 15.314 20 12 20ZM12 6C10.895 6 10 6.895 10 8V14C10 15.105 10.895 16 12 16C13.105 16 14 15.105 14 14V8C14 6.895 13.105 6 12 6Z" fill="currentColor"></path>
                    </svg>
                </button>`,
            buttonContainerSelector: '.message-input-wrapper',
            buttonNeighborSelector: () => querySelector(definitions['telegram-a'].buttonContainerSelector).querySelector('.AttachMenu'),
            getEmojiHTML: ([id, alt]) => `<img draggable="false" class="emoji emoji-small" src="./img-apple-64/${id}.png" alt="${alt}">`,
            sendButtonSelector: 'Button.send.main-button.default.secondary.round.click-allowed'
        },
        "telegram-k": {
            inputFieldSelector: '.input-message-input',
            inputFieldPlaceholderSelector: '.input-field-placeholder',
            getInputFieldPlaceholderText: () => querySelector('.input-field-placeholder').innerText,
            buttonContainerSelector: '.new-message-wrapper.rows-wrapper-row',
            buttonNeighborSelector: '.btn-icon.btn-menu-toggle.attach-file',
            buttonSelector: '#speechRecognitionButton',
            buttonHTML: `
                 <style>
                     button.btn-icon.speechRecognitionButton {
                         color: ${buttonColor}; /* Defines the default color */
                     }
                </style>
                <button id="speechRecognitionButton" class="btn-icon speechRecognitionButton" style="border: none; background: none; cursor: pointer; margin-left: 5px; padding: 0;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C7.582 2 4 5.582 4 10V14C4 18.418 7.582 22 12 22C16.418 22 20 18.418 20 14V10C20 5.582 16.418 2 12 2ZM12 20C8.686 20 6 17.314 6 14V10C6 6.686 8.686 4 12 4C15.314 4 18 6.686 18 10V14C18 17.314 15.314 20 12 20ZM12 6C10.895 6 10 6.895 10 8V14C10 15.105 10.895 16 12 16C13.105 16 14 15.105 14 14V8C14 6.895 13.105 6 12 6Z" fill="currentColor"></path>
                    </svg>
                </button>`,
            getEmojiHTML: ([id, alt]) => `<img src="assets/img/emoji/${id}.png" class="emoji emoji-image" alt="${alt}">`,
            sendButtonSelector: 'button[class="btn-icon rp btn-circle btn-send animated-button-icon send"]'
        },
        "seoschmiede": {
            inputFieldSelector: '#text-field',
	        inputFieldPlaceholderSelector: null,
	        getInputFieldPlaceholderText: () => 'Nachricht',
            buttonContainerSelector: '.button-group',
            buttonNeighborSelector: '#anfragen',
	        buttonSelector: '#speechRecognitionButton',
	        buttonHTML: `
                <button id="speechRecognitionButton" class="btn-icon" style="border: none; background: none; cursor: pointer; margin-left: 5px; padding: 0;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C7.582 2 4 5.582 4 10V14C4 18.418 7.582 22 12 22C16.418 22 20 18.418 20 14V10C20 5.582 16.418 2 12 2ZM12 20C8.686 20 6 17.314 6 14V10C6 6.686 8.686 4 12 4C15.314 4 18 6.686 18 10V14C18 17.314 15.314 20 12 20ZM12 6C10.895 6 10 6.895 10 8V14C10 15.105 10.895 16 12 16C13.105 16 14 15.105 14 14V8C14 6.895 13.105 6 12 6Z" fill="currentColor"></path>
                    </svg>
                </button>`,
	        getEmojiHTML: ([id, alt]) => `${alt}`,
            sendButtonSelector: '#anfragen'
        }
    }   

    const app = {
        id: '',
        name: '',

        init: function () {
            app.setupUrlObserver();
            app.onUrlChanged();
        },

        setupUrlObserver: function () {
            const originalPushState = history.pushState.bind(history);
            history.pushState = (...args) => {
                originalPushState(...args);
                app.onUrlChanged();
            };
            const originalReplaceState = history.replaceState.bind(history);
            history.replaceState = (...args) => {
                originalReplaceState(...args);
                app.onUrlChanged();
            };
            window.addEventListener('popstate', () => this.startDomObserver());
        },

        onUrlChanged: function () {
            const prev = app.id;
            if (window.location.href.startsWith('https://chatgpt.com/')) {
                app.name = 'ChatGPT';
                app.id = 'chatgpt';
            } else if (window.location.href.startsWith('https://web.telegram.org/a/')) {
                app.name = 'Telegram';
                app.id = 'telegram-a';
            } else if (window.location.href.startsWith('https://web.telegram.org/k/')) {
                app.name = 'Telegram';
                app.id = 'telegram-k';
            } else if (window.location.href.startsWith('https://seoschmiede.at/')) {
                app.name = 'ChatGPT (w/o registration)';
                app.id = 'seoschmiede';
            }

            if (app.id !== prev) {
                console.log(`app: "${app.name}" id: "${app.id}"`);
                app.onAppIdChanged();
            }
        },
        onAppIdChanged: function () {
            def = definitions[app.id];
            console.log(`def: ${app.id}`);
        }
    };
    app.init();

    var _lang = 'en-US';

    var inputField = null;

    var _isRecording = false; // Track if the recording is active
    var _isContinuous = false; // Track if continuous recording is active
    var _recognition; // Declare _recognition globally for cancellation
    var _finalTranscript = ''; // Store the final transcript
    var _lastFinalTranscript = 0;
    var _lastInterimTranscript = ''; // Store the last interim result to avoid repetition
    var _commandTimeout; // Store the timeout ID for command checking
    var _autoPunctuation = false;
    var _forceListen = false;
    var _pause = false;

    var recordButton = null;    

    // Function to insert the speech button
    function insertSpeechButton() {
        if (querySelector(def.buttonSelector)) return false;
        console.log('insertSpeechButton');
        if (!insert()) return false;
        recordButton = querySelector(def.buttonSelector);
        recordButton.addEventListener('click', recordButtonClick);
        console.log('Microphone button inserted');
        return true;

        function insert() {
	        const container = querySelector(def.buttonContainerSelector);
	        if (!container) { console.log(`Element not found "${def.buttonContainerSelector}"`); return false; }
            const neighbor = querySelector(def.buttonNeighborSelector);
	        if (!neighbor) { console.log(`Element not found "${def.buttonNeighborSelector}"`); return false; }
	        const placeholder = document.createElement('placeholder');
	        neighbor.parentElement.insertBefore(placeholder, neighbor);
	        placeholder.outerHTML = def.buttonHTML;
	        return true;
        }
    }

    /** Instance of SpeechRecognition @type {SpeechRecognition} */
    var _recognition = null;
    function initSpeechRecognition(lang) {
        console.log(`initSpeechRecognition ${lang}`);
        if (_recognition) {
            stopRecording(true);
        }
        // Speech Recognition setup
        _recognition = new SpeechRecognition();
        _recognition.lang = lang;
        _recognition.interimResults = true; // Enable interim results for continuous input
        _recognition.maxAlternatives = 1;
        _recognition.continuous = false; // In normal mode, stop after a pause automatically

        _recognition.onresult = onResult;
        _recognition.onerror = onError;
        _recognition.onend = onEnd;
    }

    function recordButtonClick(e) {
        console.log('recordButtonClick');
        e.preventDefault(); // Prevents standard actions such as sending the text
        e.stopPropagation(); // Stops the propagation of events that could lead to transmission

        const continuous = !e.ctrlKey;
        _pause = false;
        if (continuous) {
            if (_isContinuous) stopRecording(); else startContinuousRecording();
        } else {
            if (_isRecording) {
                _recognition.stop(); // Cancel recording if active
                recordButton.style.color = ''; // Reset button color
                _isRecording = false;
            } else {
                // Ensure normal mode works with pauses
                _lastFinalTranscript = Date.now();
                _recognition.continuous = false; // Normal mode: Stop after pause
                _recognition.start(); // Start single recording
                recordButton.style.color = 'red'; // Turn button red
                _isRecording = true;
            }
        }
    }

    function startContinuousRecording() {
        console.log('startContinuousRecording');
        _lastFinalTranscript = Date.now();
        _recognition.continuous = true; // Enable continuous mode
        _finalTranscript = ''; // Clear the final transcript
        _lastInterimTranscript = ''; // Clear interim result buffer
        _recognition.start();
        recordButton.style.color = 'red';
        _isContinuous = true; _forceListen = true;
        _isRecording = true; // Mark recording as active
        _pause = false;
    }

    function stopRecording(cancel) {
        console.log('stopRecording '+ (cancel ? 'abort' : ''));
        if (cancel) _recognition.abort(); else _recognition.stop();
        recordButton.style.color = '';
        _isContinuous = false; _forceListen = false;
        _isRecording = false;
        _lastInterimTranscript = '';
        _finalTranscript = '';
        _pause = false;
    }

    //TODO translate
    const replacements = {
        "chat gpt": 'ChatGPT',
        "jet gpt": 'ChatGPT',
        "chat gbt": 'ChatGPT',
        "jet gbt": 'ChatGPT',
        "und so weiter": 'usw.',
        "UPS": 'uups',
        ":-)": 'emoji lächeln',
        ":)": 'emoji lächeln',
        ":-D": 'emoji lachen',
        ":D": 'emoji lachen',
        "8)": 'emoji cool',
        "<3": 'emoji herz'
    };

    const emojisDef = [
	    ['2764',  '❤️', 'heart',   'herz'],
	    ['1f61c', '😜', 'crazy',  'verrückt'],
	    ['1f923', '🤣', 'rofl',   'rofl'],
	    ['1f319', '🌙', 'moon',   'mond'],
	    ['2600',  '☀', 'son',     'sonne'], // son==sun!
	    ['1f62d', '😭', 'crying', 'heulen'],
	    ['1f642', '🙂', 'smile',  'lächeln'],
	    ['1f603', '😃', 'laugh',  'lachen'],
	    ['1f60e', '😎', 'cool',   'cool']
    ];

    /** emoji dictionary  @type { Object < string, string >} */
    var emojis = null;
    // Erstellt das emojis Dictionary basierend auf der gewünschten Sprache
    function translateEmojis(lang) {
	    emojis = {};
	    var langIndex = languages.indexOf(lang);
        if (langIndex === -1) {
            console.error('Language not supported');
            langIndex = 2; //en-US
	    }
	    emojisDef.forEach(emoji => {
            emojis[emoji[langIndex + 2]] = [emoji[0], emoji[1]]; 
        });
    };

    function onResult (e) {
        //console.log('_recognition.onresult');
        var interimTranscript = ''; // Hold interim results

        // Process results, both interim and final
        for (let i = e.resultIndex; i < e.results.length; ++i) {
            if (e.results[i].isFinal) {
                _finalTranscript += e.results[i][0].transcript;
            } else {
                interimTranscript += e.results[i][0].transcript;
            }
        }

        if (inputField) {
            const lastNode = inputField.lastChild;
            let currentText = '';
            if (lastNode) {
                // telegram:
                if (lastNode.nodeType === Node.TEXT_NODE) currentText = lastNode.textContent.trim();
                // chatgpt:
                else if (lastNode.nodeName.toLowerCase() === 'p' && !lastNode.classList.contains('placeholder')) currentText = lastNode.innerText.trim();
            }

            if (_lastInterimTranscript) { // restore currentText w/o interim transcript
	            const t = currentText.trimEnd();
                currentText = t.slice(0, t.length - _lastInterimTranscript.trim().length).trimEnd() + ' ';
                _lastInterimTranscript = '';
            }

            if (interimTranscript) {
                console.log(`Interim: "${interimTranscript}"`);
                _lastInterimTranscript = interimTranscript + ' ';
                updateTextNodeContent(lastNode, currentText + _lastInterimTranscript);
            }

            if (_finalTranscript) {
                console.log(`Final:    "${_finalTranscript}"`);
                if (!_autoPunctuation && /[.,:;!?]$/.test(_finalTranscript)) _autoPunctuation = true;
                Object.keys(replacements).forEach(function (key) {
                    var escapedKey = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                    var pattern = new RegExp(`\\b${escapedKey}\\b`, 'gi');
                    _finalTranscript = _finalTranscript.replace(pattern, replacements[key]);
                });
                _lastInterimTranscript = '';
                _lastFinalTranscript = Date.now();

                if (checkForCommand(currentText, _finalTranscript)) {
                    _recognition.stop(); // Restart the _recognition process
                } else {
                    if (_pause) updateTextNodeContent(lastNode, currentText);
                    else updateTextNodeContentWithEmoji(lastNode, currentText, _finalTranscript);
                }
                _finalTranscript = '';
            }

            notifyInputChanged();
        }

        // Ensure the button resets correctly if recording stops
        if (!_isContinuous) {
            recordButton.style.color = '';
            _isRecording = false;
        }
    };

    /* chatgpt empty inputField
<div contenteditable="true" translate="no" class="ProseMirror" id="prompt-textarea">
    <p data-placeholder="Sende eine Nachricht an ChatGPT" class="placeholder">
        <br class="ProseMirror-trailingBreak">
    </p>
</div>
     */

    function getLastTextNodeOrParent() {
        if (!inputField) return null;
        var lastChild = inputField.lastChild;	   
        if (!lastChild) return inputField;
        if (lastChild.nodeType === Node.TEXT_NODE) return lastChild;
        if (lastChild.nodeName.toLowerCase() !== 'p') return inputField;
        if (!lastChild.lastChild) return lastChild;
        if (lastChild.lastChild.nodeType === Node.TEXT_NODE) return lastChild.lastChild;
        return lastChild;
    }

    // Funktion, um den Text im letzten Knoten zu aktualisieren oder neuen Textknoten hinzuzufügen
    function updateTextNodeContent(node, newText) {
        newText = newText.trim() + ' ';        
        
        if (node?.nodeType === Node.TEXT_NODE) node.textContent = newText;
        else if (node?.nodeName === 'P') {
            node.removeAttribute('placeholder'); // chatgpt   
            if(node.lastChild?.nodeType === Node.TEXT_NODE) node.lastChild.textContent = newText;
            else node.appendChild(document.createTextNode(newText));
        } 
        else inputField.appendChild(document.createTextNode(newText));
    }

    function updateTextNodeContentWithEmoji(node, currentText, newText) {
        console.log(`updateTextNodeContentWithEmoji "${currentText}" "${newText}"\n  ${node?.textContent}`);
        
        // "Äh, Mutti, Sonne."
        var match = /^(Emoji[.,]?|Äh[,.]?\sMutti[,.]?|Mutti[,.]?)\s+(\w+)[.,]?\s*$/i.exec(newText);
        if (match && appendEmoji(match[2], currentText)) return;

        // Den Text vorbereiten (Leerzeichen hinzufügen, wenn nötig)
        newText = currentText + newText.trim() + ' ';

        let lastIndex = 0;

        /* Durchsuche den Text nach Emojis und füge sie hinzu
        const emojiRegex = /Emoji\.?\s+(\w+)/g;
        while ((match = emojiRegex.exec(newText)) != null) {
            // Füge Text bis zum Emoji hinzu
            if (match.index > lastIndex) {
                const textPart = newText.substring(lastIndex, match.index);
                if (node && node.nodeType === Node.TEXT_NODE) {
                    node.textContent = textPart; // Setze den Text einmalig in den vorhandenen TextNode
                } else if (node && node.nodeName.toLowerCase() === 'p') {
                    node.innerHTML = textPart;
                    node = null;
                } else {
                    inputField.appendChild(document.createTextNode(textPart)); // Füge neuen TextNode hinzu
                }
            }
            appendEmoji(match[1]);
            lastIndex = emojiRegex.lastIndex;
        }
        */
        // Füge den restlichen Text nach dem letzten Emoji hinzu
        if (lastIndex < newText.length) {
            const remainingText = newText.substring(lastIndex);
            if (node && node.nodeType === Node.TEXT_NODE) {
                node.textContent = remainingText; // Aktualisiere den vorhandenen TextNode
            } else if (node && node.nodeName === 'P') {
                node.innerHTML = remainingText;
            } else {
                inputField.appendChild(document.createTextNode(remainingText)); // Füge neuen TextNode hinzu
            }
        }

        return;

        // Add the emoji as an HTML element
        function appendEmoji(key, currentText) {
            key = key.toLowerCase();
            if (!emojis[key]) return false;
            if (node && currentText) node.textContent = currentText; // remove emoji command

            const dummy = document.createElement('dummy');
            dummy.innerHTML = def.getEmojiHTML(emojis[key]);
            const emoji = dummy.firstChild;

            if (node && node.nodeType === Node.TEXT_NODE) {
                if (emoji.nodeType === Node.TEXT_NODE) node.textContent += emoji;
                else node.parentNode.appendChild(emoji);
            } else if (node && node.tagName === 'P') {
	            node.appendChild(emoji);
            } else {
	            inputField.appendChild(emoji);
            }
            return true;
        }
    }

    function notifyInputChanged() {
        inputField.focus();
        setCursorToEnd(inputField);

        const event = new Event('input', { bubbles: true });
        inputField.dispatchEvent(event);
    }

    function onError(event) {
        console.error('Speech Recognition error: ', event.error);
        // "no-speech"": restart if possible
        // "not-allowed": no access rights to the microphone? CSP?
    };

    function onEnd() {        
        const delta = (Date.now() - _lastFinalTranscript);
        if (_forceListen || (_isContinuous && delta < 5000)) {
            if (delta > 100) {
                console.log('_recognition.onend => auto restart');
                _finalTranscript = '';
                _lastInterimTranscript = '';
                _lastFinalTranscript = Date.now();
                _recognition.start(); // restart
                return;
            } else {
                ;// delta<100 can occur if speech recognition is terminated immediately 
                // because another one (other tab) is already running
            }
        }
	    console.log('_recognition.onend');
        recordButton.style.color = '';
        _isRecording = false;
        _isContinuous = false;        
    };
    
    const commandsDef = {
        // replacements      en-US                      de-DE
	    '...':             ['three dots',              'drei punkte'        ],
	    '.':               ['dot',                     'punkt'              ],
	    ',':               ['comma',                   'komma'              ],
	    '?':               ['question mark',           'fragezeichen'       ],
	    '???':             ['three question marks',    'drei fragezeichen'  ],
	    '!':               ['exclamation mark',        'ausrufezeichen'     ],
	    '!!!':             ['three exclamation marks', 'drei Ausrufezeichen'],
	    '-':               ['dash',                    'bindestrich'        ],
	    ':':               ['colon',                   'doppelpunkt'        ],
        // commands          en-US                      de-DE
	    'Delete-Word':     ['delete word',             'löschen'            ],
        'Delete-Sentence': ['delete sentence',         'Satz löschen'       ],
        'Delete-Paragraph':['delete paragraph',        'Absatz löschen'     ],
	    'Delete-All':      ['delete all',              'Alles löschen'      ],
        'New-Paragraph':   ['new paragraph',           'neuer Absatz'       ],
	    'Undo':            ['undo',                    'rückgängig'         ],
	    'Send':            ['send',                    'senden'             ],
	    'Listen':          ['listen',                  'zuhören'            ],
	    'EndVoiceInput':   ['end',                     'ende'               ],
	    'Pause':           ['pause',                   'pause'              ]
    };

    /** commands dictionary  @type { Object < string, string >} */
    const commands = {};
    function translateCommands(lang) {
        const langIndex = languages.indexOf(lang);
	    if (langIndex === -1) throw new Error(`Language ${lang} not supported.`);
        for (const [command, voiceCommandTable] of Object.entries(commandsDef)) {//& sprachbefehl
            commands[voiceCommandTable[langIndex].toLowerCase()] = command;
	    }
    }   

    /** Checks if a command is present in the current text.
     * @param {string} currentText - Current text (from last text node) without command
     * @param {string} transcript - The newly recognized text to be checked.
     * @returns {boolean} - Returns true if a command is found, otherwise false.
     */
    function checkForCommand(currentText, transcript) {
        currentText = currentText.trim();
        transcript = transcript.trim().toLowerCase().replace(/[.,:;!?]$/, '');
        console.log(`command? "${currentText}" + "${transcript}"`);

        const command = commands[transcript];
        if (!command) return false;

        updateTextNodeContent(inputField.lastChild, currentText); // remove the command from inputField
        notifyInputChanged();

        if (command === 'Delete-Word') {
            console.log('command DELETE');
            deleteLastWord();
        } else if (command === 'Delete-Sentence') {
	        console.log(`command ${command}`);
            deleteLastSentence();
        } else if (command === 'Delete-Paragraph') {
	        console.log(`command ${command}`);
            deleteLastParagraph();
        } else if (command === 'Delete-All') {
	        console.log(`command ${command}`);
            inputField.innerHTML = ''; 
        } else if (command === 'New-Paragraph') {
            console.log(`command ${command}`);
            // chatgpt: direct DOM manipulation to insert <p> seems to send the message immediately
            // Simulate pressing Ctrl + Enter does work in chatgpt, but not in telegram
            if (app.id === "chatgpt") {
                const event = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true, shiftKey: true });
                inputField.dispatchEvent(event);
            } else {
                inputField.innerHTML = inputField.innerHTML.trimEnd() + "<br/>\n";
            }
        } else if (command === 'Send') {
            console.log('command SEND');
            console.log(`text: "${inputField.innerText}"`);
            setTimeout(() => { clickSendButton(); }, 100); // workaround for chatgpt
        } else if (command === 'EndVoiceInput') {
            console.log('command EndVoiceInput');
            stopRecording();
        } else if (command === 'Listen') {
            console.log('command Listen');
            _forceListen = true;
            _pause = false;
            recordButton.style.color = 'red';
        } else if (command === 'Pause') {
            console.log('command Pause');
            _pause = true;
            recordButton.style.color = 'yellow';
        } else if (command === 'Undo') {
            console.log('command UNDO');
            const undoEvent = new KeyboardEvent('keydown', {
                key: 'z',
                ctrlKey: true,
                bubbles: true,
                cancelable: true
            });
            document.dispatchEvent(undoEvent);
        } else {
            console.log('command PUNCTUATION');
            addPunctuation(command);
        }

        setCursorToEnd(inputField);
        return true;
    }

    /** Deletes the last word or punctuation (incl. non-text node) */
    function deleteLastWord() {
        console.log('deleteLastWord');
        console.log(`"${inputField.innerText}"`);

        var paragraph = inputField;
        while (true) {
            const lastNode = paragraph.lastChild;
            if (!lastNode) {
                if (paragraph.nodeName === 'P') paragraph.remove();
                return;
            } else if (lastNode.nodeName === 'P') {
                paragraph = lastNode;
            } else if (lastNode.nodeName === 'BR') {
                paragraph.removeChild(lastNode);
                return;
            } else if (lastNode.nodeType !== Node.TEXT_NODE) {
                paragraph.removeChild(lastNode);
                return;
            } else /* TEXT_NODE */ {
                let text = lastNode.textContent.trimEnd();
                if (text.length === 0) {
	                paragraph.removeChild(lastNode);
                    continue;
                }
                const match = _autoPunctuation 
                    ? text.match(/\S+$/) // with autoPunctuation we will delete the word AND punctuation at once
                    : text.match(/[.,!?;:(){}\[\]'"<>]+$/) || text.match(/\S+$/);
                if (match) {
                    text = text.substring(0, text.length - match[0].length).trimEnd();
                    if (text.length > 0) text += ' ';
                    lastNode.textContent = text;
                }
                if (lastNode.textContent.length === 0) paragraph.removeChild(lastNode);
                return;
            }           
        }
    }

    /** Deletes the last paragraph (incl. non-text nodes) */
    function deleteLastParagraph() {
	    console.log(`deleteLastParagraph`);
        //console.log(`deleteLastParagraph \nHTML: ${inputField.innerHTML}`);
        let deleted = false;
        // Delete backwards through the nodes until other P or BR is found
        const paragraph = inputField;
        while (paragraph.childNodes.length > 0) {
	        const lastNode = paragraph.lastChild;
            if (lastNode.nodeName === 'P') {
                if (deleted) return;
                paragraph.removeChild(lastNode);
                return;
            } else if (lastNode.nodeName === 'BR') {
                // if (deleted) {paragraph.appendChild(document.createTextNode('\n')); return; }
                paragraph.removeChild(lastNode);
                if (deleted) return;
                deleted = true;
            } else if (lastNode.nodeType !== Node.TEXT_NODE) {
                paragraph.removeChild(lastNode);
                deleted = true;
            } else {
                if (lastNode.textContent.trim() !== '') deleted = true;	 
	            paragraph.removeChild(lastNode);
            }       
        }
    }

    /** Deletes the last sentence (incl. non-text nodes) */
    function deleteLastSentence() {
	    //console.log(`deleteLastSentence`);
        console.log(`deleteLastSentence \nHTML: ${inputField.innerHTML}`);

        let deleted = false;
        // Delete backwards through the nodes until a text node with a punctuation mark or other paragraph is found
        var paragraph = inputField;
        while (paragraph.childNodes.length > 0) {
            const lastNode = paragraph.lastChild;
            if (lastNode.nodeName === 'P') {
                if (deleted) return;
                paragraph = lastNode;
                continue;
            } else if (lastNode.nodeName === 'BR') {
                if (deleted) return;
                paragraph.removeChild(lastNode);
                deleted = true;
                continue;
            } else if (lastNode.nodeType !== Node.TEXT_NODE) {
	            paragraph.removeChild(lastNode);
                deleted = true;
                continue;
            }
            let text = lastNode.textContent;
            if (!deleted) text = text.trim().replace(/[\.\?\!]$/, '').trim();
            const lastPunctuationIndex = Math.max(text.lastIndexOf('.'), text.lastIndexOf('!'), text.lastIndexOf('?'));
            if (lastPunctuationIndex !== -1) {
                lastNode.textContent = text.substring(0, lastPunctuationIndex + 1);
                return;
            } else {
	            paragraph.removeChild(lastNode);
                deleted = true;
            }
        }
    }

    function addPunctuation(punctuation) {
        const nodes = inputField.childNodes;
        const lastNode = nodes[nodes.length - 1];
        lastNode.textContent = lastNode.textContent.trimEnd() + punctuation + ' ';
    }

    function setCursorToEnd(el) {
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(el);
        range.collapse(false); // Place cursor at the end
        selection.removeAllRanges();
        selection.addRange(range);
        el.focus(); // Focus input field again
        console.log('Cursor set');
    }

    function clickSendButton() {
        const sendButton = querySelector(def.sendButtonSelector);
        if (sendButton) {
            sendButton.click();
        }
    }

    function querySelector(selector) {
        if (typeof selector === 'function') {
            return selector();
	    }
        return document.querySelector(selector);
    }

    function tryCall(f) {
	    try { return f(); } catch (error) { return null; }
    }

    function detectLanguage() {
        const oldLang = _recognition ? _recognition.lang : '';
        const text = tryCall(() => def.getInputFieldPlaceholderText());
        if (!text) return;
                   
	    let lang = 'en-US';
        if      (text.includes('Nachricht')) lang = 'de-DE';
        else if (text.includes('Message'  )) lang = 'en-US';
	    if (oldLang === lang) return;
	    console.log(`Language detected: ${lang}`);
        _lang = lang;
        translateEmojis(lang);
	    translateCommands(lang);
	    initSpeechRecognition(lang);
    }

    // Observe changes in the DOM to find the input container and insert the button
    const observer = new MutationObserver(function () {
        //console.log('DOM changed');
        if (!querySelector(def.buttonContainerSelector)) {
            console.log(`VERBOE def.buttonContainerSelector not found '${def.buttonContainerSelector}'`);
            return;
        }
        if (insertSpeechButton()) {
            inputField = querySelector(def.inputFieldSelector);
        }
        detectLanguage(); //TODO performance
		//observer.disconnect(); // Stop observing once the button is added
    });
    observer.observe(document.body, { childList: true, subtree: true });
    console.log('observer initialized');

    document.addEventListener('visibilitychange', function () {
	    if (document.visibilityState === 'hidden') {
		    stopRecording();		    
        } else if (document.visibilityState === 'visible' && inputField) {
		    setCursorToEnd(inputField);
	    }
    });
    window.addEventListener('blur', function () {
	    stopRecording();
    });
    window.addEventListener('focus', function () {
	    
    });    
})();

/*
Copyright © 2024 by K5X. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to use,
copy, modify, merge, publish, and distribute copies of the Software, subject
to the following conditions:

1. The software may not be sublicensed, sold or used for direct or indirect
   commercial purposes, including the generation of revenue, without the
   express permission of the copyright holder, regardless of whether or not
   changes have been made to the original code.
2. The above copyright notice and this permission notice shall be included in
   all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

This license is not a general permission that this software may be used on
third party websites or services without prior agreement with the respective
operators of these websites or services.
*/