export interface FontData {
  name: string;
  categories: string[];
}

export const FONT_CATALOG: FontData[] = [
  { name: "Inter", categories: ["modern", "clean", "professional"] },
  { name: "Roboto", categories: ["clean", "professional", "versatile"] },
  { name: "Open Sans", categories: ["friendly", "clean", "casual"] },
  { name: "Montserrat", categories: ["modern", "geometric", "bold"] },
  { name: "Playfair Display", categories: ["formal", "elegant", "serious"] },
  { name: "Merriweather", categories: ["formal", "editorial", "serious"] },
  { name: "Lora", categories: ["elegant", "editorial", "emotional"] },
  { name: "Nunito", categories: ["playful", "friendly", "rounded"] },
  { name: "Quicksand", categories: ["casual", "playful", "rounded"] },
  { name: "Amatic SC", categories: ["fun", "casual", "handwritten"] },
  { name: "Caveat", categories: ["casual", "playful", "handwritten"] },
  { name: "Pacifico", categories: ["fun", "casual", "script"] },
  { name: "Dancing Script", categories: ["formal", "elegant", "script"] },
  { name: "Bangers", categories: ["fun", "cartoon", "loud"] },
  { name: "Fredoka One", categories: ["fun", "cartoon", "bold"] },
  { name: "Creepster", categories: ["fun", "scary", "cartoon"] },
  { name: "Righteous", categories: ["modern", "bold", "geometric"] },
  { name: "Cinzel", categories: ["formal", "serious", "classic"] },
  { name: "Bebas Neue", categories: ["modern", "impactful", "bold"] },
  { name: "Oswald", categories: ["serious", "impactful", "bold"] },
  { name: "Raleway", categories: ["elegant", "modern", "clean"] },
  { name: "Comic Neue", categories: ["fun", "casual", "playful"] },
  { name: "Rubik", categories: ["modern", "clean", "friendly"] },
  { name: "Work Sans", categories: ["professional", "clean", "modern"] },
  { name: "Space Grotesk", categories: ["modern", "tech", "bold"] },
  { name: "Space Mono", categories: ["tech", "serious", "code"] },
  { name: "JetBrains Mono", categories: ["tech", "serious", "code"] },
  { name: "Crimson Text", categories: ["formal", "serious", "bookish"] },
  { name: "Abril Fatface", categories: ["elegant", "editorial", "bold"] },
  { name: "Lobster", categories: ["fun", "casual", "playful"] },
  { name: "Anton", categories: ["impactful", "bold", "loud"] },
  { name: "Josefin Sans", categories: ["elegant", "geometric", "clean"] },
  { name: "Concert One", categories: ["fun", "playful", "bold"] },
  { name: "Chewy", categories: ["fun", "cartoon", "playful"] },
  { name: "Luckiest Guy", categories: ["fun", "cartoon", "loud"] },
  { name: "Permanent Marker", categories: ["casual", "loud", "handwritten"] },
  { name: "Zilla Slab", categories: ["modern", "industrial", "friendly"] },
  { name: "Vollkorn", categories: ["formal", "serious", "bookish"] },
  { name: "Lilita One", categories: ["fun", "cartoon", "bold"] },
  { name: "Modak", categories: ["fun", "playful", "heavy"] },
  { name: "Bowlby One SC", categories: ["fun", "loud", "heavy"] },
  { name: "Sacramento", categories: ["elegant", "casual", "script"] },
  { name: "Great Vibes", categories: ["formal", "elegant", "script"] },
  { name: "Berkshire Swash", categories: ["elegant", "playful", "fancy"] },
  { name: "Fascinate Inline", categories: ["fun", "vintage", "bold"] },
  { name: "Press Start 2P", categories: ["fun", "tech", "retro"] },
  { name: "Bungee", categories: ["bold", "loud", "fun"] },
  { name: "Alfa Slab One", categories: ["heavy", "bold", "impactful"] },
  { name: "Prata", categories: ["elegant", "formal", "editorial"] },
  { name: "Cormorant", categories: ["elegant", "formal", "classic"] }
];

// Fallbacks for specific broad categories
export const CATEGORY_FALLBACKS: Record<string, string[]> = {
  fun: ["Amatic SC", "Bangers", "Fredoka One", "Comic Neue", "Chewy"],
  formal: ["Playfair Display", "Merriweather", "Cinzel", "Crimson Text"],
  playful: ["Quicksand", "Nunito", "Caveat", "Concert One"],
  serious: ["Roboto", "Oswald", "Space Mono", "Vollkorn"],
  modern: ["Inter", "Montserrat", "Space Grotesk", "Raleway"],
  elegant: ["Dancing Script", "Abril Fatface", "Cormorant", "Great Vibes"],
  casual: ["Open Sans", "Pacifico", "Permanent Marker"]
};
