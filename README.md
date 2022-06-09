# MindWired

<img width="610" alt="mind-wired-demo" src="https://user-images.githubusercontent.com/10085153/171831668-f291fd79-ee76-4da7-89cb-a3a00bd67527.png">

[VIEW DEMO](https://codepen.io/yeori/pen/XWZYejP)

`MindWired` is javascript library to build mindmap.

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
    <link rel="stylesheet" href="mind-wired.css" />
    <script src="mind-wired.js"></script>
  </head>
  <body>
    <div id="mmap-root"></div>
  </body>
</html>
```

- `#mmap-root` - placeholder for rendering(free for naming)
- `mind-wired.css` - required for minimal styling
- `mind-wired.js` - mind-wired library

creating an instance of **mind-wired**

> Sample 01: https://codepen.io/yeori/pen/abqGZWp

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

- 800x800 canvas.
- `{width: "100%", height: 600}` is possible.

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

> Sample 02: [https://codepen.io/yeori/pen/GRQdqPz](https://codepen.io/yeori/pen/GRQdqPz)

```html
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

MindWired supports **_snap to node_**, which helps node alignment while dragging.

```javascript
window.mindwired
  .init({
    ...
    ui: {
      ...
      snap: {           # optional
        limit: 4,       # within 4 pixels
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
- `level number` changes whenever depth of node changes(except root node)

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

#### 2.2.2. Schema

A group of nodes need to have same style regardless of level (`pizza`, `bread`, `cheese` with same border, background and font style).

Schema is defined in each node

```javascript
{
  model: {
    text: "What to eat for lunch?",
  },
  view: {...},
  subs: [{
    model:{
      text:'Pizza',
      schema: 'food'
    },
    view: {...}
  }, {
    model:{
      text:'Bread',
      schema: 'food'
    },
    view: {...}
  }, {
    model:{
      text:'Fried Chicken',
      schema: 'food'
    },
    view: {...}
  }]
}
```

- path - `model.schema` in each node definition
- type: `string`

It is rendered as class value

```html
<div id="mmap-root">
  <!-- geneared automatically by mind-wired -->
  <div data-mind-wired-viewport>
    <canvas></canvas>
    <div class="mwd-nodes">
      <div class="mwd-node">
        <div class="node-body">...</div>
        <div class="mwd-subs">
          <!-- nodes with schema 'food' are assigned class 'food' -->
          <div class="mwd-node">
            <div class="node-body food">[Pizza]</div>
          </div>
          <div class="mwd-node">
            <div class="node-body food">[Bread]</div>
          </div>
          <div class="mwd-node">
            <div class="node-body food">[Fried Chicken]</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

- class `food` is assigned, which is the name of `schema`

Nodes of schema `food` can be styled like

```css
[data-mind-wired-viewport] .mwd-body.food {
  background-color: #ffec48;
  border-radius: 60% 30% 60% 30%;
  padding: 2px 4px;
  font-weight: 500;
  color: #6d4800;
}
```

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

- path : `view.edge` of node
- 4 edge styles(`line`, `natural_curve`, `mustache_lr` and `mustache_tb`) are available.
- All nodes inherite edge style from it's parent(and so on)

#### Example: mustache_lr edge

Let install `mustache_lr` edge on the root node

> SAMPLE 03: [https://codepen.io/yeori/pen/KKQRgdg](https://codepen.io/yeori/pen/KKQRgdg)

```javascript
window.mindwired
  .init({...})
  .then((mwd) => {
    // install nodes here
    mwd.nodes({
      model: {
        type: "text",
        text: "Mind\nWired",
      },
      view: {
        x: 0,
        y: 0,
        edge: {
          name: 'mustache_lr',
          color: '#53ab76',
          width: 2
        }
      },
      subs: [...],
    });
  });
```

- path : `view.edge` of node
- color - keyword defined in [css color keywords](https://www.w3.org/wiki/CSS/Properties/color/keywords) or web color (ex `#acdeff`)

#### Edge preview

**1. line**

<img width="380" alt="edge-line" src="https://user-images.githubusercontent.com/10085153/172753643-b133ae68-930e-4d47-a432-080bdc3951c2.png">

```javascript
      // for line edge
      view: {
        x: ..., y: ...,
        edge: {
          name: 'line',
          color: ...,
          width: ...
        }
      }
```

**2. mustache_lr (bottom)**

<img width="380" alt="edge-mustache_lr" src="https://user-images.githubusercontent.com/10085153/172753940-cb990a50-275a-4c0e-be55-a57fd19bbc14.png">

```javascript
      // for mustach_lr bottom edge
      view: {
        x: ...,
        y: ...,
        edge: {
          name: 'mustache_lr',
          option: {
            valign: "bottom",
          },
          color: ...,
          width: ...
        }
      }
```

**3. mustache_lr(center)**

<img width="380" alt="edge-mustache_lr_center" src="https://user-images.githubusercontent.com/10085153/172754612-8e3ad1f3-145d-47dd-a71b-d3335171eafc.png">

```javascript
      // for mustach_lr center edge
      view: {
        x: ...,
        y: ...,
        edge: {
          name: 'mustache_lr',
          // option: {
          //   valign: "center",
          // },
          color: ...,
          width: ...
        }
      }
```

- `center` is default

**4. mustache_tb**

<img width="380" alt="edge-mustache_tb" src="https://user-images.githubusercontent.com/10085153/172754846-e72d3a9b-3790-46b8-ad8a-ed98dfecacd9.png">

```javascript
      // for mustach_lr center edge
      view: {
        x: ...,
        y: ...,
        edge: {
          name: 'mustache_tb',
          color: ...,
          width: ...
        }
      }
```

**5. natural_curve**

<img width="380" alt="edge_natural_curve" src="https://user-images.githubusercontent.com/10085153/172755872-e84fb959-e6af-4ea3-8ea3-5f1867d9103a.png">

```javascript
      // for natural_curve center edge
      view: {
        x: ...,
        y: ...,
        edge: {
          name: 'natural_curve',
          color: ...,
          width: ...
        }
      }
```

## 4. Layout

When you drag node `Right` to the left side of the root node in [Sample 03](https://codepen.io/yeori/pen/KKQRgdg), child nodes `cat` and `Dog` keep their side, which results in annoying troublesome(have to drag all sub nodes and so on).

![should move the child nodes](https://user-images.githubusercontent.com/10085153/171351766-144a789e-51de-4e50-8962-7296221ba3e0.png)

`Layout` can help moving all descendant nodes to the opposite side when a node moves.

Let's install `X-AXIS` on the root node

> Sample 04: [https://codepen.io/yeori/pen/rNJvMwp](https://codepen.io/yeori/pen/rNJvMwp)

```javascript
window.mindwired
  .init({...})
  .then((mwd) => {
    // install nodes here
    mwd.nodes({
      model: {...},
      view: {
        x: 0,
        y: 0,
        layout: {type: 'X-AXIS'},
        edge: {...}
      },
      subs: [...],
    });
  });
```

- path: `view.layout` of node
- All nodes inherits layout configuration from the parent node.
- Dragging node `Right` to the opposite side makes `Cat` and `Dog` change their sides.

## 5. Events

### 5.1. Node

| event name     | description                              |
| -------------- | ---------------------------------------- |
| `node.created` | node(s) created                          |
| `node.updated` | node(s) updated(content, position, path) |
| `node.deleted` | node(s) updated                          |

#### node.created

event triggered when node is created(`Enter`, or `Shift+Enter`)

```javascript
window.mindwired
  .init({...})
  .then((mwd) => {
    mwd.nodes(...);
    // install event listener
    mwd.listen('node.created', (e) => {
      const { nodes } = e;
      console.log('[CREATED]', nodes);
    })
  });
```

#### node.updated

triggered when node is updated by

- dragging
- changing parent
- parent deleted

```javascript
window.mindwired
  .init({...})
  .then((mwd) => {
    mwd.nodes(...);
    // install event listener
    mwd.listen('node.updated', (e) => {
      const {nodes, type} = e;
      console.log('[UPDATED]', nodes, type);
    })
  });
```

- nodes - updated nodes
- type - one of `path`, `pos`, `model`

`type` have one of three values.

1. `path` - means the nodes have changed parent(by dragging control icon).
1. `pos` - means the nodes move by dragging
1. `model` - content has updated(text, icon, etc)

#### node.deleted

triggered when node is deleted(`delete`, `fn+delete` in mac)

```javascript
window.mindwired
  .init({...})
  .then((mwd) => {
    mwd.nodes(...);
    // install event listener
    mwd.listen('node.deleted', (e) => {
      const {nodes} = e;
      console.log('[DELETED]', nodes);
    })
  });
```

If deleted node has children, they are moved to **node.parent**, which triggers `node.updated` event

## 6. Short Key

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

## 7. Store, Load

Current mindmap can be serialized to `json` text.

```javascript
let mwd;
window.mindwired.
  .init({...})
  .then(instance => {
    // 1. binding mindmap instance
    mwd = instance;
  })

btnSave.addEventListener('click', () => {
  // 2. export as json
  mwd.export("json").then((json) => {
    console.log(json);
    // saved on localStorage or sent to backend-server
  });
}, false)
```

You can load the map from json text.

```javascript
let mwd;
load_from_your_server().then(res => {
  const json = res.json // from your server
  window.mindwired.
    .init({...})
    .then(instance => {
      // 3. load the map from json
      mwd = instance;
      const nodes = JSON.parse(json);
      mwd.nodes(nodes);
    })
})

```
