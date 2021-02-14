# Bugs and known issues
The list of problems

## b/001 - Negative Y problem
### Info
Issued by: TheCasachii

In Retapis since: v1.0
### Description
When a shape is drawn using [RetapisClosedShape.show()](RetapisClosedShape.md#draw) and at least one of its vertices has a negative Y value, the shape flips over the top of the canvas, mirroring the negative part. The minus sign is propably lost during translation and rotation.

### Proposed fix

#### Quick fix (temporary)

- Set `shape.fixoff` to a positive value, at least its height ([Convert.modelFromFile()](Convert.md#modelFromFile) is already doing it)
- OR translate to a positive value and draw the shape with a negative offset (e.g. `shape.show(scene, new RetapisXYPos(-10, -10)`)

#### Permanent fix

- Find where `y` value is getting positive.
  `const sign = y / Math.abs(y);` will get the sign. You could use it to identify if vertex is off screen. Maybe can be used to fix the issue
