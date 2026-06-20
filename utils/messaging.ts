import { defineExtensionMessaging } from "@webext-core/messaging";

interface ProtocolMap {
  createPOE1Build(data: { items: string; passiveSkills: string }): string;
  createPOE2Build(data: {
    equipments: string;
    jewels: string;
    roleInfo: string;
    skills: string;
    talentTree: string;
    customData?: string;
  }): string;
  manageWgItems(data: { shareCode: string }): void;
  openTransItemPage(data: { version: string }): void;
  translatePOE1Item(data: { item: string }): string;
  translatePOE2Item(data: { item: string }): string;
}

export const { sendMessage, onMessage } =
  defineExtensionMessaging<ProtocolMap>();
