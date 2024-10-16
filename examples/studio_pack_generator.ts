#!/usr/bin/env -S deno run -A
import {
  alias,
  cliteRun,
  defaultHelp,
  help,
  hidden,
  type,
  usage,
} from "../clite_parser.ts";
import denoJson from "../deno.json" with { type: "json" };

// CLI of https://github.com/jersou/studio-pack-generator

@help(
  "studio-pack-generator convert a folder or a RSS URL to Studio pack zip for Lunii device",
)
@usage(
  "studio-pack-generator [options] [--] <story path | RSS URL>   convert a folder or RSS url to Studio pack",
)
export class StudioPackGenerator {
  @alias("d")
  @help("add 1 second at the beginning and the end of audio files")
  addDelay = false;

  @alias("n")
  @help("go to next story of group at end of stories")
  autoNextStoryTransition = false;

  @alias("b")
  @help("select the next story in the menu at end")
  selectNextStoryAtEnd = false;

  @type("string")
  @alias("l")
  @help("the lang used to generate menu and items. Auto detected by default")
  lang: string = "";

  @alias("t")
  @help("enable night mode : add transitions to an uniq endpoint")
  nightMode = false;

  @type("string")
  @alias("o")
  @help("zip output folder")
  outputFolder?: string;

  @type("string")
  @alias("c")
  @help("cut the beginning of stories: 'HH:mm:ss' format or 'N' sec")
  seekStory?: string;

  @alias("v")
  @help("skip convert audio (and skip increase volume)")
  skipAudioConvert = false;

  @alias("j")
  @help("skip image convert")
  skipImageConvert = false;

  @alias("a")
  @help("skip audio item generation")
  skipAudioItemGen = false;

  @alias("m")
  @help("skip extract item image from story mp3")
  skipExtractImageFromMp3 = false;

  @alias("i")
  @help("skip image item generation")
  skipImageItemGen = false;

  @help("font used for image item generation")
  imageItemGenFont = "Arial";

  @help("gen thumbnail from first item instead of first chapter")
  thumbnailFromFirstItem = false;

  @help("skip all except download RSS files")
  @alias("s")
  skipNotRss = false;

  @help("RSS will be split in parts of N length")
  rssSplitLength = 10;

  @help("RSS create different packs per season")
  rssSplitSeasons = false;

  @help("add RSS episode number to stages")
  rssEpisodeNumbers = false;

  @help("RSS min episode duration")
  rssMinDuration = 0;

  @help("Use rss items subtitle as title")
  rssUseSubtitleAsTitle = false;

  @help("Use rss image (first item with image) as thumbnail")
  rssUseImageAsThumbnail = false;

  @help("Use thumbnail as 'root' image instead of generated one")
  useThumbnailAsRootImage = false;

  @help("skip RSS image download of items")
  @alias("r")
  skipRssImageDl = false;

  @help("disable WSL usage")
  @alias("w")
  skipWsl = false;

  @help("only process item generation, don't create zip")
  @alias("z")
  skipZipGeneration = false;

  @help("generate missing audio item with Open AI TTS")
  @alias("e")
  useOpenAiTts = false;

  @help("the OpenAI API key")
  @type("string")
  @alias("k")
  openAiApiKey?: string;

  @help("OpenAi model : tts-1, tts-1-hd")
  @alias("g")
  openAiModel: string = "tts-1";

  @help("OpenAi voice : alloy, echo, fable, onyx, nova, shimmer")
  @alias("p")
  openAiVoice: string = "onyx";

  @help("use coqui TTS")
  useCoquiTts = false;

  @help("coqui TTS model")
  coquiTtsModel = "tts_models/multilingual/multi-dataset/xtts_v2";

  @help("coqui TTS language_idx")
  coquiTtsLanguageIdx = "fr";

  @help("coqui TTS speaker_idx")
  coquiTtsSpeakerIdx = "Abrahan Mack";

  @help("extract a zip pack (reverse mode)")
  @alias("x")
  extract = false;

  @help("open GUI (on localhost:5555)")
  @alias("u")
  gui = false;

  @help("port of GUI server")
  port = 5555;

  @help("disable the TTS cache usage")
  skipReadTtsCache = false;

  @help("disable the TTS cache write")
  skipWriteTtsCache = false;

  @help("path to the TTS cache")
  @defaultHelp("<Studio-Pack-Generator dir>/.spg-TTS-cache")
  ttsCachePath = ".../Studio-Pack-Generator/.spg-TTS-cache";

  @type("string")
  @help("custom script to be used for custom image... handling")
  customScript?: string;

  @hidden()
  storyPath = "";

  @hidden()
  // deno-lint-ignore no-explicit-any
  customModule?: any; //CustomModule;

  @help("Metadata of the pack")
  @type("[object]")
  metadata?: {
    title?: string;
    description?: string;
    format?: string;
    version?: number;
    nightModeAvailable?: boolean;
    [k: string]: string | number | boolean | undefined | object;
  };
  @help("Custom i18n")
  @type("[object]")
  i18n?: Record<string, string>;

