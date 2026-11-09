import { animals, colors, uniqueNamesGenerator } from 'unique-names-generator'

const NOT_FOR_NAMES = new Set([
  'black', 'white', 'brown', 'yellow', 'tan', 'beige', 'chocolate', 'coffee', 'peach',
  'ape', 'baboon', 'monkey', 'gorilla', 'chimpanzee', 'orangutan', 'bonobo', 'mandrill', 'gibbon', 'primate', 'tarsier',
  'booby', 'gayal', 'beaver', 'cougar', 'swallow', 'cockroach', 'bedbug', 'louse', 'leech', 'flea', 'tick', 'mite',
  'hookworm', 'roundworm', 'worm', 'earthworm', 'earwig', 'planarian', 'slug', 'rat', 'pig', 'cow', 'cattle', 'bovid',
  'mule', 'donkey', 'skunk', 'spider', 'tarantula', 'scorpion', 'piranha', 'vulture', 'hyena', 'jackal', 'mosquito',
  'wasp', 'hornet', 'centipede', 'termite', 'locust', 'aphid', 'antlion', 'silverfish', 'lamprey', 'barnacle',
  'mammal', 'amphibian', 'reptile', 'rodent', 'marsupial', 'cephalopod', 'canid', 'canidae', 'felidae', 'galliform',
  'pinniped', 'xerinae', 'fowl', 'landfowl', 'gamefowl', 'wildfowl', 'junglefowl', 'guineafowl', 'mollusk', 'bug',
  'constrictor', 'boa', 'asp', 'viper', 'anaconda', 'python', 'rattlesnake', 'cobra', 'snake', 'basilisk',
  'rooster', 'chicken', 'sheep', 'goat', 'turkey', 'goose', 'ox', 'muskox', 'boar', 'hippopotamus', 'toad',
  'crow', 'cuckoo', 'pigeon', 'dove', 'sloth', 'weasel', 'shrew', 'bass', 'grasshopper', 'peacock', 'peafowl',
])

const SAFE_COLORS = colors.filter((word) => !NOT_FOR_NAMES.has(word))
const SAFE_ANIMALS = animals.filter((word) => !NOT_FOR_NAMES.has(word))
const BAD_NUMBERS = /13|14|69|88|420|666/
const NICKNAME_RE = /^[A-Za-z0-9_]{3,24}$/

function number() {
  for (;;) {
    const value = String(Math.floor(Math.random() * 990) + 10)
    if (!BAD_NUMBERS.test(value)) return value
  }
}

export function randomNickname() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const separator = Math.random() < 0.6 ? '' : '_'
    const base = uniqueNamesGenerator({ dictionaries: [SAFE_COLORS, SAFE_ANIMALS], style: 'capital', separator, length: 2 })
    const name = Math.random() < 0.8 ? `${base}${separator}${number()}` : base
    if (NICKNAME_RE.test(name) && !BAD_NUMBERS.test(name)) return name
  }
  return `Teal_Otter_${number()}`
}
