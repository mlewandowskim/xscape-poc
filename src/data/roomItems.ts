export interface RoomItem {
  id: string;
  label: string;
  description: string;
  x: number;
  y: number;
  hoverRadius: number;
}

/**
 * Item positions in image space (1376×768 — room.png native size).
 * hoverRadius is the distance from (x, y) at which the InteractionMarker activates.
 */
export const ROOM_ITEMS: RoomItem[] = [
  {
    id: 'cucumber',
    label: 'Cucumber',
    description:
      "A cucumber. Suspiciously phallic. The chef swears it's just for the salad.",
    x: 412,
    y: 305,
    hoverRadius: 130,
  },
  {
    id: 'bottle',
    label: 'Curious Bottle',
    description:
      'An iridescent pink bottle. The label peeled off but it smells faintly of regret and almonds.',
    x: 1125,
    y: 250,
    hoverRadius: 110,
  },
  {
    id: 'key',
    label: 'Brass Key',
    description:
      "A small brass key. Looks like it opens something with a low opinion of locks.",
    x: 705,
    y: 392,
    hoverRadius: 70,
  },
  {
    id: 'letter',
    label: 'Bloody Letter',
    description:
      "A blood-stained envelope. The wax seal reads: 'P.S. I ate your snacks.'",
    x: 955,
    y: 410,
    hoverRadius: 120,
  },
  {
    id: 'banana',
    label: 'Banana',
    description:
      'A banana. Disturbingly pristine for a crime scene. Definitely a suspect.',
    x: 360,
    y: 600,
    hoverRadius: 130,
  },
  {
    id: 'lock',
    label: 'Combination Lock',
    description:
      'A three-dial combination lock. The previous owner left a note: "I forgot it too."',
    x: 1140,
    y: 605,
    hoverRadius: 70,
  },
];
