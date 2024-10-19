// ==UserScript==
// @name         Web Chat Speech Recognition Button
// @namespace    http://tampermonkey.net/
// @version      1.85.3
// @description  Adds a speech recognition button to Telegram Web, ChatGPT, Gemini and Copilot
// @author       K5X
// @copyright    Copyright © 2024 by K5X. All rights reserved.
// @license      See full license below
// @match        https://web.telegram.org/*
// @match        https://chatgpt.com/*
// @match        https://seoschmiede.at/aitools/chatgpt-tool/
// @match        https://seoschmiede.at/en/aitools/chatgpt-tool/
// @match        https://gemini.google.com/app
// @match        https://gemini.google.com/app/*
// @match        https://copilot.microsoft.com/*
// @grant        GM_registerMenuCommand
// @grant        GM_getValue
// @grant        GM_setValue
// @require      https://cdnjs.cloudflare.com/ajax/libs/dompurify/2.3.10/purify.min.js
// @downloadURL  https://github.com/K5X-miomic9/WebChatSpeechRecognition/raw/refs/heads/develop/src/WebChatSpeechRecognition.user.js
// @updateURL    https://github.com/K5X-miomic9/WebChatSpeechRecognition/raw/refs/heads/develop/src/WebChatSpeechRecognition.user.js
// ==/UserScript==

/*****************************************************************************\
 * README: https://github.com/K5X-miomic9/WebChatSpeechRecognition           *
╔═════════════════════════════════════════════════════════════════════════════╗
║ PLEASE DO NOT PUBLISH OR PROMOTE!                                           ║
║                                                                             ║
║ The repository and its content are intended for limited testing only.       ║
║ Please avoid sharing URLs or information publicly to ensure smooth testing  ║
║ until the script has been officially authorized by the respective operators ║
║ of the websites or services used.                                           ║
╚═════════════════════════════════════════════════════════════════════════════╝
\*****************************************************************************/

/* NOTES:
 * DOMPurify is required for Copilot support.
 * TrustedTypes (or DOMPurify) is required for Gemini support.
 * Speech Recognition API is required for all services. (but available only for Chrome, Edge)
 * GM_ function are optional
 */

/* global DOMPurify, SpeechRecognition, webkitSpeechRecognition, GM_registerMenuCommand, GM_setValue, GM_getValue */
/* global trustedTypes */

