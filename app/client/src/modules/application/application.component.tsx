import React, { useMemo } from "react";
import { AppComponent, CoreLoaderComponent } from "modules/application";
import { NesterComponent } from "shared/components";
import { InitialLoaderComponent } from "./components";
import { AssetsProvider, LanguageProvider, ProxyProvider } from "shared/hooks";
import { TasksProvider } from "shared/hooks/tasks";
import { MultiplayerGameComponent } from "../snake/index.ts";

export const ApplicationComponent = () => {
  const providers = useMemo(
    () => [
      AppComponent,
      //|\\|//|\\|//|\\|//|\\|//|\\|//|\\|//|\\|
      //|\\|//|\\|//|\\|//|\\|//|\\|//|\\|//|\\|
      TasksProvider,
      InitialLoaderComponent,
      ProxyProvider,
      LanguageProvider,
      AssetsProvider,
      CoreLoaderComponent,
      //|\\|//|\\|//|\\|//|\\|//|\\|//|\\|//|\\|
      //|\\|//|\\|//|\\|//|\\|//|\\|//|\\|//|\\|
      MultiplayerGameComponent,
    ],
    [],
  );

  return <NesterComponent components={providers} />;
};
