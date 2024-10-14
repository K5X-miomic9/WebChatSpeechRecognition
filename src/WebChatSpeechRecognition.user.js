// ==UserScript==
// @name         Web Chat Speech Recognition Button
// @namespace    http://tampermonkey.net/
// @version      1.83.2
// @description  Adds a speech recognition button to Telegram Web, ChatGPT
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
// @downloadURL  https://raw.githubusercontent.com/K5X-miomic9/WebChatSpeechRecognition/refs/heads/main/WebChatSpeechRecognition.user.js
// @updateURL    https://raw.githubusercontent.com/K5X-miomic9/WebChatSpeechRecognition/refs/heads/main/WebChatSpeechRecognition.user.js
// ==/UserScript==

(function () {
    'use strict';
    const version = '1.83.2'; console.log(`Script version ${version}`);
    const defaultButtonColor = '#009000';
    const defaultRecognitionLanguage = 'auto';

    window.onerror = function (e, source, line, col, error) {
	    if (e instanceof ErrorEvent) console.error(`Global error intercepted: ${e.error}\n${e.source}:${e.lineno}:${e.colno}`);
	    else console.error(`Global error intercepted: ${error}\n${source}:${line}:${col}\n${e}`);
        return false;  // but does not prevent the execution of further handlers
    };

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

    /**
    * @description An object containing sanitization methods for different types of content.
    * @typedef {Object} TrustedTypePolicy
    * @property {function(string): string} createHTML - Sanitizes HTML content.
    * @property {function(string): string} createScript - Validates or filters JavaScript content.
    * @property {function(string): string} createScriptURL - Validates or verifies script URLs.
    */

    /** An object containing sanitization methods for different types of content. @type {TrustedTypePolicy} */
    const policy = (function () {
        return null;
	    const sanitize = {
		    createHTML: (input) => {
			    // TODO DOMPurify or another validation/cleanup can be implemented here
			    return input;
		    },
		    createScript: (input) => {
			    // TODO Validation or filtering of JavaScript content
			    return input;
		    },
		    createScriptURL: (input) => {
			    // TODO Validation or verification of the URL
			    return input;
            }
	    };

        // copilot: Policy with name "default" already exists.
        // Refused to create a TrustedTypePolicy named 'default1' because it violates the following Content Security Policy directive: "trusted-types default copilotPolicy dompurify @centro/hvc-loader".
        /**@type {TrustedTypePolicy} */
        var policy;
        if (window.copilotTrustedTypesPolicy) {
	        try {
		        const placeholder = document.createElement('placeholder');
                placeholder.innerHTML = window.copilotTrustedTypesPolicy.createHTML('<p>test</p>');
                console.log('Trusted Types are activated on this page. using "copilotTrustedTypesPolicy"');
                return window.copilotTrustedTypesPolicy;
	        } catch (ex) { console.warn(ex); }
        }
        if (window.trustedTypes && window.trustedTypes.defaultPolicy) {
            policy = window.trustedTypes.defaultPolicy;
            if (policy) {
                try {
                    const placeholder = document.createElement('placeholder');
                    placeholder.innerHTML = policy.createHTML('<p>test</p>');
                    console.log('Trusted Types are activated on this page. using "default"');
                    return policy;
                } catch (ex) { console.warn(ex);}
            }
        }
        if (window.trustedTypes && window.trustedTypes.createPolicy) {
            try {
                policy = window.trustedTypes.createPolicy('dompurify', sanitize);
                console.log('Trusted Types are activated on this page. create "dompurify "');
                return policy;
            } catch (ex) {
                console.warn('Trusted Types policy "default" is not creatable. ' + ex);
                console.log(Object.keys(window));
            }
        } else {
	        console.warn('Trusted Types are not activated on this page.');
            policy = sanitize;
        }
        return policy;
    })();

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
     * @returns a DocumentFragment or throws an exception if DOMPurify not available an HtmlElement (div)
     */
    function createElementsFromHtml(html) {
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
	        let lang = prompt('Speech recognition langauge: \n(en, de, auto)', gm.getValue('recognitionLanguage', defaultRecognitionLanguage));
            if (lang) {
                switch (lang) {
                    case 'en': lang = 'en-US'; break;
                    case 'de': lang = 'de-DE'; break;
                    case 'en-US': case 'de-DE': ; break;
                    default: alert('Language not supported.'); return;
                }
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
                    <button id="speechRecognitionButton" title="Speech Regocnition" class="absolute size-10 rounded-xl fill-foreground-750 p-2 fill-foreground-800 active:text-foreground-600 active:fill-foreground-600 dark:active:text-foreground-650 dark:active:fill-foreground-650 bg-transparent hover:bg-black/5 active:bg-black/3 dark:hover:bg-black/30 dark:active:bg-black/20" style="opacity: 1; will-change: auto;">
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

    var _lang = 'en-US';

    var inputField = null;
    var recordButton = null;    

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
    var _isDomChanging = false;


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
        if (!_recognition) { console.warn("Speech recognition not initialized."); return; }
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
        if (_recognition) { if (cancel) _recognition.abort(); else _recognition.stop(); }
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

        const lastNode = getLastTextNodeOrParent();
        let lastText = '';
        if (lastNode) {
            // chatgpt, gemini:
            if (lastNode.nodeName === 'P') {	            
                if (lastNode.classList.contains('placeholder')) lastText = '';// chatgpt
                else lastText = lastNode.innerText.trim();
            }
            // telegram:
            else if (lastNode.nodeType === Node.TEXT_NODE) lastText = lastNode.textContent.trim();
            // copilot:
            else if (lastNode.nodeName === 'TEXTAREA') lastText = lastNode.value;
            // unknown:
            else { console.warn('Unknown type of input field'); return; }
        }

        if (_lastInterimTranscript) { // restore currentText w/o interim transcript
	        const t = lastText.trimEnd();
            lastText = t.slice(0, t.length - _lastInterimTranscript.trim().length).trimEnd() + ' ';
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
                var escapedKey = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                var pattern = new RegExp(`\\b${escapedKey}\\b`, 'gi');
                _finalTranscript = _finalTranscript.replace(pattern, replacements[key]);
            });
            _lastInterimTranscript = '';
            _lastFinalTranscript = Date.now();

            if (checkForCommand(lastText, _finalTranscript)) {
                _recognition.stop(); // Restart the _recognition process
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
        newText = newText.trim() + ' ';        

        if (inputField.nodeName === 'TEXTAREA') inputField.value = newText;
        else if (node?.nodeType === Node.TEXT_NODE) node.textContent = newText;
        else if (node?.nodeName === 'P') {
            node.removeAttribute('placeholder'); // chatgpt   
            if(node.lastChild?.nodeType === Node.TEXT_NODE) node.lastChild.textContent = newText;
            else node.appendChild(document.createTextNode(newText));
        } 
        else inputField.appendChild(document.createTextNode(newText));
    }

    function appendContent(node, lastText, newText) {
        console.log(`updateTextNodeContentWithEmoji "${lastText}" "${newText}"\n  ${node?.textContent}`);
        
        // "Äh, Mutti, Sonne."
        var match = /^(Emoji[.,]?|Äh[,.]?\sMutti[,.]?|Mutti[,.]?)\s+(\w+)[.,]?\s*$/i.exec(newText);
        if (match && appendEmoji(match[2], lastText)) return;

        // Den Text vorbereiten (Leerzeichen hinzufügen, wenn nötig)
        newText = lastText + newText.trim() + ' ';

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
            if (inputField.nodeName === 'TEXTAREA') { // copilot
                inputField.value = remainingText;
            } else if (node && node.nodeType === Node.TEXT_NODE) {
                node.textContent = remainingText; 
            } else if (node && node.nodeName === 'P') {
                const p = /**@type {HTMLElement}*/(node);
                const lastNode = p.lastChild;
                if (lastNode.nodeType === Node.TEXT_NODE) lastNode.textContent = remainingText;
                else p.appendChild(document.createTextNode(remainingText));
            } else {
                inputField.appendChild(document.createTextNode(remainingText)); 
            }
        }

        return;

        // Add the emoji as an HTML element
        function appendEmoji(key, currentText) {
            key = key.toLowerCase();
            if (!emojis[key]) return false;
            if (node && currentText) node.textContent = currentText; // remove emoji command

            const dummy = document.createElement('dummy');
            dummy.innerHTML = policy.createHTML(def.getEmojiHTML(emojis[key])); //TODO
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

        // copilot
        if (inputField.nodeName === 'TEXTAREA') {
            if (inputField.value.length > 0) {
                const lastChar = inputField.value.slice(-1);
                document.execCommand('insertText', false, lastChar);
            } else {
                inputField.value = ' ';
                document.execCommand('delete');
            }
            // TODO use Range and/or Selection-API instead
        } else {
	        const event = new Event('input', { bubbles: true });
	        inputField.dispatchEvent(event);
        }

        setCursorToEnd(inputField);
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
	    'Delete-Word':     ['delete',                  'löschen'            ],
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

        updateContent(inputField.lastChild, currentText); // remove the command from inputField
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
        if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
            el.selectionStart = el.selectionEnd = el.value.length;
            el.focus();
        } else {
            const range = document.createRange();
            const selection = window.getSelection();
            range.selectNodeContents(el);
            range.collapse(false); // Place cursor at the end
            selection.removeAllRanges();
            selection.addRange(range);
            el.focus(); // Focus input field again
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

    function tryCall(f) {
	    try { return f(); } catch (error) { return null; }
    }

    function detectLanguage() {
        let lang = 'en-US';
        const oldLang = _recognition ? _recognition.lang : '';

        if (recognitionLanguage === 'auto') {            
            const text = tryCall(() => def.getInputFieldPlaceholderText());
            if (!text) return;
            if (text.includes('Nachricht')) lang = 'de-DE';
            else if (text.includes('eingeben')) lang = 'de-DE'; // gemini
            if (oldLang === lang) return;
            console.log(`Language detected: ${lang}`);
            _lang = lang;
        } else {
            lang = recognitionLanguage;
            if (oldLang === lang) return;
            console.log(`cutom language selected: ${lang}`);
        }

        _lang = lang;
        translateEmojis(lang);
	    translateCommands(lang);
	    initSpeechRecognition(lang);
    }

    // Observe changes in the DOM to find the input container and insert the button
    const observer = new MutationObserver(function () {
        if (_isDomChanging) return;
        //console.log('DOM changed');
        if (!recordButton || !document.contains(recordButton)) {            
            if (insertSpeechButton()) {
                inputField = querySelector(def.inputFieldSelector);
            }
        }
        detectLanguage(); //TODO optimize performance
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