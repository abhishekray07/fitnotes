var workout_data_element = document.getElementById("workout_data");
if (workout_data_element != null) {
    workout_data_element.onchange = function () {
        document.getElementById("workout_file").value = this.files[0].name;
    };
}

$(function () {
  $('[data-toggle="tooltip"]').tooltip()
})