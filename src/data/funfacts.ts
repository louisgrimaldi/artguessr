/**
 * Hand-written "did you know" lines, one per artist and per movement.
 *
 * Deliberately not generated: these are written only where the fact is
 * well-established and checkable, and left out entirely otherwise. An artist
 * with no entry simply shows no fun fact — better a gap than an invention.
 *
 * Artwork-level colour comes from a different place: the Wikipedia-sourced
 * museum label in blurbs.json, which usually carries the striking detail
 * already ("sold for $140 million…").
 */

export const ARTIST_FACTS: Record<string, string> = {
  'leonardo-da-vinci':
    'He wrote his notebooks in mirror script, right to left, readable only by holding the page to a looking glass.',
  michelangelo:
    'He signed only one work in his life — the Pietà — after overhearing visitors credit it to a rival sculptor.',
  raphael:
    'He slipped his own face into The School of Athens, watching the viewer from the far right of the crowd.',
  titian:
    'Charles V once stooped to pick up a brush Titian had dropped, an unheard-of courtesy from an emperor to a painter.',
  botticelli:
    'He painted for the Medici, then fell under the sway of the preacher Savonarola and turned to harsher religious work.',
  durer:
    'His famous rhinoceros woodcut was drawn from a written description alone — he never saw the animal.',
  bosch:
    "The Garden of Earthly Delights hides music written on a figure's backside; people have since transcribed and performed it.",
  'bruegel-elder':
    'In Landscape with the Fall of Icarus the drowning hero is just two legs in the corner, ignored by everyone.',
  'van-eyck':
    'The Arnolfini Portrait signs itself in Latin on the back wall: "Jan van Eyck was here, 1434".',
  'el-greco':
    'His stretched figures were long blamed on astigmatism — an idea art historians now dismiss as a myth.',
  caravaggio:
    'He killed a man in a brawl in 1606 and painted much of his late work while under a papal death sentence.',
  'artemisia-gentileschi':
    'She was tortured with thumbscrews during her rapist\'s trial — to test whether her testimony held under pain.',
  rubens:
    'He worked as a diplomat between Spain and England, and was knighted by the kings of both.',
  rembrandt:
    'He painted roughly eighty self-portraits, leaving the fullest record in all of art of a single face growing old.',
  vermeer:
    'Only about 35 paintings survive, and he was largely forgotten until critics rediscovered him in the 1860s.',
  velazquez:
    'In Las Meninas he paints himself painting, and the royal couple appear only as a reflection in a mirror.',
  'frans-hals': 'Popular in his own lifetime, he nonetheless died so poor that the city of Haarlem paid for his funeral.',
  bernini:
    'He was also a playwright and stage designer, and wrote comedies performed with his own special effects.',
  fragonard:
    'The Swing was commissioned by a nobleman who asked to be painted looking up his mistress\'s skirts.',
  watteau: 'The French Academy invented a whole new category — the fête galante — because his work fitted no existing one.',
  gainsborough:
    'He painted portraits only for the money, once complaining he was sick of "faces" and longed to paint landscapes.',
  'vigee-le-brun':
    'She painted Marie Antoinette more than thirty times, and fled France on the night the royal family was arrested.',
  'jacques-louis-david':
    'He voted for the execution of Louis XVI, then later became Napoleon\'s official painter.',
  ingres:
    'He was a good enough violinist that "violon d\'Ingres" became the French phrase for a serious hobby.',
  canova:
    'Offered the job of restoring the Elgin Marbles, he refused, saying it would be sacrilege to touch them.',
  goya: 'The Black Paintings were never meant to be seen — he painted them straight onto the walls of his own house.',
  delacroix: 'Liberty Leading the People was bought by the French state, then hidden for years as too inflammatory.',
  gericault:
    'He interviewed survivors and studied corpses in a morgue to get The Raft of the Medusa right.',
  turner:
    'He claimed to have had himself lashed to a ship\'s mast during a storm so he could paint it truthfully.',
  'caspar-david-friedrich':
    'Almost all his figures are seen from behind, so the viewer stands where they stand and sees what they see.',
  constable:
    'He catalogued clouds like a scientist, labelling oil sketches with the date, hour and wind direction.',
  'william-blake': 'He claimed to have seen a tree filled with angels as a boy, and talked with his dead brother\'s spirit.',
  hokusai:
    'He used more than thirty names in his life and, at eighty-nine, said he still needed more years to learn to draw.',
  hiroshige: 'Van Gogh admired his prints so much that he copied two of them in oil, Japanese characters and all.',
  courbet:
    'He was jailed and fined for his part in toppling a column in Paris, and fled to Switzerland rather than pay.',
  millet: 'The Angelus was X-rayed at Dalí\'s insistence, revealing a painted-over shape he believed was a coffin.',
  'rosa-bonheur':
    'She held a police permit to wear trousers, renewable every six months, so she could work in cattle markets.',
  rossetti:
    'He buried his poems in his wife\'s coffin, then had her exhumed seven years later to get them back.',
  millais: 'His model for Ophelia posed in a bath warmed by lamps. The lamps went out, she caught a severe chill, and her father sent Millais the doctor\'s bill.',
  whistler:
    'He sued Ruskin for libel, won — and was awarded a single farthing in damages, which bankrupted him.',
  sargent:
    'The scandal over Madame X\'s fallen shoulder strap was so fierce he repainted it and left Paris for London.',
  manet: 'Both Olympia and Le Déjeuner sur l\'herbe caused such outrage that guards were posted to protect them.',
  monet:
    'He had the Giverny water-lily pond dug himself, diverting a river — the neighbours objected that it would poison the water.',
  renoir:
    'Crippled by arthritis in old age, he kept painting with brushes strapped to his bandaged hands.',
  degas: 'His wax sculptures were found only after his death — about 150 of them, in his studio, many falling apart.',
  pissarro:
    'He is the only artist who showed in all eight Impressionist exhibitions, and mentored both Cézanne and Gauguin.',
  morisot: 'She married Manet\'s brother, and appears in eleven of Manet\'s paintings.',
  cassatt: 'She never married, and quietly steered wealthy American collectors towards Impressionism, shaping museum collections across the United States.',
  cezanne:
    'He painted Mont Sainte-Victoire more than eighty times, and Picasso and Matisse both called him "the father of us all".',
  'van-gogh':
    'He sold very little in his lifetime and wrote over 600 letters to his brother Theo, who funded him throughout.',
  gauguin:
    'He worked as a stockbroker until the 1882 crash, then abandoned finance and his family for painting.',
  seurat: 'A Sunday on La Grande Jatte took him two years and roughly sixty preparatory studies.',
  'toulouse-lautrec':
    'His legs stopped growing after two childhood fractures; he stood about 1.4 metres tall as an adult.',
  'henri-rousseau':
    'He painted jungles without ever leaving France, working from the Paris botanical gardens and picture books.',
  klimt:
    'He worked in a smock with nothing underneath and kept cats in the studio, letting them walk over his drawings.',
  munch: 'Versions of The Scream have been stolen twice, in 1994 and 2004, and both times recovered.',
  rodin:
    'The Thinker began as Dante, seated above the Gates of Hell looking down on the damned.',
  brancusi:
    'US customs taxed Bird in Space as a manufactured metal object. He sued, and the case forced the law to define what art is.',
  'henry-moore': 'He drew Londoners sheltering in Underground stations during the Blitz as an official war artist.',
  giacometti:
    'He destroyed most of what he made, and once said a sculpture was finished only when he could no longer bear it.',
  matisse:
    'Cancer surgery left him bedbound at 71, so he invented the cut-out and "drew with scissors" instead.',
  picasso:
    'He was questioned by police over the theft of the Mona Lisa in 1911 — a friend had stolen statuettes from the Louvre.',
  braque: 'He and Picasso worked so closely they sometimes could not tell whose canvas was whose.',
  kandinsky:
    'He gave up a law professorship at thirty to paint, after seeing a Monet haystack whose subject he could not identify.',
  mondrian: 'He disliked green so intensely that he reportedly refused to sit at a table facing a window that looked onto trees.',
  malevich:
    'He hung Black Square high across a corner — the spot reserved in Russian homes for a religious icon.',
  'hilma-af-klint':
    'She painted abstractions years before Kandinsky, then ordered them hidden for twenty years after her death.',
  'paul-klee':
    'A trained violinist, he played Bach and Mozart most mornings before painting, and married a pianist.',
  kirchner:
    'The Nazis branded him degenerate and sold off his work; he shot himself the following year.',
  schiele: 'He was jailed for 24 days in 1912, and a judge burned one of his drawings over a candle flame in court.',
  kollwitz: 'She was the first woman elected to the Prussian Academy of Arts, and was forced out by the Nazis in 1933.',
  modigliani:
    'His partner Jeanne, nine months pregnant, took her own life the day after he died.',
  chagall: 'He painted the ceiling of the Paris Opera at 77, covering the older ceiling rather than destroying it.',
  duchamp:
    'He spent his last twenty years secretly building a final tableau, revealed only after his death.',
  dali:
    'He designed the Chupa Chups logo, and once gave a lecture in a deep-sea diving suit and nearly suffocated.',
  magritte:
    'He painted in his dining room in a suit and tie, and kept such regular hours the neighbours took him for a clerk.',
  'max-ernst': 'Interned in France as an enemy alien, he escaped to America with help from Peggy Guggenheim, whom he married.',
  miro: 'His early hallucinations came from hunger — he was too poor to eat properly and painted what he saw.',
  'frida-kahlo':
    'She began painting during the year she spent in a body cast, using a mirror fixed above her bed.',
  'diego-rivera':
    'His Rockefeller Center mural was destroyed for including Lenin, after he refused to paint the face out.',
  okeeffe:
    'She moved permanently to the New Mexico desert after her husband\'s death and painted there into her nineties.',
  hopper: 'His wife Jo modelled for every woman in his mature paintings and kept the ledger recording each one.',
  'grant-wood':
    'American Gothic was modelled by his sister and his dentist; Iowans wrote in furious at being made to look grim.',
  'andrew-wyeth':
    'In 1986 he revealed 240 secret paintings of a neighbour named Helga, made over fifteen years.',
  'jacob-lawrence':
    'He was 23 when the Migration Series made him famous, and researched every panel at the Schomburg library in Harlem.',
  pollock:
    'Life magazine asked in 1949 whether he was "the greatest living painter in the United States", making him a celebrity.',
  rothko:
    'He returned a huge Four Seasons commission and gave the money back rather than let diners eat beneath his paintings.',
  'de-kooning': 'He stowed away on a ship to America at 22 and worked as a house painter for years before painting full time.',
  'lee-krasner':
    'Short of canvas, she cut up her own rejected paintings and reassembled them into collages.',
  warhol:
    'Shot and nearly killed in 1968, he wore a surgical corset for the rest of his life.',
  lichtenstein: 'A 1964 magazine profile asked in its headline whether he was "the worst artist in the U.S."',
  hockney:
    'He designed opera sets for Glyndebourne and the Met, and took up drawing on an iPad in his seventies.',
  'francis-bacon':
    'His studio was so chaotic it was catalogued item by item — over 7,000 objects — and rebuilt inside a Dublin gallery.',
  'lucian-freud':
    'He worked from life for hundreds of hours per painting; one sitter sat for roughly 2,400 hours across sixteen months.',
  'gerhard-richter':
    'He fled East Germany months before the Berlin Wall went up, leaving nearly all his early work behind.',
  'louise-bourgeois':
    'She held Sunday salons at her New York house where young artists brought work for her to critique, often brutally.',
  'yayoi-kusama':
    'She has lived voluntarily in a psychiatric hospital since 1977, walking to her studio across the street each day.',
  basquiat:
    'He first became known as SAMO, spraying cryptic slogans around downtown Manhattan while still a teenager.',
  'keith-haring':
    'He opened a shop selling badges and T-shirts of his images, so the work stayed affordable to everyone.',
  'anselm-kiefer':
    'He works across a 200-acre former silk factory in France, complete with tunnels and buildings he built and then deliberately ruined.',
  'kehinde-wiley':
    'He casts his sitters by stopping strangers in the street and asking them to pick an old-master pose.',
  'kerry-james-marshall':
    'His painting Past Times set an auction record for a living Black artist when it sold in 2018.',
  'marina-abramovic':
    'At The Artist Is Present she sat silently for 736 hours; her former partner Ulay appeared, and she wept.',
  'ai-weiwei':
    'He helped design Beijing\'s Bird\'s Nest stadium, then publicly disowned it before the 2008 Olympics.',
  banksy:
    'A canvas shredded itself seconds after selling for £1.04m in 2018 — and was later resold for £18.6m.',
  'cindy-sherman':
    'She is model, stylist, director and photographer in every picture, and works almost entirely alone.',
  'jeff-koons':
    'He funded his early work by selling mutual funds on Wall Street, and his Rabbit set a record for a living artist.',
  'anish-kapoor':
    'He bought exclusive artistic rights to Vantablack, prompting another artist to make a pink no one but Kapoor may use.',
  'yoko-ono':
    'She met Lennon at her own exhibition, where he climbed a ladder to read one tiny word through a magnifier: "YES".',
  'damien-hirst': 'He bypassed his dealers to auction new work directly in 2008 — two days before Lehman Brothers collapsed.',
  'takashi-murakami':
    'His Louis Vuitton collaboration reportedly earned the house hundreds of millions, blurring art and luxury goods.',
  'agnes-martin':
    'She left New York abruptly in 1967, gave away her supplies, and did not paint again for seven years.',
  'cy-twombly': 'A visitor kissed one of his white canvases in 2007, leaving lipstick that cost thousands to remove.',
  'robert-rauschenberg':
    'He asked de Kooning for a drawing to rub out, then exhibited the result as Erased de Kooning Drawing.',
  'joan-mitchell':
    'She was a competitive figure skater as a teenager, and her father pushed her to be a champion at everything.',
  'helen-frankenthaler':
    'She invented soak-stain painting at 23, pouring thinned paint onto raw canvas so it sank in like dye.',
  'barbara-hepworth': 'She raised triplets while carving, and died in a fire in her St Ives studio, now a museum.',
  'sonia-delaunay':
    'She designed cars, textiles and costumes as readily as paintings, and was the first living woman given a Louvre retrospective.',
  'tamara-de-lempicka':
    'She painted herself at the wheel of a green Bugatti she did not own, as an advertisement for her own modernity.',
  'winslow-homer': 'He covered the Civil War as a magazine illustrator before he ever seriously painted.',
  'ilya-repin':
    'His painting of Ivan the Terrible killing his son has been attacked by visitors twice, in 1913 and 2018.',
  canaletto:
    'He almost certainly used a camera obscura, yet freely rearranged Venice\'s buildings for a better composition.',
  kuniyoshi:
    'When the shogunate banned satire, he drew his targets as cats and goldfish so the censors could not touch him.',
  poussin: 'He arranged little wax figures in a model stage set, lit by candle, to plan each composition.',
  'van-dyck': 'His flattering, long-limbed image of Charles I shaped British portraiture for two centuries.',
  'jan-steen': 'A "Jan Steen household" is still Dutch shorthand for a chaotic, disorderly home.',
  leger: 'The trenches convinced him to paint for ordinary people; he called his own early manner "tubism".',
  boccioni:
    'He glorified war in the Futurist manifestos, enlisted, and was killed at 33 — by a fall from a horse.',
  'man-ray':
    'He made "rayographs" by laying objects straight onto photographic paper, needing no camera at all.',
  'odilon-redon':
    'He turned to brilliant colour only in his fifties, having spent decades working almost entirely in black.',
  'camille-claudel':
    'Her family committed her to an asylum in 1913; she lived there thirty years and never sculpted again.',
  derain:
    'He accepted a Nazi-sponsored trip to Germany in 1941, and his reputation never recovered.',
  'juan-gris': 'He lived in the same ramshackle Montmartre building as Picasso, and died at only forty.',
  'jasper-johns':
    'He said the idea for the flag paintings came to him in a dream, and his 1958 debut sold out almost entirely.',
  'el-anatsui':
    'The bottle tops trace the drinks trade between Europe and West Africa, including its links to slavery.',
  'amy-sherald':
    'She had a heart transplant at 39, and painted Michelle Obama\'s official portrait a few years later.',
  'jenny-saville':
    'She studied plastic surgery in New York to learn how flesh is cut and moved before painting it.',
  'olafur-eliasson':
    'For The Weather Project he filled Tate Modern with an artificial sun; visitors lay on the floor for hours.',
};

