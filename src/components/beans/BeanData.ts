export interface Bean {
  primaryScientificName: string;
  otherScientificNames: string[];
  commonNames: string[];
  commonIncorrectNames: string[];
  appearances: BeanAppearance[];
  processingMethods: string[];
  recipes: Recipe[];
}

export interface BeanAppearance {
  name: string;
  state: "fresh" | "dry";
  seedCoatColour: string | false;
  cotyledonColour: string | false;
}

export interface Recipe {
  name: string;
  origin: string;
  processingMethod: string;
}

export const mung: Bean = {
  primaryScientificName: "Vigna radiata",
  otherScientificNames: ["Phaseolus radiatus"],
  commonNames: ["Mung bean", "Green gram"],
  commonIncorrectNames: ["Yellow lentil", "Yellow split pea"],
  appearances: [
    {
      name: "fresh",
      state: "fresh",
      seedCoatColour: "green",
      cotyledonColour: "yellow",
    },
    {
      name: "dry",
      state: "dry",
      seedCoatColour: "green",
      cotyledonColour: "yellow",
    },
  ],
  processingMethods: ["whole", "unhulled split", "hulled split"],
  recipes: [
    {
      name: "Moong dal",
      origin: "India",
      processingMethod: "hulled split",
    },
    {
      name: "Mango sticky rice",
      origin: "Thailand",
      processingMethod: "hulled split",
    },
    {
      name: "Moong khichdi",
      origin: "India",
      processingMethod: "whole, hulled split",
    },
  ],
};
