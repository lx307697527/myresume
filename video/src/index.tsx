import React from "react";
import { Composition, Still, registerRoot } from "remotion";
import { Card, Film } from "./Film";
import { TOTAL } from "./data";
import { FPS } from "./theme";

const Root: React.FC = () => (
  <>
    <Composition id="AllyOSFilm" component={Film} durationInFrames={TOTAL} fps={FPS} width={1920} height={1080} />
    <Still id="OgCard" component={Card} width={1200} height={630} />
  </>
);

registerRoot(Root);