  // deno-lint-ignore no-explicit-any
  async main(storyPath: string): Promise<any> {
    if (!this.storyPath) { // don't set if set by config file or --storyPath
      this.storyPath = storyPath;
    }
    if (!this.storyPath) {
      throw new Error(
        "The story path is not defined ! separate option and story path by --",
        { cause: { clite: true } },
      );
    }

    if (this.customScript) {
      try {
        this.customModule = await import(this.customScript);
      } catch (error) {
        console.error(error);
      }
    }
    console.log(this);
    return this;
  }
}

if (import.meta.main) {
  console.log({ version: denoJson.version, ...Deno.version });
  cliteRun(StudioPackGenerator, {
    noCommand: true,
    configCli: "The json config file",
  });
}

/*
$ ./studio_pack_generator.ts --help
{
  version: "0.6.5",
  deno: "2.0.0",
  v8: "12.9.202.13-rusty",
  typescript: "5.6.2"
}
studio-pack-generator convert a folder or a RSS URL to Studio pack zip for Lunii device

Usage: studio-pack-generator [options] [--] <story path | RSS URL>   convert a folder or RSS url to Studio pack

Options:
 -h, --help                         Show this help                                                  [default: false]
     --config                       The json config file                                                    [string]
 -d, --add-delay                    add 1 second at the beginning and the end of audio files        [default: false]
 -n, --auto-next-story-transition   go to next story of group at end of stories                     [default: false]
 -b, --select-next-story-at-end     select the next story in the menu at end                        [default: false]
 -l, --lang                         the lang used to generate menu and items. Auto detected by default [default: ""]
 -t, --night-mode                   enable night mode : add transitions to an uniq endpoint         [default: false]
 -o, --output-folder                zip output folder                                                       [string]
 -c, --seek-story                   cut the beginning of stories: 'HH:mm:ss' format or 'N' sec              [string]
 -v, --skip-audio-convert           skip convert audio (and skip increase volume)                   [default: false]
 -j, --skip-image-convert           skip image convert                                              [default: false]
 -a, --skip-audio-item-gen          skip audio item generation                                      [default: false]
 -m, --skip-extract-image-from-mp-3 skip extract item image from story mp3                          [default: false]
 -i, --skip-image-item-gen          skip image item generation                                      [default: false]
     --image-item-gen-font          font used for image item generation                           [default: "Arial"]
     --thumbnail-from-first-item    gen thumbnail from first item instead of first chapter          [default: false]
 -s, --skip-not-rss                 skip all except download RSS files                              [default: false]
     --rss-split-length             RSS will be split in parts of N length                             [default: 10]
     --rss-split-seasons            RSS create different packs per season                           [default: false]
     --rss-episode-numbers          add RSS episode number to stages                                [default: false]
     --rss-min-duration             RSS min episode duration                                            [default: 0]
     --rss-use-subtitle-as-title    Use rss items subtitle as title                                 [default: false]
     --rss-use-image-as-thumbnail   Use rss image (first item with image) as thumbnail              [default: false]
     --use-thumbnail-as-root-image  Use thumbnail as 'root' image instead of generated one          [default: false]
 -r, --skip-rss-image-dl            skip RSS image download of items                                [default: false]
 -w, --skip-wsl                     disable WSL usage                                               [default: false]
 -z, --skip-zip-generation          only process item generation, don't create zip                  [default: false]
 -e, --use-open-ai-tts              generate missing audio item with Open AI TTS                    [default: false]
 -k, --open-ai-api-key              the OpenAI API key                                                      [string]
 -g, --open-ai-model                OpenAi model : tts-1, tts-1-hd                                [default: "tts-1"]
 -p, --open-ai-voice                OpenAi voice : alloy, echo, fable, onyx, nova, shimmer         [default: "onyx"]
     --use-coqui-tts                use coqui TTS                                                   [default: false]
     --coqui-tts-model              coqui TTS model       [default: "tts_models/multilingual/multi-dataset/xtts_v2"]
     --coqui-tts-language-idx       coqui TTS language_idx                                           [default: "fr"]
     --coqui-tts-speaker-idx        coqui TTS speaker_idx                                  [default: "Abrahan Mack"]
 -x, --extract                      extract a zip pack (reverse mode)                               [default: false]
 -u, --gui                          open GUI (on localhost:5555)                                    [default: false]
     --port                         port of GUI server                                               [default: 5555]
     --skip-read-tts-cache          disable the TTS cache usage                                     [default: false]
     --skip-write-tts-cache         disable the TTS cache write                                     [default: false]
     --tts-cache-path               path to the TTS cache    [default: "<Studio-Pack-Generator dir>/.spg-TTS-cache"]
     --custom-script                custom script to be used for custom image... handling                   [string]
     --metadata                     Metadata of the pack                                                  [[object]]
     --i-18-n                       Custom i18n                                                           [[object]]
*/
