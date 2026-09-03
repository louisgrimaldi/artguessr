/**
 * "How to recognise them" — what to look for to name an artist from a picture
 * you have not seen before.
 *
 * Hand-written, because no data source carries this. It is the one thing the
 * pipeline can't fetch, and the thing that actually teaches the eye.
 *
 * Three rules keep these useful.
 *
 * Plain words. Written for someone with no art training — a teenager mildly
 * interested in art should get every one at a glance. No "frothy foliage lit
 * through gauze"; say fluffy blurry leaves. No sfumato, impasto, odalisque,
 * chiaroscuro, grisaille. Colours are named as colours: pink, dark brown, gold.
 *
 * Order by what you notice first: the subject and scene, then the memorable
 * things that keep recurring, then how the paint is handled. Where the style is
 * the striking thing rather than the subject — Picasso, Kandinsky, Mondrian,
 * Pollock — that leads instead.
 *
 * Only cite what survives on a screen. A work's real-world size and how it was
 * made are invisible in a photograph, so "small, hand-coloured prints" told you
 * nothing usable about a Blake. Relative scale *inside* the picture is fine,
 * since you can see it: a huge wave against tiny boats.
 */
export const RECOGNISE: Record<string, string> = {
  'leonardo-da-vinci':
    'Calm faces with a slight smile, usually a woman\'s. Misty blue mountains behind. Nothing has a sharp outline — edges blur softly into each other.',
  michelangelo:
    'Muscular naked bodies twisting as if under strain, the women built as powerfully as the men. Small heads on very large bodies.',
  raphael:
    'Calm, tidy scenes: mothers with babies, or crowds neatly arranged. Soft round faces, red and blue clothes, everything balanced and peaceful.',
  titian:
    'Nudes lying down, gods, and rich people in fancy clothes, against dark backgrounds. Warm gold and deep red, with skin that seems to glow.',
  botticelli:
    'Thin pale figures that look like they\'re floating rather than standing. Long wavy hair and clothes blowing in the wind, flowers scattered underfoot.',
  durer:
    'Very detailed drawings and prints — praying hands, a rabbit, himself staring at you. Every hair drawn separately. Signed with a big A and a small D underneath.',
  bosch:
    'Huge crowded scenes of heaven and hell packed with tiny people. Weird monsters, giant fruit, birds with human bodies, skies on fire.',
  'bruegel-elder':
    'Crowds of villagers working, skating or fighting, seen from above. Lots of little things happening at once, in muted greens and browns, often with snow.',
  'van-eyck':
    'People posing in small, richly decorated rooms. Look for round mirrors, fur and heavy folds of cloth. So detailed it almost looks like a photo.',
  'el-greco':
    'Saints stretched tall and thin like flames, reaching upwards. Stormy grey skies and strange sharp greens, blues and pinks.',
  caravaggio:
    'Bible stories that look like they\'re happening in a rough back street. Dirty bare feet, ordinary faces. One hard light from the side, everything else nearly black.',
  'artemisia-gentileschi':
    'Women from the Bible doing something violent and physical — gripping a sword, holding a man down. Strong light, dark background, gold and blue cloth.',
  rubens:
    'Busy crowded scenes full of movement — hunts, battles, gods. Lots of pale pink flesh, big muscular horses, red cloth flying everywhere.',
  rembrandt:
    'Older faces, often his own, looking tired and honest. Warm golden light on the face, everything else fading into brown darkness. Thick rough paint.',
  vermeer:
    'One woman alone in a quiet room doing something small, lit by a window on the left. Bright blue and yellow, and tiny dots of light.',
  velazquez:
    'The Spanish royal court — princesses in stiff dresses, servants, kings. Grey-silver tones. Close up the paint looks loose and messy; from a distance it resolves into sharp detail.',
  'frans-hals':
    'People laughing or turning, as if caught mid-moment. Black clothes and white collars. The brushstrokes are left obvious and rapid, like a sketch.',
  bernini:
    'Marble statues caught at the most dramatic second — falling, fainting, transforming. Twisting bodies, open mouths, and stone that looks like soft cloth.',
  fragonard:
    'Rich people flirting in a garden — a girl on a swing, a secret kiss, big puffy dresses. Soft pink and pale green, with fluffy blurry leaves.',
  watteau:
    'Small, well-dressed couples wandering in a park, often with a guitar or a clown costume. Hazy background, silky clothes, a slightly sad mood.',
  gainsborough:
    'Full-length portraits of English people standing outdoors in real countryside. Cool silvery colours, and thin quick strokes that make leaves and dresses look wispy.',
  'vigee-le-brun':
    'Women and children in simple straw hats and white dresses, smiling right at you. Fresh, natural and relaxed, with clear pink skin.',
  'jacques-louis-david':
    'Ancient Roman scenes and Napoleon, arranged like a theatre stage. Stiff pointing arms, hard outlines, cold clear light, plain backgrounds.',
  ingres:
    'Very smooth portraits and nudes lying down. You can\'t see any brushstrokes at all. Necks and backs stretched slightly too long. Lots of satin and jewellery.',
  canova:
    'White marble statues of gods and lovers in gentle poses, often kissing or lying back. Highly polished, so the stone looks soft.',
  goya:
    'Two sides to his work: bright royal portraits, and dark nightmares of war and witches. In the dark ones, screaming mouths and staring eyes in black and brown.',
  delacroix:
    'Violent, exotic scenes — lion hunts, battles, revolution — arranged on strong diagonals. Bright red next to green, with rough visible brushstrokes.',
  gericault:
    'Real disasters given the scale and seriousness normally reserved for great historical events. Piles of struggling bodies, greenish dead-looking skin, stormy dark colours, and horses everywhere.',
  turner:
    'Ships, sunsets and steam trains disappearing into fog and light. Everything blurry — you can barely tell where objects end. A bright yellow-white glow in the middle.',
  'caspar-david-friedrich':
    'One person standing with their back to you, looking out over a huge landscape. Fog, bare trees, ruins, a wide empty sky. Very quiet.',
  constable:
    'English countryside under big fluffy clouds — mills, boats, wet fields. Fresh green, with little white dots of paint for sparkle.',
  'william-blake':
    'Muscular naked figures from the Bible, crouching or floating, with wild hair and beards. Strong dark outlines, flat bright colour, light shooting outwards.',
  hokusai:
    'Mount Fuji and huge waves, with tiny boats or people for contrast. Flat bright colour, lots of deep blue, strong black outlines.',
  hiroshige:
    'Travellers walking in rain or snow. Rain drawn as straight diagonal lines. Flat bands of colour, and something big cut off at the edge of the picture.',
  courbet:
    'Ordinary working people — stone-breakers, a village funeral — treated with the seriousness normally given to history. Heavy brown and green, with thick paint spread like butter.',
  millet:
    'A single farm worker planting, gathering or praying in a flat empty field. Low horizon, dusty warm colours, and a serious quiet mood.',
  'rosa-bonheur':
    'Animals — cows, horses, lions — filling the picture, painted very accurately in plain daylight. Observed matter-of-factly, with no sentimentality.',
  rossetti:
    'One woman\'s head and shoulders filling the frame, surrounded by flowers. Strong jaw, long neck, thick red-brown hair, and a dreamy far-away stare.',
  millais:
    'Scenes from books and Shakespeare, like Ophelia drowning in a stream. Every leaf and flower in sharp detail, in very bright colours.',
  whistler:
    'Not much happens — a person, a river at night, a plain wall. Mostly greys and blacks, thin and misty. Signed with a little butterfly.',
  sargent:
    'Rich, elegant people standing full-length against dark backgrounds. Silk, pearls and skin done in a few confident strokes.',
  manet:
    'Modern Paris — a barmaid, a picnic, a nude — with the person staring straight back at you. Flat-looking shapes, sudden jumps from light to dark, lots of black.',
  monet:
    'The same thing painted over and over in different light: haystacks, a church front, water lilies. Small dabs of bright colour, blurry edges, purple-blue shadows.',
  renoir:
    'Happy crowds at parties, dances and lunches, with sunlight falling in patches. Warm pink and peach colours, soft fuzzy edges.',
  degas:
    'Ballet dancers and women washing, caught mid-movement as if they don\'t know you\'re there. Odd angles, people cut off by the edge, often in chalky pastel.',
  pissarro:
    'Country lanes, orchards and busy streets, often seen from an upstairs window. Ordinary subjects in soft greens and greys, built from lots of small strokes.',
  morisot:
    'Women and children at home or in the garden, relaxed and unposed. Quick loose brushwork with bare canvas showing through, in pale white, green and pink.',
  cassatt:
    'Mothers and children close together, painted plainly rather than sweetly. Solid drawing, bright colour, and flat patterns borrowed from Japanese prints.',
  cezanne:
    'Apples on a tilted table, men playing cards, and the same mountain again and again. Objects look slightly off, as if seen from two angles at once. Blocky square brushstrokes.',
  'van-gogh':
    'Sunflowers, wheat fields, night cafés and his own face. Thick swirling ropes of paint that stand off the surface, and strong yellow-and-blue clashes.',
  gauguin:
    'People in Tahiti sitting or lying down, with pink sand and red earth. Flat patches of unnatural colour with dark outlines, and no shadows.',
  seurat:
    'Stiff people standing very still by a river, almost frozen. The whole picture is made of thousands of tiny coloured dots.',
  'toulouse-lautrec':
    'Nightclub dancers and singers under stage lighting. Quick cartoon-like drawing, steeply tilted floors, thin greeny-yellow paint on bare board.',
  'henri-rousseau':
    'Jungles with a full moon and animals staring out. Completely still and silent. Leaves look like flat cut-out paper layered on top of each other.',
  klimt:
    'Couples kissing and rich women wrapped in gold pattern. Faces and hands look real, but the clothes turn into flat gold shapes, spirals and squares.',
  munch:
    'Fear and loneliness — someone screaming on a bridge, jealousy, illness. Wavy lines run through the sky, water and people. Sickly green and orange.',
  rodin:
    'Bronze figures twisting and straining, thinking hard or in pain. Sometimes just a body part on its own. The surface is rough and lumpy, never smooth.',
  brancusi:
    'A bird, a fish, a kiss — simplified down to one smooth shape. Shiny polished metal or stone, usually on a rough chunky wooden base.',
  'henry-moore':
    'Big rounded figures lying down with holes right through them, so you see the landscape behind. Shapes like bones or pebbles.',
  giacometti:
    'Very thin, tall, lumpy figures standing or walking, like they\'ve been worn away. Usually dark bronze on a heavy base.',
  matisse:
    'Rooms, windows and dancers, with patterns everywhere at once. Bright flat colour that isn\'t realistic, with a dark line around shapes. In his last years, shapes cut from coloured paper.',
  picasso:
    'Recognisable by style rather than subject. Faces showing the side and the front at once, with both eyes on the same side. Broken-up angular shapes.',
  braque:
    'Guitars, bottles and newspapers broken into flat overlapping shapes. Dull brown, grey and beige, with stencilled letters and stuck-on paper. Quieter than Picasso.',
  kandinsky:
    'No objects at all — just colour, lines and shapes floating. Circles, arcs and sharp black marks that feel musical. Later, neat hard-edged geometry.',
  mondrian:
    'Just black straight lines on white, with a few rectangles of red, blue and yellow. No curves, no diagonals, no shading.',
  malevich:
    'Plain flat shapes — squares, bars, crosses — floating on white nothing. Often tilted slightly. No depth and no shadow.',
  'hilma-af-klint':
    'Diagrams of invisible spiritual ideas. Spirals, circles inside circles, curling plant shapes and letters, in soft pale pink, blue and yellow.',
  'paul-klee':
    'Little childlike symbols — arrows, fish, faces, grids — arranged like a made-up alphabet. Thin wandering lines over soft watercolour.',
  kirchner:
    'Busy Berlin streets at night, everyone rushing and looking unfriendly. Sharp angular bodies with mask-like faces, in clashing pink, green and yellow.',
  schiele:
    'Skinny twisted bodies and self-portraits, often naked and awkward. Scratchy nervous outlines, bruised orange-green skin, lots of empty background.',
  kollwitz:
    'Mothers, mourners and poor people grieving or fighting back. Heavy simple figures with big hands and faces. Always black and white.',
  modigliani:
    'Portraits of people sitting still, and nudes lying down. Long oval faces, very long necks, sloping shoulders, and blank eyes with no pupils.',
  chagall:
    'People, goats and violinists floating in the sky above a village. Deep blue or red dreamlike background, with gravity ignored completely.',
  duchamp:
    'Often not a painting at all — a bottle rack, a urinal, a bike wheel, just presented as art. When painted, machine-like repeated shapes showing movement.',
  dali:
    'Impossible dream objects — melting clocks, stretched legs, limbs propped on sticks — in an empty desert. Painted incredibly realistically, with long shadows.',
  magritte:
    'Normal objects doing impossible things: men in bowler hats, floating rocks, an apple filling a whole room. Painted flat and plain, under a clear blue sky.',
  'max-ernst':
    'Strange stony forests, ruined worlds and bird creatures. Surfaces rubbed and scraped to look like rock, in dry red, green and grey.',
  miro:
    'Made-up floating blobs, stars and single eyes, playful and light. Thin black lines over a washed background, in red, blue, yellow and black.',
  'frida-kahlo':
    'Herself, again and again, staring straight out with joined eyebrows. Leaves, monkeys, and sometimes her own injuries on show. Flat, simple, folk-art style.',
  'diego-rivera':
    'Huge wall paintings of Mexican history packed with people. Rounded simplified workers and native figures, in earthy red, orange and green.',
  okeeffe:
    'One flower, bone or desert hill blown up so big it doesn\'t fit in the frame. Very smooth colour blends and clean curves, with no brushmarks.',
  hopper:
    'Lonely people in diners, motels and offices, never looking at each other. Hard sunlight, long shadows, and a lot of empty space.',
  'grant-wood':
    'American farms and serious-looking country people. Rounded toy-like hills, crisp outlines, and a neat old-fashioned finish.',
  'andrew-wyeth':
    'Bare countryside — an empty field, an old barn, one person by a window. Dry chalky surfaces in browns, greys and pale grass colours.',
  'jacob-lawrence':
    'Black American history told across numbered panels, like a comic strip. Flat angular shapes in just a few strong colours.',
  pollock:
    'No subject and nothing to focus on. Just tangled loops of dripped and flicked paint covering everything, running off all four edges.',
  rothko:
    'Two or three fuzzy rectangles of colour stacked up, seeming to float and glow. Soft blurry edges, nothing else.',
  'de-kooning':
    'A woman with bared teeth appearing out of a mess of paint. Violent scraped strokes in pink, yellow and white.',
  'lee-krasner':
    'Repeating marks that look like a made-up script, driving across the whole surface. Shapes often look cut up and stuck back together.',
  warhol:
    'Soup cans, Marilyn, Elvis, dollar bills — the same image repeated in a grid. Flat bright colour that sits slightly out of register with the outline.',
  lichtenstein:
    'Comic book pictures blown up huge — a crying blonde, a fighter plane, a speech bubble. Thick black outlines, primary colours, printed-looking dots.',
  hockney:
    'California swimming pools, sprinklers and double portraits in flat bright sunlight. Squiggly lines for water ripples, and very clean colour.',
  'francis-bacon':
    'A screaming pope or a smeared-looking friend, alone inside a thin see-through box. Twisted meat-like flesh on flat orange or black.',
  'lucian-freud':
    'Naked people in bare studios, seen from awkward angles and painted unflatteringly. Thick blotchy grey-pink skin.',
  'gerhard-richter':
    'Two completely different styles: a photo painted then smudged sideways until blurry, or wide bands of colour scraped across with a blade.',
  'louise-bourgeois':
    'Giant spiders, cages, and figures sewn out of cloth. Small closed-in rooms you look into, with things hanging inside.',
  'yayoi-kusama':
    'Polka dots and net patterns covering absolutely everything — pumpkins, rooms, furniture. Mirror rooms with lights repeating forever.',
  basquiat:
    'Rough scribbled figures with teeth and ribs showing, wearing crowns. Body diagrams, lists, and words written then crossed out.',
  'keith-haring':
    'Dancing people, barking dogs and glowing babies, always moving. Thick black outlines, flat colour, little lines to show movement.',
  'anselm-kiefer':
    'Ploughed fields and burnt-out rooms stretching far into the distance. Grey-brown surfaces with real straw, ash and lead stuck onto them.',
  'kehinde-wiley':
    'A young Black sitter posed like someone in an old royal portrait, against bright patterned wallpaper whose leaves curl forward over them.',
  'kerry-james-marshall':
    'Everyday Black life — barbershops, gardens, housing estates. The people are painted a deep solid black, against flat bright colours.',
  'marina-abramovic':
    'Not an object — a photo or video of the artist putting her own body through something for hours.',
  'ai-weiwei':
    'Thousands of the same handmade thing — seeds, stools, backpacks — or an antique deliberately smashed.',
  banksy:
    'A political joke sprayed on a wall through a black stencil. One small figure, one odd detail, often a single spot of red.',
  'cindy-sherman':
    'A photo of the artist dressed up as someone completely different, set up to look like a film still or an old painting.',
  'jeff-koons':
    'Balloon animals, toys and vacuum cleaners made huge and perfect. Mirror-shiny metal, or ordinary products displayed untouched in glass cases.',
  'anish-kapoor':
    'Holes that look bottomless, and curved mirrors that swallow the whole room. Either deep intense colour or polished shiny metal.',
  'yoko-ono':
    'Usually an instruction to be carried out, or a plain white object with a ladder, magnifying glass or chess set. Often there is very little to see.',
  'damien-hirst':
    'A shark or a cow floating in a tank of liquid, or a neat grid of coloured dots, butterflies or pills.',
  'takashi-murakami':
    'Smiling colourful flowers and cartoon eyes repeated everywhere. Glossy, flat and anime-like, in bright candy colours with no shadows.',
  'agnes-martin':
    'A pale, nearly white surface with a faint pencil grid or stripes ruled across it. So faint it almost disappears.',
  'cy-twombly':
    'Loose pencil scrawls, smudges and half-legible words on a creamy background, like writing left on a wall.',
  'robert-rauschenberg':
    'Real objects stuck onto the picture — a tyre, a quilt, a stuffed goat — or printed news photos with paint over them.',
  'joan-mitchell':
    'Leaves and water remembered rather than copied. Energetic slashing strokes and drips bunched in the middle, in strong green, blue and yellow.',
  'helen-frankenthaler':
    'Thin pools of colour soaked straight into bare canvas, spreading with soft blurry edges and leaving plain canvas showing.',
  'barbara-hepworth':
    'Upright carved shapes with a clean hole through the middle, sometimes with strings stretched across. Smooth pale wood or stone.',
  'sonia-delaunay':
    'Circles and arcs of contrasting colour spinning against each other. Used on fabric and clothes as much as on paintings.',
  'tamara-de-lempicka':
    'Glamorous 1920s people in cars and evening dress. Smooth tube-like arms and legs, shiny metallic skin, sharp skyscrapers behind.',
  'winslow-homer':
    'Sea and waves dwarfing the small boats and people caught in them. Cold green and grey, simple bold shapes, hard clear light.',
  'ilya-repin':
    'Crowded Russian scenes — men hauling a barge, a tsar holding his dying son — with every face clearly individual. Dark realistic colours.',
  canaletto:
    'Venice on a clear day: canals, domes, boat races. Very precise buildings, tiny neat people, and a wide flat stretch of water.',
  kuniyoshi:
    'Tattooed warriors fighting giant skeletons, whales and monsters. Packed with action, often spread across several sheets side by side.',
  poussin:
    'Greek myths and Bible stories with people lined up like a row on a stage, in a tidy landscape with ruins. Calm, ordered and evenly lit.',
  'van-dyck':
    'Aristocrats standing relaxed beside a pillar and curtain, looking effortlessly superior. Long limbs, small heads, delicate hands, shiny satin.',
  'jan-steen':
    'A household in complete disorder — drunk adults, flirting, unruly children, a knocked-over jug. A grinning man, often the painter himself, looks out at you.',
  leger:
    'Workers, cyclists and machines built out of tubes and cylinders. Thick black outlines and flat red, blue and yellow, like painted pipes.',
  boccioni:
    'A figure or machine striding forward, repeated and streaked to show speed. Lines shoot outwards; the sculpture looks like flame or muscle.',
  'man-ray':
    'Black and white photos of odd objects — a woman\'s back drawn as a violin, an iron covered in nails. Glowing outlines, or shadow-shapes made without a camera.',
  'odilon-redon':
    'Two sides: black charcoal drawings with a floating eyeball, cut-off head or grinning spider; or later, glowing dreamy pastel flowers.',
  'camille-claudel':
    'Two or three bronze figures clinging to or turning away from each other, caught in an emotional moment. Rough rippling surfaces.',
  derain:
    'Harbours, bridges and rivers in wild unrealistic colour — red trees, orange water. Separate dashes of paint with bare canvas showing between them.',
  'juan-gris':
    'Guitars, bottles and windows broken into clean, tidy angled shapes. Brighter and more organised than Braque or Picasso, often with stuck-on paper.',
  'jasper-johns':
    'Everyday symbols you already know — flags, targets, numbers, maps. The surface is thick, lumpy and drippy, so you notice the paint as much as the sign.',
  'el-anatsui':
    'A huge shimmering sheet made of thousands of flattened bottle tops sewn together, hung so it drapes like cloth.',
  'amy-sherald':
    'Black people standing calmly in smart modern clothes against one flat bright colour. Their skin is painted in shades of grey.',
  'jenny-saville':
    'Skin extremely close up, cut off by the edges of the picture and often seen from below. Thick churned grey-pink paint.',
  'olafur-eliasson':
    'Not an object but a whole room — a fake sun, coloured fog, water or ice filling the space.',
};
