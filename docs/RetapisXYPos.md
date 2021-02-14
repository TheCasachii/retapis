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
var playerPosition = new RetapisXYPos(100, 100);
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
