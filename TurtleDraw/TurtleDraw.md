# Turtle Draw

This script provides a way to draw rooms by walking our 'turtle' around the grid map.  A UI is displayed that allows the user to move in the four directions while raising or lowering the pen. Two colors are possible for lines ...door color and wall coloring.

This makes it extremely quick to draw up a simple or complex room by clicking up, down, left, right.  The lines follow the edge of the standard grid.  This is Much more precise than trying to use the drawing tools.

The interface is displayed in the chat window and the user can click on the links to move to command the turtle.  The user can also drag the cursor displayed in the map window to start drawing at a different place on the map.

## Command Format

__!turtle start LEFT TOP__ =>
 Defines the starting point of our turtle.  LEFT and TOP are in grid units NOT pixels.  A small block cursor is displayed at this starting point to show where lines will be drawn from.  The user can also drag the cursor to any location on the screen (it will snap to the nearest grid).

__!turtle moveturtle [up|down|left|right|U|D|L|R]__ =>
Move the turtle in the direction indicated.  A line (if the pen is down) will be drawn in the direction of movement.  For example, "!turtle moveturtle L" draws a line from the cursor to the left.

__!turtle [up|down]__ =>
Either put the pen up (don't draw) or put pen down (draw).  If the pen is up, any movement from 'moveturtle' will simply move the cursor without drawing a line.  For example, '!turtle up' raises our pen and stops drawing.

__!turtle [door|wall]__ =>
Sets the color of the line drawn when the turtle moves - 'door' indicates door color (brown) and 'wall' indicates wall color (black).  For example, '!turtle door' turns on door color.

## User interface

The interface is displayed in the chat window and looks similar to the output below.

```
                [Move Up]
  [Move Left]               [Move Right]
                [Move down]
  [Pen Up]                   [Pen Down]
  [Door Color]               [Wall Color]
```
