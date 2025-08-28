import { it, expect, describe, beforeEach, afterEach, vi } from "vitest"
import {
  TargetAllCharacters,
  TargetAllGMCharacters,
  TargetByName,
  TargetByID,
  TargetBySelection
} from "../../src/classes/Targets";

describe("TargetAllCharacters", () => {
  let target: TargetAllCharacters;

  beforeEach(() => {
    // Set up test environment
    setupTestEnvironment();

    // Create a new instance of TargetAllCharacters for each test
    target = new TargetAllCharacters();
  });

  afterEach(() => {
    // Clean up test environment
    vi.clearAllMocks();
  });

  it("should return all characters when user is GM", () => {
    // Arrange
    const targets: string[] = [];
    const playerID = "player1";
    vi.mocked(playerIsGM).mockReturnValue(true);

    const char1 = createObj("character", { id: "char1", name: "Character 1" });
    const char2 = createObj("character", { id: "char2", name: "Character 2" });

    // Act
    const [result, response] = target.parse(targets, playerID);

    // Assert
    expect(response.errors).toHaveLength(0);
    expect(result).toHaveLength(2);
    expect(result).toContainEqual(char1);
    expect(result).toContainEqual(char2);
  });

  it("should return error when user is not GM", () => {
    // Arrange
    const targets: string[] = [];
    const playerID = "player2";
    vi.mocked(playerIsGM).mockReturnValue(false);

    // Act
    const [result, response] = target.parse(targets, playerID);

    // Assert
    expect(response.errors).toHaveLength(1);
    expect(response.errors[0]).toContain("You do not have permission to use the 'all' target");
    expect(result).toHaveLength(0);
  });

  it("should return error when targets are provided", () => {
    // Arrange
    const targets: string[] = ["char1"];
    const playerID = "player1";
    vi.mocked(playerIsGM).mockReturnValue(true);

    // Act
    const [result, response] = target.parse(targets, playerID);

    // Assert
    expect(response.errors).toHaveLength(1);
    expect(response.errors[0]).toContain("The 'all' target does not accept any targets");
    expect(result).toHaveLength(0);
  });
});

describe("TargetAllGMCharacters", () => {
  let target: TargetAllGMCharacters;

  beforeEach(() => {
    // Set up test environment
    setupTestEnvironment();

    // Create a new instance of TargetAllGMCharacters for each test
    target = new TargetAllGMCharacters();

    // Set up mock state
    state.ChatSetAttr = {
      playersCanModify: false,
      version: 3,
      globalconfigCache: { lastsaved: 0 },
      playersCanEvaluate: true,
      useWorkers: false
    };
  });

  afterEach(() => {
    // Clean up test environment
    vi.clearAllMocks();
  });

  it("should return all GM characters when user is GM", () => {
    // Arrange
    const targets: string[] = [];
    const playerID = "player1";
    vi.mocked(playerIsGM).mockReturnValue(true);

    // Create GM character (empty controlledby field)
    const gmChar = createObj("character", { id: "gmChar", name: "GM Character", controlledby: "" });

    // Create player character (non-empty controlledby field)
    const playerChar = createObj("character", { id: "playerChar", name: "Player Character", controlledby: "player2" });

    // Act
    const [result, response] = target.parse(targets, playerID);

    // Assert
    expect(response.errors).toHaveLength(0);
    expect(result).toHaveLength(1);
    expect(result).toContain(gmChar);
    expect(result).not.toContain(playerChar);
  });

  it("should return all GM characters when player can modify settings", () => {
    // Arrange
    const targets: string[] = [];
    const playerID = "player2";
    vi.mocked(playerIsGM).mockReturnValue(false);
    state.ChatSetAttr.playersCanModify = true;

    // Create GM character (empty controlledby field)
    const gmChar = createObj("character", { id: "gmChar", name: "GM Character", controlledby: "" });

    // Act
    const [result, response] = target.parse(targets, playerID);

    // Assert
    expect(response.errors).toHaveLength(0);
    expect(result).toHaveLength(1);
    expect(result).toContain(gmChar);
  });

  it("should return error when user is not GM and players cannot modify", () => {
    // Arrange
    const targets: string[] = [];
    const playerID = "player2";
    vi.mocked(playerIsGM).mockReturnValue(false);
    state.ChatSetAttr.playersCanModify = false;

    // Act
    const [result, response] = target.parse(targets, playerID);

    // Assert
    expect(response.errors).toHaveLength(1);
    expect(response.errors[0]).toContain("You do not have permission to use the 'allgm' target");
    expect(result).toHaveLength(0);
  });

  it("should return error when targets are provided", () => {
    // Arrange
    const targets: string[] = ["char1"];
    const playerID = "player1";
    vi.mocked(playerIsGM).mockReturnValue(true);

    // Act
    const [result, response] = target.parse(targets, playerID);

    // Assert
    expect(response.errors).toHaveLength(1);
    expect(response.errors[0]).toContain("The 'allgm' target does not accept any targets");
    expect(result).toHaveLength(0);
  });
});

