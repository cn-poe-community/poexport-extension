export interface Settings {
  poe1ExportEnabled: boolean;
  trade2ItemTextEnabled: boolean;
  poe2ExportEnabled: boolean;
  [key: string]: string | boolean;
}

export function defaultSettings(): Settings {
  return {
    poe1ExportEnabled: true,
    trade2ItemTextEnabled: true,
    poe2ExportEnabled: true,
  };
}
