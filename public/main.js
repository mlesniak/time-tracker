var data = {
    labels: ['-6', '-5', '-4', '-3', '-2', 'Yesterday', 'Today'],
    datasets: [{
        backgroundColor: "#00AA00",
        borderColor: "#eeeeee",
        borderWidth: 1,
        data: [
            10,
            20,
            0
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
                    stacked: true
                }]
            }
        }
    });
};

var app = new Vue({
    el: '#app',
    data: {
        description: undefined,
        duration: 10,
        totalMinutes: 0
    },
    created: function () {
        this.reloadData();
    },
    methods: {
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
        reloadData: function() {
            var self = this;
            axios.get('/api/')
            .then(function (db) {
                // May be done by a database?
                console.log(JSON.stringify(db.data));
                
                data.datasets[0].data = [];
                self.totalMinutes = 0;
                for (var i = 0; i < db.data.length; i++) {
                    var entry = db.data[i];
                    data.datasets[0].data.push(entry.duration);
                    self.totalMinutes += entry.duration;
                }
                window.chart.update();
            });
        }
    }
})