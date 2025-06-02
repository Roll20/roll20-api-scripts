import { APIWrapper, type DeltasObject, type ErrorResponse } from "./APIWrapper";
import { Flags, type Option } from "./InputParser";
import { createStyle } from "../utils/createStyle";
import { checkOpt } from "../utils/checkOpt";
import { asyncTimeout } from "../utils/asyncTimeout";
import { AttrProcessor } from "./AttrProcessor";

export interface CommandStrategy {
  name: string;
  description: string;
  options: string[];

  execute: (
    options: Option[],
    targets: Roll20Character[],
    values: DeltasObject,
    message: Roll20ChatMessage,
  ) => Promise<ErrorResponse>;

  help: () => string;
};

export class SetAttrCommand implements CommandStrategy {
  public name = "setattr";
  public description = "Set attributes for a character.";
  public options = ["nocreate", "evaluate"];

  public async execute(
    options: Option[],
    targets: Roll20Character[],
    values: DeltasObject,
  ) {
    const messages: string[] = [];
    const errors: string[] = [];

    const onlySet = checkOpt(options, Flags.NO_CREATE);
    const createMethod = onlySet ? APIWrapper.setAttributesOnly : APIWrapper.setAttributes;

    const useEval = checkOpt(options, Flags.EVAL);
    const useReplace = checkOpt(options, Flags.REPLACE);
    const useFeedback = checkOpt(options, Flags.FB_CONTENT);
    const content = options.find((opt) => opt.name === Flags.FB_CONTENT)?.value;

    for (const target of targets) {
      const processor = new AttrProcessor(target, values, {
        useEval,
        useReplace,
        useParse: true,
      });
      const processedValues = await processor.init();
      errors.push(...processor.errors);

      const [createResponse] = await createMethod(target, processedValues);
      errors.push(...createResponse.errors ?? []);
      // messages.push(createResponse.messages[0] ?? "");

      if (useFeedback && content) {
        const messageContent = processor.replacePlaceholders(content);
        messages.push(messageContent);
      } else {
        messages.push(...createResponse.messages ?? []);
      }

      await asyncTimeout(20);
    }

    log(`SetAttrCommand executed with messages: ${JSON.stringify(messages)}`);

    if (errors.length > 0) {
      return {
        messages: [],
        errors,
      };
    }

    return {
      messages,
      errors,
    };
  };

  public help() {
    return `!setattr ${this.options.join(" ")} - Set attributes for a character.`;
  };
};

export class ModAttrCommand implements CommandStrategy {
  public name = "modattr";
  public description = "Modify attributes for a character.";
  public options = ["evaluate"];

  public async execute(
    options: Option[],
    targets: Roll20Character[],
    values: DeltasObject,
  ) {
    const messages: string[] = [];
    const errors: string[] = [];

    const shouldEval = checkOpt(options, Flags.EVAL);
    const useReplace = checkOpt(options, Flags.REPLACE);

    for (const target of targets) {
      const processor = new AttrProcessor(target, values, {
        useEval: shouldEval,
        useReplace,
        useParse: true,
        useModify: true,
      });
      const processedValues = await processor.init();
      errors.push(...processor.errors);

      const [createResponse] = await APIWrapper.setAttributes(target, processedValues);
      messages.push(...createResponse.messages ?? []);
      errors.push(...createResponse.errors ?? []);

      await asyncTimeout(20);
    }

    return {
      messages,
      errors,
    };
  };

  public help() {
    return `!modattr ${this.options.join(" ")} - Modify attributes for a character.`;
  };
};

export class ModBAttrCommand implements CommandStrategy {
  public name = "modbattr";
  public description = "Modify attributes for a character bound to upper values of the related max.";
  public options = ["evaluate"];

  public async execute(
    options: Option[],
    targets: Roll20Character[],
    values: DeltasObject,
  ) {
    const messages: string[] = [];
    const errors: string[] = [];

    const shouldEval = checkOpt(options, Flags.EVAL);
    const useReplace = checkOpt(options, Flags.REPLACE);

    for (const target of targets) {
      const processor = new AttrProcessor(target, values, {
        useReplace,
        useEval: shouldEval,
        useParse: true,
        useModify: true,
        useConstrain: true,
      });
      const processedValues = await processor.init();
      errors.push(...processor.errors);

      const [createResponse] = await APIWrapper.setAttributes(target, processedValues);
      messages.push(...createResponse.messages ?? []);
      errors.push(...createResponse.errors ?? []);

      await asyncTimeout(20);
    }

    return {
      messages,
      errors,
    };
  };

  public help() {
    return `!modbattr ${this.options.join(" ")} - Modify attributes for a character bound to upper values of the related max.`;
  };
};

export class DelAttrCommand implements CommandStrategy {
  public name = "delattr";
  public description = "Delete attributes for a character.";
  public options = [];

