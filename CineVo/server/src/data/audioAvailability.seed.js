import { AudioAvailability } from "../models/AudioAvailability.js";

const STARTER_AUDIO = [
 {
  tmdbId: 136283,
  mediaType: "tv",
  title: "The Glory",
  originalLanguage: "ko",
  audioLanguages: ["ko", "hi", "en"],
  providers: [
    {
      name: "Netflix",
      audioLanguages: ["hi", "ko", "en"],
    },
  ],
  verified: true,
  verifiedAt: new Date(),
},


  // Add more verified titles here
];

export async function seedAudioAvailability() {
  for (const item of STARTER_AUDIO) {
    await AudioAvailability.updateOne(
      {
        tmdbId: item.tmdbId,
        mediaType: item.mediaType,
      },
      {
        $set: item,
      },
      {
        upsert: true,
      },
    );
  }

  console.log("Audio availability seed completed");
}