# Android 49.5.1 evidence and local-replica scope

## Artifact identity and provenance

- Supplied target: `/Users/overbit/Downloads/com.playpokpok.pokpok_49.5.1-2000_4arch_1feat_2fe2c04fd6d9de52b1f03019acce6bb1_apkmirror.com.apkm`
- APKM SHA-256: `792c9aefa2aa0e43c6cbbf8dc19644c127ffbbabb42686c22b6c4156489fc7ca`.
- Parent REA `inspect_artifact` evidence: `ev_b66667b8143d3d10c2cec57377ecb3c1f7ac1080898f91d9e691234998fb8126` (13 nodes, no integrity contradictions, as recorded by parent).
- Parent REA `extract_artifact` evidence: `ev_a1fd4f73d2c129686001caf8adad6bc5a8ae2cba49345ed22caf78e969a92826`.
- Extracted root: `/var/folders/_7/p8_sqvcn60q68bdt99j5xz4c0000gn/T/rea-extracted-5338c97c-94b4-45bd-a5c3-6ada9084652a`.
- `base.apk` SHA-256: `2e3c749b64d77fbb3d25e114f54233e69139c1a53a95b24888869ab3d0f65d8c`; parent REA base inventory `ev_df12ab7859f422135011d6e816556cdddfa3390bf321e4503cfd90233049a0cb` (1450 occurrences/1349 nodes, no contradictions).
- Other inspected splits: `split_UnityDataAssetPack.apk` SHA-256 `7b4e2da6e23862dcf9f2aa40c0a834f7c32c6ed8673e2c2d63cad144de962e01`; `split_config.arm64_v8a.apk` was also inspected. No digest for the latter is asserted here.

## Framework and analysis limits

The APK contains Unity data and `global-metadata.dat`; the ARM64 split contains `libil2cpp.so` and `libunity.so`. This supports Unity with IL2CPP, not Mono. Addressables settings declare version 1.19.17, Android target and a local catalog. Unity engine version was not recovered. A local catalog is not proof of fully offline behavior.

Parent REA Android package inspection was blocked because `REA_JADX_MCP_JAR` was unavailable. Static IL2CPP strings were parsed from `base.apk` `assets/bin/Data/Managed/Metadata/global-metadata.dat` (14,732,228 bytes; magic `0xFAB11BAF`; metadata version field 39). The string heap header pair at `0x20` points to offset `0x9b58c`, size `2,326,506`; source-path data pair at `0x68` points to offset `0x7327b0`, size `963,624`. These strings expose identifiers/source paths, not method bodies or call flow. No Unity serialized scene graphs/components were decoded. No runtime behavior or recorded sounds were verified.

## Structured profile/personalization evidence

Base APK resources under `assets/composeResources/com.playpokpok.core.resources/files/` include `default-google-onboarding.json`, `unity-toys-personalization-config-toys.json`, and `unity-toys-personalization-config-weights.json`. The Google onboarding configuration declares portrait flow: conditional welcome/performance warning, child age, family support, child name, activities, learning, progress, registration, value props, paywall, hear-about-us and purchase-success steps. Personalization toy entries use `id`, `age_range`, `tags`, `base_score`; weights configure age and activity/family preference scoring. This is configured capability, not proof of runtime recommendations or exact algorithm.

The 23 configured toy IDs (exact IDs; title mapping is ambiguous in places):

`Shops`, `House`, `BusyBook`, `Town`, `DressUp`, `Islands`, `BusyBoard`, `Dino`, `Space`, `MarbleMachine`, `WorldPuzzle`, `NJ`, `ConnectTheDots`, `Customization`, `Radio`, `Blocks2`, `SillyBlocks`, `Sequencer`, `Forest`, `Drawing`, `Shapes`, `MusicalBlobs`, `Words`.

Likely-but-not-proven mappings against this repo: `Blocks2` is a candidate for `Geometry` (also overlaps block-building concepts); `Words` is ambiguous and a candidate for `Phonics`; `NJ` is likely Number Journey; `NumberFactory` is a separate scene/content group and a candidate for existing `Code Factory` only by broad theme, not identity. Do not represent these as authoritative one-to-one matches. Config IDs lack `Cooking`, `Phonics`, and `NumberFactory` despite scene/content/script evidence for those toy systems.

