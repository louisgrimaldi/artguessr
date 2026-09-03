export interface Movement {
  id: string;
  name: string;
  /** Human-readable active period, e.g. "1870–1886" */
  years: string;
  /** One-line characterisation of the movement. */
  blurb: string;
  /** Other leading figures, used in the reveal card. */
  keyArtists: string[];
}

export const MOVEMENTS: Record<string, Movement> = {
  'early-renaissance': {
    id: 'early-renaissance',
    name: 'Early Renaissance',
    years: '1400–1490',
    blurb:
      'Florence rediscovering perspective, ancient Greece and Rome, and the individual human body.',
    keyArtists: ['Sandro Botticelli', 'Masaccio', 'Donatello', 'Piero della Francesca'],
  },
  'british-portraiture': {
    id: 'british-portraiture',
    name: 'British Grand Manner Portraiture',
    years: '1740–1800',
    blurb:
      'Georgian society portraits that borrow the poses and grandeur of history painting to flatter their sitters.',
    keyArtists: ['Thomas Gainsborough', 'Joshua Reynolds', 'George Romney', 'Thomas Lawrence'],
  },
  'belle-epoque-portraiture': {
    id: 'belle-epoque-portraiture',
    name: 'Belle Époque Society Portraiture',
    years: '1870–1920',
    blurb:
      'Dazzling portraits of rich transatlantic society, painted fast and loose, with an eye for silk, jewels and status.',
    keyArtists: ['John Singer Sargent', 'James McNeill Whistler', 'Giovanni Boldini', 'Anders Zorn'],
  },
  'american-modernism': {
    id: 'american-modernism',
    name: 'American Modernism',
    years: '1910–1950',
    blurb:
      'An American answer to European modern art, tuned to skyscrapers, deserts and machine-age precision.',
    keyArtists: ["Georgia O'Keeffe", 'Charles Demuth', 'Arthur Dove', 'Marsden Hartley'],
  },
  'art-deco': {
    id: 'art-deco',
    name: 'Art Deco',
    years: '1920–1940',
    blurb:
      'Sleek luxury between the wars — geometric shapes, glossy surfaces and machine-age glamour, in art and design alike.',
    keyArtists: ['Tamara de Lempicka', 'Erté', 'Jean Dupas', 'Paul Manship'],
  },
  'street-art': {
    id: 'street-art',
    name: 'Street Art',
    years: '1980–present',
    blurb:
      'Unofficial work made on walls with stencils, spray and paste-ups, reaching people directly instead of through galleries.',
    keyArtists: ['Banksy', 'Keith Haring', 'Shepard Fairey', 'JR'],
  },
  'high-renaissance': {
    id: 'high-renaissance',
    name: 'High Renaissance',
    years: '1490–1527',
    blurb:
      'The short, dazzling peak of Italian art, after balance, ideal bodies and carefully measured space.',
    keyArtists: ['Leonardo da Vinci', 'Michelangelo', 'Raphael', 'Titian'],
  },
  'northern-renaissance': {
    id: 'northern-renaissance',
    name: 'Northern Renaissance',
    years: '1430–1580',
    blurb:
      'Northern European painting built on oil glazes, tiny detail and dense religious symbolism, rather than Italian classical ideals.',
    keyArtists: ['Jan van Eyck', 'Albrecht Dürer', 'Hieronymus Bosch', 'Pieter Bruegel the Elder'],
  },
  mannerism: {
    id: 'mannerism',
    name: 'Mannerism',
    years: '1520–1600',
    blurb:
      'A deliberately artificial reaction against Renaissance balance: stretched bodies, sharp colours, crowded and unsettled compositions.',
    keyArtists: ['El Greco', 'Pontormo', 'Parmigianino', 'Bronzino'],
  },
  baroque: {
    id: 'baroque',
    name: 'Baroque',
    years: '1600–1750',
    blurb:
      'Theatrical light, diagonal movement and raw emotion, usually working for the Catholic church or an absolute monarch.',
    keyArtists: ['Caravaggio', 'Rembrandt', 'Peter Paul Rubens', 'Diego Velázquez'],
  },
  'dutch-golden-age': {
    id: 'dutch-golden-age',
    name: 'Dutch Golden Age',
    years: '1600–1700',
    blurb:
      'A Protestant, merchant-funded boom in home scenes, landscapes and still lifes, painted for the open market rather than the church.',
    keyArtists: ['Rembrandt', 'Johannes Vermeer', 'Frans Hals', 'Jacob van Ruisdael'],
  },
  rococo: {
    id: 'rococo',
    name: 'Rococo',
    years: '1720–1780',
    blurb:
      'Aristocratic French frivolity: pastel colours, curling ornament, flirtation and pastoral fantasy, on an intimate scale.',
    keyArtists: ['Jean-Honoré Fragonard', 'Antoine Watteau', 'François Boucher'],
  },
  neoclassicism: {
    id: 'neoclassicism',
    name: 'Neoclassicism',
    years: '1760–1830',
    blurb:
      'A severe return to Greek and Roman models — clear outlines, shallow stage-like space, and themes of duty and sacrifice.',
    keyArtists: ['Jacques-Louis David', 'Jean-Auguste-Dominique Ingres', 'Antonio Canova'],
  },
  romanticism: {
    id: 'romanticism',
    name: 'Romanticism',
    years: '1800–1850',
    blurb:
      'Feeling over reason: storms, ruins, revolt and the terrifying scale of nature, painted with loose, agitated brushwork.',
    keyArtists: ['Eugène Delacroix', 'Francisco Goya', 'J. M. W. Turner', 'Caspar David Friedrich'],
  },
  realism: {
    id: 'realism',
    name: 'Realism',
    years: '1840–1880',
    blurb:
      'Ordinary working people and unidealised life, painted at the size once reserved for kings and saints, often as a political act.',
    keyArtists: ['Gustave Courbet', 'Jean-François Millet', 'Honoré Daumier', 'Ilya Repin'],
  },
  'pre-raphaelite': {
    id: 'pre-raphaelite',
    name: 'Pre-Raphaelite Brotherhood',
    years: '1848–1900',
    blurb:
      'British painters rejecting academic rules for jewel-bright colour, sharp detail, and subjects from literature and the Middle Ages.',
    keyArtists: ['Dante Gabriel Rossetti', 'John Everett Millais', 'William Holman Hunt', 'John William Waterhouse'],
  },
  impressionism: {
    id: 'impressionism',
    name: 'Impressionism',
    years: '1870–1886',
    blurb:
      'Painting the passing effects of light outdoors in broken, visible strokes, with modern leisure replacing grand storytelling.',
    keyArtists: ['Claude Monet', 'Pierre-Auguste Renoir', 'Edgar Degas', 'Camille Pissarro'],
  },
  'post-impressionism': {
    id: 'post-impressionism',
    name: 'Post-Impressionism',
    years: '1886–1905',
    blurb:
      'A loose generation pushing past Impressionism towards structure, symbolism and heightened, expressive colour.',
    keyArtists: ['Paul Cézanne', 'Vincent van Gogh', 'Paul Gauguin', 'Georges Seurat'],
  },
  symbolism: {
    id: 'symbolism',
    name: 'Symbolism',
    years: '1880–1910',
    blurb:
      'Dreams, myth and death suggested rather than described, in reaction against Realism and industrial life.',
    keyArtists: ['Gustav Klimt', 'Odilon Redon', 'Gustave Moreau', 'Edvard Munch'],
  },
  fauvism: {
    id: 'fauvism',
    name: 'Fauvism',
    years: '1904–1908',
    blurb:
      'Colour set free from description — violent, unnatural shades laid on flat, earning the group the nickname "wild beasts".',
    keyArtists: ['Henri Matisse', 'André Derain', 'Maurice de Vlaminck'],
  },
  expressionism: {
    id: 'expressionism',
    name: 'Expressionism',
    years: '1905–1935',
    blurb:
      'Mostly German art that distorts shape and colour to put anxiety, alienation and political anger on the surface.',
    keyArtists: ['Ernst Ludwig Kirchner', 'Egon Schiele', 'Käthe Kollwitz', 'Emil Nolde'],
  },
  cubism: {
    id: 'cubism',
    name: 'Cubism',
    years: '1907–1922',
    blurb:
      'Objects broken into facets and reassembled from several viewpoints at once, dismantling single-point perspective.',
    keyArtists: ['Pablo Picasso', 'Georges Braque', 'Juan Gris', 'Fernand Léger'],
  },
  futurism: {
    id: 'futurism',
    name: 'Futurism',
    years: '1909–1918',
    blurb:
      'An Italian cult of speed, machines and violence, showing movement as repeated, slicing lines of force.',
    keyArtists: ['Umberto Boccioni', 'Giacomo Balla', 'Gino Severini'],
  },
  'abstract-pioneers': {
    id: 'abstract-pioneers',
    name: 'Early Abstraction',
    years: '1910–1930',
    blurb:
      'The first move into art with no subject at all, driven variously by spiritualism, music and utopian geometry.',
    keyArtists: ['Wassily Kandinsky', 'Piet Mondrian', 'Kazimir Malevich', 'Hilma af Klint'],
  },
  dada: {
    id: 'dada',
    name: 'Dada',
    years: '1916–1924',
    blurb:
      'Anti-art born of the First World War: chance, absurdity and the found object, used to mock respectable taste.',
    keyArtists: ['Marcel Duchamp', 'Hannah Höch', 'Man Ray', 'Jean Arp'],
  },
  surrealism: {
    id: 'surrealism',
    name: 'Surrealism',
    years: '1924–1950',
    blurb:
      'Dream logic and the Freudian unconscious made visible, through chance methods and impossible, hyper-real combinations.',
    keyArtists: ['Salvador Dalí', 'René Magritte', 'Max Ernst', 'Joan Miró'],
  },
  'mexican-muralism': {
    id: 'mexican-muralism',
    name: 'Mexican Muralism',
    years: '1920–1950',
    blurb:
      'State-funded public murals retelling Mexican history and indigenous identity, for an audience that largely could not read.',
    keyArtists: ['Diego Rivera', 'José Clemente Orozco', 'David Alfaro Siqueiros'],
  },
  'harlem-renaissance': {
    id: 'harlem-renaissance',
    name: 'Harlem Renaissance',
    years: '1918–1937',
    blurb:
      'A flowering of Black American art and writing centred on Harlem, building a modern visual language for Black life.',
    keyArtists: ['Aaron Douglas', 'Jacob Lawrence', 'Archibald Motley', 'Augusta Savage'],
  },
  'american-regionalism': {
    id: 'american-regionalism',
    name: 'American Scene / Regionalism',
    years: '1925–1945',
    blurb:
      'Depression-era realism turning away from European abstraction towards rural and small-town American subjects.',
    keyArtists: ['Grant Wood', 'Edward Hopper', 'Thomas Hart Benton', 'Andrew Wyeth'],
  },
  'abstract-expressionism': {
    id: 'abstract-expressionism',
    name: 'Abstract Expressionism',
    years: '1943–1965',
    blurb:
      'Postwar New York painting at wall scale — sweeping gesture or vast fields of colour, presented as a pure act of self.',
    keyArtists: ['Jackson Pollock', 'Mark Rothko', 'Willem de Kooning', 'Lee Krasner'],
  },
  'pop-art': {
    id: 'pop-art',
    name: 'Pop Art',
    years: '1955–1970',
    blurb:
      'Advertising, comics and packaging absorbed into fine art, with deadpan, machine-like detachment.',
    keyArtists: ['Andy Warhol', 'Roy Lichtenstein', 'Claes Oldenburg', 'David Hockney'],
  },
  minimalism: {
    id: 'minimalism',
    name: 'Minimalism',
    years: '1960–1975',
    blurb:
      'Factory-made, repeated geometric units stripped of metaphor, drawing attention to the object and the room around it.',
    keyArtists: ['Donald Judd', 'Agnes Martin', 'Dan Flavin', 'Frank Stella'],
  },
  'conceptual-performance': {
    id: 'conceptual-performance',
    name: 'Conceptual & Performance Art',
    years: '1965–present',
    blurb:
      'Art moved from the object to the idea, the instruction, or the artist\'s body acting in real time.',
    keyArtists: ['Marina Abramović', 'Joseph Beuys', 'Yoko Ono', 'Sol LeWitt'],
  },
  'contemporary-figuration': {
    id: 'contemporary-figuration',
    name: 'Contemporary Figuration',
    years: '1980–present',
    blurb:
      'A broad return to the painted figure, often reworking portrait tradition around race, identity and power.',
    keyArtists: ['Kehinde Wiley', 'Kerry James Marshall', 'Jenny Saville', 'Amy Sherald'],
  },
  neoexpressionism: {
    id: 'neoexpressionism',
    name: 'Neo-Expressionism',
    years: '1975–1990',
    blurb:
      'A raw, market-fuelled revival of large figurative painting, after the cool restraint of Minimalism and Conceptual art.',
    keyArtists: ['Jean-Michel Basquiat', 'Anselm Kiefer', 'Georg Baselitz', 'Julian Schnabel'],
  },
  'contemporary-sculpture': {
    id: 'contemporary-sculpture',
    name: 'Contemporary Sculpture & Installation',
    years: '1970–present',
    blurb:
      'Spectacle, scale and industrial fabrication turning sculpture into environments and public landmarks.',
    keyArtists: ['Louise Bourgeois', 'Anish Kapoor', 'Jeff Koons', 'Yayoi Kusama'],
  },
  'modern-sculpture': {
    id: 'modern-sculpture',
    name: 'Modern Sculpture',
    years: '1880–1960',
    blurb:
      'Sculpture breaking away from official monuments towards fragments, abstraction and honesty about materials.',
    keyArtists: ['Auguste Rodin', 'Constantin Brâncuși', 'Henry Moore', 'Alberto Giacometti'],
  },
  'ukiyo-e': {
    id: 'ukiyo-e',
    name: 'Ukiyo-e',
    years: '1660–1900',
    blurb:
      'Japanese woodblock prints of actors, courtesans and landscapes, whose flat colour and bold cropping reshaped European art.',
    keyArtists: ['Katsushika Hokusai', 'Utagawa Hiroshige', 'Kitagawa Utamaro'],
  },
};
