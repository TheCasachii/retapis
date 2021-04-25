# RetapisXYPos
RetapisXYPos is a class defining vectors in Retapis. They can be used to store positions and other 2D vectors.

## Attributes

- x - the horizontal component
- y - the vertical component

## Constructor

```typescript
RetapisXYPos(x: number, y: number) => RetapisXYPos
```

The RetapisXYPos constructor takes x and y as parameters. They specify the initial x and y components of the vector.

Example:

```typescript
let playerPosition = new RetapisXYPos(100, 100);
```

Here, we set the player's initial position to (100, 100).

## distance

```typescript
RetapisXYPos.distance(point: RetapisXYPos) => number
```

The distance method calculates the distance to another point using pythagorean theorem.

Example:

```typescript
if (playerPosition.distance(enemyPosition) < 10) {
  killPlayer();
}
```

## add

```typescript
RetapisXYPos.add(point: RetapisXYPos) => RetapisXYPos
```

The add method sums the X and Y components of source vector and point vector and returns them as RetapisXYPos.

```typescript
...
let translation = new RetapisXYPos(200, 100);
let drawPosition = new RetapisXYPos(100, 150);
let translatedPosition = drawPosition.add(translation); // translatedPosition = (100 + 200, 150 + 100) = (300, 250)
...
```

Example:

```typescript
playerPosition = playerPosition.add(playerVelocity);
```

## diff

```typescript
RetapisXYPos.diff(point: RetapisXYPos) => RetapisXYPos
```

Provides vector difference. Subtracts point from source.


```typescript
playerVelocity = playerVelocity.diff(materialFriction);
```

## zero_x

```typescript
RetapisXYPos.zero_x() => RetapisXYPos
```

**Note: The method will become a getter in future release.**

Returns source vector with the X component set to 0.

Example:

```typescript
let start = new RetapisXYPos(10, 100);
let size = new RetapisXYPos(50, 60);
let endY = start.add(size.zero_x());
```

## zero_y

```typescript
RetapisXYPos.zero_y() => RetapisXYPos
```

**Note: The method will become a getter in future release.**

Returns source vector with the Y component set to 0.

Example:

```typescript
let start = new RetapisXYPos(10, 100);
let size = new RetapisXYPos(50, 60);
let endX = start.add(size.zero_y());
```
## (To be added in Retapis 2.1) GETTER length
         
```typescript
RetapisXYPos.length => number
```

Returns the length of the vector

Example:

```typescript
let currentSpeed = playerVelocity.length;
```

## (To be added in Retapis 2.1) GETTER normalized

```typescript
RetapisXYPos.normalized => RetapisXYPos
```

Returns normalized vector (with length 1)

Example:

```typescript
let playerWalkDirection = playerVelocity.normalized;
```

## Summary

- [RetapisXYPos](#constructor) is a 2D vector implementation. It can be used to store coordinates, force, size etc.
- [v.distance(p)](#distance) calculates distance between v and p.
- [v.add(p)](#add) returns point (v.x + p.x, v.y + p.y)
- [v.diff(p)](#diff) returns point (v.x - p.x, v.y - p.y)
- [v.zero_x()](#zero_x) returns point (0, v.y)
- [v.zero_y()](#zero_y) returns point (v.x, 0)
- [v.length](#length) returns length of v (to be implemented in Retapis 2.1)
- [v.normalized](#normalized) returns point (v.x / v.length, v.y / v.length) (to be implemented in Retapis 2.1)
