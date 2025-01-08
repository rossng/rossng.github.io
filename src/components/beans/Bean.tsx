import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@assets/components/ui/tooltip";
import type { Bean, BeanAppearance } from "./BeanData";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@assets/components/ui/card";
import { cn } from "@assets/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@assets/components/ui/carousel";
import { TooltipPortal } from "@radix-ui/react-tooltip";

export interface BeanStatsCardProps {
  bean: Bean;
  className?: string;
}

const BeanStatsCard = ({ bean, className }: BeanStatsCardProps) => {
  return (
    <TooltipProvider>
      <Card className={cn("max-w-96", className)}>
        <CardHeader className="flex flex-col items-center">
          <Carousel className="w-3/4 mb-4">
            <CarouselContent>
              {bean.appearances.map((appearance, idx) => (
                <CarouselItem key={idx} className="md:basis-1/2 lg:basis-1/3">
                  <Schematic appearance={appearance} />
                  <div className="text-center text-gray-500 text-xs">
                    {appearance.name}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
          <CardTitle className="text-center">
            <div>{bean.commonNames[0]}</div>
            <div className="text-gray-600 font-normal mt-2 italic">
              {bean.primaryScientificName}
            </div>
          </CardTitle>
          <CardDescription className="w-full">
            <div className="flex flex-row w-full">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-center text-gray-500 w-1/2">
                    {bean.commonNames.slice(1).map((name) => (
                      <div>{name}</div>
                    ))}
                  </div>
                </TooltipTrigger>
                <TooltipContent>Common names</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-center text-gray-400 w-1/2">
                    {bean.otherScientificNames.map((name) => (
                      <div>{name}</div>
                    ))}
                  </div>
                </TooltipTrigger>
                <TooltipPortal>
                  <TooltipContent>Other scientific names</TooltipContent>
                </TooltipPortal>
              </Tooltip>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <table className="m-0">
            <tbody>
              <tr>
                <td className="font-bold w-min">Common forms</td>
                <td className="text-gray-500">
                  {bean.processingMethods.map((method) => (
                    <div>{method}</div>
                  ))}
                </td>
              </tr>
              <tr>
                <td className="font-bold w-min">Traditional recipes</td>
                <td className="text-gray-500">
                  {bean.recipes.map((recipe) => (
                    <div>
                      {recipe.name}{" "}
                      <span className="text-gray-400 text-xs">
                        ({recipe.origin}, {recipe.processingMethod})
                      </span>
                    </div>
                  ))}
                </td>
              </tr>
              <tr>
                <td className="font-bold w-min">Incorrect names</td>
                <td className="text-gray-500">
                  {bean.commonIncorrectNames.map((name) => (
                    <div>{name}</div>
                  ))}
                </td>
              </tr>
            </tbody>
          </table>
        </CardContent>
        <CardFooter></CardFooter>
      </Card>
    </TooltipProvider>
  );
};

function Schematic({ appearance }: { appearance: BeanAppearance }) {
  return (
    <div className="flex justify-center items-center">
      <div className="relative aspect-square w-24 max-w-full max-h-full">
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={`absolute inset-0 w-3/4 h-3/4 rounded-full flex items-center justify-center z-10 hover:ring-2 hover:ring-black hover:drop-shadow-md ${
                appearance.cotyledonColour === false ? "bg-white" : ""
              } m-auto`}
              style={{
                backgroundColor: appearance.cotyledonColour || undefined,
              }}
            >
              {appearance.cotyledonColour === false && (
                <span className="text-gray-500 text-2xl font-bold">?</span>
              )}
            </div>
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent side="bottom">Cotyledon</TooltipContent>
          </TooltipPortal>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className="absolute m-[4px] inset-0 bg-brown-600 rounded-full border-8 hover:ring-2 hover:ring-black hover:drop-shadow-md"
              style={{
                borderColor: appearance.seedCoatColour || undefined,
                borderStyle: !appearance.seedCoatColour ? "dashed" : "solid",
              }}
            ></div>
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent side="bottom">Seed coat</TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </div>
    </div>
  );
}

export default BeanStatsCard;
