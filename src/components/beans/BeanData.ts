export interface Bean {
  primaryScientificName: string;
  otherScientificNames: string[];
  commonNames: string[];
  commonIncorrectNames: string[];
  appearances: BeanAppearance[];
  apperanceNote?: string;
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

export const lentil: Bean = {
  primaryScientificName: "Vicia lens",
  otherScientificNames: ["Lens culinaris"],
  commonNames: ["Lentil", "Masoor"],
  commonIncorrectNames: [],
  appearances: [
    {
      name: "brown",
      state: "dry",
      seedCoatColour: "brown",
      cotyledonColour: "red",
    },
    {
      name: "tan",
      state: "dry",
      seedCoatColour: "tan",
      cotyledonColour: "green",
    },
    {
      name: "yellow",
      state: "dry",
      seedCoatColour: "green",
      cotyledonColour: "yellow",
    },
  ],
  apperanceNote: "Many colour combinations possible",
  processingMethods: ["whole", "hulled split"],
  recipes: [
    {
      name: "Masoor dal",
      origin: "India",
      processingMethod: "hulled split",
    },
    {
      name: "Mujadara",
      origin: "Levant",
      processingMethod: "whole",
    },
    {
      name: "Lentil salad",
      origin: "France",
      processingMethod: "whole",
    },
    {
      name: "Mercimek köftesi",
      origin: "Türkiye",
      processingMethod: "hulled split",
    },
  ],
};

export const chickpea: Bean = {
  primaryScientificName: "Cicer arietinum",
  otherScientificNames: [],
  commonNames: ["Chickpea", "Garbanzo bean", "Chana dal", "Bengal gram"],
  commonIncorrectNames: ["Lentil"],
  appearances: [
    {
      name: "dry",
      state: "dry",
      seedCoatColour: "tan",
      cotyledonColour: "tan",
    },
    {
      name: "fresh",
      state: "fresh",
      seedCoatColour: "green",
      cotyledonColour: false,
    },
  ],
  processingMethods: ["whole", "hulled split"],
  recipes: [
    {
      name: "Chana dal",
      origin: "India",
      processingMethod: "hulled split",
    },
    {
      name: "Hummus",
      origin: "Middle East",
      processingMethod: "whole",
    },
    {
      name: "Pae Hin",
      origin: "Myanmar",
      processingMethod: "hulled split",
    },
  ],
};

export const blackGram: Bean = {
  primaryScientificName: "Vigna mungo",
  otherScientificNames: [],
  commonNames: ["Urad", "Black gram"],
  commonIncorrectNames: ["White lentil"],
  appearances: [
    {
      name: "whole",
      state: "dry",
      seedCoatColour: "black",
      cotyledonColour: "white",
    },
  ],
  processingMethods: ["whole", "unhulled split", "hulled split"],
  recipes: [
    {
      name: "Urad dal",
      origin: "India",
      processingMethod: "whole",
    },
    {
      name: "Medu vada",
      origin: "India",
      processingMethod: "hulled split",
    },
  ],
};

export const pea: Bean = {
  primaryScientificName: "Pisum sativum",
  otherScientificNames: [],
  commonNames: ["Pea", "Garden pea", "Field pea"],
  commonIncorrectNames: [],
  appearances: [
    {
      name: "fresh",
      state: "fresh",
      seedCoatColour: "green",
      cotyledonColour: "green",
    },
    {
      name: "dry green",
      state: "dry",
      seedCoatColour: "green",
      cotyledonColour: "green",
    },
    {
      name: "dry yellow",
      state: "dry",
      seedCoatColour: "yellow",
      cotyledonColour: "yellow",
    },
  ],
  processingMethods: ["whole", "hulled split"],
  recipes: [
    {
      name: "Erwtensoep",
      origin: "Netherlands",
      processingMethod: "hulled split",
    },
    {
      name: "Ärtsoppa",
      origin: "Sweden",
      processingMethod: "hulled split",
    },
    {
      name: "Ghugni",
      origin: "Nepal",
      processingMethod: "whole",
    },
  ],
};

export const beans = [mung, lentil, chickpea, blackGram, pea];
