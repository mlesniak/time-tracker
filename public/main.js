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

// var MyScale = Chart.Scale.extend({

// });

// Chart.scaleService.registerScaleType('hourScale', MyScale, defaultConfigObject);

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
                var key = label + "-2018";
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
        if (Math.abs(ev.deltaX) < 100) {
            return;
        }
        var factor = -1;
        if (ev.deltaX > 0) {
            factor = 1;
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
            steps: {}
        },
        dayEntries: undefined,
        today: undefined
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
        }
    },
    created: function () {
        var self = this;
        this.loadConfiguration(function () {
            self.computeToday();
            self.reloadData();
        });
    },
    methods: {
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
            axios.get('/api/' + computedToday)
            .then(function (db) {
                data.datasets[0].data = [];
                self.totalMinutes = 0;
                for (var i = 0; i < db.data.length; i++) {
                    var entry = db.data[i];
                    data.datasets[0].data[i] = entry.duration;
                    // Remove year in label.
                    data.labels[i] = entry.date.substring(0,5);
                    self.totalMinutes += entry.duration;
                }
                window.chart.update();
            });
        },
        parsed: function(d) {
            return formatHour(d);
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

function formatDate(date) {
    return [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join('-')
}