# -*- coding: utf-8 -*-
"""Public section, including homepage and signup."""
from flask import Blueprint, flash, redirect, render_template, \
    request, url_for, jsonify, abort, make_response
from fitnotes_visualization.public.forms import UploadForm
from fitnotes_visualization.extensions import uploads, cache
from fitnotes_visualization.utils import flash_errors, generate_filename
from fitnotes_visualization.models import get_frequent_exercises, \
    get_group_splits, get_all_exercises, \
    get_exercise_data, get_exercise_volume, get_exercise_weights, \
    get_exercise_estimated_max

blueprint = Blueprint('public', __name__, static_folder='../static')

#############
# Views
############

@blueprint.route('/', methods=['GET', 'POST'])
def home():
    """Home page."""
    form = UploadForm()
    if request.method == 'POST':
        if form.validate_on_submit():

            # generate a filename
            filename = generate_filename()

            # save the file
            uploads.save(request.files['workout_data'], name=filename)

            # create a response
            response = make_response(redirect(url_for('public.results')))

            # create a cookie with filename
            response.set_cookie('fn', filename)

            return response
        else:
            flash_errors(form)

    return render_template('public/home.html', form=form)


@blueprint.route('/results', methods=['GET'])
def results():
    """Results page"""

    try:
        # get filename from cookies
        # filename = request.cookies['fn']
        #
        # # parse the csv data
        # workout_data = parse_csv(filename)
        #
        # # store the data in memcache
        # cache.set(filename, workout_data)

        return render_template('public/result.html')
    except FileNotFoundError as e:
        abort(404)


##################
## API
##################

# @blueprint.route('/exercises')
# def get_exercise():
#     """Exercise data"""
#     exercise_name = request.args['exercise']
#     exercise_data = get_exercise_data(exercise_name)
#     return jsonify(exercise_data)

@blueprint.route('/exercises', methods=['GET'])
def get_exercises():
    """Returns a list of all exercises"""
    # get filename for data
    filename = request.cookies['fn']

    # get all exercises
    all_exercises = get_all_exercises(filename)

    return jsonify(exercises=all_exercises)


@blueprint.route('/exercises/favorite', methods=['GET'])
def favorite_exercises():
    """Exercise-related API"""

    # check if there is a limit for # of exercises to return
    limit = request.args.get('limit', 5)

    # get filename for data
    filename = request.cookies['fn']

    # get the most frequent exercises
    exercises = get_frequent_exercises(filename, limit)

    # process the data
    labels = list(exercises.keys())
    data = list(exercises.values())

    return jsonify(labels=labels, data=data, label="Number of workouts")


@blueprint.route('/exercises/group', methods=['GET'])
def exercise_groups():
    """Return groups for exercises"""

    # get filename for data
    filename = request.cookies['fn']

    # get the most frequent exercises
    exercise_group_counts = get_group_splits(filename)

    # process the data
    labels = list(exercise_group_counts.keys())
    data = list(exercise_group_counts.values())

    return jsonify(labels=labels, data=data, label="Exercise Groups")


@blueprint.route('/exercises/<exercise_name>')
def get_exercise(exercise_name):
    """Return exercise data"""

    # get filename for data
    filename = request.cookies['fn']

    # get exercise data
    exercise_data = get_exercise_data(filename, exercise_name)

    return jsonify(exercise_data=exercise_data)


@blueprint.route('/exercises/<exercise_name>/volume')
def get_volume(exercise_name):
    """Return the workout volume for this exercise"""

    # get filename for data
    filename = request.cookies['fn']

    # get exercise volume
    exercise_data = get_exercise_volume(filename, exercise_name)

    labels = list(exercise_data.keys())
    data = list(exercise_data.values())

    return jsonify(labels=labels, data=data, label="Workout Volume")


@blueprint.route('/exercises/<exercise_name>/weight')
def get_weight(exercise_name):
    """Return the weights for this exercise over time."""

    # get filename for data
    filename = request.cookies['fn']

    # get exercise weights
    exercise_data = get_exercise_weights(filename, exercise_name)

    labels = list(exercise_data.keys())
    data = list(exercise_data.values())

    return jsonify(labels=labels, data=data, label="Workout weight")


@blueprint.route('/exercises/<exercise_name>/estimated_max')
def get_estimated_max(exercise_name):
    """Return the estimated max over time."""

    # get filename for data
    filename = request.cookies['fn']

    # get exercise weights
    exercise_data = get_exercise_estimated_max(filename, exercise_name)

    labels = list(exercise_data.keys())
    data = list(exercise_data.values())

    return jsonify(labels=labels, data=data, label="Estimated max")