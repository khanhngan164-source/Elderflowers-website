"use client";

import { useState } from "react";
import { BagDrawer, Toast } from "./BagDrawer";
import { BagProvider } from "./BagProvider";
import { FlowerBox, HarvestCalendar, Recipes, Shop, Visit } from "./Commerce";
import { Hero, Ingredients, Story } from "./Editorial";
import { AnnouncementBar, Footer, Header } from "./Header";
import { useToday } from "./ui";

export function HomePage() {
  const today = useToday();
  const month = today.getMonth();
  const [ingredient, setIngredient] = useState("elder");

  // Selecting an ingredient anywhere (story, calendar) focuses the ingredient panel.
  const pickIngredient = (id: string) => {
    setIngredient(id);
    document.getElementById("ingredients")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <BagProvider>
      <AnnouncementBar />
      <Header />
      <main>
        <Hero month={month} />
        <Story onPick={pickIngredient} />
        <Ingredients selected={ingredient} onPick={setIngredient} month={month} />
        <Shop />
        <HarvestCalendar month={month} onPick={pickIngredient} />
        <FlowerBox />
        <Recipes />
        <Visit today={today} />
      </main>
      <Footer />
      <Toast />
      <BagDrawer />
    </BagProvider>
  );
}
