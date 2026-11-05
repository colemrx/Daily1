// Library of topics. On first launch (with internet) the app downloads each
// article's full text from Wikipedia (free, CC BY-SA licensed) and stores it
// on your phone so you can read everything offline afterwards.
// Add or remove titles freely — any English Wikipedia page title works.
window.LIBRARY = [
  { cat: "Sleep", color: "#5856D6", titles: [
    "Sleep", "Circadian rhythm", "Rapid eye movement sleep", "Non-rapid eye movement sleep", "Slow-wave sleep",
    "Melatonin", "Insomnia", "Sleep apnea", "Sleep deprivation", "Sleep hygiene", "Dream", "Lucid dream", "Nap",
    "Narcolepsy", "Chronotype", "Jet lag", "Shift work sleep disorder", "Restless legs syndrome", "Sleep paralysis",
    "Sleepwalking", "Snoring", "Night terror", "Adenosine", "Polyphasic sleep", "Hypnagogia",
    "Delayed sleep phase disorder", "Advanced sleep phase disorder", "Sleep spindle", "Suprachiasmatic nucleus",
    "Light effects on circadian rhythm", "Sleep inertia", "Bruxism", "Siesta", "Daylight saving time",
    "Cognitive behavioral therapy for insomnia", "Sleep medicine", "Hypersomnia", "Sleep and memory"
  ]},
  { cat: "Health", color: "#FF2D55", titles: [
    "Health", "Blood pressure", "Hypertension", "Cholesterol", "Heart", "Immune system", "Vaccine", "Antibiotic",
    "Antimicrobial resistance", "Gut microbiota", "Inflammation", "Diabetes", "Insulin", "Blood sugar regulation",
    "Obesity", "Body mass index", "Metabolism", "Basal metabolic rate", "Stress (biology)", "Cortisol", "Sunscreen",
    "Vitamin D", "Ultraviolet", "Hand washing", "Tooth decay", "Oral hygiene", "Common cold", "Influenza", "Fever",
    "Allergy", "Asthma", "Skin", "Liver", "Kidney", "Lung", "Blood donation", "First aid",
    "Cardiopulmonary resuscitation", "Sedentary lifestyle", "Longevity", "Blue Zone", "Hearing loss", "Human eye",
    "Myopia", "Migraine", "Headache", "Placebo", "Life expectancy"
  ]},
  { cat: "Nutrition", color: "#34C759", titles: [
    "Nutrition", "Healthy diet", "Protein", "Carbohydrate", "Dietary fiber", "Fat", "Saturated fat", "Trans fat",
    "Omega-3 fatty acid", "Vitamin", "Mineral (nutrient)", "Iron deficiency", "Calcium", "Magnesium", "Potassium",
    "Salt", "Sugar", "Mediterranean diet", "Intermittent fasting", "Calorie", "Whole grain", "Legume",
    "Nut (fruit)", "Vegetable", "Fruit", "Fermentation in food processing", "Probiotic", "Caffeine", "Coffee", "Tea",
    "Green tea", "Olive oil", "Avocado", "Blueberry", "Oatmeal", "Eggs as food", "Ultra-processed food",
    "Glycemic index", "Antioxidant", "Breakfast", "Superfood", "Ketogenic diet", "Veganism", "Vegetarianism"
  ]},
  { cat: "Water", color: "#32ADE6", titles: [
    "Water", "Drinking water", "Dehydration", "Electrolyte", "Water intoxication", "Hyponatremia", "Thirst", "Urine",
    "Sports drink", "Mineral water", "Tap water", "Water fluoridation", "Water filter", "Hard water",
    "Water purification", "Oral rehydration therapy", "Heat stroke", "Kidney stone disease", "Carbonated water",
    "Bottled water", "Coconut water", "Perspiration", "Water cycle", "Body water", "Vasopressin",
    "Electrolyte imbalance", "Heat exhaustion"
  ]},
  { cat: "Habits & Mind", color: "#FF9500", titles: [
    "Habit", "Self-control", "Procrastination", "Motivation", "Goal setting", "SMART criteria", "Time management",
    "Pomodoro Technique", "Getting Things Done", "Mindfulness", "Meditation", "Gratitude", "Diary",
    "Flow (psychology)", "Mindset", "Delayed gratification", "Stanford marshmallow experiment", "Dopamine",
    "Reward system", "Neuroplasticity", "Positive psychology", "Psychological resilience", "Occupational burnout",
    "Anxiety", "Cognitive behavioral therapy", "Self-efficacy", "Learned helplessness", "Cognitive bias",
    "Confirmation bias", "Dunning–Kruger effect", "Sunk cost", "Decision fatigue", "Ego depletion",
    "Spaced repetition", "Forgetting curve", "Memory", "Attention span", "Human multitasking", "Digital detox",
    "Screen time", "Loneliness", "Laughter", "Happiness", "Hedonic treadmill", "Stoicism", "Ikigai", "Kaizen",
    "Minimalism", "Hygge"
  ]},
  { cat: "Fitness", color: "#30B0C7", titles: [
    "Physical fitness", "Exercise", "Aerobic exercise", "Strength training", "High-intensity interval training",
    "Walking", "Running", "Swimming", "Cycling", "Yoga", "Pilates", "Tai chi", "Stretching", "Muscle hypertrophy",
    "Delayed onset muscle soreness", "VO2 max", "Heart rate", "Warming up", "Calisthenics", "Push-up",
    "Squat (exercise)", "Plank (exercise)", "Deadlift", "Marathon", "Endurance", "Flexibility (anatomy)",
    "Physical therapy", "Sports injury", "Runner's high", "Pedometer", "Bone density", "Osteoporosis", "Sarcopenia",
    "Hiking"
  ]},
  { cat: "Spanish", color: "#FF3B30", titles: [
    "Spanish language", "Spanish grammar", "Spanish verbs", "Spanish orthography", "Spanish phonology",
    "History of the Spanish language", "Spanish dialects and varieties", "Mexican Spanish", "Rioplatense Spanish",
    "Caribbean Spanish", "Spanglish", "Royal Spanish Academy", "Language acquisition", "Second-language acquisition",
    "Multilingualism", "Language immersion", "Input hypothesis", "Cognate", "False friend", "Duolingo", "Flashcard",
    "Leitner system", "Vulgar Latin", "Romance languages", "Arabic influence on the Spanish language",
    "Don Quixote", "Miguel de Cervantes", "Gabriel García Márquez", "Pablo Neruda", "Day of the Dead", "Flamenco",
    "Tapas", "Hispanophone", "Latin America", "Spain", "Mexico", "Ñ", "Inverted question and exclamation marks",
    "Subjunctive mood", "Spanish pronouns", "Spanish determiners", "Voseo"
  ]},
  { cat: "Science", color: "#007AFF", titles: [
    "Photosynthesis", "DNA", "Evolution", "Natural selection", "Cell (biology)", "Atom", "Periodic table", "Gravity",
    "Theory of relativity", "Quantum mechanics", "Electricity", "Magnetism", "Light", "Speed of light", "Sound",
    "Energy", "Entropy", "Black hole", "Big Bang", "Plate tectonics", "Earthquake", "Volcano", "Weather", "Climate",
    "Ocean", "Tide", "Rainbow", "Lightning", "Aurora", "Crystal", "Diamond", "Gold", "Carbon", "Oxygen", "Helium",
    "Virus", "Bacteria", "Fungus", "Mitochondrion", "Human genome", "CRISPR gene editing", "Antimatter",
    "Absolute zero"
  ]},
  { cat: "Space", color: "#5E5CE6", titles: [
    "Solar System", "Sun", "Moon", "Mercury (planet)", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune",
    "Pluto", "Milky Way", "Galaxy", "Andromeda Galaxy", "Exoplanet", "International Space Station", "Apollo 11",
    "Hubble Space Telescope", "James Webb Space Telescope", "Voyager 1", "Comet", "Asteroid", "Meteor shower",
    "Eclipse", "Neutron star", "Supernova", "Dark matter", "Dark energy", "Light-year",
    "Search for extraterrestrial intelligence", "Fermi paradox", "Space Shuttle", "Sputnik 1"
  ]},
  { cat: "History", color: "#A2845E", titles: [
    "Ancient Egypt", "Great Pyramid of Giza", "Roman Empire", "Ancient Greece", "Mesopotamia", "Maya civilization",
    "Aztecs", "Inca Empire", "Byzantine Empire", "Mongol Empire", "Silk Road", "Vikings", "Middle Ages",
    "Black Death", "Renaissance", "Printing press", "Age of Discovery", "Ottoman Empire", "Industrial Revolution",
    "French Revolution", "American Revolution", "Meiji Restoration", "World War I", "World War II", "Cold War",
    "Space Race", "Fall of the Berlin Wall", "Great Wall of China", "Machu Picchu", "Stonehenge", "Pompeii",
    "Library of Alexandria", "Rosetta Stone", "Terracotta Army", "Magna Carta", "Titanic", "Al-Andalus",
    "Spanish Empire", "Reconquista", "Polynesian navigation", "Easter Island", "Petra", "Angkor Wat",
    "Hagia Sophia", "Colosseum"
  ]},
  { cat: "Nature", color: "#00C7BE", titles: [
    "Octopus", "Tardigrade", "Western honey bee", "Ant", "Monarch butterfly", "Bird migration", "Hummingbird",
    "Corvidae", "Elephant", "Blue whale", "Dolphin", "Shark", "Sea turtle", "Coral reef", "Great Barrier Reef",
    "Amazon rainforest", "Sequoia sempervirens", "Mycorrhiza", "Bioluminescence", "Axolotl", "Platypus", "Cheetah",
    "Wolf", "Dog", "Cat", "Horse", "Penguin", "Owl", "Bat", "Chameleon", "Jellyfish", "Turritopsis dohrnii",
    "Mantis shrimp", "Giant panda", "Sloth", "Hibernation", "Camouflage", "Symbiosis", "Pollination",
    "Coconut crab", "Brown tree snake"
  ]},
  { cat: "Technology", color: "#8E8E93", titles: [
    "Internet", "World Wide Web", "Computer", "Transistor", "Integrated circuit", "Moore's law",
    "Artificial intelligence", "Machine learning", "Smartphone", "iPhone", "Wi-Fi", "Bluetooth",
    "Global Positioning System", "Cryptography", "Public-key cryptography", "Encryption", "Password",
    "Multi-factor authentication", "Open-source software", "Linux", "Git", "Video game", "Robot", "3D printing",
    "Electric car", "Lithium-ion battery", "Solar energy", "Wind power", "Nuclear power", "Telephone", "Radio",
    "Television", "Camera", "Barcode", "QR code"
  ]},
  { cat: "Psychology", color: "#AF52DE", titles: [
    "Psychology", "Emotion", "Personality", "Big Five personality traits", "Extraversion and introversion",
    "Empathy", "Maslow's hierarchy of needs", "Cognitive dissonance", "Bystander effect", "Milgram experiment",
    "Stanford prison experiment", "Classical conditioning", "Operant conditioning", "Déjà vu", "Nostalgia",
    "Boredom", "Curiosity", "Creativity", "Intelligence", "Emotional intelligence", "Body language",
    "Facial expression", "Color psychology", "Social media", "Impostor syndrome", "Optimism bias",
    "The Paradox of Choice", "Mere-exposure effect", "Pareidolia", "Synesthesia"
  ]},
  { cat: "Places", color: "#34C759", titles: [
    "Mount Everest", "Mariana Trench", "Guam", "Pacific Ocean", "Sahara", "Antarctica", "Amazon River", "Nile",
    "Dead Sea", "Grand Canyon", "Iceland", "Japan", "New Zealand", "Galápagos Islands", "Madagascar", "Venice",
    "Kyoto", "Barcelona", "Madrid", "Mexico City", "Buenos Aires", "Havana", "Patagonia", "Andes",
    "Atacama Desert", "Lake Baikal", "Yellowstone National Park", "Niagara Falls", "Victoria Falls", "Angel Falls",
    "Ring of Fire", "Bermuda Triangle", "Micronesia", "Hawaii", "Northern Mariana Islands"
  ]},
  { cat: "Culture", color: "#FF2D55", titles: [
    "Music", "Wolfgang Amadeus Mozart", "Ludwig van Beethoven", "Jazz", "Hip-hop", "Leonardo da Vinci",
    "Mona Lisa", "Vincent van Gogh", "Frida Kahlo", "Pablo Picasso", "Salvador Dalí", "Antoni Gaudí",
    "Sagrada Família", "William Shakespeare", "Origami", "Chess", "Olympic Games", "FIFA World Cup",
    "Association football", "Basketball", "Baseball", "Pizza", "Sushi", "Chocolate", "Taco", "Paella", "Bread",
    "Cheese", "Spice trade", "Coffeehouse", "Chinese New Year", "Japanese tea ceremony", "Film", "Animation",
    "Photography", "Architecture"
  ]},
  { cat: "Curiosities", color: "#FFCC00", titles: [
    "Voynich manuscript", "Antikythera mechanism", "Nazca Lines", "Tunguska event", "Ball lightning",
    "Mpemba effect", "Golden ratio", "Fibonacci sequence", "Pi", "Infinity", "Monty Hall problem",
    "Birthday problem", "Zeno's paradoxes", "Ship of Theseus", "Trolley problem", "Butterfly effect",
    "Murphy's law", "Occam's razor", "Schrödinger's cat", "Simulation hypothesis", "Wow! signal", "Mary Celeste",
    "Dancing plague of 1518", "Emu War", "Coelacanth", "Lazarus taxon", "Earworm", "Hiccup", "Yawn",
    "Goose bumps", "Brain freeze", "Sneeze", "Handedness", "Fingerprint", "Petrichor", "Uncanny valley",
    "Sonic boom", "Coriolis force", "Atlantis"
  ]},
  { cat: "Life Skills", color: "#64D2FF", titles: [
    "Compound interest", "Inflation", "Budget", "Personal finance", "Index fund", "Credit score",
    "Opportunity cost", "Supply and demand", "Stock market", "Cryptocurrency", "Negotiation", "Public speaking",
    "Critical thinking", "Fallacy", "Scientific method", "Speed reading", "Touch typing", "Note-taking",
    "Cornell Notes", "Mind map", "Method of loci", "Active listening", "Cooking", "Gardening", "Sewing"
  ]}
];
