var data = {
    labels: ['-6', '-5', '-4', '-3', '-2', 'Yesterday', 'Today'],
    datasets: [{
        backgroundColor: "#00AA00",
        borderColor: "#eeeeee",
        borderWidth: 1,
        data: [
            0,
            0,
            0,
            0,
            0,
            0,
            0
        ]
    }]
};

var colorList = [
    '#00CC00',
    '#FF0000',
    '#0000FF',
    '#FF00FF',
    '#FFFF00',
    '#00FFFF',
];

var goalData = {
    labels: ['1'],
    datasets: [{
        backgroundColor: "#00AACC",
        borderColor: "#eeeeee",
        borderWidth: 1,
        data: [
            12
        ]
    }]
};

window.onload = function() {
    var ctx = document.getElementById('canvas').getContext('2d');
    window.chart = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            tooltips: {
                enabled: false
            },
            title: {
                display: false,
                text: 'Your last week'
            },
            legend: {
                display: false,
            },
            scales: {
                xAxes: [{
                    stacked: true,
                }],
                yAxes: [{
                    stacked: true,
                    ticks: {
                        callback: function(value, index, values) {
                            return formatHour(value);
                        }
                    }
                }]
            },
            events: ['click'],
            onClick: function(event, elements) {
                if (!elements[0]) {
                    app.dayEntries = undefined;
                    return;
                }
                var label = elements[0]._model.label;
                // Yup, hardcoded.
                var key = data.dates[label];
                var self = app;
                axios.get('/api/' + key)
                .then(function (day) {
                    self.dayEntries = day.data;
                });
            }
        }
    });
    
    var options = {};
    var hammertime = new Hammer(document.getElementById('canvas'));
    hammertime.on('swipe', function(ev) {
        if (Math.abs(ev.deltaX) < 30) {
            return;
        }
        var factor = 0;
        if (ev.deltaX > 0) {
            factor = 1;
            app.previousCounter++;
        } else {
            factor = -1;
            app.previousCounter--;
        }
        // TODO ML Refactor
        var d = new Date(app.today).getTime();
        var dayMs = 1000 * 60 * 60 * 24;
        var weekMs = dayMs * 7;
        app.today = formatDate(new Date(d - weekMs * factor));
        app.reloadData();
    });
    hammertime.get('swipe').set({ direction: Hammer.DIRECTION_HORIZONTAL });
};

