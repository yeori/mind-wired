# MindWired

<img width="610" alt="mind-wired-demo" src="https://user-images.githubusercontent.com/10085153/171831668-f291fd79-ee76-4da7-89cb-a3a00bd67527.png">

**mind-wired** is javascript library to build mindmap.

# 1. installing

```
npm install @mind-wired/core@0.2.0-alpha.2
```

# 2. Client type

## 2.1. Javascript modules(Typescript)

> The example code in this document was generated using Vite(Vanilla + TS).

```
[PROJECT]
  +- assets
  +- src
      +- api.ts
      +- main.ts
  +- index.html
```

#### index.html

The library needs a placeholder for mindmap

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MindWired Demo</title>
  </head>
  <body>
    <div id="mmap-root"><!-- viewport generated here--></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- `#mmap-root` - placeholder for mindmap(You can name it freely)

#### main.ts

It is a minimal initialization code for an instance of **mind-wired**

```ts
/* src/main.ts */
import type { MindWired, NodeSpec, UISetting } from "@mind-wired/core";
import { initMindWired } from "@mind-wired/core";
import "@mind-wired/core/mind-wired.css";
import "@mind-wired/core/mind-wired-form.scss";
import { loadFromServer } from "./api";

window.onload = async () => {
  const mapData: { node: NodeSpec } = await loadFromServer();
  const el = document.querySelector<HTMLDivElement>("#mmap-root")!;
  const mwd: MindWired = await initMindWired({
    el,
    ui: {
      width: "100%",
      height: 500,
    } as UISetting,
  });
  mwd.nodes(mapData.node);
};
```

- initMindWired({el, ui}) - called to initialize mindmap.
- `el` - placeholder for mindmap.
- `ui` - size, scale, class namings and snap layout etc.
- `@mind-wired/core/mind-wired.css` - minimal css style for mindmap. You can add or modify style for your own css(scss). See section `3. Style`
- `@mind-wired/core/mind-wired-form.scss` - style for default editing form.
- `loadFromServer` - fetch mindmap data(nodes, ui, and schema) from your server

You might fetch mindmap data from server like this.

```ts
/* src/api.ts */
export const loadFromServer = (): Promise<{
  node: NodeSpec;
}> => {
  // using axis(...) or fetch(...) in production code
  return Promise.resolve({
    node: {
      model: { text: "Countries\nand\nCities" },
      view: {
        x: 0,
        y: 0,
      },
      subs: [
        {
          model: { text: "Canada" },
          view: { x: -100, y: 0 },
          subs: [
            { model: { text: "Toronto" }, view: { x: -90, y: 0 } },
            { model: { text: "Quebec City" }, view: { x: -10, y: -40 } },
          ],
        },
        {
          model: { text: "Spain" },
          view: { x: 100, y: 0 },
          subs: [
            { model: { text: "Madrid" }, view: { x: 90, y: 90 } },
            { model: { text: "Barcelona" }, view: { x: 100, y: 0 } },
            { model: { text: "Valencia" }, view: { x: 90, y: 45 } },
          ],
        },
      ],
    },
  });
};
```

- root node is positioned at the center of viewport `view: {x:0, y:0}`

`NodeSpec` has three key properties

- model - data of node(plain text, icon badge, or thumbnail)
- view - relative offset (x, y) from it's direct parent node
- subs - direct child nodes, which are also type of `NodeSpec[]`.

For examples,

- Node `Spain(100, 0)` is positioned to the right of the root node.
- Three cities of `Madrid, Barcelona, Valencia` are also positioned to the right of the parent node `Spain`

### 2.2. Svelte