  public async execute(
    _: Option[],
    targets: Roll20Character[],
    values: DeltasObject,
  ) {
    const messages: string[] = [];
    const errors: string[] = [];

    for (const target of targets) {
      const processor = new AttrProcessor(target, values, {
        useParse: true,
      });
      const processedValues = await processor.init();
      const attrs = Object.keys(processedValues);
      const [response] = await APIWrapper.deleteAttributes(target, attrs);
      messages.push(...response.messages ?? []);
      errors.push(...response.errors ?? []);

      await asyncTimeout(20);
    }

    return {
      messages,
      errors,
    };
  };

  public help() {
    return `!delattr - Delete attributes for a character.`;
  };
};

export class ResetAttrCommand implements CommandStrategy {
  public name = "resetattr";
  public description = "Reset attributes for a character.";
  public options = [];

  public async execute(
    _: Option[],
    targets: Roll20Character[],
    values: DeltasObject,
  ) {
    const messages: string[] = [];
    const errors: string[] = [];

    for (const target of targets) {
      const attrs = Object.keys(values);
      const [response] = await APIWrapper.resetAttributes(target, attrs);
      messages.push(...response.messages ?? []);
      errors.push(...response.errors ?? []);

      await asyncTimeout(20);
    }

    return {
      messages,
      errors,
    };
  };

  public help() {
    return `!resetattr - Reset attributes for a character.`;
  };
};

export class ConfigCommand implements CommandStrategy {
  public name = "setattr-config";
  public description = "Configure the SetAttr command.";
  public options = ["players-can-modify", "players-can-evaluate", "use-workers"];

  public async execute(
    options: Option[],
    _: Roll20Character[],
    __: DeltasObject,
    message: Roll20ChatMessage,
  ) {
    const messages: string[] = [];
    const errors: string[] = [];

    const isGM = playerIsGM(message.playerid);
    if (!isGM) {
      errors.push("Only the GM can configure ChatSetAttr.");
      return { messages, errors };
    }

    const config = state.ChatSetAttr;
    for (const option of options) {
      switch (option.name) {
        case Flags.PLAYERS_CAN_MODIFY:
          config.playersCanModify = !config.playersCanModify;
          messages.push(`Players can modify attributes: ${config.playersCanModify}`);
          break;
        case Flags.PLAYERS_CAN_EVALUATE:
          config.playersCanEvaluate = !config.playersCanEvaluate;
          messages.push(`Players can evaluate attributes: ${config.playersCanEvaluate}`);
          break;
        case Flags.USE_WORKERS:
          config.useWorkers = !config.useWorkers;
          messages.push(`Using workers for attribute operations: ${config.useWorkers}`);
          break;
        default:
          break;
      }
    }

    const messageContent = this.createMessage();
    messages.push(messageContent);

    return {
      messages,
      errors,
    };
  };

  public help() {
    return `!setattr-config ${this.options.join(" ")} - Configure the SetAttr command.`;
  };

  private createMessage() {
    const localState = state.ChatSetAttr;
    let message = ``;
    message += `<p><strong>ChatSetAttr Configuration</strong></p>`;
    message += `<p><em>!setattr-config</em> can be invoked in the following format:</p>`;
    message += `<p><code>!setattr-config --option</code></p>`;
    message += `<p>Specifying an option toggles the current setting.</p>`;
    message += `<p>Current Configuration:</p>`;
    message += this.createMessageRow(
      "playersCanModify",
      "Determines if players can use <em>--name</em> and <em>--charid</em> to change attributes of characters they do not control",
      localState.playersCanModify
    );
    message += this.createMessageRow(
      "playersCanEvaluate",
      "Determines if players can use the --evaluate option. <strong>Be careful</strong> in giving players access to this option, because it potentially gives players access to your full API sandbox.",
      localState.playersCanEvaluate
    );
    message += this.createMessageRow(
      "useWorkers",
      "Determines if setting attributes should trigger sheet worker operations.",
      localState.useWorkers
    );
    return message;
  };

  messageRowStyle = createStyle({
    padding: "5px 10px",
    borderBottom: "1px solid #ccc",
  });

  messageRowIndicatorStyleOn = createStyle({
    float: "right",
    margin: "3px",
    padding: "3px",
    border: "1px solid #000",
    backgroundColor: "#ffc",
    color: "#f00",
  });

  messageRowIndicatorStyleOff = createStyle({
    float: "right",
    margin: "3px",
    padding: "3px",
    border: "1px solid #000",
    backgroundColor: "#ffc",
    color: "#666",
  });

  private createMessageRow(property: string, description: string, value: boolean): string {
    const indicatorStyle = value ? this.messageRowIndicatorStyleOn : this.messageRowIndicatorStyleOff;
    return `<div style="${this.messageRowStyle}">`
    + `<span style="font-weight: bold;">${property}</span>: ${description}`
    + `<span style="${indicatorStyle}">${value ? "ON" : "OFF"}</span>`
    + `</div>`;
  };
}