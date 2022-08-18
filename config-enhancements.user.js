// ==UserScript==
// @name         CryptoHopper Config Enhancements
// @namespace    https://github.com/0SkillAllLuck/cryptohopper_scripts
// @updateUrl    https://github.com/0SkillAllLuck/cryptohopper_scripts/raw/main/config-enhancements.user.js
// @version      0.2
// @description  Enhance the Config experience on Cryptohopper
// @author       0SkillAllLuck
// @match        https://www.cryptohopper.com/config
// @icon         https://www.google.com/s2/favicons?domain=www.cryptohopper.com
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// @grant        GM.setClipboard
// ==/UserScript==

(function () {
    'use strict';

    jQuery(document).ready(() => enhanceConfigPage())

    async function enhanceConfigPage() {
        const importCoinlistButton = jQuery('<a href="#"><i class="fa fa-download m-r-5"></i> Import Coinlist</a>')
        const exportCoinlistButton = jQuery('<a href="#"><i class="fa fa-upload m-r-5"></i> Export Coinlist</a>')
        const calculateRiskLevelButton = jQuery('<a href="#"><i class="fa fa-check m-r-5"></i> Calculate Risk Level</a>')
        importCoinlistButton.on('click', importCoinList)
        exportCoinlistButton.on('click', exportCoinList)
        calculateRiskLevelButton.on('click', calculateRiskLevel)

        jQuery('.page-title-box .dropdown-menu').append(jQuery('<li></li>').append(importCoinlistButton))
        jQuery('.page-title-box .dropdown-menu').append(jQuery('<li></li>').append(exportCoinlistButton))
        jQuery('.page-title-box .dropdown-menu').append(jQuery('<li></li>').append(calculateRiskLevelButton))
    }

    async function exportCoinList() {
        GM.setClipboard(jQuery('#allowed_coins').val().join(','));
        return swal({
            type: 'success',
            title: 'Coinlist exported',
            text: 'Coinlist exported to clipboard',
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
            jQuery('#allowed_coins').val(result.value.split(',').map(c => c.trim().toUpperCase())).change()
        }).then(() => {
            saveConfig()
        });
    }

    async function calculateRiskLevel() {
        const isMergingOn = jQuery('#auto_merge_positions').is(':checked')
        const isDCAOn = jQuery('#auto_dca').is(':checked')

        if (isMergingOn && isDCAOn) calculateRiskLevelMergingDCA();
        if (isMergingOn && !isDCAOn) calculateRiskLevelMerging();
        if (!isMergingOn && isDCAOn) calculateRiskLevelDCA();
        if (!isMergingOn && !isDCAOn) calculateRiskLevelDefault();
    }

    async function calculateRiskLevelMergingDCA() {
        swal({
            type: 'warning',
            title: 'Validate Budget',
            text: 'Validation for Merging and DCA is currently not supported'
        })
    }

    async function calculateRiskLevelMerging() {
        const selectedCoins = jQuery('#allowed_coins').val().length
        const buyPercentAmount = jQuery('#perc_buy_amount_calculation').text()
        const buyForce = jQuery('#min_buy_amount_force').is(':checked')
        const buyMinimum = jQuery('#min_buy_amount').val()
        let buyPercent = jQuery('#perc_buy_amount_extra').val()
        if (buyForce) {
            buyPercent = buyPercent * buyMinimum / buyPercentAmount
        }

        const possibleMerges = 100 / selectedCoins / buyPercent

        let level = ""
        if (possibleMerges < 4) level = "Extremly Risky"
        else if (possibleMerges < 8) level = "Very Risky"
        else if (possibleMerges < 12) level = "Risky"
        else if (possibleMerges < 16) level = "Good"
        else if (possibleMerges < 20) level = "Safe"
        else if (possibleMerges < 24) level = "Very Safe"
        else level = "Extremly Safe"

        let type = "error"
        switch (level) {
            case "Risky":
                type = "warning"
                break
            case "Good":
            case "Safe":
                type = "info"
                break
            case "Very Safe":
            case "Extremly Safe":
                type = "success"
                break
        }

        swal({
            type: type,
            title: "Calculated Risk Level (Merging)",
            text: "Your risk level looks " + level + ". You can merge up to " + Math.round((possibleMerges + Number.EPSILON) * 100) / 100 + " times."
        })
    }

    async function calculateRiskLevelDCA() {
        const selectedCoins = jQuery('#allowed_coins').val().length
        const buyPercentAmount = jQuery('#perc_buy_amount_calculation').text()
        const buyForce = jQuery('#min_buy_amount_force').is(':checked')
        const buyMinimum = jQuery('#min_buy_amount').val()
        let buyPercent = jQuery('#perc_buy_amount_extra').val()
        if (buyForce) {
            buyPercent = buyPercent * buyMinimum / buyPercentAmount
        }

        const dcaRetries = jQuery('input[name="auto_dca_max"]').val()
        const dcaSize = jQuery('#auto_dca_size').val()
        let dcaSizeMultiplier = 0
        switch (dcaSize) {
            case 'double':
                dcaSizeMultiplier = 2
                break;
            case 'triple':
                dcaSizeMultiplier = 3
                break
            case 'custom':
                dcaSizeMultiplier = jQuery('input[name="auto_dca_size_custom"]').val() / 100
                break
        }
        const percentage = (selectedCoins * buyPercent * dcaRetries * dcaSizeMultiplier)

        let level = "error"
        if (percentage > 120) level = "Extremly Risky"
        else if (percentage > 100) level = "Very Risky"
        else if (percentage > 80) level = "Risky"
        else if (percentage > 60) level = "Good"
        else if (percentage > 40) level = "Safe"
        else if (percentage > 20) level = "Very Safe"
        else level = "Extremly Safe"

        let type = "error"
        switch (level) {
            case "Risky":
                type = "warning"
                break
            case "Good":
            case "Safe":
                type = "info"
                break
            case "Very Safe":
            case "Extremly Safe":
                type = "success"
                break
        }

        swal({
            type: type,
            title: "Calculated Risk Level (DCA)",
            text: "Your risk level looks " + level + ". You are using up to " + Math.round((percentage + Number.EPSILON) * 100) / 100 + "% of your balance."
        })
    }

    async function calculateRiskLevelDefault() {
        const selectedCoins = jQuery('#allowed_coins').val().length
        const buyPercentAmount = jQuery('#perc_buy_amount_calculation').text()
        const buyForce = jQuery('#min_buy_amount_force').is(':checked')
        const buyMinimum = jQuery('#min_buy_amount').val()
        let buyPercent = jQuery('#perc_buy_amount_extra').val()
        if (buyForce) {
            buyPercent = buyPercent * buyMinimum / buyPercentAmount
        }

        
        const percentage = (selectedCoins * buyPercent)

        let level = "error"
        if (percentage > 120) level = "Extremly Risky"
        else if (percentage > 100) level = "Very Risky"
        else if (percentage > 80) level = "Risky"
        else if (percentage > 60) level = "Good"
        else if (percentage > 40) level = "Safe"
        else if (percentage > 20) level = "Very Safe"
        else level = "Extremly Safe"

        let type = "error"
        switch (level) {
            case "Risky":
                type = "warning"
                break
            case "Good":
            case "Safe":
                type = "info"
                break
            case "Very Safe":
            case "Extremly Safe":
                type = "success"
                break
        }

        swal({
            type: type,
            title: "Calculated Risk Level (No Merging or DCA)",
            text: "Your risk level looks " + level + ". You are using up to " + Math.round((percentage + Number.EPSILON) * 100) / 100 + "% of your balance."
        })
    }
})();
