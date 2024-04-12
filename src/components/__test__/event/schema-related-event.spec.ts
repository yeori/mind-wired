import { mockConfig } from "@/__test__/test-util";
import { MindWired } from "@/components/mind-wired";
import { EVENT, type MindWiredEvent, SchemaEventArg } from "@/mindwired-event";
import { describe, test, beforeEach, vi, expect } from "vitest";

describe("schema event", () => {
  let mwd: MindWired;
  beforeEach(() => {
    const config = mockConfig.create();
    mwd = new MindWired(config);
  });

  test("add schema", () => {
    vi.useFakeTimers();
    const { mock } = vi.spyOn(mwd.config, "emit");
    mwd.listenStrict(EVENT.SCHEMA.CREATED, () => {});
    mwd.listenStrict(EVENT.SCHEMA.UPDATED, () => {});

    mwd.registerSchema({ name: "root" });
    vi.advanceTimersToNextTimer();
    let [type, event] = mock.calls[0] as [
      MindWiredEvent<SchemaEventArg>,
      SchemaEventArg
    ];
    expect(type).toBe(EVENT.SCHEMA.CREATED.CLIENT);
    expect(event.type).toBe("create");

    // updating schema
    mwd
      .getSchemaContext()
      .addSchema(
        { name: "root", style: { fontSize: "12px" } },
        { overwriteIfExist: true }
      );
    vi.advanceTimersToNextTimer();

    [type, event] = mock.calls[1] as [
      MindWiredEvent<SchemaEventArg>,
      SchemaEventArg
    ];
    expect(type).toBe(EVENT.SCHEMA.UPDATED.CLIENT);
    expect(event.type).toBe("update");

    mwd.getSchemaContext().removeSchema("root");
    vi.advanceTimersToNextTimer();

    [type, event] = mock.calls[2] as [
      MindWiredEvent<SchemaEventArg>,
      SchemaEventArg
    ];
    expect(type).toBe(EVENT.SCHEMA.DELETED.CLIENT);
    expect(event.type).toBe("delete");
  });
});
