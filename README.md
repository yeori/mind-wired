# mind-wired

## 1. installing

### 1.1. installing library

```
npm install @mind-wired/core
```

### 1.2. html

MDWD library needs a placeholder for mindmap

```html
<html>
  <head>
    <link rel="stylesheet" href="mind-wired.css"/>
    <script src="mind-wired.js"></script>
  </head>
  <body>
    <div id="mmap-root">
  </body>
</html>
```

- `#mmap-root` - placeholder for rendering(free for naming)
- `mind-wired.css` - required for minimal styling
- `mind-wired.js` - mind-wired library

creating an instance of **mind-wired**

```html
<html>
  <head>
    <link .../>
    <script ...></script>
  </head>
  <body>
    <div id="mmap-root">
  </body>

  <script>
    window.mindwired.init({
      el: "#mmap-root",
      ui: null,
    }).then((mwd) => {
      // install nodes here
      mwd.nodes({
        model: {
          type: "text",
          text: "Mind\nWired",
        },
        view: {x: 0, y: 0}
      })
    })
  </script>
</html>
```

- It has a singl root node, `Mind\nWired`
- `\n` means linewrap

`ui: null` creates 600x600 canvas. You can specify canvas size.

```javascript
mindwired.init({
  el: ...,
  ui: {width: 800, height: 800}
})
```

- 800x800 canvas

Let's prepare tree structure

```
MindWired
 |
 +- Left at (-70, -40)
 |
 +- Right at (70, -20)
     +- Cat at (60,  0)
     +- Dog at (60, 40)
```

- root `MindWried` has two children, `Left` and `Right`
- node `Right` has two children, `Cat` and `Dog`

node structrue

```html
# SAMPLE 02
<html>
  <body>
    ...
  </body>
  <script>
    window.mindwired
      .init(...)
      .then((mwd) => {
        // install nodes here
        mwd.nodes({
          model: {
            type: "text",
            text: "Mind\nWired",
          },
          view: { x: 0, y: 0 },
          subs: [
            {
              model: { text: "Left" },
              view: { x: -70, y: -40 }
            },
            {
              model: { text: "Right" },
              view: { x: 70, y: -20 },
              subs: [
                {
                  model: { text: "Cat" },
                  view: { x: 60, y: 0 }
                },
                {
                  model: { text: "Dog" },
                  view: { x: 60, y: 40 }
                },
              ],
            },
          ],
        });
      });
  </script>
</html>
```

- coord (x, y) is relative to it's parent node
- Node `Dog`is at (60, 40) from its parent `Right`
- Node `Right` is at (70, -20) form it's parent `MindWired`
- Nodes `Left`, `Cat` and `Dog` has no child. (`subs` can be skipped)

## 2. Style

### 2.1. Canvas Style

#### 2.1.1. Snap to node

MindWired supports **_snap to node_**, which help node alignment while dragging.

```javascript
window.mindwired
  .init({
    ...
    ui: {
      ...
      snap: {           # optional
        limit: 4,       # when a node is within 4 pixels
        width: 0.4,     # snap line width
        dash: [6, 2],   # dashed line style
        color: "red",   # line color
      },
  }).then(...)
```

- Snap guide line is displayed when a node is whithin 4 pixels to the adjacent nodes.

You can disable `snap to node` by setting `false`

```javascript
window.mindwired
  .init({
    ...
    ui: {
      ...,
      snap: false
  }).then(...)
```

### 2.2. Node Style

All nodes are given some class values to support css styling.

After initialization, a `viewport`, `canvas` and `div.mwd-nodes` are injected into the element you specify

```html
<div id="mmap-root">
  <!-- geneared automatically by mind-wired -->
  <div data-mind-wired-viewport>
    <canvas></canvas>
    <div class="mwd-nodes">
      <div class="mwd-node">
        <div class="node-body">...</div>
      </div>
      <div class="mwd-node">
        <div class="node-body">...</div>
      </div>
    </div>
  </div>
</div>
```

- `data-mind-wired-viewport` is reserved data attribute
- Edges are rendered on `canvas`
- Nodes are placed on `.mwd-nodes`
- Each node is rendered on `.mwd-node > .node-body`

#### 2.2.1. Level class value

Each node is assigned `level` property, 0 for root node, 1 for child of root node and so on, which is used for level class value.

```

[TOP]
  +- [Left]
  |
  +- [Right]
        |
        +--[Cat]

```

- Root node `TOP` - `class="level-0"`
- Node `Left` - `class="level-1"`
- Node `Right` - `class="level-1"`
- Node `Cat` - `class="level-2"`

Here is css to assign rouned border with bigger text to root node,

```css
[data-mind-wired-viewport] .mwd-body.level-0 {
  border: 1px solid #444;
  border-radius: 8px;
  font-size: 1.5rem;
}
```

- be sure to keep `.node-body` together to override default css style

If you want to define style for level 1(`Left`, `Right`)

```css
[data-mind-wired-viewport] .mwd-body.level-1 {
  font-size: 1.25rem;
  background-color: #e9ffe0;
  color: darkgreen;
}
```

#### 2.2.2. Type Style

### 3.2. Edge Style

```
node: {
  model { ... },
  view: {
    x: ...,
    y: ...,
    layout: ...,
    edge: {
      name: 'line',  # name of edge renderer
      color: 'blue', # edge color
      width: 4       # edge width
    }
  }
}
```

- path : `node.view.edge`

#### Edge Renderer

1. line
2. natural curve
3. mustache

#### Edge Color

- color keyword - https://www.w3.org/wiki/CSS/Properties/color/keywords
- web color (ex `#acdefg`)

## 4. Short Key

### Node

### on idle node

| Ctrl | Alt | Shift | KEY | description |
| ---- | --- | ----- | --- | ----------- |
|      |     |       |     | none        |

| Ctrl | Alt | Shift   | Click   | description        |
| ---- | --- | ------- | ------- | ------------------ |
|      |     |         | `click` | make node active   |
|      |     | `shift` | `click` | add node to active |

#### on active state

- When one or more nodes are selected

| Ctrl | Alt | Shift   | KEY      | description                               |
| ---- | --- | ------- | -------- | ----------------------------------------- |
|      |     |         | `Enter`  | insert sinbling of active node `enter`    |
|      |     | `shift` | `Enter`  | insert child on active node `shift+enter` |
|      |     |         | `Delete` | delete active node(s), `fn+delete` in mac |
|      |     |         | `Space`  | start editing state of active node        |

#### on editing state

- When editor of an active node is open

| Ctrl | Alt | Shift | KEY     | description                       |
| ---- | --- | ----- | ------- | --------------------------------- |
|      |     |       | `Enter` | save data and finish editing      |
|      |     |       | `esc`   | finish editing state without save |
