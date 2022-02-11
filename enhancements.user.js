// ==UserScript==
// @name         CryptoHopper Enhancements
// @namespace    https://github.com/0SkillAllLuck/cryptohopper_scripts
// @updateUrl    https://github.com/0SkillAllLuck/cryptohopper_scripts/raw/main/ch-enhancements.user.js
// @version      0.3
// @description  Enhance the Cryptohopper experience
// @author       0SkillAllLuck
// @match        https://www.cryptohopper.com/*
// @icon         https://www.google.com/s2/favicons?domain=www.cryptohopper.com
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// @grant        GM_addStyle
// @run-at       document-start
// ==/UserScript==

const Event = class {
    constructor(script, target) {
        this.script = script;
        this.target = target;

        this._cancel = false;
        this._replace = null;
        this._stop = false;
    }

    preventDefault() {
        this._cancel = true;
    }
    stopPropagation() {
        this._stop = true;
    }
    replacePayload(payload) {
        this._replace = payload;
    }
};

let callbacks = [];
window.addBeforeScriptExecuteListener = (f) => {
    if (typeof f !== "function") {
        throw new Error("Event handler must be a function.");
    }
    callbacks.push(f);
};
window.removeBeforeScriptExecuteListener = (f) => {
    let i = callbacks.length;
    while (i--) {
        if (callbacks[i] === f) {
            callbacks.splice(i, 1);
        }
    }
};

const dispatch = (script, target) => {
    if (script.tagName !== "SCRIPT") {
        return;
    }

    const e = new Event(script, target);

    if (typeof window.onbeforescriptexecute === "function") {
        try {
            window.onbeforescriptexecute(e);
        } catch (err) {
            console.error(err);
        }
    }

    for (const func of callbacks) {
        if (e._stop) {
            break;
        }
        try {
            func(e);
        } catch (err) {
            console.error(err);
        }
    }

    if (e._cancel) {
        script.textContent = "";
        script.remove();
    } else if (typeof e._replace === "string") {
        script.textContent = e._replace;
    }
};
const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
        for (const n of m.addedNodes) {
            dispatch(n, m.target);
        }
    }
});
observer.observe(document, {
    childList: true,
    subtree: true,
});

window.onbeforescriptexecute = (e) => {
    if (
        e.script.src == "https://wchat.freshchat.com/js/widget.js"
        || e.script.src == "https://wchat.freshchat.com/js/co-browsing.js"
        || e.script.src == "https://cdn.cryptohopper.com/components/com_cryptohopper/assets/sharer.js"
        || e.script.src == "https://cdn.cryptohopper.com/components/com_cryptohopper/assets/tothemoon.min.js"
        || e.script.src.match("https\:\/\/cdn\.segment\.com\/.*")
        || e.script.src.match("https\:\/\/fast\.appcues\.com\/.*")
        || e.script.text.trim().startsWith("function initFreshChat() {")
        || e.script.text.trim().startsWith("var connect_chat =")
        || e.script.text.trim().startsWith("!function(){var analytics=")
    ) {
        e.stopPropagation();
        e.preventDefault();
    }
}

(function () {
    'use strict';

    jQuery(document).ready(async() => enhanceCSS());

    // --------------------------------------------
    // General stuff
    // --------------------------------------------
    async function enhanceCSS() {
        if ($("body").hasClass("nightmode")) {
            GM_addStyle(`
                body > div.swal2-container.swal2-center.swal2-fade.swal2-shown > div {
                    background-color: #303054 !important
                }
                .swal2-title {
                    color: white !important;
                }
                .swal2-content {
                    color: white !important;
                }
            `);
        }
        GM_addStyle(`
            #fc_frame {
                display: none !important;
            }
            .swal2-input,
            .swal2-textarea {
                color: black !important;
            }
            .swal2-input::placeholder,
            .swal2-textarea::placeholder {
                color: darkgray !important;
            }
        `);
    }
})();