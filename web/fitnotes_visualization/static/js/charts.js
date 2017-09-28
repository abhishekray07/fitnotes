function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var j = 0; j < 6; j++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }

    return color;
}

function getChartColors(num_colors) {

    var colors = []
    for (var i = 0; i < num_colors; i++) {
        colors.push(getRandomColor())
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
                        beginAtZero:true,
                    }
                }],
                xAxes: [{
                    ticks: {
                        autoSkip: false
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
            legend: { display: true },
            title: {
                display: true,
                text: title,
            }
        }
    });
}


function drawLineChart(data, domId, title) {
    var ctx = document.getElementById(domId).getContext('2d');

    var myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data["labels"],
            datasets: [{
                label: data['label'],
                data: data["data"],
                borderColor: getRandomColor(),
                fill: false,
                borderWidth: 1
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


// Get favorite exercises
$.getJSON("/exercises/favorite", function( data ) {
    drawBarChart(data, "favoriteChart", "Most frequent exercises");
})

// Get exercise group splits
$.getJSON("/exercises/group", function( data ) {
    drawPieChart(data, "groupChart", "Number of workouts per body group");
})


// exercise-volume chart
function createExerciseVolumeChart(exercise_name) {
    $.getJSON("/exercises/" + exercise_name + "/volume", function(data) {
        drawLineChart(data, "exercise-volume-chart", "Workout Volume over Time");
    })
}

// exercise weight chart
function createExerciseWeightChart(exercise_name) {
    $.getJSON("/exercises/" + exercise_name + "/weight", function(data) {
        drawLineChart(data, "exercise-weight-chart", "Max weight in workout");
    })
}

// exercise estimated max chart
function createExerciseEstimatedMaxChart(exercise_name) {
    $.getJSON("/exercises/" + exercise_name + "/estimated_max", function(data) {
        drawLineChart(data, "exercise-estimated-chart", "Estimated Max over Time");
    })
}

function generateExerciseHTML(category, value, tooltip) {
    var html = '<div class="col-md-3">';
    html += '<div class="panel panel-default">';
    html += '<div class="panel-heading" tooltip="' + tooltip + '">';
    html += '<h3 class="panel-title center">' + category + '<span class="glyphicon glyphicon-info-sign"></span></h3>';
    html += '</div>';
    html += '<p class="detail center">' + value + '</p>';
    html += '</div></div>';

    return html;
}

// exercise data
function addExerciseData(exercise_name) {
    // get data for the selected exercise
    $.getJSON("/exercises/" + exercise_name, function(data) {

        var exerciseData = data['exercise_data']

        var newDiv = document.createElement('div');
        newDiv.setAttribute('class', 'row');

        newDiv.setAttribute('id', 'exercise-data-auto');
        var html = generateExerciseHTML('Maximum Weight', exerciseData['max_weight'], 'Maximum Weight for the exercise.');
        html += generateExerciseHTML('Estimated max', exerciseData['estimated_max'], 'Estimated Maximum Weight for the exercise.');
        html += generateExerciseHTML('Number of workouts', exerciseData['num_workouts'], 'Number of workouts involving this exercise.');
        html += generateExerciseHTML('Body Group', exerciseData['group'], 'Body group for this exercise.');

        newDiv.innerHTML = html;

        // remove previous exercise, if any
        previousExercise = document.getElementById('exercise-data-auto');
        if (previousExercise != null) {
            previousExercise.remove();
        }

        document.getElementById('exercise-data').appendChild(newDiv);
    })
}

// update exercises whenever the exercise selector is changed
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
    var html = '<select onchange="exerciseSelector()" id="exercise-selector" class="form-control">', i;
    html += "<option disabled selected value> Select an exercise </option>";
    for(var i = 0; i < exercises.length; i++) {
       html += "<option value='"+exercises[i]+"'>"+exercises[i]+"</option>";
    }
    html += '</select>';
    newDiv.innerHTML= html;

    // append the newly created element to the DOM
    document.getElementById('select-container').appendChild(newDiv);
})
