# -*- coding: utf-8 -*-
"""Public section, including homepage and signup."""

import collections
import csv
import os

from fitnotes_visualization.extensions import cache
from fitnotes_visualization.utils import get_estimated_max_weight



@cache.memoize(timeout=60)
def parse_csv(filename,  default_dir='static/uploads', data_type='data'):
    """Parse the workout data.

    Data is cached in memcached.

    """


    # location of uploaded files
    here = os.path.abspath(os.path.dirname(__file__))
    file_path = os.path.join(here, default_dir, data_type, filename)

    all_exercises = {}

    # read / parse csv
    with open(file_path) as csv_file:
        reader = csv.reader(csv_file)

        # skip the header
        next(reader)

        # read remaining rows
        for row in reader:
            parse_data_row(row, all_exercises)

    return all_exercises


def parse_data_row(row, all_exercises):
    """Parse the data row.

    Row Schema: Date,Exercise,Category,Weight (kgs),Reps,Distance,Distance Unit,Time

    """

    name = row[1]
    group = row[2]

    exercise = all_exercises.get(name, Exercise(name, group))
    exercise.add_data(row)

    all_exercises[name] = exercise


class Exercise(object):
    """Store data for each exercise.

    Schema:
    Exercise name
    Workout Data:
    Data -> [(Weight, Reps)]
    """

    def __init__(self, name, group):
        self.name = name
        self.group = group
        self.workouts = collections.defaultdict(list)
        self.max_weight = 0
        self.estimated_max_weight = 0

    def __json__(self):
        return {'name': self.name,
                'group': self.group,
                'num_workouts': self.get_num_workouts(),
                'max_weight': self.max_weight,
                'estimated_max': self.estimated_max_weight
                }

    def add_data(self, data):
        workout_date = data[0]
        weight = float(data[3])
        num_reps = int(data[4])

        if weight > self.max_weight:
            self.max_weight = weight

        self.estimated_max_weight = max(self.estimated_max_weight,
                                        get_estimated_max_weight(weight, num_reps))

        self.workouts[workout_date].append((weight, num_reps))

    def get_num_workouts(self):
        return len(self.workouts.keys())


##########################
## Public API functions ##
##########################


def get_frequent_exercises(filename, limit):
    """Return the most frequent exercises"""

    # get exercise data
    exercise_data = parse_csv(filename)

    exercise_frequency = {}
    for name, exercise in exercise_data.items():
        exercise_frequency[name] = exercise.get_num_workouts()

    # sort exercises based on their frequency
    favorite_exercises = sorted(exercise_frequency,
                                key=exercise_frequency.get,
                                reverse=True)

    # only show the top limit exercises
    limit = min(limit, len(favorite_exercises))
    favorite_exercises = favorite_exercises[:limit]

    return {name : exercise_frequency[name] for name in favorite_exercises}


def get_group_splits(filename):
    """Returns the split between different body groups"""

    # get exercise data
    exercise_data = parse_csv(filename)

    exercise_group_counts = collections.defaultdict(int)
    for _, exercise in exercise_data.items():
        exercise_group_counts[exercise.group] += exercise.get_num_workouts()

    return exercise_group_counts


def get_all_exercises(filename):
    """Return the names of all the exercises."""

    # get exercise data
    exercise_data = parse_csv(filename)
    return list(exercise_data.keys())


def get_exercise_data(filename, exercise_name):
    """Returns data for the particular exercise"""

    # get exercise data
    exercise_data = parse_csv(filename)

    return exercise_data[exercise_name].__json__()


def get_exercise_volume(filename, exercise_name):
    """Returns the workout volume for this exercise"""

    # get data for all exercises
    exercise_data = parse_csv(filename)

    # get exercise data
    exercise = exercise_data[exercise_name]

    # store date vs volume
    date_volume_dict = {}

    for date, workout in exercise.workouts.items():
        volume = 0

        # calculate volume for workout
        for set in workout:
            volume += (set[0] * set[1])

        # add to dict
        date_volume_dict[date] = volume

    return date_volume_dict


def get_exercise_weights(filename, exercise_name):
    """Returns the weights lifted over time for this exercise."""

    # get data for all exercises
    exercise_data = parse_csv(filename)

    # get exercise data
    exercise = exercise_data[exercise_name]

    # weight over time
    date_weight_dict = {}

    for date, workout in exercise.workouts.items():
        # get max weight in the workout
        max_weight = max(workout, key=lambda x: x[0])[0]

        date_weight_dict[date] = max_weight

    return date_weight_dict


def get_exercise_estimated_max(filename, exercise_name):
    """Returns the estimated max over time."""

    # get data for all exercises
    exercise_data = parse_csv(filename)

    # get exercise data
    exercise = exercise_data[exercise_name]

    # estimated max over time
    date_estimated_max_dict = {}

    for date, workout in exercise.workouts.items():
        # max estimated for this date
        max_estimated = 0

        # get the estimated max
        for weight, num_reps in workout:
            max_estimated = max(max_estimated,
                                get_estimated_max_weight(weight, num_reps))

        date_estimated_max_dict[date] = max_estimated

    return date_estimated_max_dict