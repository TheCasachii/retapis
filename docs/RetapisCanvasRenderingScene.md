# RetapisCanvasRenderingScene
A canvas and its translations.

## Attributes

```typescript
  canvas: HTMLCanvasElement | null;
  context: CanvasRenderingContext2D | null;
  dofill: boolean;
  dostroke: boolean;
  pivotVisible: boolean;
  fillColour: string;
  strokeColour: string;
  backgroundColour: string;
  debug: boolean;
  translationStack: any[][];
  translation: RetapisXYPos;
  rotation: RetapisAngle;
  rotationPivot: RetapisXYPos;
```

## Constructor

```typescript
RetapisCanvasRenderingScene() => RetapisCanvasRenderingScene
```

The constructor takes no parameters. Additional settings are tweaked later.

Example:

```typescript
let scene = new RetapisCanvasRenderingScene;
```

## push

```typescript
RetapisCanvasRenderingScene.push() => void
```

Pushes the current translation onto the translation stack. You can then translate to different coordinates and revert the previous translation later.

Example:

```typescript
...
scene.push();
scene.translate(newPos);
playerSprite.show(scene);
...
```
