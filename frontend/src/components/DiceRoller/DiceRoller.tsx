import { useState } from "react";

import styles from "./DiceRoller.module.css";
import type { DiceGroup, HopeFearResult, RollEntry } from "./DiceRoller.types";

function parseComplexFormula(formula: string) {
  const cleanFormula = formula.replace(/\s/g, "");
  const dicePattern = /([+-]?)(\d*)d(\d+)/gi;

  let match;
  const diceGroups: { sign: number; count: number; sides: number; isDuality: boolean }[] = [];
  let lastIndex = 0;

  while ((match = dicePattern.exec(cleanFormula)) !== null) {
    const sign = match[1] === "-" ? -1 : 1;
    const count = Number(match[2] || 1);
    const sides = Number(match[3]);

    if (count <= 0 || sides <= 0 || !Number.isInteger(count) || !Number.isInteger(sides)) {
      return null;
    }

    diceGroups.push({
      sign,
      count,
      sides,
      isDuality: count === 2 && sides === 12,
    });
    lastIndex = dicePattern.lastIndex;
  }

  if (diceGroups.length === 0) {
    return null;
  }

  const remaining = cleanFormula.slice(lastIndex);
  let modifier = 0;
  const modifierPattern = /([+-]\d+)/g;
  let modifierMatch;

  while ((modifierMatch = modifierPattern.exec(remaining)) !== null) {
    modifier += Number(modifierMatch[1]);
  }

  const cleanedRemaining = remaining.replace(modifierPattern, "");
  if (cleanedRemaining.length > 0) {
    return null;
  }

  return { diceGroups, modifier };
}

function rollDualityDice(): { rolls: number[]; hopeRoll: number; fearRoll: number; hopeFear: HopeFearResult } {
  const hopeRoll = Math.floor(Math.random() * 12) + 1;
  const fearRoll = Math.floor(Math.random() * 12) + 1;

  return {
    rolls: [hopeRoll, fearRoll],
    hopeRoll,
    fearRoll,
    hopeFear: {
      type: hopeRoll === fearRoll ? "critical" : hopeRoll > fearRoll ? "hope" : "fear",
      hopeValue: hopeRoll,
      fearValue: fearRoll,
    },
  };
}

function rollComplexFormula(formula: string): RollEntry | null {
  const parsed = parseComplexFormula(formula);
  if (!parsed) {
    return null;
  }

  const allRolls: number[] = [];
  const diceGroups: DiceGroup[] = [];
  let hopeFearResult: HopeFearResult | undefined;
  let signedTotal = 0;

  for (const group of parsed.diceGroups) {
    let groupRolls: number[];

    if (group.isDuality) {
      const duality = rollDualityDice();
      groupRolls = duality.rolls;
      diceGroups.push({
        count: group.count,
        sides: group.sides,
        rolls: groupRolls,
        isDuality: true,
        hopeRoll: duality.hopeRoll,
        fearRoll: duality.fearRoll,
        sign: group.sign,
      });

      if (!hopeFearResult) {
        hopeFearResult = duality.hopeFear;
      }
    } else {
      groupRolls = Array.from({ length: group.count }, () => Math.floor(Math.random() * group.sides) + 1);
      diceGroups.push({
        count: group.count,
        sides: group.sides,
        rolls: groupRolls,
        isDuality: false,
        sign: group.sign,
      });
    }

    allRolls.push(...groupRolls);
    signedTotal += group.sign * groupRolls.reduce((sum, value) => sum + value, 0);
  }

  const total = signedTotal + parsed.modifier;
  const formulaParts = parsed.diceGroups.map((group, index) => {
    const prefix = group.sign === -1 ? "-" : index === 0 ? "" : "+";
    return `${prefix}${group.count}d${group.sides}`;
  });

  const modifier = parsed.modifier === 0 ? "" : parsed.modifier > 0 ? `+${parsed.modifier}` : `${parsed.modifier}`;

  return {
    id: Date.now() + Math.floor(Math.random() * 1000),
    formula: `${formulaParts.join("")}${modifier}`,
    total,
    modifier: parsed.modifier,
    rolls: allRolls,
    diceGroups,
    hopeFear: hopeFearResult,
  };
}

const QUICK_ROLLS = ["d20", "2d12", "2d12+1d6", "2d12-1d6", "2d12+2"];

function getHopeFearDisplay(hopeFear: HopeFearResult) {
  switch (hopeFear.type) {
    case "hope":
      return { label: "Hope Roll", color: "#4b0082", accent: "Hope" };
    case "fear":
      return { label: "Fear Roll", color: "#8b0000", accent: "Fear" };
    case "critical":
      return { label: "Critical Success", color: "#e0e0e0", accent: "Critical", textColor: "#000000" };
  }
}

function formatDisplayedTotal(entry: RollEntry) {
  if (entry.hopeFear?.type === "critical") {
    return `${entry.hopeFear.hopeValue} | ${entry.hopeFear.fearValue}`;
  }

  return String(entry.total);
}

