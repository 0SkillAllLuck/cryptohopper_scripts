// ==UserScript==
// @name         CryptoHopper Disable Hoppie
// @namespace    https://github.com/0SkillAllLuck/cryptohopper_scripts
// @updateUrl    https://github.com/0SkillAllLuck/cryptohopper_scripts/raw/main/disable-hoppie.user.js
// @version      0.1
// @description  Disabled (hides) Hoppie on all cryptohopper pages
// @author       0SkillAllLuck
// @match        https://www.cryptohopper.com/*
// @icon         https://www.google.com/s2/favicons?domain=www.cryptohopper.com
// @grant        GM_addStyle
// ==/UserScript==

(function () {
  "use strict";

  jQuery(() => {
    GM_addStyle(`
      img.hoppie-paperclip,
      img.hoppiePaperclipAnimation,
      div.hoppie-speech-container {
        display: none !important;
      }
    `);
  });
})();
