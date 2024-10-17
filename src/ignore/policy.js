/* global copilotTrustedTypesPolicy */

/** An object containing sanitization methods for different types of content. @type {TrustedTypePolicy} */
const policy = (function () {
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
            } catch (ex) { console.warn(ex); }
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