// ==UserScript==
// @name         CryptoHopper AI Learn allowed coins
// @namespace    https://github.com/0SkillAllLuck/cryptohopper_scripts
// @updateUrl    https://github.com/0SkillAllLuck/cryptohopper_scripts/raw/main/ai-learn-allowed-coins.user.js
// @version      0.4
// @description  Add a learn allowed coins option to CryptoHopper AI training page
// @author       0SkillAllLuck
// @match        https://www.cryptohopper.com/strategies?edit_ai*
// @icon         https://www.google.com/s2/favicons?domain=www.cryptohopper.com
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    function trainCoinPairs(config, coinPairs, currentQueueSize) {
        if (coinPairs.length < 1) {
            swal({
                type: 'success',
                title: 'Allowed coins added',
                text: "All allowed coins added to training queue!",
                showConfirmButton: false,
                timer: 1250,
                timerProgressBar: true,
            })
            return finishTraining(currentQueueSize);
        }

        if (currentQueueSize >= max_trainings) {
            const pairsRemaining = coinPairs.join(', ');
            swal({
                type: 'error',
                title: 'Full queue',
                text: `Training queue filled up! Remaining coins: ${pairsRemaining}`,
                showConfirmButton: true,
            })
            return finishTraining(currentQueueSize);
        }

        const currentCoinPair = coinPairs.pop();
        doApiCall(
            'convertmarket',
            {
                exchange: config.exchange,
                market: currentCoinPair,
            },
            (result) => {
                doApiCall(
                    'trainai',
                    {
                        ...config,
                        pair: result.pair,
                    },
                    (_result) => {
                        console.log(`${currentCoinPair} added to training queue`);
                        refreshAITrainings();

                        setTimeout(() => trainCoinPairs(config, coinPairs, currentQueueSize + 1), 1250);
                    },
                    (error) => {
                        swal({
                            type: 'error',
                            title: 'Error',
                            text: error,
                            showConfirmButton: false,
                            timer: 1250,
                            timerProgressBar: true,
                        }).then(() => {
                            finishTraining(currentQueueSize);
                        })
                    }
                );
            },
            (error) => {
                swal({
                    type: 'error',
                    title: 'Error',
                    text: error,
                    showConfirmButton: false,
                    timer: 1250,
                    timerProgressBar: true,
                }).then(() => {
                    finishTraining(currentQueueSize);
                })
            }
        );
    }

    function startTrainingCoinPairs(coinPairs) {
        const config = {};
        config.id = jQuery('#ai_id').val();
        if (config.id == 'new') {
            return swal({
                type: 'error',
                title: 'Error',
                text: 'You cannot train a new AI. Please save your AI first.',
                showConfirmButton: false,
                timer: 1250,
                timerProgressBar: true,
            })
        }

        const button = jQuery('#learnAIButton');
        button.html('<i class="fa fa-refresh fa-spin m-r-5"></i>');
        button.prop('disabled', true);

        const strategy = jQuery('#selected_strategy_id option:selected');
        config.exchange = jQuery('#select_exchange').val();
        config.strategy_id = strategy.val();
        config.strategy_type = strategy.data('type');

        doApiCall(
            'loadaitraining',
            {
                id: config.id,
            },
            (result) => {
                const availablePairs = window
                    .jQuery('#select_market option')
                    .map(function () {
                        return jQuery(this).val();
                    })
                    .get();

                coinPairs = coinPairs.filter((coinPair) => {
                    const splitPair = coinPair.split('/');
                    return (
                        !!availablePairs.find((availablePair) => availablePair === coinPair) &&
                        !result.data.find(
                            (training) =>
                                training.strategy_id == config.strategy_id &&
                                training.exchange == config.exchange &&
                                training.pair.includes(splitPair[0]) &&
                                training.pair.includes(splitPair[1])
                        )
                    );
                });

                console.log('Coins available to train: ', coinPairs.join(', '));
                trainCoinPairs(config, coinPairs, result.total_trainings);
            },
            (error) => {
                swal({ title: 'Error', text: error, timer: 4e3, type: 'error' });
                jQuery('#learnAIButton').html('<i class="md md-android m-r-5"></i> Learn');
            }
        );
    }

    function finishTraining(currentQueueSize) {
        jQuery('#learnAIButton').html('<i class="md md-android m-r-5"></i> Learn');
        return setAILearnButton(currentQueueSize);
    }

    function doTrainAIAllowedCoins() {
        $.get('https://www.cryptohopper.com/config', function(configPage) {
            const base = $(configPage).find('#collect_currency').val().toUpperCase();
            const coinPairList = $(configPage).find('#allowed_coins').val().map((coin) => `${coin}/${base}`);
            startTrainingCoinPairs(coinPairList);
        });
    }

    function addElements() {
        const button = jQuery('<button type="button" class="btn waves-effect waves-light btn-primary"><i class="md md-android m-r-5"></i> Learn Allowed Coins</button>');
        const buttonGroup = jQuery('<div class="input-group pull-right"></div>');
        buttonGroup.append(button);
        button.on('click', () => doTrainAIAllowedCoins());

        jQuery('#ai_training > div:nth-child(1) > div > div > div > div.col-md-8.col-lg-9 > div').append(buttonGroup);
    }

    jQuery(document).ready(() => addElements());
})();
