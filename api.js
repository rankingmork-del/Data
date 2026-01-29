// BLAZIX S4 API - GitHub Pages Version
class BlazixAPI {
    constructor() {
        this.predictionHistory = JSON.parse(localStorage.getItem('blazix_history')) || this.generateSampleHistory();
        this.previousResults = this.generatePreviousResults();
        this.lastPrediction = null;
        this.samePredictionCount = 0;
        this.currentPatternMode = 'Custom Logic';
        this.predictionAlgorithm = 5;
        
        this.setupAPIRoutes();
    }
    
    generateSampleHistory() {
        return [
            {
                period: "1233",
                prediction: "SMALL",
                derivedNumber: 3,
                actualNumber: 4,
                actual: "SMALL",
                status: "win",
                confidence: 78,
                timestamp: "12:10:25 PM",
                logicType: "custom",
                resultType: "victory"
            },
            {
                period: "1232",
                prediction: "BIG",
                derivedNumber: 7,
                actualNumber: 8,
                actual: "BIG",
                status: "win",
                confidence: 86,
                timestamp: "12:05:20 PM",
                logicType: "custom",
                resultType: "victory"
            },
            {
                period: "1231",
                prediction: "BIG",
                derivedNumber: 6,
                actualNumber: 6,
                actual: "BIG",
                status: "win",
                confidence: 89,
                timestamp: "12:00:15 PM",
                logicType: "custom",
                resultType: "jackpot"
            }
        ];
    }
    
    generatePreviousResults() {
        return [
            { period: "1233", number: "4", result: "SMALL" },
            { period: "1232", number: "8", result: "BIG" },
            { period: "1231", number: "6", result: "BIG" },
            { period: "1230", number: "3", result: "SMALL" },
            { period: "1229", number: "9", result: "BIG" },
            { period: "1228", number: "2", result: "SMALL" },
            { period: "1227", number: "7", result: "BIG" },
            { period: "1226", number: "5", result: "BIG" }
        ];
    }
    
    // Your custom calculation logic
    calculation6(numbers, lastPred, sameCount) {
        if (numbers.length < 10) {
            return this.generateSmartPrediction(numbers, lastPred, sameCount);
        }

        const last10 = numbers.slice(0, 10);
        const firstDigit = last10[0];
        const fifthDigit = last10[4];
        let sum = firstDigit + fifthDigit;

        if (sum >= 10) {
            sum = Math.floor(sum / 10) + (sum % 10);
        }

        const lastDigit = last10[9];
        let result = sum - lastDigit;

        if (result < 0) {
            result = -result;
        }

        if (result >= 10) {
            result = Math.floor(result / 10) + (result % 10);
        }

        const prediction = result >= 5 ? "BIG" : "SMALL";
        let confidence = 70;

        if (result === 0 || result === 9) {
            confidence = 85;
        } else if (result <= 2 || result >= 7) {
            confidence = 75;
        }

        if (lastPred && prediction === lastPred && sameCount >= 1) {
            if (confidence > 75) {
                confidence *= 0.9;
            } else {
                confidence = Math.max(60, confidence * 0.8);
            }
        }

        const derivedNumber = result;
        return {
            prediction,
            confidence: Math.min(95, Math.max(55, confidence)),
            derivedNumber
        };
    }
    
    generateSmartPrediction(numbers, lastPrediction, sameCount) {
        const avg = numbers.slice(0, 5).reduce((a, b) => a + b, 0) / Math.min(5, numbers.length);
        let prediction = avg >= 5 ? "BIG" : "SMALL";
        let confidence = 60 + Math.random() * 25;

        if (lastPrediction && prediction === lastPrediction) {
            if (sameCount >= 2) {
                prediction = prediction === "BIG" ? "SMALL" : "BIG";
                confidence = Math.max(55, confidence * 0.7);
            } else if (sameCount >= 1 && confidence < 70) {
                prediction = prediction === "BIG" ? "SMALL" : "BIG";
                confidence = 65;
            }
        }

        const derivedNumber = Math.round(avg) % 10;
        return { prediction, confidence: Math.min(85, confidence), derivedNumber };
    }
    