describe("TargetByName", () => {
  let target: TargetByName;

  beforeEach(() => {
    // Set up test environment
    setupTestEnvironment();

    // Create a new instance of TargetByName for each test
    target = new TargetByName();
  });

  afterEach(() => {
    // Clean up test environment
    vi.clearAllMocks();
  });

  it("should find characters by name and filter by permissions", () => {
    // Arrange
    const targets: string[] = ["Character 1", "Character 2", "Character 3"];
    const playerID = "player1";
    vi.mocked(playerIsGM).mockReturnValue(false);

    const char1 = createObj("character", { id: "char1", name: "Character 1", controlledby: "player2" });
    const char2 = createObj("character", { id: "char2", name: "Character 2", controlledby: "player1" });
    const char3 = createObj("character", { id: "char3", name: "Character 3", controlledby: "player2" });

    // Act
    const [result, response] = target.parse(targets, playerID);

    // Assert
    expect(response.errors).toHaveLength(0);
    expect(result).toHaveLength(1);
    expect(result).toContain(char2);
    expect(result).not.toContain(char1);
    expect(result).not.toContain(char3);
  });

  it("should report errors for characters that don't exist", () => {
    // Arrange
    const targets: string[] = ["Character 1", "Nonexistent Character"];
    const playerID = "player1";

    createObj("character", { id: "char1", name: "Character 1" });

    // Act
    const [_, response] = target.parse(targets, playerID);

    // Assert
    expect(response.errors).toHaveLength(1);
    expect(response.errors[0]).toContain("Character with name Nonexistent Character does not exist");
  });

  it("should return error when no targets are provided", () => {
    // Arrange
    const targets: string[] = [];
    const playerID = "player1";

    // Act
    const [result, response] = target.parse(targets, playerID);

    // Assert
    expect(response.errors).toHaveLength(1);
    expect(response.errors[0]).toContain("The 'name' target requires at least one target");
    expect(result).toHaveLength(0);
  });
});

describe("TargetByID", () => {
  let target: TargetByID;

  beforeEach(() => {
    // Set up test environment
    setupTestEnvironment();

    // Create a new instance of TargetByID for each test
    target = new TargetByID();
  });

  afterEach(() => {
    // Clean up test environment
    vi.clearAllMocks();
  });

  it("should filter character IDs by permissions", () => {
    // Arrange
    const targets: string[] = ["char1", "char2", "char3", "char4"];
    const playerID = "player1";
    vi.mocked(playerIsGM).mockReturnValue(false);

    // Create characters to match the test IDs
    const char1 = createObj("character", { id: "char1", name: "Character 1", controlledby: "player2" });
    const char2 = createObj("character", { id: "char2", name: "Character 2", controlledby: "player1" });
    const char3 = createObj("character", { id: "char3", name: "Character 3", controlledby: "player2" });
    const char4 = createObj("character", { id: "char4", name: "Character 4", controlledby: "player1" });

    // Act
    const [result, response] = target.parse(targets, playerID);

    // Assert
    expect(response.errors).toHaveLength(0);
    expect(result).toHaveLength(2);
    expect(result).toContain(char2);
    expect(result).toContain(char4);
    expect(result).not.toContain(char1);
    expect(result).not.toContain(char3);
  });

  it("should return error when no targets are provided", () => {
    // Arrange
    const targets: string[] = [];
    const playerID = "player1";

    // Act
    const [result, response] = target.parse(targets, playerID);

    // Assert
    expect(response.errors).toHaveLength(1);
    expect(response.errors[0]).toContain("The 'id' target requires at least one target");
    expect(result).toHaveLength(0);
  });
});

describe("TargetBySelection", () => {
  let target: TargetBySelection;

  beforeEach(() => {
    // Set up test environment
    setupTestEnvironment();

    // Create a new instance of TargetBySelection for each test
    target = new TargetBySelection();
  });

  afterEach(() => {
    // Clean up test environment
    vi.clearAllMocks();
  });

  it("should filter selected token character IDs by permissions", () => {
    // Arrange
    const targets: string[] = ["token1", "token2", "token3", "token4"];
    const playerID = "player1";

    // Create tokens
    createObj("graphic", { id: "token1", represents: "char1" });
    createObj("graphic", { id: "token2", represents: "char2" });
    createObj("graphic", { id: "token3", represents: "char3" });
    createObj("graphic", { id: "token4", represents: "char4" });

    // Create characters
    const char1 = createObj("character", { id: "char1", name: "Character 1", controlledby: "player2" });
    const char2 = createObj("character", { id: "char2", name: "Character 2", controlledby: "player1" });
    const char3 = createObj("character", { id: "char3", name: "Character 3", controlledby: "player2" });
    const char4 = createObj("character", { id: "char4", name: "Character 4", controlledby: "player1" });

    // Act
    const [result, response] = target.parse(targets, playerID);

    // Assert
    expect(response.errors).toHaveLength(0);
    expect(result).toHaveLength(2);
    expect(result).toContain(char2);
    expect(result).toContain(char4);
    expect(result).not.toContain(char1);
    expect(result).not.toContain(char3);
  });

  it("should return error when no targets are provided", () => {
    // Arrange
    const targets: string[] = [];
    const playerID = "player1";

    // Act
    const [result, response] = target.parse(targets, playerID);

    // Assert
    expect(response.errors).toHaveLength(1);
    expect(response.errors[0]).toContain("The 'target' target requires at least one target");
    expect(result).toHaveLength(0);
  });
});
