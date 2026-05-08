import { useEffect, useState, type FormEvent } from "react";

import { clampNumber } from "../../utils/clampNumber";
import type { BoardToken, NamedRoll } from "./EncounterBoard.types";
import styles from "./EncounterBoard.module.css";

type TokenDetailPanelProps = {
  token: BoardToken | null;
  onClose: () => void;
  onRemove: (tokenId: string) => void;
  onUpdate: (tokenId: string, updates: Partial<BoardToken>) => void;
  onAddNamedRoll: (tokenId: string, roll: Omit<NamedRoll, "id">) => void;
  onRemoveNamedRoll: (tokenId: string, rollId: string) => void;
};

type RollResult = {
  total: number;
  rolls: number[];
};

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "?";
  return words.slice(0, 2).map((word) => word[0]?.toUpperCase()).join("");
}

function typeLabel(type: BoardToken["type"]) {
  switch (type) {
    case "pc":
      return "PC";
    case "adversary":
      return "Adversary";
    case "npc":
      return "NPC";
    case "object":
      return "Object";
  }
}

function rollExpression(expression: string): RollResult | null {
  const cleanExpression = expression.replace(/\s/g, "");
  const tokenPattern = /([+-]?)(\d*d\d+|\d+)/gi;
  let match: RegExpExecArray | null;
  let total = 0;
  const rolls: number[] = [];
  let consumed = "";

  while ((match = tokenPattern.exec(cleanExpression)) !== null) {
    const sign = match[1] === "-" ? -1 : 1;
    const value = match[2];
    consumed += `${match[1]}${value}`;

    if (value.toLowerCase().includes("d")) {
      const [countRaw, sidesRaw] = value.toLowerCase().split("d");
      const count = Number(countRaw || 1);
      const sides = Number(sidesRaw);
      if (!Number.isInteger(count) || !Number.isInteger(sides) || count <= 0 || sides <= 0) {
        return null;
      }

      for (let index = 0; index < count; index += 1) {
        const roll = Math.floor(Math.random() * sides) + 1;
        rolls.push(roll);
        total += sign * roll;
      }
    } else {
      total += sign * Number(value);
    }
  }

  return consumed === cleanExpression && consumed ? { total, rolls } : null;
}

function TokenPortrait({ token }: { token: BoardToken }) {
  return (
    <div className={`${styles.detailPortrait} ${styles[`detailPortrait${typeLabel(token.type)}`] ?? ""}`}>
      {token.portraitUrl ? <img alt="" src={token.portraitUrl} /> : <span>{getInitials(token.name)}</span>}
    </div>
  );
}

function TrackerEditor({
  label,
  current,
  max,
  onChange,
}: {
  label: string;
  current: number;
  max: number;
  onChange: (current: number, max: number) => void;
}) {
  return (
    <div className={styles.trackerEditor}>
      <label>{label}</label>
      <div className={styles.trackerControls}>
        <button type="button" onClick={() => onChange(clampNumber(current - 1, max), max)}>
          -
        </button>
        <input className={styles.inputBase} min="0" type="number" value={current} onChange={(event) => onChange(Number(event.target.value), max)} />
        <span>/</span>
        <input className={styles.inputBase} min="0" type="number" value={max} onChange={(event) => onChange(current, Number(event.target.value))} />
        <button type="button" onClick={() => onChange(clampNumber(current + 1, max), max)}>
          +
        </button>
      </div>
    </div>
  );
}