export const MOVEMENT_FACTS: Record<string, string> = {
  'high-renaissance': 'The whole peak period lasted barely thirty years, and Raphael died at just thirty-seven.',
  'northern-renaissance':
    'Northern painters perfected oil glazes while Italy was still largely working in egg tempera.',
  mannerism: 'The name comes from the Italian "maniera" — style — and began life as an insult.',
  baroque: 'The Catholic Church actively commissioned the drama, as propaganda against the Reformation.',
  'dutch-golden-age':
    'With no church patronage, Dutch painters sold on the open market — ordinary households owned paintings by the dozen.',
  rococo: 'The word derives from "rocaille", the shell-and-pebble decoration of grotto interiors.',
  neoclassicism: 'The excavations of Pompeii and Herculaneum lit the fuse, feeding Europe a direct view of antiquity.',
  romanticism: 'Romanticism has little to do with love — it meant the wild, the sublime and the terrifying.',
  realism: 'Courbet\'s huge canvases of ordinary labourers were scandalous mainly for their size, not their subject.',
  'pre-raphaelite': 'The seven founders signed their early paintings only "PRB", and refused to explain what it meant.',
  impressionism:
    'The name came from a hostile review of Monet\'s Impression, Sunrise — the painters adopted the insult.',
  'post-impressionism': 'Nobody called themselves a Post-Impressionist; a critic coined it for a London show in 1910.',
  symbolism: 'It began as a literary movement, and the poets came first — the painters followed.',
  fauvism: 'A critic called them "les fauves", wild beasts, seeing a classical bust surrounded by their canvases.',
  expressionism: 'The Nazis staged a "Degenerate Art" show in 1937 to mock it; two million people came to look.',
  cubism: 'Braque and Picasso left works unsigned on the front so buyers could not tell them apart.',
  futurism: 'Its manifesto demanded the destruction of museums, and glorified war as "the world\'s only hygiene".',
  'abstract-pioneers': 'Hilma af Klint got there years before Kandinsky, but hid the evidence until long after her death.',
  dada: 'It was born in a Zurich cabaret in 1916, and the name may have been picked at random from a dictionary.',
  surrealism:
    'Breton ran it like a political party, formally expelling members — Dalí among them — for deviation.',
  'mexican-muralism': 'The government paid for the walls, wanting a history the largely non-literate public could read.',
  'harlem-renaissance': 'It made Harlem the centre of Black American culture in barely two decades.',
  'american-regionalism': 'It rose in the Depression as a deliberate turn away from European abstraction.',
  'abstract-expressionism':
    'The CIA quietly promoted it abroad during the Cold War as evidence of American freedom.',
  'pop-art': 'It surfaced in Britain before New York — the term was coined by a London critic in the 1950s.',
  minimalism: 'Most of the artists hated the label, and several denied belonging to any movement at all.',
  'conceptual-performance': 'The idea became the artwork, and the object often disappeared entirely.',
  'contemporary-figuration': 'A deliberate reclaiming of portraiture, a genre that had spent centuries excluding its subjects.',
  neoexpressionism: 'It arrived with the 1980s art boom, and prices rose about as fast as the paint went on.',
  'contemporary-sculpture': 'Fabrication is often industrial — the artist designs, and engineers and factories build.',
  'modern-sculpture': 'Rodin was accused of casting from a living body, because his figures looked impossibly real.',
  'ukiyo-e':
    'The prints reached Europe as packing material around imported ceramics, and upended Western composition.',
  'early-renaissance': 'Brunelleschi worked out linear perspective around 1420, and painting changed within a generation.',
  'british-portraiture': 'Reynolds and Gainsborough were bitter rivals who disagreed on almost everything about painting.',
  'belle-epoque-portraiture': 'A Sargent portrait could cost as much as a house, and sitters queued for years.',
  'american-modernism': 'It grew out of Stieglitz\'s New York gallery, which showed Picasso in America before most Europeans had.',
  'art-deco': 'It took its name from a 1925 Paris exhibition — but only retrospectively, in the 1960s.',
  'street-art': 'Much of it is illegal to make and, once famous, is cut out of the wall and sold.',
};
