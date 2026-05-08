import styles from "./EnvironmentLibraryCard.module.css";

import { ChangeEvent, DragEvent, useId, useState } from "react";

import type { Environment } from "../../types";

type EnvironmentLibraryCardProps = {
  environment: Environment;
  actionLabel?: string;
  onAction?: () => void;
  onUploadImage?: (environment: Environment, file: File) => Promise<void>;
};

function getEnvironmentImage(environment: Environment) {
  const value = environment.data_json?.environment_image;
  return typeof value === "string" && value ? value : null;
}

export function EnvironmentLibraryCard({ environment, actionLabel, onAction, onUploadImage }: EnvironmentLibraryCardProps) {
  const inputId = useId();
  const [isUploading, setIsUploading] = useState(false);
  const environmentImage = getEnvironmentImage(environment);

  async function handleFile(file: File | null | undefined) {
    if (!file || !onUploadImage || isUploading) {
      return;
    }

    setIsUploading(true);
    try {
      await onUploadImage(environment, file);
    } finally {
      setIsUploading(false);
    }
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    void handleFile(event.target.files?.[0]);
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    void handleFile(event.dataTransfer.files?.[0]);
  }

  return (
    <article className={`record-card ${styles.environmentCard}`}>
      <label
        className={`${styles.environmentArtPlaceholder} ${environmentImage ? styles.hasImage : ""} ${isUploading ? styles.isUploading : ""}`}
        htmlFor={inputId}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <input id={inputId} accept="image/*" className={styles.environmentArtInput} type="file" onChange={handleInputChange} />
        {environmentImage ? <img alt={`${environment.name} scene art`} className={styles.environmentArtImage} src={environmentImage} /> : null}
        <span className={styles.environmentArtCopy}>
          {isUploading ? "Saving image..." : environmentImage ? "Change Scene Art" : "Upload Scene Art"}
        </span>
      </label>
      <div className="record-header">
        <div>
          <h3>{environment.name}</h3>
          <p>{environment.environment_type}</p>
        </div>
        <span className="pill">Tier {environment.tier}</span>
      </div>
      <p>{environment.description ?? "No description yet."}</p>
      {actionLabel && onAction ? (
        <button className="secondary-button" onClick={onAction} type="button">
          {actionLabel}
        </button>
      ) : null}
    </article>
  );
}