    generateNewPrediction() {
        // Generate sample numbers for demonstration
        const sampleNumbers = Array.from({length: 20}, () => Math.floor(Math.random() * 10));
        const nextPeriod = (1233 + this.predictionHistory.length).toString();
        
        const { prediction, confidence, derivedNumber } = this.calculation6(sampleNumbers, this.lastPrediction, this.samePredictionCount);
        
        if (this.lastPrediction === prediction) {
            this.samePredictionCount++;
        } else {
            this.samePredictionCount = 1;
            this.lastPrediction = prediction;
        }
        
        const newPrediction = {
            period: nextPeriod,
            prediction,
            derivedNumber,
            status: "pending",
            timestamp: new Date().toLocaleTimeString(),
            confidence: Math.round(confidence),
            logicType: "custom"
        };
        
        this.predictionHistory.unshift(newPrediction);
        localStorage.setItem('blazix_history', JSON.stringify(this.predictionHistory));
        
        return newPrediction;
    }
    
    updateStats() {
        const winCount = this.predictionHistory.filter(p => p.status === "win").length;
        const loseCount = this.predictionHistory.filter(p => p.status === "loss").length;
        const pendingCount = this.predictionHistory.filter(p => p.status === "pending").length;
        const total = this.predictionHistory.length;
        const totalCompleted = winCount + loseCount;
        const totalAccuracy = totalCompleted > 0 ? Math.round((winCount / totalCompleted) * 100) : 0;

        let currentStreak = 0;
        let highestWinStreak = 0;
        let highestLossStreak = 0;
        const completed = this.predictionHistory.filter(p => p.status !== "pending");

        if (completed.length > 0) {
            const lastItem = completed[0];
            for (let i = 0; i < completed.length; i++) {
                if (completed[i].status === lastItem.status) {
                    currentStreak++;
                } else {
                    break;
                }
            }

            let tempStreak = 0;
            let lastResult = null;

            for (let i = completed.length - 1; i >= 0; i--) {
                const item = completed[i];
                if (item.status === "win") {
                    if (lastResult === "win") {
                        tempStreak++;
                    } else {
                        tempStreak = 1;
                    }
                    highestWinStreak = Math.max(highestWinStreak, tempStreak);
                    lastResult = "win";
                } else if (item.status === "loss") {
                    if (lastResult === "loss") {
                        tempStreak++;
                    } else {
                        tempStreak = 1;
                    }
                    highestLossStreak = Math.max(highestLossStreak, tempStreak);
                    lastResult = "loss";
                }
            }
        }

        const recent = completed.slice(0, 100);
        const recentWins = recent.filter(p => p.status === "win").length;
        const recentWinRate = recent.length > 0 ? Math.round((recentWins / recent.length) * 100) : 0;

        return {
            total_trades: total,
            total_win: winCount,
            total_loss: loseCount,
            total_pending: pendingCount,
            total_accuracy: `${totalAccuracy}%`,
            win_streak: highestWinStreak,
            loss_streak: highestLossStreak,
            current_streak: currentStreak,
            recent_win_rate: `${recentWinRate}%`,
            highest_win_streak: highestWinStreak,
            highest_loss_streak: highestLossStreak
        };
    }
    
    setupAPIRoutes() {
        // Intercept fetch calls to our API endpoints
        const originalFetch = window.fetch;
        
        window.fetch = async function(input, init) {
            const url = typeof input === 'string' ? input : input.url;
            
            // Handle our API endpoints
            if (url.startsWith('/api/')) {
                return handleAPIRequest(url);
            }
            
            // For other URLs, use original fetch
            return originalFetch.call(this, input, init);
        };
        
        const api = this;
        
        async function handleAPIRequest(url) {
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 300));
            
            const path = url.split('?')[0];
            const params = new URLSearchParams(url.split('?')[1]);
            
            let responseData = {};
            
