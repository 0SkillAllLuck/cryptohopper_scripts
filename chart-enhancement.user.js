// ==UserScript==
// @name         Cryptohopper Chart Enhancements
// @namespace    https://github.com/0SkillAllLuck/cryptohopper_scripts
// @updateUrl    https://github.com/0SkillAllLuck/cryptohopper_scripts/raw/main/chart-enhancements.user.js
// @version      0.1
// @description  Enhance the Chart experience on Cryptohopper
// @author       0SkillAllLuck
// @match        https://www.cryptohopper.com/chart/chart.php*
// @icon         https://www.google.com/s2/favicons?domain=cryptohopper.com
// ==/UserScript==

(function () {
    'use strict'

    var jq = document.createElement('script')
    jq.src = "https://cdn.cryptohopper.com/media/jui/js/jquery.min.js"
    document.getElementsByTagName('head')[0].appendChild(jq)

    setTimeout(enhanceChart, 500)



    function enhanceChart() {
        jQuery.noConflict()

        widget.onChartReady(function () {
            var position = getParameterByName('position')
            var market = getParameterByName('market')
            var price = parseFloat(getParameterByName('buy_rate'))

            jQuery.ajax({
                type: "POST",
                dataType: "json",
                url: "/siteapi.php?todo=refreshmodalpos",
                data: {
                    position_id: position
                },
                cache: !1,
                success: function (a) {
                    var info = jQuery(a.info_html)
                    var stoploss = jQuery(info[1]).data('stop-loss-this')
                    var stoplossRate = jQuery(info[1]).data('stop-loss-rate')
                    var trailing = jQuery(info[1]).data('trailing')
                    var trailingOnly = jQuery(info[1]).data('trailing')
                    var trailingArm = jQuery(info[1]).data('trailing-arm')


                    var settings = jQuery(a.settings_html)
                    var takeprofit = jQuery(settings).find('.target_rate_' + position).text()


                    widget.chart().createPositionLine()
                        .setText("Merge Rate")
                        .setLineLength(3)
                        .setPrice(parseFloat(price))

                    if (!trailingOnly == '') {
                        widget.chart().createPositionLine()
                            .setText('TP')
                            .setLineColor("#29c79e")
                            .setQuantityBorderColor("#29c79e")
                            .setQuantityBackgroundColor("#29c79e")
                            .setBodyTextColor("#29c79e")
                            .setBodyBorderColor("#29c79e")
                            .setLineLength(3)
                            .setPrice(parseFloat(takeprofit))
                    }
                    if (trailing == '1') {
                        widget.chart().createPositionLine()
                            .setText('TSL (Arm: ' + trailingArm + ')')
                            .setLineColor("#29c79e")
                            .setQuantityBorderColor("#29c79e")
                            .setQuantityBackgroundColor("#29c79e")
                            .setBodyTextColor("#29c79e")
                            .setBodyBorderColor("#29c79e")
                            .setLineLength(3)
                            .setPrice(parseFloat(price) * (parseFloat(trailingArm) / 100 + 1))
                    }
                    if (stoploss != '0') {
                        widget.chart().createPositionLine()
                            .setText('SL')
                            .setLineColor("#ff6b5c")
                            .setQuantityBorderColor("#ff6b5c")
                            .setQuantityBackgroundColor("#ff6b5c")
                            .setBodyTextColor("#ff6b5c")
                            .setBodyBorderColor("#ff6b5c")
                            .setLineLength(3)
                            .setPrice(parseFloat(stoplossRate))
                    }
                }
            })
        })
    }
})()