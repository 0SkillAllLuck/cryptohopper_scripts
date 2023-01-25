// ==UserScript==
// @name         CryptoHopper Backtesting Enhancements
// @namespace    https://github.com/0SkillAllLuck/cryptohopper_scripts
// @updateUrl    https://github.com/0SkillAllLuck/cryptohopper_scripts/raw/main/backtesting-enhancements.user.js
// @version      0.4
// @description  Enhance the Backtesting experience on Cryptohopper
// @author       0SkillAllLuck
// @match        https://www.cryptohopper.com/backtesting
// @icon         https://www.google.com/s2/favicons?domain=www.cryptohopper.com
// @grant        GM_addStyle
// @grant        GM.getValue
// @grant        GM.setValue
// ==/UserScript==

const apiActionDelay = 550;
let state = {};

(function () {
    'use strict';

    $(document).ready(() => enhanceBacktestingPage());

    async function enhanceBacktestingPage() {
        $(document).ajaxComplete(callback);

        $('#backtest-config > div > div:nth-child(1) > div')
            .append($('<input id="stateBuys" value="0" hidden></input>'))
            .append($('<input id="stateSells" value="0" hidden></input>'));

        const backtestAllowedCoinsButton = $('<button type="button" class="btn btn-success btn-lg">Backtest allowed Coins</button>');
        backtestAllowedCoinsButton.on('click', () => backtestAllowedCoins());
        backtestAllowedCoinsButton.insertAfter($('#coin_test'));

        const backtestMultipleStrategiesButton = $('<button type="button" class="btn btn-success btn-lg" disabled>Backtest multiple strategies</button>');
        backtestMultipleStrategiesButton.on('click', () => backtestMultipleStrategies());
        backtestMultipleStrategiesButton.insertAfter($('#strategy'));

        const backtestMultipleSettingsButton = $('<button type="button" class="btn btn-success btn-lg">Backtest multiple settings</button>');
        backtestMultipleSettingsButton.on('click', () => backtestMultipleSettings());
        backtestMultipleSettingsButton.insertAfter($('#submitConfigTest'));

        // TODO Stats(Drawdown, Profit, etc.) Settings

        var overrideScript = document.createElement('script');
        overrideScript.innerHTML = socketMessagesHandler.toString().replace(/([\s\S]*?return;){2}([\s\S]*)}/, '$2');
        document.body.appendChild(overrideScript);
    };

    function backtestAllowedCoins() {
        return $.get('https://www.cryptohopper.com/config', function (data) {
            const info = $('<div class="alert alert-info alert-dismissable" id="statusAllowedCoins">Starting tests</div>');
            $('#component_content > div:nth-child(5) > div').html(info);
            state = {
                mode: "allowedCoins",
                coinList: $(data).find('#allowed_coins').val(),
                coinIndex: 0
            };
            $('#statusAllowedCoins').html(`Backtesting coin: ${state.coinIndex + 1} of ${state.coinList.length}`)
            $("#coin_test").val(state.coinList[state.coinIndex]).change();
            startBackTestConfig();
        });
    }

    function backtestMultipleStrategies() {
    }

    function backtestMultipleSettings() {
        swal({
            title: 'Options',
            html:
                '<p>Enter all values either as comma seperated lists or like 0.1-2.1|0.1</br' +
                '0.1-2.1|0.1 would test 0.1 to 2.0 in 0.1 increments</p>' +
                '<input id="muti-tp" class="swal2-input" value="' + jQuery("#percentage_profit_test").val() + '" placeholder="TP list">' +
                '<input id="muti-sl" class="swal2-input" value="' + jQuery("#stop_loss_percentage_test").val() + '" placeholder="SL list">' +
                '<input id="muti-tsl" class="swal2-input" value="' + jQuery("#stop_loss_trailing_percentage_test").val() + '" placeholder="TSL list">' +
                '<input id="muti-arm" class="swal2-input" value="' + jQuery("#stop_loss_trailing_arm_test").val() + '" placeholder="TSL Arm list">' +
                '<input id="muti-tsb" class="swal2-input" value="' + jQuery("#trailing_buy_percentage_test").val() + '" placeholder="TSB list">',
            showCancelButton: true,
            preConfirm: () => {
                return {
                    tp: document.getElementById('muti-tp').value,
                    sl: document.getElementById('muti-sl').value,
                    tsl: document.getElementById('muti-tsl').value,
                    arm: document.getElementById('muti-arm').value,
                    tsb: document.getElementById('muti-tsb').value,
                }
            }
        }).then((result) => {
            if (!result.value) return;
            state = {
                mode: "multipleSettings",
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
                current: 0,
                total: 0,
                startTime: new Date().getTime()
            }
            state.total = (state.tpList.length > 0 ? state.tpList.length : 1) *
                (state.slList.length > 0 ? state.slList.length : 1) *
                (state.tslList.length > 0 && state.armList.length > 0 ? state.tslList.length : 1) *
                (state.tslList.length > 0 && state.armList.length > 0 ? state.armList.length : 1) *
                (state.tsbList.length > 0 ? state.tsbList.length : 1);
            updateConfig();

            return swal({
                type: 'question',
                title: 'Continue?',
                text: 'You will run ' + state.total + ' backtests, do you want to continue?',
                showCancelButton: true,
            });
        }).then((result) => {
            if (!result.value) return;
            jQuery('#component_content > div:nth-child(5) > div').html(jQuery('<div class="alert alert-info alert-dismissable" id="multiStatus">Starting tests</div>'));
            startBackTestConfig();
        });
    }

    function callback(event, jqXHR, ajaxOptions) {
        if (ajaxOptions.url !== '/siteapi.php?todo=getbacktestresult' || jqXHR.status !== 200) return;

        setTimeout(function () {
            const buys = $('#stateBuys').val();
            const sells = $('#stateSells').val();
            const left = buys - sells;
            const percentage = (100 - (100 * (sells != null && sells > 0 ? sells : 0) / buys)).toFixed(2);
            $(`<p><strong>Left open:</strong> <span>${left} (${percentage} %)</span></p>)`).insertAfter($('#test_result_div > div > p:nth-child(9)'));
            // TODO Stats(Drawdown, Profit, etc.) Output

            switch (state.mode) {
                case "allowedCoins":
                    if (state.coinIndex < state.coinList.length) {
                        state.coinIndex += 1;
                        $('#statusAllowedCoins').html(`Backtesting coin: ${state.coinIndex + 1} of ${state.coinList.length}`)
                        $("#coin_test").val(state.coinList[state.coinIndex]).change();
                        setTimeout(function () { startBackTestConfig(); }, 1800);
                    } else {
                        state = {}
                        $('#statusAllowedCoins').html(`Finished backtesting allowed coins`)
                        swal({
                            type: 'success',
                            title: 'Success',
                            text: 'Backtest completed, all allowed coins were tested!'
                        });
                    }
                    break;
                case "multipleStrategies":
                    state = {}
                    break;
                case "multipleSettings":
                    state.tpIndex += 1;
                    if (state.tpIndex >= state.tpList.length) {
                        state.tpIndex = 0;
                        state.slIndex += 1;
                        if (state.slIndex >= state.slList.length) {
                            state.slIndex = 0;
                            state.tslIndex += 1;
                            if (state.tslIndex >= state.tslList.length) {
                                state.tslIndex = 0;
                                state.armIndex += 1;
                                if (state.armIndex >= state.armList.length) {
                                    state.armIndex = 0;
                                    state.tsbIndex += 1;
                                    if (state.tsbIndex >= state.tsbList.length) {
                                        swal({ title: 'Success', text: 'Backtest completed, all settings were tested!', type: 'success' });
                                        state = {}
                                        return;
                                    }
                                }
                            }
                        }
                    }
                    updateConfig();

                    const percent = 100 * ++state.current / state.total;
                    const timeSpend = ((new Date().getTime()) - state.startTime);
                    const timeTotal = ((state.total / state.current) * ((new Date().getTime()) - state.startTime));
                    const eta = (timeTotal - timeSpend) / 1000;

                    jQuery('#multiStatus').html('<strong>' + percent + '%</strong> backtested: ' + state.current + '/' + state.total + ". ETA: " + Math.round(eta) + " seconds");
                    setTimeout(function () { startBackTestConfig(); }, 1250);
                    break;
            }
            $('#stateBuys').val("0").change();
            $('#stateSells').val("0").change();
        }, 100);
    }

    function split(input) {
        if (input == undefined || input.trim() === '') {
            return []
        }
        if (input.includes('|')) {
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
        return input.split(',');
    }

    function updateConfig() {
        if (state.tpList.length > 0) {
            jQuery("#percentage_profit_test").val(state.tpList[state.tpIndex]).change();
        }

        if (((state.slList.length > 0) && !jQuery('#stop_loss_test').is(":checked"))
            || (!(state.slList.length > 0) && jQuery('#stop_loss_test').is(":checked"))) {
            jQuery('#backtest-config > div > div:nth-child(11) > div > span').click();
        }
        if (state.slList.length > 0) {
            jQuery("#stop_loss_percentage_test").val(state.slList[state.slIndex]).change();
        }

        if (((state.tslList.length > 0 && state.armList.length > 0) && !jQuery('#stop_loss_trailing_test').is(":checked"))
            || (!(state.tslList.length > 0 && state.armList.length > 0) && jQuery('#stop_loss_trailing_test').is(":checked"))) {
            jQuery('#backtest-config > div > div:nth-child(13) > div > span').click();
        }
        if (state.tslList.length > 0 && state.armList.length > 0) {
            jQuery("#stop_loss_trailing_percentage_test").val(state.tslList[state.tslIndex]).change();
            jQuery("#stop_loss_trailing_arm_test").val(state.armList[state.armIndex]).change();
        } else {
            state.tslList = [];
            state.armList = [];
        }

        if (((state.tsbList.length > 0) && !jQuery('#trailing_buy_test').is(":checked"))
            || (!(state.tsbList.length > 0) && jQuery('#trailing_buy_test').is(":checked"))) {
            jQuery('#backtest-config > div > div:nth-child(15) > div > span').click();
        }
        if (state.tsbList.length > 0) {
            jQuery("#trailing_buy_percentage_test").val(state.tsbList[state.tsbIndex]).change();
        }
    }

    function socketMessagesHandler(d) {
        d = JSON.parse(d);
        "chartdata" == d.type ? (result_chart_data_markings = [], drawResultChart(d, "nottest")) : "chartdatatest" == d.type ? (result_chart_data_markings = [], drawResultChart(d, "test")) : "progress" == d.type ? processProgressInfo(d, "test") : "trade" == d.type ? addTradeBacktest(d, "nottest") : "selectedtrades" == d.type ? addMultipleTradeBacktest(d, "nottest") : "selectedtradestest" == d.type ? addMultipleTradeBacktest(d, "test") : "tradetest" == d.type ? addTradeBacktest(d, "test") : "resettrades" == d.type ? (jQuery("#result_trades_table tbody tr").remove(),
            result_chart_data_markings = [],
            redrawChart("nottest")) : "resettradestest" == d.type ? (jQuery("#result_trades_table_test tbody tr").remove(), result_chart_data_markings = [], redrawChart("test")) : "result" == d.type ? outputBackTest(d.result) : "resulttest" == d.type ? outputConfigTest(d.result) : "error" == d.type && backtestErrorMessage(d.error)

        if (d.type == "progress") {
            let buys = $('#stateBuys').val();
            let sells = $('#stateSells').val();
            d.trades.forEach(trade => {
                if (trade.tradetype == "buy") {
                    buys++;
                }
                if (trade.tradetype == "sell") {
                    sells++;
                }
            });
            jQuery('#stateBuys').val(buys).change();
            jQuery('#stateSells').val(sells).change();
            // TODO Stats(Drawdown, Profit, etc.)
        }
    }
})();