## Component / identifier clues (metadata strings; clusters are inferred, not call flow)

- **Cooking:** paths/types include `CK_BlenderBehaviour`, `CK_BoilingAnimatorController`, `CK_ChopLevelSocketFilter`, `CK_ColanderBehaviour`, `CK_Dishwasher`, `CK_DropZoneDetector`, `CK_IngredientStateManager`, `CK_Microwave`, `CK_Oven`; identifiers include `TimedCooking`, `CookIngredient`, `CookFood`, `CookedState`, `CookAllIngredientsPresent`, `NeededRepetitionsToCook`. Suggests ingredients, appliances, transfer/drop and cooked-state concepts. Exact recipes and sequence unknown.
- **Phonics (source namespace `Toys.Words` also appears):** `WD_ActorLocomotion`, `WD_Crane`, `WD_ElkoninBox`, `WD_Grapheme`, `WD_GraphemeMenu`, `WD_GraphemeSlot`, `WD_ChallengeQueueSO`, `WD_PronouncePhonemeOnTouch`; names include `GraphemePhonemePair`, `ApplyGraphemePhoneme`, `TargetPhoneme`, `SignifyPhoneme`, `PlayPhonemeSound`, `AllowRemovalOfCorrectPhonemes`. Suggests grapheme/phoneme, slot/challenge and touch pronunciation capabilities. Task sequence unknown.
- **NumberFactory:** `NF_ActionManager`, `NF_SubActionDepositItem`, `NF_SubActionPickUpFromSocket`, `NF_SubActionPickUpLooseItem`, `NF_SubActionMoveToZone`, `NF_SubActionJump`, `NF_FactoryFloorGeneration`, `NF_DisplayNumber`, `NF_FaucetFromStallManager`, `AgentLocomotion`, `FactoryPopulationCoroutine`, `FactoryRequirement`. Suggests agents/items, sockets/zones, factory and number-display concepts. No action order or math rules verified.
- **Customization:** `CZ_CustomCharacterController`, `CZ_CustomCharacterDataManager`, `CZ_CustomCharacterDistributor`, `CZ_CustomOptionController`, `CZ_OutfitGroupController`, `CZ_ColorizableRenderer`, `CZ_CharacterEditor`, `CZ_CharacterEditorSlider`, `CZ_EditorSocket`, `CZ_EquippableItem`, `CZ_ColorizationStation`; names include `AllCustomOptions`, `UnlockedCustomOptions`, `GetCategorizedCustomOptions`, `GetCustomCharactersInScene`. Suggests character/editor/options/color/equipment capabilities. Unlock/persistence rules unknown.
- **Blocks2:** `B2_BlockSpawner`, `B2_DragTranslate`, `B2_OnPointerEventCycleColor`, `B2_PositionValidator`, `B2_AnimatePresetArrangement`, `B2_BlackHoleDiscard`, `B2_BlackHoleHold`, `B2_ScreenCaptureBehaviour`. Suggests spawning, dragging, color change, placement and discard/hold concepts. Exact gesture rules and screen-capture user flow unknown.
- **MapMaze (scripts under Town):** `DragTranslateMapMazeVehicle`, `MapMazeGraph`, `MapMazeRoad`, `MapMazeVehicleRoadSelectorController`, `MapMazeTaskController`, `MapMazeMailController`, `MapMazeConstructionController`, `MapMazeFireController`, `MapMazeCarWashRoad`, `MapMazeParking`, `MapMazeStoplight`, `MapMazeSlidingDoor`, `MapMazeRecyclingCenterRoad`; other labels include `AirportConveyor`, `CableCar`, `FiretruckSprayWater`, `GarageLift`, `MMVehicleController`. Suggests vehicle dragging, road/path and themed town-interaction concepts; no exact route/task sequence verified.

## Feature correspondence matrix (inventory only; implementation depth not assessed)

