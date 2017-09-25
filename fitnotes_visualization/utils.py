# -*- coding: utf-8 -*-
"""Helper utilities and decorators."""
from flask import flash
from flask.json import JSONEncoder
from fitnotes_visualization.extensions import cache

import json
import uuid

def flash_errors(form, category='warning'):
    """Flash all errors for a form."""
    for field, errors in form.errors.items():
        for error in errors:
            flash('{0} - {1}'.format(getattr(form, field).label.text, error), category)


def generate_filename():
    """Generate a random filename with extension"""
    return str(uuid.uuid4()) + ".csv"


def get_estimated_max_weight(weight, num_reps):
    """Returns the estimated max weight based on weight and reps."""
    return int(weight * (1 + num_reps // 30))