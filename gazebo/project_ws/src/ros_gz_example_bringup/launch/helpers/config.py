import math
from .classes.core.pose import Pose

# constants
DEFAULT_POSITION = 0.0
HORIZONTAL_YAW = math.pi / 2
ATOMIC_GAP = 0.0001

# size of the map
MAP_WIDTH = 10
MAP_HEIGHT = 5

# obstacles
N_WALL_OBSTACLES = 10
MIN_WALL_LENGTH = 0.5

# walls
WALL_HEIGHT = 0.5
WALL_THICKNESS = 0.1
WALL_GAP = WALL_THICKNESS + ATOMIC_GAP

# robots
ROBOT_NAMES = ["pino", "chio"]
ROBOT_STARTER_POSES = [Pose(y=0), Pose(y=1)]
