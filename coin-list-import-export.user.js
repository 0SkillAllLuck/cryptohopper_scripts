// ==UserScript==
// @name         CryptoHopper Coin List Import / Exporter
// @namespace    https://github.com/0SkillAllLuck/cryptohopper_scripts
// @updateUrl    https://github.com/0SkillAllLuck/cryptohopper_scripts/raw/main/coin-list-import-export.user.js
// @version      0.3
// @description  Add an import / export option for the coin list on the Crypto Hopper Hopper config page
// @author       0SkillAllLuck
// @match        https://www.cryptohopper.com/config
// @icon         https://www.google.com/s2/favicons?domain=www.cryptohopper.com
// @grant        GM.setClipboard
// @grant        GM_addStyle
// ==/UserScript==

(function () {
    'use strict';

    function exportCoinList() {
        GM.setClipboard(jQuery('#allowed_coins').val().join(','));
        swal({
            type: 'success',
            title: 'Coinlist exported',
            text: "Coinlist exported to clipboard",
            showConfirmButton: false,
            timer: 1250,
            timerProgressBar: true,
        })
    }

    function importCoinList() {
        swal({
            title: 'Import Coinlist',
            text: 'Input your coinlist, comma seperated',
            showCancelButton: true,
            input: 'textarea',
            inputPlaceholder: 'BTC,ETH,XRP etc.'
        }).then((result) => {
            jQuery('#allowed_coins').val(result.value.split(",")).change();
        }).then(() => {
            swal({
                type: 'success',
                title: 'Coinlist imported',
                showConfirmButton: false,
                timer: 1250,
                timerProgressBar: true,
            })
        }).then(() => {
            saveConfig();
        });
    }

    function createButton(icon, text, onClick) {
        const button = jQuery('<a href="#"><i class="fa fa-' + icon + ' m-r-5"></i> ' + text + '</a>');
        const listItem = jQuery('<li></li>');
        button.on('click', onClick);
        listItem.append(button);
        return listItem;
    }

    jQuery(document).ready(() => {
        jQuery('.page-title-box .dropdown-menu').append(createButton('upload', 'Export Coinlist', () => exportCoinList()));
        jQuery('.page-title-box .dropdown-menu').append(createButton('download', 'Import Coinlist', () => importCoinList()));
    });

    jQuery(() => {
        if ($("body").hasClass("nightmode")) {
            GM_addStyle(`
                body > div.swal2-container.swal2-center.swal2-fade.swal2-shown > div {
                    background-color: #303054 !important
                }
                .swal2-title {
                    color: white !important;
                }
            `);
        }
        GM_addStyle(`
            .swal2-textarea {
                color: darkgray !important;
            }
            .swal2-textarea::placeholder {
                color: darkgray !important;
            }
        `);
    });
})();
