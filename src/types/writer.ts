export type Writer = {
  id: string
  name: string
}


const RAT_FIRST_NAMES: string[] = [
  "Squeaky",
  "Whisker",
  "Cheddar",
  "Nibbles",
  "Scamper",
  "Twitch",
  "Pipsqueak",
  "Scritch",
  "Scratch",
  "Snout",
  "Scurry",
  "Rizzo",
  "Crumb",
  "Rusty",
  "Peanut",
  "Scamp",
  "Rascal",
  "Gritty",
  "Taily",
  "April",
  "Dean",
  "Doctor",
  "Mister",
  "Miss",
  "Sir",
  "Madam",
  "Big",
  "Lil'",
  "Remy",
  "Splinter",
  "Emile",
  "Templeton",
  "Rattata",
  "Nigel",
  "Django",
  "Rattus",
  "Prof",
  "Yolanda",
  "Scabbers",
  "Ratbert",
  "Amy",
  "Rosemary",
  "Lady",
  "Socrates",
  "Talia",
  "Ms.",
  "Ratasha",
  "Maester",
  "Chuck",
  "Queen",
];

const RAT_LAST_NAMES: string[] = [
  "Cheese",
  "Pettigrew",
  "Rattus",
  "Ratburn",
  "Inkpaw",
  "Scratchwell",
  "McNibble",
  "Cheeseworth",
  "Whiskerton",
  "Seweridge",
  "Presswhisk",
  "Quilltail",
  "Ratsworth",
  "Tailor",
  "Scurrington",
  "Chewstein",
  "Ratrickson",
  "Scamperly",
  "Scribblesnout",
  "Blacktail",
  "Pawprint",
  "Rodenthorpe",
  "Goldchew",
  "Cutteridge",
  "Rat"
];

const RAT_MIDDLE_NAMES: string[] = [
  "J.",
  "Q.",
  "G.",
  "E.",
  "V.",
  "Pip",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
];

export function getRandomRatName(): string {
  const first = RAT_FIRST_NAMES[Math.floor(Math.random() * RAT_FIRST_NAMES.length)];
  const middle = RAT_MIDDLE_NAMES[Math.floor(Math.random() * RAT_MIDDLE_NAMES.length)];
  const last = RAT_LAST_NAMES[Math.floor(Math.random() * RAT_LAST_NAMES.length)];
  if (middle.length > 0)
    return `${first} ${middle} ${last}`;
  return `${first} ${last}`;
}