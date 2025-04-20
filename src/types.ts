
export type Digimon = {
  id: number;
  name: string;
  moves: string[];
  neighBours: {
    prev: string[];
    next: string[];
  };
  url: string;
  icon: string;
};