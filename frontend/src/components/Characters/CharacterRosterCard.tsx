import { getCharacterMaxHitPoints, getCharacterMaxStress } from "../../utils/characterUtils";
import type { Character } from "../../types";

type CharacterRosterCardProps = {
  character: Character;
  onOpen: (characterId: number) => void;
};

export function CharacterRosterCard({ character, onOpen }: CharacterRosterCardProps) {
  return (
    <article className="record-card">
      <div className="record-header">
        <div>
          <h3>{character.name}</h3>
          <p>
            {character.class_name}
            {character.subclass_name ? ` / ${character.subclass_name}` : ""}
          </p>
        </div>
        <span className="pill">Lv {character.level}</span>
      </div>
      <p>
        {character.ancestry ?? "Unknown ancestry"} | {character.community ?? "Unknown community"}
      </p>
      <p>
        HP {character.hit_points ?? 0}/{getCharacterMaxHitPoints(character)} | Stress {character.stress ?? 0}/
        {getCharacterMaxStress(character)} | Hope {character.hope ?? "-"}
      </p>
      <p className="muted">{character.notes ?? "No notes yet."}</p>
      <button className="secondary-button" onClick={() => onOpen(character.id)} type="button">
        Open Sheet
      </button>
    </article>
  );
}