var app = new Vue({
    el: '#app',
    data: {
        description: undefined,
        duration: 10,
        totalMinutes: 0,
        config: {
            steps: {},
            useWeekdays: false
        },
        dayEntries: undefined,
        today: undefined,
        // Counts number of swipes in future or past.
        previousCounter: 0
    },
    computed: {
        differenceToGoal: function() {
            if (!this.config.goalDate) {
                return undefined;
            }
            var now = new Date().getTime();
            var future = new Date(this.config.goalDate).getTime();
            var diff = dhm(future - now);
            return diff[0] + " days and " + diff[1] + " hours left";
        },
        showReward: function() {
            return (this.totalMinutes >= this.config.weekGoal * 60) && (this.previousCounter == 0);
        }
    },
    created: function () {
        var self = this;
        this.loadConfiguration(function () {
            self.computeToday();
            self.reloadData();
            self.goalChart();
        });
    },
    methods: {
        weekday: function(i) { 
            return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i];
        },
        loadConfiguration: function(afterLoading) {
            var self = this;
            axios.get('/api/config')
            .then(function (config) {
                self.config = config.data;
                self.duration = self.config.steps.value;
                afterLoading();
            });
        }, 
        onSubmit: function() {
            var self = this;
            axios.post('/api/', {
                description: this.description,
                duration: this.duration
            }).then(function (response) {
                self.description = '';
                self.reloadData();
            });
            
        },
        computeToday: function() {
            if (!this.config.weekStart) {
                this.today = formatDate(new Date());
                return;
            } 
            this.today = findEndOfWeek(this.config.weekStart);
        },
        reloadData: function() {
            var self = this;
            var computedToday = '';
            if (this.today) {
                computedToday = '?today=' + this.today;
            }
            axios.get('/api/detail' + computedToday)
            .then(function (db) {
                data.datasets[0].data = [];
                data.dates = {};
                self.totalMinutes = 0;
                
                // Compute sum per day.
                var sums = {};
                var days = [];
                for (var i = 0; i < db.data.length; i++) {
                    var entry = db.data[i];
                    if (!sums[entry.date]) {
                        days.push(entry.date);
                        sums[entry.date] = entry.duration;
                    } else {
                        sums[entry.date] += entry.duration;
                    }
                }

                // Compute sum per day per activity.
                var activityDayDuration = {};
                for (var i = 0; i < db.data.length; i++) {
                    var entry = db.data[i];
                    if (entry.duration === 0) {
                        continue;
                    }
                    if (!activityDayDuration[entry.description]) {
                        activityDayDuration[entry.description] = {};
                    }
                    activityDayDuration[entry.description][entry.date] = entry.duration;
                }

                var actIndex = 0;
                var index = {};
                for (var activity in activityDayDuration) {
                    if (!index[activity]) {
                        index[activity] = actIndex++;
                    }
                    var idx = index[activity];
                    data.datasets[idx] = {
                        backgroundColor: colorList[idx % colorList.length],
                        borderColor: "#eeeeee",
                        borderWidth: 1,
                        data: [ 0, 0, 0, 0, 0, 0, 0 ]
                    };

                    for (var i = 0; i < days.length; i++) {
                        var day = days[i];
                        var duration = sums[day];
                        
                        data.datasets[idx].label = activity;
                        data.datasets[idx].data[i] = activityDayDuration[activity][day];
                        var t = new Date(day);
                        if (!self.config.useWeekdays) {
                            // Remove year in label.
                            data.labels[i] = formatDay(t);
                        } else {
                            data.labels[i] = self.weekday(t.getDay()); 
                        }
                        data.dates[data.labels[i]] = day;
                        self.totalMinutes += duration;
                    }
                }
                self.computeGoal();
                window.chart.update();
            });
        },
        computeGoal: function() {
            if (!this.config.weekGoal) {
                return;
            }
            if (!window.goal.options) {
                return;
            }
            window.goal.options.scales.xAxes[0].ticks.max = this.config.weekGoal;
            goalData.datasets[0].data[0] = this.totalMinutes / 60;
            window.goal.update();
        },
        parsed: function(d) {
            return formatHour(d);
        },
        goalChart: function() {
            var g = document.getElementById('goal');
            if (this.config.weekGoal)  {
                g.style.display = "inline";
                var gctx = g.getContext('2d');
                window.goal = new Chart(gctx, {
                    type: 'horizontalBar',
                    data: goalData,
                    options: {
                        responsive: true,
                        tooltips: {
                            display: false,
                            enabled: false
                        },
                        title: {
                            display: false,
                        },
                        legend: {
                            display: false,
                        },
                        scales: {
                            xAxes: [{
                                ticks: {
                                    min: 0, 
                                    max: this.config.weekGoal,
                                    callback: function(value, index, values) {
                                        return formatHour(value * 60);
                                    }
                                }
                            }]
                        }
                    }
                });
            }
        }
    }
})

// TODO ML Utils.
function formatHour(d) {
    var hours = Math.floor(d / 60);
    var minutes = d % 60;
    var prefix = "";
    if (minutes < 10) {
        prefix = "0";
    }
    return hours + ":" + prefix + minutes;
}

/**
* Convert milliseconds to difference in days, hours and minutes.
* 
* Found at https://stackoverflow.com/questions/8528382/javascript-show-milliseconds-as-dayshoursmins-without-seconds
*/
function dhm(t){
    var cd = 24 * 60 * 60 * 1000,
    ch = 60 * 60 * 1000,
    d = Math.floor(t / cd),
    h = Math.floor( (t - d * cd) / ch),
    m = Math.round( (t - d * cd - h * ch) / 60000);
    if( m === 60 ){
        h++;
        m = 0;
    }
    if( h === 24 ){
        d++;
        h = 0;
    }
    return [d, pad(h), pad(m)];
}

function pad (n){ 
    return n < 10 ? '0' + n : n; 
};

function findEndOfWeek(startDate) {
    var d = new Date(startDate).getTime();
    var dayMs = 1000 * 60 * 60 * 24;
    var weekMs = dayMs * 7;
    var now = new Date().getTime();
    var date = d;
    do {
        date += weekMs;
    } while (date < now);
    var futureDate = new Date(date - dayMs);
    return formatDate(futureDate);
}

// TODO ML Necessary anymore?
function formatDate(date) {
    return [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join('-')
}

function formatDay(date) {
    return [pad(date.getDate()), pad(date.getMonth() + 1)].join('-')
}