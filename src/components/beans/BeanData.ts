export interface Bean {
  primaryScientificName: string;
  otherScientificNames: string[];
  commonNames: string[];
  commonIncorrectNames: string[];
  appearances: BeanAppearance[];
}

export interface BeanAppearance {
  name: string;
  state: "fresh" | "dry";
  seedCoatColour: string | false;
  cotyledonColour: string | false;
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
};
