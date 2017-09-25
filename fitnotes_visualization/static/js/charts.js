function getChartColors(num_colors) {

//    return ["#3e95cd", "#8e5ea2","#3cba9f","#e8c3b9","#c45850"];

    var colors = []
    var letters = '0123456789ABCDEF'.split('');

    for (var i = 0; i < num_colors; i++) {
        var color = '#';
        for (var j = 0; j < 6; j++ ) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        colors.push(color)
    }

    return colors;
}

function drawBarChart(data, domId, title) {
    var ctx = document.getElementById(domId).getContext('2d');

    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data['labels'],
            datasets: [{
                label: data['label'],
                data: data['data'],
                backgroundColor: getChartColors(data['data'].length),
            }]
        },
        options: {
            legend: { display: false },
            title: {
                display: true,
                text: title
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:true
                    }
                }]
            }
        }
    });
}

function drawPieChart(data, domId, title) {
    var ctx = document.getElementById(domId).getContext('2d');

    var myChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: data["labels"],
            datasets: [{
                label: data['label'],
                data: data["data"],
                backgroundColor: getChartColors(data['data'].length),
            }]
        },
        options: {
            legend: { display: false },
            title: {
                display: true,
                text: title,
            }
        }
    });
}


function drawLineChart(data, domId) {
    var ctx = document.getElementById(domId).getContext('2d');

    var myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data["labels"],
            datasets: [{
                label: data['label'],
                data: data["data"],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255,99,132,1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:true
                    }
                }]
            }
        }
    });
}


// Get favorite exercises
$.getJSON("/exercises/favorite", function( data ) {
    drawBarChart(data, "favoriteChart", "Most frequent exercises");
})

// Get exercise group splits
$.getJSON("/exercises/group", function( data ) {
    drawPieChart(data, "groupChart", "Exercise Group");
})


// exercise-volume chart
function createExerciseVolumeChart(exercise_name) {
    $.getJSON("/exercises/" + exercise_name + "/volume", function(data) {
        drawLineChart(data, "exercise-volume-chart");
    })
}

// exercise weight chart
function createExerciseWeightChart(exercise_name) {
    $.getJSON("/exercises/" + exercise_name + "/weight", function(data) {
        drawLineChart(data, "exercise-weight-chart");
    })
}

// exercise estimated max chart
function createExerciseEstimatedMaxChart(exercise_name) {
    $.getJSON("/exercises/" + exercise_name + "/estimated_max", function(data) {
        drawLineChart(data, "exercise-estimated-chart");
    })
}

// exercise data
function addExerciseData(exercise_name) {
    // get data for the selected exercise
    $.getJSON("/exercises/" + exercise_name, function(data) {

        var exerciseData = data['exercise_data']

        var newDiv = document.createElement('div');
        newDiv.setAttribute('id', 'exercise-data-auto');
        var html = '<p> Maximum Weight: ' + exerciseData['max_weight'] + '</p>';
        html += '<p> Estimated max: ' + exerciseData['estimated_max'] + '</p>';
        html += '<p> Number of workouts: ' + exerciseData['num_workouts'] + '</p>';
        html += '<p> Body Group:' + exerciseData['group'] + '</p>';

        html += '<div >'
        newDiv.innerHTML = html;

        // remove previous exercise, if any
        previousExercise = document.getElementById('exercise-data-auto');
        if (previousExercise != null) {
            previousExercise.remove();
        }

        document.getElementById('exercise-data').appendChild(newDiv);
    })
}


// update exercises whenever the exercise selector is cahnged
function update_exercise(exercise_name) {
    addExerciseData(exercise_name);
    createExerciseVolumeChart(exercise_name);
    createExerciseWeightChart(exercise_name);
    createExerciseEstimatedMaxChart(exercise_name);
}


// callback function for exercise selector
function exerciseSelector(){

  var selectedOption = document.getElementById("exercise-selector");
  var selectedExercise = selectedOption.options[selectedOption.selectedIndex].value;
  update_exercise(selectedExercise);
}

// Get all exercises
$.getJSON("/exercises", function(data) {
    exercises = data['exercises']

    // create a new DIV element to render the exercise selector
    var newDiv=document.createElement('div');
    newDiv.setAttribute('class', 'form-group');
    var html = '<label for="exercise">Exercise Details:</label>';
    html += '<select onchange="exerciseSelector()" id="exercise-selector" class="form-control">', i;
    html += "<option disabled selected value> Select an exercise </option>";
    for(var i = 0; i < exercises.length; i++) {
       html += "<option value='"+exercises[i]+"'>"+exercises[i]+"</option>";
    }
    html += '</select>';
    newDiv.innerHTML= html;

    // append the newly created element to the DOM
    document.getElementById('select-container').appendChild(newDiv);
})