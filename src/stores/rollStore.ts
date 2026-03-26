import { create } from "zustand";
import type { GeneratedResult, ResultField } from "../lib/types";

const MAX_STACKED = 10;
const MAX_RECENT = 5;

interface RollStoreState {
  recentRolls: GeneratedResult[];
  stackedResults: Record<string, GeneratedResult[]>;
  addRoll: (key: string, result: GeneratedResult) => void;
  rerollField: (
    key: string,
    resultId: string,
    fieldIndex: number,
    newFields: ResultField[],
  ) => void;
  clearStacked: (categoryId: string) => void;
}

export const useRollStore = create<RollStoreState>((set) => ({
  recentRolls: [],
  stackedResults: {},

  addRoll: (key, result) =>
    set((state) => {
      const existing = state.stackedResults[key] ?? [];
      const updatedStacked = [result, ...existing].slice(0, MAX_STACKED);
      const updatedRecent = [result, ...state.recentRolls].slice(0, MAX_RECENT);

      return {
        stackedResults: {
          ...state.stackedResults,
          [key]: updatedStacked,
        },
        recentRolls: updatedRecent,
      };
    }),

  rerollField: (key, resultId, fieldIndex, newFields) =>
    set((state) => {
      const updateResult = (result: GeneratedResult): GeneratedResult => {
        if (result.id !== resultId) return result;

        const fields = result.fields;
        // Count how many consecutive triggered fields follow the target field
        let removeCount = 1; // the field itself
        for (let i = fieldIndex + 1; i < fields.length; i++) {
          if (fields[i].triggered) {
            removeCount++;
          } else {
            break;
          }
        }

        // Splice: remove old field + its triggered fields, insert new fields
        const updatedFields = [
          ...fields.slice(0, fieldIndex),
          ...newFields,
          ...fields.slice(fieldIndex + removeCount),
        ];
        return { ...result, fields: updatedFields };
      };

      const existing = state.stackedResults[key];
      const updatedStacked = existing
        ? { ...state.stackedResults, [key]: existing.map(updateResult) }
        : state.stackedResults;

      return {
        stackedResults: updatedStacked,
        recentRolls: state.recentRolls.map(updateResult),
      };
    }),

  clearStacked: (categoryId) =>
    set((state) => {
      const prefix = `${categoryId}/`;
      const newStacked: Record<string, GeneratedResult[]> = {};
      for (const key of Object.keys(state.stackedResults)) {
        if (!key.startsWith(prefix)) {
          newStacked[key] = state.stackedResults[key];
        }
      }
      return { stackedResults: newStacked };
    }),
}));
