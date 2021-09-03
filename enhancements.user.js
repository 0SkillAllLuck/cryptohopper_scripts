// ==UserScript==
// @name         CryptoHopper Enhancements
// @namespace    https://github.com/0SkillAllLuck/cryptohopper_scripts
// @updateUrl    https://github.com/0SkillAllLuck/cryptohopper_scripts/raw/main/ch-enhancements.user.js
// @version      0.2
// @description  Enhance the Cryptohopper experience
// @author       0SkillAllLuck
// @match        https://www.cryptohopper.com/*
// @icon         https://www.google.com/s2/favicons?domain=www.cryptohopper.com
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// @grant        GM_addStyle
// @run-at       document-start
// ==/UserScript==

window.addEventListener('beforescriptexecute', function(e) {
    if (
        e.target.src == "https://wchat.freshchat.com/js/widget.js"
        || e.target.src == "https://www.cryptohopper.com/components/com_cryptohopper/assets/hoppie.min.js"
        || e.target.src == "https://www.cryptohopper.com/templates/hopper_admin/assets/js/chat.min.js"
        || e.target.src == "https://wchat.freshchat.com/js/co-browsing.js"
        || e.target.text.trim().startsWith("function initFreshChat() {")
        || e.target.text.trim().startsWith("var chat_server;")
    ) {
        e.stopPropagation();
        e.preventDefault();
    }
}, true);


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
            img.hoppie-paperclip,
            img.hoppiePaperclipAnimation,
            div.hoppie-speech-container {
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