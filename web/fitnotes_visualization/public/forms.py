# -*- coding: utf-8 -*-
"""Public forms."""
from flask_wtf import Form
from flask_wtf.file import FileField, FileAllowed, FileRequired
from fitnotes_visualization.extensions import uploads

class UploadForm(Form):
    """Upload Form."""
    workout_data = FileField('Workout Data', validators=[FileRequired(), FileAllowed(uploads, 'Data files only!')])

