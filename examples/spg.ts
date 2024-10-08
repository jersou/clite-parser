#!/usr/bin/env -S deno run -A
import { cliteRun } from "../clite_parser.ts";

class SpgCli {
  addDelay = false;
  autoNextStoryTransition = false;
  selectNextStoryAtEnd = false;
  lang?: string;
  nightMode = false;
  outputFolder?: string;
  seekStory?: string;
  skipAudioConvert = false;
  skipImageConvert = false;
  skipAudioItemGen = false;
  skipExtractImageFromMp3 = false;
  skipImageItemGen = false;
  imageItemGenFont = "Arial";
  thumbnailFromFirstItem = false;
  skipNotRss = false;
  rssSplitLength = 10;
  rssSplitSeasons = false;
  rssMinDuration = 0;
  rssUseSubtitleAsTitle = false;
  rssUseImageAsThumbnail = false;
  useThumbnailAsRootImage = false;
  skipRssImageDl = false;
  skipWsl = false;
  skipZipGeneration = false;
  useOpenAiTts = false;
  openAiApiKey?: string;
  openAiModel = "tts-1";
  openAiVoice = "onyx";
  useCoquiTts = false;
  coquiTtsModel = "tts_models/multilingual/multi-dataset/xtts_v2";
  coquiTtsLanguageIdx = "fr";
  coquiTtsSpeakerIdx = "Abrahan Mack";
  extract = false;
  gui = false;
  port = 5555;

  main(storyPath: string) {
  }
}

cliteRun(new SpgCli(), { args: ["--help"] });
