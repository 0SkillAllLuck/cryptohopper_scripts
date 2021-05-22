// ==UserScript==
// @name         CryptoHopper Backtest allowed coins
// @namespace    https://github.com/0SkillAllLuck/cryptohopper_scripts
// @updateUrl    https://github.com/0SkillAllLuck/cryptohopper_scripts/raw/main/backtest-allowed-coins.user.js
// @version      0.1
// @description  Add a "Backtest allowed Coins" button to the Backtest Page.
// @author       0SkillAllLuck
// @match        https://www.cryptohopper.com/backtesting
// @icon         https://www.google.com/s2/favicons?domain=www.cryptohopper.com
// @grant        GM_addStyle
// ==/UserScript==

var coinList =  [];
var coinIndex = 0;

(function () {
    'use strict';


    function socketMessagesHandler(d) {
        d = JSON.parse(d);
        "chartdata" == d.type ? (result_chart_data_markings = [], drawResultChart(d, "nottest")) : "chartdatatest" == d.type ? (result_chart_data_markings = [], drawResultChart(d, "test")) : "progress" == d.type ? processProgressInfo(d, "test") : "trade" == d.type ? addTradeBacktest(d, "nottest") : "selectedtrades" == d.type ? addMultipleTradeBacktest(d, "nottest") : "selectedtradestest" == d.type ? addMultipleTradeBacktest(d, "test") : "tradetest" == d.type ? addTradeBacktest(d, "test") : "resettrades" == d.type ? (jQuery("#result_trades_table tbody tr").remove(),
    result_chart_data_markings = [],
    redrawChart("nottest")) : "resettradestest" == d.type ? (jQuery("#result_trades_table_test tbody tr").remove(),result_chart_data_markings = [],redrawChart("test")) : "result" == d.type ? outputBackTest(d.result) : "resulttest" == d.type ? outputConfigTest(d.result) : "error" == d.type && backtestErrorMessage(d.error)

        if (d.type == "result" || d.type == "resulttest") {
            jQuery('#coinIndex').val(parseInt(jQuery('#coinIndex').val()) + 1);
            jQuery("#coin_test").val(jQuery('#coinList').val().split(",")[parseInt(jQuery('#coinIndex').val())]).change();
            setTimeout(function(){ startBackTestConfig(); }, 2500);
        }
    }

    function embedFunction(s) {
        document.body.appendChild(document.createElement('script')).innerHTML=s.toString().replace(/([\s\S]*?return;){2}([\s\S]*)}/,'$2');
    }

    function doBacktestAllowedCoins() {
        $.get('https://www.cryptohopper.com/config', function(configPage) {
            jQuery('#coinList').val($(configPage).find('#allowed_coins').val().join(','));
            jQuery('#coinIndex').val('0');

            jQuery("#coin_test").val(jQuery('#coinList').val().split(",")[parseInt(jQuery('#coinIndex').val())]).change();
            setTimeout(function(){ startBackTestConfig(); }, 250);
        });
    }

    function addElements() {
        embedFunction(socketMessagesHandler);

        const backtestAllowedCoinsCoinList = jQuery('<input id="coinList" hidden></select>');
        const backtestAllowedCoinsCoinIndex = jQuery('<input id="coinIndex" hidden></input>');
        const backtestAllowedCoinsButton = jQuery('<button type="button" class="btn btn-success btn-lg">Backtest allowed Coins</button>');
        backtestAllowedCoinsButton.on('click', () => doBacktestAllowedCoins());
        jQuery('#backtest-config > div > div:nth-child(1) > div').append(backtestAllowedCoinsCoinList).append(backtestAllowedCoinsCoinIndex).append(backtestAllowedCoinsButton);
    }

    jQuery(document).ready(() => addElements());
})();