export function DiceRoller() {
  const [formula, setFormula] = useState("2d12");
  const [status, setStatus] = useState("Roll complex formulas like 2d6+1d8+3, d20+2d6, or 3d12-d4");
  const [history, setHistory] = useState<RollEntry[]>([]);

  function handleRoll(nextFormula: string) {
    const result = rollComplexFormula(nextFormula);

    if (!result) {
      setStatus("Use formulas like 2d6+1d8+3, d20+2d6, or 3d12-d4+2.");
      return;
    }

    setFormula(result.formula);

    if (result.hopeFear) {
      const { type, hopeValue, fearValue } = result.hopeFear;
      setStatus(
        type === "critical"
          ? `Rolled ${result.formula}. Critical success with Hope ${hopeValue} and Fear ${fearValue}.`
          : `Rolled ${result.formula}. ${type === "hope" ? "Hope" : "Fear"} result with Hope ${hopeValue}, Fear ${fearValue}, total ${result.total}.`,
      );
    } else {
      setStatus(`Rolled ${result.formula}. Total: ${result.total}.`);
    }

    setHistory((current) => [result, ...current].slice(0, 8));
  }

  const latestRoll = history[0] ?? null;

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Dice Roller</p>
          <h2>Roll on the fly</h2>
        </div>
        <p className="status">{status}</p>
      </div>

      <div className={styles.diceRollerLayout}>
        <div className={styles.diceRollerMain}>
          <div className={styles.diceFormulaLabel}>
            <label htmlFor="dice-formula">Formula</label>
            <div className={styles.diceFormulaRow}>
              <input
                id="dice-formula"
                value={formula}
                onChange={(event) => setFormula(event.target.value)}
                placeholder="2d6+1d8+3"
              />
              <button className="primary-button" onClick={() => handleRoll(formula)} type="button">
                Roll
              </button>
            </div>
          </div>

          <div className={styles.diceQuickRow}>
            {QUICK_ROLLS.map((quickFormula) => (
              <button key={quickFormula} className="secondary-button" onClick={() => handleRoll(quickFormula)} type="button">
                {quickFormula}
              </button>
            ))}
          </div>

          {latestRoll ? (
            <article className={`detail-card ${styles.diceResultCard}`}>
              <h4>Latest Roll</h4>

              {latestRoll.hopeFear ? (
                <div className={styles.hopeFearBadge}>
                  {(() => {
                    const display = getHopeFearDisplay(latestRoll.hopeFear);
                    return (
                      <div
                        className={latestRoll.hopeFear.type === "critical" ? styles.pulse : ""}
                        style={{
                          display: "inline-block",
                          padding: "0.5rem 1rem",
                          borderRadius: "8px",
                          backgroundColor: display.color,
                          color: display.textColor || "#ffffff",
                          fontWeight: "bold",
                        }}
                      >
                        {display.label}
                      </div>
                    );
                  })()}
                </div>
              ) : null}

              <div className={styles.diceResultTotal}>{formatDisplayedTotal(latestRoll)}</div>

              <div className={styles.diceResultDetails}>
                <p className={styles.diceGroups}>
                  {latestRoll.diceGroups.map((group, index) => {
                    const operator = group.sign === -1 ? "-" : index === 0 ? "" : "+";

                    if (group.isDuality && group.hopeRoll && group.fearRoll) {
                      return (
                        <span key={`${group.sides}-${index}`}>
                          {operator ? `${operator} ` : ""}
                          Hope: {group.hopeRoll}
                          {" + "}
                          Fear: {group.fearRoll}
                        </span>
                      );
                    }

                    return (
                      <span key={`${group.sides}-${index}`}>
                        {operator ? `${operator} ` : ""}
                        {group.count}d{group.sides}: [{group.rolls.join(", ")}]
                      </span>
                    );
                  })}
                  {latestRoll.modifier !== 0 ? (
                    <span>{latestRoll.modifier > 0 ? ` +${latestRoll.modifier}` : ` ${latestRoll.modifier}`}</span>
                  ) : null}
                </p>

                {latestRoll.hopeFear?.type === "hope" ? (
                  <p className={styles.hopeFearDetails}>Hope prevailed. Hope {latestRoll.hopeFear.hopeValue} vs Fear {latestRoll.hopeFear.fearValue}.</p>
                ) : null}
                {latestRoll.hopeFear?.type === "fear" ? (
                  <p className={styles.hopeFearDetails}>Fear prevailed. Hope {latestRoll.hopeFear.hopeValue} vs Fear {latestRoll.hopeFear.fearValue}.</p>
                ) : null}
                {latestRoll.hopeFear?.type === "critical" ? (
                  <p className={styles.hopeFearDetails}>
                    Critical success. Show both dice values only: {latestRoll.hopeFear.hopeValue} and {latestRoll.hopeFear.fearValue}.
                  </p>
                ) : (
                  <p className="muted">
                    Dice sum: {latestRoll.rolls.reduce((sum, value) => sum + value, 0)}
                    {latestRoll.modifier !== 0
                      ? ` ${latestRoll.modifier > 0 ? `+ ${latestRoll.modifier}` : `- ${Math.abs(latestRoll.modifier)}`}`
                      : ""}
                  </p>
                )}
              </div>
            </article>
          ) : null}
        </div>

        <article className="detail-card">
          <h4>Recent Rolls</h4>
          <div className="sheet-list">
            {history.map((entry) => (
              <div key={entry.id} className="sheet-entry">
                <div>
                  <span>{entry.formula}</span>
                  {entry.hopeFear ? (
                    <span className="muted small">
                      {" "}
                      {entry.hopeFear.type === "hope" ? "Hope" : entry.hopeFear.type === "fear" ? "Fear" : "Critical"}
                    </span>
                  ) : null}
                  <span className="muted small">
                    {" "}
                    {entry.diceGroups
                      .map((group, index) => {
                        const operator = group.sign === -1 ? "-" : index === 0 ? "" : "+";
                        return `${operator}[${group.rolls.join(",")}]`;
                      })
                      .join("")}
                    {entry.modifier !== 0 ? ` ${entry.modifier > 0 ? `+${entry.modifier}` : entry.modifier}` : ""}
                  </span>
                </div>
                <strong>{formatDisplayedTotal(entry)}</strong>
              </div>
            ))}
            {history.length === 0 ? <p className="muted">No rolls yet.</p> : null}
          </div>
        </article>
      </div>
    </section>
  );
}
