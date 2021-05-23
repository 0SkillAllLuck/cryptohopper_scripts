// ==UserScript==
// @name         CryptoHopper Backtest multiple settings
// @namespace    https://github.com/0SkillAllLuck/cryptohopper_scripts
// @updateUrl    https://github.com/0SkillAllLuck/cryptohopper_scripts/raw/main/backtest-multiple-settings.user.js
// @version      0.1
// @description  Add a "Backtest multiple settings" button to the Backtest Page.
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
            const tpList = jQuery('#tpList').val().split(",");
            const tpIndex = parseInt(jQuery('#tpIndex').val());
            const slList = jQuery('#slList').val().split(",");
            const slIndex = parseInt(jQuery('#slIndex').val());
            const tslList = jQuery('#tslList').val().split(",");
            const tslIndex = parseInt(jQuery('#tslIndex').val());

            if (tpIndex < tpList.length) {
                jQuery('#tpIndex').val(tpIndex + 1);
            } else {
                jQuery('#tpIndex').val(0);
                if (slIndex < slList.length) {
                    jQuery('#slIndex').val(slIndex + 1);
                } else {
                    jQuery('#slIndex').val(0);
                    if (slIndex < slList.length) {
                        jQuery('#tslIndex').val(tslIndex + 1);
                    } else {
                        swal({ title: 'Success', text: 'Backtest completed, all settings were tested!', type: 'success' });
                        return;
                    }
                }
            }

            if (tpList.length > 0) {
                jQuery("#percentage_profit_test").val(tpList[tpIndex]).change();
            }
            if (slList.length > 0) {
                jQuery("#stop_loss_percentage_test").val(slList[slIndex]).change();
            }
            if (tslList.length > 0) {
                const tsl = tslList[tslIndex].split("-");
                jQuery("#stop_loss_trailing_percentage_test").val(tsl[0]).change();
                jQuery("#stop_loss_trailing_arm_test").val(tsl[1]).change();
            }

            console.log(tpList[tpIndex] + " " + jQuery("#percentage_profit_test").val());
            console.log(jQuery("#stop_loss_percentage_test").val());
            console.log(jQuery("#stop_loss_trailing_percentage_test").val());
            console.log(jQuery("#stop_loss_trailing_arm_test").val());
            setTimeout(function(){ startBackTestConfig(); }, 2000);
        }
    }

    function doBacktestMultipleSettings() {
        swal({
            title: 'TP Options',
            input: 'textarea',
            text: 'Input your tp list, comma seperated',
            inputPlaceholder: '0.4,0.5,1.2 etc.',
            showCancelButton: true,
        }).then((result) => {
            jQuery('#tpList').val(result.value).change();
            jQuery('#tpIndex').val("0").change();
            return swal({
                title: 'SL Options',
                input: 'textarea',
                text: 'Input your sl list, comma seperated',
                inputPlaceholder: '0.4,0.5,1.2 etc.',
                showCancelButton: true,
            });
        }).then((result) => {
            jQuery('#slList').val(result.value).change();
            jQuery('#slIndex').val("0").change();
            return swal({
                title: 'TSL Options',
                input: 'textarea',
                text: 'Input your tsl list, comma seperated. (percent first, arm second)',
                inputPlaceholder: '0.5-1.5,0.3-1.8,0.8-2.5 etc.',
                showCancelButton: true,
            });
        }).then((result) => {
            jQuery('#tslList').val(result.value).change();
            jQuery('#tslIndex').val("0").change();

            const tps = jQuery('#tpList').val().split(",").length;
            const sls = jQuery('#slList').val().split(",").length;
            const tsls = jQuery('#tslList').val().split(",").length;

            const totalBacktests = (tps > 0 ? tps : 1) * (sls > 0 ? sls : 1) * (tsls > 0 ? tsls : 1);

            return swal({
                type: 'question',
                title: 'Continue?',
                text: 'You will run ' + totalBacktests + ' backtests, do you want to continue?',
                showCancelButton: true,
            });
        }).then((result) => {
            var overrideScript = document.createElement('script');
            overrideScript.innerHTML = socketMessagesHandler.toString().replace(/([\s\S]*?return;){2}([\s\S]*)}/,'$2');
            document.body.appendChild(overrideScript);

            setTimeout(function(){ startBackTestConfig(); }, 10);
        });
    }

    function addElements() {
        const backtestTpList = jQuery('<input id="tpList" hidden></input>');
        const backtestTpIndex = jQuery('<input id="tpIndex" hidden></input>');
        const backtestSlList = jQuery('<input id="slList" hidden></input>');
        const backtestSlIndex = jQuery('<input id="slIndex" hidden></input>');
        const backtestTslList = jQuery('<input id="tslList" hidden></input>');
        const backtestTslIndex = jQuery('<input id="tslIndex" hidden></input>');
        const backtestMultipleSettingsButton = jQuery('<button type="button" class="btn btn-success btn-lg">Backtest multiple settings</button>');
        backtestMultipleSettingsButton.on('click', () => doBacktestMultipleSettings());
        jQuery('#backtest-config > div > div:nth-child(20) > div')
            .append(backtestTpList).append(backtestTpIndex)
            .append(backtestSlList).append(backtestSlIndex)
            .append(backtestTslList).append(backtestTslIndex)
            .append(backtestMultipleSettingsButton);

    }

    jQuery(document).ready(() => addElements());
})();
