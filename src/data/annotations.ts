/**
 * Hotspots for Spectator mode: points on a painting you can hover to be told
 * what you are looking at.
 *
 * Hand-written, keyed by Wikidata item id. `x` and `y` are percentages of the
 * image, measured from the top-left, so they hold at any display size — the
 * viewer sizes its frame to the picture's own aspect ratio precisely so these
 * stay aligned.
 *
 * Positions are placed from the standard full reproduction of each work. They
 * are deliberately approximate: the marker is a generous target, and the point
 * is to draw the eye to roughly the right place, not to trace an outline.
 *
 * Only a selection of works is covered — these take real effort to write well,
 * and a wrong label is worse than none. Works without an entry simply show the
 * description panel and no markers.
 */
export interface Hotspot {
  /** Percentage across, 0–100. */
  x: number;
  /** Percentage down, 0–100. */
  y: number;
  label: string;
  text: string;
}

export const ANNOTATIONS: Record<string, Hotspot[]> = {
  // Picasso — Guernica
  Q175036: [
    { x: 13, y: 18, label: 'The bull', text: 'Standing over a screaming mother, impassive. Picasso refused to explain it, saying only that the bull is brutality and darkness.' },
    { x: 44, y: 32, label: 'The horse', text: 'The dying horse at the centre, mouth open in a scream, a spear through its side. Usually read as the Spanish people.' },
    { x: 36, y: 8, label: 'The light bulb', text: 'A harsh electric eye in a jagged sun. The Spanish for bulb, bombilla, puns on bomba — bomb.' },
    { x: 11, y: 32, label: 'Mother and child', text: 'A woman howling with her dead baby, echoing centuries of Pietà paintings.' },
    { x: 26, y: 87, label: 'The broken warrior', text: 'A severed arm still grips a shattered sword, from which a single flower grows.' },
    { x: 66, y: 25, label: 'The lamp bearer', text: 'A woman leans in through a window holding an oil lamp — an older light, witnessing the scene.' },
    { x: 91, y: 45, label: 'The falling figure', text: 'Arms raised inside a burning building, trapped. Picasso painted the whole mural in black, white and grey, like newsprint.' },
  ],

  // Van Gogh — The Starry Night
  Q45585: [
    { x: 22, y: 55, label: 'The cypress', text: 'A dark flame of a tree in the foreground, traditionally planted in graveyards. It links the earth to the sky.' },
    { x: 46, y: 28, label: 'The swirling sky', text: 'Rolling currents that no one else could see. Van Gogh painted this from memory in an asylum at Saint-Rémy.' },
    { x: 89, y: 13, label: 'The moon', text: 'A blazing crescent in the top right, ringed with yellow halo strokes.' },
    { x: 57, y: 82, label: 'The village', text: 'A quiet Dutch-looking town with a church spire — largely invented, not the view from his window.' },
  ],

  // Velázquez — Las Meninas
  Q208758: [
    { x: 49, y: 70, label: 'The Infanta', text: 'Margarita Teresa, aged five, lit brightest and placed at the centre with her ladies-in-waiting around her.' },
    { x: 24, y: 53, label: 'The painter', text: 'Velázquez himself, brush in hand, standing at a canvas whose front we never see.' },
    { x: 42, y: 56, label: 'The mirror', text: 'On the back wall, the king and queen appear as a dim reflection — so they stand where you stand.' },
    { x: 59, y: 57, label: 'The doorway', text: 'A courtier pauses on a lit staircase at the back, holding the curtain, unsure whether to enter.' },
    { x: 73, y: 89, label: 'The dog', text: 'A mastiff dozes while a dwarf nudges it with a foot — nobody is quite behaving for the portrait.' },
  ],

  // Van Eyck — Arnolfini Portrait
  Q220859: [
    { x: 52, y: 29, label: 'The mirror', text: 'A convex mirror on the back wall reflects the room — and two extra figures standing where you are.' },
    { x: 50, y: 21, label: 'The signature', text: 'Above the mirror, in flourishing Latin: "Jan van Eyck was here, 1434".' },
    { x: 50, y: 11, label: 'The chandelier', text: 'A single candle burns in daylight, often read as the eye of God, or as a marriage rite.' },
    { x: 46, y: 88, label: 'The dog', text: 'A griffon terrier at their feet — an emblem of fidelity, and a display of wealth.' },
    { x: 11, y: 87, label: 'The shoes', text: 'Discarded clogs. The ground is holy, or the couple are at home; both readings are argued.' },
  ],

  // Botticelli — The Birth of Venus
  Q151047: [
    { x: 51, y: 25, label: 'Venus', text: 'Standing on a scallop shell, blown ashore. Her pose copies an antique statue type, weight on one leg, hands covering herself.' },
    { x: 19, y: 24, label: 'The winds', text: 'Zephyr and a nymph on the left, entwined, blowing her to land in a shower of roses.' },
    { x: 83, y: 41, label: 'The Hour', text: 'A goddess of the seasons waits on the shore, holding out a flowered cloak to wrap her in.' },
  ],

  // Vermeer — Girl with a Pearl Earring
  Q185372: [
    { x: 61, y: 53, label: 'The pearl', text: 'Two strokes of white lead, and nothing else. It is probably too large to be a real pearl.' },
    { x: 53, y: 24, label: 'The turban', text: 'Bright blue ultramarine, ground from lapis lazuli — at the time more costly than gold.' },
    { x: 46, y: 38, label: 'The glance', text: 'She turns towards you out of pure black, mouth just parted. Not a portrait but a tronie, a study of a type.' },
  ],

  // Munch — The Scream
  Q471379: [
    { x: 52, y: 54, label: 'The figure', text: 'Not screaming, despite the name: it hears a scream and covers its ears. Munch described a scream passing through nature.' },
    { x: 48, y: 13, label: 'The sky', text: 'Blood-red bands over the fjord. Munch wrote that he saw the clouds turn to blood while walking at sunset.' },
    { x: 11, y: 40, label: 'The two figures', text: 'Companions walking on, oblivious, further down the bridge.' },
    { x: 28, y: 66, label: 'The railing', text: 'A steep diagonal that drags your eye out of the picture and heightens the unease.' },
  ],

  // Grant Wood — American Gothic
  Q464782: [
    { x: 52, y: 76, label: 'The pitchfork', text: 'Its three prongs are echoed in the stitching of his overalls, and again in the window above.' },
    { x: 41, y: 18, label: 'The window', text: 'The pointed Gothic Revival window that gave the painting its name. Wood saw the house first, then imagined its occupants.' },
    { x: 24, y: 30, label: 'The woman', text: 'Wood\'s sister Nan, in a colonial-print apron. She is the daughter, not the wife — a detail often mistaken.' },
    { x: 69, y: 25, label: 'The man', text: 'Wood\'s dentist, Byron McKeeby. Iowans wrote in furious at being made to look so severe.' },
  ],

  // Hokusai — The Great Wave off Kanagawa
  Q252485: [
    { x: 28, y: 26, label: 'The wave', text: 'Its claws of foam curl over the boats. The deep blue is imported Prussian blue, then new to Japan.' },
    { x: 54, y: 84, label: 'The boats', text: 'Three fast cargo boats with rowers flattened against the hulls. Look for the crews before you notice them.' },
    { x: 57, y: 67, label: 'Mount Fuji', text: 'The small snow-capped peak at the centre — the real subject of the series, dwarfed by the wave.' },
  ],

  // Dalí — The Persistence of Memory
  Q25729: [
    { x: 23, y: 63, label: 'The melting watches', text: 'Time gone soft. Dalí said they came from watching Camembert melt in the sun.' },
    { x: 52, y: 70, label: 'The sleeping head', text: 'A drooping profile with long lashes — a distorted self-portrait, asleep and dreaming the scene.' },
    { x: 12, y: 80, label: 'The ants', text: 'Swarming over the one solid watch. Dalí used ants throughout his work as a sign of decay.' },
    { x: 83, y: 25, label: 'The cliffs', text: 'The coast of Catalonia, where he grew up, painted with total clarity behind the impossible objects.' },
  ],

  // Magritte — The Son of Man
  Q1151384: [
    { x: 49, y: 27, label: 'The apple', text: 'A green apple hovering exactly where the face should be. Magritte said everything we see hides another thing.' },
    { x: 49, y: 17, label: 'The bowler hat', text: 'The anonymous uniform of the respectable man, which Magritte wore himself.' },
    { x: 70, y: 58, label: 'The arm', text: 'His left elbow bends the wrong way — easy to miss, and deliberate.' },
    { x: 15, y: 80, label: 'The wall and sea', text: 'A low wall, then flat sea and cloud. The setting is calm, ordinary and impossible.' },
  ],

  // Hopper — Nighthawks
  Q83872: [
    { x: 71, y: 53, label: 'The couple', text: 'Sitting together but not speaking. Hopper\'s wife Jo modelled the woman, as she did every woman in his work.' },
    { x: 55, y: 57, label: 'The man alone', text: 'His back to us, unreadable. We are outside on the street, unable to get in.' },
    { x: 36, y: 30, label: 'No door', text: 'The diner has no visible entrance — a sealed glass box of light.' },
    { x: 16, y: 78, label: 'The empty street', text: 'Not a single other person. Hopper painted it just after Pearl Harbor.' },
  ],

  // Michelangelo — The Creation of Adam
  Q500242: [
    { x: 15, y: 52, label: 'Adam', text: 'Languid, already perfect, reaching without effort. His finger does not quite touch God\'s.' },
    { x: 66, y: 35, label: 'God', text: 'Borne up by figures inside a swirling red cloak — a shape many read as a cross-section of the human brain.' },
    { x: 39, y: 41, label: 'The gap', text: 'The most famous empty space in art. The spark has not yet jumped.' },
    { x: 67, y: 28, label: 'The woman', text: 'Tucked under God\'s arm, watching Adam. Usually identified as Eve, waiting to be made.' },
  ],

  // Rembrandt — The Night Watch
  Q219831: [
    { x: 48, y: 50, label: 'The captain', text: 'Frans Banninck Cocq in black with a red sash, stepping forward and giving the order to march.' },
    { x: 62, y: 51, label: 'The lieutenant', text: 'In brilliant yellow, catching the light. His shadow falls across the captain\'s coat.' },
    { x: 33, y: 60, label: 'The girl in gold', text: 'A small glowing figure with a dead chicken at her belt — the militia\'s emblem, claws and all.' },
    { x: 93, y: 62, label: 'The drummer', text: 'Rembrandt turned a static group portrait into a moment of noise and movement, which is why it startled.' },
  ],

  // Raphael — The School of Athens
  Q186953: [
    { x: 50, y: 48, label: 'Plato and Aristotle', text: 'At the centre: Plato points up to the world of ideas, Aristotle levels his hand at the world in front of him.' },
    { x: 60, y: 66, label: 'Diogenes', text: 'Sprawled alone on the steps, ignoring everyone — exactly as the stories describe him.' },
    { x: 24, y: 65, label: 'Pythagoras', text: 'Writing in a book at the lower left while others crane over his shoulder to copy.' },
    { x: 74, y: 69, label: 'Euclid', text: 'Bending with a compass to demonstrate a proof. His face is a portrait of the architect Bramante.' },
    { x: 89, y: 60, label: 'Raphael himself', text: 'At the far right, in a dark cap, looking straight out at you.' },
  ],

  // Goya — The Third of May 1808
  Q1091086: [
    { x: 34, y: 50, label: 'The man in white', text: 'Arms flung wide, hands showing wounds like Christ\'s. The one blaze of light in the picture.' },
    { x: 78, y: 58, label: 'The firing squad', text: 'Faceless, identical, seen from behind — a machine rather than men.' },
    { x: 24, y: 82, label: 'The dead', text: 'Bodies already fallen in the foreground, blood on the ground, painted without any heroism.' },
    { x: 61, y: 70, label: 'The lantern', text: 'A boxy lamp on the ground is the only light source, throwing the victim into glare.' },
  ],

  // Géricault — The Raft of the Medusa
  Q212616: [
    { x: 69, y: 18, label: 'The signal', text: 'A man waving a cloth at a speck on the horizon. The ship did not see them on this pass.' },
    { x: 11, y: 70, label: 'The father', text: 'An old man holds his dead son, not looking at the rescue at all.' },
    { x: 50, y: 53, label: 'The pyramid', text: 'Bodies pile from despair at the left to hope at the right — the composition does the storytelling.' },
    { x: 26, y: 33, label: 'The sail', text: 'Straining the wrong way, dragging them away from the horizon they are signalling to.' },
  ],

  // Delacroix — Liberty Leading the People
  Q29530: [
    { x: 57, y: 30, label: 'Liberty', text: 'Not a portrait but an allegory: a barefoot woman in a Phrygian cap, carrying the tricolour over the barricade.' },
    { x: 74, y: 42, label: 'The boy', text: 'A child with two pistols, shouting. He is often said to have inspired Gavroche in Les Misérables.' },
    { x: 26, y: 38, label: 'The man in the top hat', text: 'A bourgeois with a musket beside a worker — Delacroix shows the classes fighting together.' },
    { x: 30, y: 82, label: 'The dead', text: 'Bodies at the foot of the barricade, one stripped of his trousers, painted without glamour.' },
  ],

  // Friedrich — Wanderer above the Sea of Fog
  Q311243: [
    { x: 51, y: 50, label: 'The wanderer', text: 'Seen from behind so you take his place and his view. Friedrich almost never shows a face.' },
    { x: 26, y: 64, label: 'The fog', text: 'The landscape is mostly hidden. What he is contemplating is deliberately withheld from you.' },
    { x: 77, y: 37, label: 'The far peaks', text: 'Real mountains of Saxon Switzerland, assembled from separate sketches into a place that does not exist.' },
  ],

  // Seurat — A Sunday on La Grande Jatte
  Q1044742: [
    { x: 83, y: 50, label: 'The couple', text: 'A top-hatted man and a woman with an improbable bustle, stiff as cut-outs.' },
    { x: 70, y: 85, label: 'The monkey', text: 'On a lead beside her. In French slang of the day, singesse also meant a prostitute — the joke is deliberate.' },
    { x: 30, y: 45, label: 'The dots', text: 'Millions of small touches of unmixed colour, meant to blend in your eye rather than on the palette.' },
    { x: 3, y: 75, label: 'The border', text: 'Seurat later painted a dotted border straight onto the canvas so it would not sit against a plain frame.' },
  ],

  // Klimt — The Kiss
  Q698487: [
    { x: 46, y: 44, label: 'The two robes', text: 'His is black-and-white rectangles, hers is soft coloured circles — the only way the two bodies are told apart.' },
    { x: 58, y: 15, label: 'Her face', text: 'The one place where the picture becomes fully naturalistic: real skin, closed eyes, flushed cheeks.' },
    { x: 51, y: 84, label: 'The edge', text: 'They kneel on a flowered ledge that simply stops. There is no ground beyond it.' },
  ],

  // Bosch — The Garden of Earthly Delights
  Q321303: [
    { x: 13, y: 51, label: 'Left panel: Eden', text: 'God presents Eve to Adam in a calm green paradise — already with odd creatures at the edges.' },
    { x: 50, y: 51, label: 'Centre: the garden', text: 'Hundreds of nude figures with giant fruit, birds and glass spheres. Whether it is innocent or a warning is still argued.' },
    { x: 85, y: 56, label: 'Right panel: hell', text: 'A burning night city where instruments become instruments of torture.' },
    { x: 85, y: 34, label: 'The tree-man', text: 'A hollow figure with a face turned to look out at you, legs like rotted tree trunks in boats.' },
  ],

  // Leonardo — Mona Lisa
  Q12418: [
    { x: 47, y: 32, label: 'The smile', text: 'It works because the mouth is blurred at the corners: catch it in peripheral vision and it deepens, look straight at it and it fades.' },
    { x: 47, y: 22, label: 'No eyebrows', text: 'She has none. Whether they were never painted or lost to cleaning is still debated.' },
    { x: 12, y: 34, label: 'The landscape', text: 'The horizon sits noticeably higher on the right than the left, which subtly unsettles the whole picture.' },
    { x: 43, y: 81, label: 'The hands', text: 'Folded calmly one over the other — the pose that fixed how portraits were composed for a century.' },
  ],

  // Leonardo — The Last Supper
  Q128910: [
    { x: 50, y: 47, label: 'Christ', text: 'At the exact centre, alone in a calm triangle, with the vanishing point of the whole room behind his head.' },
    { x: 36, y: 51, label: 'Judas', text: 'Recoiling in shadow, clutching a purse and knocking over the salt — the only figure leaning away.' },
    { x: 66, y: 50, label: 'The reaction', text: 'Leonardo paints the instant after "one of you will betray me", so the table erupts in groups of three.' },
    { x: 41, y: 40, label: 'The windows', text: 'Real light falls from the refectory\'s own windows on the left, and Leonardo lit the painting to match.' },
  ],

  // Picasso — Les Demoiselles d'Avignon
  Q910199: [
    { x: 79, y: 20, label: 'The masks', text: 'The two faces on the right are carved and scored like African masks — the moment European painting broke.' },
    { x: 39, y: 26, label: 'The stare', text: 'All five women look straight out at the viewer, confrontational rather than inviting.' },
    { x: 53, y: 89, label: 'The still life', text: 'A slice of melon and grapes at the bottom, tipped up so you see it from above while the figures face you.' },
  ],

  // Artemisia Gentileschi — Judith Slaying Holofernes
  Q2247406: [
    { x: 58, y: 16, label: 'The two women', text: 'The maidservant holds him down and takes the struggle seriously — in most earlier versions she waits outside.' },
    { x: 51, y: 44, label: 'The arms', text: 'Braced, sleeves pushed back, elbows locked. It is painted as physical work.' },
    { x: 36, y: 73, label: 'The blood', text: 'Arterial spray running down the white sheet, following real trajectories.' },
  ],

  // Monet — Impression, Sunrise
  Q328523: [
    { x: 60, y: 30, label: 'The sun', text: 'Orange on blue-grey. Measured for brightness it is almost identical to the sky — so it reads as light rather than colour.' },
    { x: 46, y: 69, label: 'The boats', text: 'Three quick dark strokes. A critic mocked the picture as a mere "impression", and named a movement.' },
    { x: 78, y: 40, label: 'The harbour', text: 'Cranes and masts of industrial Le Havre, barely indicated in the haze.' },
  ],

  // Whistler — Whistler's Mother
  Q687182: [
    { x: 72, y: 45, label: 'The sitter', text: 'His mother Anna, in strict profile. Whistler called it Arrangement in Grey and Black No. 1 — the person was almost incidental.' },
    { x: 12, y: 38, label: 'The curtain', text: 'A patterned hanging that flattens the wall into a rectangle, like a Japanese print.' },
    { x: 44, y: 13, label: 'The framed print', text: 'One of Whistler\'s own etchings on the wall — a signature hidden in plain sight.' },
  ],

  // Wyeth — Christina's World
  Q2465911: [
    { x: 33, y: 68, label: 'Christina', text: 'Christina Olson, who had a degenerative illness and moved by dragging herself. Wyeth saw her crossing the field from a window.' },
    { x: 73, y: 11, label: 'The house', text: 'The Olson farmhouse in Maine, high on the horizon and a long way off.' },
    { x: 56, y: 46, label: 'The field', text: 'Dry grass painted blade by blade in egg tempera, filling most of the picture with distance.' },
  ],

  // Frida Kahlo — The Two Fridas
  Q3232010: [
    { x: 30, y: 42, label: 'European Frida', text: 'In a white Victorian dress, her heart cut open. Painted just after her divorce from Diego Rivera.' },
    { x: 72, y: 42, label: 'Mexican Frida', text: 'In Tehuana costume with a whole heart, holding a small portrait of Diego as a child.' },
    { x: 51, y: 30, label: 'The artery', text: 'A vessel runs between them; on the left it is cut, and she clamps it with surgical forceps.' },
    { x: 50, y: 8, label: 'The sky', text: 'Turbulent storm clouds behind both figures, standing in for the mood rather than the weather.' },
  ],
};

export const hotspotsFor = (item?: string): Hotspot[] =>
  (item && ANNOTATIONS[item]) || [];
