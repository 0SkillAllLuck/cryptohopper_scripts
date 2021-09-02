// ==UserScript==
// @name         CryptoHopper Config Enhancements
// @namespace    https://github.com/0SkillAllLuck/cryptohopper_scripts
// @updateUrl    https://github.com/0SkillAllLuck/cryptohopper_scripts/raw/main/config-enhancements.user.js
// @version      0.1
// @description  Enhance the Config experience on Cryptohopper
// @author       0SkillAllLuck
// @match        https://www.cryptohopper.com/config
// @icon         https://www.google.com/s2/favicons?domain=www.cryptohopper.com
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// @grant        GM.setClipboard
// ==/UserScript==

(function () {
    'use strict';

    jQuery(document).ready(() => enhanceConfigPage());

    async function enhanceConfigPage() {
        const importCoinlistButton = jQuery('<a href="#"><i class="fa fa-download m-r-5"></i> Import Coinlist</a>');
        const exportCoinlistButton = jQuery('<a href="#"><i class="fa fa-upload m-r-5"></i> Export Coinlist</a>');
        importCoinlistButton.on('click', importCoinList);
        exportCoinlistButton.on('click', exportCoinList);

        jQuery('.page-title-box .dropdown-menu').append(jQuery('<li></li>').append(importCoinlistButton));
        jQuery('.page-title-box .dropdown-menu').append(jQuery('<li></li>').append(exportCoinlistButton));
    }

    async function exportCoinList() {
        GM.setClipboard(jQuery('#allowed_coins').val().join(','));
        return swal({
            type: 'success',
            title: 'Coinlist exported',
            text: "Coinlist exported to clipboard",
            showConfirmButton: false,
        })
    }

    async function importCoinList() {
        return swal({
            title: 'Import Coinlist',
            text: 'Input your coinlist, comma seperated',
            showCancelButton: true,
            input: 'textarea',
            inputPlaceholder: 'BTC,ETH,XRP etc.'
        }).then((result) => {
            jQuery('#allowed_coins').val(result.value.split(",").map(c => c.trim().toUpperCase())).change();
        }).then(() => {
            saveConfig();
        });
    }
})();
