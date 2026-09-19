import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@assets/components/ui/tooltip";
import { TooltipPortal } from "@radix-ui/react-tooltip";
import type React from "react";
import type { Bean, BeanAppearance } from "./BeanData";

export interface BeanStatsCardProps {
  bean: Bean;
}

const BeanStatsCard = ({ bean }: BeanStatsCardProps) => {
  const aka = bean.commonNames.slice(1);
  return (
    <TooltipProvider>
      <article className="bean">
        <header className="bean-head">
          <div className="bean-forms">
            {bean.appearances.map((appearance, idx) => (
              <figure key={idx}>
                <Schematic appearance={appearance} />
                <figcaption>{appearance.name}</figcaption>
              </figure>
            ))}
          </div>
          <div className="bean-names">
            <h4>{bean.commonNames[0]}</h4>
            <p className="bean-latin">{bean.primaryScientificName}</p>
            {aka.length > 0 && (
              <p className="bean-aka">Also called {aka.join(", ")}</p>
            )}
            {bean.otherScientificNames.length > 0 && (
              <p className="bean-aka">
                Synonyms <i>{bean.otherScientificNames.join(", ")}</i>
              </p>
            )}
          </div>
        </header>
        <dl className="bean-facts">
          <Fact label="Common forms" items={bean.processingMethods} />
          <Fact
            label="Traditional recipes"
            items={bean.recipes.map((recipe) => (
              <>
                {recipe.name}{" "}
                <small>
                  ({recipe.origin}, {recipe.processingMethod})
                </small>
              </>
            ))}
          />
          <Fact label="Incorrect names" items={bean.commonIncorrectNames} />
        </dl>
      </article>
    </TooltipProvider>
  );
};

function Fact({ label, items }: { label: string; items: React.ReactNode[] }) {
  if (!items.length) return null;
  return (
    <>
      <dt>{label}</dt>
      <dd>
        {items.map((item, idx) => (
          <div key={idx}>{item}</div>
        ))}
      </dd>
    </>
  );
}

function Schematic({ appearance }: { appearance: BeanAppearance }) {
  return (
    <div className="relative aspect-square w-24">
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`absolute inset-0 m-auto flex h-3/4 w-3/4 items-center justify-center rounded-full z-10 hover:ring-2 hover:ring-black hover:drop-shadow-md ${
              appearance.cotyledonColour === false ? "bg-white" : ""
            }`}
            style={{ backgroundColor: appearance.cotyledonColour || undefined }}
          >
            {appearance.cotyledonColour === false && (
              <span className="text-2xl font-bold text-gray-500">?</span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipPortal>
          <TooltipContent side="bottom" className="tip">
            Cotyledon
          </TooltipContent>
        </TooltipPortal>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="absolute inset-0 m-[4px] rounded-full border-8 hover:ring-2 hover:ring-black hover:drop-shadow-md"
            style={{
              borderColor: appearance.seedCoatColour || undefined,
              borderStyle: !appearance.seedCoatColour ? "dashed" : "solid",
            }}
          ></div>
        </TooltipTrigger>
        <TooltipPortal>
          <TooltipContent side="bottom" className="tip">
            Seed coat
          </TooltipContent>
        </TooltipPortal>
      </Tooltip>
    </div>
  );
}

export default BeanStatsCard;