- See [Client Svelte](https://github.com/yeori/mind-wired/wiki/001.client-Svelte)

### 2.3. Vue

- See [Client Vue3](https://github.com/yeori/mind-wired/wiki/002.client-Vue3)

## 2.4. UMD

- See [Client Umd](https://github.com/yeori/mind-wired/wiki/003.client-umd)

# 3. Style

**mind-wired** generates base structure.

```html
<div id="mmap-root">
  <!-- generated automatically by mind-wired -->
  <div data-mind-wired-viewport>
    <canvas></canvas>
    <div class="mwd-selection-area"></div>
    <div class="mwd-nodes"></div>
  </div>
</div>
```

- `[data-mind-wired-viewport]` - reserved data attribute meaning root element of mindmap
- `<canvas></canvas>` - placeholer for edges
- `.mwd-selection-area` - used to highlight selected nodes
- `.mwd-nodes` - placeholder for node structure

## 3.1 Style file

To define your node styles, create a css(scss) file

```
[PROJECT]
  +- assets
      +- mindmap.css (+)
  +- src
      +- main.ts
  +- index.html
```

- `assets/mindmap.css` - you can name it as you want

Then, import the css file

```ts
/* /src/main.ts */
...
import "@mind-wired/core/mind-wired.css";
import "@mind-wired/core/mind-wired-form.scss";
...
import "./assets/mindmap.css"

window.onload = async () => {
  ...
};
```

## 3.2. Snap to node

MindWired supports **_snap to node_**, which helps **node alignment** while dragging.

```ts
initinitMindWired({
  el,
  ui: {
    ...
    snap: {           # optional
      limit: 4,       # within 4 pixels
      width: 0.4,     # snap line width
      dash: [6, 2],   # dashed line style
      color: "red",   # line color
    },
})
```

- Snap guide lines are displayed when a node is whithin 4 pixels to the adjacent nodes.
- Lines are rendered on `<canvas/>`

You can disable it by setting `false`

```ts
initinitMindWired({
  el,
  ui: {
    ...
    snap: false,
})
// or
  ui: {
    snap: {           # optional
      limit: 4,       # within 4 pixels
      width: 0.4,     # snap line width
      dash: [6, 2],   # dashed line style
      color: "red",   # line color
      enabled: false  # disable snap
    },
  }
```

## 3.3. Node Style

All nodes are placed in the `.mwd-nodes` with tree structure(recursively)

```html
<div id="mmap-root">
  <div data-mind-wired-viewport>
    ...
    <div class="mwd-nodes">
      <!-- root node -->
      <div class="mwd-node">
        <div class="mwd-body"></div>
        <div class="mwd-subs">
          <!--child nodes -->
          <div class="mwd-node">..Canada..</div>
          <div class="mwd-node">..Spain..</div>
        </div>
      </div>
    </div>
  </div>
</div>
```

### 3.3.1. Level

Each node is assigned `level` number, 0 for root node, 1 for sub nodes of the root.

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

```html
<div class="mwd-nodes">
  <div class="mwd-node">
    <div class="mwd-body level-0">..TOP..</div>
    <div class="mwd-subs">
      <div class="mwd-node">
        <div class="mwd-body level-1">..LEFT..</div>
      </div>
      <div class="mwd-node">
        <div class="mwd-body level-1">..RIGHT..</div>
        <div class="mwd-subs">
          <div class="mwd-node">
            <div class="mwd-body level-2">..Cat..</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

- level classname(`level-x`) is attached at `.mwd-body`
- **level number** changes whenever depth of node changes(except root node)

For example, here is css to assign rounded border with bigger text to root node,

```css
/* assets/mindmap.css */
[data-mind-wired-viewport] .mwd-body.level-0 {
  border: 1px solid #444;
  border-radius: 8px;
  font-size: 1.5rem;
}
```

- be sure to keep `.node-body` together to override default css style

Style for level-1(`Left`, `Right`)

```css
/* assets/mindmap.css */
[data-mind-wired-viewport] .mwd-body.level-1 {
  color: 'red'
  font-size: 1.25rem;
}
```

### 3.3.2. Schema

A group of nodes(`Canada`, `Spain`) need to have same style(border, background and font style etc) regardless of level.

Schema can be specified in each node

```javascript
{
  node: {
    model: { text: "Countries\nand\nCities" },
    view: {...},
    subs: [
      {
        model: { text: "Canada", schema: 'city' },
        view: {...},
        subs: [...],
      },
      {
        model: { text: "Spain", schema: 'city' },
        view: {...},
        subs: [...],
      },
    ],
  },
}
```

- path - `model.schema` in each `NodeSpec`
- type: `string`

It is rendered as class value

```html
<div class="mwd-nodes">
  <div class="mwd-node">
    <div class="mwd-body level-0">..Countries...</div>
    <div class="mwd-subs">
      <div class="mwd-node city">
        <div class="mwd-body city level-1">..Canada..</div>
      </div>
      <div class="mwd-node city">
        <div class="mwd-body city level-1">..Span..</div>
        ...
      </div>
    </div>
  </div>
</div>
```

- class `city`(schema) is assigned at `.mwd-node` and `.mwd-body`

Nodes with schema `city` can be styled like this

```css
/* assets/mindmap.css */
[data-mind-wired-viewport] .mwd-node.city > .mwd-body.city {
  background-color: gold;
  font-size: 1.2rem;
}
```

- Child Combinator syntax(`.parent > .child`) should be used.
- [https://developer.mozilla.org/en-US/docs/Web/CSS/Child_combinator](https://developer.mozilla.org/en-US/docs/Web/CSS/Child_combinator)

## 3.4. EdgeSpec

> Edges are rendered on `<canvas/>`

```javascript
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

- path : `view.edge` of `NodeSpec`
- 4 edge styles(`line`, `natural_curve`, `mustache_lr` and `mustache_tb`) are available.
- All nodes inherite edge style from it's ancenstors

For example, `mustache_lr` edge on the root node

```ts
export const loadFromServer = () => {
  return Promise.resolve({
    node: {
      model: { text: "Countries\nand\nCities" },
      view: {
        x: 0,
        y: 0,
        edge: { name: "mustache_lr", color: "#2378ff", width: 2 },
      },
      subs: [...],
    },
  });
};
```

- path : `view.edge` (typeof `EdgeSpec`)
- color - keyword defined in [css color keywords](https://www.w3.org/wiki/CSS/Properties/color/keywords) or web color (ex `#acdeff`)
- All descendant nodes inherite `EdgeSpec` from the root node, if they has no one.

### 3.4.1. Edge preview

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

# 4. Layout

When you drag node `Right` to the left side of the root node, child nodes `cat` and `Dog` keep their side, which results in annoying troublesome(have to move all sub nodes to the left of the parent `Right`).

![should move the child nodes](https://user-images.githubusercontent.com/10085153/171351766-144a789e-51de-4e50-8962-7296221ba3e0.png)

**Layout** can help moving all descendant nodes to the opposite side when a node moves.

4 layouts are predefind.

- X-AXIS
- Y-AXIS
- XY-AXIS
- DEFAULT

## 4.1. X-AXIS

```
               [A]
                |
         [B]    |    [B`]
  [C] [D]       |       [D`] [C`]
```

- If node `B` moves to the opposite side `B'`, node `C, D` also moves to `D', C'`

Let's install `X-AXIS` on the root node

```ts
export const loadFromServer = () => {
  return Promise.resolve({
    node: {
      model: { text: "Countries\nand\nCities" },
      view: {
        x: 0,
        y: 0,
        edge: {...},
        layout: {type: 'X-AXIS'},
      },
      subs: [...],
    },
  });
};
```

- path: `view.layout` of `NodeSpec`
- All nodes inherit layout from it's ancenstors if it has no one.
- Dragging node `Right` to the opposite side makes `Cat` and `Dog` change their sides.

## 4.2. Y-AXIS

```
  [C] [D]
         [B]

---------------[A]---------------

         [B']
  [C'][D']
```

## 4.3. XY-AXIS

- `X-AXIS` + `Y-AXIS`

## 4.4. DEFAULT

If root node has no layout, layout `DEFAULT` is assign, which does nothing.

# 5. Events

## 5.1. Node Event

| event name      | description                         |
| --------------- | ----------------------------------- |
| `node.selected` | nodes are selected                  |
| `node.clicked`  | a node is clicked                   |
| `node.created`  | nodes are created                   |
| `node.updated`  | nodes are updated(model, pos, path) |
| `node.deleted`  | nodes are deleted                   |

#### node.selected

triggered when nodes has been selected(activate sate).

```ts
import {..., type NodeEventArg} from "@mind-wired/core";

window.onload = async () => {
  ...
  mwd.listen("node.selected", async (e: NodeEventArg) => {
    const {type, nodes} = e;
    console.log(type, nodes);
  })
};
```

- `node.selected` always preoceds `node.clicked`
- Clicking viewport also triggers the event with empty nodes.

#### node.clicked

triggered when a node has been clicked.

```ts
window.onload = async () => {
  ...
  mwd.listen("node.clicked", async (e: NodeEventArg) => {
    const {type, nodes} = e;
    console.log(type, nodes);
  })
};
```

#### node.created

triggered when nodes has been created(for example `Enter`, or `Shift+Enter`)

```ts
window.onload = async () => {
  ...
  mwd.listen("node.created", async (e: NodeEventArg) => {
    const {type, nodes} = e;
    console.log(type, nodes);
  })
};
```

#### node.updated

triggered when node has been updated by

- dragging, (x, y) changed. (type : `'pos'`)
- changing parent(type: `'path'`)
- content updated(type: `'model'`)

```ts
window.onload = async () => {
  ...
  mwd.listen("node.updated", async (e: NodeEventArg) => {
    const {type, nodes} = e; // type: 'pos' | 'path' | 'model'
    console.log(type, nodes);
  })
};
```

- nodes - updated nodes
- type - one of `path`, `pos`, `model`

`type` have one of three values.

1. `path` - means the nodes have changed parent(by dragging control icon).
1. `pos` - means the nodes move by dragging
1. `model` - content has updated(text, icon, etc)

#### node.deleted

triggered when nodes has been deleted(pressing `delete` key, `fn+delete` in mac)

```ts
window.onload = async () => {
  ...
  mwd.listen("node.deleted", async (e: NodeEventArg) => {
    const { type, nodes } = e; // type: 'delete'
    console.log(type, nodes);
  })
};
```

If deleted node has children, they are moved to **node.parent**, which triggers `node.updated` event

## 6. Short Key

### Node

### on idle node

| Ctrl | Alt | Shift | KEY | description |
| ---- | --- | ----- | --- | ----------- |
|      |     |       |     | none        |

| Ctrl | Alt | Shift   | Click   | description              |
| ---- | --- | ------- | ------- | ------------------------ |
|      |     |         | `click` | make node active         |
|      |     | `shift` | `click` | add node to active state |

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

## 7. Store

Calling `MindWired.exportWith()` exports current state of mindmap.

## 7.1. by listeners

```ts
/* /src/main.ts */
import type {..., NodeEventArg } from "@mind-wired/core";
...

const sendToBackend = (data: ExportResponse) => {
  console.log(data)
}
window.onload = async () => {
  ...
  const mwd: MindWired = await initMindWired({...});
  mwd.nodes(mapData.node);

  mwd
    .listen("node.updated", async (e: NodeEventArg) => {
      const data = await mwd.exportWith();
      sendToBackend(data)
    }).listen("node.created", async (e: NodeEventArg) => {
      const data = await mwd.exportWith();
      sendToBackend(data)
    }).listen("node.deleted", async (e: NodeEventArg) => {
      const data = await mwd.exportWith();
      sendToBackend(data)
    });
};
```

## 7.2. by control ui

You could provide, for example, `<button/>` to export current state of mindmap

```html
<body>
  <nav id="controls">
    <button data-export>EXPORT</button>
  </nav>
  <div id="mmap-root">...</div>
</body>
```

```ts
window.onload = async () => {

  const mwd: MindWired = await initMindWired({...});
  ...
  const btnExport = document.querySelector<HTMLButtonElement>('#controls > [data-export]')
  btnExport!.addEventListener('click', async () => {
    const data = await mwd.exportWith();
    sendToBackend(data)
  }, false)
};

```
