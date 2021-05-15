// ==UserScript==
// @name         CryptoHopper Backtest Export
// @namespace    https://github.com/0SkillAllLuck/cryptohopper_scripts
// @updateUrl    https://github.com/0SkillAllLuck/cryptohopper_scripts/raw/main/backtest-export.user.js
// @version      0.1
// @description  Add a "Export to PDF" button to the Backtest Page.
// @author       0SkillAllLuck
// @match        https://www.cryptohopper.com/backtesting
// @icon         https://www.google.com/s2/favicons?domain=www.cryptohopper.com
// @grant        GM_addStyle
// ==/UserScript==

(function () {
    'use strict';

    function exportToPDF() {
        window.print();
    }

    function addElements() {
        const exportToPDFButton = jQuery('<button type="button" class="btn btn-success btn-lg">Export to PDF</button>');
        exportToPDFButton.on('click', () => exportToPDF());
        jQuery('#backtest-config > div > div:nth-child(20) > div').append(exportToPDFButton);
    };

    jQuery(document).ready(() => addElements());

    jQuery(() => {
        GM_addStyle(`
        @media print {
          #fc_frame,
          #component_content > div:nth-child(1) > div,
          #backtest-config > div > div:nth-child(4),
          #backtest-config > div > div:nth-child(5),
          #backtest-config > div > div:nth-child(6),
          #backtest-config > div > div:nth-child(7),
          #backtest-config > div > div:nth-child(8),
          #backtest-config > div > div:nth-child(9),
          #backtest-config > div > div:nth-child(10),
          #backtest-config > div > div:nth-child(11),
          #backtest-config > div > div:nth-child(12),
          #backtest-config > div > div:nth-child(13),
          #backtest-config > div > div:nth-child(14),
          #backtest-config > div > div:nth-child(15),
          #backtest-config > div > div:nth-child(16),
          #backtest-config > div > div:nth-child(17),
          #backtest-config > div > div:nth-child(18),
          #backtest-config > div > div:nth-child(19),
          #backtest-config > div > div:nth-child(20),
          #backtest-config > div > hr:nth-child(21),
          #component_content > div:nth-child(6) > div > ul,
          #test_result_div > div > p.m-t-10 {
            display: none !important;
          }
          #result_trades_div_test > div {
            max-height: none !important;
          }
          #result_chart_div_test {
            page-break-after: always !important;
          }
        }
    `);
  });
})();