All 25 local themes exist in `toys.js`. “Partial counterpart” means the repo has a locally-authored toy entry and/or interaction code, not that Android behavior is replicated. The web update adds optional local age/interest recommendations, Cooking appliance/preparation choices, Geometry piece manipulation, and Pawn Maker options in both layouts, plus input and visible-feedback fixes. These are independently designed web features guided by capability clues, not recovered Android rules. No full-parity claim is made.

| Local theme | Local evidence | Android evidence / correspondence |
|---|---|---|
| Drawing | local drawing toy in `toys.js` | `Drawing` configured ID; scene group `drawing_scenes_all.bundle` |
| Busy Board | local busy-board toy | `BusyBoard` configured ID; no detailed mechanics verified |
| Musical Blobs | local musical-blobs toy | `MusicalBlobs` configured ID and scene group |
| Busy Book | local busy-book toy | `BusyBook` configured ID; `dollhouse` scene group is not a proven mapping |
| Town | local town toy | `Town` configured ID; MapMaze script names under Town |
| House | local house toy | `House` configured ID; `dollhouse` scene group candidate only |
| Forest | local forest toy | `Forest` configured ID; mapping from other scene names not established |
| Islands | local islands toy | `Islands` configured ID and scene group |
| Shapes | local shapes toy | `Shapes` configured ID and scene group |
| Dress-Up | local dress-up toy | `DressUp` configured ID; customization overlap possible, exact mapping unknown |
| Silly Blocks | local silly-blocks toy | `SillyBlocks` configured ID and scene group |
| Marble Machine | local marble-machine toy | `MarbleMachine` configured ID and scene group |
| Sequencer | local sequencer toy | `Sequencer` configured ID and scene group |
| Radio | local radio toy | `Radio` configured ID and scene group |
| World Puzzle | local world-puzzle toy | `WorldPuzzle` configured ID and scene group |
| Dinosaurs | local dinosaurs toy | `Dino` configured ID; `dino_scenes_all.bundle` |
| Connect the Dots | local connect-the-dots toy | `ConnectTheDots` configured ID and scene group |
| Shops | local shops toy | `Shops` configured ID and scene group |
| Geometry | local geometry toy | `Blocks2` candidate (mapping ambiguous); `blocks2_scenes_all.bundle` |
| Space | local space toy | `Space` configured ID and scene group |
| Number Journey | local number-journey toy | `NJ` likely candidate; `NumberJourney` configured scene group, ID is not identical |
| Phonics | local phonics toy | `Words` ambiguous candidate; Phonics/WD metadata and `phonics_scenes_all.bundle` |
| Pawn Maker | local pawn-maker toy | `Customization` configured ID plus CZ character/editor metadata (candidate correspondence) |
| Cooking | local cooking toy | `cooking_scenes_all.bundle` and CK metadata; no configured ID among 23 |
| Code Factory | local code-factory toy | `NumberFactory` metadata/scene group; broad candidate only, not an exact match |

## Scope and reproducibility

This evidence does not recover every Android feature, exact UI, navigation, persistence, mechanics, asset state, or sound. There are no method bodies, decoded serialized scene graphs, recorded interactions, or verified runtime results. Full original parity is explicitly unresolved. Registration, account, analytics, and paywall flows are documented as source configuration but intentionally excluded from the local webapp; no subscription/access-control bypass is implemented.

No proprietary source code, art, or sound was copied into the app. Evidence inputs were locally supplied APK/APKM files. Reproducibility at a high level: verify the stated hashes; inspect APK/ZIP member names and sizes without running them; read bounded JSON configuration files; inspect the metadata magic/version and header offsets, then extract null-delimited strings only from validated bounded regions. The structured local output is `/private/var/folders/_7/p8_sqvcn60q68bdt99j5xz4c0000gn/T/opencode/pokpok-unity-metadata-clues.json`; extracted APKs remain under the approved temp root above. Parent-managed REA evidence export is at `/private/var/folders/_7/p8_sqvcn60q68bdt99j5xz4c0000gn/T/opencode/pokpok-49.5.1-rea-evidence.json` (7 records, 3,380,799 bytes; refreshed after base-APK inventory).
