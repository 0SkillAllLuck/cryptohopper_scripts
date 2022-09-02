// ==UserScript==
// @name         Cryptohopper Dashboard Enhancements
// @namespace    https://github.com/0SkillAllLuck/cryptohopper_scripts
// @updateUrl    https://github.com/0SkillAllLuck/cryptohopper_scripts/raw/main/dashboard-enhancements.user.js
// @version      0.1
// @description  Enhance the Dashboard experience on Cryptohopper
// @author       0SkillAllLuck
// @match        https://www.cryptohopper.com/dashboard
// @icon         https://www.google.com/s2/favicons?domain=cryptohopper.com
// ==/UserScript==

(function () {
    'use strict';

    jQuery(document).ready(() => enhanceDashboardPage())

    async function enhanceDashboardPage() {
        var overrideScript = document.createElement('script');
        overrideScript.innerHTML = loadIframe.toString().replace(/([\s\S]*?return;){2}([\s\S]*)}/, '$2');
        document.body.appendChild(overrideScript);

        jQuery('#datatable-responsive tr').each(function () {
            var row = this
            jQuery(row).find('a').each(function () {
                var a = jQuery(this)
                if (!jQuery(a).hasClass('btn')) {
                    var id = row.id.split('_')[1]
                    var onClick = jQuery(a).attr('onclick')
                    var onClickParts = onClick.split('(')
                    onClick = onClickParts[0] + '(\'' + id + '\', ' + onClickParts[1]
                    var onClick = jQuery(a).attr('onclick', onClick)
                }
            });
        });
    }

    function loadIframe(position, current_market, current_coin, current_rate, current_time, current_tp_rate, current_stop_loss_rate) {
        jQuery('.iframe_coinname').text(current_coin);
        'tradingview' == use_chart_type
            ? document.getElementById('chart_iframe').src = '/chart/chart_tradingview.php?position=' + position + '&market=' + current_market + '&period=' + current_period + '&buy_rate=' + current_rate + '&buy_time=' + current_time + '&tp_rate=' + current_tp_rate + '&sl_rate=' + current_stop_loss_rate + '&exchange=' + cur_exchange
            : document.getElementById('chart_iframe').src = '/chart/chart.php?position=' + position + '&market=' + current_market + '&period=' + current_period + '&buy_rate=' + current_rate + '&buy_time=' + current_time + '&tp_rate=' + current_tp_rate + '&sl_rate=' + current_stop_loss_rate + '&exchange=' + cur_exchange
    }
})();

