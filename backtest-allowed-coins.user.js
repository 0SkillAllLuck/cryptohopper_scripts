// ==UserScript==
// @name         CryptoHopper Backtest allowed coins
// @namespace    https://github.com/0SkillAllLuck/cryptohopper_scripts
// @updateUrl    https://github.com/0SkillAllLuck/cryptohopper_scripts/raw/main/backtest-allowed-coins.user.js
// @version      0.2
// @description  Add a "Backtest allowed Coins" button to the Backtest Page.
// @author       0SkillAllLuck
// @match        https://www.cryptohopper.com/backtesting
// @icon         https://www.google.com/s2/favicons?domain=www.cryptohopper.com
// @grant        GM_addStyle
// ==/UserScript==

(function () {
    'use strict';


    function socketMessagesHandler(d) {
        d = JSON.parse(d);
        "chartdata" == d.type ? (result_chart_data_markings = [], drawResultChart(d, "nottest")) : "chartdatatest" == d.type ? (result_chart_data_markings = [], drawResultChart(d, "test")) : "progress" == d.type ? processProgressInfo(d, "test") : "trade" == d.type ? addTradeBacktest(d, "nottest") : "selectedtrades" == d.type ? addMultipleTradeBacktest(d, "nottest") : "selectedtradestest" == d.type ? addMultipleTradeBacktest(d, "test") : "tradetest" == d.type ? addTradeBacktest(d, "test") : "resettrades" == d.type ? (jQuery("#result_trades_table tbody tr").remove(),
    result_chart_data_markings = [],
    redrawChart("nottest")) : "resettradestest" == d.type ? (jQuery("#result_trades_table_test tbody tr").remove(),result_chart_data_markings = [],redrawChart("test")) : "result" == d.type ? outputBackTest(d.result) : "resulttest" == d.type ? outputConfigTest(d.result) : "error" == d.type && backtestErrorMessage(d.error)

        if (d.type == "result" || d.type == "resulttest") {
            const currentList = jQuery('#coinList').val().split(",");
            const currentIndex = parseInt(jQuery('#coinIndex').val());
            if (currentIndex < currentList.length) {
                jQuery('#coinIndex').val(currentIndex + 1);
                jQuery("#coin_test").val(currentList[currentIndex]).change();
                setTimeout(function(){ startBackTestConfig(); }, 2000);
            } else {
                swal({ title: 'Success', text: 'Backtest completed, all allowed coins were tested!', type: 'success' });
            }

        }
    }

    function doBacktestAllowedCoins() {
        var overrideScript = document.createElement('script');
        overrideScript.innerHTML = socketMessagesHandler.toString().replace(/([\s\S]*?return;){2}([\s\S]*)}/,'$2');
        document.body.appendChild(overrideScript);

        $.get('https://www.cryptohopper.com/config', function(configPage) {
            jQuery('#coinList').val($(configPage).find('#allowed_coins').val().join(','));
            jQuery('#coinIndex').val('1');

            jQuery("#coin_test").val(jQuery('#coinList').val().split(",")[0]).change();
            setTimeout(function(){ startBackTestConfig(); }, 250);
        });
    }

    function addElements() {
        const backtestAllowedCoinsCoinList = jQuery('<input id="coinList" hidden></input>');
        const backtestAllowedCoinsCoinIndex = jQuery('<input id="coinIndex" hidden></input>');
        const backtestAllowedCoinsButton = jQuery('<button type="button" class="btn btn-success btn-lg">Backtest allowed Coins</button>');
        backtestAllowedCoinsButton.on('click', () => doBacktestAllowedCoins());
        jQuery('#backtest-config > div > div:nth-child(1) > div').append(backtestAllowedCoinsCoinList).append(backtestAllowedCoinsCoinIndex).append(backtestAllowedCoinsButton);
    }

    jQuery(document).ready(() => addElements());
})();
