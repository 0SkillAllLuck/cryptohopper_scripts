// ==UserScript==
// @name         CryptoHopper Coin List Import / Exporter
// @namespace    https://github.com/0SkillAllLuck/cryptohopper_scripts
// @updateUrl    https://github.com/0SkillAllLuck/cryptohopper_scripts/raw/main/coin-list-import-export.user.js
// @version      0.1
// @description  Add an import / export option for the coin list on the Crypto Hopper Hopper config page
// @author       0SkillAllLuck
// @match        https://www.cryptohopper.com/config
// @icon         https://www.google.com/s2/favicons?domain=www.cryptohopper.com
// @grant        GM.setClipboard
// ==/UserScript==

(function () {
    'use strict';

    function exportCoinList() {
        GM.setClipboard(jQuery('#allowed_coins').val().join(','));
        swal({ title: 'Success', text: 'Coinlist exported!', type: 'success' });
    }

    function importCoinList() {
        swal({
            title: 'Import Coinlist',
            input: 'textarea',
            text: 'Input your coinlist, comma seperated',
            inputPlaceholder: 'BTC,ETH,XRP etc.',
            showCancelButton: true,
        }).then((result) => {
            jQuery('#allowed_coins').val(result.value.split(",")).change();
            return swal({ title: 'Success', text: 'Coinlist imported!', type: 'success' });
        }).then((result) => {
            saveConfig();
        });
    }

    function addElements() {
        const exportButton = jQuery('<a href="#"><i class="fa fa-upload m-r-5"></i> Export Coinlist</a>');
        const exportButtonListItem = jQuery('<li></li>');
        exportButton.on('click', () => exportCoinList());
        exportButtonListItem.append(exportButton);

        const importButton = jQuery('<a href="#"><i class="fa fa-download m-r-5"></i> Import Coinlist</a>');
        const importButtonListItem = jQuery('<li></li>');
        importButton.on('click', () => importCoinList());
        importButtonListItem.append(importButton);

        jQuery('.page-title-box .dropdown-menu').append(exportButtonListItem);
        jQuery('.page-title-box .dropdown-menu').append(importButtonListItem);
    }

    jQuery(document).ready(() => addElements());
})();
