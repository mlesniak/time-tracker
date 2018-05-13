var data = {
    labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    datasets: [{
        backgroundColor: "#00AA00",
        borderColor: "#eeeeee",
        borderWidth: 1,
        data: [
            200,
            120,
            80,
            120,
            10,
            15,
            60
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
        }
    });
};

var app = new Vue({
    el: '#app',
    data: {
        description: undefined,
        duration: 10
    },
    methods: {
        onSubmit: function() {
            console.log("Submitting <" + this.description + " / " + this.duration + ">");
        }
    }
})