import re

# Parse SVG path and render an ascii grid
# M40 0H0v40c0-22.091 17.909-40 40-40z

grid = [['.' for _ in range(40)] for _ in range(40)]

# Let's just check the bounds
# Path:
# 1. M 40 0 (move to 40,0)
# 2. H 0 (line to 0,0)
# 3. v 40 (line to 0,40)
# 4. c 0 -22.091, 17.909 -40, 40 -40 (curve to 40,0)

# The shape is bounded by:
# y = 0
# x = 0
# and a curve from (0,40) to (40,0)

for y in range(40):
    for x in range(40):
        # Is (x,y) inside the shape?
        # The curve goes from (0,40) to (40,0)
        # It curves inwards towards (40,40)?
        # The center of the circle is (40,40).
        # Radius is 40.
        # Equation of circle: (x-40)^2 + (y-40)^2 = 40^2
        # For points inside the top-left shape:
        # x >= 0, y >= 0
        # And distance to (40,40) must be >= 40 (outside the circle)?
        # Wait, if the center is (40,40) and radius is 40, then (0,40) is distance 40. (40,0) is distance 40.
        # The point (0,0) has distance sqrt(40^2 + 40^2) = 56.5 > 40.
        # So the solid region is OUTSIDE the circle!
        # So (x-40)^2 + (y-40)^2 >= 1600.
        if (x-40)**2 + (y-40)**2 >= 1600:
            grid[y][x] = '#'

for y in range(0, 40, 2): # step by 2 to make it roughly square
    print(''.join(grid[y]))

