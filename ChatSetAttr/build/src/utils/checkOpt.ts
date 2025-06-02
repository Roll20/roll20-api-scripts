import type { Flag, Option } from "../classes/InputParser";

export function checkOpt(options: Option[], type: Flag | string): boolean {
  return options.some(opt => opt.name === type);
};

