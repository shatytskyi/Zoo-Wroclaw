export type Tour = {
  id: string;
  durationMin: number;
  placeIds: string[];
  names: { pl: string; ru: string; en: string };
  blurb: { pl: string; ru: string; en: string };
};

export const TOURS: Tour[] = [
  {
    id: "hits",
    durationMin: 90,
    placeIds: ["africarium", "savannah", "lions", "elephants", "tigers", "terrarium"],
    names: { pl: "Hity ogrodu", ru: "Главные хиты", en: "Garden hits" },
    blurb: {
      pl: "Afrykarium, sawanna, drapieżniki i terrarium — bez zbędnych pętli.",
      ru: "Африкариум, саванна, хищники и террариум — короткий круг.",
      en: "Africarium, savannah, big cats and the reptile house.",
    },
  },
  {
    id: "family",
    durationMin: 75,
    placeIds: ["africarium", "ranch", "farm", "playground", "lemurs", "meerkats", "capybaras"],
    names: { pl: "Z dziećmi", ru: "С детьми", en: "With kids" },
    blurb: {
      pl: "Pawilony, zagroda, plac zabaw i zwierzęta, które lubią się pokazać.",
      ru: "Павильоны, ферма, площадка и звери, которых легко увидеть.",
      en: "Indoor halls, the farm, playground, and outgoing animals.",
    },
  },
  {
    id: "africa",
    durationMin: 80,
    placeIds: ["sahara", "lions", "savannah", "africarium", "madagascar", "okapi", "hippos"],
    names: { pl: "Szlak Afryki", ru: "Африканский путь", en: "Africa trail" },
    blurb: {
      pl: "Od saharyjskich wielbłądów przez lwy do oceanarium.",
      ru: "От сахарских верблюдов через львов к океанариуму.",
      en: "From Sahara camels and lions into the oceanarium.",
    },
  },
  {
    id: "east",
    durationMin: 70,
    placeIds: ["rhinos", "elephants", "tigers", "birds", "flamingos", "hornbills", "pallas"],
    names: { pl: "Słonie i ptaki", ru: "Слоны и птицы", en: "Elephants & birds" },
    blurb: {
      pl: "Wschodnia pętla: słoniarnia, tygrysy, ptaszarnia i woliery.",
      ru: "Восточная петля: слоны, тигры, птичник и вольеры.",
      en: "East loop: elephant house, tigers, bird house and aviaries.",
    },
  },
];
