// ==UserScript==
// @name         CryptoHopper AI Enhancements
// @namespace    https://github.com/0SkillAllLuck/cryptohopper_scripts
// @updateUrl    https://github.com/0SkillAllLuck/cryptohopper_scripts/raw/main/ai-enhancements.user.js
// @version      0.4
// @description  Enhance the AI experience on Cryptohopper
// @author       0SkillAllLuck
// @match        https://www.cryptohopper.com/strategies?edit_ai*
// @icon         https://www.google.com/s2/favicons?domain=www.cryptohopper.com
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// @grant        GM.getValue
// @grant        GM.setValue
// ==/UserScript==

const apiActionDelay = 550;

(function () {
    'use strict';

    jQuery(document).ready(async() => enhanceEditorPage());
    jQuery(document).ready(async() => enhanceTrainingPage());
    jQuery(document).ready(async() => enhanceResultsPage());

    async function enhanceEditorPage() {
        jQuery('#table_strategies > thead > tr > th:nth-child(3)').css("width", "40%")
        jQuery('#table_strategies > thead > tr > th:nth-child(4)').html('Score<br/>Buy Down/Neutral/Up<br/>Sell Down/Neutral/Up').css("width", "25%")

        await acquireLock('ai-enhancements/editor')

        for await (const strat of jQuery('#table_strategies > tbody > tr')) {
            const split = strat.id.split('_');
            const strategy_id = split[2];
            const strategy_type = split[1];
            await new Promise(resolve => setTimeout(resolve, apiActionDelay))
                .then(() => new Promise((resolve, reject) => doApiCall('getaistrategydetails',{id: jQuery('#ai_id').val(), strategy_id: strategy_id, strategy_type: strategy_type}, result => resolve(result), error => reject(error))))
                .then(async result => {
                    jQuery(strat).find('td:nth-child(3)').css("width", "40%")
                    jQuery(strat).find('td:nth-child(4').css("width", "25%")
                    if (result.data.trend_strategy == "0") {
                        jQuery(strat).find('td:nth-child(4)').append("<br/>"
                            + result.data.trend_down_buy_score + " / " + result.data.trend_neutral_buy_score + " / " + result.data.trend_up_buy_score + "<br/>"
                            + result.data.trend_down_sell_score + " / " + result.data.trend_neutral_sell_score + " / " + result.data.trend_up_sell_score);
                    } else {
                        jQuery(strat).find('td:nth-child(4)').append("<br/>"
                            + result.data.trend_down_score + " / " + result.data.trend_neutral_score + " / " + result.data.trend_up_score);
                    }
                });
        }

        await GM.setValue('0SkillAllLuck_API_Lock', '{}');
    }

    async function enhanceTrainingPage() {
        const learnAllowedCoinsButton = jQuery('<button type="button" class="btn waves-effect waves-light btn-primary" id="learnAllowedCoinsButton"><i class="md md-android m-r-5"></i> Learn Allowed Coins</button>');
        const deleteAITrainignsButton = jQuery('<button type="button" class="btn btn-default" id="deleteAITrainingsButton"><i class="fa fa-times"></i></button>');
        
        learnAllowedCoinsButton.on('click', () => learnAllowedCoins());
        deleteAITrainignsButton.on('click', () => deleteAITrainings());

        jQuery('#ai_training > div:nth-child(1) > div > div > div > div.col-md-8.col-lg-9 > div > div:nth-child(1) > span').append(learnAllowedCoinsButton);
        jQuery('#ai_training > div:nth-child(3) > div > div > div.row > div.col-xs-8.text-right').prepend(deleteAITrainignsButton);
    }

    async function enhanceResultsPage() {
        jQuery('#best_scoring_markets_table tr').show();
    }

    async function learnAllowedCoins() {
        const learnAllowedCoinsButton = jQuery('#learnAllowedCoinsButton');
        learnAllowedCoinsButton.html('<i class="fa fa-refresh fa-spin m-r-5"></i>');
        learnAllowedCoinsButton.prop('disabled', true);

        return GM.getValue('0SkillAllLuck_AI_Enhancement_' + jQuery('#ai_id').val(), '{}')
            .then(state => JSON.parse(state))
            .then(state => {
                if (!state.remaining || state.remaining.length == 0) {
                    return startTrainingAllowed();
                }
        
                return swal({
                    type: 'question',
                    title: 'Continue training from stored state?',
                    text: 'We found a previously started AI training state, do you want to continue training?',
                    showCancelButton: true,
                    confirmButtonText: 'Yes',
                    cancelButtonText: 'No'
                }).then(async result => {
                    if (result.dismiss == 'overlay' || result.dismiss == 'cancel' || !result.value) {
                        return startTrainingAllowed();
                    }
                    
                    return state.remaining;
                });
            })
            .then(async remaining => startTrainingCoinPairs(remaining))
            .finally(() => {
                learnAllowedCoinsButton.html('<i class="md md-android m-r-5"></i> Learn Allowed Coins');
                learnAllowedCoinsButton.prop('disabled', false);
            });
    }

    async function startTrainingAllowed() {
        return $.get('https://www.cryptohopper.com/config').promise()
            .catch(async error => swal({
                type: 'error',
                title: 'Failed to load allowed coins',
                text: error.message,
                showConfirmButton: true,
            }))
            .then(async configPage => {
                const base = $(configPage).find('#collect_currency').val().toUpperCase();
                const coinPairList = $(configPage).find('#allowed_coins').val().map((coin) => `${coin}/${base}`);
                return coinPairList;
            });
    }

    async function startTrainingCoinPairs(coinPairs) {
        const strategy = jQuery('#selected_strategy_id option:selected');
        const config = {
            id: jQuery('#ai_id').val(),
            exchange: jQuery('#select_exchange').val(),
            strategy_id: strategy.val(),
            strategy_type: strategy.data('type')
        }
        if (config.id == 'new') {
            return swal({
                type: 'error',
                title: 'Error',
                text: 'You cannot train a new AI. Please save your AI first.',
                showConfirmButton: false
            })
        }
        
        await acquireLock('ai-enhancements/train')
        await new Promise((resolve, reject) => doApiCall('loadaitraining',{id: config.id}, result => resolve(result), error => reject(error)))
            .catch(async error => swal({ 
                type: 'error',
                title: 'Error', 
                text: error
            }))
            .then(async result => {
                const availablePairs = jQuery('#select_market option') .map(function () { return jQuery(this).val(); }).get();
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

                await GM.setValue('0SkillAllLuck_AI_Enhancement_' + jQuery('#ai_id').val(), JSON.stringify({
                    remaining: coinPairs,
                }));
                return trainCoinPairs(config, coinPairs, result.total_trainings);
            });
        await GM.setValue('0SkillAllLuck_API_Lock', '{}');
    }

    async function trainCoinPairs(config, coinPairs, currentQueueSize) {
        if (coinPairs.length < 1) {
            return swal({
                type: 'success',
                title: 'Allowed coins added',
                text: "All allowed coins added to training queue!",
                showConfirmButton: false
            }).then(async () => finishTraining(currentQueueSize));
        }

        if (currentQueueSize >= max_trainings) {
            return swal({
                type: 'error',
                title: 'Full queue',
                text: `Training queue filled up! Remaining coins: ${coinPairs.join(', ')}`,
                showConfirmButton: true,
            }).then(async () => finishTraining(currentQueueSize));
        }

        const currentCoinPair = coinPairs.pop();
        return new Promise((resolve, reject) => doApiCall('convertmarket',{exchange: config.exchange, market: currentCoinPair}, result => resolve(result), error => reject(error)))
            .then(async converted => new Promise((resolve, reject) => doApiCall('trainai',{...config, pair: converted.pair}, result => resolve(result), error => reject(error))))
            .then(async () => {
                refreshAITrainings();

                const state = JSON.parse(await GM.getValue('0SkillAllLuck_AI_Enhancement_' + jQuery('#ai_id').val(), '{}'))
                GM.setValue('0SkillAllLuck_AI_Enhancement_' + jQuery('#ai_id').val(), JSON.stringify({
                    remaining: state.remaining.filter(function(e) {
                        return e !== currentCoinPair;
                    }),
                }))

                await new Promise(resolve => setTimeout(resolve, 1000));
                return trainCoinPairs(config, coinPairs, currentQueueSize + 1)
            })
            .catch(async error => console.error(error))
            .catch(async error => {
                return swal({
                    type: 'error',
                    title: 'Error',
                    text: error,
                    showConfirmButton: false
                }).then(async () => finishTraining(currentQueueSize));
            });
    }

    async function finishTraining(currentQueueSize) {
        return setAILearnButton(currentQueueSize);
    }

    async function deleteAITrainings() {
        jQuery('#deleteAITrainingsButton').html('<i class="fa fa-refresh fa-spin m-r-5"></i>');
        await acquireLock('ai-enhancements/delete')

        for await (const button of jQuery('#current_ai_trainings > table > tbody > tr > td:nth-child(5) > button')) {
            await new Promise(resolve => setTimeout(resolve, apiActionDelay)).then(() => button.click());
        }

        await GM.setValue('0SkillAllLuck_API_Lock', '{}');
        jQuery('#deleteAITrainingsButton').html('<i class="fa fa-times"></i>');
        return swal({
            type: 'success',
            title: 'Trainings Deleted',
            text: 'All trainings deleted, consider reseting this AI now.'
        });
    }

    async function acquireLock(scriptName) {
        var hasLock = false;
        while(!hasLock) {
            const lock = JSON.parse(await GM.getValue('0SkillAllLuck_API_Lock', '{}'));
            if (!lock.script || lock.timeout < Date.now()) {
                await GM.setValue('0SkillAllLuck_API_Lock', JSON.stringify({
                    script: scriptName,
                    timeout: Date.now() + 30000,
                }));
                hasLock = true;
            }
            await new Promise(resolve => setTimeout(resolve, apiActionDelay));
        }
    }
})();
