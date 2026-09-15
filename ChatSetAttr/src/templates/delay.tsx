import { s } from "../utils/chat";
import { frameStyleBase, headerStyleBase } from "./styles";

const DELAY_WRAPPER_STYLE = s(frameStyleBase);

const DELAY_HEADER_STYLE = s(headerStyleBase);

export function createDelayMessage(): string {
  return (
    <div style={DELAY_WRAPPER_STYLE}>
      <div style={DELAY_HEADER_STYLE}>Long Running Query</div>
      <div>
        The operation is taking a long time to execute. This may be due to a large number of targets or attributes being processed. Please be patient as the operation completes.
      </div>
    </div>
  );
};