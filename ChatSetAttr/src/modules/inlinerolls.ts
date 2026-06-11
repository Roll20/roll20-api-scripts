type TableRollResult = {
  tableItem?: {
    name?: string;
  };
};

type TableRoll = {
  table?: unknown;
  results?: TableRollResult[];
};

function inlineRollValue(roll: RollData): string | number {
  const tableItems = roll.results.rolls.reduce<string[]>((names, subRoll) => {
    const tableSubRoll = subRoll as TableRoll;
    if (!Object.prototype.hasOwnProperty.call(tableSubRoll, "table")) {
      return names;
    }
    const subNames = (tableSubRoll.results ?? [])
      .map(result => result.tableItem?.name ?? "")
      .filter(Boolean);
    if (subNames.length) {
      names.push(subNames.join(", "));
    }
    return names;
  }, []);
  const tableText = tableItems.filter(Boolean).join(", ");
  return (tableText.length && tableText) || roll.results.total || 0;
}

export function processInlinerolls(
  msg: Pick<Roll20ChatMessage, "content" | "inlinerolls">,
): string {
  if (!msg.inlinerolls?.length) {
    return msg.content;
  }

  const values = msg.inlinerolls.map(roll => String(inlineRollValue(roll)));
  return values.reduce(
    (content, value, index) => content.replace(`$[[${index}]]`, value),
    msg.content,
  );
}