function NamedRolls({
  token,
  onAddNamedRoll,
  onRemoveNamedRoll,
}: {
  token: BoardToken;
  onAddNamedRoll: TokenDetailPanelProps["onAddNamedRoll"];
  onRemoveNamedRoll: TokenDetailPanelProps["onRemoveNamedRoll"];
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [rollName, setRollName] = useState("");
  const [expression, setExpression] = useState("");
  const [results, setResults] = useState<Record<string, string>>({});

  useEffect(() => {
    setResults({});
  }, [token.id]);

  function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!rollName.trim() || !expression.trim()) {
      return;
    }

    onAddNamedRoll(token.id, { name: rollName.trim(), expression: expression.trim() });
    setRollName("");
    setExpression("");
    setIsAdding(false);
  }

  function handleRoll(roll: NamedRoll) {
    const result = rollExpression(roll.expression);
    setResults((current) => ({
      ...current,
      [roll.id]: result ? `${result.total} [${result.rolls.join(", ")}]` : "Invalid expression",
    }));
  }

  return (
    <section className={styles.namedRolls}>
      <div className={styles.sectionHeader}>
        <h4>Named Dice Rolls</h4>
        <button type="button" onClick={() => setIsAdding((current) => !current)}>
          Add Roll
        </button>
      </div>

      <div className={styles.rollList}>
        {token.namedRolls.map((roll) => (
          <div key={roll.id} className={styles.rollEntry}>
            <div>
              <strong>{roll.name}</strong>
              <span>{roll.expression}</span>
              {results[roll.id] ? <em>{results[roll.id]}</em> : null}
            </div>
            <div className={styles.rollActions}>
              <button type="button" onClick={() => handleRoll(roll)}>
                Roll
              </button>
              <button type="button" onClick={() => onRemoveNamedRoll(token.id, roll.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
        {token.namedRolls.length === 0 ? <p className="muted">No saved rolls for this token.</p> : null}
      </div>

      {isAdding ? (
        <form className={styles.rollForm} onSubmit={handleAdd}>
          <input className={`${styles.inputBase} ${styles.fieldControl}`} placeholder="Claw Attack" value={rollName} onChange={(event) => setRollName(event.target.value)} />
          <input className={`${styles.inputBase} ${styles.fieldControl}`} placeholder="2d6+3" value={expression} onChange={(event) => setExpression(event.target.value)} />
          <button className="primary-button" type="submit">
            Confirm
          </button>
        </form>
      ) : null}
    </section>
  );
}

export function TokenDetailPanel({
  token,
  onClose,
  onRemove,
  onUpdate,
  onAddNamedRoll,
  onRemoveNamedRoll,
}: TokenDetailPanelProps) {
  if (!token) {
    return (
      <aside className={styles.detailPanel}>
        <div className={styles.emptyPanel}>
          <p className="eyebrow">Selection</p>
          <h3>No token selected</h3>
          <p className="muted">Click an occupied cell to inspect the top token here.</p>
        </div>
      </aside>
    );
  }

  const isCreature = token.type !== "object";
  const isAdhocObject = token.type === "object" && token.sourceId === "adhoc";

  return (
    <aside className={styles.detailPanel}>
      <div className={styles.detailHeader}>
        <TokenPortrait token={token} />
        <div>
          <span className={styles.typeBadge}>{typeLabel(token.type)}</span>
          <h3>{token.name}</h3>
        </div>
      </div>

      <div className={styles.detailActions}>
        <button
          type="button"
          onClick={() => {
            if (window.confirm(`Remove ${token.name} from the board?`)) {
              onRemove(token.id);
            }
          }}
        >
          Remove
        </button>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>

      {isCreature ? (
        <div className={styles.detailSection}>
          <TrackerEditor
            current={token.currentHp}
            label="HP"
            max={token.maxHp}
            onChange={(currentHp, maxHp) => onUpdate(token.id, { currentHp: clampNumber(currentHp, maxHp), maxHp })}
          />
          <TrackerEditor
            current={token.currentStress}
            label="Stress"
            max={token.maxStress}
            onChange={(currentStress, maxStress) =>
              onUpdate(token.id, { currentStress: clampNumber(currentStress, maxStress), maxStress })
            }
          />
        </div>
      ) : null}

      {(token.type === "adversary" || token.type === "npc") ? (
        <NamedRolls token={token} onAddNamedRoll={onAddNamedRoll} onRemoveNamedRoll={onRemoveNamedRoll} />
      ) : null}

      {token.type === "object" ? (
        <section className={styles.objectDetails}>
          <h4>Description</h4>
          {isAdhocObject ? (
            <textarea
              className={`${styles.inputBase} ${styles.fieldControl} ${styles.textAreaControl}`}
              value={token.description ?? ""}
              onChange={(event) => onUpdate(token.id, { description: event.target.value })}
            />
          ) : (
            <p>{token.description || "No description available."}</p>
          )}
        </section>
      ) : null}
    </aside>
  );
}
