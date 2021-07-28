// ==UserScript==
// @name         CryptoHopper Backtest multiple settings
// @namespace    https://github.com/0SkillAllLuck/cryptohopper_scripts
// @updateUrl    https://github.com/0SkillAllLuck/cryptohopper_scripts/raw/main/backtest-multiple-settings.user.js
// @version      0.2
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
            redrawChart("nottest")) : "resettradestest" == d.type ? (jQuery("#result_trades_table_test tbody tr").remove(), result_chart_data_markings = [], redrawChart("test")) : "result" == d.type ? outputBackTest(d.result) : "resulttest" == d.type ? outputConfigTest(d.result) : "error" == d.type && backtestErrorMessage(d.error)

        if (d.type == "result" || d.type == "resulttest") {
            let config = JSON.parse(jQuery('#multiConfig').val());
            const tps = config.tpList.length;
            const sls = config.tpList.length;
            const tsls = config.tpList.length;
            const arms = config.armList.length;
            const tsbs = config.tsbList.length;
            const totalBacktests = (tps > 0 ? tps : 1) * (sls > 0 ? sls : 1) * (tsls > 0 ? tsls : 1) * (arms > 0 ? arms : 1) * (tsbs > 0 ? tsbs : 1);

            config.tpIndex += 1;
            if (config.tpIndex >= tps) {
                config.tpIndex = 0;
                config.slIndex += 1;
                if (config.slIndex >= sls) {
                    config.slIndex = 0;
                    config.tslIndex += 1;
                    if (config.tslIndex >= tsls) {
                        config.tslIndex = 0;
                        config.armIndex += 1;
                        if (config.armIndex >= arms) {
                            config.armIndex = 0;
                            config.tsbIndex += 1;
                            if (config.tsbIndex >= tsbs) {
                                swal({ title: 'Success', text: 'Backtest completed, all settings were tested!', type: 'success' });
                                return;
                            }
                        }
                    }
                }
            }
            jQuery('#multiConfig').val(JSON.stringify(config)).change();
            if (config.tpList.length > 0) {
                jQuery("#percentage_profit_test").val(config.tpList[config.tpIndex]).change();
            }
            if (config.slList.length > 0) {
                jQuery("#stop_loss_percentage_test").val(config.slList[config.slIndex]).change();
            }
            if (config.tslIndex.length > 0) {
                jQuery("#stop_loss_trailing_percentage_test").val(config.tsList[config.tslIndex]).change();
            }
            if (config.armList.length > 0) {
                jQuery("#stop_loss_trailing_arm_test").val(config.armList[config.armIndex]).change();
            }
            if (config.tsbList.length > 0) {
                jQuery("#trailing_buy_percentage_test").val(config.tsbList[config.tsbIndex]).change();
            }

            const current = (config.tsbIndex * arms * tsls * sls * tps) + (config.armIndex * tsls * sls * tps) + (config.tslIndex * sls * tps) + (config.slIndex * tps) + config.tpIndex;
            const percent = 100 * current / totalBacktests;

            jQuery('#multiStatus').html('<strong>' + percent + '%</strong> backtested: ' + current + '/' + totalBacktests)
            setTimeout(function () { startBackTestConfig(); }, 2000);
        }
    }

    function split(input) {
        if (input == undefined || input.trim() === '') {
            return []
        }
        if (input.includes(',')) {
            return input.split(',');
        }

        const inputParts = input.split('|');
        const range = inputParts[0].split('-');
        const down = parseFloat(range[0]);
        const up = parseFloat(range[1]);
        const step = parseFloat(inputParts[1]);
        
        let current = down;
        let steps = [];
        while (current < up) {
            steps.push(current.toString());
            current += step;
        }
        return steps
    }

    function doBacktestMultipleSettings() {
        swal({
            title: 'Options',
            html:
                '<input id="swal-input-tp" class="swal2-input" placeholder="TP List, either comma sperated or like "0.0-2.0|0.1">' +
                '<input id="swal-input-sl" class="swal2-input" placeholder="SL List, either comma sperated or like "0.0-2.0|0.1">' +
                '<input id="swal-input-tsl" class="swal2-input" placeholder="TSL List, either comma sperated or like "0.0-2.0|0.1">' +
                '<input id="swal-input-arm" class="swal2-input" placeholder="TSL Arm List, either comma sperated or like "0.0-2.0|0.1">' +
                '<input id="swal-input-tsb" class="swal2-input" placeholder="TSB List, either comma sperated or like "0.0-2.0|0.1">',
            showCancelButton: true,
            preConfirm: () => {
                return {
                    tp: document.getElementById('swal-input-tp').value,
                    sl: document.getElementById('swal-input-sl').value,
                    tsl: document.getElementById('swal-input-tsl').value,
                    arm: document.getElementById('swal-input-arm').value,
                    tsb: document.getElementById('swal-input-tsb').value,
                }
            }
        }).then((result) => {
            if (result.dismiss == 'overlay' || result.dismiss == 'cancel' || !result.value) {
                return result;
            }

            let config = {
                tpList: split(result.value.tp),
                tpIndex: 0,
                slList: split(result.value.sl),
                slIndex: 0,
                tslList: split(result.value.tsl),
                tslIndex: 0,
                armList: split(result.value.arm),
                armIndex: 0,
                tsbList: split(result.value.tsb),
                tsbIndex: 0,
            }
            jQuery('#multiConfig').val(JSON.stringify(config)).change();


            const tps = config.tpList.length;
            const sls = config.tpList.length;
            const tsls = config.tpList.length;
            const arms = config.armList.length;
            const tsbs = config.tsbList.length;
            const totalBacktests = (tps > 0 ? tps : 1) * (sls > 0 ? sls : 1) * (tsls > 0 ? tsls : 1) * (arms > 0 ? arms : 1) * (tsbs > 0 ? tsbs : 1);

            jQuery('#stop_loss_test').val((sls > 0)).change()
            jQuery('#stop_loss_trailing_test').val((tsls > 0)).change()
            jQuery('#trailing_buy_test').val((tsbs > 0)).change()

            return swal({
                type: 'question',
                title: 'Continue?',
                text: 'You will run ' + totalBacktests + ' backtests, do you want to continue?',
                showCancelButton: true,
            });
        }).then((result) => {
            if (result.dismiss == 'overlay' || result.dismiss == 'cancel' || !result.value) {
                return false;
            }

            const info = jQuery('<div class="alert alert-info alert-dismissable" id="multiStatus">Starting tests</div>');
            jQuery('#component_content > div:nth-child(5) > div').html(info)
            setTimeout(function () { startBackTestConfig(); }, 2000);

            var overrideScript = document.createElement('script');
            overrideScript.innerHTML = socketMessagesHandler.toString().replace(/([\s\S]*?return;){2}([\s\S]*)}/, '$2');
            document.body.appendChild(overrideScript);

            setTimeout(function () { startBackTestConfig(); }, 10);
        });
    }

    function addElements() {
        const config = jQuery('<input id="multiConfig" hidden></input>');
        const button = jQuery('<button type="button" class="btn btn-success btn-lg">Backtest multiple settings</button>');
        button.on('click', () => doBacktestMultipleSettings());
        jQuery('#backtest-config > div > div:nth-child(20) > div').append(config).append(button);

    }

    jQuery(document).ready(() => addElements());
})();