            switch(path) {
                case '/api/current':
                    let currentPrediction = api.predictionHistory.find(p => p.status === "pending");
                    if (!currentPrediction) {
                        currentPrediction = api.generateNewPrediction();
                    }
                    
                    responseData = {
                        period: currentPrediction.period,
                        prediction: currentPrediction.prediction,
                        status: currentPrediction.status,
                        derived_number: currentPrediction.derivedNumber,
                        confidence: currentPrediction.confidence,
                        prediction_time: currentPrediction.timestamp,
                        logic_type: currentPrediction.logicType
                    };
                    break;
                    
                case '/api/stats':
                    responseData = api.updateStats();
                    break;
                    
                case '/api/history':
                    const limit = parseInt(params.get('limit')) || 50;
                    const history = api.predictionHistory.slice(0, limit).map(item => ({
                        period: item.period,
                        prediction: item.prediction,
                        derived_number: item.derivedNumber,
                        actual_number: item.actualNumber || null,
                        actual_result: item.actual || null,
                        status: item.status,
                        confidence: item.confidence,
                        timestamp: item.timestamp,
                        result_type: item.resultType || null,
                        logic_type: item.logicType
                    }));
                    
                    responseData = {
                        total: api.predictionHistory.length,
                        limit: limit,
                        history: history
                    };
                    break;
                    
                case '/api/previous':
                    responseData = {
                        previous_results: api.previousResults,
                        count: api.previousResults.length
                    };
                    break;
                    
                case '/api/status':
                    responseData = {
                        api_status: "Active",
                        last_update: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        security: "Encrypted",
                        mode: api.currentPatternMode,
                        algorithm: "Custom Logic",
                        total_predictions: api.predictionHistory.length
                    };
                    break;
                    
                case '/api/all':
                    const current = api.predictionHistory.find(p => p.status === "pending") || api.generateNewPrediction();
                    const stats = api.updateStats();
                    
                    responseData = {
                        current_prediction: {
                            period: current.period,
                            prediction: current.prediction,
                            status: current.status,
                            derived_number: current.derivedNumber,
                            confidence: current.confidence
                        },
                        statistics: stats,
                        previous_results: api.previousResults,
                        system_status: {
                            api_status: "Active",
                            last_update: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            security: "Encrypted",
                            mode: api.currentPatternMode
                        },
                        calculation_logic: {
                            algorithm: "custom_logic_6",
                            description: "Takes last 10 numbers: (1st + 5th) - 10th = Result. If result is 2 digits, sum them. BIG if result ≥5, SMALL if <5",
                            example: {
                                last_10_numbers: [5, 8, 4, 5, 4, 6, 4, 8, 5, 2],
                                calculation: "1st=5, 5th=4 → 5+4=9 → 9-2=7 → 7≥5 → BIG",
                                result: "BIG",
                                derived_number: 7
                            }
                        },
                        timestamp: new Date().toISOString()
                    };
                    break;
                    
                case '/api/calculate':
                    const numbersParam = url.split('/api/calculate/')[1];
                    if (numbersParam) {
                        const numbers = numbersParam.split(',').map(n => parseInt(n.trim()));
                        
                        if (numbers.length < 10) {
                            return {
                                ok: false,
                                status: 400,
                                json: async () => ({
                                    error: "Please provide at least 10 numbers separated by commas"
                                })
                            };
                        }
                        
                        const { prediction, confidence, derivedNumber } = api.calculation6(numbers, null, 0);
                        
                        responseData = {
                            input_numbers: numbers.slice(0, 10),
                            calculation: {
                                first_number: numbers[0],
                                fifth_number: numbers[4],
                                sum: numbers[0] + numbers[4],
                                last_number: numbers[9],
                                subtraction: (numbers[0] + numbers[4]) - numbers[9],
                                final_result: derivedNumber,
                                prediction: prediction,
                                confidence: confidence
                            },
                            result: {
                                prediction: prediction,
                                derived_number: derivedNumber,
                                confidence: confidence
                            }
                        };
                    }
                    break;
                    
                case '/api/update':
                    api.generateNewPrediction();
                    responseData = {
                        success: true,
                        message: "Data updated successfully",
                        timestamp: new Date().toISOString()
                    };
                    break;
                    
                default:
                    responseData = {
                        error: "Endpoint not found",
                        available_endpoints: [
                            "/api/current",
                            "/api/stats",
                            "/api/history",
                            "/api/previous",
                            "/api/status",
                            "/api/all",
                            "/api/update",
                            "/api/calculate/{numbers}"
                        ]
                    };
            }
            
            return {
                ok: true,
                status: 200,
                statusText: "OK",
                json: async () => responseData,
                text: async () => JSON.stringify(responseData, null, 2),
                headers: {
                    get: () => 'application/json'
                }
            };
        }
    }
}

// Initialize the API when page loads
window.addEventListener('DOMContentLoaded', () => {
    window.blazixAPI = new BlazixAPI();
    console.log('BLAZIX S4 API initialized');
});
