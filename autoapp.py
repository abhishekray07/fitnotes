# -*- coding: utf-8 -*-
"""Create an application instance."""
from flask.helpers import get_debug_flag

from fitnotes_visualization.app import create_app
from fitnotes_visualization.settings import DevConfig, ProdConfig

CONFIG = DevConfig if get_debug_flag() else ProdConfig

app = create_app(CONFIG)
# app.run(debug=True, host='0.0.0.0', port=5050)