(function () {   

    const version = '1.85.3'; console.log(`Script version ${version}`);
    const defaultButtonColor = '#009000';
    const defaultRecognitionLanguage = 'auto';
    const debug = true;

    if (debug) window.onerror = function (e, filename, line, col, error) {
	    if (e instanceof ErrorEvent) console.error(`Global error intercepted: ${e.error}\n${e.filename}:${e.lineno}:${e.colno}`);
        else console.error(`Global error intercepted: ${error}\n${filename}:${line}:${col}\n${e}`);
        return false; // but does not prevent the execution of further handlers
    };

    const trimEndSpace = (s) => s.replace(/[ ]+$/, '');

    /* @ts-ignore */
    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        console.warn('Speech Recognition API is not supported in this browser.');
	    return;
    }

    checkMicrophoneAccessAsync();

    /**
    * @description An object containing sanitization methods for different types of content.
    * @typedef {Object} TrustedTypePolicy
    * @property {function(string): string} createHTML - Sanitizes HTML content.
    * @property {function(string): string} createScript - Validates or filters JavaScript content.
    * @property {function(string): string} createScriptURL - Validates or verifies script URLs.
    */

    (function () {
	    /** DOMPurify
        * @typedef {Object} DOMPurify
        * @property {function(string): string} sanitize - Sanitizes HTML content.
        */

	    if (typeof DOMPurify !== 'undefined') {
		    console.log('DOMPurify is available!');
            const cleanElement = DOMPurify.sanitize('<div>Test</div>', { RETURN_DOM_FRAGMENT: true }).firstChild;
            document.body.appendChild(cleanElement);
            cleanElement.remove();
		    console.log('DOMPurify injection successful!');
		    //sanitize.createHTML = (input) => DOMPurify.sanitize(input);
		    //sanitize.createElement = (input) => DOMPurify.sanitize(input, { RETURN_DOM_FRAGMENT: true }).body.firstChild;
	    } else {
		    console.warn('DOMPurify is not available!');
	    }
    })();

    /** Create DocumentFragment from HTML using DOMPurify
     * @param {String} html
     * @returns a DocumentFragment or throws an exception; if DOMPurify not available an HtmlElement (div)
     */
    function createElementsFromHtml(html) {
        if (!html.trim().startsWith('<')) return document.createTextNode(html);; // plain text
        if (typeof DOMPurify !== 'undefined') {
            const cleanFragment = DOMPurify.sanitize(html, {
	            RETURN_DOM_FRAGMENT: true,
                SAFE_FOR_TEMPLATES: true,
                FORCE_BODY: true
            });
            return cleanFragment;
        }
        throw 'createElementsFromHtml failed. DOMPurify is not available.';
    }

    const supportedLanguages = ['en-US', 'de-DE', 'fr-FR', 'it-IT']; 
    const lang2To4 = { en: 'en-US', de: 'de-DE', fr: 'fr-FR', it: 'it-IT' };

    
    const gm = {
        available: typeof GM_registerMenuCommand === 'function',
        registerMenuCommand: typeof GM_registerMenuCommand === 'function' ? GM_registerMenuCommand : function (a, b) { },
        setValue: typeof GM_setValue === 'function' ?  GM_setValue : function (a, b) { },
        getValue: typeof GM_getValue === 'function' ? GM_getValue : function (a, b) { return b; },
        setColor: function() {
	        const color = prompt('Color of the microphone button: \n(#RRGGBB or web name)', gm.getValue('buttonColor', defaultButtonColor));
	        if (color) {
		        gm.setValue('buttonColor', color);
                console.log(`Color saved: ${color}`);
                location.reload();
	        }
        },
        setLanguage: function () {
            let lang = prompt('Speech recognition langauge: \n("auto" or "en", "de", ... or "ll-CC" format)', gm.getValue('recognitionLanguage', defaultRecognitionLanguage));
            if (lang) {
                lang = lang2To4[lang] || lang;
		        gm.setValue('recognitionLanguage', lang);
                console.log(`Language saved: ${lang}`);
                location.reload();
	        }
        },
        setStopRecordingOnBlurOrHidden: function () {
            const value = gm.getValue('stopRecordingOnBlurOrHidden', true);
            gm.setValue('stopRecordingOnBlurOrHidden', !value);
            console.log(`stop listening on blur or hidden: ${!value}`);
		    location.reload();
        },
        setFavorite: function (num) {
            const dest = window.location.href;
            gm.setValue(`favorite${num}`, dest);
            console.log(`favorite1: ${dest}`);
        }
    }
    var buttonColor = gm.getValue ('buttonColor', defaultButtonColor);
    console.log(`settings: current color: ${buttonColor}`);
    var recognitionLanguage = gm.getValue('recognitionLanguage', defaultRecognitionLanguage);
    console.log(`settings: recognition language: ${recognitionLanguage}`);
    var stopRecordingOnBlurOrHidden = gm.getValue('stopRecordingOnBlurOrHidden', true);
    console.log(`settings: stop listening on blur or hidden: ${stopRecordingOnBlurOrHidden}`);

    gm.registerMenuCommand(`Microphone button color: ${buttonColor}`, gm.setColor);
    gm.registerMenuCommand(`Speech recognition language: ${recognitionLanguage}`, gm.setLanguage);
    gm.registerMenuCommand(`Stop listening on blur or hidden: ${stopRecordingOnBlurOrHidden}`, gm.setStopRecordingOnBlurOrHidden);
    gm.registerMenuCommand('Set favorite 1', () => gm.setFavorite(1));
    gm.registerMenuCommand('Set favorite 2', () => gm.setFavorite(2));
    gm.registerMenuCommand('Set favorite 3', () => gm.setFavorite(3));    

    /**
    * @typedef {Object} Definition
    * @property {string|function} inputFieldSelector - selector for the input element
    * @property {string|function} inputFieldPlaceholderSelector - selector for the input element placeholder
    * @property {function} getInputFieldPlaceholderText
    * @property {string|function} buttonContainerSelector - selector for the container
    * @property {string|function} buttonNeighborSelector - selector for the neighbor
    * @property {string|function} buttonSelector - selector for the new button
    * @property {string} buttonHTML - HTML for the button
    * @property {function} getEmojiHTML - function to get emoji HTML
    * @property {string|function} sendButtonSelector - selector for the send button
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
            buttonNeighborSelector: () => document.querySelector('button[data-testid="send-button"]').parentElement.parentElement.previousElementSibling,
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
                        color: ${buttonColor};
                    }
                    button.btn-icon.speechRecognitionButton:hover {
                        background-color: #2B2B2B !important;
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
        },
        "gemini": {
            inputFieldSelector: 'div.ql-editor.textarea',
            inputFieldPlaceholderSelector: '.ql-editor.textarea',
            getInputFieldPlaceholderText: () => document.querySelector('.ql-editor.textarea').getAttribute('data-placeholder'),
            buttonContainerSelector: '.input-buttons-wrapper-bottom',
            buttonNeighborSelector: '.upload-button',
	        buttonSelector: '#speechRecognitionButton',
            buttonHTML: `
                 <style>
                     .speechRecognition > button {
                         color: ${buttonColor};
                     }
                    .speechRecognition > button:hover {
                        background-color: #2F3030;
                    }
                </style>
                <div class="speechRecognition">
                    <button id="speechRecognitionButton" class="mat-mdc-icon-button" style="" title="Spracheingabe">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C7.582 2 4 5.582 4 10V14C4 18.418 7.582 22 12 22C16.418 22 20 18.418 20 14V10C20 5.582 16.418 2 12 2ZM12 20C8.686 20 6 17.314 6 14V10C6 6.686 8.686 4 12 4C15.314 4 18 6.686 18 10V14C18 17.314 15.314 20 12 20ZM12 6C10.895 6 10 6.895 10 8V14C10 15.105 10.895 16 12 16C13.105 16 14 15.105 14 14V8C14 6.895 13.105 6 12 6Z" fill="currentColor"></path>
                        </svg>
                    </button>
                </div>`,
	        getEmojiHTML: ([id, alt]) => `${alt}`,
            sendButtonSelector: 'button[title="Nachricht übermitteln"]' //TODO
        },
        "copilot": {
	        inputFieldSelector: '#userInput',
	        inputFieldPlaceholderSelector: '#userInput',
	        getInputFieldPlaceholderText: () => document.querySelector('#userInput').getAttribute('placeholder'),
            buttonContainerSelector: () => document.querySelector('button[data-testid="audio-call-button"]')?.parentElement?.parentElement,
            buttonNeighborSelector: () => querySelector(def.buttonContainerSelector)?.children[2],
	        buttonSelector: '#speechRecognitionButton',
	        buttonHTML: `
                 <style>
                     .speechRecognition > button {
                         color: ${buttonColor};                         
                     }
                </style>
                <div class="relative my-1 shrink-0 size-10 speechRecognition" style="transform: none; transform-origin: 50% 50% 0px;">
                    <button id="speechRecognitionButton" title="Speech Recognition" class="absolute size-10 rounded-xl fill-foreground-750 p-2 fill-foreground-800 active:text-foreground-600 active:fill-foreground-600 dark:active:text-foreground-650 dark:active:fill-foreground-650 bg-transparent hover:bg-black/5 active:bg-black/3 dark:hover:bg-black/30 dark:active:bg-black/20" style="opacity: 1; will-change: auto;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C7.582 2 4 5.582 4 10V14C4 18.418 7.582 22 12 22C16.418 22 20 18.418 20 14V10C20 5.582 16.418 2 12 2ZM12 20C8.686 20 6 17.314 6 14V10C6 6.686 8.686 4 12 4C15.314 4 18 6.686 18 10V14C18 17.314 15.314 20 12 20ZM12 6C10.895 6 10 6.895 10 8V14C10 15.105 10.895 16 12 16C13.105 16 14 15.105 14 14V8C14 6.895 13.105 6 12 6Z" fill="currentColor"></path>
                        </svg>
                    </button>
                </div>`,
	        getEmojiHTML: ([id, alt]) => `${alt}`,
	        sendButtonSelector: 'button[title="Nachricht übermitteln"]' //TODO
        }

    }   

    const app = {
        id: '',
        name: '',
        currentCommandLanguage: '',
        currentUILanguage: '',

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
            window.addEventListener('popstate', () => {
	            app.onUrlChanged();
            });
        },

        onUrlChanged: function () {
            console.log(`onUrlChanged ${window.location.href}`);
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
            } else if (window.location.href.startsWith('https://gemini.google.com/app')) {
                app.name = 'Gemini';
	            app.id = 'gemini';
            } else if (window.location.href.startsWith('https://copilot.microsoft.com/')) {
                app.name = 'Copilot';
	            app.id = 'copilot';
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
    
    var inputField = /** @type {HTMLElement} */ (null);
    var recordButton = /** @type {HTMLElement} */ (null);

    var _isRecording = false; // Track if the recording is active
    var _isContinuous = false; // Track if continuous recording is active    
    var _finalTranscript = ''; // Store the final transcript
    var _lastFinalTranscript = Date.now();
    var _lastInterimTranscript = ''; // Store the last interim result to avoid repetition
    var _commandTimeout; // Store the timeout ID for command checking
    var _autoPunctuation = false;
    var _forceListen = false;
    var _pause = false;
    var _isDomChanging = false;
    var _autoStopped = false;

    // Function to insert the speech button
    function insertSpeechButton() {
        if (querySelector(def.buttonSelector)) return false;
        console.log('insertSpeechButton');
        if (!insert()) return false;
        recordButton = querySelector(def.buttonSelector);
        recordButton.addEventListener('click', onRecordButtonClick);
        console.log('Microphone button inserted');
        return true;

        function insert() {
	        //const container = querySelector(def.buttonContainerSelector);
	        //if (!container) { console.log(`Element not found "${def.buttonContainerSelector}"`); return false; }
            const neighbor = querySelector(def.buttonNeighborSelector);
	        if (!neighbor) { console.log(`Element not found "${def.buttonNeighborSelector}"`); return false; }
            //const placeholder = document.createElement('placeholder');
            //neighbor.parentElement.insertBefore(placeholder, neighbor);
            _isDomChanging = true; // suppresses our MutationObserver
            // ERROR: This document requires 'TrustedHTML' assignment. (app.id: gemini)
            // placeholder.outerHTML = policy.createHTML(def.buttonHTML);
            //fallback: placeholder.replaceWith(createSpeechButtonFallback()); // partial use def.buttonHTML!
            const container = neighbor.parentElement;
            const elements = createElementsFromHtml(def.buttonHTML);
            container.insertBefore(elements, neighbor);

            _isDomChanging = false;
	        return true;
        }
    }

    function createSpeechButtonFallback() {
	    // Button-Element erstellen
	    var button = document.createElement('button');
	    button.id = 'speechRecognitionButton';
	    button.className = 'btn-icon';
	    button.style.border = 'none';
	    button.style.background = 'none';
	    button.style.cursor = 'pointer';
	    button.style.marginLeft = '5px';
	    button.style.padding = '0';

	    // SVG-Element erstellen
	    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	    svg.setAttribute('width', '24');
	    svg.setAttribute('height', '24');
	    svg.setAttribute('viewBox', '0 0 24 24');
	    svg.setAttribute('fill', 'none');
	    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

	    // Pfad-Element erstellen
	    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
	    path.setAttribute('fill-rule', 'evenodd');
	    path.setAttribute('clip-rule', 'evenodd');
	    path.setAttribute('d', 'M12 2C7.582 2 4 5.582 4 10V14C4 18.418 7.582 22 12 22C16.418 22 20 18.418 20 14V10C20 5.582 16.418 2 12 2ZM12 20C8.686 20 6 17.314 6 14V10C6 6.686 8.686 4 12 4C15.314 4 18 6.686 18 10V14C18 17.314 15.314 20 12 20ZM12 6C10.895 6 10 6.895 10 8V14C10 15.105 10.895 16 12 16C13.105 16 14 15.105 14 14V8C14 6.895 13.105 6 12 6Z');
	    path.setAttribute('fill', 'currentColor');

	    // Pfad-Element zum SVG hinzufügen
	    svg.appendChild(path);

	    // SVG zum Button hinzufügen
        button.appendChild(svg);

        var match = def.buttonHTML.match(/<button([^>]*)>/);
        if (match) {
            var attributes = match[1];
            var classMatch = attributes.match(/class="([^"]+)"/);
            if (classMatch) button.className = classMatch[1];
            var styleMatch = attributes.match(/style="([^"]+)"/);
            if (styleMatch) button.style.cssText = styleMatch[1]; 
        }

        return button;
    }

    /** Instance of SpeechRecognition @type {SpeechRecognition} */
    var _recognition; // Declare _recognition globally for cancellation

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

    function onRecordButtonClick(e) {
        console.log('onRecordButtonClick');
        e.preventDefault(); // Prevents standard actions such as sending the text
        e.stopPropagation(); // Stops the propagation of events that could lead to transmission

        _pause = false;
        if (_isRecording) stopRecording(); else startContinuousRecording();
    }

    function startContinuousRecording() {
        console.log('startContinuousRecording');
        if (!_recognition) { console.warn('Speech recognition not initialized.'); return; }
        _lastFinalTranscript = Date.now();
        _recognition.continuous = true; // Enable continuous mode
        _finalTranscript = ''; // Clear the final transcript
        _lastInterimTranscript = ''; // Clear interim result buffer
        _recognition.start();
        recordButton.style.color = 'red';
        _isContinuous = true; _forceListen = true;
        _isRecording = true; // Mark recording as active
        _pause = false;
        _autoStopped = false;
    }

    function stopRecording(cancel) {
        console.log('stopRecording '+ (cancel ? 'abort' : ''));
        if (_recognition) { if (cancel) _recognition.abort(); else _recognition.stop(); }
        recordButton.style.color = '';
        _isContinuous = false; _forceListen = false;
        _isRecording = false;
        _lastInterimTranscript = '';
        _finalTranscript = '';
        _pause = false;
        _autoStopped = false;
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
	    ['2600',  '☀', 'sun|son', 'sonne'],
	    ['1f62d', '😭', 'crying', 'heulen'],
	    ['1f642', '🙂', 'smile',  'lächeln'],
	    ['1f603', '😃', 'laugh',  'lachen'],
	    ['1f60e', '😎', 'cool',   'cool']
    ];

    /** emoji dictionary  @type { Object < string, string[] >} */
    var emojis = { example: ['2764', '❤️']}; // example content

    /** Creates the emojis dictionary based on the specified language*/
    function translateEmojis(lang) {
	    emojis = {};
	    var langIndex = supportedLanguages.indexOf(lang);
        if (langIndex === -1) {
            console.warn(`Language "${lang}" not supported. Fallback to "en-US".`);
            langIndex = 0; //en-US
	    }
	    emojisDef.forEach(emoji => {
		    var keys = emoji[langIndex+2].split('|');
		    keys.forEach(key => {
			    emojis[key] = [emoji[0], emoji[1]];
		    });
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

        const lastNode = getLastTextNodeOrParent();
        let lastText = '';
        if (lastNode) {
            // chatgpt, gemini:
            if (lastNode.nodeName === 'P' && lastNode instanceof HTMLElement) {	            
                if (lastNode.classList.contains('placeholder')) lastText = '';// chatgpt
                else lastText = lastNode.innerText.trim();
            }
            // telegram:
            else if (lastNode.nodeType === Node.TEXT_NODE) lastText = lastNode.textContent.trim();
            // copilot:
            else if (lastNode instanceof HTMLTextAreaElement) lastText = lastNode.value;
            // unknown:  div           
        }

        if (_lastInterimTranscript) { // restore currentText w/o interim transcript
            const t = trimEndSpace(lastText);
            lastText = trimEndSpace(t.slice(0, t.length - trimEndSpace(_lastInterimTranscript).length));
            if (lastText.length > 0 && !lastText.endsWith('\n')) lastText += ' ';
            _lastInterimTranscript = '';
        }

        if (interimTranscript) {
            console.log(`Interim: "${interimTranscript}"`);
            _lastInterimTranscript = interimTranscript + ' ';
            updateContent(lastNode, lastText + _lastInterimTranscript);
        }

        if (_finalTranscript) {
            console.log(`Final:    "${_finalTranscript}"`);
            if (!_autoPunctuation && /[.,:;!?]$/.test(_finalTranscript)) _autoPunctuation = true;
            Object.keys(replacements).forEach(function (key) {
                const escapedKey = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                const pattern = new RegExp(`\\b${escapedKey}\\b`, 'gi');
                _finalTranscript = _finalTranscript.replace(pattern, replacements[key]);
            });
            _lastInterimTranscript = '';
            _lastFinalTranscript = Date.now();

            if (checkForCommand(lastText, _finalTranscript)) {
                _recognition.stop(); // auto restart the _recognition process
            } else {
                if (_pause) updateContent(lastNode, lastText);
                else appendContent(lastNode, lastText, _finalTranscript);
            }
            _finalTranscript = '';
        }

        notifyInputChanged();
    };

    /* chatgpt empty inputField
<div contenteditable="true" translate="no" class="ProseMirror" id="prompt-textarea">
    <p data-placeholder="Sende eine Nachricht an ChatGPT" class="placeholder">
        <br class="ProseMirror-trailingBreak">
    </p>
</div>
     */

    /**
     * 
     * @returns {HTMLElement|Node}
     */
    function getLastTextNodeOrParent() {
        if (!inputField) return null;
        if (inputField.nodeName === 'TEXTAREA') return inputField; // copilot
        const lastChild = inputField.lastChild;	   
        if (!lastChild) return inputField;
        if (lastChild.nodeType === Node.TEXT_NODE) return lastChild;
        if (lastChild.nodeName !== 'P') return inputField;
        // <P>
        if (!lastChild.lastChild) return lastChild;
        if (lastChild.lastChild.nodeType === Node.TEXT_NODE) return lastChild.lastChild;
        return lastChild;
    }

    // Funktion, um den Text im letzten Knoten zu aktualisieren oder neuen Textknoten hinzuzufügen
    function updateContent(node, newText) {
        newText = newText.trimEnd(' ') + ' ';

        if (inputField instanceof HTMLTextAreaElement) inputField.value = newText;
        else if (node?.nodeType === Node.TEXT_NODE) node.textContent = newText;
        else if (node?.nodeName === 'P') {
            node.removeAttribute('placeholder'); // chatgpt   
            if(node.lastChild?.nodeType === Node.TEXT_NODE) node.lastChild.textContent = newText;
            else node.appendChild(document.createTextNode(newText));
        } 
        else inputField.appendChild(document.createTextNode(newText));
    }

    function appendContent(node, lastText, newText) {
        console.log(`appendContent "${lastText}" "${newText}"\n  ${node?.textContent}`);
        
        newText = lastText + newText.trimEnd(' ') + ' ';

        if (inputField instanceof HTMLTextAreaElement) { // copilot
            inputField.value = newText;
        } else if (node && node.nodeType === Node.TEXT_NODE) {
            node.textContent = newText;
        } else if (node instanceof HTMLParagraphElement) {
            const lastNode = node.lastChild;
            if (lastNode.nodeType === Node.TEXT_NODE) lastNode.textContent = newText;
            else node.appendChild(document.createTextNode(newText));
        } else {
            inputField.appendChild(document.createTextNode(newText)); 
        }        
    }

    // NOTE: execCommand insertText, delete, insertLineBreak are required to support copilot
    // other methods don't trigger the required event.
    function insertTextCommand(text) {
	    inputField.focus();
	    /** @type {any} */ (document).execCommand('insertText', false, text);
    }
    function deleteTextCommand() {
        inputField.focus();
        /** @type {any} */ (document).execCommand('delete');
    }
    function insertLineBreakCommand() {
        inputField.focus();
        /** @type {any} */ (document).execCommand('insertLineBreak');
    }


    function notifyInputChanged() {
        inputField.focus();

        if (inputField instanceof HTMLTextAreaElement) { // copilot
            if (inputField.value.length > 0) {
                const lastChar = inputField.value.slice(-1);
                inputField.value = inputField.value.slice(0, -1);
                if (lastChar === '\n') insertLineBreakCommand();
                else insertTextCommand(lastChar);
            } else {
	            inputField.value = ' ';
                deleteTextCommand();
            }
        } else {
	        const event = new Event('input', { bubbles: true });
	        inputField.dispatchEvent(event);
        }

        setCursorToEnd();
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
        // ReSharper disable StringLiteralTypo
        // replacements      en-US                      de-DE                 fr-FR                           it-IT
        '...':             ['three dots',              'Drei Punkte'        ,'Trois points'                 ,'tre puntini'],            
        '.':               ['dot',                     'Punkt'              ,'Point'                        ,'punto'],
	    ',':               ['comma',                   'Komma'              ,'Virgule'                      ,'virgola'],
	    '?':               ['question mark',           'Fragezeichen'       ,"Point d'interrogation"        ,'punto interrogativo'],
	    '???':             ['three question marks',    'Drei fragezeichen'  ,"Trois points d'interrogation" ,'tre punti interrogativi'],
	    '!':               ['exclamation mark',        'Ausrufezeichen'     ,"Point d'exclamation"          ,'punto esclamativo'],
	    '!!!':             ['three exclamation marks', 'Drei Ausrufezeichen',"Trois points d'exclamation"   ,'tre punti esclamativi'],
	    '-':               ['dash',                    'Bindestrich'        ,"Trait d'union"                ,'trattino'],
	    ':':               ['colon',                   'Doppelpunkt'        ,'Deux points'                  ,'due punti'],
        // commands          en-US                      de-DE                 fr-FR                           it-IT
	    'Delete-Word':     ['delete',                  'Löschen'            ,'Supprimer'                    ,'cancella'],
        'Delete-Sentence': ['delete sentence',         'Satz löschen'       ,'Supprimer la phrase'          ,'cancella frase'],
        'Delete-Paragraph':['delete paragraph',        'Absatz löschen'     ,'Supprimer le paragraphe'      ,'cancella paragrafo'],
	    'Delete-All':      ['delete all',              'Alles löschen'      ,'Tout supprimer'               ,'cancella tutto'],
        'New-Paragraph':   ['new paragraph',           'Neuer Absatz'       ,'Nouveau paragraphe'           ,'nuovo paragrafo'],
	    'Undo':            ['undo',                    'Rückgängig'         ,'Annuler'                      ,'annulla'],
	    'Send':            ['send',                    'Senden'             ,'Envoyer'                      ,'invia'],
	    'Listen':          ['listen',                  'Zuhören'            ,'Écouter'                      ,'ascolta'],
	    'EndVoiceInput':   ['end',                     'Ende|Beenden'       ,'Fin'                          ,'fine'],
        'Pause':           ['pause',                   'Pause'              ,'Pause'                        ,'pausa'],
        // prefix commands:
        'NavigateTo':      ['navigate to*'            ,'navigiere zu*'      ,'naviguer vers*'               ,'Naviga verso*'],
        'Emoji':           ['emoji*'                  ,'emoji*|Äh Mutti*'   ,'emoji*'                       ,'emoji*']
        // ReSharper restore StringLiteralTypo
    };

    /** commands dictionary  @type { Object < string, string >} */
    const commands = {};

    const navigateDef = {
        'https://web.telegram.org/'     : ['telegram'  , 'telegramm|telegram', 'telegram|Télégramme','telegram|telegramma'],
        'https://gemini.google.com/'    : ['gemini'    , 'gemini'            , 'gemini'  , 'gemini'],
        'https://copilot.microsoft.com/': ['copilot'   , 'copilot'           , 'copilot|Que pilot' , 'copilot'],
        'https://chatgpt.com/'          : ['chatgpt'   , 'chatgpt'           , "chatgpt|S'agit PT" , 'chatgpt'],
        '$GM_favorite1'                 : ['favorite 1', 'favorit 1'         , 'Favori 1', 'Preferito 1'],
        '$GM_favorite2'                 : ['favorite 2', 'favorit 2'         , 'Favori 2', 'Preferito 2'],
        '$GM_favorite3'                 : ['favorite 3', 'favorit 3'         , 'Favori 3', 'Preferito 3']
    }

    const navigations = {};

    function translateDictionary(source, dest, lang) {
	    let langIndex = supportedLanguages.indexOf(lang);
	    if (langIndex === -1) {
		    console.warn(`Language '${lang}' not supported. Fallback to 'en-US'.`);
		    langIndex = 0;
	    }
        for (const [command, voiceCommandTable] of Object.entries(source)) {
		    const voiceCommands = voiceCommandTable[langIndex].toLowerCase().split('|');
            voiceCommands.forEach(cmd => {
                cmd = cmd.replace(/[.,!?\s]/g, ' ').replace(/\s+/g, ' ');
                dest[cmd] = command;
            });
	    }
    }

    /** Checks if a command is present in the current text.
     * @param {string} currentText - Current text (from last text node) without command
     * @param {string} transcript - The newly recognized text to be checked.
     * @returns {boolean} - Returns true if a command is found, otherwise false.
     */
    function checkForCommand(currentText, transcript) {
        // french: protected space bevor punctuation
        var cleanedTranscript = transcript.toLowerCase().replace(/[.,:;!?\s]/g, ' ').replace(/\s+/g, ' ').trim();
        console.log(`checkForCommand? "${cleanedTranscript}"`);

        for (const [key, command] of Object.entries(commands)) {
	        if (!key.endsWith('*')) continue;
            const prefix = key.slice(0, -1);
            if (cleanedTranscript.startsWith(prefix)) {
	            const rest = cleanedTranscript.slice(prefix.length).trim();	            
                console.log(`'${cleanedTranscript}' matched with key '${key}'`);
                switch (command) {
                    case 'NavigateTo': if (navigateTo(currentText, rest)) return true; break;
                    case 'Emoji'     : if (appendEmoji(currentText, rest)) return true; break;
                }
	        }
        }

        const command = commands[cleanedTranscript];
        if (!command) return false;

        updateContent(inputField.lastChild, currentText); // remove the command from inputField
        notifyInputChanged();

        if (command === 'Delete-Word') {
            console.log('command DELETE');
            deleteLastWord();
            setCursorToEnd();
        } else if (command === 'Delete-Sentence') {
	        console.log(`command ${command}`);
            deleteLastSentence();
            notifyInputChanged();
        } else if (command === 'Delete-Paragraph') {
	        console.log(`command ${command}`);
            deleteLastParagraph();
            setCursorToEnd();
        } else if (command === 'Delete-All') {
            console.log(`command ${command}`);
            deleteTextCommand();
        } else if (command === 'New-Paragraph') {
            console.log(`command ${command}`);
            appendParagraph();
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
            appendPunctuation(command);
            notifyInputChanged();
        }

        setCursorToEnd();
        return true;
    }

    function appendEmoji(currentText, key) {
	    key = key.toLowerCase();
	    if (!emojis[key]) {
            console.log(`appendEmoji '${key}' not found`);
		    return false;
	    }
        console.log(`appendEmoji '${key}'`);
        const node = getLastTextNodeOrParent();

        if (node instanceof HTMLTextAreaElement) { // copilot
            const textarea = node;
            const emoji = def.getEmojiHTML(emojis[key]); // plain text expected (unicode char)
            currentText = trimEndSpace(currentText);
            if (currentText.length > 0 && currentText.slice(-1) !== '\n') currentText += ' ';
            textarea.value = `${currentText}${emoji} `;
            notifyInputChanged();
            return true;
        }

        if (node && currentText != null) node.textContent = currentText; // remove emoji command

        const emoji = createElementsFromHtml(def.getEmojiHTML(emojis[key]));

        if (node && node.nodeType === Node.TEXT_NODE) {
            if (emoji instanceof String) node.textContent += emoji;
            else if (emoji.nodeType === Node.TEXT_NODE) node.textContent += emoji.textContent;
		    else node.parentNode.appendChild(emoji);
	    } else if (node && node.nodeName === 'P') {
		    node.appendChild(emoji);
	    } else {
		    inputField.appendChild(emoji);
	    }
	    return true;
    }

    function navigateTo(currentText, transcriptEnd) {
        var dest = navigations[transcriptEnd];
        if (!dest) return false;
		if (dest.startsWith('$GM_')) {
			const gmKey = dest.slice(4);
			const gmValue = gm.getValue(gmKey, null); // Reads the value with GM_getValue
			if (!gmValue) return true; // found but not configured
			dest = gmValue;
		}
		updateContent(inputField.lastChild, currentText); // remove the command from inputField
        notifyInputChanged();
        stopRecording(true);
		//window.location.href = dest;
        //window.open(dest, new URL(dest).hostname.replace(/\./g, '-')); // use same tab for same hostname, does not work
        window.open(dest, '_blank');
        if (new URL(dest).hostname === location.hostname) window.close();
		return true;
    }

    function appendParagraph() {        
	    // Simulate pressing Ctrl + Enter does work in chatgpt, but not in telegram
        if (app.id === 'chatgpt') {
            // direct DOM manipulation to insert <p> seems to send the message immediately, so use KeyboardEvent
            const event = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true, shiftKey: true });
            inputField.dispatchEvent(event);
        } else if (inputField instanceof HTMLTextAreaElement) { // except copilot
            inputField.value += '\n';
            notifyInputChanged();
        } else if (app.id === 'gemini') {
            // manuell input (Shift+Enter )creates `<p><br/></p>` The <br> is temporary until tha <p> becomes content.
            inputField.appendChild(document.createElement('p'));
            inputField.lastChild.appendChild(document.createElement('br'));
	    } else {
            // inputField.innerHTML = inputField.innerHTML.trimEnd() + "<br/>\n
		    const n = inputField.lastChild;
		    if (n.nodeType === Node.TEXT_NODE) n.textContent = n.textContent.trimEnd();
		    inputField.appendChild(document.createElement('br'));
		    inputField.appendChild(document.createTextNode('\n'));
	    }
    }

    /** Deletes the last word or punctuation (incl. non-text node) */
    function deleteLastWord() {
        console.log('deleteLastWord');
        console.log(`"${inputField.innerText}"`);

        if (inputField.nodeName === 'TEXTAREA') { // copilot
            const textarea = /** @type {HTMLTextAreaElement} */ (inputField);
            let text = trimEndSpace(textarea.value);
            if (text.length === 0) { textarea.setRangeText('', 0, textarea.value.length, 'end'); return; }
            if (text.slice(-1) === '\n') { textarea.setRangeText('', textarea.value.length - 1, textarea.value.length, 'end'); return; }
            const match = _autoPunctuation
	            ? text.match(/\S+$/) // with autoPunctuation we will delete the word AND punctuation at once
	            : text.match(/[.,!?;:(){}\[\]'"<>]+$/) || text.match(/\S+$/);
            if (!match) return;
            text = text.substring(0, text.length - match[0].length).trimEnd();
            const s = text.length === 0 || text.slice(-1) === '\n' ? '' : ' ';
            textarea.setRangeText(s, text.length, textarea.value.length, 'end');
            return;
        }

        var paragraph = /** @type {HTMLElement} */ (inputField);
        while (true) {
            const lastNode = paragraph.lastChild;
            if (!lastNode) {
                if (paragraph.nodeName === 'P') paragraph.remove();
                return;
            } else if (lastNode instanceof HTMLParagraphElement) {
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

        if (inputField.nodeName === 'TEXTAREA') { // copilot
            const textarea = /** @type {HTMLTextAreaElement} */ (inputField);
            const text = textarea.value;
            const lastIndex = text.lastIndexOf('\n');
            if (lastIndex !== -1) textarea.setRangeText('', lastIndex, text.length, 'end');
            else textarea.setRangeText('', 0, text.length, 'end');
        }

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

        if (inputField.nodeName === 'TEXTAREA') { // copilot
	        const textarea = /** @type {HTMLTextAreaElement} */ (inputField);
            let text = textarea.value.replace(/[.?!\s]*$/, '').replace(/[^.?!\n]*$/, '');
            if (text.length > 0 && text.slice(-1) !== '\n') text += ' ';
            textarea.value = text;
            return;
        }

        let deleted = false;
        // Delete backwards through the nodes until a text node with a punctuation mark or other paragraph is found
        var paragraph = inputField;
        while (paragraph.childNodes.length > 0) {
            const lastNode = paragraph.lastChild;
            if (/*P*/lastNode instanceof HTMLParagraphElement) {
                if (deleted) return;
                paragraph = lastNode;
                continue;
            } else if (/*BR*/lastNode instanceof HTMLBRElement) {
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

    function appendPunctuation(punctuation) {
        if (inputField instanceof HTMLTextAreaElement) { // copilot
            inputField.value = trimEndSpace(inputField.value) + punctuation + ' ';
            return;
        }
        const nodes = inputField.childNodes;
        const lastNode = nodes[nodes.length - 1];
        lastNode.textContent = lastNode.textContent.trimEnd() + punctuation + ' ';
    }

    function setCursorToEnd() {
        if (inputField.nodeName === 'TEXTAREA') {
	        const textarea = /** @type {HTMLTextAreaElement} */ (inputField);
            textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
            textarea.focus();
        } else {
            const range = document.createRange();
            const selection = window.getSelection();
            range.selectNodeContents(inputField);
            range.collapse(false); // Place cursor at the end
            selection.removeAllRanges();
            selection.addRange(range);
            inputField.focus(); // Focus input field again
        }
        console.log('Cursor set');
    }

    function clickSendButton() {
        const sendButton = querySelector(def.sendButtonSelector);
        if (sendButton && app.id !== 'gemini') { sendButton.click(); }
        else {
            inputField.focus();
	        const event = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true, shiftKey: false });
	        inputField.dispatchEvent(event);
        }
    }

    function querySelector(selector) {
        if (typeof selector === 'function') {
            return selector();
	    }
        return document.querySelector(selector);
    }

    function disableRecordButton(reason) {
        if (!recordButton) return;
        recordButton.style.color = 'gray';
        recordButton.title = reason;
        recordButton.removeEventListener('click', onRecordButtonClick);
    }

    function checkMicrophoneAccessAsync() {
	    var microphonePermissionGranted = null;
	    navigator.mediaDevices.getUserMedia({ audio: true })
		    .then((stream) => {
			    console.log('Microphone access allowed');
			    microphonePermissionGranted = true;
			    stream.getTracks().forEach(track => track.stop());
		    })
		    .catch(() => {
                console.error('Microphone access denied. Speech recognition not possible!');
                disableRecordButton('Speech recognition not possible! Microphone access denied.');
			    microphonePermissionGranted = false;
		    });
    }

    function tryCall(f) {
	    try { return f(); } catch (error) { return null; }
    }

    function detectLanguage() {
        let lang = 'en-US';
        var log = '';
        if (recognitionLanguage === 'auto') {            
            const text = tryCall(() => def.getInputFieldPlaceholderText());
            if (!text) return;
            if (text.includes('Nachricht')) lang = 'de-DE';
            else if (text.includes('eingeben')) lang = 'de-DE'; // gemini
            log = `language detected: ${lang}`;
        } else {
            lang = recognitionLanguage;
            log = `custom language selected: ${lang}`;
        }

        const commandLanguage = supportedLanguages.includes(lang) ? lang : 'en-US';
        if (app.currentCommandLanguage !== commandLanguage) {
            app.currentCommandLanguage = commandLanguage;
            translateEmojis(commandLanguage);
            translateDictionary(commandsDef, commands, commandLanguage);
            translateDictionary(navigateDef, navigations, commandLanguage);
        }
        if (_recognition?.lang !== lang) {
            initSpeechRecognition(lang);
        }
    }

    // Observe changes in the DOM to find the input container and insert the button
    const observer = new MutationObserver(function () {
        if (_isDomChanging) return;
        //console.log('DOM changed');
        if (!recordButton || !document.contains(recordButton)) {            
            if (insertSpeechButton()) {
                inputField = querySelector(def.inputFieldSelector);
                //startContinuousRecording();
            }
        }
        detectLanguage(); //TODO optimize performance
    });
    observer.observe(document.body, { childList: true, subtree: true });
    console.log('observer initialized');

    document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'hidden') {
            if (stopRecordingOnBlurOrHidden && _isRecording) {
                stopRecording();
                _autoStopped = true;
            }
        } else if (document.visibilityState === 'visible' && inputField) {
		    setCursorToEnd();
	    }
    });
    window.addEventListener('blur', function () {
	    if (stopRecordingOnBlurOrHidden && _isRecording) {
		    stopRecording();
		    _autoStopped = true;
	    }
    });
    window.addEventListener('focus', function () {
	    
    });
})();

/*
Copyright © 2024 by K5X. All rights reserved. 

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to use 
the Software, subject to the following conditions:

1. The software may not be modified, merged, published, distributed, 
sublicensed, sold, or used for any direct or indirect commercial purposes, 
including generating income, whether or not modifications have been made to 
the original code, without explicit permission from the copyright holder.
2. The above copyright notice and this permission notice shall be included 
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

This license is not a general permission that the software may be used on 
third party websites or services without prior agreement with the respective 
operators of these websites or services.

*/