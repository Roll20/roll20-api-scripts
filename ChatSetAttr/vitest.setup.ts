import { vi } from "vitest";

import { default as SA } from "lib-smart-attributes";
import { default as underscore } from "underscore";

import { mockedOn, simulateChatMessage, mockTriggerEvent } from "./src/__mocks__/eventHandling.mock";
import { mockCreateObj, mockFindObjs, mockGetAllObjs, mockGetAttrByName, mockGetObj } from "./src/__mocks__/apiObjects.mock";
import { getSheetItem, setSheetItem } from "./src/__mocks__/beaconAttributes.mock";
import { log } from "./src/__mocks__/utility.mock";
import { h, s } from "./src/utils/chat";

// region Global Declarations
declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  var state: Record<string, any>;
  var executeCommand: typeof simulateChatMessage;
  var triggerEvent: typeof mockTriggerEvent;
  var _: typeof underscore;
  var libSmartAttributes: typeof SA;
};

// region Libraries
global._ = underscore;

// region Logging
global.log = log;

// region Event Handling
global.on = mockedOn;
global.triggerEvent = mockTriggerEvent;
global.executeCommand = simulateChatMessage;

// region State
global.state = {
  ChatSetAttr: {
    version: "1.10",
    playersCanModify: true,
    playersCanEvaluate: true,
    useWorkers: true
  }
};

// region Objects
global.getObj = vi.fn(mockGetObj);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.findObjs = vi.fn(mockFindObjs) as any;
global.createObj = vi.fn(mockCreateObj);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.getAllObjs = vi.fn(mockGetAllObjs) as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.getAttrByName = vi.fn(mockGetAttrByName) as any;

// region Beacon Attributes
global.getSheetItem = getSheetItem;
global.setSheetItem = setSheetItem;

// region Utility Functions
global.playerIsGM = vi.fn();
global.sendChat = vi.fn();

// region Requirements
global.libSmartAttributes = SA;
global.libUUID = {
  generateRowID: vi.fn(() => "unique-rowid-1234"),
  generatelibUUID: vi.fn(() => "unique-libUUID-5678")
};

// region JSX Helpers
global.h = h;
global.s = s;
// endregion