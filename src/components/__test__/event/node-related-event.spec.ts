import { describe, test, expect, vi, beforeEach } from "vitest";
import { MindWired } from "@/components/mind-wired";
import { Configuration } from "@/components/config";
import { DomUtil } from "@/service/dom";
import type { NodeSpec } from "@/components/node/node-type";
import { EVENT, NodeDragEventArg } from "@/mindwired-event";
import { EventBus } from "@/service/event-bus";
import { casting } from "@/__test__/test-util";

describe("node", () => {
  let eventBus = new EventBus();
  let mwd: MindWired;
  let model: NodeSpec;
  beforeEach(() => {
    const config = Configuration.parse(
      {
        el: "#app",
        ui: { width: "400px" },
      },
      new DomUtil(),
      eventBus
    );
    mwd = new MindWired(config);
    model = casting.widthNode(
      {
        model: { text: "ROOT" },
        subs: [{ model: { text: "One" } }],
      } as Partial<NodeSpec>,
      { pos: { x: 20, y: 30 } }
    );
    mwd.nodes(model);
  });

  test("node.created", () => {
    const spyEmitOnEvent = vi.spyOn(eventBus, "emit");
    mwd.listenStrict(EVENT.NODE.CREATED, () => {});

    const two = mwd.addNode(mwd.rootUI, casting.withModel({ text: "Two" }));
    expect(two.parent.uid).toBe(mwd.rootUI.uid);

    const three = mwd.addNode(mwd.rootUI, casting.withModel({ text: "Three" }));
    expect(three.parent.uid).toBe(mwd.rootUI.uid);

    expect(spyEmitOnEvent).toHaveBeenCalledTimes(2);

    expect(mwd.rootUI.childNodes.length).toBe(3);
  });

  test("node.deleted", () => {
    const spyEmitOnEvent = vi.spyOn(eventBus, "emit");
    let called = 0;
    mwd.listenStrict(EVENT.NODE.DELETED, (e) => {
      called++;
    });

    const one = mwd.findNode((node) => node.spec.model.text === "One");
    expect(one).toBeDefined();
    mwd.deleteNodes([one]);

    expect(spyEmitOnEvent).toHaveBeenCalled();
    expect(called).toBe(1);
    expect(mwd.rootUI.childNodes.length).toBe(0);
  });

  test("dragging node", () => {
    /**
     * offset of root node is marked on ui.setting
     */
    expect(mwd.rootUI.spec.view.x).toBe(0);
    expect(mwd.rootUI.spec.view.y).toBe(0);
    expect(mwd.config.ui.offset.x).toBe(20);
    expect(mwd.config.ui.offset.y).toBe(30);

    const sub00 = mwd.rootUI.childNodes[0];
    const { uid } = sub00;
    const { view } = sub00.spec;
    const { x, y } = view;
    const selectionModel = mwd.getNodeSelectionModel();
    selectionModel.selectNodes([sub00], false);

    mwd.config.emit<NodeDragEventArg>(EVENT.DRAG.NODE, {
      nodeId: uid,
      state: "ready",
      target: "all",
      x: 0,
      y: 0,
    });
    mwd.config.emit<NodeDragEventArg>(EVENT.DRAG.NODE, {
      nodeId: uid,
      state: "drag",
      target: "all",
      x: 2,
      y: 5,
    });
    expect(view.x).toBe(x + 2);
    expect(view.y).toBe(y + 5);
    mwd.config.emit<NodeDragEventArg>(EVENT.DRAG.NODE, {
      nodeId: uid,
      state: "drag",
      target: "all",
      x: 6,
      y: 4,
    });
    expect(view.x).toBe(x + 6);
    expect(view.y).toBe(y + 4);
    mwd.config.emit<NodeDragEventArg>(EVENT.DRAG.NODE, {
      nodeId: uid,
      state: "done",
      target: "all",
      x: 8,
      y: 8,
    });
    expect(view.x).toBe(x + 6);
    expect(view.y).toBe(y + 4);
  });
});
