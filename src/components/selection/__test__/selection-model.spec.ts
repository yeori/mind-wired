import { casting, mockConfig } from "@/__test__/test-util";
import Configuration from "@/components/config";
import { describe, test, expect, beforeEach, vi } from "vitest";
import { NodeSelectionModel } from "../node-selection-model";
import { EVENT } from "@/mindwired-event";

describe("selection model", () => {
  let config: Configuration;
  let model: NodeSelectionModel;
  beforeEach(() => {
    config = mockConfig.create();
    model = new NodeSelectionModel(config);
  });

  test("replace select", () => {
    const one = casting.mockNode({ text: "One" }, config);

    expect(model.getNodes().length).toBe(0);
    // 1. set ['One']
    // prevents duplicated selection
    model.selectNodes([one], false);
    model.selectNodes([one], false);
    model.selectNodes([one], true);
    expect(model.getNodes().length).toBe(1);

    // 2. appending ['One', 'Two']
    const two = casting.mockNode({ text: "Two" }, config);
    model.selectNodes([two], true);
    expect(model.getNodes().length).toBe(2);
    expect(one.isSelected()).toBeTruthy();
    expect(two.isSelected()).toBeTruthy();

    // 3. set ['Three']
    const three = casting.mockNode({ text: "Three" }, config);
    model.selectNodes([three], false);
    expect(model.getNodes().length).toBe(1);
    expect(one.isSelected()).toBeFalsy();
    expect(two.isSelected()).toBeFalsy();
    expect(three.isSelected()).toBeTruthy();

    // 3. reset []
    const unselectedNodes = model.clearSelection();
    expect(unselectedNodes.length).toBe(1);
    expect(model.isEmpty()).toBeTruthy();
    expect(one.isSelected()).toBeFalsy();
    expect(two.isSelected()).toBeFalsy();
    expect(three.isSelected()).toBeFalsy();
  });

  test("event propagation", () => {
    vi.useFakeTimers();
    const spyOnListen = vi.spyOn(config, "listen");
    config.listen(EVENT.NODE.SELECTED.CLIENT, () => {});

    const one = casting.mockNode({ text: "One" }, config);
    model.selectNodes([one], false, true);

    vi.runAllTimers();
    expect(spyOnListen).toHaveBeenCalled();
  });
});
